const mongoose = require("mongoose");

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

// Define the main trip schema
const tripSchema = new mongoose.Schema(
  {
    mainTitle: {
      type: String,
      required: true,
    },
    slug: { type: String, unique: true, index: true },
    overview: {
      type: String,
    },
    description: {
      type: String,
    },
    mainImage: {
      type: String,
    },
    mainVideo: {
      type: String,
    },
    mainDestination: [
      {
        name: { type: String },
        location: {
          lat: { type: Number },
          lng: { type: Number },
        },
      },
    ],
    startPoint: {
      name: { type: String },
      location: {
        lat: { type: Number },
        lng: { type: Number },
      },
    },
    endPoint: {
      name: { type: String },
      location: {
        lat: { type: Number },
        lng: { type: Number },
      },
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
    },
    discount: {
      type: Number,
    },
    rating: {
      type: Number,
      default: 0,
    },
    reviews: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Review",
      },
    ],
    // Pricing options
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
    // Array of days with details
    days: [
      {
        title: {
          type: String,
          required: true,
        },
        overview: {
          type: String,
        },
        image: {
          type: String,
        },
        mainDestination: {
          name: { type: String },
          location: {
            lat: { type: Number },
            lng: { type: Number },
          },
        },
        accommodation: [
          {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Accommodation",
          },
        ],
        meals: {
          type: [String],
        },
      },
    ],
    seo: {
      allowSearch: {
        type: String,
        enum: ["yes", "no"],
        default: "yes",
      },
      general: {
        title: { type: String},
        description: { type: String},
        image: { type: String },
      },
      openGraph: {
        title: { type: String },
        description: { type: String },
        image: { type: String },
      },
      twitter: {
        title: { type: String },
        description: { type: String },
        image: { type: String},
      },
    },
  },
  { timestamps: true }
);

tripSchema.index({
  mainTitle: "text",
});

// Create the Trip model
const Trip = mongoose.model("Trip", tripSchema);

module.exports = Trip;
