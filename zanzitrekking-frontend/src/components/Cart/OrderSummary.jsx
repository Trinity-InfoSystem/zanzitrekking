"use client";

import { PriceSummaryRow } from "./PriceSummaryRow";
import { CheckoutButton } from "./CheckoutButton";

export const OrderSummary = ({ 
  totalPrice, 
  travelersTotal, 
  childrenTotal, 
  travelersCount,
  serviceFee, 
  hasDiscounts, 
  itemCount 
}) => {
  const showBreakdown = childrenTotal > 0; // Only show breakdown if there are children
  const pricePerTraveler = travelersCount > 0 ? travelersTotal / travelersCount : 0;

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
        {/* Detailed Breakdown - Only show if children are present */}
        {showBreakdown && (
          <div className="space-y-2 rounded-lg border border-emerald-100 bg-emerald-50/30 p-4">
            <h3 className="mb-2 text-sm font-semibold text-gray-700">
              Price Breakdown
            </h3>
            <PriceSummaryRow 
              label={`Travelers (${travelersCount} ${travelersCount === 1 ? 'adult' : 'adults'})`}
              value={`$${travelersTotal.toFixed(2)}`} 
            />
            {pricePerTraveler > 0 && (
              <div className="ml-4 flex items-center justify-between text-xs text-gray-500">
                <span>Price per traveler:</span>
                <span>${pricePerTraveler.toFixed(2)}</span>
              </div>
            )}
            <PriceSummaryRow 
              label="Children" 
              value={`$${childrenTotal.toFixed(2)}`} 
            />
            <div className="mt-2 border-t border-emerald-200 pt-2">
              <PriceSummaryRow 
                label="Subtotal" 
                value={`$${totalPrice.toFixed(2)}`} 
              />
            </div>
            <p className="mt-2 text-xs text-gray-600 leading-relaxed">
              💡 <strong>How it works:</strong> The base price per person depends on your total group size (adults + children), selected season, and package type. Children receive age-based discounts (15% for ages 5-11, 10% for ages 12-15) applied to this base price.
            </p>
          </div>
        )}

        {/* Simple Subtotal if no children */}
        {!showBreakdown && (
          <>
            <PriceSummaryRow label="Subtotal" value={`$${totalPrice.toFixed(2)}`} />
            {pricePerTraveler > 0 && (
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>Price per traveler:</span>
                <span>${pricePerTraveler.toFixed(2)}</span>
              </div>
            )}
          </>
        )}

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