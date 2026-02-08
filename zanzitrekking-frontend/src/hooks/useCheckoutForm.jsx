// hooks/useCheckoutForm.js
"use client";

import { useState } from "react";

export const useCheckoutForm = (initialUserInfo) => {
  // Form state
  const [formData, setFormData] = useState({
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
      zip: "",
      country: "United States",
    },
    payment: {
      method: "credit-card",
      cardNumber: "",
      expiryDate: "",
      cvv: "",
      nameOnCard: "",
    },
  });

  // Form errors
  const [errors, setErrors] = useState({
    personalInfo: {},
    billingAddress: {},
    payment: {},
  });

  // Handle input changes
  const handleChange = (section, field, value) => {
    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));

    // Clear error when field changes
    if (errors[section]?.[field]) {
      setErrors((prev) => ({
        ...prev,
        [section]: {
          ...prev[section],
          [field]: undefined,
        },
      }));
    }
  };

  // Validation functions
  const validatePersonalInfo = () => {
    const newErrors = {};
    const { firstName, lastName, email, phone } = formData.personalInfo;

    if (!firstName.trim()) {newErrors.firstName = "First name is required";}
    if (!lastName.trim()) {newErrors.lastName = "Last name is required";}
    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Invalid email format";
    }
    if (!phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!/^\d{10,15}$/.test(phone.replace(/\D/g, ""))) {
      newErrors.phone = "Invalid phone number";
    }

    setErrors((prev) => ({ ...prev, personalInfo: newErrors }));
    return Object.keys(newErrors).length === 0;
  };

  const validateBillingAddress = () => {
    const newErrors = {};
    const { street, city, state, zip, country } = formData.billingAddress;

    if (!street.trim()) {newErrors.street = "Street address is required";}
    if (!city.trim()) {newErrors.city = "City is required";}
    if (!state.trim()) {newErrors.state = "State is required";}
    if (!zip.trim()) {
      newErrors.zip = "ZIP code is required";
    } else if (!/^\d{5}(-\d{4})?$/.test(zip)) {
      newErrors.zip = "Invalid ZIP code";
    }
    if (!country) {newErrors.country = "Country is required";}

    setErrors((prev) => ({ ...prev, billingAddress: newErrors }));
    return Object.keys(newErrors).length === 0;
  };

  const validatePayment = () => {
    const newErrors = {};
    const { method, cardNumber, expiryDate, cvv, nameOnCard } = formData.payment;

    if (method === "credit-card") {
      if (!cardNumber.trim()) {
        newErrors.cardNumber = "Card number is required";
      } else if (!/^\d{16}$/.test(cardNumber.replace(/\s/g, ""))) {
        newErrors.cardNumber = "Invalid card number";
      }

      if (!expiryDate.trim()) {
        newErrors.expiryDate = "Expiry date is required";
      } else if (!/^(0[1-9]|1[0-2])\/([0-9]{2})$/.test(expiryDate)) {
        newErrors.expiryDate = "Invalid expiry date (MM/YY)";
      } else {
        // Validate that expiry date is not in the past
        const [month, year] = expiryDate.split("/");
        const currentDate = new Date();
        const currentYear = currentDate.getFullYear() % 100; // Get last 2 digits
        const currentMonth = currentDate.getMonth() + 1; // getMonth() returns 0-11
        
        const expiryMonth = parseInt(month, 10);
        const expiryYear = parseInt(year, 10);
        
        // Check if expiry date is in the past
        if (expiryYear < currentYear || 
            (expiryYear === currentYear && expiryMonth < currentMonth)) {
          newErrors.expiryDate = "Card has expired";
        }
      }

      if (!cvv.trim()) {
        newErrors.cvv = "CVV is required";
      } else if (!/^\d{3,4}$/.test(cvv)) {
        newErrors.cvv = "Invalid CVV";
      }

      if (!nameOnCard.trim()) {newErrors.nameOnCard = "Name on card is required";}
    }

    setErrors((prev) => ({ ...prev, payment: newErrors }));
    return Object.keys(newErrors).length === 0;
  };

  // Step validation
  const validateStep = (step) => {
    switch (step) {
      case 1:
        return validatePersonalInfo() && validateBillingAddress();
      case 2:
        return validatePayment();
      default:
        return true;
    }
  };

  return {
    formData,
    errors,
    handleChange,
    validateStep,
  };
};