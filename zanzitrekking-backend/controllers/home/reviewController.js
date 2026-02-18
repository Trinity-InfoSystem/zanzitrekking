const Review = require("../../models/review");
const logger = require('./../../utilities/logger');
const Trip = require("../../models/trip");
const Order = require("../../models/order");
const mongoose = require("mongoose");
const { responseReturn } = require("../../utilities/response");

class ReviewController {
  // Create a new review
  createReview = async (req, res) => {
    try {
      const { customerId, tripId, orderId, rating, title, comment, images } =
        req.body;

      // Validate required fields
      if (!customerId || !tripId || !rating || !title || !comment) {
        return responseReturn(res, 400, {
          message:
            "Missing required fields: customerId, tripId, rating, title, and comment are required.",
        });
      }

      // Validate rating
      if (rating < 1 || rating > 5) {
        return responseReturn(res, 400, {
          message: "Rating must be between 1 and 5.",
        });
      }

      // Create the review
      const reviewData = {
        customerId,
        tripId,
        orderId: orderId || null, // Make orderId optional
        rating: parseInt(rating),
        title: title.trim(),
        comment: comment.trim(),
        tripEndDate: new Date(), // Set to current date since we're not checking eligibility
        images: images || [],
      };

      const review = await Review.create(reviewData);

      // Add review to trip's reviews array
      await Trip.findByIdAndUpdate(tripId, {
        $push: { reviews: review._id },
      });

      // Update trip average rating
      await this.updateTripRating(tripId);

      // Populate customer information
      await review.populate("customerId", "name email image");

      return responseReturn(res, 201, {
        message: "Review submitted successfully",
        review,
      });
    } catch (error) {
      logger.error("Error creating review:", error);

      if (error.statusCode === 400) {
        return responseReturn(res, 400, { message: error.message });
      }

      return responseReturn(res, 500, { message: "Internal server error" });
    }
  };

  // Get reviews for a specific trip
  getTripReviews = async (req, res) => {
    try {
      const { tripId } = req.params;
      const { page = 1, limit = 10, status, customerId } = req.query;

      const skip = (parseInt(page) - 1) * parseInt(limit);

      // Convert tripId to ObjectId
      let tripObjectId;
      try {
        tripObjectId = new mongoose.Types.ObjectId(tripId);
      } catch (error) {
        return responseReturn(res, 400, {
          message: "Invalid trip ID format",
        });
      }

      // Build query - show approved reviews and pending reviews for the current user
      // Never show rejected reviews
      const query = {
        tripId: tripObjectId,
      };

      // If customerId is provided, also include their pending reviews
      // Otherwise, only show approved reviews
      if (customerId) {
        let customerObjectId;
        try {
          customerObjectId = new mongoose.Types.ObjectId(customerId);
        } catch (error) {
          // If ObjectId conversion fails, use string
          customerObjectId = customerId;
        }

        // Show approved reviews OR user's own pending reviews (never rejected)
        query.$or = [
          { status: "approved" }, // All approved reviews
          { status: "pending", customerId: customerObjectId }, // User's own pending reviews
        ];
      } else {
        query.status = "approved"; // Default: only approved reviews
      }

      // Get reviews with pagination
      const reviews = await Review.find(query)
        .populate("customerId", "name email image")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));

      // Get total count
      const totalReviews = await Review.countDocuments(query);

      // Get average rating (only from approved reviews)
      const ratingStats = await Review.getTripAverageRating(tripId);

