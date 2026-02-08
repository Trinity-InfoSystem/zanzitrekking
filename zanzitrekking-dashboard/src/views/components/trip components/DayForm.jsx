import { Autocomplete, Checkbox, TextField } from "@mui/material";
import { CheckBoxOutlineBlank, CheckBox } from "@mui/icons-material";
import ImageUpload from "./ImageUpload";
import { useState, useRef } from "react";
import debounce from "lodash.debounce";

const DayForm = ({
  day,
  index,
  accommodations,
  meals,
  onDayChange,
  onImageChange,
  onDayLocationSearch,
  onDayLocationSelect,
  onRemoveDay,
  onAddMeal,
  onAddAccommodation,
}) => {
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef();
  // Debounced search for Nominatim
  const debouncedSearch = useRef(
    debounce(async (query) => {
      if (!query || query.length < 3) {
        setSearchResults([]);
        return;
      }
      setLoading(true);
      try {
        const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`;
        const res = await fetch(url);
        const results = await res.json();
        setSearchResults(results);
      } finally {
        setLoading(false);
      }
    }, 400),
  ).current;

  return (
    <div className="relative mb-6 rounded-2xl border border-primary-200 bg-white p-6 shadow-nature-soft">
      {onRemoveDay && (
        <button
          type="button"
          className="absolute right-2 top-2 rounded-lg bg-gradient-to-r from-accent to-accent-600 px-3 py-1.5 text-xs font-medium text-white shadow-sm transition-all hover:scale-105"
          onClick={onRemoveDay}
          title="Remove this day"
        >
          Remove
        </button>
      )}
      <h3 className="mb-4 text-xl font-semibold text-primary-800">
        Day {index + 1}
      </h3>
      <div className="space-y-6">
        {/* Title and Main Destination pair */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-bold text-primary-800">
              Title
            </label>
            <input
              type="text"
              value={day.title}
              onChange={(e) => onDayChange(index, "title", e.target.value)}
              className="w-full rounded-xl border-2 border-primary-200 bg-white p-3 text-text-dark placeholder:text-text-light focus:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary-200"
              placeholder={`Title for Day ${index + 1}`}
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-bold text-primary-800">
              Main Destination
            </label>
            <input
              ref={inputRef}
              type="text"
              value={day.mainDestination?.name || ""}
              onChange={(e) => {
                onDayChange(index, "mainDestination", {
                  name: e.target.value,
                  location: { lat: null, lng: null },
                });
                debouncedSearch(e.target.value);
              }}
              className="w-full rounded-xl border-2 border-primary-200 bg-white p-3 text-text-dark placeholder:text-text-light focus:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary-200"
              placeholder="Search for a location"
            />
            {loading && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-text-light">
                Loading...
              </div>
            )}
            {searchResults.length > 0 && (
              <ul className="absolute z-10 mt-1 max-h-56 w-full overflow-auto rounded-xl border border-primary-200 bg-white text-text-dark shadow-lg">
                {searchResults.map((result, idx) => (
                  <li
                    key={result.place_id}
                    className="cursor-pointer px-4 py-2 hover:bg-primary-50 hover:text-secondary"
                    onClick={() => {
                      onDayChange(index, "mainDestination", {
                        name: result.display_name,
                        location: {
                          lat: parseFloat(result.lat),
                          lng: parseFloat(result.lon),
                        },
                      });
                      setSearchResults([]);
                    }}
                  >
                    {result.display_name}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Accommodations and Meals pair */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div>
            <label className="mb-2 block flex items-center gap-2 text-sm font-bold text-primary-800">
              Accommodation
              {onAddAccommodation && (
                <button
                  type="button"
                  className="ml-2 rounded-lg bg-gradient-to-r from-secondary to-sunshine-400 px-2 py-1 text-xs font-medium text-white shadow-sm transition-all hover:scale-105"
                  onClick={onAddAccommodation}
                >
                  + Add New
                </button>
              )}
            </label>
            <Autocomplete
              multiple
              disableCloseOnSelect
              options={accommodations}
              getOptionLabel={(option) => option.name}
              getOptionDisabled={(option) => {
                return day.accommodation
                  .map((acc) => acc._id)
                  .includes(option._id);
              }}
              value={accommodations.filter((acc) => {
                return day.accommodation
                  .map((acc) => acc._id)
                  .includes(acc._id);
              })}
              onChange={(_, newValue) => {
                onDayChange(index, "accommodation", newValue);
              }}
              renderOption={(props, option, { selected }) => {
                let { key, ...rest } = props;
                return (
                  <li key={option._id} {...rest}>
                    <Checkbox
                      icon={<CheckBoxOutlineBlank />}
                      checkedIcon={<CheckBox />}
                      checked={selected}
                      className="mr-2"
                    />
                    {option.name}
                  </li>
                );
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  variant="outlined"
                  placeholder="Select accommodations"
                  sx={{
                    width: "100%",
                    borderRadius: "0.75rem",
                    border: "2px solid #95C5A0",
                    padding: "0.5rem",
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "0.75rem",
                      padding: 0,
                      "& input": {
                        padding: 0,
                      },
                    },
                    "& .MuiOutlinedInput-notchedOutline": {
                      border: "none",
                    },
                    "&:focus": {
                      outline: "none",
                    },
                  }}
                />
              )}
            />
          </div>
          <div>
            <label className="mb-2 flex items-center gap-2 text-sm font-bold text-primary-800">
              Meals
              {onAddMeal && (
                <button
                  type="button"
                  className="ml-2 rounded-lg bg-gradient-to-r from-secondary to-sunshine-400 px-2 py-1 text-xs font-medium text-white shadow-sm transition-all hover:scale-105"
                  onClick={onAddMeal}
                >
                  + Add New
                </button>
              )}
            </label>
            <Autocomplete
              multiple
              disableCloseOnSelect
              options={meals}
              getOptionLabel={(option) => option.name}
              getOptionDisabled={(option) => day.meals.includes(option.name)}
              value={day.meals.map((name) => ({ name }))}
              onChange={(_, newValue) =>
                onDayChange(
                  index,
                  "meals",
                  newValue.map((meal) => meal.name),
                )
              }
              renderOption={(props, option, { selected }) => (
                <li {...props}>
                  <Checkbox
                    icon={<CheckBoxOutlineBlank />}
                    checkedIcon={<CheckBox />}
                    checked={selected}
                    className="mr-2"
                  />
                  {option.name}
                </li>
              )}
              renderInput={(params) => (
                <TextField
                  {...params}
                  variant="outlined"
                  placeholder="Select meals"
                  sx={{
                    width: "100%",
                    borderRadius: "0.75rem",
                    border: "2px solid #95C5A0",
                    padding: "0.5rem",
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "0.75rem",
                      padding: 0,
                      "& input": {
                        padding: 0,
                      },
                    },
                    "& .MuiOutlinedInput-notchedOutline": {
                      border: "none",
                    },
                    "&:focus": {
                      outline: "none",
                    },
                  }}
                />
              )}
              PaperComponent={(props) => (
                <div
                  {...props}
                  style={{
                    maxHeight: 240,
                    overflowY: "auto",
                    background: "white",
                  }}
                />
              )}
            />
          </div>
        </div>

        {/* Overview and Image pair */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-bold text-primary-800">
              Overview
            </label>
            <textarea
              value={day.overview}
              onChange={(e) => onDayChange(index, "overview", e.target.value)}
              className="w-full rounded-xl border-2 border-primary-200 bg-white p-3 text-text-dark placeholder:text-text-light focus:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary-200"
              placeholder={`Overview for Day ${index + 1}`}
              rows="4"
            />
          </div>
          <div>
            <ImageUpload
              id={`day-${index}-image`}
              preview={day.imagePreview || day.image}
              onChange={(e) => onImageChange(index, e)}
              label={`Day ${index + 1} Image`}
              color="black"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DayForm;
