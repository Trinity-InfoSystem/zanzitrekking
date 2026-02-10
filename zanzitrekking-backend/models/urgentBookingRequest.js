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

    // Billing address (optional for availability requests)
    billingAddress: {
      street: {
        type: String,
        default: "",
      },
      city: {
        type: String,
        default: "",
      },
      state: {
        type: String,
        default: "",
      },
      zip: {
        type: String,
        default: "",
      },
      country: {
        type: String,
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
    // Normalize the requested date to UTC start of day for accurate comparison
    // Extract UTC date components to avoid timezone shifts
    let year, month, day;
    
    if (typeof requestedDate === "string") {
      // If it's an ISO string, extract the date part (YYYY-MM-DD)
      if (requestedDate.includes("T")) {
        const datePart = requestedDate.split("T")[0]; // e.g., "2026-02-10"
        const [yearStr, monthStr, dayStr] = datePart.split("-");
        year = parseInt(yearStr, 10);
        month = parseInt(monthStr, 10) - 1; // JavaScript months are 0-indexed
        day = parseInt(dayStr, 10);
      } else {
        // Already in YYYY-MM-DD format
        const [yearStr, monthStr, dayStr] = requestedDate.split("-");
        year = parseInt(yearStr, 10);
        month = parseInt(monthStr, 10) - 1;
        day = parseInt(dayStr, 10);
      }
    } else if (requestedDate instanceof Date) {
      // Date object - extract UTC components
      year = requestedDate.getUTCFullYear();
      month = requestedDate.getUTCMonth();
      day = requestedDate.getUTCDate();
    } else {
      // Fallback: try to parse as Date
      const dateObj = new Date(requestedDate);
      year = dateObj.getUTCFullYear();
      month = dateObj.getUTCMonth();
      day = dateObj.getUTCDate();
    }
    
    // Create UTC date at midnight for the requested date
    const requestedDateStart = new Date(Date.UTC(year, month, day, 0, 0, 0, 0));
    
    // Calculate end of day in UTC
    const requestedDateEnd = new Date(Date.UTC(year, month, day, 23, 59, 59, 999));
    
    // Check if there's an approved request for this exact combination
    // Use date range to match any time on that day
    const approvedRequest = await this.findOne({
      customerId: new mongoose.Types.ObjectId(customerId),
      tripId: new mongoose.Types.ObjectId(tripId),
      requestedDate: {
        $gte: requestedDateStart,
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

