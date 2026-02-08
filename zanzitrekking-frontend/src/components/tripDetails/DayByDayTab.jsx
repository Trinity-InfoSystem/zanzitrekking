"use client";

import { useState } from "react";
import {
  Bed,
  Calendar,
  ChevronDown,
  ChevronUp,
  Coffee,
  Home,
  Image as ImageIcon,
  MapPin,
  Moon,
  Sun,
  Utensils,
} from "lucide-react";
import { IMAGES_URL } from "../../utils/constants";

const DayByDayTab = ({ days = [] }) => {
  const [expandedDays, setExpandedDays] = useState(days?.length > 0 ? [0] : []);

  const toggleDay = (index) => {
    setExpandedDays((prev) => {
      if (prev.includes(index)) {
        return prev.filter((i) => i !== index);
      } 
        return [...prev, index];
      
    });
  };

  const isExpanded = (index) => expandedDays.includes(index);

  const getPrimaryLocation = (fullAddress) => {
    if (!fullAddress) {return "";}
    return fullAddress.split(",")[0].trim();
  };

  const formatOverview = (overview) => {
    if (!overview) {return null;}

    const lines = overview.split("\n").filter((line) => line.trim());

    const hasBullet = (line) => {
      const trimmed = line.trim();
      const bulletPatterns = [/^[•·◦▪▸▹▻◉◈]/u, /^[-*]\s/, /^\d+\.\s/];
      return bulletPatterns.some((pattern) => pattern.test(trimmed));
    };

    const hasSpecialFormat = (line) => {
      const specialPatterns = [
        /^[A-Z][a-z]+\s+to\s+[A-Z]/,
        /^[A-Z][a-z]+:[^:]/,
        /^[A-Z][a-z]+\s+at\s+[A-Z]/,
      ];
      return specialPatterns.some((pattern) => pattern.test(line.trim()));
    };

    if (
      lines.length === 1 ||
      (lines.length > 0 && hasSpecialFormat(lines[0]))
    ) {
      return (
        <p className="whitespace-pre-line text-sm leading-relaxed text-neutral-600">
          {overview}
        </p>
      );
    }

    return (
      <ul className="space-y-2">
        {lines.map((line, idx) => {
          const lineHasBullet = hasBullet(line);
          return (
            <li
              key={idx}
              className={`flex items-start gap-2 text-sm leading-relaxed text-neutral-600 ${
                lineHasBullet ? "pl-4" : ""
              }`}
            >
              {!lineHasBullet && (
                <span className="mt-1.5 flex h-1.5 w-1.5 flex-shrink-0 rounded-full bg-slate-400" />
              )}
              <span>{line.trim()}</span>
            </li>
          );
        })}
      </ul>
    );
  };

  if (!days || days.length === 0) {
    return (
      <div className="flex min-h-[400px] items-center justify-center p-8">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-lg bg-slate-100">
            <Calendar className="h-7 w-7 text-slate-500" />
          </div>
          <h3 className="mb-2 text-lg font-semibold text-neutral-900">
            No Itinerary Available
          </h3>
          <p className="text-sm text-neutral-600">
            The day-by-day itinerary for this trip is not yet available.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="safari-itinerary space-y-4 p-6 lg:p-8">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        
        .safari-itinerary {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        }
        
        .day-card {
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .day-card:hover {
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.04);
        }
        
        .day-header {
          transition: all 0.2s ease;
        }
        
        .day-header:hover {
          background: linear-gradient(135deg, rgba(248, 250, 252, 0.8) 0%, rgba(241, 245, 249, 0.8) 100%);
        }
        
        .expand-button {
          transition: all 0.2s ease;
        }
        
        .expand-button:hover {
          background: rgba(71, 85, 105, 0.05);
          transform: scale(1.03);
        }
        
        .day-content {
          animation: slideDown 0.3s ease-out;
        }
        
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>

      {/* Header */}
      <div className="mb-6 rounded-xl border border-neutral-200/80 bg-white p-6 shadow-sm lg:p-8">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-slate-700 to-slate-800 shadow-sm">
            <Calendar className="h-6 w-6 text-white" />
          </div>
          <div className="flex-1">
            <h2 className="mb-2 text-2xl font-bold text-neutral-900 lg:text-3xl">
              Day-by-Day Itinerary
            </h2>
            <p className="text-sm text-neutral-600 lg:text-base">
              {days.length} {days.length === 1 ? "day" : "days"} of
              unforgettable adventure
            </p>
          </div>
          <div className="hidden rounded-lg bg-gradient-to-br from-slate-50 to-slate-100 px-4 py-3 sm:block">
            <div className="text-center">
              <div className="text-2xl font-bold text-slate-700">
                {days.length}
              </div>
              <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                {days.length === 1 ? "Day" : "Days"}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Days List */}
      {days.map((day, index) => {
        const imageName = day.image
          ? IMAGES_URL + day.image.split("/").pop()
          : "/placeholder.svg";

        return (
          <div
            key={index}
            className="day-card overflow-hidden rounded-xl border border-neutral-200/80 bg-white"
          >
            {/* Day Header */}
            <button
              onClick={() => toggleDay(index)}
              className="day-header flex w-full items-center justify-between border-b border-neutral-100 bg-gradient-to-r from-slate-50/30 to-transparent p-5 lg:p-6"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-slate-700 to-slate-800 text-base font-bold text-white shadow-sm lg:h-12 lg:w-12">
                  {index + 1}
                </div>
                <div className="text-left">
                  <div className="mb-1 flex items-center gap-2">
                    <span className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-slate-700">
                      Day {index + 1}
                    </span>
                    {day.mainDestination && (
                      <span className="hidden items-center gap-1.5 text-xs text-slate-500 sm:flex">
                        <MapPin className="h-3.5 w-3.5" />
                        {getPrimaryLocation(day.mainDestination?.name)}
                      </span>
                    )}
                  </div>
                  <h3 className="text-base font-semibold text-neutral-900 lg:text-lg">
                    {day.title}
                  </h3>
                </div>
              </div>
              <div className="expand-button flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg border border-neutral-200 bg-white">
                {isExpanded(index) ? (
                  <ChevronUp className="h-4 w-4 text-slate-600" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-slate-600" />
                )}
              </div>
            </button>

            {/* Day Content */}
            {isExpanded(index) && (
              <div className="day-content p-6 lg:p-8">
                {/* Day Image */}
                {day.image && (
                  <div className="relative mb-8 overflow-hidden rounded-xl shadow-sm">
                    <img
                      src={imageName}
                      alt={day.title}
                      className="h-72 w-full object-cover lg:h-80"
                      loading="lazy"
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/20 text-sm font-semibold text-white shadow-sm backdrop-blur-sm">
                          {index + 1}
                        </div>
                        <div>
                          <div className="text-xs font-medium uppercase tracking-wide text-white/80">
                            Day {index + 1}
                          </div>
                          <div className="text-sm font-semibold text-white">
                            {day.title}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Overview Section */}
                <div className="mb-8">
                  <div className="mb-4 flex items-center gap-3 border-b border-neutral-100 pb-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-slate-700 to-slate-800 shadow-sm">
                      <Sun className="h-4 w-4 text-white" />
                    </div>
                    <h4 className="text-base font-semibold text-neutral-900">
                      Today&apos;s Adventure
                    </h4>
                  </div>
                  <div className="prose prose-neutral max-w-none">
                    {formatOverview(day.overview)}
                  </div>
                </div>

                {/* Main Destination */}
                {day.mainDestination && (
                  <div className="mb-8 rounded-lg border border-neutral-200 bg-slate-50 p-5">
                    <div className="mb-2 flex items-center gap-2">
                      <div className="flex h-7 w-7 items-center justify-center rounded-md bg-gradient-to-br from-slate-700 to-slate-800 shadow-sm">
                        <MapPin className="h-3.5 w-3.5 text-white" />
                      </div>
                      <span className="text-sm font-semibold text-neutral-900">
                        Main Destination
                      </span>
                    </div>
                    <p className="text-sm font-medium text-slate-700">
                      {getPrimaryLocation(day.mainDestination?.name)}
                    </p>
                  </div>
                )}

                {/* Accommodation Section */}
                <div className="mb-8">
                  <div className="mb-4 flex items-center gap-3 border-b border-neutral-100 pb-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-slate-700 to-slate-800 shadow-sm">
                      <Moon className="h-4 w-4 text-white" />
                    </div>
                    <h4 className="text-base font-semibold text-neutral-900">
                      Overnight Stay
                    </h4>
                  </div>

                  {day.accommodation?.length > 0 ? (
                    <div className="space-y-4">
                      {day.accommodation.map((hotel, hotelIndex) => (
                        <div
                          key={hotelIndex}
                          className="overflow-hidden rounded-lg border border-neutral-200 bg-white"
                        >
                          <div className="border-b border-neutral-100 bg-gradient-to-r from-slate-50/30 to-transparent p-4">
                            <div className="flex items-start gap-3">
                              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md bg-gradient-to-br from-slate-700 to-slate-800 shadow-sm">
                                <Bed className="h-4 w-4 text-white" />
                              </div>
                              <div className="flex-1">
                                <h5 className="mb-1 text-sm font-semibold text-neutral-900">
                                  {hotel.name}
                                </h5>
                                {hotel.category && (
                                  <p className="text-xs font-medium text-slate-600">
                                    {hotel.category}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Hotel Images */}
                          {hotel.images?.length > 0 ? (
                            <div className="p-4">
                              <div className="mb-2 flex gap-3 overflow-x-auto pb-2">
                                {hotel.images.map((image, imgIndex) => (
                                  <div
                                    key={imgIndex}
                                    className="relative flex-shrink-0 overflow-hidden rounded-md shadow-sm transition-transform hover:scale-105"
                                  >
                                    <img
                                      src={IMAGES_URL + image.split("/").pop()}
                                      alt={`${hotel.name} - Image ${imgIndex + 1}`}
                                      className="h-20 w-20 object-cover"
                                      loading="lazy"
                                      onError={(e) => {
                                        e.target.style.display = "none";
                                        const placeholder =
                                          e.target.nextSibling;
                                        if (placeholder)
                                          {placeholder.style.display = "flex";}
                                      }}
                                    />
                                    <div
                                      style={{ display: "none" }}
                                      className="flex h-20 w-20 items-center justify-center bg-slate-100"
                                    >
                                      <ImageIcon className="h-6 w-6 text-slate-400" />
                                    </div>
                                  </div>
                                ))}
                              </div>
                              <p className="text-xs text-slate-500">
                                This or a similar premium option
                              </p>
                            </div>
                          ) : (
                            <div className="p-4">
                              <div className="flex items-center gap-3 rounded-md bg-slate-50 p-3">
                                <ImageIcon className="h-4 w-4 text-slate-400" />
                                <span className="text-xs text-slate-600">
                                  No images available
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-lg border border-dashed border-neutral-300 bg-slate-50 p-5">
                      <div className="flex items-start gap-3">
                        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md bg-slate-200">
                          <Home className="h-4 w-4 text-slate-600" />
                        </div>
                        <div>
                          <p className="mb-1 text-sm font-semibold text-neutral-900">
                            No accommodation provided
                          </p>
                          <p className="text-sm leading-relaxed text-slate-600">
                            You can opt to spend the night in a nearby town of
                            your choice.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Meals Section */}
                {day.meals?.length > 0 && (
                  <div>
                    <div className="mb-4 flex items-center gap-3 border-b border-neutral-100 pb-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-slate-700 to-slate-800 shadow-sm">
                        <Utensils className="h-4 w-4 text-white" />
                      </div>
                      <h4 className="text-base font-semibold text-neutral-900">
                        Meals Included
                      </h4>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {day.meals.map((meal, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-3 rounded-lg border border-neutral-200 bg-white p-3"
                        >
                          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-slate-100">
                            <Utensils className="h-4 w-4 text-slate-600" />
                          </div>
                          <span className="text-sm font-medium capitalize text-neutral-900">
                            {meal}
                          </span>
                        </div>
                      ))}
                      <div className="flex items-center gap-3 rounded-lg border border-neutral-200 bg-white p-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-indigo-100">
                          <Coffee className="h-4 w-4 text-indigo-600" />
                        </div>
                        <span className="text-sm font-medium text-neutral-900">
                          Drinking water
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default DayByDayTab;
