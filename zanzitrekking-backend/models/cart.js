const { Schema, default: mongoose } = require("mongoose");

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

const cartSchema = new Schema(
  {
    userId: {
      type: Schema.ObjectId,
      required: true,
    },
    tripId: {
      type: Schema.ObjectId,
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
    mainImageThumbnail: {
      type: String,
    },
    startingDate: {
      type: Date,
      required: true,
    },
    travelersNumber: {
      type: Number,
      required: true,
      default: 1,
    },
    pricingType: {
      type: String,
      enum: ["yearRound", "seasonal"],
      required: true,
      default: "yearRound",
    },
    discount: {
      type: Number,
      required: true,
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
    pricePerPerson: {
      type: Number,
      default: 0,
    },
    totalPrice: {
      type: Number,
      default: 0,
    },
    seasonName: {
      type: String,
      default: "Year Round",
    },
    childrenCount: {
      type: Number,
      default: 0,
    },
    childrenAges: {
      type: [Number],
      default: [],
    },
  },
  { timestamps: true }
);
module.exports = mongoose.model("cart", cartSchema);
