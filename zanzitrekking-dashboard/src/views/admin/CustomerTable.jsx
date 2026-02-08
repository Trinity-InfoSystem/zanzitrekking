import { FaEye, FaComment } from "react-icons/fa";

const CustomerTable = ({
  customers,
  currentPage,
  parPage,
  handleViewCustomer,
  handleStartChat,
  showActions = true,
}) => (
  <div className="divide-y divide-primary-100 overflow-x-auto">
    <div className="min-w-[600px]">
      {customers.length > 5 ? (
        <div className="scrollbar-thumb-primary-300 max-h-[400px] overflow-y-auto scrollbar-thin">
          {customers.map((customer, index) => {
            const rowNumber = (currentPage - 1) * parPage + index + 1;
            return (
              <div
                key={customer._id}
                className="grid grid-cols-12 items-center gap-4 bg-white px-4 py-4 transition-colors hover:bg-primary-50/50"
              >
                <div className="col-span-1 text-text-dark">{rowNumber}</div>
                <div className="col-span-3 flex items-center space-x-3">
                  <img
                    src={`https://ui-avatars.com/api/?name=${encodeURIComponent(customer.name)}&background=random`}
                    alt={customer.name}
                    className="h-10 w-10 rounded-full object-cover ring-2 ring-primary-200"
                  />
                  <span className="font-medium text-text-dark">
                    {customer.name}
                  </span>
                </div>
                <div className="col-span-3 text-sm text-text">
                  {customer.email}
                </div>
                <div className="col-span-2">
                  {customer.assignedAdmin && (
                    <span className="text-sm font-medium text-primary-700">
                      {customer.assignedAdmin.name}
                    </span>
                  )}
                </div>
                {showActions && (
                  <div className="col-span-3 flex justify-end gap-2">
                    <button
                      onClick={() => handleViewCustomer(customer._id)}
                      className="shadow-coral-soft inline-flex items-center rounded-lg bg-gradient-to-r from-secondary to-sunshine-400 px-3 py-1.5 text-sm font-medium text-white transition-all hover:scale-105 focus:outline-none focus:ring-2 focus:ring-secondary-200"
                    >
                      <FaEye />
                    </button>
                    <button
                      onClick={() => handleStartChat(customer._id)}
                      className="inline-flex items-center rounded-lg bg-gradient-to-r from-info to-info-600 px-3 py-1.5 text-sm font-medium text-white shadow-sm transition-all hover:scale-105 focus:outline-none focus:ring-2 focus:ring-info-200"
                    >
                      <FaComment />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="scrollbar-thumb-primary-300 max-h-[400px] overflow-y-auto scrollbar-thin">
          {customers.length > 0 ? (
            customers.map((customer, idx) => {
              const rowNumber = (currentPage - 1) * parPage + idx + 1;
              return (
                <div
                  key={customer._id}
                  className="grid grid-cols-12 items-center gap-4 bg-white px-4 py-4 transition-colors duration-150 hover:bg-primary-50/50"
                >
                  <div className="col-span-1 text-text-dark">{rowNumber}</div>
                  <div className="col-span-3 flex items-center space-x-3">
                    <img
                      src={`https://ui-avatars.com/api/?name=${encodeURIComponent(customer.name)}&background=random`}
                      alt={customer.name}
                      className="h-10 w-10 rounded-full object-cover ring-2 ring-primary-200"
                    />
                    <span className="font-medium text-text-dark">
                      {customer.name}
                    </span>
                  </div>
                  <div className="col-span-3 text-sm text-text">
                    {customer.email}
                  </div>
                  <div className="col-span-2">
                    {customer.assignedAdmin && (
                      <span className="text-sm font-medium text-primary-700">
                        {customer.assignedAdmin.name}
                      </span>
                    )}
                  </div>
                  {showActions && (
                    <div className="col-span-3 flex justify-end gap-2">
                      <button
                        onClick={() => handleViewCustomer(customer._id)}
                        className="shadow-coral-soft inline-flex items-center rounded-lg bg-gradient-to-r from-secondary to-sunshine-400 px-3 py-1.5 text-sm font-medium text-white transition-all hover:scale-105 focus:outline-none focus:ring-2 focus:ring-secondary-200"
                      >
                        <FaEye />
                      </button>
                      <button
                        onClick={() => handleStartChat(customer._id)}
                        className="inline-flex items-center rounded-lg bg-gradient-to-r from-info to-info-600 px-3 py-1.5 text-sm font-medium text-white shadow-sm transition-all hover:scale-105 focus:outline-none focus:ring-2 focus:ring-info-200"
                      >
                        <FaComment />
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="flex flex-col items-center justify-center bg-white py-12">
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-primary-50 text-primary-700">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-12 w-12"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z"
                  />
                </svg>
              </div>
              <h3 className="mt-4 text-lg font-medium text-primary-800">
                No customers found
              </h3>
              <button
                onClick={() => setSearchValue("")}
                className="shadow-coral-medium mt-4 inline-flex items-center rounded-xl bg-gradient-to-r from-secondary to-sunshine-400 px-4 py-2 text-sm font-semibold text-white transition-all hover:scale-105 focus:outline-none focus:ring-2 focus:ring-secondary-200"
              >
                Clear search
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  </div>
);

export default CustomerTable;
