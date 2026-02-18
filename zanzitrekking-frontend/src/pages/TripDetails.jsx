"use client";

import { useNavigate, useParams } from "react-router-dom";
import { Loader } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { get_trip } from "../store/reducers/tripReducer";
import toast from "react-hot-toast";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useEffect, useState } from "react";
import OverviewTab from "../components/tripDetails/OverviewTab";
import DayByDayTab from "../components/tripDetails/DayByDayTab";
import RatesTab from "../components/tripDetails/RatesTab";
import InclusionsTab from "../components/tripDetails/InclusionsTab";
import { IMAGES_URL } from "../utils/constants";
import {
  add_to_cart,
  add_to_wishlist,
  clearMessage,
  delete_cart_trip,
  get_cart_trips,
  get_wishlist_trips,
  remove_wishlist_trip,
} from "../store/reducers/cardReducer";
import { formatDateForAPI } from "../utils/dateUtils";
import TripHero from "../components/tripDetails/TripHero";
import TripTabs from "../components/tripDetails/TripTabs";
import TripActions from "../components/tripDetails/TripActions";
import Reviews from "../components/products/Reviews";

const TripDetails = () => {
  const { tripId } = useParams();
  const { trip, loading } = useSelector((state) => state.trip);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [isInCart, setIsInCart] = useState(false);

  const { wishlist, errorMessage, successMessage, cart_trips } = useSelector(
    (state) => state.card,
  );
  const { userInfo } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(get_trip(tripId));
  }, [tripId, dispatch]);

  useEffect(() => {
    if (errorMessage) {toast.error(errorMessage);}
    if (successMessage) {toast.success(successMessage);}
    if (userInfo) {
      dispatch(get_cart_trips(userInfo.id));
      dispatch(get_wishlist_trips(userInfo.id));
    }

    dispatch(clearMessage());
  }, [successMessage, errorMessage]);

  useEffect(() => {
    if (trip) {
      setIsInWishlist(wishlist.some((item) => item.tripId === trip._id));
    }
  }, [trip, wishlist]);

  useEffect(() => {
    if (trip) {
      setIsInCart(cart_trips.some((item) => item.tripId === trip._id));
    }
  }, [trip, cart_trips]);

  const handleAddToWishlist = () => {
    if (!userInfo) {
      toast.error("Please login to add to wishlist");
      return;
    }

    if (isInWishlist) {
      const wishlistItem = wishlist.find((item) => item.tripId === trip._id);
      dispatch(remove_wishlist_trip(wishlistItem._id));
    } else {
      dispatch(
        add_to_wishlist({
          userId: userInfo.id,
          tripId: trip._id,
          mainTitle: trip.mainTitle,
          mainImage: trip.mainImage,
          discount: trip.discount || 0,
          rating: trip.rating || 0,
          days: trip.days.length,
          mainDestination: trip.days[0]?.mainDestination,
          rates: trip.rates,
        }),
      );
    }
  };

  const handleAddToCart = () => {
    if (!userInfo) {
      navigate("/login");
      return;
    }

    const tripInCart = cart_trips.find(
      (cartItem) => cartItem.tripId === tripId,
    );

    if (tripInCart) {
      dispatch(delete_cart_trip(tripInCart._id));
    } else {
      dispatch(
        add_to_cart({
          userId: userInfo.id,
          tripId,
          startingDate: formatDateForAPI(new Date()),
          travelersNumber: 1,
          mainTitle: trip.mainTitle,
          mainImage: trip.mainImage,
          discount: trip.discount || 0,
          regularPrices: trip.regularPrices,
          seasons: trip.seasons,
          pricingType: trip.pricingType,
        }),
      );
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "overview":
        return (
          <OverviewTab
            overview={trip.overview}
            days={trip.days || []}
            mainDestination={trip.mainDestination}
            startPoint={trip.startPoint}
            endPoint={trip.endPoint}
          />
        );
      case "dayByDay":
        return <DayByDayTab days={trip.days} />;
      case "rates":
        return <RatesTab trip={trip} />;
      case "inclusions":
        return (
          <InclusionsTab
            inclusions={trip.inclusions}
            exclusions={trip.exclusions}
            trip={trip}
          />
        );
      case "reviews":
        return <Reviews tripId={tripId} orderId={null} />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col bg-white">
        <Header />
        <div className="flex flex-1 items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <div className="h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-slate-700"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="h-4 w-4 rounded-full bg-slate-700"></div>
              </div>
            </div>
            <p className="text-sm font-medium text-neutral-600">
              Loading safari details...
            </p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const imageName = trip.mainImage
    ? IMAGES_URL + trip.mainImage.split("/").pop()
    : "/placeholder.svg";

  return (
    <div className="flex min-h-screen flex-col bg-neutral-50">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&display=swap');
        
        .safari-page {
          font-family: 'Outfit', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        }
      `}</style>

      <Header />

      <main className="safari-page relative flex-1">
        <div className="relative">
          <TripHero trip={trip} imageName={imageName} />

          <div className="relative">
            <TripTabs
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              renderTabContent={renderTabContent}
              actions={
                <TripActions
                  userInfo={userInfo}
                  isInWishlist={isInWishlist}
                  isInCart={isInCart}
                  handleAddToWishlist={handleAddToWishlist}
                  handleAddToCart={handleAddToCart}
                  trip={trip}
                />
              }
            />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default TripDetails;
