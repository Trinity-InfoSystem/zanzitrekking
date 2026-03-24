"use client";

import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { get_blogPosts, get_blog_categories } from "../store/reducers/blogPostReducer";
import { Link } from "react-router-dom";
import Footer from "../components/Footer";
import Header from "../components/Header";
import {
  ArrowRight,
  BookOpen,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Filter,
  Search,
  Sparkles,
  TrendingUp,
  X,
} from "lucide-react";
import { FaRegComment } from "react-icons/fa6";
import { resolveMediaUrl } from "../utils/imageUtils";
import AOS from "aos";
import "aos/dist/aos.css";
import GoogleReviewsWidget from "../components/GoogleReviewsWidget";
import TripadvisorReviews from "../components/TripadvisorReviews";
import Loader from "../components/Loader";

import SEO from "../components/SEO";
const Blog = () => {
  const [perPage, setPerPage] = useState(6);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchValue, setSearchValue] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  const { categories } = useSelector((state) => state.home);
  const { blogPosts, totalblogPosts, loader, blogCategories } = useSelector(
    (state) => state.blog,
  );
  const dispatch = useDispatch();

  useEffect(() => {
    AOS.init({
      once: true,
      duration: 400,
      offset: 60,
      easing: "ease-out-cubic",
    });
  }, []);

  useEffect(() => {
    dispatch(
      get_blogPosts({
        perPage,
        currentPage,
        searchValue,
        sortBy,
        startDate,
        endDate,
        category: selectedCategory,
      }),
    );
  }, [dispatch, perPage, currentPage, searchValue, sortBy, startDate, endDate, selectedCategory]);

  // Fetch blog categories on component mount
  useEffect(() => {
    dispatch(get_blog_categories());
  }, [dispatch]);

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setStartDate("");
    setEndDate("");
    setSearchValue("");
    setSortBy("newest");
    setSelectedCategory("all");
    setCurrentPage(1);
  };

  const hasActiveFilters = startDate || endDate || searchValue || selectedCategory !== "all";


  return (
    <div className="min-h-screen bg-white">
      <SEO />
      <Header categories={categories} />

      {/* Enhanced Hero Section with Background Image */}
      <section className="relative overflow-hidden">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1523805009345-7448845a9e53?w=1920&h=600&fit=crop"
            alt="Blog Hero"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-primary-900/55 via-primary-800/50 to-primary-900/55" />

          {/* Decorative Elements */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute left-10 top-20 h-32 w-32 rounded-full bg-accent-400 blur-3xl" />
            <div className="absolute right-20 top-40 h-40 w-40 rounded-full bg-secondary-400 blur-3xl" />
            <div className="absolute bottom-20 left-1/3 h-36 w-36 rounded-full bg-primary-400 blur-3xl" />
          </div>
        </div>

        {/* Content */}
        <div className="relative z-10 px-4 py-20 md:px-12 lg:py-32">
          <div className="mx-auto max-w-4xl text-center">
            {/* Badge */}
            <div
              className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-5 py-2 backdrop-blur-sm"
              data-aos="fade-up"
            >
              <BookOpen className="h-4 w-4 text-accent-300" />
              <span className="text-sm font-semibold text-white">
                Travel Stories & Insights
              </span>
            </div>

            {/* Title */}
            <h1
              className="mb-4 text-5xl font-bold text-white lg:text-6xl"
              data-aos="fade-up"
              data-aos-delay="100"
            >
              Our Blog
            </h1>

            {/* Subtitle */}
            <p
              className="mb-8 text-lg leading-relaxed text-white/90 lg:text-xl"
              data-aos="fade-up"
              data-aos-delay="200"
            >
              Discover travel tips, safari guides, and inspiring stories from
              the heart of Tanzania
            </p>

            {/* Stats */}
            <div
              className="flex flex-wrap items-center justify-center gap-8"
              data-aos="fade-up"
              data-aos-delay="300"
            >
              <div className="flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10 backdrop-blur-sm">
                  <TrendingUp className="h-5 w-5 text-accent-300" />
                </div>
                <div className="text-left">
                  <div className="text-2xl font-bold text-white">
                    {totalblogPosts || 0}
                  </div>
                  <div className="text-xs text-white/70">Articles</div>
                </div>
              </div>

              <div className="h-8 w-px bg-white/20" />

              <div className="flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10 backdrop-blur-sm">
                  <Sparkles className="h-5 w-5 text-secondary-300" />
                </div>
                <div className="text-left">
                  <div className="text-2xl font-bold text-white">Weekly</div>
                  <div className="text-xs text-white/70">Updates</div>
                </div>
              </div>

              <div className="h-8 w-px bg-white/20" />

              <div className="flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10 backdrop-blur-sm">
                  <FaRegComment className="h-5 w-5 text-primary-300" />
                </div>
                <div className="text-left">
                  <div className="text-2xl font-bold text-white">Active</div>
                  <div className="text-xs text-white/70">Community</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg
            viewBox="0 0 1440 120"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full"
          >
            <path
              d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 80C1200 80 1320 70 1380 65L1440 60V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z"
              fill="white"
            />
          </svg>
        </div>
      </section>

      {/* Search and Filter Section */}
      <section className="bg-white py-12">
        <div className="px-4 md:px-12">
          <div className="mx-auto max-w-7xl">
            {/* Search Bar */}
            <form onSubmit={handleSearch} className="mb-6" data-aos="fade-up">
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                  <Search className="h-5 w-5 text-text-light" />
                </div>
                <input
                  type="text"
                  placeholder="Search articles, destinations, or topics..."
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  className="block w-full rounded-xl border border-neutral-200 bg-white py-4 pl-12 pr-32 text-text shadow-soft transition-all focus:border-primary-300 focus:outline-none focus:ring-2 focus:ring-primary-200"
                />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg bg-primary-600 px-6 py-2.5 text-sm font-semibold text-white shadow-soft transition-all hover:bg-primary-700 hover:shadow-soft-md"
                >
                  Search
                </button>
              </div>
            </form>

            {/* Filter Toggle */}
            <div className="flex flex-col gap-4" data-aos="fade-up">
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center gap-2 rounded-lg border border-neutral-200 bg-white px-4 py-2.5 text-sm font-medium text-text shadow-soft transition-all hover:border-primary-300 hover:bg-primary-50"
                >
                  <Filter className="h-4 w-4" />
                  {showFilters ? "Hide Filters" : "Show Filters"}
                </button>

                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="flex items-center gap-2 rounded-lg bg-secondary-50 px-4 py-2 text-sm font-medium text-secondary-700 transition-colors hover:bg-secondary-100"
                  >
                    <X className="h-4 w-4" />
                    Clear All
                  </button>
                )}
              </div>

              {/* Filters Panel */}
              {showFilters && (
                <div
                  className="rounded-xl border border-neutral-200 bg-gradient-to-br from-neutral-50 to-white p-6 shadow-soft"
                  data-aos="fade-down"
                >
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-primary-800">
                        Category
                      </label>
                      <select
                        value={selectedCategory}
                        onChange={(e) => {
                          setSelectedCategory(e.target.value);
                          setCurrentPage(1);
                        }}
                        className="block w-full rounded-lg border border-neutral-200 bg-white px-4 py-2.5 text-sm text-text shadow-soft transition-all focus:border-primary-300 focus:outline-none focus:ring-2 focus:ring-primary-200"
                      >
                        <option value="all">All Categories</option>
                        {blogCategories.map((category) => (
                          <option key={category} value={category}>
                            {category}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-semibold text-primary-800">
                        Sort By
                      </label>
                      <select
                        value={sortBy}
                        onChange={(e) => {
                          setSortBy(e.target.value);
                          setCurrentPage(1);
                        }}
                        className="block w-full rounded-lg border border-neutral-200 bg-white px-4 py-2.5 text-sm text-text shadow-soft transition-all focus:border-primary-300 focus:outline-none focus:ring-2 focus:ring-primary-200"
                      >
                        <option value="newest">Newest First</option>
                        <option value="oldest">Oldest First</option>
                        <option value="mostRated">Most Comments</option>
                      </select>
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-semibold text-primary-800">
                        Start Date
                      </label>
                      <input
                        type="date"
                        value={startDate}
                        onChange={(e) => {
                          setStartDate(e.target.value);
                          setCurrentPage(1);
                        }}
                        className="block w-full rounded-lg border border-neutral-200 bg-white px-4 py-2.5 text-sm text-text shadow-soft transition-all focus:border-primary-300 focus:outline-none focus:ring-2 focus:ring-primary-200"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-semibold text-primary-800">
                        End Date
                      </label>
                      <input
                        type="date"
                        value={endDate}
                        onChange={(e) => {
                          setEndDate(e.target.value);
                          setCurrentPage(1);
                        }}
                        className="block w-full rounded-lg border border-neutral-200 bg-white px-4 py-2.5 text-sm text-text shadow-soft transition-all focus:border-primary-300 focus:outline-none focus:ring-2 focus:ring-primary-200"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Blog Posts Section */}
      <section className="bg-white py-16">
        <div className="px-4 md:px-12">
          <div className="mx-auto max-w-7xl">
            {blogPosts.length > 0 ? (
              <>
                <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                  {blogPosts.map((post, index) => {
                    const imageName = post.mainImage
                      ? resolveMediaUrl(post.mainImage)
                      : "https://images.unsplash.com/photo-1523805009345-7448845a9e53?w=800&h=600";
                    return (
                      <BlogCard
                        key={post._id}
                        id={post._id}
                        date={post.creationDate}
                        image={imageName}
                        title={post.mainTitle}
                        paragraph={post.mainParagraph}
                        commentsCount={post.commentsCount}
                        category={post.category}
                        delay={index * 100}
                      />
                    );
                  })}
                </div>

                {/* Pagination */}
                <div className="mt-12 flex flex-col items-center gap-6 rounded-xl border border-neutral-200 bg-gradient-to-br from-neutral-50 to-white p-6 shadow-soft sm:flex-row sm:justify-between">
                  <div className="flex items-center gap-3">
                    <label className="text-sm font-medium text-text">
                      Posts per page:
                    </label>
                    <select
                      value={perPage}
                      onChange={(e) => {
                        setPerPage(Number(e.target.value));
                        setCurrentPage(1);
                      }}
                      className="rounded-lg border border-neutral-200 bg-white px-4 py-2 text-sm font-medium text-text shadow-soft transition-all focus:border-primary-300 focus:outline-none focus:ring-2 focus:ring-primary-200"
                    >
                      <option value={6}>6</option>
                      <option value={12}>12</option>
                      <option value={18}>18</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() =>
                        setCurrentPage(Math.max(1, currentPage - 1))
                      }
                      disabled={currentPage === 1}
                      className="flex h-10 w-10 items-center justify-center rounded-lg border border-neutral-200 bg-white text-text shadow-soft transition-all hover:border-primary-300 hover:bg-primary-50 disabled:opacity-40 disabled:hover:border-neutral-200 disabled:hover:bg-white"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>

                    <div className="flex items-center gap-2 rounded-lg bg-primary-50 px-4 py-2">
                      <span className="text-sm font-semibold text-primary-700">
                        {currentPage}
                      </span>
                      <span className="text-sm text-text-light">of</span>
                      <span className="text-sm font-semibold text-text">
                        {Math.ceil(totalblogPosts / perPage)}
                      </span>
                    </div>

                    <button
                      onClick={() => setCurrentPage(currentPage + 1)}
                      disabled={blogPosts.length < perPage}
                      className="flex h-10 w-10 items-center justify-center rounded-lg border border-neutral-200 bg-white text-text shadow-soft transition-all hover:border-primary-300 hover:bg-primary-50 disabled:opacity-40 disabled:hover:border-neutral-200 disabled:hover:bg-white"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </>
            ) : loader ? (
              <div className="flex items-center justify-center">
                <Loader color="#36d7b7" />
              </div>
            ) : (
              <div className="text-center" data-aos="fade-up">
                <div className="mx-auto max-w-md rounded-xl border border-neutral-200 bg-gradient-to-br from-neutral-50 to-white p-12 shadow-soft">
                  <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-xl bg-primary-50">
                    <BookOpen className="h-10 w-10 text-primary-600" />
                  </div>
                  <h3 className="mb-2 text-xl font-bold text-primary-800">
                    No blog posts found
                  </h3>
                  <p className="mb-6 text-sm text-text-light">
                    Try adjusting your search or filter criteria to find what
                    you&apos;re looking for.
                  </p>
                  {hasActiveFilters && (
                    <button
                      onClick={clearFilters}
                      className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-6 py-3 text-sm font-semibold text-white shadow-soft transition-all hover:bg-primary-700 hover:shadow-soft-md"
                    >
                      Clear All Filters
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      <TripadvisorReviews />
      <GoogleReviewsWidget />

      <Footer />
    </div>
  );
};

const BlogCard = ({
  id,
  date,
  image,
  title,
  paragraph,
  commentsCount,
  category,
  delay,
}) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <Link
      to={`/blog/${id}`}
      className="group block overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-soft transition-all hover:border-primary-200 hover:shadow-soft-md"
      data-aos="fade-up"
      data-aos-delay={delay}
    >
      {/* Image */}
      <div className="relative aspect-[16/10] overflow-hidden bg-neutral-100">
        <img
          src={image}
          alt={title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

        {/* Category Badge */}
        {category && (
          <div className="absolute left-3 top-3 rounded-lg bg-primary-600/95 px-3 py-1.5 text-xs font-semibold text-white shadow-soft backdrop-blur-sm">
            {category}
          </div>
        )}

        {/* Comments Badge */}
        {commentsCount > 0 && (
          <div className="absolute right-3 top-3 flex items-center gap-1.5 rounded-lg bg-white/95 px-3 py-1.5 text-xs font-semibold text-primary-800 shadow-soft backdrop-blur-sm">
            <FaRegComment className="h-3.5 w-3.5" />
            <span>{commentsCount}</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Date */}
        <div className="mb-3 flex items-center gap-2 text-xs font-medium text-text-light">
          <Calendar className="h-3.5 w-3.5" />
          <time>{formatDate(date)}</time>
        </div>

        {/* Title - Full title displayed */}
        <h3 className="mb-3 text-lg font-bold leading-tight text-primary-800 transition-colors group-hover:text-primary-600">
          {title}
        </h3>

        {/* Paragraph - Truncated */}
        <p className="mb-4 line-clamp-2 text-sm leading-relaxed text-text-light">
          {paragraph}
        </p>

        {/* Read More */}
        <div className="flex items-center gap-2 text-sm font-semibold text-primary-600 transition-all group-hover:gap-3">
          <span>Read Article</span>
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </div>
      </div>
    </Link>
  );
};

export default Blog;
