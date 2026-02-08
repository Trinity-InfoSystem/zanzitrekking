// components/checkout/CreditCardForm.jsx
"use client";

import { Calendar, CreditCard, Lock, User } from "lucide-react";

const CreditCardForm = ({ formData, errors, handleChange }) => {
  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || "";
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length) {
      return parts.join(" ");
    } 
      return value;
    
  };

  const formatExpiryDate = (value) => {
    const v = value.replace(/[^0-9]/g, "");
    if (v.length >= 3) {
      return `${v.slice(0, 2)}/${v.slice(2, 4)}`;
    }
    return value;
  };

  const validateCardNumber = (cardNumber) => {
    // Remove all spaces and non-digit characters
    const cleaned = cardNumber.replace(/\s+/g, "").replace(/[^0-9]/g, "");
    // Check if it's exactly 16 digits and passes Luhn algorithm
    return cleaned.length === 16 && luhnCheck(cleaned);
  };

  // Luhn algorithm implementation for card validation
  const luhnCheck = (cardNumber) => {
    let sum = 0;
    for (let i = 0; i < cardNumber.length; i++) {
      let digit = parseInt(cardNumber[i]);
      if ((cardNumber.length - i) % 2 === 0) {
        digit *= 2;
        if (digit > 9) {digit -= 9;}
      }
      sum += digit;
    }
    return sum % 10 === 0;
  };

  return (
    <div className="mt-8 space-y-4">
      <div>
        <label className="mb-1.5 block text-sm font-medium text-gray-700">
          Card Number
        </label>
        <input
          type="text"
          placeholder="1234 5678 9012 3456"
          className={`w-full rounded-lg border ${
            errors.payment?.cardNumber ? "border-red-500" : "border-gray-300"
          } bg-white px-3 py-2 text-sm shadow-sm transition-all focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500`}
          value={formatCardNumber(formData.payment.cardNumber)}
          onChange={(e) => {
            const value = e.target.value.replace(/\D/g, ""); // Remove all non-digits
            handleChange("payment", "cardNumber", value);
          }}
          maxLength={19}
        />
        {errors.payment?.cardNumber && (
          <p className="mt-1 text-sm text-red-500">
            {errors.payment.cardNumber}
          </p>
        )}
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">
            Expiration Date
          </label>
          <input
            type="text"
            placeholder="MM/YY"
            className={`w-full rounded-lg border ${
              errors.payment?.expiryDate ? "border-red-500" : "border-gray-300"
            } bg-white px-3 py-2 text-sm shadow-sm transition-all focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500`}
            value={formatExpiryDate(formData.payment.expiryDate)}
            onChange={(e) => {
              let value = e.target.value.replace(/[^0-9]/g, "");

              // Limit to 4 digits (MMYY)
              if (value.length > 4) {
                value = value.substring(0, 4);
              }

              // Auto-insert slash after 2 digits when typing
              let formattedValue = value;
              if (value.length > 2) {
                formattedValue = `${value.substring(0, 2)}/${value.substring(2)}`;
              }

              // Validate month (01-12)
              const month = value.substring(0, 2);
              if (
                month.length === 2 &&
                (parseInt(month, 10) > 12 || parseInt(month, 10) < 1)
              ) {
                return; // Don't update if invalid month
              }

              // Update the field value
              handleChange("payment", "expiryDate", formattedValue);
            }}
            maxLength={5}
          />
          {errors.payment?.expiryDate && (
            <p className="mt-1 text-sm text-red-500">
              {errors.payment.expiryDate}
            </p>
          )}
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">
            CVV
          </label>
          <input
            type="text"
            placeholder="123"
            className={`w-full rounded-lg border ${
              errors.payment?.cvv ? "border-red-500" : "border-gray-300"
            } bg-white px-3 py-2 text-sm shadow-sm transition-all focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500`}
            value={formData.payment.cvv}
            onChange={(e) => {
              const value = e.target.value.replace(/[^0-9]/g, "");
              handleChange("payment", "cvv", value);
            }}
            maxLength={4}
          />
          {errors.payment?.cvv && (
            <p className="mt-1 text-sm text-red-500">{errors.payment.cvv}</p>
          )}
        </div>
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-medium text-gray-700">
          Name on Card
        </label>
        <input
          type="text"
          placeholder="John Smith"
          className={`w-full rounded-lg border ${
            errors.payment?.nameOnCard ? "border-red-500" : "border-gray-300"
          } bg-white px-3 py-2 text-sm shadow-sm transition-all focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500`}
          value={formData.payment.nameOnCard}
          onChange={(e) =>
            handleChange("payment", "nameOnCard", e.target.value)
          }
        />
        {errors.payment?.nameOnCard && (
          <p className="mt-1 text-sm text-red-500">
            {errors.payment.nameOnCard}
          </p>
        )}
      </div>
    </div>
  );
};

export default CreditCardForm;
