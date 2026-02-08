const mongoose = require("mongoose");

const whoWeAreSchema = new mongoose.Schema(
  {
    mainTitle: {
      type: String,
      required: true,
      trim: true,
    },
    paragraph: {
      type: String,
      required: true,
      trim: true,
    },
    image1: {
      type: String,
      required: true,
      trim: true,
    },
    image2: {
      type: String,
      required: true,
      trim: true,
    },
    image3: {
      type: String,
      required: true,
      trim: true,
    },
    identifier: {
      type: String,
      default: "single_instance",
      unique: true,
    },
  },
  { timestamps: true }
);

const WhoWeAre = mongoose.model("WhoWeAre", whoWeAreSchema);

module.exports = WhoWeAre;
