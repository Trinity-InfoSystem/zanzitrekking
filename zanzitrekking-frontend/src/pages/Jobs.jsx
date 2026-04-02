"use client";

import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { get_jobs } from "../store/reducers/jobReducer";
import { Link } from "react-router-dom";
import Footer from "../components/Footer";
import Header from "../components/Header";
import {
  ArrowRight,
  Briefcase,
  Building2,
  CheckCircle2,
  Clock,
  Filter,
  MapPin,
  Search,
  TrendingUp,
  Users,
  X,
} from "lucide-react";
import { get_user_applications } from "../store/reducers/jobApplicationReducer";
import AOS from "aos";
import "aos/dist/aos.css";
import { sanitizeToText } from "../utils/sanitize";
import SEO from "../components/SEO";

const Jobs = () => {
  const [perPage] = useState(12);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchValue, setSearchValue] = useState("");
  const [sortBy, setSortBy] = useState("newest-desc");
  const { categories } = useSelector((state) => state.home);
  const { jobs, totalJobs, loader } = useSelector((state) => state.job);
  const { userInfo } = useSelector((state) => state.auth);
  const { applications } = useSelector((state) => state.jobApplication);
  const dispatch = useDispatch();

  useEffect(() => {
    if (userInfo) {
      dispatch(
        get_user_applications({
          page: currentPage,
          parPage: 100,
          customerId: userInfo._id || userInfo._id,
        }),
      );
    }
  }, [dispatch, userInfo, currentPage]);

  const extractTextFromHTML = (html) => {
    if (!html) {
      return "";
    }
    // Use sanitizeToText to safely extract text without XSS risk
    let text = sanitizeToText(html);
    text = text
      .replace(/\s+/g, " ")
      .replace(/\n\s*\n/g, "\n")
      .trim();
    text = text
      .replace(/\{[^}]*\}/g, "")
      .replace(/[{}]/g, "")
      .replace(/\s+/g, " ")
      .trim();
    return text;
  };

  const getJobDescriptionPreview = (job) => {
    let text = "";
    if (job.contentType === "html" && job.htmlContent) {
      text = extractTextFromHTML(job.htmlContent);
    } else if (job.description) {
      text = job.description;
    }
    if (text.length > 150) {
      return `${text.substring(0, 150).trim()  }...`;
    }
    return text;
  };

  const formatEmploymentType = (type) => {
    if (!type) {return "";}
    return type
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join("-");
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
    dispatch(
      get_jobs({
        parPage: perPage,
        currentPage,
        searchValue,
        sort: sortBy,
      }),
    );
  }, [dispatch, perPage, currentPage, searchValue, sortBy]);

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
  };

  const totalPages = Math.ceil(totalJobs / perPage);

  const stats = [
    { icon: Briefcase, label: "Open Positions", value: totalJobs || 0 },
    { icon: Users, label: "Team Members", value: "50+" },
    { icon: Building2, label: "Locations", value: "5+" },
    { icon: TrendingUp, label: "Growth Rate", value: "200%" },
  ];

  return (
    <div className="min-h-screen bg-white">
      <SEO/>
      <Header categories={categories} />

      {/* Enhanced Hero Section */}
      <section className="relative overflow-hidden border-b border-neutral-200 bg-gradient-to-br from-white via-neutral-50/50 to-white py-16 lg:py-24">
        {/* Background elements */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-0 top-1/4 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-primary-100/40 blur-3xl" />
          <div className="absolute right-0 top-2/3 h-[500px] w-[500px] translate-x-1/2 rounded-full bg-emerald-100/40 blur-3xl" />
        </div>

        <div className="relative z-10 px-4 md:px-12">
          <div className="mx-auto max-w-7xl">
            <div className="flex flex-col items-center gap-12 lg:flex-row lg:justify-between lg:gap-16">
              {/* Left: Title & Description */}
              <div className="max-w-2xl text-center lg:text-left">
                <div
                  data-aos="fade-up"
                  className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary-200 bg-white px-5 py-2.5 shadow-sm"
                >
                  <Briefcase className="h-4 w-4 text-primary-600" />
                  <span className="text-sm font-semibold text-primary-700">
                    Careers at Zanzi
                  </span>
                </div>
                <h1
                  data-aos="fade-up"
                  data-aos-delay="100"
                  className="mb-6 text-4xl font-bold tracking-tight text-primary-900 lg:text-5xl xl:text-6xl"
                >
                  Build Your Career
                  <br />
                  <span className="bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">
                    With Purpose
                  </span>
                </h1>
                <div className="mx-auto mb-6 h-1 w-24 rounded-full bg-gradient-to-r from-primary-500 via-primary-600 to-primary-700 lg:mx-0" />
                <p
                  data-aos="fade-up"
                  data-aos-delay="200"
                  className="text-lg leading-relaxed text-neutral-600 lg:text-xl"
                >
                  Join our team and help create unforgettable travel experiences
                  for adventurers around the world.
                </p>
              </div>

              {/* Right: Enhanced Stats */}
              <div
                data-aos="fade-up"
                data-aos-delay="300"
                className="grid w-full grid-cols-2 gap-4 lg:w-auto lg:grid-cols-2 lg:gap-6"
              >
                {stats.map((stat, index) => (
                  <div
                    key={index}
                    className="group relative overflow-hidden rounded-2xl border border-neutral-200 bg-white p-6 text-center shadow-lg ring-1 ring-neutral-900/5 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                  >
                    <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-gradient-to-br from-primary-100 to-emerald-100 opacity-0 blur-xl transition-opacity duration-300 group-hover:opacity-100" />
                    <div className="relative mb-4 inline-flex rounded-xl bg-gradient-to-br from-primary-100 to-primary-50 p-3">
                      <stat.icon className="h-6 w-6 text-primary-600 transition-transform duration-300 group-hover:scale-110" />
                    </div>
                    <div className="relative text-3xl font-bold text-primary-900">
                      {stat.value}
                    </div>
                    <div className="relative text-xs font-semibold text-neutral-600">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Jobs Section */}
      <section className="bg-neutral-50 py-12 lg:py-16">
        <div className="px-4 md:px-12">
          <div className="mx-auto max-w-7xl">
            {/* Enhanced Search & Filter */}
            <div className="mb-10" data-aos="fade-up">
              <div className="overflow-hidden rounded-3xl border border-neutral-200 bg-white p-6 shadow-xl ring-1 ring-neutral-900/5 lg:p-8">
                <div className="mb-6 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-600 to-primary-700 shadow-lg">
                      <Filter className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-primary-900 lg:text-2xl">
                        Find Your Role
                      </h2>
                      <p className="text-sm font-medium text-neutral-600 lg:text-base">
                        {totalJobs} open position{totalJobs !== 1 ? "s" : ""} available
                      </p>
                    </div>
                  </div>
                </div>

                <form onSubmit={handleSearch} className="space-y-3">
                  <div className="flex flex-col gap-3 lg:flex-row">
                    <div className="relative flex-1">
                      <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-primary-600" />
                      <input
                        type="text"
                        value={searchValue}
                        onChange={(e) => setSearchValue(e.target.value)}
                        placeholder="Search by job title, location, or keywords..."
                        className="w-full rounded-xl border-2 border-neutral-200 bg-white py-3 pl-12 pr-4 text-sm font-medium text-neutral-900 transition-all placeholder:text-neutral-400 focus:border-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-600/20"
                      />
                      {searchValue && (
                        <button
                          type="button"
                          onClick={() => setSearchValue("")}
                          className="absolute right-4 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-neutral-400 transition-all hover:bg-neutral-100 hover:text-neutral-900"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </div>

                    <div className="relative lg:w-64">
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="w-full cursor-pointer appearance-none rounded-xl border-2 border-neutral-200 bg-white px-4 py-3 text-sm font-medium text-neutral-900 transition-all focus:border-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-600/20"
                      >
                        <option value="newest-desc">Newest First</option>
                        <option value="newest-asc">Oldest First</option>
                        <option value="title-asc">Title A-Z</option>
                        <option value="title-desc">Title Z-A</option>
                      </select>
                      <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2">
                        <svg
                          className="h-5 w-5 text-primary-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      </div>
                    </div>
                  </div>
                </form>
              </div>
            </div>

            {/* Loading State */}
            {loader ? (
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
                {[...Array(perPage)].map((_, index) => (
                  <div
                    key={index}
                    className="animate-pulse rounded-xl border border-neutral-200 bg-white p-5 shadow-sm"
                  >
                    <div className="mb-3 h-6 w-3/4 rounded bg-neutral-200"></div>
                    <div className="mb-3 flex gap-2">
                      <div className="h-7 w-20 rounded bg-neutral-200"></div>
                      <div className="h-7 w-16 rounded bg-neutral-200"></div>
                    </div>
                    <div className="mb-3 space-y-2">
                      <div className="h-4 w-full rounded bg-neutral-200"></div>
                      <div className="h-4 w-full rounded bg-neutral-200"></div>
                      <div className="h-4 w-3/4 rounded bg-neutral-200"></div>
                    </div>
                    <div className="h-9 w-28 rounded-lg bg-neutral-200"></div>
                  </div>
                ))}
              </div>
            ) : jobs.length > 0 ? (
              /* Jobs Grid */
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
                {jobs.map((job, index) => {
                  const hasApplied = applications.some(
                    (application) => application?.jobId?._id === job._id,
                  );

                  return (
                    <div
                      key={job._id}
                      data-aos="fade-up"
                      data-aos-delay={index * 50}
                      className="group relative overflow-hidden rounded-3xl border border-neutral-200 bg-white p-6 shadow-lg ring-1 ring-neutral-900/5 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl"
                    >
                      {/* Background gradient on hover */}
                      <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-gradient-to-br from-primary-100 to-emerald-100 opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100" />
                      <div className="absolute -left-12 -bottom-12 h-32 w-32 rounded-full bg-gradient-to-br from-emerald-100 to-primary-100 opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100" />

                      {hasApplied && (
                        <div className="absolute right-4 top-4 z-10 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 px-3 py-1.5 text-xs font-bold text-white shadow-lg">
                          ✓ Applied
                        </div>
                      )}

                      <div className="relative">
                        <div className="mb-5">
                          <h3 className="mb-3 text-xl font-bold text-primary-900 transition-colors group-hover:text-primary-700 lg:text-2xl">
                            {job.title}
                          </h3>

                          <div className="flex flex-wrap items-center gap-2">
                            {job.location && (
                              <div className="flex items-center gap-1.5 rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1.5 text-xs font-semibold text-neutral-700">
                                <MapPin className="h-3.5 w-3.5 text-primary-600" />
                                <span>{job.location}</span>
                              </div>
                            )}
                            <span className="rounded-full border border-primary-200 bg-gradient-to-r from-primary-50 to-primary-100 px-3 py-1.5 text-xs font-bold text-primary-700">
                              {formatEmploymentType(job.employmentType)}
                            </span>
                          </div>
                        </div>

                        <p className="mb-5 line-clamp-3 text-sm leading-relaxed text-neutral-600">
                          {getJobDescriptionPreview(job)}
                        </p>

                        {job.salaryRange && (
                          <div className="group/salary mb-5 flex items-center gap-3 rounded-xl border border-emerald-200 bg-gradient-to-r from-emerald-50 to-transparent px-4 py-3 transition-all duration-300 hover:border-emerald-300 hover:shadow-md">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-md transition-transform duration-300 group-hover/salary:scale-110 group-hover/salary:rotate-3">
                              <span className="text-xs font-bold text-white">$</span>
                            </div>
                            <p className="text-sm font-bold text-neutral-900">
                              {job.salaryRange.startsWith("$")
                                ? job.salaryRange
                                : `$${job.salaryRange}`}
                            </p>
                          </div>
                        )}

                        {job.applicationDeadline && (
                          <div className="mb-5 flex items-center gap-2 rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2 text-xs text-neutral-600">
                            <Clock className="h-4 w-4 text-primary-600" />
                            <span>
                              Deadline:{" "}
                              <span className="font-bold text-neutral-900">
                                {new Date(
                                  job.applicationDeadline,
                                ).toLocaleDateString("en-US", {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                })}
                              </span>
                            </span>
                          </div>
                        )}

                        <Link
                          to={`/careers/${job._id}`}
                          className={`group/btn inline-flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3.5 text-sm font-bold text-white shadow-lg transition-all hover:scale-105 hover:shadow-xl ${
                            hasApplied
                              ? "bg-gradient-to-r from-neutral-700 to-neutral-800 hover:from-neutral-800 hover:to-neutral-900"
                              : "bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800"
                          }`}
                        >
                          {hasApplied ? (
                            <>
                              <CheckCircle2 className="h-4 w-4" />
                              View Application
                            </>
                          ) : (
                            <>
                              Apply Now
                              <ArrowRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                            </>
                          )}
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* Enhanced Empty State */
              <div
                data-aos="fade-up"
                className="rounded-3xl border-2 border-neutral-200 bg-gradient-to-br from-white via-neutral-50/50 to-white p-16 text-center shadow-xl"
              >
                <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-primary-100 to-primary-50 shadow-lg">
                  <Briefcase className="h-12 w-12 text-primary-600" />
                </div>
                <h3 className="mb-3 text-2xl font-bold text-primary-900">
                  No Positions Available
                </h3>
                <p className="mx-auto mb-6 max-w-md text-base text-neutral-600">
                  We don&apos;t have any open positions matching your criteria.{" "}
                  {searchValue && (
                    <button
                      onClick={() => setSearchValue("")}
                      className="font-bold text-primary-700 hover:text-primary-800 hover:underline"
                    >
                      Clear your search
                    </button>
                  )}
                  {!searchValue && "Check back soon!"}
                </p>
              </div>
            )}

            {/* Pagination */}
            {!loader && totalPages > 1 && (
              <div
                data-aos="fade-up"
                className="mt-10 flex flex-col items-center gap-4"
              >
                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(1, prev - 1))
                    }
                    disabled={currentPage === 1}
                    className="group flex items-center gap-2 rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm font-medium text-neutral-700 transition-all hover:border-neutral-900 hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <ArrowRight className="h-4 w-4 rotate-180 transition-transform group-hover:-translate-x-1" />
                    <span className="hidden sm:inline">Previous</span>
                  </button>

                  <div className="flex items-center gap-2">
                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                      .filter(
                        (page) =>
                          page === 1 ||
                          page === totalPages ||
                          (page >= currentPage - 1 && page <= currentPage + 1),
                      )
                      .map((page, index, array) => (
                        <div key={page} className="flex items-center gap-2">
                          {index > 0 && array[index - 1] !== page - 1 && (
                            <span className="px-1 text-xs text-neutral-400">
                              ...
                            </span>
                          )}
                          <button
                            onClick={() => setCurrentPage(page)}
                            className={`flex h-9 w-9 items-center justify-center rounded-lg text-sm font-semibold transition-all ${
                              currentPage === page
                                ? "bg-neutral-900 text-white"
                                : "border border-neutral-300 bg-white text-neutral-700 hover:border-neutral-900 hover:bg-neutral-50"
                            }`}
                          >
                            {page}
                          </button>
                        </div>
                      ))}
                  </div>

                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                    }
                    disabled={currentPage === totalPages}
                    className="group flex items-center gap-2 rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm font-medium text-neutral-700 transition-all hover:border-neutral-900 hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <span className="hidden sm:inline">Next</span>
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </button>
                </div>

                <p className="text-xs text-neutral-500">
                  Page{" "}
                  <span className="font-semibold text-neutral-900">
                    {currentPage}
                  </span>{" "}
                  of{" "}
                  <span className="font-semibold text-neutral-900">
                    {totalPages}
                  </span>
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Jobs;
