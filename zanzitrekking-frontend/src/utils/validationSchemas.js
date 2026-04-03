import * as yup from "yup";

// Email validation schema
export const emailSchema = yup
  .string()
  .email("Please provide a valid email address")
  .required("Email is required");

// Phone validation schema
export const phoneSchema = yup
  .string()
  .matches(/^[\d\s\-\+\(\)]+$/, "Phone number contains invalid characters")
  .min(5, "Phone number is too short")
  .max(20, "Phone number is too long")
  .required("Phone is required");

// Password validation schema
export const passwordSchema = yup
  .string()
  .min(8, "Password must be at least 8 characters")
  .matches(/[A-Z]/, "Password must contain at least one uppercase letter")
  .matches(/[a-z]/, "Password must contain at least one lowercase letter")
  .matches(/\d/, "Password must contain at least one number")
  .matches(/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/, "Password must contain at least one symbol")
  .required("Password is required");

// Name validation schema
export const nameSchema = yup
  .string()
  .trim()
  .min(1, "Name is required")
  .max(100, "Name must not exceed 100 characters")
  .required("Name is required");

// Login schema
export const loginSchema = yup.object({
  email: emailSchema,
  password: yup.string().required("Password is required"),
});

// Register schema
export const registerSchema = yup.object({
  name: nameSchema,
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: yup
    .string()
    .oneOf([yup.ref("password")], "Passwords must match")
    .required("Please confirm your password"),
});

// Forgot password schema
export const forgotPasswordSchema = yup.object({
  email: emailSchema,
});

// Reset password schema
export const resetPasswordSchema = yup.object({
  otp: yup
    .string()
    .matches(/^\d{6}$/, "OTP must be 6 digits")
    .required("OTP is required"),
  password: passwordSchema,
  confirmPassword: yup
    .string()
    .oneOf([yup.ref("password")], "Passwords must match")
    .required("Please confirm your password"),
});

// Contact form schema
export const contactSchema = yup.object({
  firstName: yup
    .string()
    .trim()
    .min(1, "First name is required")
    .max(100, "First name must not exceed 100 characters")
    .required("First name is required"),
  lastName: yup
    .string()
    .trim()
    .min(1, "Last name is required")
    .max(100, "Last name must not exceed 100 characters")
    .required("Last name is required"),
  email: emailSchema,
  phone: yup
    .string()
    .matches(/^[\d\s\-\+\(\)]+$/, "Phone number contains invalid characters")
    .min(5, "Phone number is too short")
    .max(20, "Phone number is too long")
    .optional(),
  message: yup
    .string()
    .trim()
    .min(10, "Message must be at least 10 characters")
    .max(5000, "Message must not exceed 5000 characters")
    .required("Message is required"),
  subject: yup.string().trim().max(200).optional(),
});

// Review schema
export const reviewSchema = yup.object({
  tripId: yup.string().required("Trip ID is required"),
  orderId: yup.string().optional(),
  rating: yup
    .number()
    .integer()
    .min(1, "Rating must be at least 1")
    .max(5, "Rating cannot exceed 5")
    .required("Rating is required"),
  title: yup
    .string()
    .trim()
    .min(3, "Title must be at least 3 characters")
    .max(200, "Title must not exceed 200 characters")
    .required("Title is required"),
  comment: yup
    .string()
    .trim()
    .min(10, "Comment must be at least 10 characters")
    .max(2000, "Comment must not exceed 2000 characters")
    .required("Comment is required"),
  images: yup.array().of(yup.string().url()).optional(),
});

// Job application schema
export const jobApplicationSchema = yup.object({
  firstName: yup
    .string()
    .trim()
    .min(1, "First name is required")
    .max(100, "First name must not exceed 100 characters")
    .required("First name is required"),
  lastName: yup
    .string()
    .trim()
    .min(1, "Last name is required")
    .max(100, "Last name must not exceed 100 characters")
    .required("Last name is required"),
  email: emailSchema,
  phone: phoneSchema,
  additionalDetails: yup.string().trim().max(2000).optional(),
  cvFile: yup
    .mixed()
    .required("CV file is required")
    .test("fileSize", "File size must be less than 5MB", (value) => {
      if (!value) return true;
      return value.size <= 5 * 1024 * 1024;
    })
    .test("fileType", "CV must be a PDF, DOC, or DOCX file", (value) => {
      if (!value) return true;
      const allowedTypes = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ];
      return allowedTypes.includes(value.type);
    }),
});

// Personal info schema (for checkout/orders)
export const personalInfoSchema = yup.object({
  firstName: yup
    .string()
    .trim()
    .min(1, "First name is required")
    .max(100, "First name must not exceed 100 characters")
    .required("First name is required"),
  lastName: yup
    .string()
    .trim()
    .min(1, "Last name is required")
    .max(100, "Last name must not exceed 100 characters")
    .required("Last name is required"),
  email: emailSchema,
  phone: phoneSchema,
});

// Billing address schema
export const billingAddressSchema = yup.object({
  street: yup.string().trim().max(200).optional(),
  city: yup.string().trim().max(100).optional(),
  state: yup.string().trim().max(100).optional(),
  zipCode: yup.string().trim().max(20).optional(),
  country: yup.string().trim().max(100).optional(),
});

// Cart item schema
export const cartItemSchema = yup.object({
  tripId: yup.string().required("Trip ID is required"),
  startingDate: yup
    .string()
    .matches(/^\d{4}-\d{2}-\d{2}$/, "Starting date must be in YYYY-MM-DD format")
    .required("Starting date is required"),
  travelersNumber: yup
    .number()
    .integer()
    .min(1, "Travelers number must be at least 1")
    .max(100, "Travelers number cannot exceed 100")
    .required("Travelers number is required"),
  childrenCount: yup.number().integer().min(0).max(50).default(0),
  childrenAges: yup.array().of(yup.number().integer().min(0).max(17)).default([]),
  discount: yup.number().min(0).max(100).default(0),
  selectedCategory: yup.string().oneOf(["standard", "midRange", "luxury"], "Invalid category").default("standard"),
});

// Urgent booking request schema
export const urgentBookingRequestSchema = yup.object({
  tripId: yup.string().required("Trip ID is required"),
  requestedDate: yup.string().required("Requested date is required"),
  selectedCategory: yup
    .string()
    .oneOf(["standard", "midRange", "luxury"], "Invalid category")
    .required("Selected category is required"),
  travelersNumber: yup
    .number()
    .integer()
    .min(1, "Travelers number must be at least 1")
    .max(100, "Travelers number cannot exceed 100")
    .required("Travelers number is required"),
  personalInfo: personalInfoSchema.required(),
  billingAddress: billingAddressSchema.nullable(),
});
