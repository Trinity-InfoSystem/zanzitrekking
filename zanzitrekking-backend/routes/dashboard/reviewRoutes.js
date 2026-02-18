const express = require("express");
const router = express.Router();
const adminReviewController = require("../../controllers/dashboard/reviewController");
const {
  jwtMiddleware,
  roleMiddleware,
} = require("../../middlewares/authJwtMiddleware");
const { validate } = require("../../middlewares/validationMiddleware");
const {
  updateReviewStatusSchema,
  bulkUpdateReviewsSchema,
  bulkDeleteReviewsSchema,
} = require("../../validators/adminReviewValidation");

// Admin review management routes
router.get(
  "/admin/reviews",
  jwtMiddleware,
  adminReviewController.getAllReviews
);

router.get(
  "/admin/reviews/trip/:tripId",
  jwtMiddleware,
  adminReviewController.getTripReviews
);

router.put(
  "/admin/reviews/:reviewId/status",
  jwtMiddleware,
  validate(updateReviewStatusSchema),
  adminReviewController.updateReviewStatus
);

router.delete(
  "/admin/reviews/:reviewId",
  jwtMiddleware,
  adminReviewController.deleteReview
);

router.post(
  "/admin/reviews/bulk-update",
  jwtMiddleware,
  validate(bulkUpdateReviewsSchema),
  adminReviewController.bulkUpdateReviews
);

router.post(
  "/admin/reviews/bulk-delete",
  jwtMiddleware,
  validate(bulkDeleteReviewsSchema),
  adminReviewController.bulkDeleteReviews
);

module.exports = router;
