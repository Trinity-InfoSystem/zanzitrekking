import { FaSearch } from "react-icons/fa";

const SearchHeader = ({ searchTerm, setSearchTerm }) => {
  return (
    <div className="border-b border-primary-200 bg-gradient-to-r from-primary-50 to-secondary-50 p-4">
      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
          <FaSearch className="h-4 w-4 text-primary-700" />
        </div>
        <input
          type="text"
          placeholder="Search admins..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="block w-full rounded-lg border-2 border-primary-200 bg-white p-2.5 pl-10 text-sm text-text-dark placeholder:text-text-light focus:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary-200"
        />
      </div>
    </div>
  );
};

export default SearchHeader;
