import { BrowserRouter, Navigate, Route, Routes, useLocation } from "react-router-dom";
import { lazy, Suspense, useEffect } from "react";
import "./App.css";
import { useDispatch, useSelector } from "react-redux";
import { get_category } from "./store/reducers/homeReducer";
import {
  get_cart_trips,
  get_wishlist_trips,
} from "./store/reducers/cardReducer";
import "aos/dist/aos.css";

// ✅ Improved loading component with better UX
const RouteLoader = () => (
  <div className="flex min-h-screen items-center justify-center bg-white">
    <div className="text-center">
      <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600"></div>
      <p className="text-base font-medium text-neutral-600">Loading page...</p>
    </div>
  </div>
);

// ✅ Lazy load all components with better chunk names
const Home = lazy(() => import("./pages/Home"));
const Trips = lazy(() => import("./pages/Trips"));
const Card = lazy(() => import("./pages/Cart"));
const AboutUs = lazy(() => import("./pages/AboutUs"));
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const ForgotPasswordEmail = lazy(() => import("./pages/ForgotPasswordEmail"));
const ForgotPasswordOTP = lazy(() => import("./pages/ForgotPasswordOTP"));
const ForgotPasswordReset = lazy(() => import("./pages/ForgotPasswordReset"));
const GoogleReviews = lazy(() => import("./pages/GoogleReviews"));
const SafariBookingReviews = lazy(() => import("./pages/SafariBookingReviews"));
const GetYourGuideReviews = lazy(() => import("./pages/GetYourGuideReviews"));
const TermsofService = lazy(() => import("./pages/TermsofService"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const CookiesPolicy = lazy(() => import("./pages/CookiesPolicy"));
const TripAdvisorReviews = lazy(() => import("./pages/TripAdvisorReviews"));
const Payment = lazy(() => import("./pages/Payment"));
const Checkout = lazy(() => import("./pages/Checkout"));
const OrderConfirmation = lazy(() => import("./pages/OrderConfirmation"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const MyBookingRequests = lazy(() => import("./pages/MyBookingRequests"));
const ProtectUser = lazy(() => import("./utils/ProtectUser"));
const Index = lazy(() => import("./components/Dashboard/Index"));
const Orders = lazy(() => import("./pages/Orders"));
const ChangePassword = lazy(
  () => import("./components/Dashboard/ChangePassword"),
);
const WishList = lazy(() => import("./components/Dashboard/WishList"));
const CareerHistory = lazy(
  () => import("./components/Dashboard/CareerHistory"),
);
const OrderDetail = lazy(() => import("./pages/OrderDetail"));
const Blog = lazy(() => import("./pages/Blog"));
const BlogPost = lazy(() => import("./pages/BlogPost"));
const ContactUs = lazy(() => import("./pages/ContactUs"));
const Jobs = lazy(() => import("./pages/Jobs"));
const JobDetails = lazy(() => import("./pages/JobDetails"));
const ApplyToJob = lazy(() => import("./pages/ApplyToJob"));
const JobApplicationSuccess = lazy(
  () => import("./pages/JobApplicationSuccess"),
);
// ✅ Lazy load TripDetails and Chat (previously imported directly)
const TripDetails = lazy(() => import("./pages/TripDetails"));
const Chat = lazy(() => import("./components/Dashboard/Chat"));

import { init } from "@emailjs/browser";
import "leaflet/dist/leaflet.css";
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css";
import { getPdfs } from "./store/reducers/pdfReducer";
import { initRouteOptimizations } from "./utils/routeOptimization";
import { hydrateAuth } from "./store/reducers/authReducer";
import ChatBot from "./components/Chatbot/ChatBot";

// ✅ Optimized ScrollToTop with smooth behavior
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // Smooth scroll to top on route change
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "smooth",
    });
  }, [pathname]);

  return null;
};

