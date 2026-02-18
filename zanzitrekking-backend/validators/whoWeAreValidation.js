const Joi = require("joi");

// Add Who We Are validation
const addWhoWeAreSchema = Joi.object({
  content: Joi.string().trim().min(100).required().messages({
    "string.min": "Content must be at least 100 characters",
    "any.required": "Content is required",
  }),
  mission: Joi.string().trim().max(2000).optional().allow(""),
  vision: Joi.string().trim().max(2000).optional().allow(""),
  values: Joi.array().items(Joi.string().trim().max(500)).optional(),
  statistics: Joi.array()
    .items(
      Joi.object({
        label: Joi.string().trim().max(100).required(),
        value: Joi.number().min(0).required(),
        icon: Joi.string().optional(),
      })
    )
    .optional(),
});

module.exports = {
  addWhoWeAreSchema,
};
