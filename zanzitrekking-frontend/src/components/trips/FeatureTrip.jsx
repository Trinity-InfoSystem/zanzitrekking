import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  Award,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock,
  MapPin,
  Mountain,
  Shield,
  Sparkles,
  Star,
  Tag,
  TrendingUp,
  Users,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { resolveMediaUrl } from "../../utils/imageUtils";
import { formatPrice, getStartingPrice } from "../../utils/pricing";
const FeatureTrip = ({ trips }) => {
  const sliderRef = useRef(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [playingVideos, setPlayingVideos] = useState({});
  const navigate = useNavigate();

  const toggleVideo = (tripId, videoRef) => {
    if (videoRef.paused) {
      videoRef.play();
      setPlayingVideos((prev) => ({ ...prev, [tripId]: true }));
    } else {
      videoRef.pause();
      setPlayingVideos((prev) => ({ ...prev, [tripId]: false }));
    }
  };

  // Mock data for demo
  const mockTrips = [
    {
      _id: "1",
      mainTitle: "Mount Kilimanjaro Trek - Machame Route",
      description:
        "Conquer Africa's highest peak through the scenic Machame route with expert guides and premium camping equipment.",
      mainImage:
        "https://images.unsplash.com/photo-1609198092458-38a293c7ac4b?w=800&h=600",
      mainVideo: "https://www.w3schools.com/html/mov_bbb.mp4",
      rating: 4.9,
      discount: 15,
      category: "Trekking",
      pricingType: "yearRound",
      days: [1, 2, 3, 4, 5, 6, 7],
      regularPrices: { onePerson: 2500, twoPerson: 2200 },
      mainDestination: {
        name: "Kilimanjaro Region, Tanzania",
      },
    },
    {
      _id: "2",
      mainTitle: "Serengeti Safari Adventure",
      description:
        "Witness the Great Migration and Big Five in Tanzania's most famous national park with luxury camping.",
      mainImage:
        "https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=800&h=600",
      mainVideo: "https://www.w3schools.com/html/movie.mp4",
      rating: 4.8,
      discount: 0,
      category: "Safaris",
      pricingType: "yearRound",
      days: [1, 2, 3, 4, 5],
      regularPrices: { onePerson: 1800, twoPerson: 1600 },
      mainDestination: {
        name: "Serengeti National Park, Tanzania",
      },
    },
    {
      _id: "3",
      mainTitle: "Zanzibar Beach & Culture",
      description:
        "Relax on pristine beaches and explore Stone Town's rich history in this perfect cultural and beach combination.",
      mainImage:
        "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&h=600",
      rating: 4.7,
      discount: 20,
      category: "Beach & Culture",
      pricingType: "yearRound",
      days: [1, 2, 3, 4],
      regularPrices: { onePerson: 1200, twoPerson: 1000 },
      mainDestination: {
        name: "Zanzibar, Tanzania",
      },
    },
  ];

  const actualTrips = trips && trips.length > 0 ? trips : mockTrips;

  // Auto-play functionality
  useEffect(() => {
    if (!isAutoPlaying || actualTrips.length <= 1) {return;}

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % actualTrips.length);
    }, 6000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, actualTrips.length]);

  const handlePrev = useCallback(() => {
    setCurrentSlide(
      (prev) => (prev - 1 + actualTrips.length) % actualTrips.length,
    );
    setIsAutoPlaying(false);
  }, [actualTrips.length]);

  const handleNext = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % actualTrips.length);
    setIsAutoPlaying(false);
  }, [actualTrips.length]);

  const goToSlide = (index) => {
    setCurrentSlide(index);
    setIsAutoPlaying(false);
  };

  // Pricing functions imported from utils

  return (
    <section className="relative bg-white py-16 lg:py-20">
      <div className="mx-auto max-w-7xl overflow-hidden px-4 lg:px-8">
        {/* Section Header */}
        <div className="mb-12 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-lg border border-primary-200 bg-primary-50 px-4 py-2">
            <Mountain className="h-4 w-4 text-primary-600" />
            <span className="text-sm font-semibold text-primary-700">
              Featured Adventures
            </span>
          </div>

          <h2 className="mb-4 text-3xl font-bold text-primary-800 lg:text-4xl">
            Discover Your Next Adventure
          </h2>
          <div className="mx-auto mb-4 h-1 w-20 rounded-full bg-gradient-to-r from-secondary-500 to-accent-500" />

          <p className="mx-auto max-w-2xl text-base text-text-light lg:text-lg">
            Handpicked experiences that showcase the best of Tanzania&apos;s natural
            wonders
          </p>
        </div>

        {/* Slider Container */}
        <div className="relative">
          <div className="overflow-hidden rounded-2xl" ref={sliderRef}>
            <div className="relative">
              <div
                className="flex transition-transform duration-700 ease-out"
                style={{
                  transform: `translateX(-${currentSlide * 100}%)`,
                }}
              >
                {actualTrips.map((trip, index) => (
                  <div key={trip._id} className="min-w-full px-2">
                    <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-soft transition-all hover:shadow-soft-lg">
                      <div className="grid gap-0 lg:grid-cols-2">
                        {/* Image/Video Section */}
                        <div className="group relative h-96 overflow-hidden lg:h-[550px]">
                          {trip.mainVideo ? (
                            <div className="relative h-full w-full bg-black">
                              <video
                                ref={(ref) => {
                                  if (ref && !playingVideos[trip._id]) {
                                    ref.play();
                                    setPlayingVideos((prev) => ({
                                      ...prev,
                                      [trip._id]: true,
                                    }));
                                  }
                                }}
                                onClick={(e) => toggleVideo(trip._id, e.target)}
                                className="h-full w-full cursor-pointer object-cover"
                                autoPlay
                                loop
                                muted
                                playsInline
                                src={
                                  trip.mainVideo
                                    ? resolveMediaUrl(trip.mainVideo)
                                    : ""
                                }
                              >
                                Your browser does not support the video tag.
                              </video>
                            </div>
                          ) : (
                            <>
                              <img
                                src={
                                  trip.mainImage
                                    ? resolveMediaUrl(trip.mainImage)
                                    : "/placeholder.jpg"
                                }
                                alt={trip.mainTitle}
                                loading="lazy"
                                decoding="async"
                                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                              />

                              <div className="absolute inset-0 bg-gradient-to-t from-primary-900/60 to-transparent" />
                            </>
                          )}

                          {/* Top Badges */}
                          <div className="absolute left-4 right-4 top-4 z-10 flex items-start justify-between">
                            {/* Category Badge */}
                            {(trip.category?.name || trip.category) && (
                              <div className="flex items-center gap-1.5 rounded-lg bg-primary-600 px-3 py-1.5 text-xs font-semibold text-white shadow-soft backdrop-blur-sm">
                                <Tag className="h-3 w-3" />
                                {trip.category?.name || trip.category}
                              </div>
                            )}

                            {/* Discount Badge */}
                            {trip.discount > 0 && (
                              <div className="rounded-lg bg-secondary-600 px-3 py-1.5 text-xs font-bold text-white shadow-soft">
                                Save {trip.discount}%
                              </div>
                            )}
                          </div>

                          {/* Bottom Info Bar */}
                          <div className="absolute bottom-0 left-0 right-0 z-10 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-4">
                            <div className="flex flex-wrap items-center gap-3">
                              <div className="flex items-center gap-1.5 rounded-lg bg-white/20 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-sm">
                                <Calendar className="h-3.5 w-3.5" />
                                {trip.days?.length || 0} Days
                              </div>

                              {(Array.isArray(trip.mainDestination)
                                ? trip.mainDestination[0]?.name
                                : trip.mainDestination?.name) && (
                                <div className="flex items-center gap-1.5 rounded-lg bg-white/20 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-sm">
                                  <MapPin className="h-3.5 w-3.5" />
                                  {
                                    (Array.isArray(trip.mainDestination)
                                      ? trip.mainDestination[0]?.name
                                      : trip.mainDestination?.name
                                    )?.split(",")[0]
                                  }
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
                        <div className="flex flex-col justify-between p-6 lg:p-8">
                          <div>
                            {/* Title */}
                            <h3 className="mb-4 text-2xl font-bold leading-tight text-primary-800 lg:text-3xl">
                              {trip.mainTitle}
                            </h3>

                            {/* Description */}
                            <p className="mb-6 line-clamp-3 text-base leading-relaxed text-text-light">
                              {trip.description || trip.overview}
                            </p>

                            {/* Features Grid */}
                            <div className="mb-6 grid grid-cols-2 gap-3">
                              <FeatureItem
                                icon={Shield}
                                text="Safety First"
                                color="primary"
                              />
                              <FeatureItem
                                icon={Award}
                                text="Certified Guides"
                                color="primary"
                              />
                              <FeatureItem
                                icon={Users}
                                text="Expert Team"
                                color="primary"
                              />
                              <FeatureItem
                                icon={Clock}
                                text="24/7 Support"
                                color="primary"
                              />
                            </div>

                            {/* Pricing Type Badge */}
                            {trip.pricingType === "seasonal" && (
                              <div className="mb-4 inline-flex items-center gap-2 rounded-lg border border-accent-200 bg-accent-50 px-3 py-1.5 text-xs font-medium text-accent-700">
                                <Sparkles className="h-3.5 w-3.5" />
                                Seasonal Pricing Available
                              </div>
                            )}
                          </div>

                          {/* Pricing and CTA */}
                          <div>
                            <div className="mb-4 rounded-xl border border-neutral-200 bg-gradient-to-br from-neutral-50 to-white p-5 shadow-soft">
                              <div className="mb-2 flex items-baseline gap-2">
                                <span className="text-sm font-medium text-text-light">
                                  Starting from
                                </span>
                                <span className="text-3xl font-bold text-primary-700">
                                  ${formatPrice(getStartingPrice(trip))}
                                </span>
                                <span className="text-sm font-medium text-text-light">
                                  /person
                                </span>
                              </div>

                              {trip.discount > 0 && (
                                <div className="flex items-center gap-2">
                                  <span className="text-sm text-text-light line-through">
                                    $
                                    {formatPrice(
                                      Math.round(
                                        getStartingPrice(trip) /
                                          (1 - trip.discount / 100),
                                      ),
                                    )}
                                  </span>
                                  <span className="rounded-full bg-secondary-100 px-2.5 py-0.5 text-xs font-semibold text-secondary-700">
                                    {trip.discount}% OFF
                                  </span>
                                </div>
                              )}
                            </div>

                            <button
                              onClick={() =>
                                navigate(`/trip/details/${trip.slug}`)
                              }
                              className="group flex w-full items-center justify-center gap-2 rounded-xl bg-primary-600 px-6 py-3.5 text-base font-semibold text-white shadow-soft transition-all hover:bg-primary-700 hover:shadow-soft-md"
                            >
                              <span>View Full Details</span>
                              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Navigation */}
          {actualTrips.length > 1 && (
            <>
              <button
                onClick={handlePrev}
                className="absolute -left-7 top-1/2 z-20 -translate-y-1/2 p-2 text-primary-600 transition-all hover:text-primary-800 sm:-left-8 md:-left-10"
                aria-label="Previous"
              >
                <ChevronLeft className="h-8 w-8 stroke-[1.5] sm:h-10 sm:w-10" />
              </button>

              <button
                onClick={handleNext}
                className="absolute -right-7 top-1/2 z-20 -translate-y-1/2 p-2 text-primary-600 transition-all hover:text-primary-800 sm:-right-8 md:-right-10"
                aria-label="Next"
              >
                <ChevronRight className="h-8 w-8 stroke-[1.5] sm:h-10 sm:w-10" />
              </button>

              {/* Dots */}
              <div className="mt-8 flex justify-center gap-2">
                {actualTrips.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => goToSlide(index)}
                    className={`h-2 rounded-full transition-all ${
                      index === currentSlide
                        ? "w-8 bg-primary-600"
                        : "w-2 bg-neutral-300 hover:bg-primary-400"
                    }`}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        {/* Bottom CTA */}
        <div className="mt-12 text-center">
          <Link
            to="/trips"
            className="group inline-flex items-center gap-2 text-base font-semibold text-primary-600 transition-all hover:gap-3 hover:text-primary-700"
          >
            <span>Explore All Adventures</span>
            <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
      {/* Section divider */}
      <div className="absolute bottom-0 left-0 h-px w-full bg-gradient-to-r from-transparent via-primary-200 to-transparent" />
    </section>
  );
};

const FeatureItem = ({ icon: Icon, text, color }) => {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-neutral-200 bg-white px-3 py-2.5 transition-all hover:border-primary-300 hover:bg-primary-50">
      <Icon className={`h-4 w-4 text-${color}-600`} />
      <span className="text-sm font-medium text-text">{text}</span>
    </div>
  );
};

export default FeatureTrip;
