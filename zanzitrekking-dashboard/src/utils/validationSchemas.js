import * as yup from "yup";

// Email validation schema
export const emailSchema = yup
  .string()
  .email("Please provide a valid email address")
  .required("Email is required");

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

// Phone validation schema
export const phoneSchema = yup
  .string()
  .matches(/^[\d\s\-\+\(\)]+$/, "Phone number contains invalid characters")
  .min(5, "Phone number is too short")
  .max(20, "Phone number is too long")
  .optional();

// Admin login schema
export const adminLoginSchema = yup.object({
  email: emailSchema,
  password: yup.string().required("Password is required"),
});

// Admin register schema
export const adminRegisterSchema = yup.object({
  name: nameSchema,
  email: emailSchema,
  password: passwordSchema,
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
  newPassword: passwordSchema,
  confirmPassword: yup
    .string()
    .oneOf([yup.ref("newPassword")], "Passwords must match")
    .required("Please confirm your password"),
});

// Verify OTP schema
export const verifyOtpSchema = yup.object({
  otp: yup
    .string()
    .matches(/^\d{6}$/, "OTP must be 6 digits")
    .required("OTP is required"),
});

// Create admin schema
export const createAdminSchema = yup.object({
  name: nameSchema,
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: yup
    .string()
    .oneOf([yup.ref("password")], "Passwords must match")
    .required("Please confirm your password"),
  role: yup
    .string()
    .oneOf(["admin", "editor", "viewer"], "Invalid role")
    .required("Role is required"),
  companyEmail: yup.string().email("Invalid email format").optional(),
  companyPhoneNumber: phoneSchema,
  companyAddress: yup.string().trim().max(500).optional(),
});

// Update password schema (for profile)
export const updatePasswordSchema = yup.object({
  currentPassword: yup.string().required("Current password is required"),
  newPassword: passwordSchema,
  confirmPassword: yup
    .string()
    .oneOf([yup.ref("newPassword")], "Passwords must match")
    .required("Please confirm your password"),
});

// Trip form schemas
export const tripBasicSchema = yup.object({
  mainTitle: yup
    .string()
    .trim()
    .min(3, "Title must be at least 3 characters")
    .max(200, "Title must not exceed 200 characters")
    .required("Title is required"),
  overview: yup
    .string()
    .trim()
    .min(10, "Overview must be at least 10 characters")
    .max(1000, "Overview must not exceed 1000 characters")
    .required("Overview is required"),
  description: yup
    .string()
    .trim()
    .min(50, "Description must be at least 50 characters")
    .required("Description is required"),
  category: yup.string().required("Category is required"),
  mainImage: yup.mixed().required("Main image is required"),
});

// Blog post schema - supports both structured and HTML content types
export const blogPostSchema = yup.object({
  mainTitle: yup
    .string()
    .trim()
    .min(3, "Title must be at least 3 characters")
    .max(200, "Title must not exceed 200 characters")
    .required("Title is required"),
  creatorName: yup
    .string()
    .trim()
    .min(1, "Creator name is required")
    .max(100, "Creator name must not exceed 100 characters")
    .required("Creator name is required"),
  creatorBio: yup
    .string()
    .trim()
    .min(10, "Creator bio must be at least 10 characters")
    .required("Creator bio is required"),
  contentType: yup
    .string()
    .oneOf(["structured", "html"], "Content type must be structured or html")
    .default("structured"),
  htmlContent: yup
    .string()
    .when("contentType", {
      is: "html",
      then: (schema) => schema.min(100, "HTML content must be at least 100 characters").required("HTML content is required"),
      otherwise: (schema) => schema.optional(),
    }),
  // Structured content fields (optional when contentType is html)
  mainParagraph: yup.string().trim().optional(),
  secondParagraph: yup.string().trim().optional(),
  thirdParagraph: yup.string().trim().optional(),
  secondTitle: yup.string().trim().optional(),
  fourthParagraph: yup.string().trim().optional(),
  proverb: yup.string().trim().optional(),
  proverbWriter: yup.string().trim().optional(),
  title: yup.string().trim().optional(), // Related images title
  paragraph: yup.string().trim().optional(), // Related images paragraph
  // Social links
  creatorSocialLinks: yup.object({
    facebook: yup.string().url("Invalid Facebook URL").optional(),
    instagram: yup.string().url("Invalid Instagram URL").optional(),
    twitter: yup.string().url("Invalid Twitter URL").optional(),
  }).optional(),
  // Images
  creatorImage: yup.mixed().optional(),
  mainImage: yup.mixed().optional(),
  relatedImage1: yup.mixed().optional(),
  relatedImage2: yup.mixed().optional(),
  // Category
  category: yup.string().optional(),
});

