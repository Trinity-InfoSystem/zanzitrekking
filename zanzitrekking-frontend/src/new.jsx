"use client";

import { useState } from "react";
import {
  Bed,
  Calendar,
  ChevronDown,
  ChevronUp,
  Clock,
  Coffee,
  Home,
  Image as ImageIcon,
  Map,
  MapPin,
  Moon,
  Sparkles,
  Star,
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
        <p className="whitespace-pre-line leading-relaxed text-neutral-600">
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
              className={`flex items-start gap-2 leading-relaxed text-neutral-600 ${
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
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200">
            <Calendar className="h-8 w-8 text-slate-400" />
          </div>
          <h3 className="mb-2 text-lg font-bold text-neutral-900">
            No Itinerary Available
          </h3>
          <p className="text-sm text-neutral-500">
            The day-by-day itinerary for this trip is not yet available.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 lg:p-8">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&display=swap');
        
        .safari-itinerary {
          font-family: 'Outfit', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        }
        
        .day-card {
          background: white;
          border: 1px solid rgba(0, 0, 0, 0.08);
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .day-card:hover {
          box-shadow: 0 12px 32px rgba(0, 0, 0, 0.08);
          border-color: rgba(71, 85, 105, 0.15);
        }
        
        .day-expanded {
          box-shadow: 0 12px 32px rgba(0, 0, 0, 0.1);
        }
        
        .day-header {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .day-header:hover {
          background: linear-gradient(135deg, rgba(248, 250, 252, 1) 0%, rgba(241, 245, 249, 1) 100%);
        }
        
        .day-number-badge {
          background: linear-gradient(135deg, #475569 0%, #334155 100%);
          box-shadow: 0 4px 12px rgba(71, 85, 105, 0.25);
        }
        
        .section-icon {
          background: linear-gradient(135deg, #64748b 0%, #475569 100%);
        }
        
        .expand-button {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .expand-button:hover {
          background: rgba(71, 85, 105, 0.08);
          transform: scale(1.05);
        }
        
        .day-content {
          animation: slideDown 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .hotel-card {
          border: 1px solid rgba(0, 0, 0, 0.08);
          transition: all 0.3s ease;
        }
        
        .hotel-card:hover {
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
          border-color: rgba(71, 85, 105, 0.15);
          transform: translateY(-2px);
        }
        
        .image-overlay {
          background: linear-gradient(to top, rgba(0, 0, 0, 0.7) 0%, rgba(0, 0, 0, 0) 100%);
        }
        
        .meal-badge {
          transition: all 0.3s ease;
        }
        
        .meal-badge:hover {
          background: rgba(71, 85, 105, 0.08);
          transform: translateX(4px);
        }
        
        .info-badge {
          background: linear-gradient(135deg, rgba(100, 116, 139, 0.1) 0%, rgba(71, 85, 105, 0.05) 100%);
          border: 1px solid rgba(71, 85, 105, 0.15);
        }
      `}</style>

      {/* Header */}
      <div className="safari-itinerary mb-8 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm lg:p-8">
        <div className="flex items-start gap-4">
          <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-600 to-slate-700 shadow-lg">
            <Map className="h-7 w-7 text-white" />
          </div>
          <div className="flex-1">
            <h2 className="mb-2 text-2xl font-bold text-neutral-900 lg:text-3xl">
              Your Safari Itinerary
            </h2>
            <p className="text-sm text-neutral-600 lg:text-base">
              Experience {days.length} unforgettable{" "}
              {days.length === 1 ? "day" : "days"} of adventure through
              Tanzania&apos;s wildlife and landscapes
            </p>
          </div>
          <div className="hidden rounded-xl bg-gradient-to-br from-slate-50 to-slate-100 px-4 py-3 sm:block">
            <div className="text-center">
              <div className="text-2xl font-bold text-slate-700">
                {days.length}
              </div>
              <div className="text-xs font-medium uppercase tracking-wide text-slate-500">
                {days.length === 1 ? "Day" : "Days"}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Days List */}
      <div className="safari-itinerary space-y-5">
        {days.map((day, index) => {
          const imageName = day.image
            ? IMAGES_URL + day.image.split("/").pop()
            : "/placeholder.svg";

          return (
            <div
              key={index}
              className={`day-card overflow-hidden rounded-2xl ${
                isExpanded(index) ? "day-expanded" : ""
              }`}
            >
              {/* Day Header */}
              <button
                onClick={() => toggleDay(index)}
                className="day-header flex w-full items-center justify-between border-b border-neutral-100 bg-gradient-to-r from-slate-50/50 to-transparent p-5 lg:p-6"
              >
                <div className="flex items-center gap-4">
                  <div className="day-number-badge flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl text-lg font-bold text-white lg:h-14 lg:w-14">
                    {index + 1}
                  </div>
                  <div className="text-left">
                    <div className="mb-1 flex items-center gap-2">
                      <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-slate-700">
                        Day {index + 1}
                      </span>
                      {day.mainDestination && (
                        <span className="hidden items-center gap-1.5 text-xs text-slate-500 sm:flex">
                          <MapPin className="h-3.5 w-3.5" />
                          {getPrimaryLocation(day.mainDestination?.name)}
                        </span>
                      )}
                    </div>
                    <h3 className="text-base font-bold text-neutral-900 lg:text-lg">
                      {day.title}
                    </h3>
                  </div>
                </div>
                <div className="expand-button flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-white">
                  {isExpanded(index) ? (
                    <ChevronUp className="h-5 w-5 text-slate-600" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-slate-600" />
                  )}
                </div>
              </button>

              {/* Day Content */}
              {isExpanded(index) && (
                <div className="day-content p-6 lg:p-8">
                  {/* Day Image */}
                  {day.image && (
                    <div className="relative mb-8 overflow-hidden rounded-2xl shadow-lg">
                      <img
                        src={imageName}
                        alt={day.title}
                        className="h-80 w-full object-cover lg:h-96"
                        loading="lazy"
                      />
                      <div className="image-overlay absolute bottom-0 left-0 right-0 p-6">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 text-sm font-bold text-white shadow-lg backdrop-blur-sm">
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
                    <div className="mb-5 flex items-center gap-3 border-b border-neutral-100 pb-4">
                      <div className="section-icon flex h-10 w-10 items-center justify-center rounded-xl shadow-md">
                        <Sun className="h-5 w-5 text-white" />
                      </div>
                      <h4 className="text-lg font-bold text-neutral-900">
                        Today&apos;s Adventure
                      </h4>
                    </div>
                    <div className="prose prose-neutral max-w-none">
                      {formatOverview(day.overview)}
                    </div>
                  </div>

                  {/* Main Destination */}
                  {day.mainDestination && (
                    <div className="mb-8">
                      <div className="info-badge rounded-xl p-5">
                        <div className="mb-3 flex items-center gap-2">
                          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-slate-600 to-slate-700 shadow-md">
                            <MapPin className="h-4 w-4 text-white" />
                          </div>
                          <span className="text-sm font-bold text-neutral-900">
                            Main Destination
                          </span>
                        </div>
                        <p className="text-base font-semibold text-slate-700">
                          {getPrimaryLocation(day.mainDestination?.name)}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Accommodation Section */}
                  <div className="mb-8">
                    <div className="mb-5 flex items-center gap-3 border-b border-neutral-100 pb-4">
                      <div className="section-icon flex h-10 w-10 items-center justify-center rounded-xl shadow-md">
                        <Moon className="h-5 w-5 text-white" />
                      </div>
                      <h4 className="text-lg font-bold text-neutral-900">
                        Overnight Stay
                      </h4>
                    </div>

                    {day.accommodation?.length > 0 ? (
                      <div className="space-y-5">
                        {day.accommodation.map((hotel, hotelIndex) => (
                          <div
                            key={hotelIndex}
                            className="hotel-card overflow-hidden rounded-xl bg-white"
                          >
                            <div className="border-b border-neutral-100 bg-gradient-to-r from-slate-50/50 to-transparent p-5">
                              <div className="flex items-start gap-3">
                                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-slate-600 to-slate-700 shadow-md">
                                  <Bed className="h-5 w-5 text-white" />
                                </div>
                                <div className="flex-1">
                                  <h5 className="mb-1 text-base font-bold text-neutral-900">
                                    {hotel.name}
                                  </h5>
                                  {hotel.category && (
                                    <div className="flex items-center gap-2">
                                      <Star className="h-3.5 w-3.5 text-amber-500" />
                                      <span className="text-xs font-medium text-slate-600">
                                        {hotel.category}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Hotel Images */}
                            {hotel.images?.length > 0 ? (
                              <div className="p-5">
                                <div className="mb-3 flex gap-3 overflow-x-auto pb-2">
                                  {hotel.images.map((image, imgIndex) => (
                                    <div
                                      key={imgIndex}
                                      className="relative flex-shrink-0 overflow-hidden rounded-lg shadow-md transition-transform hover:scale-105"
                                    >
                                      <img
                                        src={
                                          IMAGES_URL + image.split("/").pop()
                                        }
                                        alt={`${hotel.name} - Image ${imgIndex + 1}`}
                                        className="h-24 w-24 object-cover"
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
                                        className="flex h-24 w-24 items-center justify-center bg-slate-100"
                                      >
                                        <ImageIcon className="h-8 w-8 text-slate-400" />
                                      </div>
                                    </div>
                                  ))}
                                </div>
                                <div className="flex items-center gap-2 text-xs text-slate-500">
                                  <Sparkles className="h-3.5 w-3.5" />
                                  <span>This or a similar premium option</span>
                                </div>
                              </div>
                            ) : (
                              <div className="p-5">
                                <div className="flex items-center gap-3 rounded-lg bg-slate-50 p-4">
                                  <ImageIcon className="h-5 w-5 text-slate-400" />
                                  <span className="text-sm text-slate-600">
                                    No images available
                                  </span>
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="info-badge rounded-xl p-5">
                        <div className="flex items-start gap-4">
                          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-slate-400 to-slate-500 shadow-md">
                            <Home className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <p className="mb-2 text-sm font-bold text-neutral-900">
                              No accommodation provided
                            </p>
                            <p className="text-sm leading-relaxed text-slate-600">
                              If you prefer a more leisurely pace, you can opt
                              to spend the night in a nearby town of your
                              choice.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Meals Section */}
                  {day.meals?.length > 0 && (
                    <div>
                      <div className="mb-5 flex items-center gap-3 border-b border-neutral-100 pb-4">
                        <div className="section-icon flex h-10 w-10 items-center justify-center rounded-xl shadow-md">
                          <Utensils className="h-5 w-5 text-white" />
                        </div>
                        <h4 className="text-lg font-bold text-neutral-900">
                          Meals & Refreshments
                        </h4>
                      </div>
                      <div className="grid gap-3 sm:grid-cols-2">
                        {day.meals.map((meal, i) => (
                          <div
                            key={i}
                            className="meal-badge flex items-center gap-3 rounded-xl border border-neutral-200 bg-white p-4"
                          >
                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-slate-100 to-slate-200">
                              <Utensils className="h-4 w-4 text-slate-600" />
                            </div>
                            <span className="text-sm font-semibold capitalize text-neutral-900">
                              {meal}
                            </span>
                          </div>
                        ))}
                        <div className="meal-badge flex items-center gap-3 rounded-xl border border-neutral-200 bg-white p-4">
                          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-blue-100 to-blue-200">
                            <Coffee className="h-4 w-4 text-blue-600" />
                          </div>
                          <span className="text-sm font-semibold text-neutral-900">
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

      {/* Quick Stats Footer */}
      <div className="safari-itinerary mt-8 grid gap-4 sm:grid-cols-3">
        <div className="info-badge rounded-xl p-5 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-slate-600 to-slate-700 shadow-lg">
            <Calendar className="h-6 w-6 text-white" />
          </div>
          <div className="text-2xl font-bold text-neutral-900">
            {days.length}
          </div>
          <div className="text-xs font-medium uppercase tracking-wide text-slate-600">
            Total Days
          </div>
        </div>
        <div className="info-badge rounded-xl p-5 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-700 shadow-lg">
            <MapPin className="h-6 w-6 text-white" />
          </div>
          <div className="text-2xl font-bold text-neutral-900">
            {days.filter((d) => d.mainDestination).length}
          </div>
          <div className="text-xs font-medium uppercase tracking-wide text-slate-600">
            Destinations
          </div>
        </div>
        <div className="info-badge rounded-xl p-5 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-amber-600 to-orange-600 shadow-lg">
            <Clock className="h-6 w-6 text-white" />
          </div>
          <div className="text-2xl font-bold text-neutral-900">
            {days.filter((d) => d.accommodation?.length > 0).length}
          </div>
          <div className="text-xs font-medium uppercase tracking-wide text-slate-600">
            Overnight Stays
          </div>
        </div>
      </div>
    </div>
  );
};

export default DayByDayTab;
