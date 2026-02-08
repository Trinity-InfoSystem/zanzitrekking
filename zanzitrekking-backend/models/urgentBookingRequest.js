const { Schema, default: mongoose } = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");

const urgentBookingRequestSchema = new Schema(
  {
    // Customer who made the request
    customerId: {
      type: Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },

    // Trip being requested
    tripId: {
      type: Schema.Types.ObjectId,
      ref: "Trip",
      required: true,
    },

    // Requested trip details
    requestedDate: {
      type: Date,
      required: true,
    },

    selectedCategory: {
      type: String,
      enum: ["standard", "midRange", "luxury"],
      required: true,
    },

    travelersNumber: {
      type: Number,
      required: true,
      min: 1,
    },

    // Personal information
    personalInfo: {
      firstName: {
        type: String,
        required: true,
      },
      lastName: {
        type: String,
        required: true,
      },
      email: {
        type: String,
        required: true,
      },
      phone: {
        type: String,
        required: true,
      },
    },

    // Billing address
    billingAddress: {
      street: {
        type: String,
        required: true,
      },
      city: {
        type: String,
        required: true,
      },
      state: {
        type: String,
        required: true,
      },
      zip: {
        type: String,
        required: true,
      },
      country: {
        type: String,
        required: true,
        default: "United States",
      },
    },

    // Request status
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },

    // Admin fields
    adminNotes: {
      type: String,
      maxlength: 1000,
    },

    approvedBy: {
      type: Schema.Types.ObjectId,
      ref: "Admin",
    },

    approvedAt: {
      type: Date,
    },

    rejectedReason: {
      type: String,
      maxlength: 500,
    },

    // Quick reference fields
    categoryName: {
      type: String,
    },

    tripTitle: {
      type: String,
    },

    // Calculated at creation
    daysUntilTrip: {
      type: Number,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for better performance
urgentBookingRequestSchema.index({ customerId: 1 });
urgentBookingRequestSchema.index({ tripId: 1 });
urgentBookingRequestSchema.index({ status: 1 });
urgentBookingRequestSchema.index({ requestedDate: 1 });
urgentBookingRequestSchema.index({ createdAt: -1 });
urgentBookingRequestSchema.index({ customerId: 1, tripId: 1, requestedDate: 1, status: 1 });

// Virtual for formatted date
urgentBookingRequestSchema.virtual("formattedDate").get(function () {
  return this.requestedDate.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
});

// Virtual to check if request is urgent (aligned with booking restriction matrix)
urgentBookingRequestSchema.virtual("isUrgent").get(function () {
  if (typeof this.daysUntilTrip !== "number") return false;

  const name = (this.categoryName || "").toLowerCase();
  const isSafari = name.includes("safari");
  const isCultural = name.includes("cultural");
  const isTrekking = name.includes("trekking");
  const isZanzibar = name.includes("zanzibar");

  const isBudget = this.selectedCategory === "standard";
  const isMidOrLux =
    this.selectedCategory === "midRange" || this.selectedCategory === "luxury";

  // Cultural / Trekking / Zanzibar (any package) → urgent if tomorrow
  if (isCultural || isTrekking || isZanzibar) {
    return this.daysUntilTrip === 1;
  }

  if (isSafari) {
    // Safaris + Budget → urgent if tomorrow
    if (isBudget) {
      return this.daysUntilTrip === 1;
    }

    // Safaris + Mid-Range / Luxury → urgent if 1–4 days after today
    if (isMidOrLux) {
      return this.daysUntilTrip >= 1 && this.daysUntilTrip <= 4;
    }
  }

  return false;
});

// Pre-save middleware to calculate daysUntilTrip
urgentBookingRequestSchema.pre("save", function (next) {
  if (this.requestedDate) {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const tripStart = new Date(this.requestedDate);
    tripStart.setHours(0, 0, 0, 0);
    this.daysUntilTrip = Math.ceil((tripStart - now) / (1000 * 60 * 60 * 24));
  }
  next();
});

// Static method to check if booking is allowed for a user-trip-date combination
urgentBookingRequestSchema.statics.isBookingAllowed = async function (
  customerId,
  tripId,
  requestedDate,
  selectedCategory
) {
  try {
    // Normalize the requested date to start of day for accurate comparison
    const requestedDateObj = new Date(requestedDate);
    requestedDateObj.setHours(0, 0, 0, 0);
    
    // Calculate end of day for range query
    const requestedDateEnd = new Date(requestedDateObj);
    requestedDateEnd.setHours(23, 59, 59, 999);
    
    // Check if there's an approved request for this exact combination
    // Use date range to match any time on that day
    const approvedRequest = await this.findOne({
      customerId: new mongoose.Types.ObjectId(customerId),
      tripId: new mongoose.Types.ObjectId(tripId),
      requestedDate: {
        $gte: requestedDateObj,
        $lte: requestedDateEnd,
      },
      selectedCategory,
      status: "approved",
    });

    return !!approvedRequest;
  } catch (error) {
    console.error("Error checking booking eligibility:", error);
    return false;
  }
};

// Plugin for pagination
urgentBookingRequestSchema.plugin(mongoosePaginate);

module.exports = mongoose.model("UrgentBookingRequest", urgentBookingRequestSchema);

