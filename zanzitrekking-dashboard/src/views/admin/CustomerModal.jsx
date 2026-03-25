import { FaTimes } from "react-icons/fa";
import { resolveMediaUrl } from "../../utils/constants";

const CustomerModal = ({ showModal, selectedCustomer, onClose }) => {
  if (!showModal || !selectedCustomer) return null;
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
            src={`https://ui-avatars.com/api/?name=${encodeURIComponent(selectedCustomer.name)}&background=random`}
            alt={selectedCustomer.name}
            className="h-16 w-16 rounded-full object-cover ring-2 ring-primary-200"
          />
          <div>
            <h2 className="text-2xl font-bold text-primary-800">
              {selectedCustomer.name}
            </h2>
            <p className="text-text-dark">{selectedCustomer.email}</p>
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
                {selectedCustomer.role}
              </p>
              <p className="text-text-dark">
                <span className="font-medium text-primary-700">
                  Signup Method:
                </span>{" "}
                {selectedCustomer.method}
              </p>
              <p className="text-text-dark">
                <span className="font-medium text-primary-700">
                  Member Since:
                </span>{" "}
                {new Date(selectedCustomer.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
          {selectedCustomer.assignedAdmin && (
            <div className="rounded-xl border border-primary-200 bg-neutral-50 p-4">
              <h3 className="mb-3 text-lg font-bold text-primary-800">
                Assigned Admin
              </h3>
              <div className="flex items-center space-x-3">
                <img
                  src={resolveMediaUrl(selectedCustomer.assignedAdmin.image)}
                  alt={selectedCustomer.assignedAdmin.name}
                  className="h-12 w-12 rounded-full object-cover ring-2 ring-secondary"
                />
                <div>
                  <p className="font-medium text-primary-800">
                    {selectedCustomer.assignedAdmin.name}
                  </p>
                  <p className="text-sm text-text-light">
                    {selectedCustomer.assignedAdmin.email}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
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

export default CustomerModal;
