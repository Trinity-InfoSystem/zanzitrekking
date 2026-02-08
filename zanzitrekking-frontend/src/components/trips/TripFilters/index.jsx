import CategoryFilter from "./CategoryFilter";
import PriceRangeFilter from "./PriceRangeFilter";
import RatingFilter from "./RatingFilter";
import SearchByName from "./SearchByName";
import { SlidersHorizontal } from "lucide-react";

const TripFilters = ({
  categories,
  category,
  handleCategoryChange,
  priceRange,
  priceValues,
  setPriceValues,
  rating,
  setRating,
  searchText,
  setSearchText,
  showMobileFilter,
  resetAllFilters,
}) => {
  return (
    <div
      className={`w-full rounded-2xl border border-neutral-200/80 bg-white shadow-sm lg:sticky lg:top-24 lg:h-fit lg:w-1/3 xl:w-1/5 3xl:w-1/5 ${
        showMobileFilter ? "block" : "hidden lg:block"
      }`}
    >
      <div className="border-b border-neutral-100 p-6">
        <div className="flex items-center gap-3.5">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-neutral-100 to-neutral-50">
            <SlidersHorizontal className="h-5 w-5 text-neutral-900" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-neutral-900">Filters</h2>
            <p className="text-sm font-medium text-neutral-500">
              Refine your search
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-8 p-6">
        <SearchByName searchText={searchText} setSearchText={setSearchText} />

        <div className="h-px bg-neutral-100" />

        <CategoryFilter
          categories={categories}
          category={category}
          handleCategoryChange={handleCategoryChange}
        />

        <div className="h-px bg-neutral-100" />

        <PriceRangeFilter
          priceRange={priceRange}
          priceValues={priceValues}
          setPriceValues={setPriceValues}
        />

        <div className="h-px bg-neutral-100" />

        <RatingFilter rating={rating} setRating={setRating} />
      </div>
    </div>
  );
};

export default TripFilters;
