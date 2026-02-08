import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { verify_otp, clearMessage } from "../../store/Reducers/authReducer";
import { PropagateLoader } from "react-spinners";
import toast from "react-hot-toast";
import { useNavigate, useLocation } from "react-router-dom";
import { KeyIcon, ArrowLeftIcon, RotateCcwIcon } from "lucide-react";

const VerifyOtp = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { loader, errorMessage, successMessage } = useSelector(
    (state) => state.auth,
  );

  const [state, setState] = useState({
    otp: "",
    email: location.state?.email || "",
  });

  const inputHandle = (e) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 6);
    setState((prev) => ({
      ...prev,
      [e.target.name]: value,
    }));
  };

  const submit = (e) => {
    e.preventDefault();
    if (state.otp.length !== 6) {
      toast.error("Please enter a valid 6-digit OTP");
      return;
    }
    dispatch(verify_otp(state));
  };

  const resendOtp = () => {
    if (!state.email) {
      toast.error("Email is required");
      return;
    }
    dispatch(forgot_password({ email: state.email }));
    toast.success("OTP sent again!");
  };

  useEffect(() => {
    if (errorMessage) {
      toast.error(errorMessage);
      dispatch(clearMessage());
    }
    if (successMessage) {
      toast.success(successMessage);
      dispatch(clearMessage());
      navigate("/reset-password", {
        state: { email: state.email, otp: state.otp },
      });
    }
  }, [
    errorMessage,
    successMessage,
    navigate,
    dispatch,
    state.email,
    state.otp,
  ]);

  useEffect(() => {
    if (!state.email) {
      toast.error("Email is required");
      navigate("/forgot-password");
    }
  }, [state.email, navigate]);

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
                Verify OTP
              </h2>
              <p className="mt-2 text-sm text-text">
                Enter the 6-digit code sent to your email
              </p>
              <p className="mt-1 text-xs font-medium text-secondary">
                {state.email}
              </p>
            </div>

            {/* Form Section */}
            <form className="mt-8 space-y-6" onSubmit={submit}>
              <div className="space-y-5">
                {/* OTP Field */}
                <div className="group relative">
                  <input
                    id="otp"
                    name="otp"
                    type="text"
                    required
                    value={state.otp}
                    onChange={inputHandle}
                    className="peer h-14 w-full rounded-lg border-2 border-primary-200 bg-white px-4 pt-4 text-center font-mono text-lg tracking-widest outline-none transition-all duration-200 focus:border-secondary focus:ring-2 focus:ring-secondary-200"
                    placeholder=" "
                    maxLength={6}
                    pattern="\d{6}"
                    inputMode="numeric"
                  />
                  <label
                    htmlFor="otp"
                    className="absolute left-4 top-4 z-10 text-sm text-text-light transition-all duration-200 peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-focus:top-2 peer-focus:text-xs peer-focus:text-secondary"
                  >
                    Verification Code
                  </label>
                  <KeyIcon className="absolute right-4 top-4 h-5 w-5 text-text-light" />
                </div>
              </div>

              {/* Submit Button */}
              <div>
                <button
                  type="submit"
                  disabled={loader || state.otp.length !== 6}
                  className="shadow-coral-medium hover:shadow-coral-large group relative flex h-14 w-full items-center justify-center overflow-hidden rounded-lg bg-gradient-to-r from-secondary to-sunshine-400 px-4 text-sm font-semibold text-white transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  <span className="relative flex items-center gap-2">
                    {loader ? (
                      <PropagateLoader color="#ffffff" size={8} />
                    ) : (
                      "Verify Code"
                    )}
                  </span>
                </button>
              </div>

              {/* Resend OTP and Back Links */}
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={resendOtp}
                  className="inline-flex items-center text-sm font-medium text-secondary transition duration-150 hover:text-secondary-600"
                >
                  <RotateCcwIcon className="mr-2 h-4 w-4" />
                  Resend Code
                </button>

                <button
                  type="button"
                  onClick={() => navigate("/forgot-password")}
                  className="inline-flex items-center text-sm font-medium text-secondary transition duration-150 hover:text-secondary-600"
                >
                  <ArrowLeftIcon className="mr-2 h-4 w-4" />
                  Change Email
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyOtp;
