"use client";

import { ChevronDown, Filter, Search, X } from "lucide-react";
import { useEffect, useState } from "react";
import { resolveMediaUrl } from "../../utils/imageUtils";

const SearchBar = ({
  showSearchBar,
  setShowSearchBar,
  searchValue,
  setSearchValue,
  category,
  setCategory,
  categories,
  search,
  handleKeyDown,
  topOffset = 0,
}) => {
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);

  // Hide search bar on scroll
  useEffect(() => {
    if (!showSearchBar) { return; }

    let lastScrollY = window.scrollY;
    const threshold = 10; // Minimum scroll distance to trigger hide

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const scrollDifference = Math.abs(currentScrollY - lastScrollY);

      // Hide search bar when scrolling down (more than threshold)
      if (currentScrollY > lastScrollY && scrollDifference > threshold) {
        setShowSearchBar(false);
        setIsCategoryDropdownOpen(false);
      }

      lastScrollY = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [showSearchBar, setShowSearchBar]);

  const getCategoryNameById = (categoryId) => {
    if (!categoryId || !categories?.length) { return "All Destinations"; }
    const match = categories.find((cat) => (cat._id || cat.id) === categoryId);
    return match?.name || "All Destinations";
  };

  const handleSearch = () => {
    search();
  };

  const handleCategoryClick = (categoryId) => {
    // Just set the category without navigating
    // Navigation will happen when user performs a search
    setCategory(categoryId || "");
    setIsCategoryDropdownOpen(false);
  };

  return (
    <div
      style={{ top: `${topOffset}px` }}
      className={`fixed left-0 right-0 z-30 w-full border-b border-neutral-200 bg-white shadow-md backdrop-blur-sm transition-all duration-300 ${showSearchBar
          ? "translate-y-0 opacity-100"
          : "pointer-events-none -translate-y-full opacity-0"
        }`}
    >
      <div className="relative z-10 px-4 py-2.5 md:px-6 md:py-3">
        <div className="relative mx-auto max-w-3xl">
          {/* Compact search form */}
          <div className="flex flex-col gap-2 md:flex-row">
            {/* Search Input */}
            <div className="relative flex-1 overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-sm">
              <div className="flex items-center">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-2.5">
                  <Search className="h-3.5 w-3.5 text-primary-400 md:h-4 md:w-4" />
                </div>
                <input
                  type="text"
                  placeholder="Search destinations, activities..."
                  className="h-full w-full border-0 bg-transparent py-2 pl-8 pr-2 text-xs text-text placeholder-text-lighter focus:outline-none focus:ring-0 md:py-2.5 md:pl-9 md:text-sm"
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                />
              </div>
            </div>

            <div className="flex gap-2">
              {/* Category Dropdown */}
              {categories && categories.length > 0 && (
                <div className="relative flex-1 md:flex-none">
                  <button
                    onClick={() =>
                      setIsCategoryDropdownOpen(!isCategoryDropdownOpen)
                    }
                    className="flex items-center gap-1.5 whitespace-nowrap rounded-lg border border-neutral-200 bg-white px-3 py-2 text-xs font-medium text-neutral-700 transition-all hover:border-neutral-300 hover:bg-neutral-50 md:px-4 md:text-sm"
                  >
                    <Filter className="h-3.5 w-3.5 md:h-4 md:w-4" />
                    <span className="hidden sm:inline">
                      {getCategoryNameById(category)}
                    </span>
                    <span className="sm:hidden">Destination</span>
                    <ChevronDown
                      className={`h-3.5 w-3.5 transition-transform md:h-4 md:w-4 ${isCategoryDropdownOpen ? "rotate-180" : ""
                        }`}
                    />
                  </button>

                  {/* Category Dropdown Menu */}
                  {isCategoryDropdownOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-[49]"
                        onClick={() => setIsCategoryDropdownOpen(false)}
                      />
                      <div className="absolute left-0 top-full z-50 mt-1 w-56 origin-top-left rounded-lg border border-neutral-200 bg-white shadow-lg">
                        <div className="max-h-[60vh] overflow-y-auto p-2">
                          <button
                            onClick={() => handleCategoryClick("")}
                            className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm transition-all ${!category
                                ? "bg-neutral-100 text-neutral-900"
                                : "text-neutral-600 hover:bg-neutral-50"
                              }`}
                          >
                            <span className="font-medium">
                              All Destinations
                            </span>
                          </button>
                          {categories.map((cat) => {
                            const categoryId = cat._id || cat.id || cat.name;
                            return (
                              <button
                                key={categoryId}
                                onClick={() => handleCategoryClick(categoryId)}
                                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition-all ${category === categoryId
                                    ? "bg-neutral-100 text-neutral-900"
                                    : "text-neutral-600 hover:bg-neutral-50"
                                  }`}
                              >
                                {cat.image && (
                                  <div className="relative h-8 w-8 flex-shrink-0 overflow-hidden rounded-lg">
                                    <img
                                      src={resolveMediaUrl(cat.image)}
                                      alt={cat.name}
                                      className="h-full w-full object-cover"
                                    />
                                  </div>
                                )}
                                <div className="min-w-0 flex-1">
                                  <div className="truncate text-sm font-medium">
                                    {cat.name}
                                  </div>
                                  {cat.trips_count !== undefined && (
                                    <div className="text-xs text-neutral-500">
                                      {cat.trips_count || 0} Tours
                                    </div>
                                  )}
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* Search and Close Buttons */}
              <div className="flex">
                <CompactSearchButton onClick={handleSearch} />
                <CompactCloseButton
                  setShowSearchBar={setShowSearchBar}
                  className="flex border-l border-neutral-200"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const CompactSearchButton = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="flex items-center justify-center gap-1.5 bg-primary-600 px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-primary-700 md:px-4 md:py-2.5 md:text-sm"
    >
      <Search className="h-3.5 w-3.5 md:h-4 md:w-4" />
      <span className="hidden sm:inline">Search</span>
    </button>
  );
};

const CompactCloseButton = ({ setShowSearchBar, className = "" }) => {
  return (
    <button
      onClick={() => setShowSearchBar(false)}
      className={`flex items-center justify-center bg-neutral-50 px-2.5 text-text transition-colors hover:bg-neutral-100 md:px-3 ${className}`}
      aria-label="Close search"
    >
      <X className="h-3.5 w-3.5 md:h-4 md:w-4" />
    </button>
  );
};

export default SearchBar;
