const Search = ({ setParPage, setSearchValue, searchValue }) => {
  return (
    <div className="flex items-center justify-between gap-4">
      <select
        onChange={(e) => setParPage(+e.target.value)}
        className="bg-lightBlue rounded-md border-none px-4 py-2 text-deepBlue outline-none focus:border-deepBlue"
      >
        <option value="5">5</option>
        <option value="10">10</option>
        <option value="20">20</option>
      </select>
      <div className="relative w-full max-w-xs">
        <input
          onChange={(e) => setSearchValue(e.target.value)}
          value={searchValue}
          className="w-full rounded-xl bg-white py-3 pl-12 pr-4 text-black placeholder-slate-400 shadow-sm outline-none backdrop-blur transition-all duration-200 focus:shadow-md"
          type="text"
          placeholder="Search…"
        />
        <svg
          className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-emerald-600"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
      </div>
    </div>
  );
};
export default Search;
