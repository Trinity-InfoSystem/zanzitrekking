const Joi = require("joi");

// Add job validation
const addJobSchema = Joi.object({
  title: Joi.string().trim().min(3).max(200).required().messages({
    "string.min": "Title must be at least 3 characters",
    "string.max": "Title must not exceed 200 characters",
    "any.required": "Title is required",
  }),
  contentType: Joi.string().valid("html", "structured").default("structured"),
  htmlContent: Joi.string().min(100).when("contentType", {
    is: "html",
    then: Joi.required().messages({
      "any.required": "HTML content is required for HTML content type",
      "string.min": "HTML content must be at least 100 characters",
    }),
    otherwise: Joi.optional(),
  }),
  description: Joi.string().trim().min(50).when("contentType", {
    is: "structured",
    then: Joi.required().messages({
      "any.required": "Description is required for structured content",
      "string.min": "Description must be at least 50 characters",
    }),
    otherwise: Joi.optional(),
  }),
  location: Joi.string().trim().max(100).optional().allow(""),
  employmentType: Joi.string()
    .valid("full-time", "part-time", "contract", "internship", "freelance")
    .default("full-time"),
  salaryRange: Joi.string().trim().max(100).optional().allow(""),
  applicationDeadline: Joi.string().isoDate().optional().messages({
    "string.isoDate": "Application deadline must be a valid date",
  }),
  requirements: Joi.alternatives()
    .try(
      Joi.string(), // Comma-separated string
      Joi.array().items(Joi.string().trim().max(500)) // Array
    )
    .optional(),
  isActive: Joi.boolean().default(true),
});

// Update job validation
const updateJobSchema = Joi.object({
  title: Joi.string().trim().min(3).max(200).optional(),
  contentType: Joi.string().valid("html", "structured").optional(),
  htmlContent: Joi.string().min(100).optional(),
  description: Joi.string().trim().min(50).optional(),
  location: Joi.string().trim().max(100).optional().allow(""),
  employmentType: Joi.string()
    .valid("full-time", "part-time", "contract", "internship", "freelance")
    .optional(),
  salaryRange: Joi.string().trim().max(100).optional().allow(""),
  applicationDeadline: Joi.string().isoDate().optional(),
  requirements: Joi.alternatives()
    .try(
      Joi.string(),
      Joi.array().items(Joi.string().trim().max(500))
    )
    .optional(),
  isActive: Joi.boolean().optional(),
});

// Toggle job status
const toggleJobStatusSchema = Joi.object({
  isActive: Joi.boolean().required().messages({
    "any.required": "isActive status is required",
  }),
});

module.exports = {
  addJobSchema,
  updateJobSchema,
  toggleJobStatusSchema,
};
