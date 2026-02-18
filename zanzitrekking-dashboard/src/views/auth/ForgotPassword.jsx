import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  forgot_password,
  clearMessage,
} from "../../store/Reducers/authReducer";
import { PropagateLoader } from "react-spinners";
import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";
import { MailIcon, ArrowLeftIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { forgotPasswordSchema } from "../../utils/validationSchemas";

const ForgotPassword = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loader, errorMessage, successMessage } = useSelector(
    (state) => state.auth,
  );

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(forgotPasswordSchema),
  });

  const email = watch("email");

  const onSubmit = (data) => {
    dispatch(forgot_password({ email: data.email }));
  };

  useEffect(() => {
    if (errorMessage) {
      toast.error(errorMessage);
      dispatch(clearMessage());
    }
    if (successMessage) {
      toast.success(successMessage);
      dispatch(clearMessage());
      navigate("/verify-otp", { state: { email } });
    }
  }, [errorMessage, successMessage, navigate, dispatch, state.email]);

  return (
    <div className="relative min-h-screen bg-white px-4">
      {/* Abstract Background Shapes */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute left-1/4 top-1/4 h-64 w-64 -translate-x-1/2 -translate-y-1/2 transform rounded-full bg-secondary opacity-20 blur-3xl"></div>
        <div className="absolute right-1/4 top-3/4 h-96 w-96 -translate-y-1/2 translate-x-1/2 transform rounded-full bg-sunshine-400 opacity-20 blur-3xl"></div>
      </div>

      <div className="relative flex min-h-screen items-center justify-center py-12">
        <div className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white/10 p-1 shadow-nature-large backdrop-blur-lg transition-all duration-300">
          <div className="rounded-xl bg-white p-8">
            {/* Header Section */}
            <div className="text-center">
              <div className="relative mx-auto mb-6">
                <div className="animate-spin-slow absolute inset-0 rounded-full bg-gradient-to-r from-secondary via-sunshine-400 to-secondary opacity-75 blur"></div>
                <div className="relative h-24 w-24 overflow-hidden rounded-full border-4 border-white bg-white shadow-nature-medium">
                  <img
                    className="h-full w-full object-cover"
                    src="/images/logo-zanzi.svg"
                    alt="Zanzi Trekking logo"
                  />
                </div>
              </div>
              <h2 className="mt-6 bg-gradient-to-r from-primary to-primary-700 bg-clip-text text-3xl font-bold tracking-tight text-transparent">
                Reset Your Password
              </h2>
              <p className="mt-2 text-sm text-text">
                Enter your email to receive a verification code
              </p>
            </div>

            {/* Form Section */}
            <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
              <div className="space-y-5">
                {/* Email Field */}
                <div className="group relative">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    {...register("email")}
                    className={`peer h-14 w-full rounded-lg border-2 bg-white px-4 pt-4 outline-none transition-all duration-200 focus:ring-2 ${
                      errors.email
                        ? "border-red-500 focus:border-red-500 focus:ring-red-200"
                        : "border-primary-200 focus:border-secondary focus:ring-secondary-200"
                    }`}
                    placeholder=" "
                  />
                  <label
                    htmlFor="email"
                    className="absolute left-4 top-4 z-10 text-sm text-text-light transition-all duration-200 peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-focus:top-2 peer-focus:text-xs peer-focus:text-secondary"
                  >
                    Email address
                  </label>
                  <MailIcon className="absolute right-4 top-4 h-5 w-5 text-text-light" />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                  )}
                </div>
              </div>

              {/* Submit Button */}
              <div>
                <button
                  type="submit"
                  disabled={loader}
                  className="shadow-coral-medium hover:shadow-coral-large group relative flex h-14 w-full items-center justify-center overflow-hidden rounded-lg bg-gradient-to-r from-secondary to-sunshine-400 px-4 text-sm font-semibold text-white transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  <span className="relative flex items-center gap-2">
                    {loader ? (
                      <PropagateLoader color="#ffffff" size={8} />
                    ) : (
                      "Send Verification Code"
                    )}
                  </span>
                </button>
              </div>

              {/* Back to Login Link */}
              <div className="text-center">
                <Link
                  to="/login"
                  className="inline-flex items-center text-sm font-medium text-secondary transition duration-150 hover:text-secondary-600"
                >
                  <ArrowLeftIcon className="mr-2 h-4 w-4" />
                  Back to login
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
