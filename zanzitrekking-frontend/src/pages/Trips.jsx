"use client";

import { useEffect, useRef, useState } from "react";
import Footer from "../components/Footer";
import Header from "../components/Header";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  clearTrips,
  price_range_trips,
  query_trips,
} from "../store/reducers/tripReducer";
import {
  add_to_cart,
  add_to_wishlist,
  clearMessage,
  delete_cart_trip,
  get_cart_trips,
  get_wishlist_trips,
} from "../store/reducers/cardReducer";
import { formatDateForAPI } from "../utils/dateUtils";
import toast from "react-hot-toast";
import TripList from "../components/trips/TripList";
import TripListSkeleton from "../components/trips/TripListSkeleton";
import Pagination from "../components/Pagination";
import TripFilters from "../components/trips/TripFilters";
import TripSortBar from "../components/trips/TripSortBar";
import { SlidersHorizontal } from "lucide-react";
import AOS from "aos";
import "aos/dist/aos.css";
import GoogleReviewsWidget from "../components/GoogleReviewsWidget";
import TripadvisorReviews from "../components/TripadvisorReviews";

const CATEGORY_CONTENT = {
  "cultural tours": {
    title: "Cultural Tours",
    description:
      "Immerse yourself in Tanzania's rich heritage, from ancient tribes to vibrant local traditions and authentic village experiences.",
    image:
      "https://images.unsplash.com/photo-1523805009345-7448845a9e53?w=1600&h=400&fit=crop",
  },
  safaris: {
    title: "Safari Adventures",
    description:
      "Witness Africa's magnificent wildlife in their natural habitat across Tanzania's world-renowned national parks and conservation areas.",
    image:
      "https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=1600&h=400&fit=crop",
  },
  trekking: {
    title: "Trekking Expeditions",
    description:
      "Challenge yourself with unforgettable mountain treks, from conquering Kilimanjaro to exploring the stunning highlands of Tanzania.",
    image:
      "https://images.unsplash.com/photo-1609198092458-38a293c7ac4b?w=1600&h=400&fit=crop",
  },
  "zanzibar trips": {
    title: "Zanzibar Escapes",
    description:
      "Discover pristine beaches, historic Stone Town, and the exotic spice islands of Zanzibar's tropical paradise.",
    image:
      "https://images.unsplash.com/photo-1505881502353-a1986add3762?w=1600&h=400&fit=crop",
  },
  default: {
    title: "All Adventures",
    description:
      "Explore our complete collection of handpicked experiences across Tanzania. From wildlife safaris to cultural immersions, find your perfect adventure.",
    image:
      "https://images.unsplash.com/photo-1516426122078-c23e76319801?w=1600&h=400&fit=crop",
  },
};

