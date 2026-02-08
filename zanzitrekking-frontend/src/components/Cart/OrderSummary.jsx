"use client";

import { PriceSummaryRow } from "./PriceSummaryRow";
import { CheckoutButton } from "./CheckoutButton";

export const OrderSummary = ({ totalPrice, serviceFee, hasDiscounts, itemCount }) => {
  return (
    <div className="sticky top-6 overflow-hidden rounded-2xl border-2 border-gray-200 bg-white shadow-xl">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-5">
        <h2 className="text-xl font-bold text-white">Order Summary</h2>
        <p className="mt-1 text-sm text-emerald-50">
          {itemCount} {itemCount === 1 ? "item" : "items"}
        </p>
      </div>

      {/* Price Breakdown */}
      <div className="space-y-4 p-6">
        <PriceSummaryRow label="Subtotal" value={`$${totalPrice.toFixed(2)}`} />
        <PriceSummaryRow label="Service Fee" value={`$${serviceFee.toFixed(2)}`} />

        {hasDiscounts && (
          <div className="rounded-lg bg-emerald-50 p-3">
            <PriceSummaryRow 
              label="Discounts Applied" 
              value="✓" 
              isDiscount 
            />
          </div>
        )}

        <div className="border-t-2 border-dashed border-gray-200 pt-4">
          <PriceSummaryRow 
            label="Total" 
            value={`$${(totalPrice + serviceFee).toFixed(2)}`} 
            isTotal 
          />
          <p className="mt-2 text-xs text-gray-500">
            Taxes may apply at checkout
          </p>
        </div>
      </div>

      {/* Checkout Button */}
      <div className="border-t border-gray-100 bg-gray-50 p-6">
        <CheckoutButton disabled={itemCount === 0} />
      </div>
    </div>
  );
};