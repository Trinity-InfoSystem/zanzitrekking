"use client";

import {
  AlertCircle,
  Award,
  Bed,
  Briefcase,
  Camera,
  Car,
  CheckCircle,
  CheckCircle2,
  ChevronRight,
  Coffee,
  Crown,
  Info,
  MapPin,
  Phone,
  Plane,
  Shield,
  Sparkles,
  Star,
  TreePine,
  Users,
  Utensils,
  Wifi,
  XCircle,
} from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

const InclusionsTab = ({ inclusions = {}, exclusions = {}, trip = {} }) => {
  const normalizedInclusions = Array.isArray(inclusions)
    ? { standard: inclusions, midRange: [], luxury: [] }
    : inclusions;
  const normalizedExclusions = Array.isArray(exclusions)
    ? { standard: exclusions, midRange: [], luxury: [] }
    : exclusions;

  const [activeSection, setActiveSection] = useState("inclusions");
  const [selectedCategory, setSelectedCategory] = useState("standard");

  const categories = [
    {
      key: "standard",
      label: "Budget",
      icon: Shield,
      colorClasses: {
        bg: "bg-slate-50",
        bgStrong: "bg-slate-100",
        text: "text-slate-700",
        border: "border-slate-200",
        borderStrong: "border-slate-300",
        gradient: "from-slate-500 to-slate-600",
      },
    },
    {
      key: "midRange",
      label: "Mid-Range",
      icon: Star,
      colorClasses: {
        bg: "bg-emerald-50/40",
        bgStrong: "bg-emerald-100",
        text: "text-emerald-700",
        border: "border-emerald-200",
        borderStrong: "border-emerald-300",
        gradient: "from-emerald-600 to-emerald-700",
      },
    },
    {
      key: "luxury",
      label: "Luxury",
      icon: Crown,
      colorClasses: {
        bg: "bg-indigo-50/40",
        bgStrong: "bg-indigo-100",
        text: "text-indigo-700",
        border: "border-indigo-200",
        borderStrong: "border-indigo-300",
        gradient: "from-indigo-600 to-indigo-700",
      },
    },
  ];

  const getItemIcon = (item) => {
    const lowerItem = item.toLowerCase();

    if (
      lowerItem.includes("meal") ||
      lowerItem.includes("food") ||
      lowerItem.includes("breakfast") ||
      lowerItem.includes("lunch") ||
      lowerItem.includes("dinner")
    )
      {return Utensils;}
    if (
      lowerItem.includes("accommodation") ||
      lowerItem.includes("hotel") ||
      lowerItem.includes("lodge") ||
      lowerItem.includes("camp")
    )
      {return Bed;}
    if (
      lowerItem.includes("transport") ||
      lowerItem.includes("vehicle") ||
      lowerItem.includes("transfer") ||
      lowerItem.includes("drive")
    )
      {return Car;}
    if (
      lowerItem.includes("guide") ||
      lowerItem.includes("ranger") ||
      lowerItem.includes("expert")
    )
      {return Users;}
    if (
      lowerItem.includes("flight") ||
      lowerItem.includes("airfare") ||
      lowerItem.includes("ticket")
    )
      {return Plane;}
    if (
      lowerItem.includes("insurance") ||
      lowerItem.includes("visa") ||
      lowerItem.includes("document")
    )
      {return Briefcase;}
    if (
      lowerItem.includes("drink") ||
      lowerItem.includes("beverage") ||
      lowerItem.includes("water")
    )
      {return Coffee;}
    if (lowerItem.includes("wifi") || lowerItem.includes("internet"))
      {return Wifi;}
    if (lowerItem.includes("photo") || lowerItem.includes("camera"))
      {return Camera;}
    if (
      lowerItem.includes("park") ||
      lowerItem.includes("entry") ||
      lowerItem.includes("fee")
    )
      {return TreePine;}

    return MapPin;
  };

  const getAllUniqueItems = (items) => {
    const allItems = new Set();
    Object.values(items).forEach((categoryItems) => {
      if (Array.isArray(categoryItems)) {
        categoryItems.forEach((item) => allItems.add(item));
      }
    });
    return Array.from(allItems);
  };

  const uniqueInclusions = getAllUniqueItems(normalizedInclusions);
  const uniqueExclusions = getAllUniqueItems(normalizedExclusions);

  const hasItem = (items, category, item) => {
    const categoryItems = items[category] || [];
    return categoryItems.includes(item);
  };

  const getAccommodationType = (category) => {
    const categoryKey = category.key;
    const itinerary = trip?.itinerary || [];

    for (const day of itinerary) {
      if (day.accommodation && day.accommodation[categoryKey]) {
        return day.accommodation[categoryKey];
      }
    }

    return category.label;
  };

  if (uniqueInclusions.length === 0 && uniqueExclusions.length === 0) {
    return (
      <div className="flex min-h-[400px] items-center justify-center p-8">
        <div className="max-w-md text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-lg bg-slate-100">
            <Info className="h-7 w-7 text-slate-500" />
          </div>
          <h3 className="mb-2 text-lg font-semibold text-neutral-900">
            Package Details Loading
          </h3>
          <p className="text-sm text-neutral-600">
            Safari package information is being prepared.
          </p>
        </div>
      </div>
    );
  }

  const selectedCategoryData = categories.find(
    (c) => c.key === selectedCategory,
  );

  return (
    <div className="safari-inclusions space-y-6 p-6 lg:p-8">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        
        .safari-inclusions {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        }
        
        .comparison-table tbody tr {
          transition: all 0.2s ease;
        }
        
        .comparison-table tbody tr:hover {
          background: rgba(248, 250, 252, 0.6);
        }
        
        .category-selector-btn {
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .category-selector-btn:hover {
          transform: translateY(-1px);
        }
        
        .feature-card {
          transition: all 0.2s ease;
        }
        
        .feature-card:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.04);
        }
        
        .info-card {
          transition: all 0.2s ease;
        }
        
        .info-card:hover {
          transform: translateX(2px);
        }
        
        @keyframes checkmark {
          0% {
            transform: scale(0);
            opacity: 0;
          }
          50% {
            transform: scale(1.1);
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
        
        .animated-check {
          animation: checkmark 0.3s ease-out;
        }
      `}</style>

      {/* Header Section */}
      <div className="overflow-hidden rounded-xl border border-neutral-200/60 bg-white shadow-sm">
        <div className="bg-gradient-to-br from-slate-50/40 via-white to-neutral-50/20 p-6 lg:p-8">
          <div className="text-center">
            <div className="mb-3 flex items-center justify-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-slate-700 to-slate-800 shadow-sm">
                <CheckCircle2 className="h-6 w-6 text-white" />
              </div>
              <div className="text-left">
                <div className="mb-1 inline-flex items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium uppercase tracking-wider text-slate-700">
                  <Sparkles className="h-3 w-3" />
                  Package Details
                </div>
                <h2 className="text-2xl font-bold text-neutral-900 lg:text-3xl">
                  What&apos;s Included & Excluded
                </h2>
              </div>
            </div>

            <p className="mx-auto max-w-2xl text-sm leading-relaxed text-neutral-600 lg:text-base">
              Compare packages to find your perfect safari experience
            </p>
          </div>
        </div>
      </div>

      {/* Toggle Sections */}
      <div className="flex justify-center">
        <div className="inline-flex w-full max-w-md gap-2 rounded-lg border border-neutral-200 bg-white p-1.5 shadow-sm">
          <button
            onClick={() => setActiveSection("inclusions")}
            className={`flex flex-1 items-center justify-center gap-2 rounded-md px-4 py-2.5 text-sm font-semibold transition-all duration-200 ${
              activeSection === "inclusions"
                ? "bg-gradient-to-br from-slate-700 to-slate-800 text-white shadow-sm"
                : "text-neutral-600 hover:bg-slate-50 hover:text-neutral-900"
            }`}
          >
            <CheckCircle className="h-4 w-4" />
            <span>Included</span>
          </button>
          <button
            onClick={() => setActiveSection("exclusions")}
            className={`flex flex-1 items-center justify-center gap-2 rounded-md px-4 py-2.5 text-sm font-semibold transition-all duration-200 ${
              activeSection === "exclusions"
                ? "bg-gradient-to-br from-slate-700 to-slate-800 text-white shadow-sm"
                : "text-neutral-600 hover:bg-slate-50 hover:text-neutral-900"
            }`}
          >
            <XCircle className="h-4 w-4" />
            <span>Excluded</span>
          </button>
        </div>
      </div>

      {/* Mobile Category Selector */}
      <div className="lg:hidden">
        <div className="grid grid-cols-3 gap-3">
          {categories.map((category) => {
            const CategoryIcon = category.icon;
            return (
              <button
                key={category.key}
                onClick={() => setSelectedCategory(category.key)}
                className={`category-selector-btn flex flex-col items-center gap-2 rounded-lg border p-3.5 ${
                  selectedCategory === category.key
                    ? `${category.colorClasses.borderStrong} ${category.colorClasses.bgStrong} shadow-sm`
                    : `border-neutral-200 bg-white hover:${category.colorClasses.bg}`
                }`}
              >
                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-md bg-gradient-to-br ${category.colorClasses.gradient} shadow-sm`}
                >
                  <CategoryIcon className="h-4 w-4 text-white" />
                </div>
                <span
                  className={`text-xs font-semibold ${selectedCategory === category.key ? category.colorClasses.text : "text-neutral-700"}`}
                >
                  {category.label}
                </span>
              </button>
            );
          })}
        </div>

        {/* Mobile Legend */}
        {activeSection === "inclusions" ? (
          <div className="mt-4 flex items-center justify-center gap-6 rounded-lg border border-neutral-200 bg-gradient-to-r from-slate-50 to-white px-4 py-3 shadow-sm">
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
              </div>
              <span className="text-xs font-semibold text-neutral-700">
                Included
              </span>
            </div>
            <div className="h-4 w-px bg-neutral-300"></div>
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-100">
                <XCircle className="h-3.5 w-3.5 text-slate-500" />
              </div>
              <span className="text-xs font-semibold text-neutral-700">
                Not Included
              </span>
            </div>
          </div>
        ) : (
          <div className="mt-4 flex items-center justify-center rounded-lg border border-neutral-200 bg-gradient-to-r from-slate-50 to-white px-4 py-3 shadow-sm">
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-100">
                <XCircle className="h-3.5 w-3.5 text-slate-500" />
              </div>
              <span className="text-xs font-semibold text-neutral-700">
                Excluded
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Inclusions Section */}
      {activeSection === "inclusions" && uniqueInclusions.length > 0 && (
        <>
          {/* Desktop Legend */}
          <div className="hidden items-center justify-center gap-8 rounded-lg border border-neutral-200 bg-gradient-to-r from-slate-50 to-white px-6 py-3.5 shadow-sm lg:flex">
            <div className="flex items-center gap-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-100">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              </div>
              <span className="text-sm font-semibold text-neutral-700">
                Included
              </span>
            </div>
            <div className="h-5 w-px bg-neutral-300"></div>
            <div className="flex items-center gap-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100">
                <XCircle className="h-4 w-4 text-slate-500" />
              </div>
              <span className="text-sm font-semibold text-neutral-700">
                Not Included
              </span>
            </div>
          </div>

          {/* Desktop View */}
          <div className="hidden overflow-hidden rounded-xl border border-neutral-200/80 bg-white shadow-sm lg:block">
            <div className="overflow-x-auto">
              <table className="comparison-table w-full">
                {/* Table Header */}
                <thead>
                  <tr className="border-b border-neutral-100 bg-gradient-to-r from-slate-50 to-white">
                    <th className="px-6 py-4 text-left">
                      <div className="flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-slate-600" />
                        <span className="text-xs font-semibold uppercase tracking-wide text-slate-700">
                          Feature
                        </span>
                      </div>
                    </th>
                    {categories.map((category) => {
                      const CategoryIcon = category.icon;
                      return (
                        <th
                          key={category.key}
                          className="px-6 py-4 text-center"
                        >
                          <div className="flex flex-col items-center justify-center">
                            <div
                              className={`mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br ${category.colorClasses.gradient} shadow-sm`}
                            >
                              <CategoryIcon className="h-4 w-4 text-white" />
                            </div>
                            <span className="text-sm font-semibold text-neutral-900">
                              {category.label}
                            </span>
                          </div>
                        </th>
                      );
                    })}
                  </tr>
                </thead>

                {/* Table Body */}
                <tbody className="divide-y divide-neutral-100">
                  {uniqueInclusions.map((item, index) => {
                    const ItemIcon = getItemIcon(item);

                    return (
                      <tr key={index}>
                        <td className="px-6 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md bg-slate-100">
                              <ItemIcon className="h-4 w-4 text-slate-600" />
                            </div>
                            <span className="text-sm font-medium text-neutral-900">
                              {item}
                            </span>
                          </div>
                        </td>

                        {categories.map((category) => {
                          const included = hasItem(
                            normalizedInclusions,
                            category.key,
                            item,
                          );

                          return (
                            <td
                              key={category.key}
                              className="px-6 py-3.5 text-center"
                            >
                              {included ? (
                                <div className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-emerald-100">
                                  <CheckCircle2 className="animated-check h-4 w-4 text-emerald-600" />
                                </div>
                              ) : (
                                <div className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-slate-100">
                                  <XCircle className="h-4 w-4 text-slate-400" />
                                </div>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}

                  {/* Accommodation Row */}
                  <tr className="border-t-2 border-neutral-200 bg-gradient-to-r from-slate-50/30 to-transparent">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md bg-gradient-to-br from-slate-600 to-slate-700 shadow-sm">
                          <Bed className="h-4 w-4 text-white" />
                        </div>
                        <span className="text-sm font-semibold text-neutral-900">
                          Accommodation Type
                          <span className="ml-2 text-xs font-normal text-slate-600">
                            (see examples in day-by-day plan)
                          </span>
                        </span>
                      </div>
                    </td>

                    {categories.map((category) => {
                      const accommodationType = getAccommodationType(category);

                      return (
                        <td
                          key={category.key}
                          className="px-6 py-4 text-center"
                        >
                          <div
                            className={`inline-block rounded-lg border ${category.colorClasses.borderStrong} ${category.colorClasses.bgStrong} px-3.5 py-2 shadow-sm`}
                          >
                            <span
                              className={`text-sm font-semibold ${category.colorClasses.text}`}
                            >
                              {accommodationType} Private
                            </span>
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile View - Card Based */}
          <div className="space-y-3 lg:hidden">
            {uniqueInclusions.map((item, index) => {
              const ItemIcon = getItemIcon(item);
              const included = hasItem(
                normalizedInclusions,
                selectedCategory,
                item,
              );

              return (
                <div
                  key={index}
                  className={`feature-card flex items-center justify-between rounded-lg border p-3.5 shadow-sm ${
                    included
                      ? `${selectedCategoryData.colorClasses.borderStrong} ${selectedCategoryData.colorClasses.bgStrong}`
                      : "border-neutral-200 bg-white"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-md ${
                        included
                          ? `bg-gradient-to-br ${selectedCategoryData.colorClasses.gradient} shadow-sm`
                          : "bg-slate-100"
                      }`}
                    >
                      <ItemIcon
                        className={`h-4 w-4 ${included ? "text-white" : "text-slate-600"}`}
                      />
                    </div>
                    <span
                      className={`text-sm font-semibold ${included ? "text-neutral-900" : "text-neutral-500"}`}
                    >
                      {item}
                    </span>
                  </div>

                  <div className="flex-shrink-0">
                    {included ? (
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-100">
                        <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                      </div>
                    ) : (
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100">
                        <XCircle className="h-4 w-4 text-slate-400" />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Mobile Accommodation Card */}
            <div
              className={`feature-card rounded-lg border p-4 shadow-sm ${selectedCategoryData.colorClasses.borderStrong} ${selectedCategoryData.colorClasses.bgStrong}`}
            >
              <div className="mb-3 flex items-center gap-3">
                <div
                  className={"flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-md bg-gradient-to-br from-slate-600 to-slate-700 shadow-sm"}
                >
                  <Bed className="h-4 w-4 text-white" />
                </div>
                <span className="text-sm font-semibold text-neutral-900">
                  Accommodation Type
                </span>
              </div>
              <div className="rounded-lg border border-white bg-white px-3.5 py-2.5 text-center shadow-sm">
                <span
                  className={`text-base font-semibold ${selectedCategoryData.colorClasses.text}`}
                >
                  {getAccommodationType(selectedCategoryData)} Private
                </span>
              </div>
              <p className="mt-3 text-xs font-medium text-slate-600">
                See examples in the day-by-day detailed plan
              </p>
            </div>
          </div>
        </>
      )}

      {/* Exclusions Section */}
      {activeSection === "exclusions" && uniqueExclusions.length > 0 && (
        <>
          {/* Desktop Legend */}
          <div className="hidden items-center justify-center rounded-lg border border-neutral-200 bg-gradient-to-r from-slate-50 to-white px-6 py-3.5 shadow-sm lg:flex">
            <div className="flex items-center gap-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100">
                <XCircle className="h-4 w-4 text-slate-500" />
              </div>
              <span className="text-sm font-semibold text-neutral-700">
                Excluded
              </span>
            </div>
          </div>

          {/* Desktop View */}
          <div className="hidden overflow-hidden rounded-xl border border-neutral-200/80 bg-white shadow-sm lg:block">
            <div className="overflow-x-auto">
              <table className="comparison-table w-full">
                {/* Table Header */}
                <thead>
                  <tr className="border-b border-neutral-100 bg-gradient-to-r from-slate-50 to-white">
                    <th className="px-6 py-4 text-left">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 text-slate-600" />
                        <span className="text-xs font-semibold uppercase tracking-wide text-slate-700">
                          Additional Expense
                        </span>
                      </div>
                    </th>
                    {categories.map((category) => {
                      const CategoryIcon = category.icon;
                      return (
                        <th
                          key={category.key}
                          className="px-6 py-4 text-center"
                        >
                          <div className="flex flex-col items-center justify-center">
                            <div
                              className={`mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br ${category.colorClasses.gradient} shadow-sm`}
                            >
                              <CategoryIcon className="h-4 w-4 text-white" />
                            </div>
                            <span className="text-sm font-semibold text-neutral-900">
                              {category.label}
                            </span>
                          </div>
                        </th>
                      );
                    })}
                  </tr>
                </thead>

                {/* Table Body */}
                <tbody className="divide-y divide-neutral-100">
                  {uniqueExclusions.map((item, index) => {
                    const ItemIcon = getItemIcon(item);

                    return (
                      <tr key={index}>
                        <td className="px-6 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md bg-slate-100">
                              <ItemIcon className="h-4 w-4 text-slate-600" />
                            </div>
                            <span className="text-sm font-medium text-neutral-900">
                              {item}
                            </span>
                          </div>
                        </td>

                        {categories.map((category) => {
                          const excluded = hasItem(
                            normalizedExclusions,
                            category.key,
                            item,
                          );

                          return (
                            <td
                              key={category.key}
                              className="px-6 py-3.5 text-center"
                            >
                              {excluded ? (
                                <div className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-slate-100">
                                  <XCircle className="h-4 w-4 text-slate-500" />
                                </div>
                              ) : (
                                <span className="text-lg text-neutral-300">
                                  —
                                </span>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile View - Card Based */}
          <div className="space-y-3 lg:hidden">
            {uniqueExclusions.map((item, index) => {
              const ItemIcon = getItemIcon(item);
              const excluded = hasItem(
                normalizedExclusions,
                selectedCategory,
                item,
              );

              return (
                <div
                  key={index}
                  className={`feature-card flex items-center justify-between rounded-lg border p-3.5 shadow-sm ${
                    excluded
                      ? "border-slate-300 bg-slate-100"
                      : "border-neutral-200 bg-white"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-md ${
                        excluded
                          ? "bg-gradient-to-br from-slate-500 to-slate-600 shadow-sm"
                          : "bg-slate-100"
                      }`}
                    >
                      <ItemIcon
                        className={`h-4 w-4 ${excluded ? "text-white" : "text-slate-600"}`}
                      />
                    </div>
                    <span
                      className={`text-sm font-semibold ${excluded ? "text-neutral-900" : "text-neutral-500"}`}
                    >
                      {item}
                    </span>
                  </div>

                  <div className="flex-shrink-0">
                    {excluded ? (
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-200">
                        <XCircle className="h-4 w-4 text-slate-600" />
                      </div>
                    ) : (
                      <span className="text-lg text-neutral-300">—</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Footer Section */}
      <div className="space-y-4">
        {/* Info Card */}
        <div className="overflow-hidden rounded-xl border border-neutral-200/60 bg-white shadow-sm">
          <div className="bg-gradient-to-r from-slate-50/30 to-transparent p-5">
            <div className="flex items-start gap-3.5">
              <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-slate-600 to-slate-700 shadow-sm">
                <Info className="h-5 w-5 text-white" />
              </div>
              <div>
                <h4 className="mb-1.5 text-sm font-semibold text-neutral-900">
                  Important Information
                </h4>
                <p className="text-sm leading-relaxed text-neutral-600">
                  Package details vary by season. Our experts confirm all
                  inclusions during booking.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Cards */}
        <div className="grid gap-3 sm:grid-cols-3">
          {[
            {
              icon: Phone,
              title: "Questions?",
              link: "/contact-us",
              colorClasses: { gradient: "from-slate-600 to-slate-700" },
            },
            {
              icon: Shield,
              title: "Best Price",
              link: null,
              colorClasses: { gradient: "from-emerald-600 to-emerald-700" },
            },
            {
              icon: Award,
              title: "5-Star Service",
              link: null,
              colorClasses: { gradient: "from-indigo-600 to-indigo-700" },
            },
          ].map((item, idx) => {
            const content = (
              <>
                <div
                  className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${item.colorClasses.gradient} shadow-sm`}
                >
                  <item.icon className="h-4 w-4 text-white" />
                </div>
                <div className="flex flex-1 items-center justify-between">
                  <span className="text-sm font-semibold text-neutral-900">
                    {item.title}
                  </span>
                  {item.link && (
                    <ChevronRight className="h-4 w-4 text-neutral-400" />
                  )}
                </div>
              </>
            );

            return item.link ? (
              <Link
                key={idx}
                to={item.link}
                className="info-card flex items-center gap-3 rounded-lg border border-neutral-200 bg-white p-3.5 shadow-sm"
              >
                {content}
              </Link>
            ) : (
              <div
                key={idx}
                className="flex items-center gap-3 rounded-lg border border-neutral-200 bg-white p-3.5 shadow-sm"
              >
                {content}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default InclusionsTab;
