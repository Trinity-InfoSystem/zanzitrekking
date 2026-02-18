const Joi = require("joi");

// Create review validation
const createReviewSchema = Joi.object({
  customerId: Joi.string().required().messages({
    "any.required": "Customer ID is required",
  }),
  tripId: Joi.string().required().messages({
    "any.required": "Trip ID is required",
  }),
  orderId: Joi.string().optional(),
  rating: Joi.number().integer().min(1).max(5).required().messages({
    "number.min": "Rating must be at least 1",
    "number.max": "Rating cannot exceed 5",
    "any.required": "Rating is required",
  }),
  title: Joi.string().trim().min(3).max(200).required().messages({
    "string.min": "Title must be at least 3 characters",
    "string.max": "Title must not exceed 200 characters",
    "any.required": "Title is required",
  }),
  comment: Joi.string().trim().min(10).max(2000).required().messages({
    "string.min": "Comment must be at least 10 characters",
    "string.max": "Comment must not exceed 2000 characters",
    "any.required": "Comment is required",
  }),
  images: Joi.array().items(Joi.string().uri()).optional(),
});

// Update review validation
const updateReviewSchema = Joi.object({
  rating: Joi.number().integer().min(1).max(5).optional().messages({
    "number.min": "Rating must be at least 1",
    "number.max": "Rating cannot exceed 5",
  }),
  title: Joi.string().trim().min(3).max(200).optional().messages({
    "string.min": "Title must be at least 3 characters",
    "string.max": "Title must not exceed 200 characters",
  }),
  comment: Joi.string().trim().min(10).max(2000).optional().messages({
    "string.min": "Comment must be at least 10 characters",
    "string.max": "Comment must not exceed 2000 characters",
  }),
  images: Joi.array().items(Joi.string().uri()).optional(),
});

module.exports = {
  createReviewSchema,
  updateReviewSchema,
};
