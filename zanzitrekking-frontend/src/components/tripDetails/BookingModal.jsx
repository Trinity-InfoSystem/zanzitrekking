import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Tag, Users, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { DatePicker } from "../Cart/DatePicker";
import { addDays } from "date-fns";

const BookingModal = ({ isOpen, onClose, trip }) => {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState("");
  const [travelersCount, setTravelersCount] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState("standard");

  const getTripCategoryName = () =>
    trip?.categoryName || trip?.category?.name || "";

  // Min date = tomorrow (same as Cart DatePicker)
  const getMinDateISO = () => {
    const tomorrow = addDays(new Date(), 1);
    tomorrow.setHours(0, 0, 0, 0);
    return tomorrow.toISOString().split("T")[0];
  };

  // Initialize date when modal opens or trip changes
  useEffect(() => {
    if (isOpen && trip) {
      const minDate = getMinDateISO();
      // Default to minDate or first available season date (but never before minDate)
      if (trip.pricingType === "seasonal" && trip.seasons?.length > 0) {
        const firstSeason = trip.seasons[0];
        const seasonStart = new Date(firstSeason.startDate)
          .toISOString()
          .split("T")[0];
        setSelectedDate(seasonStart >= minDate ? seasonStart : minDate);
      } else {
        setSelectedDate(minDate);
      }
    }
  }, [isOpen, trip]);

  if (!isOpen || !trip) {return null;}

  // Get applicable season and pricing
  const getApplicableSeason = () => {
    if (trip.pricingType === "yearRound") {
      return { rates: trip.regularPrices, seasonName: "Year Round" };
    }

    if (trip.pricingType === "seasonal" && trip.seasons) {
      const date = new Date(selectedDate);
      const applicableSeason = trip.seasons.find((season) => {
        const startDate = new Date(season.startDate);
        const endDate = new Date(season.endDate);
        return date >= startDate && date <= endDate;
      });

      return applicableSeason
        ? { rates: applicableSeason.rates, seasonName: applicableSeason.name }
        : { rates: trip.regularPrices, seasonName: "Default" };
    }

    return { rates: trip.regularPrices, seasonName: "Default" };
  };

  const getCategoryRates = (rates, category = "standard") => {
    if (rates && rates[category]) {
      return rates[category];
    } else if (rates && rates.onePerson) {
      return rates;
    }
    return null;
  };

  const calculatePrice = () => {
    const { rates, seasonName } = getApplicableSeason();

    if (!rates) {
      return 0;
    }

    const categoryRates = getCategoryRates(rates, selectedCategory);

    if (!categoryRates) {
      return 0;
    }

    let pricePerPerson;
    switch (travelersCount) {
      case 1:
        pricePerPerson = categoryRates.onePerson;
        break;
      case 2:
        pricePerPerson = categoryRates.twoPerson;
        break;
      case 3:
        pricePerPerson = categoryRates.threePerson;
        break;
      case 4:
        pricePerPerson = categoryRates.fourPerson;
        break;
      default:
        pricePerPerson = categoryRates.fiveOrMorePerson;
        break;
    }

    if (!pricePerPerson || pricePerPerson <= 0) {
      return 0;
    }

    const discountAmount = trip.discount
      ? (pricePerPerson * trip.discount) / 100
      : 0;
    const discountedPrice = pricePerPerson - discountAmount;

    const total = discountedPrice * travelersCount;

    return total;
  };

  const totalPrice = calculatePrice();
  const pricePerPerson = travelersCount > 0 ? totalPrice / travelersCount : 0;

  const handleProceedToCheckout = () => {
    const minDate = getMinDateISO();
    if (!selectedDate || selectedDate < minDate) {
      toast.error(`Please select a date on or after ${minDate}`);
      return;
    }
    // Store booking details in localStorage to pass to checkout
    const bookingDetails = {
      tripId: trip._id,
      startingDate: selectedDate,
      travelersNumber: travelersCount,
      selectedCategory,
    };
    localStorage.setItem(
      "directBookingDetails",
      JSON.stringify(bookingDetails),
    );

    // Navigate to checkout with trip ID
    navigate(`/checkout?trip=${trip._id}`);
  };

  const hasMidRangePrices = trip.regularPrices?.midRange?.onePerson || trip.regularPrices?.midRange?.twoPerson || trip.regularPrices?.midRange?.threePerson || trip.regularPrices?.midRange?.fourPerson || trip.regularPrices?.midRange?.fiveOrMorePerson;
  const hasLuxuryPrices = trip.regularPrices?.luxury?.onePerson || trip.regularPrices?.luxury?.twoPerson || trip.regularPrices?.luxury?.threePerson || trip.regularPrices?.luxury?.fourPerson || trip.regularPrices?.luxury?.fiveOrMorePerson;

  const modalContent = (
    <div className="fixed inset-0 z-[9990] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-lg rounded-2xl border border-neutral-200 bg-white shadow-2xl">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-lg text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-600"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Header */}
        <div className="border-b border-neutral-200 p-6">
          <h2 className="text-xl font-semibold text-neutral-900">
            Book Your Trip
          </h2>
          <p className="mt-1 text-sm text-neutral-600">{trip.mainTitle}</p>
        </div>

        {/* Content */}
        <div className="space-y-5 p-6">
          {/* Date Selection - same DatePicker as Cart (browse months, Today/Clear, black & white) */}
          <div>
            <DatePicker
              date={selectedDate || getMinDateISO()}
              onChange={(value) => setSelectedDate(value)}
              categoryName={getTripCategoryName()}
              selectedCategory={selectedCategory}
            />
          </div>

          {/* Travelers Count */}
          <div>
            <label className="mb-2 flex items-center gap-2 text-sm font-medium text-neutral-900">
              <Users className="h-4 w-4" />
              Number of Travelers
            </label>
            <div className="flex items-center gap-3">
              <button
                onClick={() =>
                  setTravelersCount(Math.max(1, travelersCount - 1))
                }
                className="flex h-10 w-10 items-center justify-center rounded-lg border border-neutral-300 bg-white text-neutral-600 transition-colors hover:bg-neutral-50"
              >
                −
              </button>
              <div className="flex h-10 flex-1 items-center justify-center rounded-lg border border-neutral-200 bg-neutral-50">
                <span className="text-base font-semibold text-neutral-900">
                  {travelersCount}
                </span>
              </div>
              <button
                onClick={() =>
                  setTravelersCount(Math.min(10, travelersCount + 1))
                }
                className="flex h-10 w-10 items-center justify-center rounded-lg border border-neutral-300 bg-white text-neutral-600 transition-colors hover:bg-neutral-50"
              >
                +
              </button>
            </div>
          </div>

          {/* Category Selection */}
          <div>
            <label className="mb-2 flex items-center gap-2 text-sm font-medium text-neutral-900">
              <Tag className="h-4 w-4" />
              Package Type
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => {
                if (e.target.value === "midRange" && !hasMidRangePrices) {
                  toast.error("Mid-Range package is not available for this trip");
                  return;
                }
                if (e.target.value === "luxury" && !hasLuxuryPrices) {
                  toast.error("Luxury package is not available for this trip");
                  return;
                }
                setSelectedCategory(e.target.value);
              }}
              className="w-full rounded-lg border border-neutral-300 bg-white px-4 py-2.5 text-sm text-neutral-900 transition-colors focus:border-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900/10"
            >
              <option value="standard">Budget</option>
              <option value="midRange">Mid-Range</option>
              <option value="luxury">Luxury</option>
            </select>
          </div>

          {/* Price Summary */}
          <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-4">
            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-sm">
                <span className="text-neutral-600">Price per person</span>
                <span className="font-semibold text-neutral-900">
                  ${pricePerPerson.toFixed(2)}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-neutral-600">Travelers</span>
                <span className="font-semibold text-neutral-900">
                  {travelersCount}
                </span>
              </div>
              {trip.discount > 0 && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-neutral-600">Discount</span>
                  <span className="font-semibold text-neutral-900">
                    {trip.discount}% OFF
                  </span>
                </div>
              )}
              <div className="border-t border-neutral-200 pt-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-neutral-900">Total</span>
                  <span className="text-2xl font-bold text-neutral-900">
                    ${totalPrice.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 border-t border-neutral-200 p-6">
          <button
            onClick={onClose}
            className="flex-1 rounded-lg border border-neutral-300 bg-white px-6 py-2.5 text-sm font-medium text-neutral-900 transition-colors hover:bg-neutral-50"
          >
            Cancel
          </button>
          <button
            onClick={handleProceedToCheckout}
            className="flex-1 rounded-lg bg-neutral-900 px-6 py-2.5 text-sm font-medium text-white transition-all hover:bg-neutral-800"
          >
            Continue to Checkout
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default BookingModal;