const Trips = () => {
  const dispatch = useDispatch();
  const { categories } = useSelector((state) => state.home);
  const { trips, totalTrips, priceRange, parpage, loader, overallTrips } =
    useSelector((state) => state.trip);

  const { userInfo } = useSelector((state) => state.auth);
  const { errorMessage, successMessage, cart_trips } = useSelector(
    (state) => state.card,
  );
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [showMobileFilter, setShowMobileFilter] = useState(false);
  const [category, setCategory] = useState(searchParams.get("category") || "");
  const [rating, setRating] = useState(searchParams.get("rating") || "");
  const [styles, setStyles] = useState("grid");
  const [sort, setSort] = useState(searchParams.get("sort") || "sort-by");
  const [searchText, setSearchText] = useState(
    searchParams.get("search") || "",
  );
  const [pageNumber, setPageNumber] = useState(
    parseInt(searchParams.get("page")) || 1,
  );
  const [priceValues, setPriceValues] = useState(null);
  const [filtersInitialized, setFiltersInitialized] = useState(false);
  const [tripsPerPage, setTripsPerPage] = useState(
    parseInt(searchParams.get("perPage")) || parpage,
  );

  const priceDebounceRef = useRef(null);
  const isInitialMount = useRef(true);
  const isPriceChangeFromUser = useRef(false);
  const urlUpdateDebounceRef = useRef(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  useEffect(() => {
    dispatch(clearTrips());
  }, [dispatch]);

  useEffect(() => {
    if (isInitialLoad && !loader) {
      setIsInitialLoad(false);
    }
  }, [loader, isInitialLoad]);

  useEffect(() => {
    if (!categories?.length || !category) { return; }

    const categoryExists = categories.some(
      (cat) => (cat._id || cat.id) === category,
    );

    if (categoryExists) {
      return;
    }

    const decodedValue = decodeURIComponent(category).toLowerCase();
    const matchedCategory = categories.find(
      (cat) => cat.name?.toLowerCase() === decodedValue,
    );

    setCategory(
      matchedCategory ? matchedCategory._id || matchedCategory.id : "",
    );
  }, [categories, category]);

  useEffect(() => {
    if (!filtersInitialized || !priceValues || !priceRange) { return; }

    if (urlUpdateDebounceRef.current) {
      clearTimeout(urlUpdateDebounceRef.current);
    }

    urlUpdateDebounceRef.current = setTimeout(() => {
      const params = new URLSearchParams();
      if (category) { params.set("category", category); }
      if (rating) { params.set("rating", rating); }
      if (sort !== "sort-by") { params.set("sort", sort); }
      if (pageNumber > 1) { params.set("page", pageNumber); }
      if (tripsPerPage !== parpage) { params.set("perPage", tripsPerPage); }

      const isPriceChanged =
        priceValues[0] !== priceRange.low || priceValues[1] !== priceRange.high;
      if (isPriceChanged && isPriceChangeFromUser.current) {
        params.set("price", priceValues.join(","));
      }

      if (searchText) { params.set("search", searchText); }

      const currentUrl = searchParams.toString();
      const newUrl = params.toString();
      if (currentUrl !== newUrl) {
        setSearchParams(params, { replace: true });
      }
    }, 300);

    return () => {
      if (urlUpdateDebounceRef.current) {
        clearTimeout(urlUpdateDebounceRef.current);
      }
    };
  }, [
    category,
    rating,
    sort,
    pageNumber,
    tripsPerPage,
    priceValues,
    setSearchParams,
    priceRange,
    searchText,
    parpage,
    filtersInitialized,
    searchParams,
  ]);

  useEffect(() => {
    dispatch(price_range_trips());
  }, [dispatch]);

  // Initialize price values only once when priceRange becomes available
  useEffect(() => {
    if (priceRange?.low !== undefined && priceRange?.high !== undefined && priceValues === null) {
      const priceParam = searchParams.get("price");

      const nextValues = priceParam
        ? priceParam.split(",").map(Number)
        : [priceRange.low, priceRange.high];

      // Validate the values are within range
      const validatedValues = [
        Math.max(Math.min(nextValues[0], priceRange.high), priceRange.low),
        Math.min(Math.max(nextValues[1], priceRange.low), priceRange.high),
      ];

      isPriceChangeFromUser.current = false;
      setPriceValues(validatedValues);
      setFiltersInitialized(true);
    }
  }, [priceRange, priceValues]);

  useEffect(() => {
    const priceParam = searchParams.get("price");

    if (!priceRange && !priceParam) {
      const queryParams = {
        category,
        rating,
        sort,
        pageNumber,
        search: searchText,
        perPage: tripsPerPage,
      };
      dispatch(query_trips(queryParams));
      return;
    }

    if (!filtersInitialized && !priceParam) { return; }

    if (priceDebounceRef.current) {
      clearTimeout(priceDebounceRef.current);
    }

    priceDebounceRef.current = setTimeout(
      () => {
        const queryParams = {
          category,
          rating,
          sort,
          pageNumber,
          search: searchText,
          perPage: tripsPerPage,
        };

        const isPriceFilterActive =
          priceValues &&
          priceRange &&
          (priceParam ||
            (isPriceChangeFromUser.current &&
              (priceValues[0] !== priceRange.low ||
                priceValues[1] !== priceRange.high)));

        if (isPriceFilterActive && priceValues) {
          queryParams.low = priceValues[0];
          queryParams.high = priceValues[1];
        }

        dispatch(query_trips(queryParams)).then(() => {
          if (isInitialLoad.current) {
            isInitialLoad.current = false;
          }
        });
      },
      priceParam || isPriceChangeFromUser.current ? 500 : 0,
    );

    return () => {
      if (priceDebounceRef.current) {
        clearTimeout(priceDebounceRef.current);
      }
    };
  }, [
    dispatch,
    category,
    rating,
    sort,
    pageNumber,
    searchText,
    tripsPerPage,
    priceValues,
    filtersInitialized,
    priceRange,
    searchParams,
  ]);

  const handleCategoryChange = (e, value) => {
    const newCategory = e.target.checked ? value : "";
    setCategory(newCategory);
    setPageNumber(1);
  };

  const handleSortChange = (e) => {
    setSort(e.target.value);
    setPageNumber(1);
  };

  const handleTripsPerPageChange = (e) => {
    setTripsPerPage(parseInt(e.target.value));
    setPageNumber(1);
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

  const handleAddToWishlist = (trip) => {
    if (!userInfo) {
      navigate("/login");
      return;
    }

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
  };

  const handleAddToCart = (trip) => {
    if (!userInfo) {
      navigate("/login");
      return;
    }

    const tripInCart = cart_trips.find(
      (cartItem) => cartItem.tripId === trip._id,
    );

    if (tripInCart) {
      dispatch(delete_cart_trip(tripInCart._id));
    } else {
      const currentSeason = getCurrentSeason(trip);

      dispatch(
        add_to_cart({
          userId: userInfo._id,
          tripId: trip._id,
          startingDate: formatDateForAPI(new Date()),
          travelersNumber: 1,
          mainTitle: trip.mainTitle,
          mainImage: trip.mainImage,
          discount: trip.discount || 0,
          pricingType: trip.pricingType,
          regularPrices: trip.regularPrices,
          seasons: trip.seasons,
          selectedCategory: "standard",
          currentSeason: currentSeason ? currentSeason.name : null,
        }),
      );
    }
  };

  const resetAllFilters = () => {
    setCategory("");
    setRating("");
    setSearchText("");
    setSort("sort-by");
    setPageNumber(1);
    if (priceRange) {
      isPriceChangeFromUser.current = false;
      setPriceValues([priceRange.low, priceRange.high]);
    }
  };

  useEffect(() => {
    AOS.init({
      once: true,
      duration: 400,
      offset: 60,
      easing: "ease-out-cubic",
    });
  }, []);

  useEffect(() => {
    if (errorMessage) {
      toast.error(errorMessage);
      dispatch(clearMessage());
    }
    if (successMessage) {
      toast.success(successMessage);
      dispatch(get_cart_trips(userInfo._id));
      dispatch(get_wishlist_trips(userInfo._id));
      dispatch(clearMessage());
    }
  }, [dispatch, successMessage, errorMessage, userInfo?._id]);

  const hasActiveFilters =
    category ||
    rating ||
    searchText ||
    (priceValues &&
      priceRange &&
      (priceValues[0] !== priceRange.low ||
        priceValues[1] !== priceRange.high));

  const selectedCategory = categories?.find(
    (cat) => (cat._id || cat.id) === category,
  );
  const categoryKey = selectedCategory?.name?.toLowerCase() || "default";
  const content = CATEGORY_CONTENT[categoryKey] || CATEGORY_CONTENT.default;

  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-50 to-white">
      <Header categories={categories} />

      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={content.image}
            alt={content.title}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70" />
        </div>

        <div className="relative px-4 py-20 md:px-12 md:py-32 lg:py-40">
          <div className="mx-auto max-w-7xl 3xl:max-w-full">
            <div
              className="text-center"
              data-aos="fade-up"
              data-aos-duration="800"
            >
              <div className="mb-6 inline-block">
                <div className="h-1 w-20 rounded-full bg-gradient-to-r from-emerald-500 to-emerald-600" />
              </div>
              <h1 className="mb-6 text-5xl font-bold tracking-tight text-white drop-shadow-lg md:text-6xl lg:text-7xl">
                {content.title}
              </h1>
              <p className="mx-auto max-w-3xl text-lg leading-relaxed text-white/95 drop-shadow-md md:text-xl">
                {content.description}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="relative -mt-8 bg-transparent py-12 md:py-16">
        <div className="px-4 md:px-12">
          <div className="mx-auto max-w-[1920px]">
            <div className="mb-8 lg:hidden" data-aos="fade-up">
              <button
                onClick={() => setShowMobileFilter(!showMobileFilter)}
                className="group flex w-full items-center justify-center gap-3 rounded-xl border border-neutral-200 bg-white px-6 py-4 font-medium text-neutral-900 shadow-sm transition-all hover:border-neutral-300 hover:shadow-md active:scale-[0.98]"
              >
                <SlidersHorizontal className="h-5 w-5 transition-transform group-hover:rotate-90" />
                {showMobileFilter ? "Hide Filters" : "Show Filters"}
              </button>
            </div>

            <div className="flex flex-col gap-8 lg:flex-row lg:gap-10">
              <TripFilters
                categories={categories}
                category={category}
                handleCategoryChange={handleCategoryChange}
                priceRange={priceRange}
                priceValues={priceValues}
                setPriceValues={(values) => {
                  isPriceChangeFromUser.current = true;
                  setPriceValues(values);
                }}
                rating={rating}
                setRating={setRating}
                resetAllFilters={resetAllFilters}
                searchText={searchText}
                setSearchText={setSearchText}
                showMobileFilter={showMobileFilter}
              />

              <div className="w-full flex-1 lg:w-3/4">
                <TripSortBar
                  totalTrips={totalTrips}
                  sort={sort}
                  handleSortChange={handleSortChange}
                  styles={styles}
                  setStyles={setStyles}
                  tripsPerPage={tripsPerPage}
                  handleTripsPerPageChange={handleTripsPerPageChange}
                  hasActiveFilters={hasActiveFilters}
                  resetAllFilters={resetAllFilters}
                />

                <div className="pb-8" data-aos="fade-up">
                  {loader || isInitialLoad ? (
                    <TripListSkeleton styles={styles} count={tripsPerPage} />
                  ) : trips.length > 0 ? (
                    <TripList
                      styles={styles}
                      trips={trips}
                      onAddToWishlist={handleAddToWishlist}
                      onAddToCart={handleAddToCart}
                    />
                  ) : (
                    <div className="flex min-h-[500px] flex-col items-center justify-center rounded-2xl border border-neutral-200 bg-white p-12 text-center shadow-sm">
                      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-neutral-100">
                        <svg
                          className="h-8 w-8 text-neutral-400"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                          />
                        </svg>
                      </div>
                      <h3 className="mb-3 text-2xl font-semibold text-neutral-900">
                        No trips found
                      </h3>
                      <p className="mb-8 max-w-md text-neutral-600">
                        We couldn&apos;t find any adventures matching your criteria.
                        Try adjusting your filters to discover more options.
                      </p>
                      {hasActiveFilters && (
                        <button
                          onClick={resetAllFilters}
                          className="inline-flex items-center gap-2 rounded-xl bg-neutral-900 px-8 py-3.5 font-semibold text-white shadow-sm transition-all hover:bg-neutral-800 hover:shadow-md active:scale-[0.98]"
                        >
                          Clear all filters
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {!loader && totalTrips > tripsPerPage && (
                  <div className="mt-12 pb-8" data-aos="fade-up">
                    <Pagination
                      pageNumber={pageNumber}
                      setPageNumber={setPageNumber}
                      totalItem={totalTrips}
                      parPage={tripsPerPage}
                      showItem={Math.min(
                        3,
                        Math.floor(totalTrips / tripsPerPage),
                      )}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        <TripadvisorReviews />
        <GoogleReviewsWidget />
      </section>

      <Footer />
    </div>
  );
};

export default Trips;
