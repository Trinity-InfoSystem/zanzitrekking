const Joi = require("joi");

// Add to cart validation
const addToCartSchema = Joi.object({
  userId: Joi.string().required().messages({
    "any.required": "User ID is required",
  }),
  tripId: Joi.string().required().messages({
    "any.required": "Trip ID is required",
  }),
  startingDate: Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/).required().messages({
    "string.pattern.base": "Starting date must be in YYYY-MM-DD format",
    "any.required": "Starting date is required",
  }),
  mainTitle: Joi.string().optional(),
  mainImage: Joi.string().optional(),
  travelersNumber: Joi.number().integer().min(1).max(100).required().messages({
    "number.min": "Travelers number must be at least 1",
    "number.max": "Travelers number cannot exceed 100",
    "any.required": "Travelers number is required",
  }),
  discount: Joi.number().min(0).max(100).default(0).messages({
    "number.min": "Discount cannot be negative",
    "number.max": "Discount cannot exceed 100",
  }),
  selectedCategory: Joi.string().valid("standard", "midRange", "luxury").default("standard"),
});

// Update cart trip validation
const updateCartTripSchema = Joi.object({
  userId: Joi.string().required().messages({
    "any.required": "User ID is required",
  }),
  cartId: Joi.string().required().messages({
    "any.required": "Cart ID is required",
  }),
  travelersNumber: Joi.number().integer().min(1).max(100).optional().messages({
    "number.min": "Travelers number must be at least 1",
    "number.max": "Travelers number cannot exceed 100",
  }),
  startingDate: Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/).optional().messages({
    "string.pattern.base": "Starting date must be in YYYY-MM-DD format",
  }),
  discount: Joi.number().min(0).max(100).optional().messages({
    "number.min": "Discount cannot be negative",
    "number.max": "Discount cannot exceed 100",
  }),
  selectedCategory: Joi.string().valid("standard", "midRange", "luxury").optional(),
  childrenCount: Joi.number().integer().min(0).max(50).optional().messages({
    "number.min": "Children count cannot be negative",
    "number.max": "Children count cannot exceed 50",
  }),
  childrenAges: Joi.array().items(Joi.number().integer().min(0).max(17)).optional().messages({
    "array.base": "Children ages must be an array",
  }),
});

// Add to wishlist validation
const addToWishlistSchema = Joi.object({
  userId: Joi.string().required().messages({
    "any.required": "User ID is required",
  }),
  tripId: Joi.string().required().messages({
    "any.required": "Trip ID is required",
  }),
});

module.exports = {
  addToCartSchema,
  updateCartTripSchema,
  addToWishlistSchema,
};
