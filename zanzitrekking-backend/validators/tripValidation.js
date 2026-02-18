const Joi = require("joi");

// Location schema (reusable)
const locationSchema = Joi.object({
  name: Joi.string().trim().max(200).optional(),
  location: Joi.object({
    lat: Joi.number().min(-90).max(90).optional(),
    lng: Joi.number().min(-180).max(180).optional(),
  }).optional(),
}).optional();

// Pricing schema (reusable)
const pricingSchema = Joi.object({
  standard: Joi.number().min(0).optional(),
  midRange: Joi.number().min(0).optional(),
  luxury: Joi.number().min(0).optional(),
}).optional();

// Season schema
const seasonSchema = Joi.object({
  name: Joi.string().trim().max(100).required(),
  startDate: Joi.string().isoDate().required(),
  endDate: Joi.string().isoDate().required(),
  rates: pricingSchema.required(),
}).optional();

// Day data schema
const dayDataSchema = Joi.object({
  title: Joi.string().trim().max(200).optional(),
  overview: Joi.string().trim().max(5000).optional(),
  mainDestination: locationSchema,
  accommodation: Joi.array().items(Joi.string()).optional(),
  meals: Joi.array().items(Joi.string()).optional(),
}).optional();

// Inclusions/exclusions schema
const categoryInclusionsSchema = Joi.object({
  standard: Joi.array().items(Joi.string().trim().max(500)).default([]),
  midRange: Joi.array().items(Joi.string().trim().max(500)).default([]),
  luxury: Joi.array().items(Joi.string().trim().max(500)).default([]),
}).default({
  standard: [],
  midRange: [],
  luxury: [],
});

// Add trip validation
const addTripSchema = Joi.object({
  mainTitle: Joi.string().trim().min(3).max(200).required().messages({
    "string.min": "Main title must be at least 3 characters",
    "string.max": "Main title must not exceed 200 characters",
    "any.required": "Main title is required",
  }),
  overview: Joi.string().trim().min(10).max(1000).optional().messages({
    "string.min": "Overview must be at least 10 characters",
    "string.max": "Overview must not exceed 1000 characters",
  }),
  description: Joi.string().trim().min(50).max(10000).optional().messages({
    "string.min": "Description must be at least 50 characters",
    "string.max": "Description must not exceed 10000 characters",
  }),
  mainDestination: Joi.alternatives()
    .try(
      Joi.string(), // JSON string
      Joi.array().items(locationSchema) // Array
    )
    .optional(),
  startPoint: Joi.alternatives()
    .try(
      Joi.string(), // JSON string
      locationSchema // Object
    )
    .optional(),
  endPoint: Joi.alternatives()
    .try(
      Joi.string(), // JSON string
      locationSchema // Object
    )
    .optional(),
  pricingType: Joi.string().valid("yearRound", "seasonal").required().messages({
    "any.only": "Pricing type must be either 'yearRound' or 'seasonal'",
    "any.required": "Pricing type is required",
  }),
  regularPrices: Joi.alternatives()
    .try(
      Joi.string(), // JSON string
      pricingSchema // Object
    )
    .when("pricingType", {
      is: "yearRound",
      then: Joi.required().messages({
        "any.required": "Regular prices are required for year-round pricing",
      }),
      otherwise: Joi.optional(),
    }),
  seasons: Joi.alternatives()
    .try(
      Joi.string(), // JSON string
      Joi.array().items(seasonSchema) // Array
    )
    .when("pricingType", {
      is: "seasonal",
      then: Joi.required().messages({
        "any.required": "Seasons are required for seasonal pricing",
      }),
      otherwise: Joi.optional(),
    }),
  category: Joi.string().required().messages({
    "any.required": "Category is required",
  }),
  daysData: Joi.alternatives()
    .try(
      Joi.string(), // JSON string
      Joi.array().items(dayDataSchema).min(1) // Array
    )
    .optional(),
  daysCount: Joi.number().integer().min(1).max(365).optional().messages({
    "number.min": "Days count must be at least 1",
    "number.max": "Days count cannot exceed 365",
  }),
  discount: Joi.number().min(0).max(100).default(0).messages({
    "number.min": "Discount cannot be negative",
    "number.max": "Discount cannot exceed 100",
  }),
  inclusions: Joi.alternatives()
    .try(
      Joi.string(), // JSON string
      categoryInclusionsSchema // Object
    )
    .optional(),
  exclusions: Joi.alternatives()
    .try(
      Joi.string(), // JSON string
      categoryInclusionsSchema // Object
    )
    .optional(),
});

// Update trip validation (same as add, but all fields optional)
const updateTripSchema = Joi.object({
  mainTitle: Joi.string().trim().min(3).max(200).optional().messages({
    "string.min": "Main title must be at least 3 characters",
    "string.max": "Main title must not exceed 200 characters",
  }),
  overview: Joi.string().trim().min(10).max(1000).optional().messages({
    "string.min": "Overview must be at least 10 characters",
    "string.max": "Overview must not exceed 1000 characters",
  }),
  description: Joi.string().trim().min(50).max(10000).optional().messages({
    "string.min": "Description must be at least 50 characters",
    "string.max": "Description must not exceed 10000 characters",
  }),
  mainDestination: Joi.alternatives()
    .try(
      Joi.string(),
      Joi.array().items(locationSchema)
    )
    .optional(),
  startPoint: Joi.alternatives()
    .try(
      Joi.string(),
      locationSchema
    )
    .optional(),
  endPoint: Joi.alternatives()
    .try(
      Joi.string(),
      locationSchema
    )
    .optional(),
  pricingType: Joi.string().valid("yearRound", "seasonal").optional(),
  regularPrices: Joi.alternatives()
    .try(
      Joi.string(),
      pricingSchema
    )
    .optional(),
  seasons: Joi.alternatives()
    .try(
      Joi.string(),
      Joi.array().items(seasonSchema)
    )
    .optional(),
  category: Joi.string().optional(),
  daysData: Joi.alternatives()
    .try(
      Joi.string(),
      Joi.array().items(dayDataSchema)
    )
    .optional(),
  daysCount: Joi.number().integer().min(1).max(365).optional(),
  discount: Joi.number().min(0).max(100).optional(),
  inclusions: Joi.alternatives()
    .try(
      Joi.string(),
      categoryInclusionsSchema
    )
    .optional(),
  exclusions: Joi.alternatives()
    .try(
      Joi.string(),
      categoryInclusionsSchema
    )
    .optional(),
});

// Delete multiple trips
const deleteTripsSchema = Joi.object({
  tripIds: Joi.array().items(Joi.string()).min(1).required().messages({
    "array.min": "At least one trip ID is required",
    "any.required": "Trip IDs are required",
  }),
});

module.exports = {
  addTripSchema,
  updateTripSchema,
  deleteTripsSchema,
};
