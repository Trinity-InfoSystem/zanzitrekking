import * as yup from "yup";
import { personalInfoSchema, billingAddressSchema } from "./validationSchemas";

// Payment schema
export const paymentSchema = yup.object({
  method: yup.string().oneOf(["credit-card", "paypal", "bank-transfer"], "Invalid payment method").default("credit-card"),
  cardNumber: yup
    .string()
    .when("method", {
      is: "credit-card",
      then: (schema) =>
        schema
          .required("Card number is required")
          .matches(/^\d{13,19}$/, "Card number must be 13-19 digits")
          .test("luhn", "Invalid card number", (value) => {
            if (!value) return true;
            const digits = value.replace(/\s/g, "");
            let sum = 0;
            let isEven = false;
            for (let i = digits.length - 1; i >= 0; i--) {
              let digit = parseInt(digits[i]);
              if (isEven) {
                digit *= 2;
                if (digit > 9) digit -= 9;
              }
              sum += digit;
              isEven = !isEven;
            }
            return sum % 10 === 0;
          }),
      otherwise: (schema) => schema.optional(),
    }),
  expiryDate: yup
    .string()
    .when("method", {
      is: "credit-card",
      then: (schema) =>
        schema
          .required("Expiry date is required")
          .matches(/^(0[1-9]|1[0-2])\/([0-9]{2})$/, "Invalid expiry date (MM/YY)")
          .test("not-expired", "Card has expired", (value) => {
            if (!value) return true;
            const [month, year] = value.split("/");
            const currentDate = new Date();
            const currentYear = currentDate.getFullYear() % 100;
            const currentMonth = currentDate.getMonth() + 1;
            const expiryMonth = parseInt(month, 10);
            const expiryYear = parseInt(year, 10);
            return (
              expiryYear > currentYear ||
              (expiryYear === currentYear && expiryMonth >= currentMonth)
            );
          }),
      otherwise: (schema) => schema.optional(),
    }),
  cvv: yup
    .string()
    .when("method", {
      is: "credit-card",
      then: (schema) =>
        schema
          .required("CVV is required")
          .matches(/^\d{3,4}$/, "CVV must be 3 or 4 digits"),
      otherwise: (schema) => schema.optional(),
    }),
  nameOnCard: yup
    .string()
    .when("method", {
      is: "credit-card",
      then: (schema) =>
        schema
          .trim()
          .min(1, "Name on card is required")
          .max(100, "Name on card must not exceed 100 characters")
          .required("Name on card is required"),
      otherwise: (schema) => schema.optional(),
    }),
});

// Checkout form schema (step 1: personal info + billing)
export const checkoutStep1Schema = yup.object({
  personalInfo: personalInfoSchema.required(),
  billingAddress: billingAddressSchema.optional(),
});

// Checkout form schema (step 2: payment)
export const checkoutStep2Schema = yup.object({
  payment: paymentSchema.required(),
});

// Full checkout schema
export const checkoutSchema = yup.object({
  personalInfo: personalInfoSchema.required(),
  billingAddress: billingAddressSchema.optional(),
  payment: paymentSchema.required(),
});
