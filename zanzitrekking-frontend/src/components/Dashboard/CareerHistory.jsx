"use client";

import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import {
  AlertCircle,
  ArrowRight,
  Briefcase,
  Calendar,
  CheckCircle,
  Clock,
  FileText,
  Loader2,
  MapPin,
  Sparkles,
  XCircle,
} from "lucide-react";
import { get_user_applications } from "../../store/reducers/jobApplicationReducer";

const CareerHistory = () => {
  const dispatch = useDispatch();
  const { userInfo } = useSelector((state) => state.auth);
  const { applications, totalApplications, loader, errorMessage } = useSelector(
    (state) => state.jobApplication,
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [parPage] = useState(10);
  const applicationsRef = useRef(null);
  const observerRef = useRef(null);

  useEffect(() => {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: "0px 0px -80px 0px",
    };

    observerRef.current = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("active");
        }
      });
    }, observerOptions);

    const applicationsElement = applicationsRef.current;
    const observer = observerRef.current;

    if (applicationsElement) {
      const cards = applicationsElement.querySelectorAll(".application-card");
      cards.forEach((card) => observer.observe(card));
    }

    return () => {
      if (observer) {
        const cards = applicationsElement?.querySelectorAll(".application-card");
        cards?.forEach((card) => observer.unobserve(card));
      }
    };
  }, [applications]);

  useEffect(() => {
    if (userInfo) {
      dispatch(
        get_user_applications({
          page: currentPage,
          parPage,
          customerId: userInfo?._id,
        }),
      );
    }
  }, [dispatch, userInfo, currentPage, parPage]);

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: {
        icon: <Clock className="h-4 w-4" />,
        bg: "bg-gradient-to-r from-yellow-50 to-amber-50",
        border: "border-yellow-200",
        text: "text-yellow-700",
        iconBg: "bg-gradient-to-br from-yellow-400 to-amber-500",
        label: "Pending",
      },
      reviewed: {
        icon: <AlertCircle className="h-4 w-4" />,
        bg: "bg-gradient-to-r from-blue-50 to-indigo-50",
        border: "border-blue-200",
        text: "text-blue-700",
        iconBg: "bg-gradient-to-br from-blue-400 to-indigo-500",
        label: "Under Review",
      },
      accepted: {
        icon: <CheckCircle className="h-4 w-4" />,
        bg: "bg-gradient-to-r from-green-50 to-emerald-50",
        border: "border-green-200",
        text: "text-green-700",
        iconBg: "bg-gradient-to-br from-green-400 to-emerald-500",
        label: "Accepted",
      },
      rejected: {
        icon: <XCircle className="h-4 w-4" />,
        bg: "bg-gradient-to-r from-red-50 to-rose-50",
        border: "border-red-200",
        text: "text-red-700",
        iconBg: "bg-gradient-to-br from-red-400 to-rose-500",
        label: "Rejected",
      },
    };

    const config = statusConfig[status] || statusConfig.pending;
    return (
      <div
        className={`inline-flex items-center gap-2 rounded-full border-2 ${config.border} ${config.bg} px-4 py-1.5 shadow-sm`}
      >
        <div className={`flex h-5 w-5 items-center justify-center rounded-full ${config.iconBg} shadow-md`}>
          {config.icon}
        </div>
        <span className={`text-xs font-bold ${config.text}`}>
          {config.label}
        </span>
      </div>
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loader) {
    return (
      <div className="relative overflow-hidden bg-gradient-to-b from-white via-neutral-50/50 to-white py-16">
        <div className="flex min-h-[400px] items-center justify-center">
          <div className="text-center">
            <div className="relative mb-6 inline-block">
              <Loader2 className="h-12 w-12 animate-spin text-primary-600" />
              <div className="absolute inset-0 h-12 w-12 animate-pulse rounded-full bg-primary-100/50"></div>
            </div>
            <p className="text-base font-semibold text-neutral-700">
              Loading your applications...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className="relative overflow-hidden bg-gradient-to-b from-white via-neutral-50/50 to-white py-12">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-8 text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary-200 bg-white px-5 py-2.5 shadow-sm">
              <Briefcase className="h-4 w-4 text-primary-600" />
              <span className="text-sm font-semibold text-primary-700">
                Career History
              </span>
            </div>
            <h1 className="mb-3 text-4xl font-bold tracking-tight text-primary-900 lg:text-5xl">
              Career History
            </h1>
            <p className="mx-auto max-w-2xl text-lg text-neutral-600">
              View and track all your job applications in one place
            </p>
          </div>
          <div className="flex min-h-[400px] flex-col items-center justify-center rounded-3xl border-2 border-red-200 bg-gradient-to-br from-red-50 to-rose-50 p-12 text-center shadow-xl">
            <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-red-400 to-rose-500 shadow-lg">
              <AlertCircle className="h-10 w-10 text-white" />
            </div>
            <h3 className="mb-3 text-2xl font-bold text-red-800">
              Error Loading Applications
            </h3>
            <p className="mb-8 max-w-md text-red-600">{errorMessage}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-white via-neutral-50/50 to-white py-12">
      {/* Background elements */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-0 top-1/4 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-primary-100/40 blur-3xl" />
        <div className="absolute right-0 top-2/3 h-[500px] w-[500px] translate-x-1/2 rounded-full bg-emerald-100/40 blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-6">
        {/* Header Section */}
        <div className="mb-12 text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary-200 bg-white px-5 py-2.5 shadow-sm">
            <Briefcase className="h-4 w-4 text-primary-600" />
            <span className="text-sm font-semibold text-primary-700">
              Your Applications
            </span>
          </div>
          <h1 className="mb-4 text-4xl font-bold tracking-tight text-primary-900 lg:text-5xl xl:text-6xl">
            Career History
          </h1>
          <div className="mx-auto mb-6 h-1 w-24 rounded-full bg-gradient-to-r from-primary-500 via-primary-600 to-primary-700" />
          <p className="mx-auto max-w-2xl text-lg text-neutral-600">
            View and track all your job applications in one place
          </p>
        </div>

        {applications && Array.isArray(applications) && applications.length > 0 ? (
          <>
            <div className="mb-6 flex items-center justify-between rounded-2xl border border-neutral-200 bg-white px-6 py-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary-100 to-primary-50">
                  <FileText className="h-5 w-5 text-primary-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-neutral-900">
                    {totalApplications} Total Application{totalApplications !== 1 ? "s" : ""}
                  </p>
                  <p className="text-xs text-neutral-500">
                    Showing {applications.length} of {totalApplications}
                  </p>
                </div>
              </div>
            </div>

            <div ref={applicationsRef} className="space-y-6">
              {applications.map((application, index) => (
                <div
                  key={application._id}
                  className="application-card group relative overflow-hidden rounded-3xl border border-neutral-200 bg-white p-8 shadow-lg ring-1 ring-neutral-900/5 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl"
                  style={{ transitionDelay: `${index * 50}ms` }}
                >
                  {/* Background gradient on hover */}
                  <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-gradient-to-br from-primary-100 to-emerald-100 opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100" />
                  <div className="absolute -left-12 -bottom-12 h-32 w-32 rounded-full bg-gradient-to-br from-emerald-100 to-primary-100 opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100" />

                  <div className="relative">
                    <div className="mb-6 flex items-start justify-between gap-6">
                      <div className="flex-1">
                        <div className="mb-4 flex items-center gap-4">
                          <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-100 to-primary-50 shadow-md transition-all duration-500 group-hover:scale-110 group-hover:rotate-3">
                            <Briefcase className="h-8 w-8 text-primary-600 transition-transform duration-500 group-hover:scale-110" />
                            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary-200/50 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                          </div>
                          <div className="flex-1">
                            <h3 className="mb-2 text-2xl font-bold text-primary-900">
                              {application.jobId?.title || "N/A"}
                            </h3>
                            <div className="flex flex-wrap items-center gap-4 text-sm text-neutral-600">
                              {application.jobId?.location && (
                                <div className="flex items-center gap-2 rounded-full bg-neutral-100 px-3 py-1">
                                  <MapPin className="h-4 w-4 text-primary-600" />
                                  <span className="font-medium">{application.jobId.location}</span>
                                </div>
                              )}
                              <div className="flex items-center gap-2 rounded-full bg-neutral-100 px-3 py-1">
                                <Calendar className="h-4 w-4 text-primary-600" />
                                <span className="font-medium">
                                  Applied: {formatDate(application.createdAt)}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="ml-20 space-y-3">
                          {application.jobId?.employmentType && (
                            <div className="flex items-center gap-3 rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-2.5">
                              <span className="text-sm font-semibold text-neutral-700">
                                Employment Type:
                              </span>
                              <span className="rounded-full bg-white px-3 py-1 text-sm font-bold text-primary-700 capitalize shadow-sm">
                                {application.jobId.employmentType}
                              </span>
                            </div>
                          )}
                          {application.jobId?.salaryRange && (
                            <div className="flex items-center gap-3 rounded-xl border border-neutral-200 bg-gradient-to-r from-emerald-50 to-transparent px-4 py-2.5">
                              <span className="text-sm font-semibold text-neutral-700">
                                Salary Range:
                              </span>
                              <span className="rounded-full bg-gradient-to-r from-emerald-500 to-emerald-600 px-4 py-1 text-sm font-bold text-white shadow-md">
                                {application.jobId.salaryRange}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-4">
                        {getStatusBadge(application.status)}
                        {application.jobId?.slug ? (
                          <Link
                            to={`/careers/${application.jobId.slug}`}
                            className="group/btn inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary-600 to-primary-700 px-6 py-3 text-sm font-bold text-white shadow-lg transition-all hover:scale-105 hover:shadow-xl"
                          >
                            View Details
                            <ArrowRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                          </Link>
                        ) : (
                          <span className="inline-flex items-center gap-2 rounded-xl border border-neutral-200 bg-neutral-100 px-6 py-3 text-sm font-semibold text-neutral-500">
                            View Details
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {totalApplications > parPage && (
              <div className="mt-10 flex justify-center">
                <div className="flex items-center gap-3 rounded-2xl border border-neutral-200 bg-white p-2 shadow-lg">
                  <button
                    onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="rounded-xl border border-neutral-300 bg-white px-5 py-2.5 text-sm font-semibold text-neutral-700 transition-all hover:border-primary-600 hover:bg-primary-50 hover:text-primary-700 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Previous
                  </button>
                  <div className="flex items-center gap-2 px-4">
                    <span className="text-sm font-semibold text-neutral-900">
                      Page {currentPage}
                    </span>
                    <span className="text-sm text-neutral-500">of</span>
                    <span className="text-sm font-semibold text-primary-700">
                      {Math.ceil(totalApplications / parPage)}
                    </span>
                  </div>
                  <button
                    onClick={() =>
                      setCurrentPage((prev) =>
                        Math.min(Math.ceil(totalApplications / parPage), prev + 1),
                      )
                    }
                    disabled={currentPage >= Math.ceil(totalApplications / parPage)}
                    className="rounded-xl border border-neutral-300 bg-white px-5 py-2.5 text-sm font-semibold text-neutral-700 transition-all hover:border-primary-600 hover:bg-primary-50 hover:text-primary-700 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="flex min-h-[500px] flex-col items-center justify-center rounded-3xl border-2 border-neutral-200 bg-gradient-to-br from-white via-neutral-50/50 to-white p-12 text-center shadow-xl">
            <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-primary-100 to-primary-50 shadow-lg">
              <FileText className="h-12 w-12 text-primary-600" />
            </div>
            <h3 className="mb-3 text-3xl font-bold text-primary-900">
              No Applications Yet
            </h3>
            <p className="mb-8 max-w-md text-lg text-neutral-600">
              You haven&apos;t applied to any jobs yet. Start exploring career
              opportunities and take the next step in your journey!
            </p>
            <Link
              to="/careers"
              className="group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-primary-600 to-primary-700 px-8 py-4 text-base font-bold text-white shadow-xl transition-all hover:scale-105 hover:shadow-2xl"
            >
              <Briefcase className="h-5 w-5" />
              Browse Jobs
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        )}
      </div>

      <style>{`
        .application-card {
          opacity: 0;
          transform: translateY(30px);
          transition: opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1),
                      transform 0.8s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .application-card.active {
          opacity: 1;
          transform: translateY(0);
        }
      `}</style>
    </div>
  );
};

export default CareerHistory;