// Partner schema (dashboard)
export const partnerSchema = yup.object({
  name: nameSchema,
  badge: yup
    .string()
    .trim()
    .min(2, "Badge must be at least 2 characters")
    .max(100, "Badge must not exceed 100 characters")
    .required("Badge is required"),
  color: yup
    .string()
    .required("Color is required"),
  rating: yup
    .number()
    .min(0, "Rating must be at least 0")
    .max(5, "Rating must be at most 5")
    .required("Rating is required"),
  reviews: yup
    .number()
    .min(0, "Reviews count must be at least 0")
    .integer("Reviews count must be an integer")
    .required("Reviews count is required"),
  website: yup
    .string()
    .url("Please provide a valid URL")
    .nullable()
    .transform((value) => (value === "" ? null : value))
    .optional(),
  description: yup
    .string()
    .trim()
    .max(2000, "Description must not exceed 2000 characters")
    .nullable()
    .transform((value) => (value === "" ? null : value))
    .optional(),
  order: yup
    .number()
    .min(0, "Order must be at least 0")
    .integer("Order must be an integer")
    .default(0),
  logo: yup.mixed().nullable().optional(), // Optional for edit, required for add
});

// Job schema - supports both structured and HTML content types
export const jobSchema = yup.object({
  title: yup
    .string()
    .trim()
    .min(3, "Title must be at least 3 characters")
    .max(200, "Title must not exceed 200 characters")
    .required("Title is required"),
  contentType: yup
    .string()
    .oneOf(["structured", "html"], "Content type must be structured or html")
    .default("structured"),
  htmlContent: yup
    .string()
    .when("contentType", {
      is: "html",
      then: (schema) => schema.min(100, "HTML content must be at least 100 characters").required("HTML content is required"),
      otherwise: (schema) => schema.optional(),
    }),
  description: yup
    .string()
    .trim()
    .when("contentType", {
      is: "structured",
      then: (schema) => schema.min(50, "Description must be at least 50 characters").required("Description is required"),
      otherwise: (schema) => schema.optional(),
    }),
  requirements: yup
    .string()
    .trim()
    .optional(),
  location: yup
    .string()
    .trim()
    .max(100, "Location must not exceed 100 characters")
    .optional(),
  employmentType: yup
    .string()
    .oneOf(["full-time", "part-time", "contract", "internship", "freelance"], "Invalid employment type")
    .default("full-time"),
  salaryRange: yup
    .string()
    .trim()
    .max(100, "Salary range must not exceed 100 characters")
    .optional(),
  applicationDeadline: yup
    .string()
    .optional(),
  isActive: yup
    .boolean()
    .default(true),
});

// Category schema
export const categorySchema = yup.object({
  name: yup
    .string()
    .trim()
    .min(2, "Category name must be at least 2 characters")
    .max(100, "Category name must not exceed 100 characters")
    .required("Category name is required"),
  description: yup
    .string()
    .trim()
    .max(500, "Description must not exceed 500 characters")
    .optional(),
  image: yup.mixed().optional(),
});

// Banner schema (dashboard - supports multiple banners)
export const bannerItemSchema = yup.object({
  title: yup
    .string()
    .trim()
    .min(3, "Title must be at least 3 characters")
    .max(200, "Title must not exceed 200 characters")
    .required("Title is required"),
  description: yup
    .string()
    .trim()
    .max(500, "Description must not exceed 500 characters")
    .optional(),
  image: yup.mixed().optional(), // Optional if editing existing banner
});

export const bannerSchema = yup.object({
  banners: yup
    .array()
    .of(bannerItemSchema)
    .min(1, "At least one banner is required"),
  sharedVideo: yup.mixed().optional(),
});

// Who We Are schema (dashboard)
export const whoWeAreSchema = yup.object({
  mainTitle: yup
    .string()
    .trim()
    .min(3, "Title must be at least 3 characters")
    .max(200, "Title must not exceed 200 characters")
    .required("Title is required"),
  paragraph: yup
    .string()
    .trim()
    .min(50, "Content must be at least 50 characters")
    .required("Content is required"),
  image1: yup.mixed().optional(),
  image2: yup.mixed().optional(),
  image3: yup.mixed().optional(),
});

// Review management schema (admin)
export const adminReviewSchema = yup.object({
  status: yup
    .string()
    .oneOf(["pending", "approved", "rejected"], "Invalid status")
    .required("Status is required"),
  rejectionReason: yup
    .string()
    .trim()
    .max(500, "Rejection reason must not exceed 500 characters")
    .when("status", {
      is: "rejected",
      then: (schema) => schema.required("Rejection reason is required when rejecting"),
      otherwise: (schema) => schema.optional(),
    }),
});

// Urgent booking request schema (admin)
export const adminUrgentBookingSchema = yup.object({
  status: yup
    .string()
    .oneOf(["pending", "approved", "rejected"], "Invalid status")
    .required("Status is required"),
  rejectionReason: yup
    .string()
    .trim()
    .max(500, "Rejection reason must not exceed 500 characters")
    .when("status", {
      is: "rejected",
      then: (schema) => schema.required("Rejection reason is required when rejecting"),
      otherwise: (schema) => schema.optional(),
    }),
});
