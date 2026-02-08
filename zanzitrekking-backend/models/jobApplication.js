const { Schema, model, mongo, default: mongoose } = require("mongoose");

const jobApplicationSchema = new Schema(
  {
    jobId: {
      type: Schema.Types.ObjectId,
      ref: "Job",
      required: true,
    },
    customerId: {
      type: Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },
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
    additionalDetails: {
      type: String,
    },
    cvFile: {
      type: String,
      required: true,
    },
    cvOriginalName: {
      type: String,
    },
    status: {
      type: String,
      enum: ["pending", "reviewed", "accepted", "rejected"],
      default: "pending",
    },
    reviewedBy: {
      type: Schema.Types.ObjectId,
      ref: "Admin",
    },
    reviewedAt: {
      type: Date,
    },
    adminNotes: {
      type: String,
    },
    rejectedReason: {
      type: String,
    },
  },
  { timestamps: true }
);

jobApplicationSchema.index({ jobId: 1 });
jobApplicationSchema.index({ customerId: 1 });
jobApplicationSchema.index({ email: 1 });

module.exports = mongoose.model("JobApplication", jobApplicationSchema);
