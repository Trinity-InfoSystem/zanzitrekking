import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { reset_password, clearMessage } from "../../store/Reducers/authReducer";
import { PropagateLoader } from "react-spinners";
import { EyeIcon, EyeOffIcon, ArrowLeftIcon, KeyIcon } from "lucide-react";
import toast from "react-hot-toast";
import { useNavigate, useLocation } from "react-router-dom";

const ResetPassword = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { loader, errorMessage, successMessage } = useSelector(
    (state) => state.auth,
  );

  const [state, setState] = useState({
    newPassword: "",
    confirmPassword: "",
    email: location.state?.email || "",
    otp: location.state?.otp || "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const inputHandle = (e) => {
    const { name, value } = e.target;
    setState((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const submit = (e) => {
    e.preventDefault();

    if (state.newPassword !== state.confirmPassword) {
      toast.error("Passwords don't match");
      return;
    }

    if (state.newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    dispatch(
      reset_password({
        email: state.email,
        otp: state.otp,
        newPassword: state.newPassword,
      }),
    );
  };

  useEffect(() => {
    if (errorMessage) {
      toast.error(errorMessage);
      dispatch(clearMessage());
    }
    if (successMessage) {
      toast.success(successMessage);
      dispatch(clearMessage());
      navigate("/admin/login");
    }
  }, [errorMessage, successMessage, dispatch, navigate]);

  useEffect(() => {
    if (!state.email || !state.otp) {
      toast.error("Invalid reset request");
      navigate("/forgot-password");
    }
  }, [state.email, state.otp, navigate]);

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
                Reset Password
              </h2>
              <p className="mt-2 text-sm text-text">Enter your new password</p>
            </div>

            {/* Form Section */}
            <form className="mt-8 space-y-6" onSubmit={submit}>
              <div className="space-y-5">
                {/* New Password Field */}
                <div className="group relative">
                  <input
                    id="newPassword"
                    name="newPassword"
                    type={showPassword ? "text" : "password"}
                    required
                    value={state.newPassword}
                    onChange={inputHandle}
                    className="peer h-14 w-full rounded-lg border-2 border-primary-200 bg-white px-4 pr-12 pt-4 outline-none transition-all duration-200 focus:border-secondary focus:ring-2 focus:ring-secondary-200"
                    placeholder=" "
                    minLength={6}
                  />
                  <label
                    htmlFor="newPassword"
                    className="absolute left-4 top-4 z-10 text-sm text-text-light transition-all duration-200 peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-focus:top-2 peer-focus:text-xs peer-focus:text-secondary"
                  >
                    New Password
                  </label>
                  <KeyIcon className="absolute right-12 top-4 h-5 w-5 text-text-light" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-4 text-text-light hover:text-secondary"
                  >
                    {showPassword ? (
                      <EyeOffIcon className="h-5 w-5" />
                    ) : (
                      <EyeIcon className="h-5 w-5" />
                    )}
                  </button>
                </div>

                {/* Confirm Password Field */}
                <div className="group relative">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    value={state.confirmPassword}
                    onChange={inputHandle}
                    className="peer h-14 w-full rounded-lg border-2 border-primary-200 bg-white px-4 pr-12 pt-4 outline-none transition-all duration-200 focus:border-secondary focus:ring-2 focus:ring-secondary-200"
                    placeholder=" "
                    minLength={6}
                  />
                  <label
                    htmlFor="confirmPassword"
                    className="absolute left-4 top-4 z-10 text-sm text-text-light transition-all duration-200 peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-focus:top-2 peer-focus:text-xs peer-focus:text-secondary"
                  >
                    Confirm Password
                  </label>
                  <KeyIcon className="absolute right-12 top-4 h-5 w-5 text-text-light" />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-4 text-text-light hover:text-secondary"
                  >
                    {showConfirmPassword ? (
                      <EyeOffIcon className="h-5 w-5" />
                    ) : (
                      <EyeIcon className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Password Match Indicator */}
              {state.newPassword && state.confirmPassword && (
                <div
                  className={`text-sm font-semibold ${state.newPassword === state.confirmPassword ? "text-success-600" : "text-accent-600"}`}
                >
                  {state.newPassword === state.confirmPassword
                    ? "✓ Passwords match"
                    : "✗ Passwords do not match"}
                </div>
              )}

              {/* Submit Button */}
              <div>
                <button
                  type="submit"
                  disabled={
                    loader ||
                    state.newPassword !== state.confirmPassword ||
                    state.newPassword.length < 6
                  }
                  className="shadow-coral-medium hover:shadow-coral-large group relative flex h-14 w-full items-center justify-center overflow-hidden rounded-lg bg-gradient-to-r from-secondary to-sunshine-400 px-4 text-sm font-semibold text-white transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  <span className="relative flex items-center gap-2">
                    {loader ? (
                      <PropagateLoader color="#ffffff" size={8} />
                    ) : (
                      "Reset Password"
                    )}
                  </span>
                </button>
              </div>

              {/* Back Link */}
              <div className="text-center">
                <button
                  type="button"
                  onClick={() =>
                    navigate("/verify-otp", { state: { email: state.email } })
                  }
                  className="inline-flex items-center text-sm font-medium text-secondary transition duration-150 hover:text-secondary-600"
                >
                  <ArrowLeftIcon className="mr-2 h-4 w-4" />
                  Back to verification
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
