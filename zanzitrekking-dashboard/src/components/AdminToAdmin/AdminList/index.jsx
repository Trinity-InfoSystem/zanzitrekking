import SearchHeader from "./SearchHeader";
import AdminItem from "./AdminItem";
import EmptyState from "../EmptyState/index";
import { FaSearch } from "react-icons/fa";

const AdminList = ({
  admins,
  currentAdmin,
  searchTerm,
  setSearchTerm,
  setCurrentAdmin,
}) => {
  const filteredAdmins = admins.filter((admin) =>
    admin.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="flex h-full flex-col">
      <SearchHeader searchTerm={searchTerm} setSearchTerm={setSearchTerm} />

      <div className="flex-1 overflow-y-auto p-2">
        <div className="space-y-1">
          {filteredAdmins.length > 0 ? (
            filteredAdmins.map((admin) => (
              <AdminItem
                key={admin._id}
                admin={admin}
                isActive={currentAdmin?._id === admin._id}
                onClick={() => setCurrentAdmin(admin)}
              />
            ))
          ) : (
            <EmptyState
              icon={FaSearch}
              title="No admins found"
              description="Try adjusting your search"
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminList;
