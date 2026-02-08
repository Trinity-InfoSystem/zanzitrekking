// routes/messageRoutes.js
const router = require("express").Router();
const messageController = require("../../controllers/home/messageController");
const { chatFileUpload } = require("../../utilities/multerUpload");

// Chat routes
router.get(
  "/messages/:customerId/:adminId",

  messageController.get_messages
);

router.post(
  "/message-send-file",
  chatFileUpload.single("attachment"),
  messageController.send_file
);

router.delete("/message/:messageId", messageController.delete_message);

router.post("/message-send", messageController.send_message);
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

// Admin dashboard routes
router.get("/dashboard-stats", messageController.get_dashboard_stats);
router.get("/dashboard-recent-messages", messageController.get_recent_messages);
router.get(
  "/dashboard-active-customers",
  messageController.get_active_customers
);
router.get(
  "/dashboard-active-customers-with-new-customer/:customerId",
  messageController.get_active_customers_with_new_customer
);

module.exports = router;
