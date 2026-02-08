import { FaSort } from "react-icons/fa";

const SortSelect = ({ sort, setSort }) => {
  return (
    <div className="relative inline-block">
      <select
        value={sort}
        onChange={(e) => setSort(e.target.value)}
        className="appearance-none rounded-xl border-2 border-primary-200 bg-white px-6 py-3 pr-10 text-sm font-medium text-primary-800 transition-all duration-300 focus:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary-200"
      >
        <option value="newest-desc">Newest First</option>
        <option value="newest-asc">Oldest First</option>
        <option value="name-asc">Name: A to Z</option>
        <option value="name-desc">Name: Z to A</option>
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
        <FaSort className="h-4 w-4 text-primary-600" />
      </div>
    </div>
  );
};

export default SortSelect;

