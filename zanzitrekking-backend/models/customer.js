const { Schema, model, mongo, default: mongoose } = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");

const customerSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      select: false,
    },
    method: {
      type: String,
      required: true,
      enum: ["manual", "google", "facebook"], // Add allowed methods
    },
    role: {
      type: String,
      default: "customer",
    },
    assignedAdmin: {
      type: Schema.Types.ObjectId,
      ref: "Admin",
    },
    socialId: {
      // For social login IDs
      type: String,
      select: false,
    },
    refreshToken: {
      // For refresh token
      type: String,
      select: false,
    },
    resetPasswordOTP: {
      // For password reset OTP
      type: String,
      select: false,
    },
    resetPasswordExpires: {
      // For password reset OTP expiry
      type: Date,
      select: false,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Add indexes for frequently queried fields
customerSchema.index({ email: 1 }, { unique: true });
customerSchema.index({ assignedAdmin: 1 });
customerSchema.index({ createdAt: -1 });

customerSchema.plugin(mongoosePaginate);

customerSchema.virtual("conversationId").get(function () {
  return `customer-${this._id}`;
});

module.exports = mongoose.model("Customer", customerSchema);
