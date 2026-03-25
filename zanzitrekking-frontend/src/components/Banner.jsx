"use client";

import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetch_banner } from "../store/reducers/bannerReducer";
import {
  ArrowRight,
  Award,
  Calendar,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Mountain,
  Play,
  Shield,
  Star,
  Users,
  X,
} from "lucide-react";
import { resolveMediaUrl } from "../utils/imageUtils";

const Banner = () => {
  const dispatch = useDispatch();
  const { banner, errorMessage } = useSelector((state) => state.banner);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [isVideoError, setIsVideoError] = useState(false);
  const videoRef = useRef(null);

  const displayDuration = 6000;

  const getDynamicStats = (bannerItem) => {
    const title = bannerItem.title?.toLowerCase() || "";
    const description = bannerItem.description?.toLowerCase() || "";

    const daysMatch = (`${title  } ${  description}`).match(
      /(\d+)[\s-]*(day|days)/i,
    );
    const days = daysMatch ? `${daysMatch[1]} Days` : "Multi-Day";

    const groupMatch = (`${title  } ${  description}`).match(
      /(\d+)[\s-]*(people|person|pax|group)/i,
    );
    const groupSize = groupMatch ? `Max ${groupMatch[1]}` : "Small Groups";

    if (
      title.includes("kilimanjaro") ||
      title.includes("mountain") ||
      title.includes("trek")
    ) {
      return [
        { icon: Mountain, label: days, value: "Trek" },
        { icon: Users, label: groupSize, value: "Group" },
        { icon: Award, label: "Expert", value: "Guides" },
        { icon: Shield, label: "98%", value: "Success" },
      ];
    } else if (
      title.includes("safari") ||
      title.includes("serengeti") ||
      title.includes("wildlife")
    ) {
      return [
        { icon: Calendar, label: days, value: "Safari" },
        { icon: Users, label: groupSize, value: "Vehicle" },
        { icon: Star, label: "Big 5", value: "Wildlife" },
        { icon: Award, label: "Premium", value: "Experience" },
      ];
    } else if (
      title.includes("zanzibar") ||
      title.includes("beach") ||
      title.includes("island")
    ) {
      return [
        { icon: Calendar, label: days, value: "Holiday" },
        { icon: MapPin, label: "UNESCO", value: "Sites" },
        { icon: Star, label: "Pristine", value: "Beaches" },
        { icon: Users, label: groupSize, value: "Travelers" },
      ];
    }

    return [
      { icon: Calendar, label: days, value: "Duration" },
      { icon: Shield, label: "Licensed", value: "Operator" },
      { icon: Award, label: "Certified", value: "Guides" },
      { icon: Users, label: "15K+", value: "Clients" },
    ];
  };

  useEffect(() => {
    dispatch(fetch_banner())
      .then(() => setIsLoading(false))
      .catch(() => setIsLoading(false));
  }, [dispatch]);

  const sharedVideoUrl = banner?.sharedVideo
    ? resolveMediaUrl(banner.sharedVideo)
    : null;

  useEffect(() => {
    if (!banner?.banners || banner.banners.length <= 1 || sharedVideoUrl)
      {return;}
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % banner.banners.length);
    }, displayDuration);
    return () => clearInterval(interval);
  }, [banner?.banners, sharedVideoUrl]);

  const goToSlide = (index) => setActiveIndex(index);
  const goToPrevious = () => {
    if (!banner?.banners) {return;}
    setActiveIndex(
      (prev) => (prev - 1 + banner.banners.length) % banner.banners.length,
    );
  };
  const goToNext = () => {
    if (!banner?.banners) {return;}
    setActiveIndex((prev) => (prev + 1) % banner.banners.length);
  };

  const openVideoModal = () => {
    if (sharedVideoUrl) {setShowVideoModal(true);}
  };

  if (isLoading || !banner?.banners) {
    return (
      <div className="relative h-[60vh] w-full overflow-hidden bg-neutral-900">
        <div className="relative z-10 flex h-full items-center justify-center">
          <div className="flex flex-col items-center justify-center">
            <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-white/20 border-t-white"></div>
            <p className="text-base font-medium text-white">
              Loading Adventures...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className="flex h-[20vh] items-center justify-center bg-neutral-100">
        <p className="text-lg font-semibold text-neutral-700">{errorMessage}</p>
      </div>
    );
  }

  return (
    <>
      <section className="relative h-[60vh] w-full bg-neutral-900">
        <div className="relative h-full w-full overflow-hidden">
          {/* Background Media */}
          <div className="absolute inset-0">
            {sharedVideoUrl && !isVideoError ? (
              <video
                ref={videoRef}
                src={sharedVideoUrl}
                className="h-full w-full object-cover"
                autoPlay
                muted
                loop
                playsInline
                preload="auto"
                onError={() => setIsVideoError(true)}
              />
            ) : (
              <img
                src={
                  banner.banners[activeIndex]?.image
                    ? resolveMediaUrl(banner.banners[activeIndex].image)
                    : "/placeholder.jpg"
                }
                alt={banner.banners[activeIndex]?.title || "Banner"}
                className="h-full w-full object-cover"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/60"></div>
          </div>

          {/* Content Overlay */}
          {(!sharedVideoUrl || isVideoError) &&
            banner.banners.map((bnr, index) => {
              const isActive = index === activeIndex;
              const dynamicStats = getDynamicStats(bnr);

              return (
                <div
                  key={bnr._id}
                  className={`absolute inset-0 transition-opacity duration-700 ${
                    isActive ? "opacity-100" : "opacity-0"
                  }`}
                >
                  <div className="relative z-20 flex h-full items-center">
                    <div className="container mx-auto px-6 lg:px-12">
                      <div className="max-w-3xl">
                        {bnr.subTitle && (
                          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-4 py-2 backdrop-blur-md">
                            <MapPin className="h-4 w-4 text-accent-400" />
                            <span className="text-sm font-semibold uppercase tracking-wide text-white">
                              {bnr.subTitle}
                            </span>
                          </div>
                        )}

                        <h1 className="mb-4 text-4xl font-bold leading-tight text-white md:text-5xl lg:text-6xl">
                          {bnr.title ||
                            "Experience the Adventure of a Lifetime"}
                        </h1>

                        <p className="mb-8 max-w-2xl text-base leading-relaxed text-white/90 md:text-lg">
                          {bnr.description ||
                            "Embark on an unforgettable journey through Tanzania's most spectacular destinations."}
                        </p>

                        <div className="mb-8 flex flex-wrap gap-3">
                          {dynamicStats.map((stat, idx) => (
                            <div
                              key={idx}
                              className="flex items-center gap-2 rounded-lg bg-white/10 px-4 py-2.5 backdrop-blur-md"
                            >
                              <stat.icon className="h-5 w-5 text-accent-400" />
                              <div>
                                <div className="text-sm font-bold text-white">
                                  {stat.label}
                                </div>
                                <div className="text-xs text-white/80">
                                  {stat.value}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>

                        <div className="flex flex-wrap gap-4">
                          {bnr.buttonText && bnr.buttonLink && (
                            <a
                              href={bnr.buttonLink}
                              className="group inline-flex items-center gap-2 rounded-lg bg-primary-600 px-6 py-3.5 font-semibold text-white shadow-lg transition-all hover:bg-primary-700 hover:shadow-xl"
                            >
                              {bnr.buttonText}
                              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                            </a>
                          )}

                          {sharedVideoUrl && !isVideoError && (
                            <button
                              onClick={openVideoModal}
                              className="inline-flex items-center gap-2 rounded-lg border-2 border-white/30 bg-white/10 px-6 py-3.5 font-semibold text-white backdrop-blur-md transition-all hover:bg-white/20"
                            >
                              <Play className="h-5 w-5" />
                              Watch Video
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

          {/* Navigation Arrows */}
          {(!sharedVideoUrl || isVideoError) && banner.banners.length > 1 && (
            <>
              <button
                onClick={goToPrevious}
                className="absolute left-4 top-1/2 z-30 -translate-y-1/2 rounded-full bg-white/20 p-3 backdrop-blur-md transition-all hover:bg-white/30 lg:left-8"
                aria-label="Previous slide"
              >
                <ChevronLeft className="h-6 w-6 text-white" />
              </button>
              <button
                onClick={goToNext}
                className="absolute right-4 top-1/2 z-30 -translate-y-1/2 rounded-full bg-white/20 p-3 backdrop-blur-md transition-all hover:bg-white/30 lg:right-8"
                aria-label="Next slide"
              >
                <ChevronRight className="h-6 w-6 text-white" />
              </button>
            </>
          )}

          {/* Slide Indicators */}
          {(!sharedVideoUrl || isVideoError) && banner.banners.length > 1 && (
            <div className="absolute bottom-8 left-1/2 z-30 flex -translate-x-1/2 gap-2">
              {banner.banners.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`h-2 rounded-full transition-all ${
                    index === activeIndex
                      ? "w-8 bg-white"
                      : "w-2 bg-white/50 hover:bg-white/70"
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          )}
        </div>
        {/* Bottom accent line */}
        <div className="absolute bottom-0 left-0 z-20 h-px w-full bg-gradient-to-r from-transparent via-primary-200 to-transparent" />
      </section>

      {/* Video Modal */}
      {showVideoModal && sharedVideoUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-sm"
          onClick={() => setShowVideoModal(false)}
        >
          <div className="relative mx-4 w-full max-w-5xl">
            <button
              onClick={() => setShowVideoModal(false)}
              className="absolute -top-12 right-0 flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-sm transition-all hover:bg-white/30"
              aria-label="Close video"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="aspect-video w-full overflow-hidden rounded-xl bg-black">
              <video
                src={sharedVideoUrl}
                className="h-full w-full"
                controls
                autoPlay
              >
                Your browser does not support the video tag.
              </video>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Banner;
