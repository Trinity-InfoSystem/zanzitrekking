const Joi = require("joi");

// Contact form validation
const contactSchema = Joi.object({
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
  phone: Joi.string().pattern(/^[\d\s\-\+\(\)]+$/).min(5).max(20).optional().messages({
    "string.pattern.base": "Phone number contains invalid characters",
    "string.min": "Phone number is too short",
    "string.max": "Phone number is too long",
  }),
  message: Joi.string().trim().min(10).max(5000).required().messages({
    "string.min": "Message must be at least 10 characters",
    "string.max": "Message must not exceed 5000 characters",
    "any.required": "Message is required",
  }),
  subject: Joi.string().trim().max(200).allow("").optional(),
});

module.exports = {
  contactSchema,
};
