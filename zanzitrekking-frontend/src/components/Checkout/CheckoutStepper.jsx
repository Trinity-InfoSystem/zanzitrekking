// components/CheckoutStepper.jsx
"use client";

import { CheckCircle2 } from "lucide-react";

const CheckoutStepper = ({ activeStep, setActiveStep }) => {
  const steps = [
    { id: 1, label: "Details" },
    { id: 2, label: "Payment" },
    { id: 3, label: "Confirm" },
  ];

  return (
    <div className="mb-12 flex flex-col items-center w-full">
      <div className="relative w-full max-w-3xl flex items-center justify-around mx-auto">
        {/* Progress Bar (background) */}
        <div className="absolute top-1/3 left-6 right-6 h-1 -translate-y-1/2 rounded-full bg-emerald-100 z-0"></div>
        {/* Progress Bar (foreground) */}
        <div
          className="absolute top-1/3 h-1 -translate-y-1/2 rounded-full bg-emerald-500 transition-all duration-300 z-0"
          style={{
            left: "1.5rem", // 6 * 0.25rem = 1.5rem
            width: `calc(${((activeStep - 1) / (steps.length - 1)) * 100}% - 0.5rem)`, // subtract half circle for perfect alignment
            minWidth: 0,
          }}
        ></div>
        {/* Step Circles */}
        {steps.map((step, idx) => (
          <div key={step.id} className="flex flex-col items-center flex-1 z-10">
            <button
              type="button"
              onClick={() => setActiveStep(step.id)}
              className={`flex h-12 w-12 items-center justify-center rounded-full border-2 transition-all duration-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-200 bg-white z-20
                ${
                  activeStep > step.id
                    ? "bg-emerald-600 border-emerald-600 text-white"
                    : activeStep === step.id
                    ? "bg-white border-emerald-600 text-emerald-600"
                    : "bg-white border-emerald-100 text-gray-400"
                } ${activeStep >= step.id ? "hover:shadow-lg" : ""}`}
              aria-current={activeStep === step.id ? "step" : undefined}
              style={{ position: "relative", zIndex: 20 }}
            >
              {activeStep > step.id ? (
                <CheckCircle2 className="h-6 w-6" />
              ) : (
                <span className="text-lg font-bold">{step.id}</span>
              )}
            </button>
            <span
              className={`mt-3 text-sm font-semibold transition-colors duration-200 ${
                activeStep >= step.id ? "text-emerald-600" : "text-gray-400"
              }`}
            >
              {step.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CheckoutStepper;