/**
 * Socket.IO Handler Module
 * 
 * This module handles all Socket.IO connection logic and event handlers.
 * Extracted from server.js for better code organization.
 */

const logger = require("../utilities/logger");

/**
 * Initialize Socket.IO server and set up event handlers
 * @param {Server} server - HTTP server instance
 * @param {Object} corsOptions - CORS configuration options
 * @returns {Server} - Socket.IO server instance
 */
function initializeSocketIO(server, corsOptions) {
  const { Server } = require("socket.io");

  // Socket.IO configuration
  const io = new Server(server, {
    cors: {
      ...corsOptions,
      allowedHeaders: ["Content-Type", "Authorization"],
      exposedHeaders: ["Content-Type"],
      maxAge: 3600,
    },
    pingTimeout: 60000,
    pingInterval: 25000,
    transports: ["websocket", "polling"],
  });

  // Socket.IO connection error handler
  io.engine.on("connection_error", (err) => {
    logger.error("Socket.IO connection error:", err);
  });

  // Socket.IO connection handler
  io.on("connection", (socket) => {
    logger.debug(`Socket connected: ${socket.id}`);

    // Join user room
    socket.on("join", (userId) => {
      if (!userId) {
        logger.warn("Socket join: userId is missing");
        return;
      }
      socket.join(userId);
      socket.emit("joined", { status: "success", room: userId });
      logger.debug(`Socket ${socket.id} joined room: ${userId}`);
    });

    // Join conversation room
    socket.on("join_conversation", ({ conversationId }) => {
      if (!conversationId) {
        logger.warn("Socket join_conversation: conversationId is missing");
        return;
      }
      socket.join(conversationId);
      logger.debug(`Socket ${socket.id} joined conversation: ${conversationId}`);
    });

    // Leave conversation room
    socket.on("leave_conversation", ({ conversationId }) => {
      if (!conversationId) {
        logger.warn("Socket leave_conversation: conversationId is missing");
        return;
      }
      socket.leave(conversationId);
      logger.debug(`Socket ${socket.id} left conversation: ${conversationId}`);
    });

    // Socket error handler
    socket.on("error", (error) => {
      logger.error(`Socket error for ${socket.id}:`, error);
    });

    // Customer-to-Admin messaging
    socket.on("send_message", (messageData) => {
      if (!messageData) {
        logger.warn("Socket send_message: messageData is missing");
        return;
      }

      // Add createdAt timestamp
      const messageWithTimestamp = {
        ...messageData,
        createdAt: new Date().toISOString(),
      };

      const targets = new Set();

      if (messageData.receiver) {
        targets.add(messageData.receiver);
      }

      if (messageData.conversationId) {
        targets.add(messageData.conversationId);
      }

      // Emit message to all target rooms
      targets.forEach((roomId) => {
        io.to(roomId).emit("receive_message", messageWithTimestamp);
      });

      logger.debug(`Message sent to ${targets.size} room(s)`);
    });

    // Admin-to-Admin messaging
    socket.on("send_admin_message", (messageData) => {
      if (!messageData) {
        logger.warn("Socket send_admin_message: messageData is missing");
        return;
      }

      // Add createdAt timestamp
      const messageWithTimestamp = {
        ...messageData,
        createdAt: new Date().toISOString(),
      };

      const targets = new Set();

      if (messageData.receiver) {
        targets.add(messageData.receiver);
      }

      if (messageData.conversationId) {
        targets.add(messageData.conversationId);
      }

      // Emit message to all target rooms
      targets.forEach((roomId) => {
        io.to(roomId).emit("receive_admin_message", messageWithTimestamp);
      });

      logger.debug(`Admin message sent to ${targets.size} room(s)`);
    });

    // Admin typing indicators
    socket.on("admin_typing", (data) => {
      if (!data || !data.receiverId) {
        logger.warn("Socket admin_typing: invalid data");
        return;
      }

      const { userId, receiverId, isTyping } = data;

      // Send typing indicator to the receiver
      io.to(receiverId).emit("admin_typing", {
        userId,
        isTyping,
      });
    });

    // Admin message read status
    socket.on("admin_message_read", (data) => {
      if (!data || !data.receiverId) {
        logger.warn("Socket admin_message_read: invalid data");
        return;
      }

      const { messageId, readBy, receiverId } = data;

      // Notify the sender that their message was read
      io.to(receiverId).emit("admin_message_read", {
        messageId,
        readBy,
      });
    });

    // Socket disconnect handler
    socket.on("disconnect", (reason) => {
      logger.debug(`Socket ${socket.id} disconnected: ${reason}`);
    });
  });

  logger.info("Socket.IO initialized successfully");
  return io;
}

module.exports = { initializeSocketIO };
