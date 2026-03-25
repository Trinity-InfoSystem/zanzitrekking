const { Schema, model } = require("mongoose");

const bannerItemSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  image: { type: String, required: false },
  imageThumbnail: { type: String, required: false },
  video: { type: String, required: false },
});

const bannerSchema = new Schema(
  {
    sharedVideo: { type: String, required: false }, // Single video for all banners
    banners: [bannerItemSchema],
  },
  { timestamps: true }
);

// Prevent multiple banner documents (Singleton pattern)
bannerSchema.index({}, { unique: true });

module.exports = model("Banner", bannerSchema);
