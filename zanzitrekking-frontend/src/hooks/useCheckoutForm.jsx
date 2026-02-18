// hooks/useCheckoutForm.js
"use client";

import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import {
  checkoutStep1Schema,
  checkoutStep2Schema,
  checkoutSchema,
} from "../utils/checkoutValidationSchemas";

export const useCheckoutForm = (initialUserInfo) => {
  // Step 1 form (Personal Info + Billing Address)
  const step1Form = useForm({
    resolver: yupResolver(checkoutStep1Schema),
    defaultValues: {
      personalInfo: {
        firstName: initialUserInfo?.firstName || "",
        lastName: initialUserInfo?.lastName || "",
        email: initialUserInfo?.email || "",
        phone: "",
      },
      billingAddress: {
        street: "",
        city: "",
        state: "",
        zipCode: "",
        country: "United States",
      },
    },
  });

  // Step 2 form (Payment)
  const step2Form = useForm({
    resolver: yupResolver(checkoutStep2Schema),
    defaultValues: {
      payment: {
        method: "credit-card",
        cardNumber: "",
        expiryDate: "",
        cvv: "",
        nameOnCard: "",
      },
    },
  });

  // Full form (for final submission)
  const fullForm = useForm({
    resolver: yupResolver(checkoutSchema),
    defaultValues: {
      personalInfo: {
        firstName: initialUserInfo?.firstName || "",
        lastName: initialUserInfo?.lastName || "",
        email: initialUserInfo?.email || "",
        phone: "",
      },
      billingAddress: {
        street: "",
        city: "",
        state: "",
        zipCode: "",
        country: "United States",
      },
      payment: {
        method: "credit-card",
        cardNumber: "",
        expiryDate: "",
        cvv: "",
        nameOnCard: "",
      },
    },
  });

  // Handle input changes for step 1
  const handleChange = (section, field, value) => {
    if (section === "personalInfo" || section === "billingAddress") {
      step1Form.setValue(`${section}.${field}`, value);
      fullForm.setValue(`${section}.${field}`, value);
    } else if (section === "payment") {
      step2Form.setValue(`payment.${field}`, value);
      fullForm.setValue(`payment.${field}`, value);
    }
  };

  // Get form data
  const formData = {
    personalInfo: step1Form.watch("personalInfo") || {},
    billingAddress: step1Form.watch("billingAddress") || {},
    payment: step2Form.watch("payment") || {},
  };

  // Get errors
  const errors = {
    personalInfo: step1Form.formState.errors.personalInfo || {},
    billingAddress: step1Form.formState.errors.billingAddress || {},
    payment: step2Form.formState.errors.payment || {},
  };

  // Step validation
  const validateStep = async (step) => {
    if (step === 1) {
      const isValid = await step1Form.trigger();
      return isValid;
    } else if (step === 2) {
      const isValid = await step2Form.trigger();
      return isValid;
    }
    return true;
  };

  return {
    formData,
    errors,
    handleChange,
    validateStep,
    step1Form,
    step2Form,
    fullForm,
  };
};