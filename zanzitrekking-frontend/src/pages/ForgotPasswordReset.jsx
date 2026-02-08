import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { clearMessage, reset_password } from "../store/reducers/authReducer";
import toast from "react-hot-toast";
import { FadeLoader } from "react-spinners";
import { useDispatch, useSelector } from "react-redux";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  Eye,
  EyeOff,
  Lock,
  Shield,
} from "lucide-react";

const ForgotPasswordReset = () => {
  const { loader, errorMessage, successMessage } = useSelector(
    (state) => state.auth,
  );
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");

  // Password validation states
  const [passwordChecks, setPasswordChecks] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
  });

  // Get email and OTP from location state
  useEffect(() => {
    if (location.state?.email && location.state?.otp) {
      setEmail(location.state.email);
      setOtp(location.state.otp);
    } else {
      navigate("/forgot-password-email", { replace: true });
    }
  }, [location.state, navigate]);

  // Password validation
  useEffect(() => {
    setPasswordChecks({
      length: newPassword.length >= 6,
      uppercase: /[A-Z]/.test(newPassword),
      lowercase: /[a-z]/.test(newPassword),
      number: /\d/.test(newPassword),
    });
  }, [newPassword]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!newPassword || !confirmPassword) {
      toast.error("Please fill in all fields");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (!passwordChecks.length) {
      toast.error("Password must be at least 6 characters long");
      return;
    }

    dispatch(reset_password({ email, otp, newPassword }));
  };

  const isPasswordValid = Object.values(passwordChecks).every((check) => check);

  useEffect(() => {
    if (successMessage) {
      toast.success(successMessage);

      if (successMessage.includes("Password reset successfully")) {
        setTimeout(() => {
          navigate("/login", {
            state: {
              message:
                "Password reset successfully! You can now login with your new password.",
            },
            replace: true,
          });
        }, 2000);
      }

      dispatch(clearMessage());
    }

    if (errorMessage) {
      toast.error(errorMessage);
      dispatch(clearMessage());
    }
  }, [dispatch, successMessage, errorMessage, navigate]);

  if (!email || !otp) {
    return null;
  }

  return (
    <div className="min-h-screen bg-white py-16 lg:py-20">
      {/* Loading Overlay */}
      {loader && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-primary-900/10 backdrop-blur-sm">
          <div className="rounded-xl bg-white p-8 shadow-soft-lg">
            <FadeLoader color="#2d5f4f" />
          </div>
        </div>
      )}

      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        {/* Header Section with Logo and Badge */}
        <div className="mb-12 text-center">
          {/* Logo and Badge Container */}
          <div className="mb-6 flex items-center justify-center gap-4">
            <Link to="/" className="inline-block">
              <img
                src="/images/newZanzi.jpg"
                alt="Zanzi Trekking"
                className="h-12 w-auto object-contain"
              />
            </Link>
            <div className="inline-flex items-center gap-2 rounded-lg border border-primary-200 bg-primary-50 px-4 py-2">
              <Shield className="h-4 w-4 text-primary-600" />
              <span className="text-sm font-semibold text-primary-700">
                New Password
              </span>
            </div>
          </div>

          <h1 className="mb-3 text-3xl font-bold text-primary-800 lg:text-4xl">
            Set New Password
          </h1>
          <div className="mx-auto mb-4 h-1 w-20 rounded-full bg-gradient-to-r from-secondary-500 to-accent-500" />
          <p className="mx-auto max-w-2xl text-base text-text-light">
            Create a new secure password for your account
          </p>
        </div>

        {/* Reset Card */}
        <div className="mx-auto max-w-md">
          <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-soft-lg">
            <div className="p-8">
              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* New Password */}
                <div>
                  <label
                    htmlFor="newPassword"
                    className="mb-2 block text-sm font-semibold text-text"
                  >
                    New Password
                  </label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <Lock className="h-5 w-5 text-primary-400" />
                    </div>
                    <input
                      type={showPassword ? "text" : "password"}
                      id="newPassword"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full rounded-lg border border-neutral-300 bg-white px-4 py-3 pl-11 pr-11 text-text transition-all focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
                      placeholder="Enter new password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-neutral-400 hover:text-neutral-600"
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="mb-2 block text-sm font-semibold text-text"
                  >
                    Confirm Password
                  </label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <Lock className="h-5 w-5 text-primary-400" />
                    </div>
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      id="confirmPassword"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full rounded-lg border border-neutral-300 bg-white px-4 py-3 pl-11 pr-11 text-text transition-all focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
                      placeholder="Confirm new password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-neutral-400 hover:text-neutral-600"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Password Requirements */}
                {newPassword && (
                  <div className="space-y-2 rounded-lg border border-neutral-200 bg-neutral-50 p-4">
                    <p className="mb-2 text-xs font-semibold text-text">
                      Password Requirements:
                    </p>
                    <div className="flex items-center gap-2 text-xs">
                      <CheckCircle
                        className={`h-3.5 w-3.5 ${passwordChecks.length ? "text-green-500" : "text-neutral-300"}`}
                      />
                      <span
                        className={
                          passwordChecks.length
                            ? "text-green-600"
                            : "text-neutral-500"
                        }
                      >
                        At least 6 characters
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <CheckCircle
                        className={`h-3.5 w-3.5 ${passwordChecks.uppercase ? "text-green-500" : "text-neutral-300"}`}
                      />
                      <span
                        className={
                          passwordChecks.uppercase
                            ? "text-green-600"
                            : "text-neutral-500"
                        }
                      >
                        One uppercase letter
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <CheckCircle
                        className={`h-3.5 w-3.5 ${passwordChecks.lowercase ? "text-green-500" : "text-neutral-300"}`}
                      />
                      <span
                        className={
                          passwordChecks.lowercase
                            ? "text-green-600"
                            : "text-neutral-500"
                        }
                      >
                        One lowercase letter
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <CheckCircle
                        className={`h-3.5 w-3.5 ${passwordChecks.number ? "text-green-500" : "text-neutral-300"}`}
                      />
                      <span
                        className={
                          passwordChecks.number
                            ? "text-green-600"
                            : "text-neutral-500"
                        }
                      >
                        One number
                      </span>
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={!isPasswordValid || newPassword !== confirmPassword}
                  className={`group flex w-full items-center justify-center gap-2 rounded-lg px-6 py-3 text-base font-semibold text-white shadow-soft transition-all duration-200 ${
                    isPasswordValid && newPassword === confirmPassword
                      ? "bg-primary-800 hover:bg-primary-900 hover:shadow-soft-md"
                      : "cursor-not-allowed bg-neutral-400"
                  }`}
                >
                  <span>Reset Password</span>
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </button>
              </form>

              {/* Back to OTP */}
              <div className="mt-6 text-center">
                <button
                  onClick={() =>
                    navigate("/forgot-password-otp", {
                      state: { email },
                      replace: true,
                    })
                  }
                  className="inline-flex items-center gap-2 text-sm font-semibold text-primary-600 transition-colors hover:text-primary-700"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to Verification
                </button>
              </div>

              {/* Success Message */}
              {successMessage &&
                successMessage.includes("Password reset successfully") && (
                  <div className="mt-6 rounded-lg border border-green-200 bg-green-50 p-4">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <div>
                        <h4 className="text-sm font-semibold text-green-800">
                          Password Reset Successful!
                        </h4>
                        <p className="text-xs text-green-600">
                          Redirecting to login page...
                        </p>
                      </div>
                    </div>
                  </div>
                )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordReset;
