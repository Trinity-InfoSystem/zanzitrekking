const Joi = require("joi");

// Add category validation
const addCategorySchema = Joi.object({
  name: Joi.string().trim().min(1).max(100).required().messages({
    "string.min": "Category name is required",
    "string.max": "Category name must not exceed 100 characters",
    "any.required": "Category name is required",
  }),
  slug: Joi.string()
    .trim()
    .lowercase()
    .pattern(/^[a-z0-9-]+$/)
    .max(100)
    .optional()
    .messages({
      "string.pattern.base": "Slug can only contain lowercase letters, numbers, and hyphens",
      "string.max": "Slug must not exceed 100 characters",
    }),
  description: Joi.string().trim().max(500).optional().allow("").messages({
    "string.max": "Description must not exceed 500 characters",
  }),
});

// Update category validation
const updateCategorySchema = Joi.object({
  name: Joi.string().trim().min(1).max(100).optional(),
  slug: Joi.string()
    .trim()
    .lowercase()
    .pattern(/^[a-z0-9-]+$/)
    .max(100)
    .optional(),
  description: Joi.string().trim().max(500).optional().allow(""),
});

// Delete multiple categories
const deleteCategoriesSchema = Joi.object({
  categoryIds: Joi.array().items(Joi.string()).min(1).required().messages({
    "array.min": "At least one category ID is required",
    "any.required": "Category IDs are required",
  }),
});

module.exports = {
  addCategorySchema,
  updateCategorySchema,
  deleteCategoriesSchema,
};
