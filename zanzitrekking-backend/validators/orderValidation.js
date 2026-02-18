const Joi = require("joi");

// Personal info schema (reusable)
const personalInfoSchema = Joi.object({
  firstName: Joi.string().trim().min(1).max(100).required().messages({
    "string.min": "First name is required",
    "string.max": "First name must not exceed 100 characters",
    "any.required": "First name is required",
  }),
  lastName: Joi.string().trim().min(1).max(100).required().messages({
    "string.min": "Last name is required",
    "string.max": "Last name must not exceed 100 characters",
    "any.required": "Last name is required",
  }),
  email: Joi.string().email().required().messages({
    "string.email": "Please provide a valid email address",
    "any.required": "Email is required",
  }),
  phone: Joi.string().pattern(/^[\d\s\-\+\(\)]+$/).min(5).max(20).required().messages({
    "string.pattern.base": "Phone number contains invalid characters",
    "string.min": "Phone number is too short",
    "string.max": "Phone number is too long",
    "any.required": "Phone is required",
  }),
});

// Billing address schema (optional)
const billingAddressSchema = Joi.object({
  street: Joi.string().trim().max(200).optional(),
  city: Joi.string().trim().max(100).optional(),
  state: Joi.string().trim().max(100).optional(),
  zipCode: Joi.string().trim().max(20).optional(),
  country: Joi.string().trim().max(100).optional(),
}).optional();

// Cart item schema
const cartItemSchema = Joi.object({
  tripId: Joi.string().required().messages({
    "any.required": "Trip ID is required",
  }),
  mainTitle: Joi.string().optional(),
  mainImage: Joi.string().optional(),
  startingDate: Joi.string().isoDate().required().messages({
    "string.isoDate": "Starting date must be a valid date",
    "any.required": "Starting date is required",
  }),
  travelersNumber: Joi.number().integer().min(1).max(100).required().messages({
    "number.min": "Travelers number must be at least 1",
    "number.max": "Travelers number cannot exceed 100",
    "any.required": "Travelers number is required",
  }),
  childrenCount: Joi.number().integer().min(0).max(50).default(0).messages({
    "number.min": "Children count cannot be negative",
    "number.max": "Children count cannot exceed 50",
  }),
  childrenAges: Joi.array().items(Joi.number().integer().min(0).max(17)).default([]).messages({
    "array.base": "Children ages must be an array",
  }),
  discount: Joi.number().min(0).max(100).default(0).messages({
    "number.min": "Discount cannot be negative",
    "number.max": "Discount cannot exceed 100",
  }),
  selectedCategory: Joi.string().valid("standard", "midRange", "luxury").default("standard"),
}).required();

// Payment info schema
const paymentInfoSchema = Joi.object({
  method: Joi.string().valid("wetravel", "stripe", "cash").default("wetravel"),
  status: Joi.string().valid("pending", "processing", "completed", "failed").default("pending"),
  paymentOption: Joi.string().valid("deposit", "full").optional(),
  depositAmount: Joi.number().min(0).optional(),
  totalAmount: Joi.number().min(0).required().messages({
    "number.min": "Total amount must be positive",
    "any.required": "Total amount is required",
  }),
}).required();

// Create order validation
const createOrderSchema = Joi.object({
  customerId: Joi.string().required().messages({
    "any.required": "Customer ID is required",
  }),
  cartItems: Joi.array().items(cartItemSchema).min(1).required().messages({
    "array.min": "At least one cart item is required",
    "any.required": "Cart items are required",
  }),
  personalInfo: personalInfoSchema.required(),
  billingAddress: billingAddressSchema,
  paymentInfo: paymentInfoSchema.required(),
  serviceFee: Joi.number().min(0).default(0).messages({
    "number.min": "Service fee cannot be negative",
  }),
});

// Update order status validation
const updateOrderStatusSchema = Joi.object({
  orderStatus: Joi.string().valid("pending", "confirmed", "cancelled", "completed").required().messages({
    "any.only": "Order status must be one of: pending, confirmed, cancelled, completed",
    "any.required": "Order status is required",
  }),
});

// Update payment status validation
const updatePaymentStatusSchema = Joi.object({
  status: Joi.string().valid("pending", "processing", "completed", "failed", "refunded").required().messages({
    "any.only": "Payment status must be one of: pending, processing, completed, failed, refunded",
    "any.required": "Payment status is required",
  }),
});

module.exports = {
  createOrderSchema,
  updateOrderStatusSchema,
  updatePaymentStatusSchema,
  personalInfoSchema,
  billingAddressSchema,
};
