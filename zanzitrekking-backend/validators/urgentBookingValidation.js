const Joi = require("joi");
const { personalInfoSchema, billingAddressSchema } = require("./orderValidation");

// Urgent booking request validation
const createUrgentBookingRequestSchema = Joi.object({
  customerId: Joi.string().required().messages({
    "any.required": "Customer ID is required",
  }),
  tripId: Joi.string().required().messages({
    "any.required": "Trip ID is required",
  }),
  requestedDate: Joi.string().isoDate().required().messages({
    "string.isoDate": "Requested date must be a valid date",
    "any.required": "Requested date is required",
  }),
  selectedCategory: Joi.string().valid("standard", "midRange", "luxury").required().messages({
    "any.only": "Selected category must be one of: standard, midRange, luxury",
    "any.required": "Selected category is required",
  }),
  travelersNumber: Joi.number().integer().min(1).max(100).required().messages({
    "number.min": "Travelers number must be at least 1",
    "number.max": "Travelers number cannot exceed 100",
    "any.required": "Travelers number is required",
  }),
  personalInfo: personalInfoSchema.required(),
  billingAddress: billingAddressSchema,
});

module.exports = {
  createUrgentBookingRequestSchema,
};
