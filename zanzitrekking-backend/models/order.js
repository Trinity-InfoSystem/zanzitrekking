const { Schema, default: mongoose } = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");

const pricingSchema = new mongoose.Schema({
  standard: {
    onePerson: { type: Number },
    twoPerson: { type: Number },
    threePerson: { type: Number },
    fourPerson: { type: Number },
    fiveOrMorePerson: { type: Number },
  },
  midRange: {
    onePerson: { type: Number },
    twoPerson: { type: Number },
    threePerson: { type: Number },
    fourPerson: { type: Number },
    fiveOrMorePerson: { type: Number },
  },
  luxury: {
    onePerson: { type: Number },
    twoPerson: { type: Number },
    threePerson: { type: Number },
    fourPerson: { type: Number },
    fiveOrMorePerson: { type: Number },
  },
});

const seasonSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  },
  rates: {
    type: pricingSchema,
    required: true,
  },
});

const orderSchema = new Schema(
  {
    // Customer Information
    customerId: {
      type: Schema.ObjectId,
      ref: "Customer",
      required: true,
    },

    // Order Details
    orderNumber: {
      type: String,
      required: true,
      unique: true,
    },

    // Cart Items - Array of multiple trips/items
    cartItems: [
      {
        tripId: {
          type: Schema.ObjectId,
          ref: "Trip",
          required: true,
        },
        mainTitle: {
          type: String,
          required: true,
        },
        mainImage: {
          type: String,
          required: true,
        },
        startingDate: {
          type: Date,
          required: true,
        },
        days: {
          type: Number,
          required: true,
          default: 1,
        },
        travelersNumber: {
          type: Number,
          required: true,
          default: 1,
        },
        discount: {
          type: Number,
          default: 0,
        },
        pricingType: {
          type: String,
          enum: ["yearRound", "seasonal"],
          required: true,
          default: "yearRound",
        },
        regularPrices: {
          type: pricingSchema,
        },
        seasons: [seasonSchema],
        selectedCategory: {
          type: String,
          enum: ["standard", "midRange", "luxury"],
          default: "standard",
        },
        categoryId: {
          type: Schema.ObjectId,
          ref: "Category",
        },
        categoryName: {
          type: String,
        },
        itemSubtotal: {
          type: Number,
          required: true,
        },
        itemTotal: {
          type: Number,
          required: true,
        },
        itemStatus: {
          type: String,
          enum: [
            "pending",
            "confirmed",
            "in-progress",
            "completed",
            "cancelled",
          ],
          default: "pending",
        },
        specialRequests: {
          type: String,
        },
      },
    ],

    // Order-level Pricing Information
    orderDiscount: {
      type: Number,
      default: 0,
    },
    serviceFee: {
      type: Number,
      default: 0,
    },
    subtotal: {
      type: Number,
      required: true,
    },
    totalAmount: {
      type: Number,
      required: true,
    },

    // Customer Personal Information
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

    // Billing Address (optional - WeTravel API doesn't require it)
    billingAddress: {
      street: {
        type: String,
        required: false,
      },
      city: {
        type: String,
        required: false,
      },
      state: {
        type: String,
        required: false,
      },
      zip: {
        type: String,
        required: false,
      },
      country: {
        type: String,
        required: false,
        default: "United States",
      },
    },

    // Payment Information
    payment: {
      method: {
        type: String,
        enum: ["credit-card", "paypal", "stripe", "cod", "wetravel"],
        required: true,
        default: "wetravel",
      },
      status: {
        type: String,
        enum: ["pending", "processing", "completed", "failed", "refunded"],
        default: "processing",
      },
      transactionId: {
        type: String,
      },
      cardLast4: {
        type: String,
      },
      cardBrand: {
        type: String,
      },
      paymentDate: {
        type: Date,
      },
      // WeTravel specific fields
      weTravelPaymentLink: {
        type: String,
      },
      weTravelTripUuid: {
        type: String,
      },
      weTravelTripUrl: {
        type: String,
      },
    },

    // Order Status
    orderStatus: {
      type: String,
      enum: [
        "pending",
        "confirmed",
        "preparing",
        "in-progress",
        "completed",
        "cancelled",
        "refunded",
      ],
      default: "pending",
    },

    // Overall Trip Status (aggregated from cart items)
    overallTripStatus: {
      type: String,
      enum: [
        "scheduled",
        "in-progress",
        "completed",
        "cancelled",
        "partial-completed",
      ],
      default: "scheduled",
    },

    // Delivery/Service Information
    deliveryStatus: {
      type: String,
      enum: ["pending", "confirmed", "in-progress", "completed"],
      default: "pending",
    },

    // Additional Information
    specialRequests: {
      type: String,
    },

    // Admin Notes
    adminNotes: {
      type: String,
    },

    // Timestamps for different stages
    confirmedAt: {
      type: Date,
    },
    completedAt: {
      type: Date,
    },
    cancelledAt: {
      type: Date,
    },

    // Cancellation/Refund Information
    cancellationReason: {
      type: String,
    },
    refundAmount: {
      type: Number,
    },
    refundDate: {
      type: Date,
    },

    // Tracking Information
    trackingNumber: {
      type: String,
    },

    // Email notifications
    emailNotifications: {
      orderConfirmation: {
        type: Boolean,
        default: false,
      },
      paymentConfirmation: {
        type: Boolean,
        default: false,
      },
      tripReminder: {
        type: Boolean,
        default: false,
      },
      tripCompletion: {
        type: Boolean,
        default: false,
      },
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for full name
orderSchema.virtual("fullName").get(function () {
  return `${this.personalInfo.firstName} ${this.personalInfo.lastName}`;
});

// Virtual for order status display
orderSchema.virtual("statusDisplay").get(function () {
  const statusMap = {
    pending: "Pending",
    confirmed: "Confirmed",
    preparing: "Preparing",
    "in-progress": "In Progress",
    completed: "Completed",
    cancelled: "Cancelled",
    refunded: "Refunded",
  };
  return statusMap[this.orderStatus] || this.orderStatus;
});

// Virtual for payment status display
orderSchema.virtual("paymentStatusDisplay").get(function () {
  const paymentStatusMap = {
    review: "Payment Under Review",
    processing: "Processing Payment",
    completed: "Payment Completed",
    failed: "Payment Failed",
    refunded: "Payment Refunded",
  };
  return paymentStatusMap[this.payment.status] || this.payment.status;
});

// Virtual for total items count
orderSchema.virtual("totalItems").get(function () {
  return this.cartItems ? this.cartItems.length : 0;
});

// Virtual for completed items count
orderSchema.virtual("completedItems").get(function () {
  if (!this.cartItems) return 0;
  return this.cartItems.filter(
    (item) => item.itemStatus === "completed"
  ).length;
});

// Virtual for pending items count
orderSchema.virtual("pendingItems").get(function () {
  if (!this.cartItems) return 0;
  return this.cartItems.filter((item) => item.itemStatus === "pending").length;
});

// Virtual for in-progress items count
orderSchema.virtual("inProgressItems").get(function () {
  if (!this.cartItems) return 0;
  return this.cartItems.filter(
    (item) => item.itemStatus === "in-progress"
  ).length;
});

// Virtual for overall trip status calculation
orderSchema.virtual("calculatedTripStatus").get(function () {
  if (!this.cartItems || this.cartItems.length === 0) return "scheduled";

  const completed = this.cartItems.filter(
    (item) => item.itemStatus === "completed"
  ).length;
  const cancelled = this.cartItems.filter(
    (item) => item.itemStatus === "cancelled"
  ).length;
  const inProgress = this.cartItems.filter(
    (item) => item.itemStatus === "in-progress"
  ).length;
  const total = this.cartItems.length;

  if (cancelled === total) return "cancelled";
  if (completed === total) return "completed";
  if (inProgress > 0 || completed > 0) return "in-progress";
  if (completed > 0 && completed < total) return "partial-completed";

  return "scheduled";
});

// Index for better query performance
orderSchema.index({ customerId: 1, createdAt: -1 });
orderSchema.index({ orderStatus: 1 });
orderSchema.index({ payment: { status: 1 } });
orderSchema.index({ startingDate: 1 });

// Pre-save middleware removed - order number is now generated in controller

// Instance methods for cart item management
orderSchema.methods.addCartItem = function (cartItem) {
  this.cartItems.push(cartItem);
  return this.save();
};

orderSchema.methods.removeCartItem = function (itemIndex) {
  if (itemIndex >= 0 && itemIndex < this.cartItems.length) {
    this.cartItems.splice(itemIndex, 1);
    return this.save();
  }
  throw new Error("Invalid item index");
};

orderSchema.methods.updateItemStatus = function (itemIndex, newStatus) {
  if (itemIndex >= 0 && itemIndex < this.cartItems.length) {
    this.cartItems[itemIndex].itemStatus = newStatus;
    // Update overall trip status based on all items
    this.overallTripStatus = this.calculatedTripStatus;
    return this.save();
  }
  throw new Error("Invalid item index");
};

orderSchema.methods.calculateOrderTotals = function () {
  let subtotal = 0;
  let totalDiscount = 0;

  this.cartItems.forEach((item) => {
    subtotal += item.itemSubtotal;
    totalDiscount += item.discount || 0;
  });

  this.subtotal = subtotal;
  // totalAmount includes serviceFee
  this.totalAmount = subtotal + (this.serviceFee || 0) - this.orderDiscount;

  // Don't call save() here, just calculate and set the values
  return this;
};

// Static method to generate unique order number
orderSchema.statics.generateOrderNumber = async function () {
  const maxRetries = 10;
  let retryCount = 0;

  while (retryCount < maxRetries) {
    try {
      const date = new Date();
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      const dateString = `${year}${month}${day}`;

      // Get the count of orders for today
      const todayStart = new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate()
      );
      const todayEnd = new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate() + 1
      );

      const todayOrders = await this.countDocuments({
        createdAt: { $gte: todayStart, $lt: todayEnd },
      });

      // Generate order number with sequence
      const orderCount = todayOrders + 1;
      const paddedCount = String(orderCount).padStart(4, "0");
      const orderNumber = `ZT-${dateString}-${paddedCount}`;

      // Verify the order number doesn't already exist
      const existingOrder = await this.findOne({ orderNumber });
      if (existingOrder) {
        retryCount++;
        // Add a small delay before retrying
        await new Promise((resolve) => setTimeout(resolve, 50));
        continue; // Retry with next sequence number
      }

      return orderNumber;
    } catch (error) {
      console.error("Error generating order number:", error);
      retryCount++;
      if (retryCount >= maxRetries) {
        throw new Error(
          "Failed to generate unique order number after multiple attempts"
        );
      }
      // Wait a bit before retrying
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  }

  throw new Error("Failed to generate unique order number");
};

// Static method to create order from cart items
orderSchema.statics.createFromCartItems = async function (
  customerId,
  cartItems,
  personalInfo,
  billingAddress,
  paymentInfo,
  orderNumber
) {
  const order = new this({
    customerId,
    orderNumber, // Use the order number passed from controller
    cartItems,
    personalInfo,
    billingAddress,
    payment: {
      ...paymentInfo,
      status: paymentInfo.status || "pending", // Use provided status or default to pending
    },
  });

  // Calculate totals
  order.calculateOrderTotals();

  return order.save();
};

// Plugin for pagination
orderSchema.plugin(mongoosePaginate);

module.exports = mongoose.model("Order", orderSchema);
