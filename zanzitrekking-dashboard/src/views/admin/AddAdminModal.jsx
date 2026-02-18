import { useState } from "react";
import { FaTimes, FaEye, FaEyeSlash } from "react-icons/fa";
import { PropagateLoader } from "react-spinners";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { createAdminSchema } from "../../utils/validationSchemas";

const AddAdminModal = ({ showModal, onClose, onSubmit, loading }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(createAdminSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      role: "admin",
      companyEmail: "",
      companyPhoneNumber: "",
      companyAddress: "",
    },
  });

  const onFormSubmit = (data) => {
    const { confirmPassword, ...adminData } = data;
    onSubmit(adminData);
  };

  const handleClose = () => {
    reset();
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

        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {/* Name */}
            <div>
              <label className="mb-1 block text-sm font-medium text-primary-800">
                Full Name *
              </label>
              <input
                type="text"
                {...register("name")}
                className={`w-full rounded-lg border-2 bg-white px-3 py-2 text-text-dark focus:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary-200 ${
                  errors.name ? "border-accent" : "border-primary-200"
                }`}
                placeholder="Enter full name"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-accent">{errors.name.message}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="mb-1 block text-sm font-medium text-primary-800">
                Email Address *
              </label>
              <input
                type="email"
                {...register("email")}
                className={`w-full rounded-lg border-2 bg-white px-3 py-2 text-text-dark focus:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary-200 ${
                  errors.email ? "border-accent" : "border-primary-200"
                }`}
                placeholder="Enter email address"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-accent">{errors.email.message}</p>
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
                  {...register("password")}
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
                <p className="mt-1 text-sm text-accent">{errors.password.message}</p>
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
                  {...register("confirmPassword")}
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
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            {/* Role */}
            <div>
              <label className="mb-1 block text-sm font-medium text-primary-800">
                Role *
              </label>
              <select
                {...register("role")}
                className="w-full rounded-lg border-2 border-primary-200 bg-white px-3 py-2 text-text-dark focus:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary-200"
              >
                <option value="admin">Admin - Full system access</option>
                <option value="editor">Editor - Create and edit content</option>
                <option value="viewer">Viewer - Read-only access</option>
              </select>
              <p className="mt-1 text-xs text-text-light">
                {watch("role") === "admin" &&
                  "Can manage all admins, content, and system settings"}
                {watch("role") === "editor" &&
                  "Can create and edit trips, categories, and other content"}
                {watch("role") === "viewer" &&
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
                {...register("companyEmail")}
                className={`w-full rounded-lg border-2 bg-white px-3 py-2 text-text-dark focus:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary-200 ${
                  errors.companyEmail ? "border-accent" : "border-primary-200"
                }`}
                placeholder="Enter company email (optional)"
              />
              {errors.companyEmail && (
                <p className="mt-1 text-sm text-accent">
                  {errors.companyEmail.message}
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
                {...register("companyPhoneNumber")}
                className="w-full rounded-lg border-2 border-primary-200 bg-white px-3 py-2 text-text-dark focus:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary-200"
                placeholder="Enter company phone (optional)"
              />
              {errors.companyPhoneNumber && (
                <p className="mt-1 text-sm text-accent">
                  {errors.companyPhoneNumber.message}
                </p>
              )}
            </div>
          </div>

          {/* Company Address */}
          <div>
            <label className="mb-1 block text-sm font-medium text-primary-800">
              Company Address
            </label>
            <textarea
              {...register("companyAddress")}
              rows={3}
              className="w-full rounded-lg border-2 border-primary-200 bg-white px-3 py-2 text-text-dark focus:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary-200"
              placeholder="Enter company address (optional)"
            />
            {errors.companyAddress && (
              <p className="mt-1 text-sm text-accent">
                {errors.companyAddress.message}
              </p>
            )}
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
