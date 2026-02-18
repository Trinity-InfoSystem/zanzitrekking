const Message = require("../../models/chat/chat");
const logger = require('./../../utilities/logger');
const Customer = require("../../models/customer");
const Admin = require("../../models/admin");
const createError = require("http-errors");
const { path } = require("express/lib/application");

function getFileType(mimetype) {
  if (mimetype.startsWith("image/")) return "image";
  if (mimetype.startsWith("audio/")) return "audio";
  if (mimetype.startsWith("video/")) return "video";
  return "document";
}

function buildConversationContext({
  sender,
  senderModel,
  receiver,
  receiverModel,
}) {
  if (
    (senderModel === "Customer" || receiverModel === "Customer") &&
    (sender || receiver)
  ) {
    const customerId =
      senderModel === "Customer"
        ? sender
        : receiverModel === "Customer"
        ? receiver
        : null;

    if (customerId) {
      const participantIds = new Set();
      const participantModels = [];

      if (sender) {
        participantIds.add(sender.toString());
        participantModels.push(senderModel);
      }

      if (receiver) {
        participantIds.add(receiver.toString());
        participantModels.push(receiverModel);
      }

      return {
        conversationId: `customer-${customerId}`,
        participants: Array.from(participantIds),
        participantModels,
      };
    }
  }

  if (senderModel === "Admin" && receiverModel === "Admin") {
    const ids = [sender?.toString(), receiver?.toString()]
      .filter(Boolean)
      .sort();
    return {
      conversationId: `admin-${ids.join("-")}`,
      participants: ids,
      participantModels: ["Admin", "Admin"],
    };
  }

  return {};
}

class messageController {
  // Get messages between admin and customer

  get_messages = async (req, res, next) => {
    try {
      const { customerId } = req.params;

      const conversationId = `customer-${customerId}`;

      const messages = await Message.find({
        $or: [
          { conversationId },
          {
            conversationId: { $exists: false },
            $or: [{ sender: customerId }, { receiver: customerId }],
          },
        ],
      })
        .sort({ createdAt: 1 })
        .populate("sender", "name image")
        .populate("receiver", "name image");

      res.status(200).json({
        success: true,
        messages,
        conversationId,
        message: "Messages fetched successfully",
      });
    } catch (error) {
      next(createError(500, "Internal server error"));
    }
  };

  // Send a new message
  send_message = async (req, res, next) => {
    try {
      // Derive sender from authenticated JWT token (set by middleware)
      // req.id is set by customerJwtMiddleware or jwtMiddleware
      const sender = req.id;
      if (!sender) {
        return res.status(401).json({ error: "Unauthorized - sender not found" });
      }

      // Determine senderModel based on which middleware was used
      // If req.role exists, it's an admin; otherwise it's a customer
      const senderModel = req.role ? "Admin" : "Customer";
      
      const { receiver, receiverModel, content } = req.body;

      logger.info({ sender, senderModel, receiver, receiverModel, content });

      const conversationContext = buildConversationContext({
        sender,
        senderModel,
        receiver,
        receiverModel,
      });

      const resolvedConversationId =
        req.body.conversationId || conversationContext.conversationId;

      const participants = conversationContext.participants?.length
        ? conversationContext.participants
        : [sender, receiver].filter(Boolean);

      const participantModels = conversationContext.participantModels?.length
        ? conversationContext.participantModels
        : [senderModel, receiverModel].filter(Boolean);

      const newMessage = await Message.create({
        sender,
        senderModel,
        receiver,
        receiverModel,
        content,
        conversationId: resolvedConversationId,
        participants,
        participantModels,
      });

      const populatedMessage = await Message.findById(newMessage._id)
        .populate("sender", "name image")
        .populate("receiver", "name image");

      res.status(201).json({
        success: true,
        message: populatedMessage,
      });
    } catch (error) {
      next(createError(500, "Internal server error"));
    }
  };

  // Mark messages as read
  mark_messages_read = async (req, res, next) => {
    try {
      const { senderId, receiverId } = req.params;

      const conversationId = `customer-${senderId}`;

      const result = await Message.updateMany(
        {
          $or: [
            {
              conversationId,
              sender: senderId,
            },
            {
              sender: senderId,
              receiver: receiverId,
            },
          ],
          read: false,
        },
        {
          $set: {
            read: true,
            readAt: new Date(),
          },
        }
      );

      res.status(200).json({
        success: true,
        message: "Messages marked as read",
        modifiedCount: result.modifiedCount,
      });
    } catch (error) {
      next(createError(500, "Internal server error"));
    }
  };

