"use client";

import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useCallback, useMemo } from "react";
import {
  add_to_wishlist,
  remove_wishlist_trip,
} from "../../store/reducers/cardReducer";
import {
  ArrowRight,
  Clock,
  Eye,
  Heart,
  MapPin,
  ShoppingCart,
  Star,
} from "lucide-react";
import { resolveMediaUrl } from "../../utils/imageUtils";

const PRICE_CATEGORIES = ["standard", "midRange", "luxury"];
const PERSON_TYPES = [
  "onePerson",
  "twoPerson",
  "threePerson",
  "fourPerson",
  "fiveOrMorePerson",
];

const formatPrice = (price) => {
  return new Intl.NumberFormat("en-US").format(price);
};

const getImageUrl = (mainImage) => {
  return mainImage
    ? resolveMediaUrl(mainImage)
    : "/placeholder.svg";
};

const getCurrentSeason = (trip) => {
  if (trip.pricingType === "yearRound") {return null;}

  const today = new Date();
  return trip.seasons?.find((season) => {
    const startDate = new Date(season.startDate);
    const endDate = new Date(season.endDate);
    return today >= startDate && today <= endDate;
  });
};

const extractPricesFromObject = (priceObject) => {
  const prices = [];
  const hasCategories = PRICE_CATEGORIES.some(
    (category) => priceObject[category],
  );

  if (hasCategories) {
    PRICE_CATEGORIES.forEach((category) => {
      const categoryPrices = priceObject[category];
      if (categoryPrices) {
        PERSON_TYPES.forEach((personType) => {
          if (categoryPrices[personType]) {
            prices.push(categoryPrices[personType]);
          }
        });
      }
    });
  } else {
    PERSON_TYPES.forEach((personType) => {
      if (priceObject[personType]) {
        prices.push(priceObject[personType]);
      }
    });
  }

  return prices;
};

const getStartingPrice = (trip) => {
  let prices = [];

  if (trip.pricingType === "yearRound" && trip.regularPrices) {
    prices = extractPricesFromObject(trip.regularPrices);
  } else if (trip.pricingType === "seasonal" && trip.seasons) {
    const currentSeason = getCurrentSeason(trip) || trip.seasons[0];
    if (currentSeason?.rates) {
      prices = extractPricesFromObject(currentSeason.rates);
    }
  }

  const validPrices = prices.filter(
    (price) => typeof price === "number" && !isNaN(price) && price > 0,
  );
  return validPrices.length > 0 ? Math.min(...validPrices) : 0;
};

const getMainDestinationDisplay = (trip) => {
  const name =
    (Array.isArray(trip?.mainDestination)
      ? trip?.mainDestination[0]?.name
      : trip?.mainDestination?.name) || "";
  const parts = name.split(",");
  if (parts.length <= 1) {return name;}
  return `${parts[0]}, ${parts[parts.length - 1]}`;
};

