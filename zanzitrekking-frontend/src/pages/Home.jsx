import { useDispatch, useSelector } from "react-redux";
import { lazy, Suspense, useEffect, useMemo } from "react";
import AOS from "aos";

import Header from "../components/Header";
import Banner from "../components/Banner";
import Categories from "../components/Categories";
import FeatureTrip from "../components/trips/FeatureTrip";
import Footer from "../components/Footer";
import SectionDivider from "../components/Home/SectionDivider";

import { get_special_trips } from "../store/reducers/tripReducer";
import SEO from "../components/SEO";

// ✅ Helpers should live OUTSIDE the component rendering cycle to prevent memory leaks and prop recreation.
const ensureArray = (data) => {
  if (Array.isArray(data)) return data;
  if (data && typeof data === "object" && Object.keys(data).length > 0) {
    return Object.values(data);
  }
  return [];
};

// ✅ Expanded Lazy loading for components considerably below the fold
const DiscoverTrips = lazy(() => import("../components/Home/DiscoverTrips"));
const CertificationsSection = lazy(() => import("../components/Home/CertificationsSection"));
const LatestBlogs = lazy(() => import("../components/Home/LatestBlogs"));
const AchievementsSection = lazy(() => import("../components/Home/AchievementsSection "));
const TripadvisorReviews = lazy(() => import("../components/TripadvisorReviews"));
const GoogleReviewsWidgets = lazy(() => import("../components/GoogleReviewsWidgets"));

// ✅ Simple loading fallback for sections
const SectionLoader = () => (
  <div className="flex items-center justify-center py-16 min-h-[200px]" aria-label="Loading section...">
    <div className="h-8 w-8 animate-spin rounded-full border-4 border-neutral-200 border-t-primary-600"></div>
  </div>
);

const Home = () => {
  const dispatch = useDispatch();
  const { trips } = useSelector((state) => state.trip);

  useEffect(() => {
    AOS.init({ once: true, duration: 400, offset: 60 });
    dispatch(get_special_trips());
  }, [dispatch]);

  // Use memoization to avoid changing the array reference if Redux store doesn't change
  const normalizedTrips = useMemo(() => ensureArray(trips), [trips]);

  return (
    <div className="min-h-screen bg-white">
      {/* 🚀 SEO METADATA */}
      <SEO/>

      <Header />

      {/* 🏗️ SEMANTIC MAIN WRAPPER */}
      <main>
        {/* Critical above-the-fold content loads synchronously */}
        <Banner />
        <Categories />

        <SectionDivider />

        {/* 📉 Below-the-fold content loads asynchronously */}
        <Suspense fallback={<SectionLoader />}>
          <DiscoverTrips />
        </Suspense>

        <FeatureTrip trips={normalizedTrips} />

        {/* Consolidating suspense block for sequential sections to avoid jarring UI pop-ins */}
        <Suspense fallback={<SectionLoader />}>
          <CertificationsSection />
          <LatestBlogs />
          <SectionDivider />
          
          <AchievementsSection />
          <TripadvisorReviews />
          <GoogleReviewsWidgets />
        </Suspense>
      </main>

      <Footer />
    </div>
  );
};

export default Home;
