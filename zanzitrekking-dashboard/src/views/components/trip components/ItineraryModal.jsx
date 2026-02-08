import { useState } from "react";
import DayForm from "./DayForm";
import CopyDaysModal from "./CopyDaysModal";

const ItineraryModal = ({
  isOpen,
  onClose,
  days,
  daysCount,
  accommodations,
  meals,
  onDaysCountChange,
  onDayChange,
  onDayImageChange,
  onHotelChange,
  onRemoveDay,
  onAddMeal,
  onAddAccommodation,
  onCopyDays,
}) => {
  const [showCopyModal, setShowCopyModal] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-primary-900/20 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-6xl overflow-y-auto rounded-2xl bg-white shadow-2xl ring-1 ring-primary-100">
        {/* Header */}
        <div className="rounded-t-2xl bg-gradient-to-r from-primary via-primary-600 to-primary-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white">Trip Itinerary</h2>
              <p className="text-white/90">
                Plan the daily activities for your trip
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
            {/* Days Count and Copy Button */}
            <div className="flex items-center justify-between">
              <div className="max-w-xs">
                <label className="mb-3 block text-sm font-bold text-primary-800">
                  Number of Days
                </label>
                <input
                  type="number"
                  value={daysCount}
                  onChange={onDaysCountChange}
                  min={1}
                  className="block w-full rounded-xl border-2 border-primary-200 bg-white px-4 py-3.5 text-text-dark placeholder:text-text-light focus:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary-200"
                  placeholder="Enter number of days"
                />
              </div>
              <div>
                <button
                  onClick={() => setShowCopyModal(true)}
                  className="rounded-xl bg-gradient-to-r from-primary to-primary-600 px-4 py-2 font-semibold text-white shadow-nature-medium transition-all hover:scale-105 hover:shadow-nature-large"
                >
                  Copy Days from Another Trip
                </button>
              </div>
            </div>

            {/* Days List */}
            <div className="space-y-8">
              {days.map((day, index) => (
                <div key={index} className="relative">
                  <div className="absolute bottom-0 left-2 top-0 w-0.5 bg-gradient-to-b from-secondary via-sunshine-400 to-success"></div>
                  <div className="relative ml-8 rounded-2xl border border-primary-200 bg-neutral-50 shadow-sm">
                    <div className="shadow-coral-soft absolute -left-10 top-6 flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-r from-secondary to-sunshine-400 text-sm font-bold text-white">
                      {index + 1}
                    </div>
                    <DayForm
                      day={day}
                      index={index}
                      accommodations={accommodations}
                      meals={meals}
                      onDayChange={onDayChange}
                      onImageChange={onDayImageChange}
                      onHotelChange={onHotelChange}
                      onRemoveDay={() => onRemoveDay(index)}
                      onAddMeal={onAddMeal}
                      onAddAccommodation={onAddAccommodation}
                    />
                  </div>
                </div>
              ))}

              {days.length === 0 && (
                <div className="py-12 text-center text-text-light">
                  <div className="mb-4">
                    <svg
                      className="mx-auto h-12 w-12 text-text-light"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <p className="text-lg font-medium text-text-dark">
                    No days added yet
                  </p>
                  <p className="text-sm">
                    Set the number of days above to start planning your
                    itinerary
                  </p>
                </div>
              )}
            </div>
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
              Save Itinerary
            </button>
          </div>
        </div>

        {/* Copy Days Modal */}
        {showCopyModal && (
          <CopyDaysModal
            onClose={() => setShowCopyModal(false)}
            onCopy={(daysToCopy, append) => {
              onCopyDays(daysToCopy, append);
              setShowCopyModal(false);
            }}
          />
        )}
      </div>
    </div>
  );
};

export default ItineraryModal;
