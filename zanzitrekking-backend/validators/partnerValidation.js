const Joi = require("joi");

// Add partner validation
const addPartnerSchema = Joi.object({
  name: Joi.string().trim().min(1).max(100).required().messages({
    "string.min": "Name is required",
    "string.max": "Name must not exceed 100 characters",
    "any.required": "Name is required",
  }),
  badge: Joi.string().trim().max(50).optional(),
  color: Joi.string().trim().max(20).optional(),
  rating: Joi.number().min(0).max(5).default(0).messages({
    "number.min": "Rating cannot be negative",
    "number.max": "Rating cannot exceed 5",
  }),
  reviews: Joi.number().integer().min(0).default(0).messages({
    "number.min": "Reviews count cannot be negative",
  }),
  website: Joi.string().uri().optional().allow("").messages({
    "string.uri": "Website must be a valid URL",
  }),
  description: Joi.string().trim().max(500).optional().allow("").messages({
    "string.max": "Description must not exceed 500 characters",
  }),
  order: Joi.number().integer().min(0).default(0).messages({
    "number.min": "Order cannot be negative",
  }),
});

// Update partner validation
const updatePartnerSchema = Joi.object({
  name: Joi.string().trim().min(1).max(100).optional(),
  badge: Joi.string().trim().max(50).optional(),
  color: Joi.string().trim().max(20).optional(),
  rating: Joi.number().min(0).max(5).optional(),
  reviews: Joi.number().integer().min(0).optional(),
  website: Joi.string().uri().optional().allow(""),
  description: Joi.string().trim().max(500).optional().allow(""),
  order: Joi.number().integer().min(0).optional(),
});

// Toggle partner status
const togglePartnerStatusSchema = Joi.object({
  isActive: Joi.boolean().required().messages({
    "any.required": "isActive status is required",
  }),
});

// Delete multiple partners
const deletePartnersSchema = Joi.object({
  partnerIds: Joi.array().items(Joi.string()).min(1).required().messages({
    "array.min": "At least one partner ID is required",
    "any.required": "Partner IDs are required",
  }),
});

module.exports = {
  addPartnerSchema,
  updatePartnerSchema,
  togglePartnerStatusSchema,
  deletePartnersSchema,
};
