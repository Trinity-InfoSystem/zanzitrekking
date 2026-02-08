import { FaFacebookF } from "react-icons/fa6";
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import {
  clearMessage,
  customer_login,
  facebook_login,
  google_login,
} from "../store/reducers/authReducer";
import toast from "react-hot-toast";
import { FadeLoader } from "react-spinners";
import { useDispatch, useSelector } from "react-redux";
import { useGoogleLogin } from "@react-oauth/google";
import { ArrowRight, Eye, EyeOff, Lock, LogIn, Mail, Shield } from "lucide-react";

const Login = () => {
  const { loader, errorMessage, successMessage, userInfo } = useSelector(
    (state) => state.auth,
  );
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const emailRef = useRef();
  const passwordRef = useRef();
  const [showPassword, setShowPassword] = useState(false);

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

  const onSubmit = (e) => {
    e.preventDefault();
    const email = emailRef.current.value;
    const password = passwordRef.current.value;
    dispatch(customer_login({ email, password }));
  };

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

  useEffect(() => {
    if (successMessage) {
      toast.success(successMessage);
      dispatch(clearMessage());
    }

    if (errorMessage) {
      toast.error(errorMessage);
      dispatch(clearMessage());
    }

    if (userInfo) {
      navigate("/");
    }
  }, [dispatch, successMessage, errorMessage, navigate, userInfo]);

  useEffect(() => {
    const {location} = window;
    if (location.state?.message) {
      toast.success(location.state.message);
      window.history.replaceState({}, document.title, location.pathname);
    }
  }, []);

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
              <LogIn className="h-4 w-4 text-primary-600" />
              <span className="text-sm font-semibold text-primary-700">
                Member Access
              </span>
            </div>
          </div>

          <h1 className="mb-3 text-3xl font-bold text-primary-800 lg:text-4xl">
            Welcome Back
          </h1>
          <div className="mx-auto mb-4 h-1 w-20 rounded-full bg-gradient-to-r from-secondary-500 to-accent-500" />
          <p className="mx-auto max-w-2xl text-base text-text-light">
            Sign in to your account to manage your bookings and explore new
            adventures
          </p>
        </div>

        {/* Login Card */}
        <div className="mx-auto max-w-4xl">
          <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-soft-lg">
            <div className="grid md:grid-cols-2">
              {/* Sidebar - Hidden on mobile */}
              <div className="hidden bg-primary-800 p-8 md:block">
                <div className="flex h-full flex-col justify-between">
                  <div>
                    <h2 className="mb-4 text-2xl font-bold text-white">
                      Start Your Adventure
                    </h2>
                    <p className="mb-8 text-sm text-white/90">
                      Access your personalized travel dashboard and manage all
                      your Tanzania adventures in one place.
                    </p>

                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-lg bg-white/10">
                          <Shield className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <h3 className="mb-1 text-sm font-semibold text-white">
                            Secure & Safe
                          </h3>
                          <p className="text-xs text-white/80">
                            Your data is encrypted and protected
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <div className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-lg bg-white/10">
                          <LogIn className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <h3 className="mb-1 text-sm font-semibold text-white">
                            Quick Access
                          </h3>
                          <p className="text-xs text-white/80">
                            Manage bookings and preferences easily
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-8">
                    <div className="rounded-lg border border-white/20 bg-white/5 p-4">
                      <p className="text-xs text-white/80">
                        New to Zanzi Trekking?
                      </p>
                      <Link
                        to="/register"
                        className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-white transition-all hover:gap-2"
                      >
                        Create an account
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
                    Sign In
                  </h2>
                  <p className="text-sm text-text-light">
                    Enter your credentials to continue
                  </p>
                </div>

                <form onSubmit={onSubmit} className="space-y-5">
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
                    <div className="mb-2 flex items-center justify-between">
                      <label
                        htmlFor="password"
                        className="block text-sm font-semibold text-text"
                      >
                        Password
                      </label>
                      <Link
                        to="/forgot-password-email"
                        className="text-xs font-semibold text-primary-600 transition-colors hover:text-primary-700"
                      >
                        Forgot password?
                      </Link>
                    </div>
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
                        placeholder="Enter your password"
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

                  {/* Submit Button */}
                  <button
                    type="submit"
                    className="group flex w-full items-center justify-center gap-2 rounded-lg bg-primary-800 px-6 py-3 text-base font-semibold text-white shadow-soft transition-all duration-200 hover:bg-primary-900 hover:shadow-soft-md"
                  >
                    <span>Sign In</span>
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
                        Or continue with
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

                {/* Mobile Sign Up Link */}
                <p className="mt-6 text-center text-sm text-text-light md:hidden">
                  Don&apos;t have an account?{" "}
                  <Link
                    to="/register"
                    className="font-semibold text-primary-600 transition-colors hover:text-primary-700"
                  >
                    Create an account
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

export default Login;
