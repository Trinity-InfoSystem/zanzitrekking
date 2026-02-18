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
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { resetPasswordSchema } from "../utils/validationSchemas";

const ForgotPasswordReset = () => {
  const { loader, errorMessage, successMessage } = useSelector(
    (state) => state.auth,
  );
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(resetPasswordSchema),
    defaultValues: {
      otp: "",
      password: "",
      confirmPassword: "",
    },
  });

  const password = watch("password");

  // Password validation states
  const [passwordChecks, setPasswordChecks] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    symbol: false,
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
    if (password) {
      setPasswordChecks({
        length: password.length >= 8,
        uppercase: /[A-Z]/.test(password),
        lowercase: /[a-z]/.test(password),
        number: /\d/.test(password),
        symbol: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password),
      });
    }
  }, [password]);

  const onSubmit = async (data) => {
    dispatch(reset_password({ email, otp: data.otp, newPassword: data.password }));
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
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                {/* OTP Input */}
                <div>
                  <label
                    htmlFor="otp"
                    className="mb-2 block text-sm font-semibold text-text"
                  >
                    OTP Code
                  </label>
                  <input
                    type="text"
                    id="otp"
                    {...register("otp")}
                    className={`w-full rounded-lg border bg-white px-4 py-3 text-text transition-all focus:outline-none focus:ring-2 ${
                      errors.otp
                        ? "border-red-500 focus:border-red-500 focus:ring-red-200"
                        : "border-neutral-300 focus:border-primary-500 focus:ring-primary-200"
                    }`}
                    placeholder="Enter 6-digit OTP"
                    maxLength={6}
                  />
                  {errors.otp && (
                    <p className="mt-1 text-sm text-red-600">{errors.otp.message}</p>
                  )}
                </div>

                {/* New Password */}
                <div>
                  <label
                    htmlFor="password"
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
                      id="password"
                      {...register("password")}
                      className={`w-full rounded-lg border bg-white px-4 py-3 pl-11 pr-11 text-text transition-all focus:outline-none focus:ring-2 ${
                        errors.password
                          ? "border-red-500 focus:border-red-500 focus:ring-red-200"
                          : "border-neutral-300 focus:border-primary-500 focus:ring-primary-200"
                      }`}
                      placeholder="Enter new password"
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
                  {errors.password && (
                    <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
                  )}
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
                      {...register("confirmPassword")}
                      className={`w-full rounded-lg border bg-white px-4 py-3 pl-11 pr-11 text-text transition-all focus:outline-none focus:ring-2 ${
                        errors.confirmPassword
                          ? "border-red-500 focus:border-red-500 focus:ring-red-200"
                          : "border-neutral-300 focus:border-primary-500 focus:ring-primary-200"
                      }`}
                      placeholder="Confirm new password"
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
                  {errors.confirmPassword && (
                    <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
                  )}
                </div>

                {/* Password Requirements */}
                {password && (
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
                        At least 8 characters
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
                    <div className="flex items-center gap-2 text-xs">
                      <CheckCircle
                        className={`h-3.5 w-3.5 ${passwordChecks.symbol ? "text-green-500" : "text-neutral-300"}`}
                      />
                      <span
                        className={
                          passwordChecks.symbol
                            ? "text-green-600"
                            : "text-neutral-500"
                        }
                      >
                        One special character
                      </span>
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={!isPasswordValid}
                  className={`group flex w-full items-center justify-center gap-2 rounded-lg px-6 py-3 text-base font-semibold text-white shadow-soft transition-all duration-200 ${
                    isPasswordValid
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
