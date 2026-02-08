const mongoose = require("mongoose");

const clientSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    logo: {
      type: String,
      default: null,
    },
    logoUrl: {
      type: String,
      default: null,
    },
    website: {
      type: String,
      trim: true,
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

clientSchema.index({ name: "text" });
clientSchema.index({ order: 1 });

const Client = mongoose.model("Client", clientSchema);

module.exports = Client;

