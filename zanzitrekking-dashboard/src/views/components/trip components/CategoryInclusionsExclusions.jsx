import React from "react";
import { Autocomplete, Checkbox, TextField } from "@mui/material";
import { CheckBoxOutlineBlank, CheckBox } from "@mui/icons-material";

const CategoryInclusionsExclusions = ({
  title,
  type,
  categories,
  options,
  selectedValues,
  onSelectionChange,
  onAddNew,
}) => {
  const categoryColors = {
    standard: "from-info to-info-600",
    midRange: "from-success to-success-600",
    luxury: "from-sunshine-400 to-sunshine-500",
  };

  const categoryLabels = {
    standard: "Budget",
    midRange: "Mid-Range",
    luxury: "Luxury",
  };

  return (
    <div className="overflow-hidden rounded-2xl bg-white shadow-xl ring-1 ring-primary-100">
      <div className="bg-gradient-to-r from-primary via-primary-600 to-primary-700 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white">{title}</h2>
            <p className="text-white/90">
              What's {type === "inclusions" ? "included" : "not included"} in
              each package
            </p>
          </div>
          <button
            type="button"
            className="shadow-coral-medium hover:shadow-coral-large ml-2 rounded-lg bg-gradient-to-r from-secondary to-sunshine-400 px-3 py-1.5 text-xs font-medium text-white transition-all hover:scale-105"
            onClick={onAddNew}
          >
            + Add New
          </button>
        </div>
      </div>

      <div className="space-y-6 p-6">
        {categories.map((category) => (
          <div key={category} className="space-y-3">
            <div
              className={`inline-flex items-center rounded-lg bg-gradient-to-r px-4 py-2 ${categoryColors[category]} font-semibold text-white shadow-sm`}
            >
              {categoryLabels[category]}
            </div>

            <Autocomplete
              multiple
              disableCloseOnSelect
              options={options}
              getOptionDisabled={(option) =>
                selectedValues[category]?.includes(option.name) || false
              }
              getOptionLabel={(option) => option.name}
              value={
                selectedValues[category]?.map((name) => ({
                  name,
                })) || []
              }
              onChange={(_, newValue) => {
                onSelectionChange(
                  category,
                  newValue.map((item) => item.name),
                );
              }}
              renderOption={(props, option, { selected }) => (
                <li {...props}>
                  <Checkbox
                    icon={<CheckBoxOutlineBlank />}
                    checkedIcon={<CheckBox />}
                    checked={selected}
                    className="mr-2 rounded-xl border-[1px] border-primary-200 bg-transparent text-secondary"
                  />
                  {option.name}
                </li>
              )}
              renderInput={(params) => (
                <TextField
                  {...params}
                  variant="outlined"
                  label={`Select ${title} for ${categoryLabels[category]}`}
                  placeholder={`Choose what's ${type === "inclusions" ? "included" : "not included"}...`}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "12px",
                      color: "#2D3748",
                      "& fieldset": { borderColor: "#95C5A0" },
                      "&:hover fieldset": { borderColor: "#E76F51" },
                      "&.Mui-focused fieldset": { borderColor: "#E76F51" },
                    },
                    "& .MuiInputLabel-root": {
                      color: "#1B4332",
                    },
                    "& .MuiInputLabel-root.Mui-focused": {
                      color: "#E76F51",
                    },
                    "& .MuiAutocomplete-input": {
                      color: "#2D3748",
                    },
                    "& .MuiChip-root": {
                      color: "white",
                      borderColor: "#E76F51",
                      background: "linear-gradient(to right, #E76F51, #F4A261)",
                    },
                    "& .MuiChip-deleteIcon": {
                      color: "white",
                    },
                    "& .MuiAutocomplete-popupIndicator": {
                      color: "#1B4332",
                    },
                    "& .MuiSvgIcon-root": {
                      color: "#1B4332",
                    },
                  }}
                />
              )}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default CategoryInclusionsExclusions;
