const Joi = require("joi");

// Treat empty strings as "not provided" for optional fields
const optionalString = Joi.string().optional().allow("").empty("");

// Add job validation
const addJobSchema = Joi.object({
  title: Joi.string().trim().min(3).max(200).required().messages({
    "string.min": "Title must be at least 3 characters",
    "string.max": "Title must not exceed 200 characters",
    "any.required": "Title is required",
  }),
  contentType: Joi.string().valid("html", "structured").default("structured"),
  htmlContent: optionalString.when("contentType", {
    is: "html",
    then: Joi.string().min(100).required().messages({
      "any.required": "HTML content is required for HTML content type",
      "string.min": "HTML content must be at least 100 characters",
    }),
    otherwise: optionalString,
  }),
  description: optionalString.trim().when("contentType", {
    is: "structured",
    then: Joi.string().trim().min(50).required().messages({
      "any.required": "Description is required for structured content",
      "string.min": "Description must be at least 50 characters",
    }),
    otherwise: optionalString,
  }),
  location: Joi.string().trim().max(100).optional().allow(""),
  employmentType: Joi.string()
    .valid("full-time", "part-time", "contract", "internship", "freelance")
    .default("full-time"),
  salaryRange: Joi.string().trim().max(100).optional().allow(""),
  applicationDeadline: Joi.alternatives()
    .try(Joi.string().isoDate(), Joi.date().iso())
    .optional()
    .allow(null, "")
    .empty("")
    .messages({
      "string.isoDate": "Application deadline must be a valid date",
      "date.format": "Application deadline must be a valid date",
    }),
  requirements: Joi.alternatives()
    .try(
      Joi.string(), // Comma-separated string
      Joi.array().items(Joi.string().trim().min(1).max(500)) // Array
    )
    .optional(),
  isActive: Joi.boolean().default(true),
});

// Update job validation
const updateJobSchema = Joi.object({
  title: Joi.string().trim().min(3).max(200).optional(),
  contentType: Joi.string().valid("html", "structured").optional(),
  htmlContent: optionalString.min(100),
  description: optionalString.trim().min(50),
  location: Joi.string().trim().max(100).optional().allow(""),
  employmentType: Joi.string()
    .valid("full-time", "part-time", "contract", "internship", "freelance")
    .optional(),
  salaryRange: Joi.string().trim().max(100).optional().allow(""),
  applicationDeadline: Joi.alternatives()
    .try(Joi.string().isoDate(), Joi.date().iso())
    .optional()
    .allow(null, "")
    .empty(""),
  requirements: Joi.alternatives()
    .try(
      Joi.string(),
      Joi.array().items(Joi.string().trim().min(1).max(500))
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
