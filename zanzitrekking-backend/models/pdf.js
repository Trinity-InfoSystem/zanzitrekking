const mongoose = require("mongoose");

const pdfSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
      enum: [
        "Price List Mountain Climbing",
        "Price List Short Safaris",
        "Price List Lodge Safaris",
        "Price List Camping Safaris",
        "Terms and Conditions Zanzi Trekking and Safaris",
        "Pictures Price Categories",
      ],
    },
    path: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Pdf", pdfSchema);
