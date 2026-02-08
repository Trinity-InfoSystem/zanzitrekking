import { useState } from "react";
import {
  CheckCircle,
  Eye,
  EyeOff,
  Key,
  Loader2,
  Lock,
  Shield,
  XCircle,
} from "lucide-react";

const ChangePassword = () => {
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwords, setPasswords] = useState({
    current: "",
    new: "",
    confirm: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPasswords((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
    }, 1500);
  };

  const passwordsMatch =
    passwords.new === passwords.confirm && passwords.new !== "";
  const hasMinLength = passwords.new.length >= 8;
  const hasUppercase = /[A-Z]/.test(passwords.new);
  const hasLowercase = /[a-z]/.test(passwords.new);
  const hasSpecialChar = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(passwords.new);
  const hasNumber = /\d/.test(passwords.new);

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-2xl">
        <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-soft">
          {/* Header */}
          <div className="border-b border-neutral-200 bg-background-muted p-6">
            <div className="mb-3 inline-flex items-center gap-2 rounded-lg border border-primary-200 bg-primary-50 px-3 py-1">
              <Shield className="h-4 w-4 text-primary-600" />
              <span className="text-xs font-semibold text-primary-700">
                Security
              </span>
            </div>
            <h2 className="text-2xl font-bold text-primary-800">
              Change Password
            </h2>
            <p className="mt-1 text-sm text-text-light">
              Update your password to keep your account secure
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6 p-6">
            {/* Current Password */}
            <div className="space-y-2">
              <label
                htmlFor="current"
                className="flex items-center gap-2 text-sm font-semibold text-primary-800"
              >
                <Key className="h-4 w-4 text-primary-600" />
                <span>Current Password</span>
              </label>
              <div className="relative">
                <input
                  type={showCurrentPassword ? "text" : "password"}
                  name="current"
                  id="current"
                  value={passwords.current}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-neutral-300 bg-white px-4 py-3 pr-12 text-sm text-primary-800 placeholder-text-lighter transition-colors focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
                  placeholder="Enter current password"
                  required
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-light transition-colors hover:text-primary-600"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                >
                  {showCurrentPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div className="space-y-2">
              <label
                htmlFor="new"
                className="flex items-center gap-2 text-sm font-semibold text-primary-800"
              >
                <Lock className="h-4 w-4 text-primary-600" />
                <span>New Password</span>
              </label>
              <div className="relative">
                <input
                  type={showNewPassword ? "text" : "password"}
                  name="new"
                  id="new"
                  value={passwords.new}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-neutral-300 bg-white px-4 py-3 pr-12 text-sm text-primary-800 placeholder-text-lighter transition-colors focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
                  placeholder="Enter new password"
                  required
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-light transition-colors hover:text-primary-600"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                >
                  {showNewPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>

              {/* Password Requirements */}
              {passwords.new && (
                <div className="mt-4 rounded-lg border border-neutral-200 bg-background-muted p-4">
                  <p className="mb-3 flex items-center gap-2 text-sm font-semibold text-primary-800">
                    <Shield className="h-4 w-4 text-primary-600" />
                    Password Requirements:
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      {hasMinLength ? (
                        <CheckCircle className="h-4 w-4 text-success-500" />
                      ) : (
                        <XCircle className="h-4 w-4 text-neutral-400" />
                      )}
                      <span
                        className={`text-sm ${hasMinLength ? "font-medium text-success-700" : "text-text-light"}`}
                      >
                        At least 8 characters
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {hasUppercase ? (
                        <CheckCircle className="h-4 w-4 text-success-500" />
                      ) : (
                        <XCircle className="h-4 w-4 text-neutral-400" />
                      )}
                      <span
                        className={`text-sm ${hasUppercase ? "font-medium text-success-700" : "text-text-light"}`}
                      >
                        One uppercase letter
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {hasLowercase ? (
                        <CheckCircle className="h-4 w-4 text-success-500" />
                      ) : (
                        <XCircle className="h-4 w-4 text-neutral-400" />
                      )}
                      <span
                        className={`text-sm ${hasLowercase ? "font-medium text-success-700" : "text-text-light"}`}
                      >
                        One lowercase letter
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {hasNumber ? (
                        <CheckCircle className="h-4 w-4 text-success-500" />
                      ) : (
                        <XCircle className="h-4 w-4 text-neutral-400" />
                      )}
                      <span
                        className={`text-sm ${hasNumber ? "font-medium text-success-700" : "text-text-light"}`}
                      >
                        One number
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {hasSpecialChar ? (
                        <CheckCircle className="h-4 w-4 text-success-500" />
                      ) : (
                        <XCircle className="h-4 w-4 text-neutral-400" />
                      )}
                      <span
                        className={`text-sm ${hasSpecialChar ? "font-medium text-success-700" : "text-text-light"}`}
                      >
                        One special character (!@#$%^&*...)
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <label
                htmlFor="confirm"
                className="flex items-center gap-2 text-sm font-semibold text-primary-800"
              >
                <Shield className="h-4 w-4 text-primary-600" />
                <span>Confirm Password</span>
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirm"
                  id="confirm"
                  value={passwords.confirm}
                  onChange={handleChange}
                  className={`w-full rounded-lg border px-4 py-3 pr-12 text-sm text-primary-800 placeholder-text-lighter transition-colors focus:outline-none focus:ring-2 ${
                    passwords.confirm
                      ? passwordsMatch
                        ? "border-success-300 focus:border-success-500 focus:ring-success-200"
                        : "border-error-300 focus:border-error-500 focus:ring-error-200"
                      : "border-neutral-300 focus:border-primary-500 focus:ring-primary-200"
                  }`}
                  placeholder="Confirm new password"
                  required
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-light transition-colors hover:text-primary-600"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>

              {passwords.confirm && !passwordsMatch && (
                <div className="flex items-center gap-2 rounded-lg border border-error-200 bg-error-50 p-3">
                  <XCircle className="h-4 w-4 text-error-600" />
                  <p className="text-sm font-medium text-error-700">
                    Passwords do not match
                  </p>
                </div>
              )}
              {passwords.confirm && passwordsMatch && (
                <div className="flex items-center gap-2 rounded-lg border border-success-200 bg-success-50 p-3">
                  <CheckCircle className="h-4 w-4 text-success-600" />
                  <p className="text-sm font-medium text-success-700">
                    Passwords match
                  </p>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={
                  isSubmitting ||
                  !passwordsMatch ||
                  !hasMinLength ||
                  !hasUppercase ||
                  !hasLowercase ||
                  !hasSpecialChar ||
                  !hasNumber
                }
                className={`flex w-full items-center justify-center gap-2 rounded-lg px-6 py-3 text-sm font-semibold text-white shadow-soft transition-all focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
                  isSubmitting ||
                  !passwordsMatch ||
                  !hasMinLength ||
                  !hasUppercase ||
                  !hasLowercase ||
                  !hasSpecialChar ||
                  !hasNumber
                    ? "cursor-not-allowed bg-neutral-300"
                    : "bg-primary-600 hover:bg-primary-700 hover:shadow-soft-md"
                }`}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Updating Password...</span>
                  </>
                ) : (
                  <>
                    <Shield className="h-5 w-5" />
                    <span>Update Password</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ChangePassword;
