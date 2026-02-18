const express = require("express");
const router = express.Router();
const adminUrgentBookingRequestController = require("../../controllers/dashboard/urgentBookingRequestController");
const {
  jwtMiddleware,
  roleMiddleware,
} = require("../../middlewares/authJwtMiddleware");
const { validate } = require("../../middlewares/validationMiddleware");
const {
  updateRequestStatusSchema,
  bulkUpdateStatusSchema,
} = require("../../validators/adminUrgentBookingValidation");

// Admin urgent booking request management routes
router.get(
  "/admin/urgent-booking-requests",
  jwtMiddleware,
  adminUrgentBookingRequestController.getAllRequests
);

router.get(
  "/admin/urgent-booking-requests/stats",
  jwtMiddleware,
  adminUrgentBookingRequestController.getRequestStats
);

router.get(
  "/admin/urgent-booking-requests/:requestId",
  jwtMiddleware,
  adminUrgentBookingRequestController.getRequestById
);

router.put(
  "/admin/urgent-booking-requests/:requestId/status",
  jwtMiddleware,
  validate(updateRequestStatusSchema),
  adminUrgentBookingRequestController.updateRequestStatus
);

router.post(
  "/admin/urgent-booking-requests/bulk-update",
  jwtMiddleware,
  validate(bulkUpdateStatusSchema),
  adminUrgentBookingRequestController.bulkUpdateStatus
);

module.exports = router;

