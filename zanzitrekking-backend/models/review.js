const { Schema, model, default: mongoose } = require("mongoose");

const reviewSchema = new Schema(
  {
    // Customer who wrote the review
    customerId: {
      type: Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },

    // Trip being reviewed
    tripId: {
      type: Schema.Types.ObjectId,
      ref: "Trip",
      required: true,
    },

    // Order reference (to track which booking this review is for) - optional
    orderId: {
      type: Schema.Types.ObjectId,
      ref: "Order",
      required: false,
    },

    // Review content
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },

    title: {
      type: String,
      required: true,
      maxlength: 100,
    },

    comment: {
      type: String,
      required: true,
      maxlength: 1000,
    },

    // Trip completion verification
    tripEndDate: {
      type: Date,
      required: true,
    },

    // Review status
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "approved",
    },

    // Admin response (optional)
    adminResponse: {
      type: String,
      maxlength: 500,
    },

    // Helpful votes
    helpfulVotes: {
      type: Number,
      default: 0,
    },

    // Review images (optional)
    images: [
      {
        type: String,
      },
    ],

    // Verification that trip was completed
    isVerified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for better performance
reviewSchema.index({ tripId: 1, status: 1 });
reviewSchema.index({ customerId: 1 });
reviewSchema.index({ orderId: 1 });
reviewSchema.index({ rating: 1 });
reviewSchema.index({ createdAt: -1 });

// Virtual for formatted date
reviewSchema.virtual("formattedDate").get(function () {
  return this.createdAt.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
});

// Virtual for customer name (populated)
reviewSchema.virtual("customerName", {
  ref: "Customer",
  localField: "customerId",
  foreignField: "_id",
  justOne: true,
});

// Pre-save middleware
reviewSchema.pre("save", async function (next) {
  // Only check if this is a new review
  if (this.isNew) {
    // Mark as verified
    this.isVerified = true;
  }

  next();
});


// Static method to get trip average rating
reviewSchema.statics.getTripAverageRating = async function (tripId) {
  const result = await this.aggregate([
    {
      $match: {
        tripId: new mongoose.Types.ObjectId(tripId),
        status: "approved",
      },
    },
    {
      $group: {
        _id: null,
        averageRating: { $avg: "$rating" },
        totalReviews: { $sum: 1 },
      },
    },
  ]);

  return result.length > 0 ? result[0] : { averageRating: 0, totalReviews: 0 };
};

module.exports = mongoose.model("Review", reviewSchema);
