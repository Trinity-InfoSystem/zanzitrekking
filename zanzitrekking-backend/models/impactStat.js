const mongoose = require("mongoose");

const impactStatSchema = new mongoose.Schema(
  {
    value: {
      type: Number,
      required: true,
    },
    label: {
      type: String,
      required: true,
      trim: true,
    },
    sublabel: {
      type: String,
      required: true,
      trim: true,
    },
    prefix: {
      type: String,
      default: "",
    },
    suffix: {
      type: String,
      default: "",
    },
    labelStyle: {
      type: String,
      enum: ["normal", "italic"],
      default: "normal",
    },
    duration: {
      type: Number,
      default: 2000,
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

impactStatSchema.index({ order: 1 });

const ImpactStat = mongoose.model("ImpactStat", impactStatSchema);

module.exports = ImpactStat;

