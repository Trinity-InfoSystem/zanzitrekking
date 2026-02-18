const Message = require("../../models/chat/chat");
const logger = require('./../../utilities/logger');
const Admin = require("../../models/admin");
const createError = require("http-errors");
const { path } = require("express/lib/application");

function getFileType(mimetype) {
  if (mimetype.startsWith("image/")) return "image";
  if (mimetype.startsWith("audio/")) return "audio";
  if (mimetype.startsWith("video/")) return "video";
  return "document";
}

function buildAdminConversation(sender, receiver) {
  const ids = [sender?.toString(), receiver?.toString()].filter(Boolean).sort();
  return {
    conversationId: `admin-${ids.join("-")}`,
    participants: ids,
    participantModels: ["Admin", "Admin"],
  };
}

class adminToAdminController {
  // Get messages between two admins
  get_admin_messages = async (req, res, next) => {
    try {
      const { adminId, currentAdminId } = req.params;

      const admin = await Admin.findById(adminId);
      if (!admin) {
        throw createError(404, "Admin not found");
      }

      const currentAdmin = await Admin.findById(currentAdminId);
      if (!currentAdmin) {
        throw createError(404, "Current admin not found");
      }
      const conversationId = `admin-${[adminId, currentAdminId]
        .filter(Boolean)
        .sort()
        .join("-")}`;

      const messages = await Message.find({
        $or: [
          { conversationId },
          {
            conversationId: { $exists: false },
            $or: [
              {
                sender: adminId,
                receiver: currentAdminId,
                senderModel: "Admin",
                receiverModel: "Admin",
              },
              {
                sender: currentAdminId,
                receiver: adminId,
                senderModel: "Admin",
                receiverModel: "Admin",
              },
            ],
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
        message: "Admin messages fetched successfully",
      });
    } catch (error) {
      next(createError(500, "Internal server error"));
    }
  };

  // Send a new admin message
  send_admin_message = async (req, res, next) => {
    try {
      // Derive sender from authenticated JWT token (set by jwtMiddleware)
      const sender = req.id;
      if (!sender || !req.role) {
        return res.status(401).json({ error: "Unauthorized - admin authentication required" });
      }

      const senderModel = "Admin"; // Always Admin for admin-to-admin messages
      const { receiver, receiverModel, content } = req.body;

      logger.info("Admin message data:", { sender, senderModel, receiver, receiverModel, content });

      // Verify receiver is also an admin
      if (receiverModel !== "Admin") {
        throw createError(400, "Receiver must be an admin");
      }

      const conversationContext = buildAdminConversation(sender, receiver);
      const resolvedConversationId =
        req.body.conversationId || conversationContext.conversationId;

      const newMessage = await Message.create({
        sender,
        senderModel,
        receiver,
        receiverModel,
        content,
        conversationId: resolvedConversationId,
        participants: conversationContext.participants,
        participantModels: conversationContext.participantModels,
      });

      const populatedMessage = await Message.findById(newMessage._id)
        .populate("sender", "name image")
        .populate("receiver", "name image");

      res.status(201).json({
        success: true,
        message: populatedMessage,
      });
    } catch (error) {
      logger.info(error);
      next(createError(500, "Internal server error"));
    }
  };

  // Send admin file
  send_admin_file = async (req, res, next) => {
    try {
      // Derive sender from authenticated JWT token (set by jwtMiddleware)
      const sender = req.id;
      if (!sender || !req.role) {
        return res.status(401).json({ error: "Unauthorized - admin authentication required" });
      }

      const senderModel = "Admin"; // Always Admin for admin-to-admin messages
      const { receiver, receiverModel, content } = req.body;

      logger.info("Admin file data:", { sender, senderModel, receiver, receiverModel, content });

      if (!req.file) {
        throw createError(400, "No file uploaded");
      }

      // Verify receiver is also an admin
      if (receiverModel !== "Admin") {
        throw createError(400, "Receiver must be an admin");
      }

      const file = req.file;
      const fileType = getFileType(file.mimetype);

      const conversationContext = buildAdminConversation(sender, receiver);
      const resolvedConversationId =
        req.body.conversationId || conversationContext.conversationId;

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
        participants: conversationContext.participants,
        participantModels: conversationContext.participantModels,
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

  // Mark admin messages as read
  mark_messages_read = async (req, res, next) => {
    try {
      const { senderId, receiverId } = req.params;

      const result = await Message.updateMany(
        {
          sender: senderId,
          receiver: receiverId,
          senderModel: "Admin",
          receiverModel: "Admin",
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
        message: "Admin messages marked as read",
        modifiedCount: result.modifiedCount,
      });
    } catch (error) {
      next(createError(500, "Internal server error"));
    }
  };

  // Mark single admin message as read
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

      // Verify it's an admin-to-admin message
      if (
        message.senderModel !== "Admin" ||
        message.receiverModel !== "Admin"
      ) {
        throw createError(400, "This is not an admin-to-admin message");
      }

      res.status(200).json({
        success: true,
        message: "Admin message marked as read",
        data: message,
      });
    } catch (error) {
      next(error);
    }
  };

  // Get unread admin message count
  get_unread_count = async (req, res, next) => {
    try {
      const { userId, userModel } = req.params;

      if (userModel !== "Admin") {
        throw createError(400, "User model must be Admin");
      }

      const unreadCount = await Message.countDocuments({
        receiver: userId,
        receiverModel: "Admin",
        senderModel: "Admin", // Only count admin-to-admin messages
        read: false,
      });

      res.status(200).json({
        success: true,
        unreadCount,
        message: "Admin unread count fetched successfully",
      });
    } catch (error) {
      next(createError(500, "Internal server error"));
    }
  };

  // Admin chat stats
  get_chat_stats = async (req, res, next) => {
    try {
      const totalAdmins = await Admin.countDocuments();
      const totalMessages = await Message.countDocuments({
        senderModel: "Admin",
        receiverModel: "Admin",
      });
      const unreadMessages = await Message.countDocuments({
        receiverModel: "Admin",
        senderModel: "Admin",
        read: false,
      });

      // Get active admins (those who have sent messages in the last 24 hours)
      const activeAdmins = await Message.distinct("sender", {
        senderModel: "Admin",
        createdAt: {
          $gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
        },
      });

      const stats = {
        totalAdmins,
        activeChats: activeAdmins.length,
        totalMessages,
        unreadMessages,
      };

      res.status(200).json({
        success: true,
        stats,
        message: "Admin chat stats fetched successfully",
      });
    } catch (error) {
      next(createError(500, "Internal server error"));
    }
  };

  // Get all admins
  get_all_admins = async (req, res, next) => {
    try {
      const admins = await Admin.find().select("name email image role").lean();

      res.status(200).json({
        success: true,
        admins,
        message: "All admins fetched successfully",
      });
    } catch (error) {
      next(createError(500, "Internal server error"));
    }
  };

  // Get active admins
  get_active_admins = async (req, res, next) => {
    try {
      const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const currentUserId = req?.id; // Get current user ID from auth middleware

      // Get admins who have sent messages in the last 24 hours (excluding current admin)
      const recentActiveAdminIds = await Message.distinct("sender", {
        senderModel: "Admin",
        createdAt: {
          $gte: twentyFourHoursAgo,
        },
        sender: { $ne: currentUserId }, // Exclude current admin
      });

      // Get all admins whom the current admin has sent messages to
      const adminsCurrentUserMessaged = await Message.distinct("receiver", {
        sender: currentUserId,
        senderModel: "Admin",
        receiverModel: "Admin",
      });

      // Combine both lists and remove duplicates
      const allRelevantAdminIds = [
        ...new Set([
          ...recentActiveAdminIds.map((id) => id.toString()),
          ...adminsCurrentUserMessaged.map((id) => id.toString()),
        ]),
      ];
      logger.info("Combined admin IDs:", allRelevantAdminIds);

      const admins = await Admin.find({
        _id: { $in: allRelevantAdminIds },
      })
        .select("name email image role")
        .lean();

      const adminsWithUnread = await Promise.all(
        admins.map(async (admin) => {
          // Get the last message in the conversation between current user and this admin
          const [latestMessage] = await Message.find({
            $or: [
              {
                sender: admin._id,
                receiver: currentUserId,
                senderModel: "Admin",
                receiverModel: "Admin",
              },
              {
                sender: currentUserId,
                receiver: admin._id,
                senderModel: "Admin",
                receiverModel: "Admin",
              },
            ],
          })
            .sort({ createdAt: -1 })
            .limit(1)
            .select(["createdAt", "content", "read", "readAt", "sender"])
            .lean();

          // Count unread messages from this admin to current user
          const unreadCount = await Message.countDocuments({
            sender: admin._id,
            receiver: currentUserId,
            senderModel: "Admin",
            receiverModel: "Admin",
            read: false,
          });

          // Check if admin is online (active in last 5 minutes)
          const lastActivity = await Message.findOne({
            sender: admin._id,
            senderModel: "Admin",
          })
            .sort({ createdAt: -1 })
            .select("createdAt")
            .lean();

          const isOnline =
            lastActivity &&
            new Date() - new Date(lastActivity.createdAt) < 5 * 60 * 1000;

          return {
            ...admin,
            unreadCount,
            lastMessageAt: latestMessage?.createdAt || null,
            lastMessage: latestMessage?.content || "",
            lastMessageFromCurrentUser:
              latestMessage?.sender?.toString() === currentUserId?.toString(),
            online: isOnline,
            lastMessageRead: latestMessage?.read || false,
            lastMessageReadAt: latestMessage?.readAt || null,
          conversationId: `admin-${[admin._id.toString(), currentUserId]
            .filter(Boolean)
            .map(String)
            .sort()
            .join("-")}`,
          };
        })
      );

      logger.info("Admins with unread:", adminsWithUnread);

      // Sort by online status and last activity
      adminsWithUnread.sort((a, b) => {
        if (a.online !== b.online) return b.online - a.online;
        if (a.unreadCount !== b.unreadCount)
          return b.unreadCount - a.unreadCount;
        return new Date(b.lastMessageAt || 0) - new Date(a.lastMessageAt || 0);
      });

      res.status(200).json({
        success: true,
        admins: adminsWithUnread,
        message: "Active admins fetched successfully",
      });
    } catch (error) {
      next(createError(500, "Internal server error"));
    }
  };

  // Get active admins with new admin
  get_active_admins_with_new_admin = async (req, res, next) => {
    try {
      const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const { adminId } = req.params;
      const currentUserId = req.user?.id; // Get current user ID from auth middleware

      logger.info("Getting active admins with new admin:", adminId);

      // Get admins who have sent messages in the last 24 hours (excluding current admin)
      const recentActiveAdminIds = await Message.distinct("sender", {
        senderModel: "Admin",
        createdAt: {
          $gte: twentyFourHoursAgo,
        },
        sender: { $ne: currentUserId }, // Exclude current admin
      });

      // Get all admins whom the current admin has sent messages to
      const adminsCurrentUserMessaged = await Message.distinct("receiver", {
        sender: currentUserId,
        senderModel: "Admin",
        receiverModel: "Admin",
      });

      // Combine both lists and remove duplicates
      let allRelevantAdminIds = [
        ...new Set([
          ...recentActiveAdminIds.map((id) => id.toString()),
          ...adminsCurrentUserMessaged.map((id) => id.toString()),
        ]),
      ];

      // If a specific adminId was requested, include it even if not recently active
      // but only if it's not the current user
      if (
        adminId &&
        adminId !== currentUserId?.toString() &&
        !allRelevantAdminIds.includes(adminId)
      ) {
        allRelevantAdminIds.push(adminId);
      }

      const admins = await Admin.find({
        _id: { $in: allRelevantAdminIds },
      })
        .select("name email image role")
        .lean();

      const adminsWithUnread = await Promise.all(
        admins.map(async (admin) => {
          // Get the last message in the conversation between current user and this admin
          const [latestMessage] = await Message.find({
            $or: [
              {
                sender: admin._id,
                receiver: currentUserId,
                senderModel: "Admin",
                receiverModel: "Admin",
              },
              {
                sender: currentUserId,
                receiver: admin._id,
                senderModel: "Admin",
                receiverModel: "Admin",
              },
            ],
          })
            .sort({ createdAt: -1 })
            .limit(1)
            .select(["createdAt", "content", "read", "readAt", "sender"])
            .lean();

          // Count unread messages from this admin to current user
          const unreadCount = await Message.countDocuments({
            sender: admin._id,
            receiver: currentUserId,
            senderModel: "Admin",
            receiverModel: "Admin",
            read: false,
          });

          // Check if admin is online (active in last 5 minutes)
          const lastActivity = await Message.findOne({
            sender: admin._id,
            senderModel: "Admin",
          })
            .sort({ createdAt: -1 })
            .select("createdAt")
            .lean();

          const isOnline =
            lastActivity &&
            new Date() - new Date(lastActivity.createdAt) < 5 * 60 * 1000;

          return {
            ...admin,
            unreadCount,
            lastMessageAt: latestMessage?.createdAt || null,
            lastMessage: latestMessage?.content || "",
            lastMessageFromCurrentUser:
              latestMessage?.sender?.toString() === currentUserId?.toString(),
            online: isOnline,
            lastMessageRead: latestMessage?.read || false,
            lastMessageReadAt: latestMessage?.readAt || null,
          conversationId: `admin-${[admin._id.toString(), currentUserId]
            .filter(Boolean)
            .map(String)
            .sort()
            .join("-")}`,
          };
        })
      );

      // Sort by online status and last activity
      adminsWithUnread.sort((a, b) => {
        if (a.online !== b.online) return b.online - a.online;
        if (a.unreadCount !== b.unreadCount)
          return b.unreadCount - a.unreadCount;
        return new Date(b.lastMessageAt || 0) - new Date(a.lastMessageAt || 0);
      });

      res.status(200).json({
        success: true,
        admins: adminsWithUnread,
        message: "Active admins with new admin fetched successfully",
      });
    } catch (error) {
      next(createError(500, "Internal server error"));
    }
  };

  // Delete admin message
  delete_admin_message = async (req, res, next) => {
    try {
      const { messageId } = req.params;

      // Find and verify the message exists
      const message = await Message.findById(messageId);
      if (!message) {
        throw createError(404, "Message not found");
      }

      // Verify it's an admin-to-admin message
      if (
        message.senderModel !== "Admin" ||
        message.receiverModel !== "Admin"
      ) {
        throw createError(400, "This is not an admin-to-admin message");
      }

      // If message has attachment, delete the file
      if (message.attachment) {
        const fs = require("fs");
        const path = require("path");
        const filePath = path.join(
          __dirname,
          "../../public",
          message.attachment
        );
        logger.info("Deleting admin file at:", filePath);
        if (fs.existsSync(filePath)) {
          try {
            await fs.promises.unlink(filePath);
          } catch (error) {
            logger.error("Error deleting admin file:", error);
          }
        }
      }

      // Delete the message from database
      await Message.findByIdAndDelete(messageId);

      res.status(200).json({
        success: true,
        message: "Admin message deleted successfully",
        messageId,
      });
    } catch (error) {
      next(error);
    }
  };
}

module.exports = new adminToAdminController();