  // Mark single message as read
  mark_message_read = async (req, res, next) => {
    try {
      const { messageId } = req.params;

      const message = await Message.findByIdAndUpdate(
        messageId,
        {
          $set: {
            read: true,
            readAt: new Date(),
          },
        },
        { new: true }
      )
        .populate("sender", "name image")
        .populate("receiver", "name image");

      if (!message) {
        throw createError(404, "Message not found");
      }

      res.status(200).json({
        success: true,
        message: "Message marked as read",
        data: message,
      });
    } catch (error) {
      next(error);
    }
  };

  // Get unread message count for a user
  get_unread_count = async (req, res, next) => {
    try {
      const { userId, userModel } = req.params;

      const unreadCount = await Message.countDocuments({
        receiver: userId,
        receiverModel: userModel,
        read: false,
      });

      res.status(200).json({
        success: true,
        unreadCount,
        message: "Unread count fetched successfully",
      });
    } catch (error) {
      next(createError(500, "Internal server error"));
    }
  };

  // Dashboard stats for admin
  get_dashboard_stats = async (req, res, next) => {
    try {
      const totalCustomers = await Customer.countDocuments();
      const totalMessages = await Message.countDocuments();
      const unreadMessages = await Message.countDocuments({
        receiverModel: "Admin",
        read: false,
      });
      const activeCustomers = await Message.distinct("sender", {
        senderModel: "Customer",
        createdAt: {
          $gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
        },
      });

      const stats = {
        totalCustomers,
        activeChats: activeCustomers.length,
        totalMessages,
        unreadMessages,
      };

      res.status(200).json({
        success: true,
        stats,
        message: "Dashboard stats fetched successfully",
      });
    } catch (error) {
      next(createError(500, "Internal server error"));
    }
  };

  // Get recent messages for admin dashboard
  get_recent_messages = async (req, res, next) => {
    try {
      const messages = await Message.find()
        .sort({ createdAt: -1 })
        .limit(10)
        .populate("sender", "name image")
        .populate("receiver", "name image");

      res.status(200).json({
        success: true,
        messages,
        message: "Recent messages fetched successfully",
      });
    } catch (error) {
      next(createError(500, "Internal server error"));
    }
  };

  // Get active customers
  get_active_customers = async (req, res, next) => {
    try {
      const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

      const activeCustomerIds = await Message.distinct("sender", {
        senderModel: "Customer",
      });

      const customers = await Customer.find({
        _id: { $in: activeCustomerIds },
      })
        .select("name email image assignedAdmin")
        .lean();

      const customersWithUnread = await Promise.all(
        customers.map(async (customer) => {
          const [latestMessage] = await Message.find({
            sender: customer._id,
            receiverModel: "Admin",
          })
            .sort({ createdAt: -1 })
            .limit(1)
            .select(["createdAt", "content", "read", "readAt"])
            .lean();

          const unreadCount = await Message.countDocuments({
            sender: customer._id,
            receiverModel: "Admin",
            read: false,
          });

          // Check if customer is online (active in last 5 minutes)
          const lastActivity = await Message.findOne({
            sender: customer._id,
            senderModel: "Customer",
          })
            .sort({ createdAt: -1 })
            .select("createdAt")
            .lean();

          const isOnline =
            lastActivity &&
            new Date() - new Date(lastActivity.createdAt) < 5 * 60 * 1000;

          return {
            ...customer,
            unreadCount,
            lastMessageAt: latestMessage?.createdAt || null,
            lastMessage: latestMessage?.content || "",
            online: isOnline,
            lastMessageRead: latestMessage?.read || false,
            lastMessageReadAt: latestMessage?.readAt || null,
          };
        })
      );

      // Sort by online status and last activity
      customersWithUnread.sort((a, b) => {
        if (a.online !== b.online) return b.online - a.online;
        if (a.unreadCount !== b.unreadCount)
          return b.unreadCount - a.unreadCount;
        return new Date(b.lastMessageAt || 0) - new Date(a.lastMessageAt || 0);
      });

      res.status(200).json({
        success: true,
        customers: customersWithUnread,
        message: "Active customers fetched successfully",
      });
    } catch (error) {
      next(createError(500, "Internal server error"));
    }
  };

