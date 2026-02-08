// components/checkout/PaymentMethodSelector.jsx
"use client";

import { CreditCard } from "lucide-react";

const PaymentMethodSelector = ({
  paymentMethod,
  setPaymentMethod,
  handleChange,
}) => {
  const paymentOptions = [
    {
      id: "credit-card",
      label: "Credit Card",
      icons: [
        <div key="1" className="h-8 w-12 rounded border bg-gray-100"></div>,
        <div key="2" className="h-8 w-12 rounded border bg-gray-100"></div>,
        <div key="3" className="h-8 w-12 rounded border bg-gray-100"></div>,
      ],
    },
  ];

  const handleMethodChange = (method) => {
    setPaymentMethod(method);
    handleChange("payment", "method", method);
  };

  return (
    <>
      <h2 className="mb-6 flex items-center gap-2 text-xl font-semibold text-gray-900">
        <CreditCard className="h-5 w-5 text-emerald-600" />
        Payment Method
      </h2>

      <div className="space-y-4">
        {paymentOptions.map((option) => (
          <div
            key={option.id}
            className={`flex cursor-pointer items-center justify-between rounded-full border p-4 transition-all duration-200 ${
              paymentMethod === option.id
                ? "border-emerald-500 bg-emerald-50 shadow-sm"
                : "border-emerald-100 bg-white hover:bg-emerald-50"
            }`}
            onClick={() => handleMethodChange(option.id)}
          >
            <div className="flex items-center gap-3">
              <div
                className={`h-5 w-5 rounded-full border flex items-center justify-center transition-all duration-200 ${
                  paymentMethod === option.id
                    ? "border-emerald-500 bg-emerald-500"
                    : "border-emerald-100 bg-white"
                }`}
              >
                {paymentMethod === option.id && (
                  <div className="h-2.5 w-2.5 rounded-full bg-white" />
                )}
              </div>
              <span className="font-semibold text-gray-800">{option.label}</span>
            </div>
            <div className="flex gap-2">
              {option.icons.map((icon, idx) => (
                <div key={idx} className="h-8 w-12 rounded-full border border-emerald-100 bg-gray-50" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default PaymentMethodSelector;