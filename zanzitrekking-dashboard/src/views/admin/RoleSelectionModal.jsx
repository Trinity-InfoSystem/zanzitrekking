import { useState, useEffect } from "react";
import { FaTimes, FaCheck } from "react-icons/fa";

const RoleSelectionModal = ({
  showModal,
  adminToUpdate,
  onClose,
  onUpdate,
}) => {
  const [selectedRoutes, setSelectedRoutes] = useState([]);

  // All available routes from adminRoute.jsx
  const availableRoutes = [
    {
      id: "dashboard",
      name: "Dashboard",
      description: "Access to main dashboard",
    },
    {
      id: "categories",
      name: "Categories",
      description: "Manage product categories",
    },
    {
      id: "inclusions",
      name: "Inclusions",
      description: "Manage trip inclusions",
    },
    {
      id: "accommodations",
      name: "Accommodations",
      description: "Manage accommodations",
    },
    {
      id: "payments",
      name: "Payments",
      description: "View payment information",
    },
    {
      id: "qr-scanner",
      name: "QR Code Scanner",
      description: "Scan QR codes for check-in",
    },
    {
      id: "partners",
      name: "Partners",
      description: "Manage partners",
    },
    {
      id: "chat-customer",
      name: "Customer Chat",
      description: "Chat with customers",
    },
    { id: "add-trip", name: "Add Trip", description: "Create new trips" },
    { id: "customers", name: "Customers", description: "Manage customers" },
    { id: "profile", name: "Profile", description: "Manage profile" },
    {
      id: "exclusions",
      name: "Exclusions",
      description: "Manage trip exclusions",
    },
    { id: "meals", name: "Meals", description: "Manage meals" },
    { id: "trips", name: "Trips", description: "Manage trips" },
    { id: "banner", name: "Banner", description: "Manage banners" },
    { id: "add-blog", name: "Add Blog", description: "Create blog posts" },
    { id: "blogPosts", name: "Blog Posts", description: "Manage blog posts" },
    {
      id: "who-we-are",
      name: "Who We Are",
      description: "Manage company info",
    },
    { id: "PDFs", name: "PDF Manager", description: "Manage PDF files" },
    {
      id: "newsletters",
      name: "Newsletters",
      description: "Manage newsletters",
    },
    { id: "reviews", name: "Reviews", description: "Manage reviews" },
    {
      id: "safari-requests",
      name: "Safari Office",
      description: "Manage SafariOffice CRM",
    },
    {
      id: "admin-management",
      name: "Admin Management",
      description: "Manage admin accounts and permissions",
    },
    {
      id: "Careers",
      name: "Careers",
      description: "Manage careers",
    },
    {
      id: "add-career",
      name: "Add Career",
      description: "Create new careers",
    },
    {
      id: "career-applications",
      name: "Career Applications",
      description: "Manage career applications",
    },
    {
      id: "achievements",
      name: "Achievements",
      description: "Manage achievements and certifications",
    },
    {
      id: "impact-stats",
      name: "Impact Stats",
      description: "Manage impact statistics",
    },
    {
      id: "clients",
      name: "Clients",
      description: "Manage client companies",
    },
  ];

  useEffect(() => {
    if (adminToUpdate && adminToUpdate.accessRoutes) {
      setSelectedRoutes([...adminToUpdate.accessRoutes]);
    }
  }, [adminToUpdate]);

  const handleRouteToggle = (routeId) => {
    setSelectedRoutes((prev) => {
      if (prev.includes(routeId)) {
        return prev.filter((id) => id !== routeId);
      } else {
        return [...prev, routeId];
      }
    });
  };

  const handleSelectAll = () => {
    setSelectedRoutes(availableRoutes.map((route) => route.id));
  };

  const handleSelectNone = () => {
    setSelectedRoutes([]);
  };

  const handleUpdate = () => {
    onUpdate(selectedRoutes);
  };

  if (!showModal || !adminToUpdate) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-primary-900/20 backdrop-blur-sm">
      <div className="relative w-full max-w-4xl rounded-2xl bg-white p-6 shadow-2xl ring-1 ring-primary-100">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-text-light transition-colors hover:text-accent"
        >
          <FaTimes className="h-6 w-6" />
        </button>

        <div className="mb-6">
          <h2 className="text-2xl font-bold text-primary-800">
            Update Access Routes
          </h2>
          <p className="text-text-dark">
            Select the routes that{" "}
            <span className="font-semibold text-secondary">
              {adminToUpdate.name}
            </span>{" "}
            can access
          </p>
        </div>

        <div className="mb-6 flex gap-2">
          <button
            onClick={handleSelectAll}
            className="shadow-coral-medium hover:shadow-coral-large rounded-xl bg-gradient-to-r from-secondary to-sunshine-400 px-4 py-2 text-sm font-semibold text-white transition-all hover:scale-105"
          >
            Select All
          </button>
          <button
            onClick={handleSelectNone}
            className="rounded-xl bg-neutral-200 px-4 py-2 text-sm font-medium text-text-dark transition-colors hover:bg-neutral-300"
          >
            Select None
          </button>
        </div>

        <div className="max-h-96 overflow-y-auto">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {availableRoutes.map((route) => (
              <div
                key={route.id}
                className={`cursor-pointer rounded-xl border-2 p-4 transition-all ${
                  selectedRoutes.includes(route.id)
                    ? "shadow-coral-soft border-secondary bg-secondary-50/30"
                    : "border-primary-200 bg-white hover:border-primary-300 hover:shadow-nature-soft"
                }`}
                onClick={() => handleRouteToggle(route.id)}
              >
                <div className="flex items-center space-x-3">
                  <div
                    className={`flex h-5 w-5 items-center justify-center rounded border-2 ${
                      selectedRoutes.includes(route.id)
                        ? "border-secondary bg-secondary"
                        : "border-primary-300"
                    }`}
                  >
                    {selectedRoutes.includes(route.id) && (
                      <FaCheck className="h-3 w-3 text-white" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-primary-800">
                      {route.name}
                    </h3>
                    <p className="text-sm text-text-light">
                      {route.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="rounded-xl bg-neutral-200 px-6 py-2.5 font-medium text-text-dark transition-colors hover:bg-neutral-300"
          >
            Cancel
          </button>
          <button
            onClick={handleUpdate}
            className="shadow-coral-medium hover:shadow-coral-large rounded-xl bg-gradient-to-r from-secondary to-sunshine-400 px-6 py-2.5 font-semibold text-white transition-all hover:scale-105"
          >
            Update Routes
          </button>
        </div>
      </div>
    </div>
  );
};

export default RoleSelectionModal;
