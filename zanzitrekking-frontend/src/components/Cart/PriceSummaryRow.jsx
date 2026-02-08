"use client";

export const PriceSummaryRow = ({ label, value, isDiscount = false, isTotal = false }) => {
  return (
    <div className={`flex items-center justify-between ${isTotal ? "py-2" : "py-1"}`}>
      <span className={`${isDiscount 
        ? "font-semibold text-emerald-700" 
        : isTotal 
          ? "text-lg font-bold text-gray-900" 
          : "text-sm font-medium text-gray-600"
      }`}>
        {label}
      </span>
      <span className={`${isTotal 
        ? "text-2xl font-extrabold text-emerald-600" 
        : isDiscount
          ? "text-base font-bold text-emerald-700"
          : "text-sm font-semibold text-gray-900"
      }`}>
        {value}
      </span>
    </div>
  );
};