  get_active_customers_with_new_customer = async (req, res, next) => {
    try {
      const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

      const { customerId } = req.params;

      let activeCustomerIds = await Message.distinct("sender", {
        senderModel: "Customer",
      });

      // If a specific customerId was requested, include it even if not recently active
      if (customerId && !activeCustomerIds.includes(customerId)) {
        activeCustomerIds.push(customerId);
      }

      const customers = await Customer.find({
        _id: { $in: activeCustomerIds },
      })
        .select("name email image assignedAdmin")
        .lean();

      const customersWithUnread = await Promise.all(
        customers.map(async (customer) => {
          const [latestMessage] = await Message.find({
            sender: customer._id,
            receiverModel: "Admin",
          })
            .sort({ createdAt: -1 })
            .limit(1)
            .select(["createdAt", "content", "read", "readAt"])
            .lean();

          const unreadCount = await Message.countDocuments({
            sender: customer._id,
            receiverModel: "Admin",
            read: false,
          });

          // Check if customer is online (active in last 5 minutes)
          const lastActivity = await Message.findOne({
            sender: customer._id,
            senderModel: "Customer",
          })
            .sort({ createdAt: -1 })
            .select("createdAt")
            .lean();

          const isOnline =
            lastActivity &&
            new Date() - new Date(lastActivity.createdAt) < 5 * 60 * 1000;

          return {
            ...customer,
            unreadCount,
            lastMessageAt: latestMessage?.createdAt || null,
            lastMessage: latestMessage?.content || "",
            online: isOnline,
            lastMessageRead: latestMessage?.read || false,
            lastMessageReadAt: latestMessage?.readAt || null,
          };
        })
      );

      // Sort by online status and last activity
      customersWithUnread.sort((a, b) => {
        if (a.online !== b.online) return b.online - a.online;
        if (a.unreadCount !== b.unreadCount)
          return b.unreadCount - a.unreadCount;
        return new Date(b.lastMessageAt || 0) - new Date(a.lastMessageAt || 0);
      });

      res.status(200).json({
        success: true,
        customers: customersWithUnread,
        message: "Active customers fetched successfully",
      });
    } catch (error) {
      next(createError(500, "Internal server error"));
    }
  };

  send_file = async (req, res, next) => {
    try {
      // Derive sender from authenticated JWT token (set by middleware)
      const sender = req.id;
      if (!sender) {
        return res.status(401).json({ error: "Unauthorized - sender not found" });
      }

      // Determine senderModel based on which middleware was used
      const senderModel = req.role ? "Admin" : "Customer";
      
      const { receiver, receiverModel, content } = req.body;

      logger.info({ sender, senderModel, receiver, receiverModel, content });

      if (!req.file) {
        throw createError(400, "No file uploaded");
      }

      const file = req.file;
      const fileType = getFileType(file.mimetype);

      const conversationContext = buildConversationContext({
        sender,
        senderModel,
        receiver,
        receiverModel,
      });

      const resolvedConversationId =
        req.body.conversationId || conversationContext.conversationId;

      const participants = conversationContext.participants?.length
        ? conversationContext.participants
        : [sender, receiver].filter(Boolean);

      const participantModels = conversationContext.participantModels?.length
        ? conversationContext.participantModels
        : [senderModel, receiverModel].filter(Boolean);

      const newMessage = await Message.create({
        sender,
        senderModel,
        receiver,
        receiverModel,
        content: content || "File shared",
        attachment: file.path.replace("public", ""),
        attachmentOriginalName: file.originalname,
        attachmentType: fileType,
        conversationId: resolvedConversationId,
        participants,
        participantModels,
      });

      const populatedMessage = await Message.findById(newMessage._id)
        .populate("sender", "name image")
        .populate("receiver", "name image");

      res.status(201).json({
        success: true,
        message: populatedMessage,
      });
    } catch (error) {
      next(error);
    }
  };

  delete_message = async (req, res, next) => {
    try {
      const { messageId } = req.params;

      // 1. Find and verify the message exists
      const message = await Message.findById(messageId);
      if (!message) {
        throw createError(404, "Message not found");
      }

      // 3. If message has attachment, delete the file
      if (message.attachment) {
        const fs = require("fs");
        const path = require("path");
        const filePath = path.join(
          __dirname,
          "../../public",
          message.attachment
        );
        if (fs.existsSync(filePath)) {
          try {
            await fs.promises.unlink(filePath);
          } catch (error) {
            logger.error("Error deleting attachment file:", error);
          }
        }
      }

      // 4. Delete the message from database
      await Message.findByIdAndDelete(messageId);

      // 5. Notify clients via socket.io if needed
      // io.to(message.sender).to(message.receiver).emit('message_deleted', { messageId });

      res.status(200).json({
        success: true,
        message: "Message deleted successfully",
        messageId,
      });
    } catch (error) {
      next(error);
    }
  };
}

module.exports = new messageController();
