import { Link, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { clearMessage, forgot_password } from "../store/reducers/authReducer";
import toast from "react-hot-toast";
import { FadeLoader } from "react-spinners";
import { useDispatch, useSelector } from "react-redux";
import { ArrowLeft, ArrowRight, Info, Mail, Shield } from "lucide-react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { forgotPasswordSchema } from "../utils/validationSchemas";

const ForgotPasswordEmail = () => {
  const { loader, errorMessage, successMessage } = useSelector(
    (state) => state.auth,
  );
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(forgotPasswordSchema),
  });

  const email = watch("email");

  const onSubmit = async (data) => {
    dispatch(forgot_password({ email: data.email }));
  };

  useEffect(() => {
    if (successMessage) {
      toast.success(successMessage);

      if (successMessage.includes("OTP sent")) {
        navigate("/forgot-password-otp", {
          state: { email },
          replace: true,
        });
      }

      dispatch(clearMessage());
    }

    if (errorMessage) {
      toast.error(errorMessage);
      dispatch(clearMessage());
    }
  }, [dispatch, successMessage, errorMessage, navigate, email]);

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
                Password Reset
              </span>
            </div>
          </div>

          <h1 className="mb-3 text-3xl font-bold text-primary-800 lg:text-4xl">
            Forgot Your Password?
          </h1>
          <div className="mx-auto mb-4 h-1 w-20 rounded-full bg-gradient-to-r from-secondary-500 to-accent-500" />
          <p className="mx-auto max-w-2xl text-base text-text-light">
            Enter your email address and we&apos;ll send you a verification code to
            reset your password
          </p>
        </div>

        {/* Reset Card */}
        <div className="mx-auto max-w-md">
          <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-soft-lg">
            <div className="p-8">
              {/* Form */}
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <div>
                  <label
                    htmlFor="email"
                    className="mb-2 block text-sm font-semibold text-text"
                  >
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <Mail className="h-5 w-5 text-primary-400" />
                    </div>
                    <input
                      type="email"
                      id="email"
                      {...register("email")}
                      className={`w-full rounded-lg border bg-white px-4 py-3 pl-11 text-text transition-all focus:outline-none focus:ring-2 ${
                        errors.email
                          ? "border-red-500 focus:border-red-500 focus:ring-red-200"
                          : "border-neutral-300 focus:border-primary-500 focus:ring-primary-200"
                      }`}
                      placeholder="your@email.com"
                    />
                  </div>
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                  )}
                </div>

                <button
                  type="submit"
                  className="group flex w-full items-center justify-center gap-2 rounded-lg bg-primary-800 px-6 py-3 text-base font-semibold text-white shadow-soft transition-all duration-200 hover:bg-primary-900 hover:shadow-soft-md"
                >
                  <span>Send Verification Code</span>
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </button>
              </form>

              {/* Back to Login */}
              <div className="mt-6 text-center">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-primary-600 transition-colors hover:text-primary-700"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to Login
                </Link>
              </div>

              {/* Help Text */}
              <div className="mt-6 rounded-lg border border-primary-100 bg-primary-50 p-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-100">
                    <Info className="h-4 w-4 text-primary-600" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-primary-800">
                      What happens next?
                    </h4>
                    <p className="mt-1 text-xs text-text-light">
                      We&apos;ll send a 6-digit verification code to your email.
                      Check your inbox and spam folder.
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

export default ForgotPasswordEmail;
