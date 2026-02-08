import { FaEye, FaEdit, FaUserCog, FaTrash, FaComments } from "react-icons/fa";
import { canWrite, canAdmin } from "../../utils/routeAccess";

const AdminTable = ({
  admins,
  currentPage,
  parPage,
  handleViewAdmin,
  handleEditAdmin,
  handleDeleteAdmin,
  handleChatAdmin,
  showActions = true,
  userRole,
  currentAdminId,
}) => (
  <div className="divide-y divide-primary-100">
    {admins?.length > 0 ? (
      <div>
        {admins.map((admin, index) => {
          const rowNumber = (currentPage - 1) * parPage + index + 1;
          return (
            <div
              key={admin._id}
              className="grid grid-cols-12 items-center gap-4 bg-white px-4 py-4 transition-colors hover:bg-primary-50/50"
            >
              <div className="col-span-1 text-text-dark">{rowNumber}</div>
              <div className="col-span-2 flex items-center space-x-3">
                <img
                  src={
                    admin.image ||
                    `https://ui-avatars.com/api/?name=${encodeURIComponent(admin.name)}&background=random`
                  }
                  alt={admin.name}
                  className="h-10 w-10 rounded-full object-cover ring-2 ring-primary-200"
                />
                <span className="font-medium text-text-dark">{admin.name}</span>
              </div>
              <div className="col-span-3 text-sm text-text">{admin.email}</div>
              <div className="col-span-2">
                <span
                  className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                    admin.role === "admin"
                      ? "bg-gradient-to-r from-accent to-accent-600 text-white"
                      : admin.role === "editor"
                        ? "bg-gradient-to-r from-info to-info-600 text-white"
                        : "bg-gradient-to-r from-success to-success-600 text-white"
                  }`}
                >
                  {admin.role}
                </span>
              </div>
              <div className="col-span-2">
                <div className="flex flex-wrap gap-1 overflow-hidden">
                  {admin.accessRoutes && admin.accessRoutes.length > 0 ? (
                    admin.accessRoutes.slice(0, 2).map((route, idx) => (
                      <span
                        key={idx}
                        className="truncate rounded-full bg-gradient-to-r from-secondary to-sunshine-400 px-2 py-1 text-xs font-medium text-white"
                      >
                        {route}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-text-light">No routes</span>
                  )}
                  {admin.accessRoutes && admin.accessRoutes.length > 2 && (
                    <span className="text-xs text-text-light">
                      +{admin.accessRoutes.length - 2} more
                    </span>
                  )}
                </div>
              </div>
              {showActions && canWrite(userRole) && (
                <div className="col-span-2 flex justify-end gap-1">
                  {admin._id !== currentAdminId && (
                    <button
                      onClick={() => handleChatAdmin(admin)}
                      className="inline-flex items-center rounded-lg bg-gradient-to-r from-info to-info-600 px-2 py-1.5 text-xs font-medium text-white shadow-sm transition-all hover:scale-105 focus:outline-none focus:ring-2 focus:ring-info-200"
                      title="Chat with Admin"
                    >
                      <FaComments className="h-3 w-3" />
                    </button>
                  )}
                  <button
                    onClick={() => handleViewAdmin(admin)}
                    className="inline-flex items-center rounded-lg bg-gradient-to-r from-secondary to-sunshine-400 px-2 py-1.5 text-xs font-medium text-white shadow-sm transition-all hover:scale-105 focus:outline-none focus:ring-2 focus:ring-secondary-200"
                    title="View Admin"
                  >
                    <FaEye className="h-3 w-3" />
                  </button>
                  {canAdmin(userRole) && (
                    <button
                      onClick={() => handleEditAdmin(admin)}
                      className="inline-flex items-center rounded-lg bg-gradient-to-r from-primary to-primary-600 px-2 py-1.5 text-xs font-medium text-white shadow-sm transition-all hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary-200"
                      title="Edit Access Routes"
                    >
                      <FaUserCog className="h-3 w-3" />
                    </button>
                  )}
                  {canAdmin(userRole) && admin._id !== currentAdminId && (
                    <button
                      onClick={() => handleDeleteAdmin(admin)}
                      className="inline-flex items-center rounded-lg bg-gradient-to-r from-accent to-accent-600 px-2 py-1.5 text-xs font-medium text-white shadow-sm transition-all hover:scale-105 focus:outline-none focus:ring-2 focus:ring-accent-200"
                      title="Delete Admin"
                    >
                      <FaTrash className="h-3 w-3" />
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
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
              d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
            />
          </svg>
        </div>
        <h3 className="mt-4 text-lg font-medium text-primary-800">No admins found</h3>
        <p className="mt-2 text-sm text-text-light">
          Try adjusting your search criteria
        </p>
      </div>
    )}
  </div>
);

export default AdminTable;
