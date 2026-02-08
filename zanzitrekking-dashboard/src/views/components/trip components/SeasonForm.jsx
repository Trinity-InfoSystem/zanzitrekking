import { FaTrash } from "react-icons/fa";
import CategoryRateInput from "./CategoryRateInput";
import moment from "moment";

const SeasonForm = ({
  index,
  season,
  onSeasonChange,
  onRateChange,
  onRemove,
}) => {
  // Get current date in YYYY-MM-DD format
  const currentDate = moment().format("YYYY-MM-DD");

  // Calculate minimum dates
  const minStartDate = currentDate;
  const minEndDate = season.startDate
    ? moment(season.startDate).format("YYYY-MM-DD")
    : currentDate;

  // Validation functions
  const isStartDateValid = (date) => {
    return moment(date).isAfter(moment(), "day");
  };

  const isEndDateValid = (date) => {
    return moment(date).isAfter(moment(season.startDate), "day");
  };

  // Handle start date change with validation
  const handleStartDateChange = (e) => {
    const newStartDate = e.target.value;
    onSeasonChange(index, "startDate", newStartDate);

    // If end date exists and is before new start date, clear it
    if (
      season.endDate &&
      moment(season.endDate).isSameOrBefore(moment(newStartDate), "day")
    ) {
      onSeasonChange(index, "endDate", "");
    }
  };

  // Handle end date change with validation
  const handleEndDateChange = (e) => {
    const newEndDate = e.target.value;
    onSeasonChange(index, "endDate", newEndDate);
  };

  return (
    <div className="mb-6 rounded-xl border border-primary-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-xl font-semibold text-primary-800">
          Season {index + 1}
        </h3>
        <button
          type="button"
          onClick={() => onRemove(index)}
          className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-r from-accent to-accent-600 text-white shadow-sm transition-all hover:scale-110 hover:shadow-medium"
        >
          <FaTrash className="h-4 w-4" />
        </button>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-medium text-primary-800">
            Season Name
          </label>
          <input
            type="text"
            value={season.name}
            onChange={(e) => onSeasonChange(index, "name", e.target.value)}
            className="block w-full rounded-xl border-2 border-primary-200 bg-white px-4 py-3.5 text-text-dark placeholder:text-text-light focus:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary-200"
            placeholder="e.g., High Season, Summer, etc."
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-primary-800">
            Start Date
          </label>
          <input
            type="date"
            min={minStartDate}
            value={
              season.startDate
                ? moment(season.startDate).format("YYYY-MM-D")
                : ""
            }
            onChange={handleStartDateChange}
            className={`block w-full rounded-xl border-2 px-4 py-3.5 text-text-dark placeholder:text-text-light focus:outline-none focus:ring-2 ${
              season.startDate && !isStartDateValid(season.startDate)
                ? "border-accent bg-accent-50 focus:border-accent focus:ring-accent-200"
                : "border-primary-200 bg-white focus:border-secondary focus:ring-secondary-200"
            }`}
          />
          {season.startDate && !isStartDateValid(season.startDate) && (
            <p className="mt-1 text-sm text-accent">
              Start date must be after today
            </p>
          )}
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-primary-800">
            End Date
          </label>
          <input
            type="date"
            min={minEndDate}
            value={
              season.endDate ? moment(season.endDate).format("YYYY-MM-D") : ""
            }
            onChange={handleEndDateChange}
            className={`block w-full rounded-xl border-2 px-4 py-3.5 text-text-dark placeholder:text-text-light focus:outline-none focus:ring-2 ${
              season.endDate && !isEndDateValid(season.endDate)
                ? "border-accent bg-accent-50 focus:border-accent focus:ring-accent-200"
                : "border-primary-200 bg-white focus:border-secondary focus:ring-secondary-200"
            }`}
            disabled={!season.startDate}
          />
          {season.endDate && !isEndDateValid(season.endDate) && (
            <p className="mt-1 text-sm text-accent">
              End date must be after start date
            </p>
          )}
          {!season.startDate && (
            <p className="mt-1 text-sm text-text-light">
              Please select a start date first
            </p>
          )}
        </div>
      </div>

      <div className="space-y-6">
        <h4 className="text-lg font-semibold text-primary-800">
          Pricing Categories
        </h4>
        {["standard", "midRange", "luxury"].map((category) => (
          <CategoryRateInput
            key={category}
            category={category}
            rates={season.rates?.[category]}
            onRateChange={onRateChange}
            isSeasonal={true}
            seasonIndex={index}
          />
        ))}
      </div>
    </div>
  );
};

export default SeasonForm;
