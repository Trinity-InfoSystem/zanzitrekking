import { FaSearch, FaChevronDown } from "react-icons/fa";

const AdminSearchBar = ({
  parPage,
  setParPage,
  setCurrentPage,
  searchValue,
  setSearchValue,
}) => (
  <div className="border-b border-primary-200 bg-neutral-50 p-5">
    <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
      <div className="flex items-center space-x-2">
        <div className="relative">
          <select
            value={parPage}
            onChange={(e) => {
              setParPage(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="appearance-none rounded-lg border-2 border-primary-200 bg-white py-2.5 pl-4 pr-10 text-sm text-text-dark focus:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary-200"
          >
            <option value="5">5 per page</option>
            <option value="10">10 per page</option>
            <option value="20">20 per page</option>
            <option value="30">30 per page</option>
            <option value="1200">All</option>
          </select>
          <FaChevronDown className="pointer-events-none absolute right-3 top-3 text-primary-700" />
        </div>
      </div>
      <div className="relative w-full md:w-1/3">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
          <FaSearch className="text-primary-700" />
        </div>
        <input
          className="w-full rounded-lg border-2 border-primary-200 bg-white py-2.5 pl-10 pr-4 text-sm text-text-dark transition-all duration-200 placeholder:text-text-light focus:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary-200"
          type="text"
          placeholder="Search admins, emails, roles..."
          value={searchValue}
          onChange={(e) => {
            setSearchValue(e.target.value);
            setCurrentPage(1);
          }}
        />
      </div>
    </div>
  </div>
);

export default AdminSearchBar;
