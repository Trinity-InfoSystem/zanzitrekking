const Joi = require("joi");

// Admin login validation
const adminLoginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    "string.email": "Please provide a valid email address",
    "any.required": "Email is required",
  }),
  password: Joi.string().min(6).required().messages({
    "string.min": "Password must be at least 6 characters",
    "any.required": "Password is required",
  }),
  rememberMe: Joi.boolean().optional(),
});

// Customer registration validation
const customerRegisterSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).required().messages({
    "string.min": "Name must be at least 2 characters",
    "string.max": "Name must not exceed 100 characters",
    "any.required": "Name is required",
  }),
  email: Joi.string().email().required().messages({
    "string.email": "Please provide a valid email address",
    "any.required": "Email is required",
  }),
  password: Joi.string().min(6).max(128).required().messages({
    "string.min": "Password must be at least 6 characters",
    "string.max": "Password must not exceed 128 characters",
    "any.required": "Password is required",
  }),
});

// Customer login validation
const customerLoginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    "string.email": "Please provide a valid email address",
    "any.required": "Email is required",
  }),
  password: Joi.string().required().messages({
    "any.required": "Password is required",
  }),
});

// Forgot password validation
const forgotPasswordSchema = Joi.object({
  email: Joi.string().email().required().messages({
    "string.email": "Please provide a valid email address",
    "any.required": "Email is required",
  }),
});

// Verify OTP validation
const verifyOtpSchema = Joi.object({
  email: Joi.string().email().required().messages({
    "string.email": "Please provide a valid email address",
    "any.required": "Email is required",
  }),
  otp: Joi.string().length(6).pattern(/^\d+$/).required().messages({
    "string.length": "OTP must be exactly 6 digits",
    "string.pattern.base": "OTP must contain only digits",
    "any.required": "OTP is required",
  }),
});

// Reset password validation
const resetPasswordSchema = Joi.object({
  email: Joi.string().email().required().messages({
    "string.email": "Please provide a valid email address",
    "any.required": "Email is required",
  }),
  otp: Joi.string().length(6).pattern(/^\d+$/).required().messages({
    "string.length": "OTP must be exactly 6 digits",
    "string.pattern.base": "OTP must contain only digits",
    "any.required": "OTP is required",
  }),
  newPassword: Joi.string().min(6).max(128).required().messages({
    "string.min": "Password must be at least 6 characters",
    "string.max": "Password must not exceed 128 characters",
    "any.required": "New password is required",
  }),
});

// Update password validation
const updatePasswordSchema = Joi.object({
  currentPassword: Joi.string().required().messages({
    "any.required": "Current password is required",
  }),
  newPassword: Joi.string().min(6).max(128).required().messages({
    "string.min": "Password must be at least 6 characters",
    "string.max": "Password must not exceed 128 characters",
    "any.required": "New password is required",
  }),
});

// Refresh token validation
const refreshTokenSchema = Joi.object({
  refreshToken: Joi.string().optional(), // May come from cookie
});

// Google/Facebook login validation
const socialLoginSchema = Joi.object({
  token: Joi.string().required().messages({
    "any.required": "Authentication token is required",
  }),
});

// Create admin validation
const createAdminSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).required().messages({
    "string.min": "Name must be at least 2 characters",
    "string.max": "Name must not exceed 100 characters",
    "any.required": "Name is required",
  }),
  email: Joi.string().email().required().messages({
    "string.email": "Please provide a valid email address",
    "any.required": "Email is required",
  }),
  password: Joi.string().min(6).max(128).required().messages({
    "string.min": "Password must be at least 6 characters",
    "string.max": "Password must not exceed 128 characters",
    "any.required": "Password is required",
  }),
  role: Joi.string().valid("admin", "editor", "viewer").default("viewer"),
  accessRoutes: Joi.array().items(Joi.string()).default([]),
});

// Update admin access routes validation
const updateAccessRoutesSchema = Joi.object({
  accessRoutes: Joi.array().items(Joi.string()).required().messages({
    "any.required": "Access routes array is required",
  }),
});

module.exports = {
  adminLoginSchema,
  customerRegisterSchema,
  customerLoginSchema,
  forgotPasswordSchema,
  verifyOtpSchema,
  resetPasswordSchema,
  updatePasswordSchema,
  refreshTokenSchema,
  socialLoginSchema,
  createAdminSchema,
  updateAccessRoutesSchema,
};
