// routes/messageRoutes.js
const router = require("express").Router();
const messageController = require("../../controllers/home/messageController");
const { chatFileUpload } = require("../../utilities/multerUpload");
const { customerJwtMiddleware, jwtMiddleware } = require("../../middlewares/authJwtMiddleware");

// Chat routes
router.get(
  "/messages/:customerId/:adminId",

  messageController.get_messages
);

router.post(
  "/message-send-file",
  chatFileUpload.single("attachment"),
  customerJwtMiddleware,
  messageController.send_file
);

router.delete("/message/:messageId", messageController.delete_message);

// Customer routes use customerJwtMiddleware, admin routes can use jwtMiddleware
router.post("/message-send", customerJwtMiddleware, messageController.send_message);
router.put(
  "/messages-mark-read/:senderId/:receiverId",
  messageController.mark_messages_read
);

// New routes for enhanced functionality
router.put(
  "/message-mark-read/:messageId",
  messageController.mark_message_read
);

router.get(
  "/unread-count/:userId/:userModel",
  messageController.get_unread_count
);

// Admin dashboard routes - require admin authentication
router.get("/dashboard-stats", jwtMiddleware, messageController.get_dashboard_stats);
router.get("/dashboard-recent-messages", jwtMiddleware, messageController.get_recent_messages);
router.get(
  "/dashboard-active-customers",
  jwtMiddleware,
  messageController.get_active_customers
);
router.get(
  "/dashboard-active-customers-with-new-customer/:customerId",
  jwtMiddleware,
  messageController.get_active_customers_with_new_customer
);

module.exports = router;
