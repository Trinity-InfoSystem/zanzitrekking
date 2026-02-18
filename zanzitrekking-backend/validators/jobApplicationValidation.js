const Joi = require("joi");

// Job application validation
const applyToJobSchema = Joi.object({
  customerId: Joi.string().required().messages({
    "any.required": "Customer ID is required",
  }),
  firstName: Joi.string().trim().min(1).max(100).required().messages({
    "string.min": "First name is required",
    "string.max": "First name must not exceed 100 characters",
    "any.required": "First name is required",
  }),
  lastName: Joi.string().trim().min(1).max(100).required().messages({
    "string.min": "Last name is required",
    "string.max": "Last name must not exceed 100 characters",
    "any.required": "Last name is required",
  }),
  email: Joi.string().email().required().messages({
    "string.email": "Please provide a valid email address",
    "any.required": "Email is required",
  }),
  phone: Joi.string().pattern(/^[\d\s\-\+\(\)]+$/).min(5).max(20).required().messages({
    "string.pattern.base": "Phone number contains invalid characters",
    "string.min": "Phone number is too short",
    "string.max": "Phone number is too long",
    "any.required": "Phone is required",
  }),
  additionalDetails: Joi.string().trim().max(2000).optional().messages({
    "string.max": "Additional details must not exceed 2000 characters",
  }),
  // Note: cvFile is handled by multer middleware, not in body
});

module.exports = {
  applyToJobSchema,
};
