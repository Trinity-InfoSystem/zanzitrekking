const Joi = require("joi");

// Create banner validation
const createBannerSchema = Joi.object({
  title: Joi.string().trim().min(3).max(200).required().messages({
    "string.min": "Title must be at least 3 characters",
    "string.max": "Title must not exceed 200 characters",
    "any.required": "Title is required",
  }),
  subtitle: Joi.string().trim().max(300).optional().allow("").messages({
    "string.max": "Subtitle must not exceed 300 characters",
  }),
  link: Joi.string().uri().optional().allow("").messages({
    "string.uri": "Link must be a valid URL",
  }),
  order: Joi.number().integer().min(0).default(0).messages({
    "number.min": "Order cannot be negative",
  }),
});

// Update banner validation
const updateBannerSchema = Joi.object({
  title: Joi.string().trim().min(3).max(200).optional(),
  subtitle: Joi.string().trim().max(300).optional().allow(""),
  link: Joi.string().uri().optional().allow(""),
  order: Joi.number().integer().min(0).optional(),
});

module.exports = {
  createBannerSchema,
  updateBannerSchema,
};
