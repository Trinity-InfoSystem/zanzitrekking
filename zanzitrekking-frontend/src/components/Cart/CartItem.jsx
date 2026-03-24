"use client";

import { TagIcon, TagsIcon, XIcon, BabyIcon } from "lucide-react";
import { DatePicker } from "./DatePicker";
import { TravelersCounter } from "./TravelersCounter";
import { ChildrenAgesInput } from "./ChildrenAgesInput";
import { resolveMediaUrl } from "../../utils/imageUtils";
import toast from "react-hot-toast";

export const CartItem = ({
  trip,
  currentDate,
  currentCategory,
  currentSeasonName,
  currentPrice,
  pricePerPerson,
  onDateChange,
  onCategoryChange,
  onTravelersChange,
  handleDelete,
  childrenCount = 0,
  childrenAges = [],
  onChildrenCountChange,
  onChildrenAgesChange,
}) => {
  const imageName = trip.mainImage
    ? resolveMediaUrl(trip.mainImage)
    : "/placeholder.svg";
  
  
  const hasMidRangePrices = trip.regularPrices?.midRange?.onePerson || trip.regularPrices?.midRange?.twoPerson || trip.regularPrices?.midRange?.threePerson || trip.regularPrices?.midRange?.fourPerson || trip.regularPrices?.midRange?.fiveOrMorePerson;
  const hasLuxuryPrices = trip.regularPrices?.luxury?.onePerson || trip.regularPrices?.luxury?.twoPerson || trip.regularPrices?.luxury?.threePerson || trip.regularPrices?.luxury?.fourPerson || trip.regularPrices?.luxury?.fiveOrMorePerson;



  return (
    <div className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-all duration-300 hover:shadow-lg hover:border-emerald-300">
      {/* Delete Button */}
      <button
        onClick={() => handleDelete(trip)}
        className="absolute right-4 top-4 z-10 rounded-full bg-white/90 p-2 text-gray-400 shadow-md backdrop-blur-sm transition-all hover:bg-red-50 hover:text-red-600 hover:shadow-lg"
        aria-label="Remove item"
      >
        <XIcon className="h-5 w-5" />
      </button>

      <div className="flex flex-col gap-0 sm:flex-row">
        {/* Image */}
        <div className="relative h-56 w-full flex-shrink-0 overflow-hidden sm:h-48 sm:w-56 md:h-52 md:w-64">
          <img
            src={imageName}
            alt={trip.mainTitle}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          {trip.discount > 0 && (
            <div className="absolute left-0 top-0 rounded-br-2xl bg-gradient-to-r from-red-500 to-orange-500 px-4 py-2 text-xs font-bold text-white shadow-lg">
              {trip.discount}% OFF
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        </div>

        {/* Content */}
        <div className="flex min-w-0 flex-1 flex-col p-6">
          {/* Title and Price Section */}
          <div className="mb-6 flex-1">
            <h3 className="mb-3 pr-12 text-xl font-bold text-gray-900 leading-tight">
              {trip.mainTitle}
            </h3>
            <div className="mb-4 flex flex-wrap items-center gap-3">
              <span
                className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${trip.pricingType === "yearRound"
                    ? "border-gray-200 bg-gray-50 text-gray-700"
                    : "border-blue-200 bg-blue-50 text-blue-700"
                  }`}
              >
                {trip.pricingType === "yearRound"
                  ? "Year-Round"
                  : currentSeasonName || "Seasonal"}
              </span>

              <div className="flex items-center gap-1.5 rounded-lg bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
                <TagIcon className="h-3.5 w-3.5" />
                <span className="whitespace-nowrap">
                  ${pricePerPerson.toFixed(2)} per person
                </span>
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-emerald-600">
                ${currentPrice.toFixed(2)}
              </span>
              <span className="text-sm text-gray-500">total</span>
            </div>
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-1 gap-4 border-t border-gray-100 pt-6 sm:grid-cols-2 lg:grid-cols-3">
            <DatePicker
              date={currentDate}
              onChange={(date) => onDateChange(date)}
              categoryName={trip.categoryName}
              selectedCategory={currentCategory || "standard"}
            />
            <TravelersCounter
              count={trip.travelersNumber}
              onChange={(count) => onTravelersChange(trip, count)}
            />

            <div className="flex flex-col gap-1.5">
              <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-gray-700">
                <BabyIcon className="h-4 w-4 flex-shrink-0" />
                <span className="whitespace-nowrap">Number of Children</span>
              </label>
              <div className="flex h-[38px] items-center overflow-hidden rounded-lg border border-gray-300 bg-white shadow-sm">
                <button
                  className="flex h-full items-center justify-center px-3 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={() => onChildrenCountChange(Math.max(0, childrenCount - 1))}
                  disabled={childrenCount <= 0}
                >
                  <XIcon className="h-4 w-4" />
                </button>
                <div className="flex h-full flex-1 items-center justify-center border-x border-gray-200 px-3 font-medium text-sm sm:text-base">
                  {childrenCount}
                </div>
                <button
                  className="flex h-full items-center justify-center px-3 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={() => onChildrenCountChange(Math.min(10, childrenCount + 1))}
                  disabled={childrenCount >= 10}
                >
                  <TagIcon className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-1.5 sm:col-span-2 lg:col-span-1">
              <label className="flex items-center gap-1.5 text-sm font-semibold text-gray-700">
                <TagsIcon className="h-4 w-4 text-emerald-600" />
                <span>Package Type</span>
              </label>
              <select
                value={currentCategory || "standard"}
                onChange={(e) => {
                  if (e.target.value === "midRange" && !hasMidRangePrices) {
                    toast.error("Mid-Range package is not available for this trip");
                    return;
                  }
                  if (e.target.value === "luxury" && !hasLuxuryPrices) {
                    toast.error("Luxury package is not available for this trip");
                    return;
                  }
                  onCategoryChange(e.target.value);
                }}
                className="w-full rounded-xl border-2 border-gray-200 bg-white px-4 py-2.5 text-sm font-medium transition-all focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-500/10"
              >
                <option value="standard">Budget</option>
                <option value="midRange">Mid-Range</option>
                <option value="luxury">Luxury</option>
              </select>
            </div>
          </div>

          {/* Children Ages Input */}
          <ChildrenAgesInput
            childrenCount={childrenCount}
            childrenAges={childrenAges}
            onChange={onChildrenAgesChange}
            tripId={trip._id}
          />
        </div>
      </div>
    </div>
  );
};
