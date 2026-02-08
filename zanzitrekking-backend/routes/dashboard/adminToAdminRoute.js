// routes/adminToAdminRoute.js
const router = require("express").Router();
const adminToAdminController = require("../../controllers/dashboard/adminToAdminController");
const { chatFileUpload } = require("../../utilities/multerUpload");
const { jwtMiddleware } = require("../../middlewares/authJwtMiddleware");

// Admin-to-Admin chat routes
router.get(
  "/admin-messages/:adminId/:currentAdminId",
  jwtMiddleware,
  adminToAdminController.get_admin_messages
);

router.post(
  "/admin-message-send-file",
  chatFileUpload.single("attachment"),
  jwtMiddleware,
  adminToAdminController.send_admin_file
);

router.delete(
  "/admin-message/:messageId",
  jwtMiddleware,
  adminToAdminController.delete_admin_message
);

router.post("/admin-message-send", jwtMiddleware, adminToAdminController.send_admin_message);

router.put(
  "/admin-messages-mark-read/:senderId/:receiverId",
  jwtMiddleware,
  adminToAdminController.mark_messages_read
);

// New routes for enhanced functionality
router.put(
  "/admin-message-mark-read/:messageId",
  jwtMiddleware,
  adminToAdminController.mark_message_read
);

router.get(
  "/admin-unread-count/:userId/:userModel",
  jwtMiddleware,
  adminToAdminController.get_unread_count
);

// Admin dashboard routes
router.get("/admin-chat-stats", jwtMiddleware, adminToAdminController.get_chat_stats);
router.get("/admin-all-admins", jwtMiddleware, adminToAdminController.get_all_admins);
router.get("/admin-active-admins", jwtMiddleware, adminToAdminController.get_active_admins);
router.get(
  "/admin-active-admins-with-new-admin/:adminId",
  jwtMiddleware,
  adminToAdminController.get_active_admins_with_new_admin
);

module.exports = router;
