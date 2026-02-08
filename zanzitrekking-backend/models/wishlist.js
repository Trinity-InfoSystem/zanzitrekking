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

const wishlistSchema = new Schema(
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
    discount: {
      type: Number,
      required: true,
      default: 0,
    },
    rating: {
      type: Number,
      default: 0,
    },
    mainImage: {
      type: String,
      required: true,
    },
    days: {
      type: Number,
      required: true,
    },
    mainDestination: {
      name: { type: String },
      location: {
        lat: { type: Number },
        lng: { type: Number },
      },
    },
    pricingType: {
      type: String,
      enum: ["yearRound", "seasonal"],
      required: true,
      default: "yearRound",
    },
    regularPrices: {
      type: pricingSchema,
    },
    seasons: [seasonSchema],
    inclusions: {
      standard: { type: [String], default: [] },
      midRange: { type: [String], default: [] },
      luxury: { type: [String], default: [] },
    },
    exclusions: {
      standard: { type: [String], default: [] },
      midRange: { type: [String], default: [] },
      luxury: { type: [String], default: [] },
    },
    selectedCategory: {
      type: String,
      enum: ["standard", "midRange", "luxury"],
      default: "standard",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("wishlist", wishlistSchema);
