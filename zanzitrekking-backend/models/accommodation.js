const { Schema, model, mongo, default: mongoose } = require("mongoose");

const accommodationSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    type: {
      type: String,
      enum: ["hotel", "lodge", "resort", "camp", ""],
      default: "",
    },
    images: [
      {
        type: String,
        required: true,
      },
    ],
    price: {
      type: Number,
    },
    category: {
      type: String,
      default: "Budget",
    },
    location: {
      type: String,
    },
    contact: {
      phone: String,
      email: String,
      website: String,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);
accommodationSchema.index({
  name: "text",
});
module.exports = mongoose.model("Accommodation", accommodationSchema);
