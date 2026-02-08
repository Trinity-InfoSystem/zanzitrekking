"use client";
import { Link } from "react-router-dom";
import { Lock } from "lucide-react";

export const CheckoutButton = ({ disabled }) => {
  return (
    <>
      <div className="flex">
        {disabled ? (
          <button
            className="w-full rounded-xl bg-gradient-to-r from-gray-400 to-gray-500 px-6 py-4 text-center text-base font-bold text-white shadow-md transition-all disabled:cursor-not-allowed"
            disabled={disabled}
          >
            Proceed to Checkout
          </button>
        ) : (
          <Link
            to={"/checkout"}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 px-6 py-4 text-center text-base font-bold text-white shadow-lg transition-all hover:from-orange-600 hover:via-red-600 hover:to-pink-600 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
          >
            <span>Proceed to Checkout</span>
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        )}
      </div>

      <div className="mt-4 flex items-center justify-center gap-2 text-xs font-medium text-gray-600">
        <Lock className="h-4 w-4 text-emerald-600" />
        <span>Secure SSL encrypted checkout</span>
      </div>
    </>
  );
};
