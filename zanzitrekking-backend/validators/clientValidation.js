const Joi = require("joi");

// Add client validation
const addClientSchema = Joi.object({
  name: Joi.string().trim().min(1).max(100).required().messages({
    "string.min": "Name is required",
    "string.max": "Name must not exceed 100 characters",
    "any.required": "Name is required",
  }),
  logoUrl: Joi.string().uri().optional().allow(null, "").messages({
    "string.uri": "Logo URL must be a valid URL",
  }),
  website: Joi.string().uri().optional().allow("").messages({
    "string.uri": "Website must be a valid URL",
  }),
  order: Joi.number().integer().min(0).default(0).messages({
    "number.min": "Order cannot be negative",
  }),
});

// Update client validation
const updateClientSchema = Joi.object({
  name: Joi.string().trim().min(1).max(100).optional(),
  logoUrl: Joi.string().uri().optional().allow(null, ""),
  website: Joi.string().uri().optional().allow(""),
  order: Joi.number().integer().min(0).optional(),
});

// Toggle client status
const toggleClientStatusSchema = Joi.object({
  isActive: Joi.boolean().required().messages({
    "any.required": "isActive status is required",
  }),
});

// Delete multiple clients
const deleteClientsSchema = Joi.object({
  clientIds: Joi.array().items(Joi.string()).min(1).required().messages({
    "array.min": "At least one client ID is required",
    "any.required": "Client IDs are required",
  }),
});

module.exports = {
  addClientSchema,
  updateClientSchema,
  toggleClientStatusSchema,
  deleteClientsSchema,
};
