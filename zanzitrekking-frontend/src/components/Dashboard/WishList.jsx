"use client";

import { useEffect, useState } from "react";
import { FaEye, FaHeart, FaRegHeart } from "react-icons/fa";
import { RiShoppingCartFill, RiShoppingCartLine } from "react-icons/ri";
import { FaLocationDot } from "react-icons/fa6";
import { IoCalendarOutline } from "react-icons/io5";
import { AiFillStar } from "react-icons/ai";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Calendar, Heart, MapPin, ShoppingCart, Star } from "lucide-react";
import {
  add_to_cart,
  clearMessage,
  delete_cart_trip,
  get_cart_trips,
  get_wishlist_trips,
  remove_wishlist_trip,
} from "../../store/reducers/cardReducer";
import toast from "react-hot-toast";
import { IMAGES_URL } from "../../utils/constants";
import { formatDateForAPI } from "../../utils/dateUtils";

const Wishlist = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { userInfo } = useSelector((state) => state.auth);
  const { wishlist, errorMessage, successMessage, cart_trips } = useSelector(
    (state) => state.card,
  );
  const [removingId, setRemovingId] = useState(null);
  const [loadingCartId, setLoadingCartId] = useState(null);

  const handleRemoveFromWishlist = (wishlistId) => {
    setRemovingId(wishlistId);
    dispatch(remove_wishlist_trip(wishlistId));
  };

  const isInCart = (tripId) => {
    return cart_trips.some((cartItem) => cartItem.tripId === tripId);
  };

  const handleCartAction = (trip) => {
    if (!userInfo) {
      navigate("/login");
      return;
    }

    // Use tripId from wishlist item, not the wishlist item's _id
    const actualTripId = trip.tripId || trip._id;
    setLoadingCartId(actualTripId);
    const tripInCart = cart_trips.find(
      (cartItem) => cartItem.tripId === actualTripId,
    );

    if (tripInCart) {
      dispatch(delete_cart_trip(tripInCart._id));
    } else {
      dispatch(
        add_to_cart({
          userId: userInfo._id,
          tripId: actualTripId,
          startingDate: formatDateForAPI(new Date()),
          travelersNumber: 1,
          mainTitle: trip.mainTitle,
          mainImage: trip.mainImage,
          discount: trip.discount || 0,
          regularPrices: trip.regularPrices,
          seasons: trip.seasons,
          pricingType: trip.pricingType,
          selectedCategory: trip.selectedCategory || "standard",
        }),
      );
    }
  };

  useEffect(() => {
    if (successMessage) {
      toast.success(successMessage);
      dispatch(get_wishlist_trips(userInfo._id));
      dispatch(get_cart_trips(userInfo._id));
      dispatch(clearMessage());
      setRemovingId(null);
      setLoadingCartId(null);
    }

    if (errorMessage) {
      toast.error(errorMessage);
      dispatch(clearMessage());
      setRemovingId(null);
      setLoadingCartId(null);
    }
  }, [dispatch, successMessage, errorMessage, userInfo?._id]);

  const formatPrice = (price) => {
    return new Intl.NumberFormat("en-US").format(price);
  };

  const getCurrentSeason = (trip) => {
    if (trip.pricingType === "yearRound") {
      return null;
    }

    const today = new Date();
    return trip.seasons.find((season) => {
      const startDate = new Date(season.startDate);
      const endDate = new Date(season.endDate);
      return today >= startDate && today <= endDate;
    });
  };

  const getStartingPrice = (trip) => {
    const prices = [];

    if (trip.pricingType === "yearRound" && trip.regularPrices) {
      if (
        trip.regularPrices.standard ||
        trip.regularPrices.midRange ||
        trip.regularPrices.luxury
      ) {
        const categories = ["standard", "midRange", "luxury"];
        categories.forEach((category) => {
          const categoryPrices = trip.regularPrices[category];
          if (categoryPrices) {
            prices.push(
              categoryPrices.onePerson,
              categoryPrices.twoPerson,
              categoryPrices.threePerson,
              categoryPrices.fourPerson,
              categoryPrices.fiveOrMorePerson,
            );
          }
        });
      } else {
        prices.push(
          trip.regularPrices.onePerson,
          trip.regularPrices.twoPerson,
          trip.regularPrices.threePerson,
          trip.regularPrices.fourPerson,
          trip.regularPrices.fiveOrMorePerson,
        );
      }
    } else if (trip.pricingType === "seasonal" && trip.seasons) {
      const currentSeason = getCurrentSeason(trip) || trip.seasons[0];
      if (currentSeason && currentSeason.rates) {
        if (
          currentSeason.rates.standard ||
          currentSeason.rates.midRange ||
          currentSeason.rates.luxury
        ) {
          const categories = ["standard", "midRange", "luxury"];
          categories.forEach((category) => {
            const categoryPrices = currentSeason.rates[category];
            if (categoryPrices) {
              prices.push(
                categoryPrices.onePerson,
                categoryPrices.twoPerson,
                categoryPrices.threePerson,
                categoryPrices.fourPerson,
                categoryPrices.fiveOrMorePerson,
              );
            }
          });
        } else {
          prices.push(
            currentSeason.rates.onePerson,
            currentSeason.rates.twoPerson,
            currentSeason.rates.threePerson,
            currentSeason.rates.fourPerson,
            currentSeason.rates.fiveOrMorePerson,
          );
        }
      }
    }

    const validPrices = prices.filter(
      (price) => typeof price === "number" && !isNaN(price) && price > 0,
    );
    return validPrices.length > 0 ? Math.min(...validPrices) : 0;
  };

  if (wishlist.length === 0) {
    return (
      <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex min-h-[500px] flex-col items-center justify-center rounded-xl border border-neutral-200 bg-white p-10 text-center shadow-soft">
            <div className="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-full bg-error-50">
              <Heart className="h-10 w-10 text-error-500" />
            </div>
            <h3 className="mb-2 text-2xl font-bold text-primary-800">
              Your wishlist is empty
            </h3>
            <p className="mb-8 max-w-md text-text-light">
              Explore our trips and add your favorites to your wishlist to keep
              track of destinations you&apos;d like to visit.
            </p>
            <Link
              to="/trips"
              className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-6 py-3 font-semibold text-white shadow-soft transition-all hover:bg-primary-700 hover:shadow-soft-md"
            >
              Explore Trips
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="mb-4 inline-flex items-center gap-2 rounded-lg border border-error-200 bg-error-50 px-3 py-1">
            <Heart className="h-4 w-4 text-error-600" />
            <span className="text-xs font-semibold text-error-700">
              Favorites
            </span>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-2xl font-bold text-primary-800 lg:text-3xl">
              My Wishlist
            </h2>
            <div className="inline-flex items-center gap-2 rounded-full bg-background-muted px-4 py-2 text-sm font-semibold text-primary-700 shadow-soft">
              <span>
                {wishlist.length} {wishlist.length === 1 ? "trip" : "trips"}
              </span>
            </div>
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {wishlist.map((trip) => {
            const actualTripId = trip.tripId || trip._id;
            const inCart = isInCart(actualTripId);
            const isRemoving = removingId === trip._id;
            const isCartLoading = loadingCartId === actualTripId;
            const imageName = trip.mainImage
              ? IMAGES_URL + trip.mainImage.split("/").pop()
              : "/placeholder.svg";

            return (
              <div
                key={trip._id}
                className={`group overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-soft transition-all duration-200 hover:border-primary-300 hover:shadow-soft-md ${
                  isRemoving ? "opacity-50" : ""
                }`}
              >
                {/* Image */}
                <div className="relative h-56 overflow-hidden">
                  {trip.discount > 0 && (
                    <div className="absolute left-3 top-3 z-10 rounded-lg bg-error-500 px-2.5 py-1 text-xs font-bold text-white shadow-soft">
                      {trip.discount}% OFF
                    </div>
                  )}

                  <img
                    src={imageName}
                    alt={trip.mainTitle}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />

                  {/* Actions */}
                  <div className="absolute right-3 top-3 z-10 flex flex-col gap-2">
                    <button
                      onClick={() => handleRemoveFromWishlist(trip._id)}
                      disabled={isRemoving}
                      className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/90 text-error-500 shadow-soft backdrop-blur-sm transition-all hover:bg-error-500 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <FaHeart className="h-4 w-4" />
                    </button>

                    <Link
                      to={`/trip/details/${trip.tripId || trip._id}`}
                      className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/90 text-primary-600 shadow-soft backdrop-blur-sm transition-all hover:bg-primary-600 hover:text-white"
                    >
                      <FaEye className="h-4 w-4" />
                    </Link>

                    <button
                      onClick={() => handleCartAction(trip)}
                      disabled={
                        isCartLoading ||
                        loadingCartId === (trip.tripId || trip._id)
                      }
                      className={`flex h-10 w-10 items-center justify-center rounded-lg shadow-soft backdrop-blur-sm transition-all disabled:cursor-not-allowed disabled:opacity-50 ${
                        inCart
                          ? "bg-primary-600 text-white hover:bg-primary-700"
                          : "bg-white/90 text-primary-600 hover:bg-primary-600 hover:text-white"
                      }`}
                    >
                      {inCart ? (
                        <RiShoppingCartFill className="h-4 w-4" />
                      ) : (
                        <RiShoppingCartLine className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5">
                  <h3 className="mb-3 line-clamp-2 text-lg font-bold text-primary-800">
                    <Link
                      to={`/trip/details/${trip.tripId || trip._id}`}
                      className="transition-colors hover:text-primary-600"
                    >
                      {trip.mainTitle}
                    </Link>
                  </h3>

                  <div className="mb-4 space-y-2">
                    <div className="flex items-center gap-2 text-sm text-text-light">
                      <MapPin className="h-4 w-4 text-primary-600" />
                      <span className="line-clamp-1">
                        {Array.isArray(trip.mainDestination)
                          ? trip.mainDestination[0]?.name
                          : trip.mainDestination?.name}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-text-light">
                        <Calendar className="h-4 w-4 text-primary-600" />
                        <span>
                          {trip.days} {trip.days === 1 ? "day" : "days"}
                        </span>
                      </div>

                      <div className="flex items-center">
                        {[...Array(5)].map((_, index) => (
                          <AiFillStar
                            key={index}
                            className={`h-4 w-4 ${
                              index < Math.floor(trip.rating)
                                ? "text-warning-500"
                                : "text-neutral-300"
                            }`}
                          />
                        ))}
                        <span className="ml-1 text-xs text-text-lighter">
                          ({trip.rating.toFixed(1)})
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Price and CTA */}
                  <div className="flex items-end justify-between border-t border-neutral-100 pt-4">
                    <div>
                      <p className="mb-1 text-xs font-medium text-text-lighter">
                        Starting from
                      </p>
                      <div className="flex items-baseline gap-2">
                        <p className="text-xl font-bold text-primary-800">
                          ${formatPrice(getStartingPrice(trip))}
                        </p>
                      </div>
                    </div>

                    <Link
                      to={`/trip/details/${trip.tripId || trip._id}`}
                      className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white shadow-soft transition-all hover:bg-primary-700 hover:shadow-soft-md"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Wishlist;
