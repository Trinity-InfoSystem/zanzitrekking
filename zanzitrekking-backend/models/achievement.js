const mongoose = require("mongoose");

const achievementSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      required: true,
      trim: true,
    },
    image: {
      type: String,
      default: null,
    },
    imageThumbnail: {
      type: String,
      default: null,
    },
    imageUrl: {
      type: String,
      default: null,
    },
    icon: {
      type: String,
      default: null,
    },
    color: {
      type: String,
      default: "bg-primary-50",
    },
    iconColor: {
      type: String,
      default: "text-primary-600",
    },
    type: {
      type: String,
      enum: ["certification", "award"],
      required: true,
    },
    order: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

achievementSchema.index({ name: "text", fullName: "text" });
achievementSchema.index({ type: 1, order: 1 });

const Achievement = mongoose.model("Achievement", achievementSchema);

module.exports = Achievement;

