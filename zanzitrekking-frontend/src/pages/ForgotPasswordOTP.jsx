import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  clearMessage,
  resend_otp,
  verify_otp,
} from "../store/reducers/authReducer";
import toast from "react-hot-toast";
import { FadeLoader } from "react-spinners";
import { useDispatch, useSelector } from "react-redux";
import {
  ArrowLeft,
  ArrowRight,
  Clock,
  Info,
  RefreshCw,
  Shield,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

const otpSchema = yup.object({
  otp: yup
    .string()
    .matches(/^\d{6}$/, "OTP must be 6 digits")
    .required("OTP is required"),
});

const ForgotPasswordOTP = () => {
  const { loader, errorMessage, successMessage } = useSelector(
    (state) => state.auth,
  );
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const [email, setEmail] = useState("");
  const [timeLeft, setTimeLeft] = useState(15 * 60); // 15 minutes in seconds

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(otpSchema),
  });

  // Get email from location state
  useEffect(() => {
    if (location.state?.email) {
      setEmail(location.state.email);
    } else {
      navigate("/forgot-password", { replace: true });
    }
  }, [location.state, navigate]);

  // Timer countdown
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft]);

  const onSubmit = async (data) => {
    dispatch(verify_otp({ email, otp: data.otp }));
  };

  const handleResendOTP = () => {
    if (timeLeft > 0) {
      toast.error(
        `Please wait ${Math.floor(timeLeft / 60)}:${(timeLeft % 60).toString().padStart(2, "0")} before requesting a new code`,
      );
      return;
    }
    setTimeLeft(15 * 60);
    dispatch(resend_otp({ email }));
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  useEffect(() => {
    if (successMessage) {
      toast.success(successMessage);

      if (successMessage.includes("OTP verified")) {
        navigate("/forgot-password/reset", {
          state: { email, otp },
          replace: true,
        });
      }

      dispatch(clearMessage());
    }

    if (errorMessage) {
      toast.error(errorMessage);
      dispatch(clearMessage());
    }
  }, [dispatch, successMessage, errorMessage, navigate, email, otp]);

  if (!email) {
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
                className="h-16 w-auto object-contain"
              />
            </Link>
            <div className="inline-flex items-center gap-2 rounded-lg border border-primary-200 bg-primary-50 px-4 py-2">
              <Shield className="h-4 w-4 text-primary-600" />
              <span className="text-sm font-semibold text-primary-700">
                Verification Code
              </span>
            </div>
          </div>

          <h1 className="mb-3 text-3xl font-bold text-primary-800 lg:text-4xl">
            Enter Verification Code
          </h1>
          <div className="mx-auto mb-4 h-1 w-20 rounded-full bg-gradient-to-r from-secondary-500 to-accent-500" />
          <p className="mx-auto max-w-2xl text-base text-text-light">
            We sent a 6-digit code to{" "}
            <span className="font-semibold text-primary-600">{email}</span>
          </p>
        </div>

        {/* OTP Card */}
        <div className="mx-auto max-w-md">
          <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-soft-lg">
            <div className="p-8">
              {/* Timer */}
              <div className="mb-6 text-center">
                <div className="inline-flex items-center gap-2 rounded-lg border border-accent-200 bg-accent-50 px-4 py-2 text-sm font-medium text-accent-700">
                  <Clock className="h-4 w-4" />
                  Code expires in {formatTime(timeLeft)}
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <div>
                  <label className="mb-2 block text-center text-sm font-semibold text-text">
                    Verification Code
                  </label>
                  <input
                    type="text"
                    {...register("otp")}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, "").slice(0, 6);
                      e.target.value = value;
                    }}
                    className={`w-full rounded-lg border bg-white px-4 py-3 text-center text-2xl font-bold tracking-widest text-text transition-all focus:outline-none focus:ring-2 ${
                      errors.otp
                        ? "border-red-500 focus:border-red-500 focus:ring-red-200"
                        : "border-neutral-300 focus:border-primary-500 focus:ring-primary-200"
                    }`}
                    placeholder="000000"
                    maxLength={6}
                  />
                  {errors.otp && (
                    <p className="mt-1 text-center text-sm text-red-600">
                      {errors.otp.message}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  className="group flex w-full items-center justify-center gap-2 rounded-lg bg-primary-800 px-6 py-3 text-base font-semibold text-white shadow-soft transition-all duration-200 hover:bg-primary-900 hover:shadow-soft-md"
                >
                  <span>Verify Code</span>
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </button>
              </form>

              {/* Resend OTP */}
              <div className="mt-6 text-center">
                <button
                  type="button"
                  onClick={handleResendOTP}
                  disabled={timeLeft > 0}
                  className={`inline-flex items-center gap-2 text-sm font-semibold transition-colors ${
                    timeLeft > 0
                      ? "cursor-not-allowed text-neutral-400"
                      : "text-primary-600 hover:text-primary-700"
                  }`}
                >
                  <RefreshCw className="h-4 w-4" />
                  {timeLeft > 0
                    ? `Resend in ${formatTime(timeLeft)}`
                    : "Resend Code"}
                </button>
              </div>

              {/* Back to Email */}
              <div className="mt-4 text-center">
                <button
                  onClick={() => navigate("/forgot-password")}
                  className="inline-flex items-center gap-2 text-sm font-semibold text-primary-600 transition-colors hover:text-primary-700"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to Email
                </button>
              </div>

              {/* Help Text */}
              <div className="mt-6 rounded-lg border border-primary-100 bg-primary-50 p-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-100">
                    <Info className="h-4 w-4 text-primary-600" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-primary-800">
                      Didn&apos;t receive the code?
                    </h4>
                    <p className="mt-1 text-xs text-text-light">
                      Check your spam folder or wait for the timer to expire to
                      request a new code.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordOTP;
