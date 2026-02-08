import SearchHeader from "./SearchHeader";
import CustomerItem from "./CustomerItem";
import EmptyState from "../EmptyState/index";
import { FaSearch } from "react-icons/fa";

const CustomerList = ({ customers, currentCustomer, searchTerm, setSearchTerm, setCurrentCustomer }) => {
  const filteredCustomers = customers.filter((customer) =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex h-full flex-col">
      <SearchHeader searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
      
      <div className="flex-1 overflow-y-auto p-2">
        <div className="space-y-1">
          {filteredCustomers.length > 0 ? (
            filteredCustomers.map((customer) => (
              <CustomerItem
                key={customer._id}
                customer={customer}
                isActive={currentCustomer?._id === customer._id}
                onClick={() => setCurrentCustomer(customer)}
              />
            ))
          ) : (
            <EmptyState
              icon={FaSearch}
              title="No customers found"
              description="Try adjusting your search"
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomerList;