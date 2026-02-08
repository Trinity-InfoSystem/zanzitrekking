import { FaTimes } from "react-icons/fa";

const AdminModal = ({ showModal, selectedAdmin, onClose }) => {
  if (!showModal || !selectedAdmin) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-primary-900/20 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl ring-1 ring-primary-100">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-text-light transition-colors hover:text-accent"
        >
          <FaTimes className="h-6 w-6" />
        </button>

        <div className="mb-6 flex items-center space-x-4">
          <img
            src={
              selectedAdmin.image ||
              `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedAdmin.name)}&background=random`
            }
            alt={selectedAdmin.name}
            className="h-16 w-16 rounded-full object-cover ring-2 ring-primary-200"
          />
          <div>
            <h2 className="text-2xl font-bold text-primary-800">
              {selectedAdmin.name}
            </h2>
            <p className="text-text-dark">{selectedAdmin.email}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-primary-200 bg-neutral-50 p-4">
            <h3 className="mb-3 text-lg font-bold text-primary-800">
              Basic Information
            </h3>
            <div className="space-y-2">
              <p className="text-text-dark">
                <span className="font-medium text-primary-700">Role:</span>{" "}
                <span className="capitalize text-secondary">
                  {selectedAdmin.role}
                </span>
              </p>
              <p className="text-text-dark">
                <span className="font-medium text-primary-700">Email:</span>{" "}
                {selectedAdmin.email}
              </p>
              <p className="text-text-dark">
                <span className="font-medium text-primary-700">
                  Member Since:
                </span>{" "}
                {new Date(
                  selectedAdmin.createdAt || Date.now(),
                ).toLocaleDateString()}
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-primary-200 bg-neutral-50 p-4">
            <h3 className="mb-3 text-lg font-bold text-primary-800">
              Access Routes
            </h3>
            <div className="space-y-2">
              {selectedAdmin.accessRoutes &&
              selectedAdmin.accessRoutes.length > 0 ? (
                <div className="flex flex-wrap gap-1">
                  {selectedAdmin.accessRoutes.map((route, index) => (
                    <span
                      key={index}
                      className="rounded-full bg-gradient-to-r from-secondary to-sunshine-400 px-2 py-1 text-xs font-medium text-white"
                    >
                      {route}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-text-light">No specific routes assigned</p>
              )}
            </div>
          </div>
        </div>

        {selectedAdmin.companyEmail && (
          <div className="mt-4 rounded-xl border border-primary-200 bg-neutral-50 p-4">
            <h3 className="mb-3 text-lg font-bold text-primary-800">
              Company Information
            </h3>
            <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
              {selectedAdmin.companyEmail && (
                <p className="text-text-dark">
                  <span className="font-medium text-primary-700">
                    Company Email:
                  </span>{" "}
                  {selectedAdmin.companyEmail}
                </p>
              )}
              {selectedAdmin.companyPhoneNumber && (
                <p className="text-text-dark">
                  <span className="font-medium text-primary-700">Phone:</span>{" "}
                  {selectedAdmin.companyPhoneNumber}
                </p>
              )}
              {selectedAdmin.companyAddress && (
                <p className="col-span-2 text-text-dark">
                  <span className="font-medium text-primary-700">Address:</span>{" "}
                  {selectedAdmin.companyAddress}
                </p>
              )}
            </div>
          </div>
        )}

        <div className="mt-6 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="rounded-xl bg-neutral-200 px-6 py-2.5 font-medium text-text-dark transition-colors hover:bg-neutral-300"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminModal;
