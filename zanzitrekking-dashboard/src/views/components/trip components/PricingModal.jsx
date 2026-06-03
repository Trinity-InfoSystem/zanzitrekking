import { useState } from "react";
import CategoryRateInput from "./CategoryRateInput";
import SeasonForm from "./SeasonForm";

const PricingModal = ({
  isOpen,
  onClose,
  pricingType,
  regularPrices,
  seasons,
  discount,
  onPricingTypeChange,
  onRegularPriceChange,
  onSeasonChange,
  onSeasonRateChange,
  onDiscountChange,
  onAddSeason,
  onRemoveSeason,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-primary-900/20 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-6xl overflow-y-auto rounded-2xl bg-white shadow-2xl ring-1 ring-primary-100">
        {/* Header */}
        <div className="rounded-t-2xl bg-gradient-to-r from-primary via-primary-600 to-primary-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white">Trip Pricing</h2>
              <p className="text-white/90">
                Set pricing for different seasons and group sizes
              </p>
            </div>
            <button
              onClick={onClose}
              className="rounded-full bg-white/20 p-2 text-white transition-colors hover:bg-white/30"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          <div className="space-y-8">
            {/* Discount */}
            <div className="max-w-md">
              <label className="mb-3 block text-sm font-bold text-primary-800">
                Discount (%)
              </label>
              <input
                type="number"
                value={discount === 0 ? 0 : discount}
                onChange={(e) => {
                  const val = e.target.value;
                  onDiscountChange(
                    val === "" ? 0 : Number.parseFloat(val) || 0,
                  );
                }}
                min={0}
                max={100}
                className="block w-full rounded-xl border-2 border-primary-200 bg-white px-4 py-3.5 text-text-dark placeholder:text-text-light focus:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary-200"
                placeholder="Enter discount percentage"
              />
            </div>

            {/* Pricing Type */}
            <div className="space-y-4">
              <label className="mb-3 block text-sm font-bold text-primary-800">
                Pricing Type
              </label>
              <div className="flex space-x-6">
                <label className="flex items-center text-text-dark">
                  <input
                    type="radio"
                    value="yearRound"
                    checked={pricingType === "yearRound"}
                    onChange={(e) => onPricingTypeChange(e.target.value)}
                    className="mr-3 h-4 w-4 text-secondary accent-secondary focus:ring-secondary-200"
                  />
                  Year-Round Pricing
                </label>
                <label className="flex items-center text-text-dark">
                  <input
                    type="radio"
                    value="seasonal"
                    checked={pricingType === "seasonal"}
                    onChange={(e) => onPricingTypeChange(e.target.value)}
                    className="mr-3 h-4 w-4 text-secondary accent-secondary focus:ring-secondary-200"
                  />
                  Seasonal Pricing
                </label>
              </div>
            </div>

            {/* Year-Round Pricing */}
            {pricingType === "yearRound" && (
              <div className="space-y-8">
                <h3 className="mb-4 text-xl font-semibold text-primary-800">
                  Year-Round Pricing Categories
                </h3>
                {["standard", "midRange", "luxury"].map((category) => (
                  <CategoryRateInput
                    key={category}
                    category={category}
                    rates={regularPrices[category]}
                    onRateChange={onRegularPriceChange}
                  />
                ))}
              </div>
            )}

            {/* Seasonal Pricing */}
            {pricingType === "seasonal" && (
              <div className="space-y-8">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold text-primary-800">
                    Seasons
                  </h3>
                  <button
                    type="button"
                    onClick={onAddSeason}
                    className="shadow-coral-medium hover:shadow-coral-large rounded-xl bg-gradient-to-r from-secondary to-sunshine-400 px-4 py-2 font-semibold text-white transition-all hover:scale-105"
                  >
                    + Add Season
                  </button>
                </div>

                {seasons.length === 0 && (
                  <div className="py-8 text-center text-text-light">
                    <p>
                      No seasons added yet. Click "Add Season" to create your
                      first season.
                    </p>
                  </div>
                )}

                {seasons.map((season, index) => (
                  <SeasonForm
                    key={index}
                    index={index}
                    season={season}
                    onSeasonChange={onSeasonChange}
                    onRateChange={onSeasonRateChange}
                    onRemove={onRemoveSeason}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="rounded-b-2xl border-t border-primary-200 bg-neutral-50 px-8 py-4">
          <div className="flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="rounded-xl bg-neutral-200 px-6 py-2 font-medium text-text-dark transition-colors hover:bg-neutral-300"
            >
              Cancel
            </button>
            <button
              onClick={onClose}
              className="shadow-coral-medium hover:shadow-coral-large rounded-xl bg-gradient-to-r from-secondary to-sunshine-400 px-6 py-2 font-semibold text-white transition-all hover:scale-105"
            >
              Save Pricing
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PricingModal;
