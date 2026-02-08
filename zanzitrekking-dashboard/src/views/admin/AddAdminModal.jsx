import { useState } from "react";
import { FaTimes, FaEye, FaEyeSlash } from "react-icons/fa";
import { PropagateLoader } from "react-spinners";

const AddAdminModal = ({ showModal, onClose, onSubmit, loading }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "admin",
    companyEmail: "",
    companyPhoneNumber: "",
    companyAddress: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (formData.companyEmail && !/\S+@\S+\.\S+/.test(formData.companyEmail)) {
      newErrors.companyEmail = "Company email is invalid";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      const { confirmPassword, ...adminData } = formData;
      onSubmit(adminData);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleClose = () => {
    setFormData({
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      role: "admin",
      companyEmail: "",
      companyPhoneNumber: "",
      companyAddress: "",
    });
    setErrors({});
    onClose();
  };

  if (!showModal) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-primary-900/20 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl animate-scale-in rounded-2xl bg-white p-6 shadow-2xl ring-1 ring-primary-100">
        <button
          onClick={handleClose}
          className="absolute right-4 top-4 rounded-full p-1 text-text-light transition-all hover:scale-110 hover:bg-accent hover:text-white"
        >
          <FaTimes className="h-5 w-5" />
        </button>

        <div className="mb-6">
          <h2 className="text-2xl font-bold text-primary-800">Add New Admin</h2>
          <p className="text-text-light">
            Create a new admin account with specific role and permissions
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {/* Name */}
            <div>
              <label className="mb-1 block text-sm font-medium text-primary-800">
                Full Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`w-full rounded-lg border-2 bg-white px-3 py-2 text-text-dark focus:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary-200 ${
                  errors.name ? "border-accent" : "border-primary-200"
                }`}
                placeholder="Enter full name"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-accent">{errors.name}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="mb-1 block text-sm font-medium text-primary-800">
                Email Address *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full rounded-lg border-2 bg-white px-3 py-2 text-text-dark focus:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary-200 ${
                  errors.email ? "border-accent" : "border-primary-200"
                }`}
                placeholder="Enter email address"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-accent">{errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="mb-1 block text-sm font-medium text-primary-800">
                Password *
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`w-full rounded-lg border-2 bg-white px-3 py-2 pr-10 text-text-dark focus:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary-200 ${
                    errors.password ? "border-accent" : "border-primary-200"
                  }`}
                  placeholder="Enter password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-text-light transition-colors hover:text-secondary"
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-accent">{errors.password}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="mb-1 block text-sm font-medium text-primary-800">
                Confirm Password *
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`w-full rounded-lg border-2 bg-white px-3 py-2 pr-10 text-text-dark focus:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary-200 ${
                    errors.confirmPassword
                      ? "border-accent"
                      : "border-primary-200"
                  }`}
                  placeholder="Confirm password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-2.5 text-text-light transition-colors hover:text-secondary"
                >
                  {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-accent">
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            {/* Role */}
            <div>
              <label className="mb-1 block text-sm font-medium text-primary-800">
                Role *
              </label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full rounded-lg border-2 border-primary-200 bg-white px-3 py-2 text-text-dark focus:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary-200"
              >
                <option value="admin">Admin - Full system access</option>
                <option value="editor">Editor - Create and edit content</option>
                <option value="viewer">Viewer - Read-only access</option>
              </select>
              <p className="mt-1 text-xs text-text-light">
                {formData.role === "admin" &&
                  "Can manage all admins, content, and system settings"}
                {formData.role === "editor" &&
                  "Can create and edit trips, categories, and other content"}
                {formData.role === "viewer" &&
                  "Can only view content and reports"}
              </p>
            </div>

            {/* Company Email */}
            <div>
              <label className="mb-1 block text-sm font-medium text-primary-800">
                Company Email
              </label>
              <input
                type="email"
                name="companyEmail"
                value={formData.companyEmail}
                onChange={handleChange}
                className={`w-full rounded-lg border-2 bg-white px-3 py-2 text-text-dark focus:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary-200 ${
                  errors.companyEmail ? "border-accent" : "border-primary-200"
                }`}
                placeholder="Enter company email (optional)"
              />
              {errors.companyEmail && (
                <p className="mt-1 text-sm text-accent">
                  {errors.companyEmail}
                </p>
              )}
            </div>

            {/* Company Phone */}
            <div>
              <label className="mb-1 block text-sm font-medium text-primary-800">
                Company Phone
              </label>
              <input
                type="tel"
                name="companyPhoneNumber"
                value={formData.companyPhoneNumber}
                onChange={handleChange}
                className="w-full rounded-lg border-2 border-primary-200 bg-white px-3 py-2 text-text-dark focus:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary-200"
                placeholder="Enter company phone (optional)"
              />
            </div>
          </div>

          {/* Company Address */}
          <div>
            <label className="mb-1 block text-sm font-medium text-primary-800">
              Company Address
            </label>
            <textarea
              name="companyAddress"
              value={formData.companyAddress}
              onChange={handleChange}
              rows={3}
              className="w-full rounded-lg border-2 border-primary-200 bg-white px-3 py-2 text-text-dark focus:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary-200"
              placeholder="Enter company address (optional)"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="rounded-xl bg-neutral-200 px-4 py-2 font-medium text-text-dark transition-colors hover:bg-neutral-300"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="shadow-coral-medium hover:shadow-coral-large min-h-14 rounded-xl bg-gradient-to-r from-secondary to-sunshine-400 px-4 py-2 font-semibold text-white transition-all hover:scale-105 disabled:opacity-50"
              disabled={loading}
            >
              {loading ? (
                <PropagateLoader color="#ffffff" size={8} />
              ) : (
                "Create Admin"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddAdminModal;