const TripImage = ({
  trip,
  imageName,
  onWishlistToggle,
  onAddToCart,
  isInWishlist,
  isInCart,
  styles,
}) => {
  const navigate = useNavigate();

  const handleImageClick = (e) => {
    if (e.target === e.currentTarget || e.target.tagName === "IMG") {
      navigate(`/trip/details/${trip.slug}`);
    }
  };

  return (
    <div
      className={`group/image relative overflow-hidden ${
        styles === "grid"
          ? "h-[280px] w-full"
          : "h-[260px] md:h-full md:w-[42%]"
      }`}
      onClick={handleImageClick}
    >
      <img
        src={imageName}
        alt={trip.mainTitle}
        className="h-full w-full cursor-pointer object-cover transition-all duration-700 ease-out group-hover/card:scale-105 group-hover/card:brightness-90"
      />

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover/card:opacity-100" />

      {trip.discount > 0 && (
        <div
          className="absolute left-4 top-4 z-20 flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-red-600 to-red-500 px-3 py-1.5 text-xs font-bold text-white shadow-lg backdrop-blur-sm"
          onClick={(e) => e.stopPropagation()}
        >
          <span className="text-xs">-{trip.discount}%</span>
        </div>
      )}

      <div
        className="absolute right-4 top-4 z-20 flex flex-col gap-2.5 opacity-0 transition-all duration-300 group-hover/image:opacity-100"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onWishlistToggle(trip);
          }}
          className={`group/btn flex h-10 w-10 items-center justify-center rounded-xl backdrop-blur-md transition-all duration-300 hover:scale-110 active:scale-95 ${
            isInWishlist
              ? "bg-red-500 text-white shadow-lg shadow-red-500/30"
              : "bg-white/95 text-neutral-700 shadow-lg hover:bg-red-500 hover:text-white hover:shadow-red-500/30"
          }`}
          aria-label={isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
        >
          <Heart
            className={`h-4.5 w-4.5 transition-transform group-hover/btn:scale-110 ${isInWishlist ? "fill-current" : ""}`}
          />
        </button>

        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onAddToCart(trip);
          }}
          className={`group/btn flex h-10 w-10 items-center justify-center rounded-xl backdrop-blur-md transition-all duration-300 hover:scale-110 active:scale-95 ${
            isInCart
              ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/30"
              : "bg-white/95 text-neutral-700 shadow-lg hover:bg-emerald-500 hover:text-white hover:shadow-emerald-500/30"
          }`}
          aria-label={isInCart ? "Remove from cart" : "Add to cart"}
        >
          <ShoppingCart className="h-4.5 w-4.5 transition-transform group-hover/btn:scale-110" />
        </button>

        <Link
          to={`/trip/details/${trip.slug}`}
          onClick={(e) => e.stopPropagation()}
          className="group/btn flex h-10 w-10 items-center justify-center rounded-xl bg-white/95 text-neutral-700 shadow-lg backdrop-blur-md transition-all duration-300 hover:scale-110 hover:bg-neutral-900 hover:text-white hover:shadow-neutral-900/30 active:scale-95"
          aria-label="View trip details"
        >
          <Eye className="h-4.5 w-4.5 transition-transform group-hover/btn:scale-110" />
        </Link>
      </div>
    </div>
  );
};

const TripRating = ({ rating }) => (
  <div className="inline-flex items-center gap-1.5 rounded-lg border border-amber-200/50 bg-gradient-to-br from-amber-50 to-amber-100/50 px-3 py-2 shadow-sm">
    {[...Array(5)].map((_, index) => (
      <Star
        key={index}
        className={`h-3.5 w-3.5 transition-all ${
          index < Math.floor(rating)
            ? "fill-amber-400 text-amber-400"
            : "fill-neutral-200 text-neutral-200"
        }`}
      />
    ))}
    <span className="ml-1 text-sm font-bold text-neutral-800">
      {rating.toFixed(1)}
    </span>
  </div>
);

const PriceDisplay = ({ startingPrice, discount, currentSeason }) => (
  <div>
    <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-neutral-500">
      Starting from
    </p>
    <div className="flex items-baseline gap-2.5">
      <p className="bg-gradient-to-br from-emerald-600 to-emerald-700 bg-clip-text text-3xl font-bold text-transparent">
        ${formatPrice(startingPrice)}
      </p>
      {discount > 0 && (
        <p className="text-sm font-medium text-neutral-400 line-through">
          ${formatPrice(Math.round(startingPrice * (1 + discount / 100)))}
        </p>
      )}
    </div>
    {currentSeason && (
      <p className="mt-1.5 text-xs font-medium text-neutral-600">
        {currentSeason.name} season
      </p>
    )}
  </div>
);

