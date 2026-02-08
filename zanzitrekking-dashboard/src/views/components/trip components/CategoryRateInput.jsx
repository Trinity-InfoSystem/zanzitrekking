import React from "react";

const CategoryRateInput = ({
  category,
  rates,
  onRateChange,
  isSeasonal = false,
  seasonIndex = null,
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
    <div className="rounded-xl border border-primary-200 bg-white p-6 shadow-sm">
      <div
        className={`mb-4 inline-flex items-center rounded-lg bg-gradient-to-r px-4 py-2 ${categoryColors[category]} font-semibold text-white shadow-sm`}
      >
        {categoryLabels[category]}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-primary-800">
            1 Person
          </label>
          <input
            type="number"
            value={rates?.onePerson || ""}
            onChange={(e) =>
              onRateChange(
                isSeasonal ? seasonIndex : category,
                category,
                "onePerson",
                e.target.value,
              )
            }
            className="block w-full rounded-lg border-2 border-primary-200 bg-white px-3 py-2 text-text-dark placeholder:text-text-light focus:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary-200"
            placeholder="0"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-primary-800">
            2 Persons
          </label>
          <input
            type="number"
            value={rates?.twoPerson || ""}
            onChange={(e) =>
              onRateChange(
                isSeasonal ? seasonIndex : category,
                category,
                "twoPerson",
                e.target.value,
              )
            }
            className="block w-full rounded-lg border-2 border-primary-200 bg-white px-3 py-2 text-text-dark placeholder:text-text-light focus:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary-200"
            placeholder="0"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-primary-800">
            3 Persons
          </label>
          <input
            type="number"
            value={rates?.threePerson || ""}
            onChange={(e) =>
              onRateChange(
                isSeasonal ? seasonIndex : category,
                category,
                "threePerson",
                e.target.value,
              )
            }
            className="block w-full rounded-lg border-2 border-primary-200 bg-white px-3 py-2 text-text-dark placeholder:text-text-light focus:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary-200"
            placeholder="0"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-primary-800">
            4 Persons
          </label>
          <input
            type="number"
            value={rates?.fourPerson || ""}
            onChange={(e) =>
              onRateChange(
                isSeasonal ? seasonIndex : category,
                category,
                "fourPerson",
                e.target.value,
              )
            }
            className="block w-full rounded-lg border-2 border-primary-200 bg-white px-3 py-2 text-text-dark placeholder:text-text-light focus:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary-200"
            placeholder="0"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-primary-800">
            5+ Persons
          </label>
          <input
            type="number"
            value={rates?.fiveOrMorePerson || ""}
            onChange={(e) =>
              onRateChange(
                isSeasonal ? seasonIndex : category,
                category,
                "fiveOrMorePerson",
                e.target.value,
              )
            }
            className="block w-full rounded-lg border-2 border-primary-200 bg-white px-3 py-2 text-text-dark placeholder:text-text-light focus:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary-200"
            placeholder="0"
          />
        </div>
      </div>
    </div>
  );
};

export default CategoryRateInput;
