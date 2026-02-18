const Joi = require("joi");

// Update review status
const updateReviewStatusSchema = Joi.object({
  status: Joi.string().valid("pending", "approved", "rejected").required().messages({
    "any.only": "Status must be one of: pending, approved, rejected",
    "any.required": "Status is required",
  }),
  rejectionReason: Joi.string().trim().max(500).when("status", {
    is: "rejected",
    then: Joi.optional(),
    otherwise: Joi.optional(),
  }),
});

// Bulk update reviews
const bulkUpdateReviewsSchema = Joi.object({
  reviewIds: Joi.array().items(Joi.string()).min(1).required().messages({
    "array.min": "At least one review ID is required",
    "any.required": "Review IDs are required",
  }),
  status: Joi.string().valid("pending", "approved", "rejected").required().messages({
    "any.only": "Status must be one of: pending, approved, rejected",
    "any.required": "Status is required",
  }),
  rejectionReason: Joi.string().trim().max(500).optional(),
});

// Bulk delete reviews
const bulkDeleteReviewsSchema = Joi.object({
  reviewIds: Joi.array().items(Joi.string()).min(1).required().messages({
    "array.min": "At least one review ID is required",
    "any.required": "Review IDs are required",
  }),
});

module.exports = {
  updateReviewStatusSchema,
  bulkUpdateReviewsSchema,
  bulkDeleteReviewsSchema,
};
