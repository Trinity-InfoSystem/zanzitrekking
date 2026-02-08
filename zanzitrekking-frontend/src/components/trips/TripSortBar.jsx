import { ChevronDown, Filter, LayoutGrid, List, RotateCcw } from "lucide-react";

const TripSortBar = ({
  totalTrips,
  sort,
  handleSortChange,
  styles,
  setStyles,
  tripsPerPage,
  handleTripsPerPageChange,
  hasActiveFilters,
  resetAllFilters,
}) => {
  return (
    <div className="mb-8 flex flex-col gap-4 rounded-2xl border border-neutral-200/80 bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3.5">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-neutral-100 to-neutral-50">
          <Filter className="h-5 w-5 text-neutral-900" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-neutral-900">
            {totalTrips.toLocaleString()} {totalTrips === 1 ? "Trip" : "Trips"}
          </h2>
          <p className="text-sm font-medium text-neutral-500">
            Available adventures
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        {hasActiveFilters && (
          <button
            onClick={resetAllFilters}
            className="group flex items-center gap-2 rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm font-semibold text-neutral-700 shadow-sm transition-all hover:border-neutral-300 hover:bg-neutral-50 hover:shadow active:scale-[0.98]"
          >
            <RotateCcw className="h-4 w-4 transition-transform group-hover:rotate-180" />
            Reset
          </button>
        )}

        <div className="relative">
          <select
            className="appearance-none rounded-xl border border-neutral-200 bg-white px-4 py-2.5 pr-10 text-sm font-medium text-neutral-900 shadow-sm transition-all hover:border-neutral-300 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            value={sort}
            onChange={handleSortChange}
          >
            <option value="sort-by">Sort By</option>
            <option value="low-to-high">Price: Low to High</option>
            <option value="high-to-low">Price: High to Low</option>
            <option value="rating">Top Rated</option>
            <option value="duration">Duration</option>
            <option value="alphabetical">Name: A to Z</option>
            <option value="created-at">Newest First</option>
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
            <ChevronDown className="h-4 w-4 text-neutral-400" />
          </div>
        </div>

        <div className="relative">
          <select
            className="appearance-none rounded-xl border border-neutral-200 bg-white px-4 py-2.5 pr-10 text-sm font-medium text-neutral-900 shadow-sm transition-all hover:border-neutral-300 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            value={tripsPerPage}
            onChange={handleTripsPerPageChange}
          >
            <option value={6}>6 per page</option>
            <option value={9}>9 per page</option>
            <option value={12}>12 per page</option>
            <option value={18}>18 per page</option>
            <option value={24}>24 per page</option>
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
            <ChevronDown className="h-4 w-4 text-neutral-400" />
          </div>
        </div>

        <div className="hidden items-center overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm sm:flex">
          <button
            onClick={() => setStyles("grid")}
            className={`flex h-10 w-10 items-center justify-center transition-all ${
              styles === "grid"
                ? "bg-neutral-900 text-white"
                : "text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900"
            }`}
            aria-label="Grid view"
          >
            <LayoutGrid className="h-4.5 w-4.5" />
          </button>
          <div className="h-6 w-px bg-neutral-200" />
          <button
            onClick={() => setStyles("list")}
            className={`flex h-10 w-10 items-center justify-center transition-all ${
              styles === "list"
                ? "bg-neutral-900 text-white"
                : "text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900"
            }`}
            aria-label="List view"
          >
            <List className="h-4.5 w-4.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default TripSortBar;
