const express = require("express");
const router = express.Router();
const urgentBookingRequestController = require("../../controllers/home/urgentBookingRequestController");

// Urgent booking request routes (no middleware - similar to review routes)
router.post("/urgent-booking-requests", urgentBookingRequestController.createRequest);
router.get("/urgent-booking-requests/check-eligibility", urgentBookingRequestController.checkBookingEligibility);
router.get("/urgent-booking-requests/my-requests", urgentBookingRequestController.getUserRequests);
router.delete("/urgent-booking-requests/:requestId", urgentBookingRequestController.deleteRequest);

module.exports = router;

