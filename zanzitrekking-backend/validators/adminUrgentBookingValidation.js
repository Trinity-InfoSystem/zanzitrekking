const Joi = require("joi");

// Update urgent booking request status
const updateRequestStatusSchema = Joi.object({
  status: Joi.string().valid("pending", "approved", "rejected").required().messages({
    "any.only": "Status must be one of: pending, approved, rejected",
    "any.required": "Status is required",
  }),
  adminNotes: Joi.string().trim().max(1000).optional().messages({
    "string.max": "Admin notes must not exceed 1000 characters",
  }),
  rejectedReason: Joi.string().trim().max(500).when("status", {
    is: "rejected",
    then: Joi.optional(),
    otherwise: Joi.optional(),
  }),
});

// Bulk update urgent booking requests
const bulkUpdateStatusSchema = Joi.object({
  requestIds: Joi.array().items(Joi.string()).min(1).required().messages({
    "array.min": "At least one request ID is required",
    "any.required": "Request IDs are required",
  }),
  status: Joi.string().valid("pending", "approved", "rejected").required().messages({
    "any.only": "Status must be one of: pending, approved, rejected",
    "any.required": "Status is required",
  }),
  adminNotes: Joi.string().trim().max(1000).optional(),
  rejectedReason: Joi.string().trim().max(500).optional(),
});

module.exports = {
  updateRequestStatusSchema,
  bulkUpdateStatusSchema,
};
