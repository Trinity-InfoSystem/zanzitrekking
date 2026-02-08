import React, { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import {
  Award,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Image as ImageIcon,
  Star,
  Users,
} from "lucide-react";
import { IMAGES_URL } from "../../../utils/constants";

const PartnersSection = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const { partners: apiPartners, loader: partnersLoader } = useSelector(
    (state) => state.partner,
  );

  // Sort by order - Create a COPY before sorting (Redux arrays are immutable)
  const partners = useMemo(() => {
    if (Array.isArray(apiPartners) && apiPartners.length > 0) {
      return [...apiPartners].sort((a, b) => (a.order || 0) - (b.order || 0));
    }
    return [];
  }, [apiPartners]);

  // Create stable star arrays
  const starArray = useMemo(() => Array.from({ length: 5 }, (_, i) => i), []);

  // Calculate items per slide - 3 for desktop, handled by grid for mobile/tablet
  const itemsPerSlide = 3;
  const totalSlides = Math.ceil(partners.length / itemsPerSlide);

  // Auto-rotate carousel
  useEffect(() => {
    if (partners.length > itemsPerSlide) {
      const interval = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % totalSlides);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [partners.length, itemsPerSlide, totalSlides]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % totalSlides);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? totalSlides - 1 : prev - 1));
  };

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  // Show loader or empty state
  if (partnersLoader) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-2 border-neutral-200 border-t-primary-600" />
      </div>
    );
  }

  if (!partners || partners.length === 0) {
    return null;
  }

  return (
    <div className="space-y-8">
      {/* Section Header */}
      <div className="text-center">
        <div className="mb-4 inline-flex items-center gap-2 rounded-lg border border-neutral-200 bg-neutral-50 px-4 py-2">
          <CheckCircle className="h-4 w-4 text-neutral-600" />
          <span className="text-sm font-semibold text-neutral-700">
            Trusted & Verified Partners
          </span>
        </div>

        <h2 className="mb-3 text-3xl font-bold text-neutral-900 lg:text-4xl">
          Featured On Leading Platforms
        </h2>

        <div className="mx-auto mb-4 h-px w-16 rounded-full bg-neutral-300" />

        <p className="mx-auto max-w-2xl text-base text-neutral-600">
          Recognized across the world&apos;s most trusted travel and booking
          platforms
        </p>
      </div>

      {/* Partners Carousel */}
      <div className="relative">
        <div className="flex items-center gap-4">
          {/* Navigation Buttons - Only show if more than 3 partners */}
          {partners.length > itemsPerSlide && totalSlides > 1 && (
            <button
              onClick={prevSlide}
              className="flex-shrink-0 rounded-full border border-neutral-200 bg-white p-3 text-neutral-600 shadow-soft transition-all duration-200 hover:border-neutral-300 hover:bg-neutral-50 hover:text-neutral-900 hover:shadow-soft-md"
              aria-label="Previous partners"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
          )}

          {/* Carousel Container */}
          <div className="flex-1 overflow-hidden rounded-xl">
            <div
              className="flex transition-transform duration-500 ease-out"
              style={{
                transform: `translateX(-${currentSlide * 100}%)`,
              }}
            >
              {Array.from({ length: totalSlides }, (_, slideIndex) => (
                <div
                  key={slideIndex}
                  className="grid w-full flex-shrink-0 grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
                >
                  {partners
                    .slice(
                      slideIndex * itemsPerSlide,
                      slideIndex * itemsPerSlide + itemsPerSlide,
                    )
                    .map((partner) => (
                      <div
                        key={partner._id}
                        className="group relative overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-soft transition-all duration-300 hover:border-neutral-300 hover:shadow-soft-lg"
                      >
                        {/* Partner Logo/Image */}
                        <div className="relative h-48 overflow-hidden bg-neutral-50">
                          {partner.logo ? (
                            <img
                              src={partner.logo}
                              // src={IMAGES_URL + partner.logo.split("/").pop()}
                              alt={partner.name}
                              className="h-full w-full object-contain p-8 transition-transform duration-300 group-hover:scale-105"
                              onError={(e) => {
                                e.target.style.display = "none";
                                e.target.nextSibling.style.display = "flex";
                              }}
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center">
                              <ImageIcon className="h-16 w-16 text-neutral-400" />
                            </div>
                          )}

                          {/* Fallback if image fails to load */}
                          <div className="hidden h-full w-full items-center justify-center">
                            <ImageIcon className="h-16 w-16 text-neutral-400" />
                          </div>
                        </div>

                        {/* Content */}
                        <div className="relative p-6">
                          {/* Badge */}
                          <span className="mb-3 inline-flex items-center gap-1 rounded-full border border-neutral-300 bg-neutral-100 px-3 py-1 text-xs font-semibold text-neutral-700">
                            {partner.badge || "Verified Partner"}
                          </span>

                          {/* Partner Name */}
                          <h3 className="mb-4 text-lg font-bold text-neutral-900 transition-colors group-hover:text-neutral-700">
                            {partner.name}
                          </h3>

                          {/* Divider */}
                          <div className="mb-4 h-px bg-neutral-200" />

                          {/* Rating & Reviews */}
                          <div className="space-y-3">
                            <div className="flex items-center gap-2">
                              <div className="flex gap-0.5">
                                {starArray.map((i) => (
                                  <Star
                                    key={`${partner._id}-star-${i}`}
                                    className={`h-4 w-4 transition-all ${
                                      i < Math.floor(partner.rating || 0)
                                        ? "fill-neutral-900 text-neutral-900"
                                        : "fill-neutral-300 text-neutral-300"
                                    }`}
                                  />
                                ))}
                              </div>
                              <span className="text-base font-bold text-neutral-900">
                                {(partner.rating || 0).toFixed(1)}
                              </span>
                            </div>

                            <div className="flex items-center gap-2 text-sm text-neutral-600">
                              <Users className="h-4 w-4" />
                              <span className="font-medium">
                                {(partner.reviews || 0).toLocaleString()}{" "}
                                reviews
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              ))}
            </div>
          </div>

          {/* Navigation Buttons - Only show if more than 3 partners */}
          {partners.length > itemsPerSlide && totalSlides > 1 && (
            <button
              onClick={nextSlide}
              className="flex-shrink-0 rounded-full border border-neutral-200 bg-white p-3 text-neutral-600 shadow-soft transition-all duration-200 hover:border-neutral-300 hover:bg-neutral-50 hover:text-neutral-900 hover:shadow-soft-md"
              aria-label="Next partners"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Carousel Indicators */}
        {partners.length > itemsPerSlide && totalSlides > 1 && (
          <div className="mt-8 flex justify-center gap-2">
            {Array.from({ length: totalSlides }, (_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`transition-all duration-300 ${
                  index === currentSlide
                    ? "h-2 w-8 rounded-full bg-neutral-900"
                    : "h-2 w-2 rounded-full bg-neutral-300 hover:bg-neutral-400"
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PartnersSection;