const TripList = ({ styles, trips, onAddToCart }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { wishlist, cart_trips } = useSelector((state) => state.card);
  const { userInfo } = useSelector((state) => state.auth);

  const cartTripIds = useMemo(
    () => new Set(cart_trips.map((item) => item.tripId)),
    [cart_trips],
  );

  const wishlistTripIds = useMemo(
    () => new Set(wishlist.map((item) => item.tripId)),
    [wishlist],
  );

  const isInCart = useCallback(
    (tripId) => cartTripIds.has(tripId),
    [cartTripIds],
  );

  const isInWishlist = useCallback(
    (tripId) => wishlistTripIds.has(tripId),
    [wishlistTripIds],
  );

  const handleWishlistToggle = useCallback(
    (trip) => {
      if (!userInfo) {
        navigate("/login");
        return;
      }

      if (isInWishlist(trip._id)) {
        const wishlistItem = wishlist.find((item) => item.tripId === trip._id);
        dispatch(remove_wishlist_trip(wishlistItem._id));
      } else {
        dispatch(
          add_to_wishlist({
            userId: userInfo._id,
            tripId: trip._id,
            mainTitle: trip.mainTitle,
            mainImage: trip.mainImage,
            discount: trip.discount || 0,
            rating: trip.rating || 0,
            days: trip.days.length,
            mainDestination: trip.days[0]?.mainDestination,
            pricingType: trip.pricingType,
            regularPrices: trip.regularPrices,
            seasons: trip.seasons,
            inclusions: trip.inclusions,
            exclusions: trip.exclusions,
            selectedCategory: "standard",
          }),
        );
      }
    },
    [userInfo, wishlist, isInWishlist, navigate, dispatch],
  );

  const processedTrips = useMemo(() => {
    return trips.map((trip) => ({
      ...trip,
      imageName: getImageUrl(trip.mainImage),
      startingPrice: getStartingPrice(trip),
      currentSeason: getCurrentSeason(trip),
      destinationDisplay: getMainDestinationDisplay(trip),
    }));
  }, [trips]);

  return (
    <div
      className={`grid gap-6 ${
        styles === "grid"
          ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-2 2xl:grid-cols-3"
          : "grid-cols-1"
      }`}
    >
      {processedTrips.map((trip) => (
        <article
          key={trip._id}
          className={`group/card overflow-hidden rounded-2xl border border-neutral-200/80 bg-white shadow-sm transition-all duration-500 hover:border-neutral-300 hover:shadow-xl hover:shadow-neutral-200/50 ${
            styles === "grid" ? "flex flex-col" : "flex flex-col md:flex-row"
          }`}
        >
          <TripImage
            trip={trip}
            imageName={trip.imageName}
            onWishlistToggle={handleWishlistToggle}
            onAddToCart={onAddToCart}
            isInWishlist={isInWishlist(trip._id)}
            isInCart={isInCart(trip._id)}
            styles={styles}
          />

          <div
            className={`flex flex-1 flex-col p-6 ${styles === "list" ? "md:p-8" : ""}`}
          >
            <div className="mb-3 flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50">
                <MapPin className="h-4 w-4 text-emerald-600" />
              </div>
              <span className="text-sm font-semibold text-neutral-700">
                {trip.destinationDisplay}
              </span>
            </div>

            <h3 className="mb-3 line-clamp-2 text-xl font-bold leading-tight text-neutral-900 transition-colors duration-300 group-hover/card:text-emerald-600">
              <Link
                to={`/trip/details/${trip.slug}`}
                className="decoration-2 underline-offset-4 hover:underline"
              >
                {trip.mainTitle}
              </Link>
            </h3>

            <p className="mb-5 line-clamp-2 text-sm leading-relaxed text-neutral-600">
              {trip.description ||
                trip.overview ||
                "Experience an unforgettable adventure with our expertly crafted journey through Tanzania's most spectacular destinations."}
            </p>

            <div className="mb-5 flex flex-wrap items-center gap-2.5">
              <div className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200/50 bg-gradient-to-br from-emerald-50 to-emerald-100/50 px-3 py-2 shadow-sm">
                <Clock className="h-3.5 w-3.5 text-emerald-600" />
                <span className="text-sm font-bold text-neutral-800">
                  {trip.days.length} {trip.days.length === 1 ? "day" : "days"}
                </span>
              </div>
              <TripRating rating={trip.rating} />
            </div>

            {styles !== "grid" && trip.overview && (
              <p className="mb-5 line-clamp-2 text-sm leading-relaxed text-neutral-600">
                {trip.overview}
              </p>
            )}

            <div className="mt-auto flex items-end justify-between gap-4 border-t border-neutral-100 pt-5">
              <PriceDisplay
                startingPrice={trip.startingPrice}
                discount={trip.discount}
                currentSeason={trip.currentSeason}
              />

              <Link
                to={`/trip/details/${trip.slug}`}
                className="group/btn inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 px-6 py-3 text-sm font-semibold text-white shadow-md shadow-emerald-600/20 transition-all duration-300 hover:shadow-lg hover:shadow-emerald-600/30 active:scale-95"
              >
                <span>View Details</span>
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover/btn:translate-x-1" />
              </Link>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
};

export default TripList;
