import { FaFacebookF } from "react-icons/fa6";
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  clearMessage,
  customer_register,
  facebook_login,
  google_login,
} from "../store/reducers/authReducer";
import toast from "react-hot-toast";
import { FadeLoader } from "react-spinners";
import { useGoogleLogin } from "@react-oauth/google";
import {
  ArrowRight,
  CheckCircle,
  Eye,
  EyeOff,
  Lock,
  Mail,
  Shield,
  User,
  UserPlus,
} from "lucide-react";

const Register = () => {
  const navigate = useNavigate();
  const { loader, errorMessage, successMessage, userInfo } = useSelector(
    (state) => state.auth,
  );
  const dispatch = useDispatch();
  const nameRef = useRef();
  const emailRef = useRef();
  const passwordRef = useRef();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Password validation states
  const [passwordChecks, setPasswordChecks] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    symbol: false,
  });

  useEffect(() => {
    if (!window.FB) {
      window.fbAsyncInit = function () {
        window.FB.init({
          appId: import.meta.env.VITE_FACEBOOK_APP_ID || "",
          cookie: true,
          xfbml: true,
          version: "v18.0",
        });
      };

      (function (d, s, id) {
        let js,
          fjs = d.getElementsByTagName(s)[0];
        if (d.getElementById(id)) {return;}
        js = d.createElement(s);
        js.id = id;
        js.src = "https://connect.facebook.net/en_US/sdk.js";
        fjs.parentNode.insertBefore(js, fjs);
      })(document, "script", "facebook-jssdk");
    }
  }, []);

  // Password validation
  useEffect(() => {
    setPasswordChecks({
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
      symbol: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password),
    });
  }, [password]);

  const register = (e) => {
    e.preventDefault();
    const name = nameRef.current.value;
    const email = emailRef.current.value;
    const passwordValue = passwordRef.current.value;

    // Validate password requirements
    const isPasswordValid = Object.values(passwordChecks).every(
      (check) => check,
    );

    if (!isPasswordValid) {
      toast.error(
        "Please ensure your password meets all the requirements below",
      );
      return;
    }

    // Validate password match
    if (passwordValue !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    dispatch(customer_register({ name, email, password: passwordValue }));
  };

  const isPasswordValid = Object.values(passwordChecks).every((check) => check);
  const passwordsMatch = password === confirmPassword && confirmPassword !== "";

  useEffect(() => {
    if (errorMessage) {
      toast.error(errorMessage);
      dispatch(clearMessage());
    }
    if (successMessage) {
      toast.success(successMessage);
      dispatch(clearMessage());
    }
    if (userInfo) {
      navigate("/");
    }
  }, [errorMessage, successMessage, dispatch, navigate, userInfo]);

  const handleGoogleSuccess = (credentialResponse) => {
    dispatch(google_login(credentialResponse.access_token));
  };

  const handleGoogleError = () => {
    toast.error("Google login failed");
  };

  const googleLogin = useGoogleLogin({
    onSuccess: handleGoogleSuccess,
    onError: handleGoogleError,
    flow: "implicit",
  });

  const handleFacebookLogin = () => {
    if (window.FB) {
      window.FB.login(
        (response) => {
          if (response.authResponse) {
            dispatch(
              facebook_login({
                accessToken: response.authResponse.accessToken,
                userID: response.authResponse.userID,
              }),
            );
          } else {
            toast.error("Facebook login failed");
          }
        },
        { scope: "public_profile,email" },
      );
    } else {
      toast.error("Facebook SDK not loaded");
    }
  };

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
              <UserPlus className="h-4 w-4 text-primary-600" />
              <span className="text-sm font-semibold text-primary-700">
                Create Account
              </span>
            </div>
          </div>

          <h1 className="mb-3 text-3xl font-bold text-primary-800 lg:text-4xl">
            Start Your Adventure
          </h1>
          <div className="mx-auto mb-4 h-1 w-20 rounded-full bg-gradient-to-r from-secondary-500 to-accent-500" />
          <p className="mx-auto max-w-2xl text-base text-text-light">
            Create your account to unlock exclusive deals and personalized trip
            planning
          </p>
        </div>

        {/* Register Card */}
        <div className="mx-auto max-w-4xl">
          <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-soft-lg">
            <div className="grid md:grid-cols-2">
              {/* Sidebar - Hidden on mobile */}
              <div className="hidden bg-primary-800 p-8 md:block">
                <div className="flex h-full flex-col justify-between">
                  <div>
                    <h2 className="mb-4 text-2xl font-bold text-white">
                      Join Our Community
                    </h2>
                    <p className="mb-8 text-sm text-white/90">
                      Become part of the Zanzi Trekking family and explore
                      Tanzania&apos;s most stunning destinations.
                    </p>

                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-lg bg-white/10">
                          <Shield className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <h3 className="mb-1 text-sm font-semibold text-white">
                            Exclusive Benefits
                          </h3>
                          <p className="text-xs text-white/80">
                            Access special offers and member-only deals
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <div className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-lg bg-white/10">
                          <UserPlus className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <h3 className="mb-1 text-sm font-semibold text-white">
                            Easy Management
                          </h3>
                          <p className="text-xs text-white/80">
                            Track bookings and save your favorite trips
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-8">
                    <div className="rounded-lg border border-white/20 bg-white/5 p-4">
                      <p className="text-xs text-white/80">
                        Already have an account?
                      </p>
                      <Link
                        to="/login"
                        className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-white transition-all hover:gap-2"
                      >
                        Sign in instead
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>

              {/* Form Section */}
              <div className="p-8 md:p-10">
                <div className="mb-8">
                  <h2 className="mb-2 text-2xl font-bold text-primary-800">
                    Create Account
                  </h2>
                  <p className="text-sm text-text-light">
                    Fill in your details to get started
                  </p>
                </div>

                <form onSubmit={register} className="space-y-5">
                  {/* Name Input */}
                  <div>
                    <label
                      htmlFor="name"
                      className="mb-2 block text-sm font-semibold text-text"
                    >
                      Full Name
                    </label>
                    <div className="relative">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        <User className="h-5 w-5 text-primary-400" />
                      </div>
                      <input
                        className="w-full rounded-lg border border-neutral-300 bg-white px-4 py-3 pl-11 text-text transition-all focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
                        type="text"
                        name="name"
                        id="name"
                        ref={nameRef}
                        placeholder="John Doe"
                        required
                      />
                    </div>
                  </div>

                  {/* Email Input */}
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
                        className="w-full rounded-lg border border-neutral-300 bg-white px-4 py-3 pl-11 text-text transition-all focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
                        type="email"
                        name="email"
                        id="email"
                        ref={emailRef}
                        placeholder="your@email.com"
                        required
                      />
                    </div>
                  </div>

                  {/* Password Input */}
                  <div>
                    <label
                      htmlFor="password"
                      className="mb-2 block text-sm font-semibold text-text"
                    >
                      Password
                    </label>
                    <div className="relative">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        <Lock className="h-5 w-5 text-primary-400" />
                      </div>
                      <input
                        className="w-full rounded-lg border border-neutral-300 bg-white px-4 py-3 pl-11 pr-11 text-text transition-all focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
                        type={showPassword ? "text" : "password"}
                        name="password"
                        id="password"
                        ref={passwordRef}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Create a strong password"
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

                    {/* Password Requirements */}
                    {password && (
                      <div className="mt-3 space-y-2 rounded-lg border border-neutral-200 bg-neutral-50 p-4">
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
                            One special character (!@#$%^&*...)
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Confirm Password Input */}
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
                        className={`w-full rounded-lg border bg-white px-4 py-3 pl-11 pr-11 text-text transition-all focus:outline-none focus:ring-2 ${
                          confirmPassword
                            ? passwordsMatch
                              ? "border-green-500 focus:border-green-500 focus:ring-green-200"
                              : "border-red-500 focus:border-red-500 focus:ring-red-200"
                            : "border-neutral-300 focus:border-primary-500 focus:ring-primary-200"
                        }`}
                        type={showConfirmPassword ? "text" : "password"}
                        name="confirmPassword"
                        id="confirmPassword"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm your password"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-neutral-400 hover:text-neutral-600"
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                    {confirmPassword && !passwordsMatch && (
                      <p className="mt-1 text-xs text-red-600">
                        Passwords do not match
                      </p>
                    )}
                    {confirmPassword && passwordsMatch && (
                      <p className="mt-1 text-xs text-green-600">
                        Passwords match
                      </p>
                    )}
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={password && (!isPasswordValid || !passwordsMatch)}
                    className={`group flex w-full items-center justify-center gap-2 rounded-lg px-6 py-3 text-base font-semibold text-white shadow-soft transition-all duration-200 ${
                      password && (!isPasswordValid || !passwordsMatch)
                        ? "cursor-not-allowed bg-neutral-400"
                        : "bg-primary-800 hover:bg-primary-900 hover:shadow-soft-md"
                    }`}
                  >
                    <span>Create Account</span>
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </button>
                </form>

                {/* Divider */}
                <div className="my-6">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-neutral-200"></div>
                    </div>
                    <div className="relative flex justify-center text-xs">
                      <span className="bg-white px-3 text-text-light">
                        Or sign up with
                      </span>
                    </div>
                  </div>
                </div>

                {/* Social Login Buttons */}
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={googleLogin}
                    type="button"
                    className="flex items-center justify-center gap-2 rounded-lg border border-neutral-300 bg-white px-4 py-2.5 text-sm font-medium text-text transition-all duration-200 hover:border-neutral-400 hover:bg-neutral-50"
                  >
                    <img
                      src="https://www.svgrepo.com/show/475656/google-color.svg"
                      alt="Google"
                      className="h-5 w-5"
                    />
                    <span>Google</span>
                  </button>
                  <button
                    onClick={handleFacebookLogin}
                    type="button"
                    className="flex items-center justify-center gap-2 rounded-lg border border-neutral-300 bg-white px-4 py-2.5 text-sm font-medium text-text transition-all duration-200 hover:border-neutral-400 hover:bg-neutral-50"
                  >
                    <FaFacebookF className="h-4 w-4 text-[#1877F2]" />
                    <span>Facebook</span>
                  </button>
                </div>

                {/* Mobile Login Link */}
                <p className="mt-6 text-center text-sm text-text-light md:hidden">
                  Already have an account?{" "}
                  <Link
                    to="/login"
                    className="font-semibold text-primary-600 transition-colors hover:text-primary-700"
                  >
                    Sign in
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
