import { Range } from "react-range";
import { DollarSign } from "lucide-react";

const PriceRangeFilter = ({ priceRange, priceValues, setPriceValues }) => {
  if (!priceValues || !priceRange) {
    return (
      <div>
        <div className="mb-4 flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-neutral-100">
            <DollarSign className="h-4 w-4 text-neutral-700" />
          </div>
          <h3 className="text-base font-bold text-neutral-900">Price Range</h3>
        </div>
        <div className="flex h-24 items-center justify-center rounded-xl border border-neutral-200 bg-gradient-to-br from-neutral-50 to-white">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 animate-pulse rounded-full bg-neutral-400" />
            <span className="text-sm font-medium text-neutral-500">
              Loading price range...
            </span>
          </div>
        </div>
      </div>
    );
  }

  // Ensure values are within valid range, but don't modify the actual state
  const safePriceValues = [
    Math.max(Math.min(priceValues[0], priceRange?.high || 1000), priceRange?.low || 0),
    Math.min(Math.max(priceValues[1], priceRange?.low || 0), priceRange?.high || 1000),
  ];

  return (
    <div>
      <div className="mb-4 flex items-center gap-2.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100">
          <DollarSign className="h-4 w-4 text-emerald-700" />
        </div>
        <h3 className="text-base font-bold text-neutral-900">Price Range</h3>
      </div>

      <div className="mb-6 rounded-xl border border-neutral-200 bg-gradient-to-br from-neutral-50 to-white p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-neutral-600">Range</span>
          <span className="text-base font-bold text-neutral-900">
            ${safePriceValues[0].toLocaleString()} - $
            {safePriceValues[1].toLocaleString()}
          </span>
        </div>
      </div>

      <div className="px-1 py-2">
        <Range
          step={50}
          min={priceRange?.low || 0}
          max={priceRange?.high || 1000}
          values={priceValues}
          onChange={(values) => {
            // Ensure values are within bounds before setting
            const clampedValues = [
              Math.max(Math.min(values[0], priceRange?.high || 1000), priceRange?.low || 0),
              Math.min(Math.max(values[1], priceRange?.low || 0), priceRange?.high || 1000),
            ];
            setPriceValues(clampedValues);
          }}
          renderTrack={({ props, children }) => (
            <div
              {...props}
              className="relative h-2 w-full rounded-full bg-neutral-200"
            >
              <div
                className="absolute h-full rounded-full bg-gradient-to-r from-emerald-600 to-emerald-700 shadow-sm"
                style={{
                  left: `${((priceValues[0] - (priceRange?.low || 0)) / ((priceRange?.high || 1000) - (priceRange?.low || 0))) * 100}%`,
                  width: `${((priceValues[1] - priceValues[0]) / ((priceRange?.high || 1000) - (priceRange?.low || 0))) * 100}%`,
                }}
              />
              {children}
            </div>
          )}
          renderThumb={({ props, index }) => (
            <div
              {...props}
              className="h-5 w-5 rounded-full bg-white shadow-md ring-2 ring-emerald-600 transition-all hover:scale-110 hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-emerald-500/30"
              key={index}
            />
          )}
        />
      </div>
    </div>
  );
};

export default PriceRangeFilter;
