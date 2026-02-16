import { useDispatch, useSelector } from "react-redux";
import { lazy, Suspense, useEffect } from "react";
import Banner from "../components/Banner";
import Categories from "../components/Categories";
import Footer from "../components/Footer";
import Header from "../components/Header";
import FeatureTrip from "../components/trips/FeatureTrip";
import { get_special_trips } from "../store/reducers/tripReducer";

import SectionDivider from "../components/Home/SectionDivider";
import CertificationsSection from "../components/Home/CertificationsSection";
import LatestBlogs from "../components/Home/LatestBlogs";
import DiscoverTrips from "../components/Home/DiscoverTrips";
import AOS from "aos";

// ✅ Lazy load below-the-fold components
const TripadvisorReviews = lazy(
  () => import("../components/TripadvisorReviews"),
);
const AchievementsSection = lazy(
  () => import("../components/Home/AchievementsSection "),
);
const GoogleReviewsWidgets = lazy(
  () => import("../components/GoogleReviewsWidgets"),
);

// ✅ Simple loading fallback for sections
const SectionLoader = () => (
  <div className="flex items-center justify-center py-16">
    <div className="h-8 w-8 animate-spin rounded-full border-4 border-neutral-200 border-t-primary-600"></div>
  </div>
);

const Home = () => {
  const dispatch = useDispatch();
  const { trips } = useSelector((state) => state.trip);

  useEffect(() => {
    AOS.init({ once: true, duration: 800, offset: 60 });
  }, []);

  useEffect(() => {
    dispatch(get_special_trips());
  }, [dispatch]);

  // Helper function to ensure data is always an array
  const ensureArray = (data) => {
    if (Array.isArray(data)) {return data;}
    if (data && typeof data === "object" && Object.keys(data).length > 0) {
      return Object.values(data);
    }
    return [];
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* ✅ Critical above-the-fold content loads first */}
      <Banner />
      <Categories />

      {/* Divider between Categories and DiscoverTrips */}
      <div className="relative w-full py-12">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-primary-200 to-transparent" />
        </div>
      </div>

      <DiscoverTrips />
      <FeatureTrip trips={ensureArray(trips)} />

      <CertificationsSection />
      <LatestBlogs />
      <SectionDivider />



      {/* ✅ Below-the-fold content lazy loads */}
      <Suspense fallback={<SectionLoader />}>
        <AchievementsSection />
      </Suspense>

      <Suspense fallback={<SectionLoader />}>
        <TripadvisorReviews />
      </Suspense>

      <Suspense fallback={<SectionLoader />}>
        <GoogleReviewsWidgets />
      </Suspense>
      <Footer />
    </div>
  );
};

export default Home;