function App() {
  const { userInfo } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  // ✅ Critical data - load immediately (needed for initial render)
  useEffect(() => {
    dispatch(hydrateAuth());
    dispatch(get_category());
  }, [dispatch]);

  // ✅ Defer non-critical data fetching to improve initial load
  // Load cart and wishlist after initial render (only if user is logged in)
  useEffect(() => {
    if (userInfo?._id) {
      // Use requestIdleCallback or setTimeout to defer
      const loadUserData = () => {
        dispatch(get_cart_trips(userInfo._id));
        dispatch(get_wishlist_trips(userInfo._id));
      };

      if ("requestIdleCallback" in window) {
        requestIdleCallback(loadUserData, { timeout: 2000 });
      } else {
        setTimeout(loadUserData, 100);
      }
    }
  }, [dispatch, userInfo?._id]);

  // ✅ Defer PDFs loading (not critical for initial render)
  useEffect(() => {
    const loadPdfs = () => {
      dispatch(getPdfs());
    };

    if ("requestIdleCallback" in window) {
      requestIdleCallback(loadPdfs, { timeout: 3000 });
    } else {
      setTimeout(loadPdfs, 500);
    }
  }, [dispatch]);

  // ✅ Initialize route optimizations (prefetching, preloading)
  useEffect(() => {
    // Initialize route optimizations after app mount
    initRouteOptimizations();
  }, []);

  // ✅ Initialize EmailJS (non-blocking)
  useEffect(() => {
    init("f9Q0DOkZUNAfawhW8");
  }, []);

  return (
    <BrowserRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <ScrollToTop />
      <div>
        {/* ✅ Wrap Routes in Suspense with fallback */}
        <Suspense fallback={<RouteLoader />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/trips" element={<Trips />} />
            <Route path="/trip/details/:slug" element={<TripDetails />} />
            <Route path="/cart" element={<Card />} />
            <Route path="/contact-us" element={<ContactUs />} />
            <Route path="/about-us" element={<AboutUs />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/forgot-password"
              element={<ForgotPasswordEmail />}
            />
            <Route
              path="/forgot-password/otp"
              element={<ForgotPasswordOTP />}
            />
            <Route
              path="/forgot-password/reset"
              element={<ForgotPasswordReset />}
            />
            {/* Backward-compatible redirects for old route paths */}
            <Route
              path="/forgot-password-email"
              element={<Navigate to="/forgot-password" replace />}
            />
            <Route
              path="/forgot-password-otp"
              element={<Navigate to="/forgot-password/otp" replace />}
            />
            <Route
              path="/forgot-password-reset"
              element={<Navigate to="/forgot-password/reset" replace />}
            />
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/:slug" element={<BlogPost />} />
            <Route path="/careers" element={<Jobs />} />
            <Route path="/careers/:slug" element={<JobDetails />} />
            <Route path="/apply/:jobId" element={<ApplyToJob />} />
            <Route
              path="/careers/application-success"
              element={<JobApplicationSuccess />}
            />
            <Route
              path="/job-application-success"
              element={<Navigate to="/careers/application-success" replace />}
            />
            <Route path="/payment" element={<Payment />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/order-confirmation" element={<OrderConfirmation />} />
            <Route path="/reviews/google" element={<GoogleReviews />} />
            <Route
              path="/reviews/safaribooking"
              element={<SafariBookingReviews />}
            />
            <Route
              path="/reviews/safariBooking"
              element={<Navigate to="/reviews/safaribooking" replace />}
            />
            <Route
              path="/reviews/getyourguide"
              element={<GetYourGuideReviews />}
            />
            <Route
              path="/reviews/getYourGuide"
              element={<Navigate to="/reviews/getyourguide" replace />}
            />
            <Route
              path="/reviews/tripadvisor"
              element={<TripAdvisorReviews />}
            />
            <Route path="/terms-of-service" element={<TermsofService />} />
            <Route path="/cookie-policy" element={<CookiesPolicy />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/dashboard" element={<ProtectUser />}>
              <Route path="" element={<Dashboard />}>
                <Route index path="" element={<Index />} />
                <Route path="orders" element={<Orders />} />
                <Route path="orders/:orderId" element={<OrderDetail />} />
                <Route path="booking-requests" element={<MyBookingRequests />} />
                <Route path="change-password" element={<ChangePassword />} />
                <Route path="my-wishlist" element={<WishList />} />
                <Route path="career-history" element={<CareerHistory />} />
                <Route path="chat" element={<Chat />} />
              </Route>
            </Route>
          </Routes>
        </Suspense>

        {/* ChatBot - Available on all pages */}
        {/* <ChatBot /> */}
      </div>
    </BrowserRouter>
  );
}

export default App;
