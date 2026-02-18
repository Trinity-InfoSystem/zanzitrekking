const Joi = require("joi");

// Add achievement validation
const addAchievementSchema = Joi.object({
  title: Joi.string().trim().min(3).max(200).required().messages({
    "string.min": "Title must be at least 3 characters",
    "string.max": "Title must not exceed 200 characters",
    "any.required": "Title is required",
  }),
  description: Joi.string().trim().max(500).optional().allow("").messages({
    "string.max": "Description must not exceed 500 characters",
  }),
  date: Joi.string().isoDate().optional().messages({
    "string.isoDate": "Date must be a valid date",
  }),
});

// Update achievement validation
const updateAchievementSchema = Joi.object({
  title: Joi.string().trim().min(3).max(200).optional(),
  description: Joi.string().trim().max(500).optional().allow(""),
  date: Joi.string().isoDate().optional(),
});

// Toggle achievement status
const toggleAchievementStatusSchema = Joi.object({
  isActive: Joi.boolean().required().messages({
    "any.required": "isActive status is required",
  }),
});

// Delete multiple achievements
const deleteAchievementsSchema = Joi.object({
  achievementIds: Joi.array().items(Joi.string()).min(1).required().messages({
    "array.min": "At least one achievement ID is required",
    "any.required": "Achievement IDs are required",
  }),
});

module.exports = {
  addAchievementSchema,
  updateAchievementSchema,
  toggleAchievementStatusSchema,
  deleteAchievementsSchema,
};
