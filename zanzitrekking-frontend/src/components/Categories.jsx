import React, { useState } from "react";
import { useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Award,
  Camera,
  Clock,
  Compass,
  MapPin,
  Mountain,
  Star,
  Tent,
  TreePine,
  Users,
  Waves,
} from "lucide-react";
import { IMAGES_URL } from "../utils/constants";

const Categories = () => {
  const { categories, totalTrips } = useSelector((state) => state.home);
  const [hoveredCategory, setHoveredCategory] = useState(null);
  const navigate = useNavigate();
  // Near the top of the component (after the useState hooks)
  const categoryOrder = ["safari", "trekking", "zanzibar", "cultural"];
  // Default category icons for fallback
  const getCategoryIcon = (name) => {
    const nameLower = name?.toLowerCase() || "";
    if (nameLower.includes("safari") || nameLower.includes("wildlife"))
      {return Tent;}
    if (
      nameLower.includes("trek") ||
      nameLower.includes("mountain") ||
      nameLower.includes("kilimanjaro")
    )
      {return Mountain;}
    if (nameLower.includes("beach") || nameLower.includes("zanzibar"))
      {return Waves;}
    if (nameLower.includes("culture") || nameLower.includes("cultural"))
      {return Users;}
    if (nameLower.includes("adventure")) {return Compass;}
    if (nameLower.includes("photography")) {return Camera;}
    return TreePine;
  };
  // Sort categories based on priority order
  const sortedCategories = [...(categories || [])].sort((a, b) => {
    const getOrderIndex = (name) => {
      const nameLower = name?.toLowerCase() || "";
      if (nameLower.includes("safari")) {return 0;}
      if (nameLower.includes("trek")) {return 1;}
      if (nameLower.includes("zanzibar")) {return 2;}
      if (nameLower.includes("cultural") || nameLower.includes("culture"))
        {return 3;}
      return 4;
    };
    return getOrderIndex(a.name) - getOrderIndex(b.name);
  });
  // Get total trips count - use totalTrips from backend if available
  const getTotalTripsCount = () => {
    if (totalTrips && totalTrips > 0) {
      return totalTrips;
    }
    if (!categories || !Array.isArray(categories)) {return 0;}
    return categories.reduce(
      (total, category) => total + (category.trips_count || 0),
      0,
    );
  };

  const getCategoryPath = (category) => {
    const categoryId = category?._id || category?.id;
    if (categoryId) {
      return `/trips?category=${categoryId}`;
    }
    return `/trips?category=${encodeURIComponent(category?.name || "")}`;
  };

  const handleCategoryClick = (category) => {
    const path = getCategoryPath(category);
    if (window.location.pathname === "/trips") {
      window.location.href = path;
    } else {
      navigate(path);
    }
  };

  if (!categories || categories.length === 0) {
    return null;
  }

  return (
    <section className="relative bg-white py-1 lg:py-1">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        {/* TripAdvisor Section */}
        <div className="mb-0 flex flex-col items-center justify-center gap-4">
          <div className="flex items-center justify-center">
            <img
              src="/images/tripadvisor.jpeg"
              alt="TripAdvisor Excellence Award"
              className="h-44 w-auto md:h-52"
            />
          </div>
        </div>

        {/* Section Header */}
        <div className="mb-12 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-lg border border-primary-200 bg-primary-50 px-4 py-2">
            <Compass className="h-4 w-4 text-primary-600" />
            <span className="text-sm font-semibold text-primary-700">
              Explore Our Destinations
            </span>
          </div>

          <h2 className="mb-3 text-3xl font-bold text-primary-800 lg:text-4xl">
            Discover Tanzania&apos;s Most Breathtaking Destinations
          </h2>
          <div className="mx-auto mb-4 h-1 w-20 rounded-full bg-gradient-to-r from-secondary-500 to-accent-500" />
          <p className="mx-auto max-w-2xl text-base text-text-light">
            Discover our carefully curated collection of extraordinary
            experiences across Tanzania&apos;s most spectacular destinations
          </p>

          {/* Stats Bar */}
          <div className="mt-6 flex items-center justify-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary-600" />
              <span className="font-medium text-text">
                {categories.length} Destinations
              </span>
            </div>
            <div className="h-4 w-px bg-neutral-300" />
            <div className="flex items-center gap-2">
              <Award className="h-4 w-4 text-secondary-600" />
              <span className="font-medium text-text">
                {getTotalTripsCount()} Adventures
              </span>
            </div>
            <div className="h-4 w-px bg-neutral-300" />
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4 fill-accent-500 text-accent-500" />
              <span className="font-medium text-text">Expert Guides</span>
            </div>
          </div>
        </div>

        {/* Categories Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {sortedCategories.map((category, index) => {
            const IconComponent = getCategoryIcon(category.name);
            const isHovered = hoveredCategory === index;

            return (
              <div
                key={category._id || index}
                className="group"
                onMouseEnter={() => setHoveredCategory(index)}
                onMouseLeave={() => setHoveredCategory(null)}
              >
                <button
                  onClick={() => handleCategoryClick(category)}
                  className="block w-full overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-soft transition-all duration-200 hover:border-primary-300 hover:shadow-soft-md"
                >
                  {/* Image Container */}
                  <div className="relative h-56 overflow-hidden">
                    {category.image ? (
                      <img
                        src={IMAGES_URL + category.image.split("/").pop()}
                        alt={category.name}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        loading="lazy"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-primary-50">
                        <IconComponent className="h-16 w-16 text-primary-600" />
                      </div>
                    )}

                    {/* Simple Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-primary-900/70 via-transparent to-transparent" />

                    {/* Icon Badge */}
                    <div className="absolute right-3 top-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/90 backdrop-blur-sm">
                        <IconComponent className="h-5 w-5 text-primary-600" />
                      </div>
                    </div>

                    {/* Trip Count Badge */}
                    <div className="absolute left-3 top-3">
                      <div className="flex items-center gap-1 rounded-lg bg-accent-500 px-2.5 py-1 text-xs font-medium text-white">
                        <MapPin className="h-3 w-3" />
                        <span>{category.trips_count || 0} Tours</span>
                      </div>
                    </div>

                    {/* Category Name Overlay */}
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <h3 className="mb-1 text-xl font-bold text-white">
                        {category.name}
                      </h3>
                      {category.description && (
                        <p className="line-clamp-2 text-sm text-white/90">
                          {category.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Content Section */}
                  <div className="p-5">
                    <div className="mb-4 flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Star className="h-4 w-4 fill-accent-500 text-accent-500" />
                        <span className="text-sm font-medium text-primary-700">
                          Premium Quality
                        </span>
                      </div>

                      <div
                        className={`flex items-center gap-1.5 transition-transform duration-200 ${
                          isHovered ? "translate-x-1" : ""
                        }`}
                      >
                        <span className="text-sm font-semibold text-primary-600">
                          Explore
                        </span>
                        <ArrowRight className="h-4 w-4 text-primary-600" />
                      </div>
                    </div>

                    {/* Features List */}
                    <div className="grid grid-cols-2 gap-2.5 text-xs">
                      <div className="flex items-center gap-1.5 text-text-light">
                        <Clock className="h-3.5 w-3.5 text-primary-500" />
                        <span>Flexible Duration</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-text-light">
                        <Users className="h-3.5 w-3.5 text-primary-500" />
                        <span>Expert Guides</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-text-light">
                        <Award className="h-3.5 w-3.5 text-primary-500" />
                        <span>Award Winning</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-text-light">
                        <Star className="h-3.5 w-3.5 text-primary-500" />
                        <span>Premium Service</span>
                      </div>
                    </div>
                  </div>
                </button>
              </div>
            );
          })}
        </div>

        {/* Call to Action */}
        <div className="mt-12 text-center">
          <div className="inline-flex flex-col items-center gap-4 rounded-xl border border-neutral-200 bg-background-subtle p-8 shadow-soft">
            <div className="flex items-center gap-2">
              <Compass className="h-5 w-5 text-secondary-600" />
              <h3 className="text-lg font-bold text-primary-700">
                Can&apos;t Find What You&apos;re Looking For?
              </h3>
            </div>
            <p className="max-w-md text-sm text-text-light">
              Our expert team can create custom adventures tailored to your
              preferences and interests.
            </p>
            <Link
              to="/contact-us"
              className="group flex items-center gap-2 rounded-lg bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white shadow-soft transition-all duration-200 hover:bg-primary-700 hover:shadow-soft-md"
            >
              <Users className="h-4 w-4" />
              <span>Plan Custom Adventure</span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>
      </div>
      {/* Section divider */}
      <div className="absolute bottom-0 left-0 h-px w-full bg-gradient-to-r from-transparent via-primary-200 to-transparent" />
    </section>
  );
};

export default Categories;
