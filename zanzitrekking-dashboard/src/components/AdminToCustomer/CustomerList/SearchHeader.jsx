import { FaSearch } from "react-icons/fa";

const SearchHeader = ({ searchTerm, setSearchTerm }) => {
  return (
    <div className="border-b border-primary-200 bg-gradient-to-r from-primary-50 to-secondary-50 p-4">
      <div className="relative">
        <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-primary-700" />
        <input
          type="text"
          className="w-full rounded-lg border-2 border-primary-200 bg-white py-2.5 pl-10 pr-4 text-sm text-text-dark placeholder:text-text-light focus:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary-200"
          placeholder="Search customers..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
    </div>
  );
};

export default SearchHeader;
