const express = require("express");
const router = express.Router();
const reviewController = require("../../controllers/home/reviewController");

// Review management routes - matching order routes pattern (no middleware)
router.post("/create", reviewController.createReview);
router.get("/trip/:tripId", reviewController.getTripReviews);
router.get("/customer", reviewController.getCustomerReviews);
router.get("/reviewable-trips", reviewController.getReviewableTrips);
router.put("/:reviewId", reviewController.updateReview);
router.delete("/:reviewId", reviewController.deleteReview);

module.exports = router;
