// components/checkout/NavigationButtons.jsx
"use client";

const NavigationButtons = ({
  activeStep,
  setActiveStep,
  onPlaceOrder,
  isLastStep,
  validateStep,
  disabled = false,
}) => {
  const handleNext = () => {
    if (validateStep(activeStep)) {
      setActiveStep(activeStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep(activeStep - 1);
  };

  return (
    <div className="mt-8 flex justify-between">
      {activeStep > 1 && (
        <button
          type="button"
          onClick={handleBack}
          className="rounded-lg border border-gray-300 px-6 py-2 font-medium text-gray-700 shadow-sm transition-all hover:bg-gray-50 focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
        >
          Back
        </button>
      )}
      {isLastStep ? (
        <button
          type="button"
          onClick={onPlaceOrder}
          disabled={disabled}
          className={`rounded-lg px-6 py-2 font-medium text-white shadow-sm transition-all focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 ${
            disabled
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-emerald-600 hover:bg-emerald-700"
          }`}
        >
          {disabled ? "Processing..." : "Place Order"}
        </button>
      ) : (
        <button
          type="button"
          onClick={handleNext}
          className="rounded-lg bg-emerald-600 px-6 py-2 font-medium text-white shadow-sm transition-all hover:bg-emerald-700 focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
        >
          Continue
        </button>
      )}
    </div>
  );
};

export default NavigationButtons;