const Joi = require("joi");

// Social links schema
const socialLinksSchema = Joi.object({
  facebook: Joi.string().uri().optional().allow(null, ""),
  instagram: Joi.string().uri().optional().allow(null, ""),
  twitter: Joi.string().uri().optional().allow(null, ""),
}).optional();

// Add blog post validation
const addBlogPostSchema = Joi.object({
  mainTitle: Joi.string().trim().min(3).max(200).required().messages({
    "string.min": "Main title must be at least 3 characters",
    "string.max": "Main title must not exceed 200 characters",
    "any.required": "Main title is required",
  }),
  creatorName: Joi.string().trim().min(1).max(100).required().messages({
    "string.min": "Creator name is required",
    "string.max": "Creator name must not exceed 100 characters",
    "any.required": "Creator name is required",
  }),
  creatorBio: Joi.string().trim().max(500).optional().messages({
    "string.max": "Creator bio must not exceed 500 characters",
  }),
  contentType: Joi.string().valid("html", "structured").default("structured"),
  category: Joi.string().allow(null, "").optional(),
  creatorSocialLinks: socialLinksSchema,
  // HTML content
  htmlContent: Joi.string().min(100).when("contentType", {
    is: "html",
    then: Joi.required().messages({
      "any.required": "HTML content is required for HTML content type",
      "string.min": "HTML content must be at least 100 characters",
    }),
    otherwise: Joi.optional(),
  }),
  // Structured content
  mainParagraph: Joi.string().trim().min(50).when("contentType", {
    is: "structured",
    then: Joi.required().messages({
      "any.required": "Main paragraph is required for structured content",
      "string.min": "Main paragraph must be at least 50 characters",
    }),
    otherwise: Joi.optional(),
  }),
  secondParagraph: Joi.string().trim().max(5000).optional(),
  thirdParagraph: Joi.string().trim().max(5000).optional(),
  secondTitle: Joi.string().trim().max(200).optional(),
  fourthParagraph: Joi.string().trim().max(5000).optional(),
  proverb: Joi.string().trim().max(500).optional(),
  proverbWriter: Joi.string().trim().max(100).optional(),
  relatedImages: Joi.object({
    title: Joi.string().trim().max(200).optional().allow(null),
    paragraph: Joi.string().trim().max(2000).optional().allow(null),
  }).optional(),
});

// Update blog post validation
const updateBlogPostSchema = Joi.object({
  mainTitle: Joi.string().trim().min(3).max(200).optional(),
  creatorName: Joi.string().trim().min(1).max(100).optional(),
  creatorBio: Joi.string().trim().max(500).optional(),
  contentType: Joi.string().valid("html", "structured").optional(),
  category: Joi.string().allow(null, "").optional(),
  creatorSocialLinks: socialLinksSchema,
  htmlContent: Joi.string().min(100).optional(),
  mainParagraph: Joi.string().trim().min(50).optional(),
  secondParagraph: Joi.string().trim().max(5000).optional(),
  thirdParagraph: Joi.string().trim().max(5000).optional(),
  secondTitle: Joi.string().trim().max(200).optional(),
  fourthParagraph: Joi.string().trim().max(5000).optional(),
  proverb: Joi.string().trim().max(500).optional(),
  proverbWriter: Joi.string().trim().max(100).optional(),
  relatedImages: Joi.object({
    title: Joi.string().trim().max(200).optional().allow(null),
    paragraph: Joi.string().trim().max(2000).optional().allow(null),
  }).optional(),
});

// Update blog post category
const updateBlogPostCategorySchema = Joi.object({
  category: Joi.string().allow(null, "").required().messages({
    "any.required": "Category is required",
  }),
});

// Add comment validation
const addCommentSchema = Joi.object({
  customerId: Joi.string().required().messages({
    "any.required": "Customer ID is required",
  }),
  comment: Joi.string().trim().min(3).max(1000).required().messages({
    "string.min": "Comment must be at least 3 characters",
    "string.max": "Comment must not exceed 1000 characters",
    "any.required": "Comment is required",
  }),
});

// Update comment validation
const updateCommentSchema = Joi.object({
  comment: Joi.string().trim().min(3).max(1000).required().messages({
    "string.min": "Comment must be at least 3 characters",
    "string.max": "Comment must not exceed 1000 characters",
    "any.required": "Comment is required",
  }),
});

module.exports = {
  addBlogPostSchema,
  updateBlogPostSchema,
  updateBlogPostCategorySchema,
  addCommentSchema,
  updateCommentSchema,
};