      return responseReturn(res, 200, {
        reviews,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalReviews / parseInt(limit)),
          totalReviews,
          hasNext: skip + reviews.length < totalReviews,
          hasPrev: parseInt(page) > 1,
        },
        ratingStats,
      });
    } catch (error) {
      logger.error("Error getting trip reviews:", error);
      return responseReturn(res, 500, { message: "Internal server error" });
    }
  };

  // Get customer's reviews
  getCustomerReviews = async (req, res) => {
    try {
      const { customerId } = req.query;
      const { page = 1, limit = 10 } = req.query;

      if (!customerId) {
        return responseReturn(res, 400, {
          message: "Customer ID is required",
        });
      }

      const skip = (parseInt(page) - 1) * parseInt(limit);

      const reviews = await Review.find({ customerId })
        .populate("tripId", "mainTitle mainImage mainDestination")
        .populate("orderId", "orderNumber")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));

      const totalReviews = await Review.countDocuments({ customerId });

      return responseReturn(res, 200, {
        reviews,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalReviews / parseInt(limit)),
          totalReviews,
          hasNext: skip + reviews.length < totalReviews,
          hasPrev: parseInt(page) > 1,
        },
      });
    } catch (error) {
      logger.error("Error getting customer reviews:", error);
      return responseReturn(res, 500, { message: "Internal server error" });
    }
  };


  // Update a review (only by the author)
  updateReview = async (req, res) => {
    try {
      const { reviewId } = req.params;
      const { customerId, rating, title, comment, images } = req.body;

      if (!customerId) {
        return responseReturn(res, 400, {
          message: "Customer ID is required",
        });
      }

      // Find the review
      const review = await Review.findOne({ _id: reviewId, customerId });

      if (!review) {
        return responseReturn(res, 404, {
          message:
            "Review not found or you don't have permission to update it.",
        });
      }

      // Validate rating if provided
      if (rating !== undefined && (rating < 1 || rating > 5)) {
        return responseReturn(res, 400, {
          message: "Rating must be between 1 and 5.",
        });
      }

      // Update review (users can edit their own reviews regardless of status)
      const updateData = {};
      if (rating !== undefined) updateData.rating = parseInt(rating);
      if (title !== undefined) updateData.title = title.trim();
      if (comment !== undefined) updateData.comment = comment.trim();
      if (images !== undefined) updateData.images = images;

      // If review was approved and being edited, set status back to pending for admin review
      if (review.status === "approved" && Object.keys(updateData).length > 0) {
        updateData.status = "pending";
      }

      const updatedReview = await Review.findByIdAndUpdate(
        reviewId,
        updateData,
        { new: true }
      ).populate("customerId", "name email image");

      // Update trip rating if rating changed
      if (rating !== undefined) {
        await this.updateTripRating(review.tripId);
      }

      return responseReturn(res, 200, {
        message: "Review updated successfully.",
        review: updatedReview,
      });
    } catch (error) {
      logger.error("Error updating review:", error);
      return responseReturn(res, 500, { message: "Internal server error" });
    }
  };

  // Delete a review (only by the author)
  deleteReview = async (req, res) => {
    try {
      const { reviewId } = req.params;
      const { customerId } = req.query;

      if (!customerId) {
        return responseReturn(res, 400, {
          message: "Customer ID is required",
        });
      }

      // Find the review
      const review = await Review.findOne({ _id: reviewId, customerId });

      if (!review) {
        return responseReturn(res, 404, {
          message:
            "Review not found or you don't have permission to delete it.",
        });
      }

      // Users can delete their own reviews regardless of status
      // Delete the review
      await Review.findByIdAndDelete(reviewId);

      // Remove review from trip's reviews array
      await Trip.findByIdAndUpdate(review.tripId, {
        $pull: { reviews: reviewId },
      });

      // Update trip rating
      await this.updateTripRating(review.tripId);

      return responseReturn(res, 200, {
        message: "Review deleted successfully.",
      });
    } catch (error) {
      logger.error("Error deleting review:", error);
      return responseReturn(res, 500, { message: "Internal server error" });
    }
  };

  // Helper method to update trip average rating
  updateTripRating = async (tripId) => {
    try {
      const ratingStats = await Review.getTripAverageRating(tripId);

      await Trip.findByIdAndUpdate(tripId, {
        rating: Math.round(ratingStats.averageRating * 10) / 10, // Round to 1 decimal place
      });
    } catch (error) {
      logger.error("Error updating trip rating:", error);
    }
  };

  // Get customer's completed trips that can be reviewed
  getReviewableTrips = async (req, res) => {
    try {
      const { customerId, page = 1, limit = 10 } = req.query;

      if (!customerId) {
        return responseReturn(res, 400, {
          message: "Customer ID is required",
        });
      }

      const skip = (parseInt(page) - 1) * parseInt(limit);

      // First, auto-complete any trips that have ended
      const {
        autoCompleteTrips,
      } = require("../../utilities/autoCompleteTrips");
      await autoCompleteTrips();

      // Find orders with completed trips
      const orders = await Order.find({
        customerId,
        "cartItems.itemStatus": "completed",
      })
        .populate("cartItems.tripId", "mainTitle mainImage mainDestination")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));

      // Filter out trips that have already been reviewed
      const reviewableTrips = [];

      for (const order of orders) {
        for (const cartItem of order.cartItems) {
          if (cartItem.itemStatus === "completed") {
            // Check if this trip has been reviewed for this order
            const existingReview = await Review.findOne({
              customerId,
              tripId: cartItem.tripId._id,
              orderId: order._id,
            });

            if (!existingReview) {
              // Calculate trip end date
              const tripStartDate = new Date(cartItem.startingDate);
              const tripDuration = cartItem.days || 1;
              const tripEndDate = new Date(tripStartDate);
              tripEndDate.setDate(tripEndDate.getDate() + tripDuration - 1);

              // Only include if trip has ended
              if (tripEndDate <= new Date()) {
                reviewableTrips.push({
                  orderId: order._id,
                  orderNumber: order.orderNumber,
                  tripId: cartItem.tripId._id,
                  tripTitle: cartItem.mainTitle,
                  tripImage: cartItem.mainImage,
                  tripDestination: Array.isArray(cartItem.mainDestination)
                    ? cartItem.mainDestination[0]
                    : cartItem.mainDestination,
                  tripStartDate: cartItem.startingDate,
                  tripEndDate,
                  canReview: true,
                });
              }
            }
          }
        }
      }

      return responseReturn(res, 200, {
        reviewableTrips,
        pagination: {
          currentPage: parseInt(page),
          totalTrips: reviewableTrips.length,
        },
      });
    } catch (error) {
      logger.error("Error getting reviewable trips:", error);
      return responseReturn(res, 500, { message: "Internal server error" });
    }
  };
}

module.exports = new ReviewController();
