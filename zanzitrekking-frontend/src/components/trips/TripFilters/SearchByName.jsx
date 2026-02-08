import { Search, X } from "lucide-react";

const SearchByName = ({ searchText, setSearchText }) => {
  return (
    <div>
      <label
        htmlFor="searchText"
        className="mb-4 flex items-center gap-2.5 text-base font-bold text-neutral-900"
      >
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-neutral-100">
          <Search className="h-4 w-4 text-neutral-700" />
        </div>
        Search by Name
      </label>
      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
          <Search className="h-4.5 w-4.5 text-neutral-400" />
        </div>
        <input
          type="text"
          id="searchText"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          placeholder="Search trips..."
          className="w-full rounded-xl border border-neutral-200 bg-white py-3 pl-11 pr-11 text-sm font-medium text-neutral-900 shadow-sm transition-all placeholder:font-normal placeholder:text-neutral-400 hover:border-neutral-300 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
        />
        {searchText && (
          <button
            onClick={() => setSearchText("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-neutral-400 transition-all hover:bg-neutral-100 hover:text-neutral-900 active:scale-90"
            aria-label="Clear search"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
};

export default SearchByName;
