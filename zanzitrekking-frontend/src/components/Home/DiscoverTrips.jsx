import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  AlertCircle,
  ArrowRight,
  Calendar,
  ChevronRight,
  Filter,
  Loader2,
  MapPin,
  Search,
  Star,
  Tag,
} from "lucide-react";
import { get_trips } from "../../store/reducers/tripReducer";
import { IMAGES_URL } from "../../utils/constants";
import "aos/dist/aos.css";

const DiscoverTrips = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { trips, loader, errorMessage } = useSelector((state) => state.trip);

  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [displayLimit, setDisplayLimit] = useState(6);

  useEffect(() => {
    dispatch(get_trips({ parPage: 20, currentPage: 1, searchValue: "" }));
  }, [dispatch]);

  // Extract unique categories from trips
  const categories = useMemo(() => {
    const categorySet = new Set();
    trips?.forEach((trip) => {
      const categoryName = trip.category?.name || trip.category || "Uncategorized";
      categorySet.add(categoryName);
    });
    return Array.from(categorySet).sort();
  }, [trips]);

  // Filter and search trips
  const filteredTrips = useMemo(() => {
    if (!trips || trips.length === 0) {return [];}

    let filtered = trips;

    // Filter by category
    if (selectedCategory !== "all") {
      filtered = filtered.filter((trip) => {
        const categoryName = trip.category?.name || trip.category || "Uncategorized";
        return categoryName === selectedCategory;
      });
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((trip) => {
        const title = trip.mainTitle?.toLowerCase() || "";
        const description = trip.description?.toLowerCase() || trip.overview?.toLowerCase() || "";
        const destination = (
          Array.isArray(trip.mainDestination)
            ? trip.mainDestination[0]?.name
            : trip.mainDestination?.name
        )?.toLowerCase() || "";

        return title.includes(query) || description.includes(query) || destination.includes(query);
      });
    }

    return filtered;
  }, [trips, selectedCategory, searchQuery]);

  // Get displayed trips (limited)
  const displayedTrips = useMemo(() => {
    return filteredTrips.slice(0, displayLimit);
  }, [filteredTrips, displayLimit]);

  const formatPrice = (price) => {
    if (!price || price === 0) {return "Contact Us";}
    return new Intl.NumberFormat("en-US").format(price);
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
      const currentSeason = trip.seasons[0];
      if (currentSeason?.rates) {
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

  const getImageUrl = (mainImage) => {
    if (!mainImage) {return "/placeholder.jpg";}
    return IMAGES_URL + mainImage.split("/").pop();
  };

  const getDestinationName = (trip) => {
    const destination = Array.isArray(trip.mainDestination)
      ? trip.mainDestination[0]?.name
      : trip.mainDestination?.name;
    return destination?.split(",")[0] || "Tanzania";
  };

  if (loader) {
    return (
      <section className="relative bg-gradient-to-br from-white via-primary-50/20 to-white py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-4 md:px-12">
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="h-12 w-12 animate-spin text-primary-600" />
            <p className="mt-4 text-lg font-medium text-text-light">
              Discovering amazing trips...
            </p>
          </div>
        </div>
      </section>
    );
  }

  if (errorMessage) {
    return (
      <section className="relative bg-gradient-to-br from-white via-primary-50/20 to-white py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-4 md:px-12">
          <div className="flex flex-col items-center justify-center py-20">
            <AlertCircle className="h-12 w-12 text-red-500" />
            <p className="mt-4 text-lg font-medium text-text-light">
              {errorMessage || "Failed to load trips. Please try again later."}
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-white via-neutral-50/30 to-white py-10 lg:py-12">
      {/* Animated Background Elements */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-20 top-20 h-96 w-96 animate-pulse rounded-full bg-gradient-to-r from-primary-200/30 to-accent-200/30 blur-3xl" />
        <div className="absolute -right-20 bottom-20 h-96 w-96 animate-pulse rounded-full bg-gradient-to-r from-secondary-200/30 to-primary-200/30 blur-3xl animation-delay-2000" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 md:px-12">
        {/* Section Header */}
        <div className="mb-12 text-center" data-aos="fade-up">


          <h2 className="mb-6 bg-gradient-to-r from-primary-800 via-primary-600 to-primary-800 bg-clip-text text-5xl font-extrabold text-transparent lg:text-6xl">
            Find Your Perfect Trip
          </h2>

          <div className="mx-auto mb-6 flex items-center justify-center gap-2">
            <div className="h-1.5 w-12 rounded-full bg-gradient-to-r from-transparent via-secondary-500 to-secondary-500" />
            <div className="h-2 w-16 rounded-full bg-gradient-to-r from-secondary-500 via-accent-500 to-secondary-500" />
            <div className="h-1.5 w-12 rounded-full bg-gradient-to-r from-accent-500 via-transparent to-transparent" />
          </div>

          <p className="mx-auto max-w-3xl text-xl leading-relaxed text-text-light lg:text-2xl">
            Explore our handpicked collection of{" "}
            <span className="font-semibold text-primary-700">unforgettable adventures</span> across Tanzania.
            Filter by category or search to find your ideal journey.
          </p>
        </div>

        {/* Search and Filter Bar */}
        <div className="mb-12" data-aos="fade-up" data-aos-delay="100">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-text-light" />
              <input
                type="text"
                placeholder="Search trips by name, destination, or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-neutral-200 bg-white px-12 py-3.5 text-base shadow-sm transition-all focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-200"
              />
            </div>

            {/* Category Filter */}
            {categories.length > 0 && (
              <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0">
                <Filter className="h-5 w-5 shrink-0 text-text-light" />
                <div className="flex gap-2">
                  <button
                    onClick={() => setSelectedCategory("all")}
                    className={`shrink-0 rounded-lg px-4 py-2 text-sm font-semibold transition-all ${
                      selectedCategory === "all"
                        ? "bg-primary-600 text-white shadow-lg"
                        : "bg-white text-text border border-neutral-200 hover:border-primary-300"
                    }`}
                  >
                    All
                  </button>
                  {categories.map((category) => (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      className={`shrink-0 rounded-lg px-4 py-2 text-sm font-semibold transition-all ${
                        selectedCategory === category
                          ? "bg-primary-600 text-white shadow-lg"
                          : "bg-white text-text border border-neutral-200 hover:border-primary-300"
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Results Count */}
          <div className="mt-4 text-sm text-text-light">
            {filteredTrips.length > 0 ? (
              <span>
                Showing <span className="font-semibold text-primary-700">{displayedTrips.length}</span> of{" "}
                <span className="font-semibold text-primary-700">{filteredTrips.length}</span> trips
              </span>
            ) : (
              <span className="text-red-500">No trips found matching your criteria.</span>
            )}
          </div>
        </div>

        {/* Trips Grid */}
        {displayedTrips.length > 0 ? (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3" data-aos="fade-up" data-aos-delay="200">
            {displayedTrips.map((trip, index) => (
              <div
                key={trip._id}
                className="group relative overflow-hidden rounded-3xl border border-neutral-200/50 bg-white shadow-xl transition-all duration-500 hover:-translate-y-2 hover:border-transparent hover:shadow-2xl"
                data-aos="zoom-in"
                data-aos-delay={index * 100}
                onClick={() => navigate(`/trip/details/${trip._id}`)}
              >
                {/* Image Section */}
                <div className="relative h-64 overflow-hidden">
                  <img
                    src={getImageUrl(trip.mainImage)}
                    alt={trip.mainTitle}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                  {/* Badges */}
                  <div className="absolute left-4 right-4 top-4 z-10 flex items-start justify-between">
                    {trip.category?.name || trip.category ? (
                      <div className="flex items-center gap-1.5 rounded-lg bg-primary-600 px-3 py-1.5 text-xs font-semibold text-white shadow-lg backdrop-blur-sm">
                        <Tag className="h-3 w-3" />
                        {trip.category?.name || trip.category}
                      </div>
                    ) : null}

                    {trip.discount > 0 && (
                      <div className="rounded-lg bg-secondary-600 px-3 py-1.5 text-xs font-bold text-white shadow-lg">
                        Save {trip.discount}%
                      </div>
                    )}
                  </div>

                  {/* Bottom Info */}
                  <div className="absolute bottom-0 left-0 right-0 z-10 p-4">
                    <div className="flex flex-wrap items-center gap-2">
                      {trip.days?.length > 0 && (
                        <div className="flex items-center gap-1.5 rounded-lg bg-white/20 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-sm">
                          <Calendar className="h-3.5 w-3.5" />
                          {trip.days.length} Days
                        </div>
                      )}

                      {getDestinationName(trip) && (
                        <div className="flex items-center gap-1.5 rounded-lg bg-white/20 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-sm">
                          <MapPin className="h-3.5 w-3.5" />
                          {getDestinationName(trip)}
                        </div>
                      )}

                      {trip.rating > 0 && (
                        <div className="flex items-center gap-1.5 rounded-lg bg-white/20 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-sm">
                          <Star className="h-3.5 w-3.5 fill-accent-400 text-accent-400" />
                          {trip.rating}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Content Section */}
                <div className="p-6">
                  <h3 className="mb-3 line-clamp-2 text-xl font-bold leading-tight text-primary-800 transition-colors duration-300 group-hover:text-primary-600">
                    {trip.mainTitle}
                  </h3>

                  <p className="mb-4 line-clamp-2 text-sm leading-relaxed text-text-light">
                    {trip.description || trip.overview || "Discover this amazing adventure in Tanzania."}
                  </p>

                  {/* Price Section */}
                  <div className="mb-4 rounded-xl border border-neutral-200 bg-gradient-to-br from-neutral-50 to-white p-4">
                    <div className="flex items-baseline gap-2">
                      <span className="text-xs font-medium text-text-light">Starting from</span>
                      <span className="text-2xl font-bold text-primary-700">
                        {getStartingPrice(trip) > 0 ? `$${formatPrice(getStartingPrice(trip))}` : "Contact Us"}
                      </span>
                      {getStartingPrice(trip) > 0 && (
                        <span className="text-xs font-medium text-text-light">/person</span>
                      )}
                    </div>
                    {trip.discount > 0 && getStartingPrice(trip) > 0 && (
                      <div className="mt-2 flex items-center gap-2">
                        <span className="text-xs text-text-light line-through">
                          ${formatPrice(Math.round(getStartingPrice(trip) / (1 - trip.discount / 100)))}
                        </span>
                        <span className="rounded-full bg-secondary-100 px-2 py-0.5 text-xs font-semibold text-secondary-700">
                          {trip.discount}% OFF
                        </span>
                      </div>
                    )}
                  </div>

                  {/* CTA Button */}
                  <button className="group/btn flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary-600 via-primary-700 to-primary-600 px-6 py-3 text-sm font-semibold text-white shadow-lg transition-all hover:scale-105 hover:shadow-xl">
                    <span>View Details</span>
                    <ArrowRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                  </button>
                </div>

                {/* Hover Effect Overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary-500/0 to-accent-500/0 opacity-0 transition-opacity duration-500 group-hover:opacity-5" />
              </div>
            ))}
          </div>
        ) : (
          <div className="py-20 text-center">
            <AlertCircle className="mx-auto h-16 w-16 text-text-light" />
            <p className="mt-4 text-lg font-medium text-text-light">
              No trips found. Try adjusting your filters or search query.
            </p>
          </div>
        )}

        {/* Load More / View All Button */}
        {filteredTrips.length > displayLimit && (
          <div className="mt-12 text-center" data-aos="fade-up" data-aos-delay="300">
            <button
              onClick={() => setDisplayLimit(displayLimit + 6)}
              className="group inline-flex items-center gap-2 rounded-xl border-2 border-primary-400 bg-white px-8 py-4 text-base font-semibold text-primary-700 shadow-lg transition-all hover:scale-105 hover:border-primary-500 hover:bg-primary-50 hover:shadow-xl"
            >
              <span>Load More Trips</span>
              <ChevronRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </button>
          </div>
        )}
      </div>

      {/* Section divider */}
      <div className="absolute bottom-0 left-0 h-px w-full bg-gradient-to-r from-transparent via-primary-200 to-transparent" />

      {/* Custom Animations */}
      <style>{`
        @keyframes shimmer {
          0% {
            transform: translateX(-100%) translateY(-100%) rotate(45deg);
          }
          100% {
            transform: translateX(100%) translateY(100%) rotate(45deg);
          }
        }
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
      `}</style>
    </section>
  );
};

export default DiscoverTrips;
