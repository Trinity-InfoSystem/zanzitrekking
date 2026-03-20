"use client";

import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { clearJob, get_job } from "../store/reducers/jobReducer";
import Footer from "../components/Footer";
import Header from "../components/Header";
import { sanitizeHTML } from "../utils/sanitize";
import {
  ArrowLeft,
  ArrowRight,
  Bookmark,
  Briefcase,
  Calendar,
  CheckCircle,
  Clock,
  DollarSign,
  MapPin,
  Share2,
  Sparkles,
} from "lucide-react";
import { get_user_applications } from "../store/reducers/jobApplicationReducer";
import SEO from "../components/SEO";

const JobDetails = () => {
  const { jobId } = useParams();
  const dispatch = useDispatch();
  const { categories } = useSelector((state) => state.home);
  const { job, loader } = useSelector((state) => state.job);
  const { userInfo } = useSelector((state) => state.auth);
  const { applications } = useSelector((state) => state.jobApplication);

  useEffect(() => {
    if (jobId) {
      dispatch(get_job(jobId));
    }
    return () => {
      dispatch(clearJob());
    };
  }, [dispatch, jobId]);

  useEffect(() => {
    if (userInfo) {
      dispatch(
        get_user_applications({
          page: 1,
          parPage: 100,
          customerId: userInfo._id || userInfo._id,
        }),
      );
    }
  }, [dispatch, userInfo]);

  if (loader) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-neutral-50">
        <Header categories={categories} />
        <div className="flex h-screen items-center justify-center">
          <div className="text-center">
            <div className="relative mb-6 inline-block">
              <div className="h-16 w-16 animate-spin rounded-full border-4 border-neutral-200 border-t-neutral-900"></div>
              <div className="absolute inset-0 h-16 w-16 animate-pulse rounded-full bg-neutral-900/10"></div>
            </div>
            <p className="text-lg font-medium text-neutral-600">
              Loading job details...
            </p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!job || !job._id) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-neutral-50">
        <Header categories={categories} />
        <div className="flex min-h-screen items-center justify-center px-4">
          <div className="mx-auto max-w-md text-center">
            <div className="mb-6 inline-flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-neutral-100 to-neutral-200 shadow-lg">
              <Briefcase className="h-12 w-12 text-neutral-400" />
            </div>
            <h2 className="mb-3 text-3xl font-bold text-neutral-900">
              Job Not Found
            </h2>
            <p className="mb-8 text-neutral-600">
              The position you&apos;re looking for doesn&apos;t exist or is no longer
              available.
            </p>
            <Link
              to="/careers"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-neutral-900 to-neutral-700 px-8 py-4 font-bold text-white shadow-lg transition-all hover:shadow-xl"
            >
              <ArrowLeft className="h-5 w-5" />
              View All Jobs
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const application = applications.find(
    (application) => application?.jobId?._id === job._id,
  );

  const statusConfig = {
    pending: {
      bg: "from-yellow-50 to-amber-50",
      text: "text-yellow-700",
      border: "border-yellow-200",
      icon: "bg-gradient-to-br from-yellow-400 to-amber-500",
      label: "Under Review",
      description: "Your application is being reviewed by our team.",
    },
    reviewed: {
      bg: "from-blue-50 to-indigo-50",
      text: "text-blue-700",
      border: "border-blue-200",
      icon: "bg-gradient-to-br from-blue-400 to-indigo-500",
      label: "Reviewed",
      description: "We&apos;ve reviewed your application and will be in touch soon.",
    },
    accepted: {
      bg: "from-green-50 to-emerald-50",
      text: "text-green-700",
      border: "border-green-200",
      icon: "bg-gradient-to-br from-green-400 to-emerald-500",
      label: "Accepted",
      description: "Congratulations! Check your email for next steps.",
    },
    rejected: {
      bg: "from-red-50 to-rose-50",
      text: "text-red-700",
      border: "border-red-200",
      icon: "bg-gradient-to-br from-red-400 to-rose-500",
      label: "Not Selected",
      description:
        "Thank you for your interest. We&apos;ll keep your profile on file.",
    },
  };

  const currentStatus =
    statusConfig[application?.status] || statusConfig.pending;

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-neutral-50">
      {job?._id && (
        <SEO
          title={`${job.title} | Careers at Zanzi Safaris`}
          description={job.description}
          type="job"
          data={job}
        />
      )}
      <Header categories={categories} />

      {/* Enhanced Hero Section */}
      <section className="relative overflow-hidden border-b border-neutral-200 bg-gradient-to-br from-primary-700 via-primary-800 to-primary-900 py-20 lg:py-24">
        {/* Animated Background */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute left-1/4 top-20 h-96 w-96 rounded-full bg-emerald-500 blur-3xl"></div>
          <div className="absolute bottom-20 right-1/4 h-96 w-96 rounded-full bg-primary-500 blur-3xl"></div>
        </div>

        {/* Grid Pattern */}
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.05) 1px, transparent 1px)",
            backgroundSize: "50px 50px",
          }}
        ></div>

        <div className="relative z-10 px-4 md:px-12">
          <div className="mx-auto max-w-5xl">
            <Link
              to="/careers"
              className="group mb-8 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-5 py-2.5 text-sm font-semibold text-white/90 backdrop-blur-md transition-all hover:bg-white/20 hover:text-white"
            >
              <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
              Back to All Jobs
            </Link>

            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-5 py-2.5 backdrop-blur-md shadow-lg">
              <Sparkles className="h-4 w-4 text-yellow-300" />
              <span className="text-sm font-semibold text-white">
                Featured Opportunity
              </span>
            </div>

            <h1 className="mb-6 text-4xl font-bold leading-tight text-white lg:text-5xl xl:text-6xl">
              {job.title}
            </h1>

            <div className="flex flex-wrap gap-3">
              {job.location && (
                <div className="flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 backdrop-blur-md shadow-sm transition-all hover:bg-white/20">
                  <MapPin className="h-4 w-4 text-white" />
                  <span className="text-sm font-semibold text-white">
                    {job.location}
                  </span>
                </div>
              )}
              {job.employmentType && (
                <div className="flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 backdrop-blur-md shadow-sm transition-all hover:bg-white/20">
                  <Briefcase className="h-4 w-4 text-white" />
                  <span className="text-sm font-semibold capitalize text-white">
                    {job.employmentType.replace("-", " ")}
                  </span>
                </div>
              )}
              {job.salaryRange && (
                <div className="flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 backdrop-blur-md shadow-sm transition-all hover:bg-white/20">
                  <DollarSign className="h-4 w-4 text-white" />
                  <span className="text-sm font-semibold text-white">
                    {job.salaryRange}
                  </span>
                </div>
              )}
              {job.applicationDeadline && (
                <div className="flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 backdrop-blur-md shadow-sm transition-all hover:bg-white/20">
                  <Clock className="h-4 w-4 text-white" />
                  <span className="text-sm font-semibold text-white">
                    Deadline:{" "}
                    {new Date(job.applicationDeadline).toLocaleDateString(
                      "en-US",
                      {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      },
                    )}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Content Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-white via-neutral-50/50 to-white py-16 lg:py-20">
        {/* Background elements */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-0 top-1/4 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-primary-100/40 blur-3xl" />
          <div className="absolute right-0 top-2/3 h-[500px] w-[500px] translate-x-1/2 rounded-full bg-emerald-100/40 blur-3xl" />
        </div>

        <div className="relative z-10 px-4 md:px-12">
          <div className="mx-auto max-w-5xl">
            <div className="grid gap-8 lg:grid-cols-3">
              {/* Main Content */}
              <div className="lg:col-span-2">
                <div className="group relative overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-xl ring-1 ring-neutral-900/5 transition-all duration-500 hover:shadow-2xl">
                  {/* Background gradient on hover */}
                  <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-gradient-to-br from-primary-100 to-emerald-100 opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100" />
                  
                  <div className="relative border-b-4 border-primary-600 bg-gradient-to-br from-primary-50/50 via-white to-white p-8 lg:p-10">
                    <h2 className="text-3xl font-bold text-primary-900 transition-colors duration-300 group-hover:text-primary-700 lg:text-4xl">
                      About This Role
                    </h2>
                  </div>

                  <div className="p-8 lg:p-10">
                    <div className="prose prose-neutral prose-headings:font-bold prose-headings:text-neutral-900 prose-p:text-neutral-700 prose-li:text-neutral-700 max-w-none">
                      {job.contentType === "html" && job.htmlContent ? (
                        <div
                          className="job-html-content"
                          dangerouslySetInnerHTML={{
                            __html: sanitizeHTML(job.htmlContent),
                          }}
                        />
                      ) : (
                        <p className="whitespace-pre-line text-base leading-relaxed text-neutral-700">
                          {job.description}
                        </p>
                      )}
                    </div>

                    {job.requirements && job.requirements.length > 0 && (
                      <div className="mt-12 border-t-2 border-neutral-200 pt-10">
                        <h3 className="mb-8 text-2xl font-bold text-primary-900">
                          What We&apos;re Looking For
                        </h3>
                        <ul className="space-y-4">
                          {job.requirements.map((req, index) => (
                            <li key={index} className="group/req flex items-start gap-4 transition-all duration-300 hover:translate-x-2">
                              <div className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-lg transition-all duration-300 group-hover/req:scale-110 group-hover/req:rotate-3">
                                <CheckCircle className="h-5 w-5 text-white transition-transform duration-300 group-hover/req:scale-110" />
                              </div>
                              <span className="text-base font-medium leading-relaxed text-neutral-700 transition-colors duration-300 group-hover/req:text-primary-700">
                                {req}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Enhanced Sidebar */}
              <div className="lg:col-span-1">
                <div className="sticky top-24 space-y-6">
                  {application ? (
                    /* Enhanced Application Status Card */
                    <div
                      className={`group relative overflow-hidden rounded-3xl border-2 ${currentStatus.border} bg-gradient-to-br ${currentStatus.bg} shadow-2xl transition-all duration-500 hover:scale-105 hover:shadow-3xl`}
                    >
                      {/* Background effects */}
                      <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-white/20 opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100" />
                      
                      <div className="relative p-8">
                        <div className="mb-6 flex items-center gap-4">
                          <div
                            className={`flex h-14 w-14 items-center justify-center rounded-2xl ${currentStatus.icon} shadow-xl transition-all duration-500 group-hover:scale-110 group-hover:rotate-3`}
                          >
                            <CheckCircle className="h-7 w-7 text-white transition-transform duration-500 group-hover:scale-110" />
                          </div>
                          <div>
                            <h3 className="text-sm font-semibold text-neutral-600">
                              Application Status
                            </h3>
                            <p
                              className={`text-xl font-bold ${currentStatus.text}`}
                            >
                              {currentStatus.label}
                            </p>
                          </div>
                        </div>

                        <div className="mb-6 rounded-2xl border-2 border-white/50 bg-white/60 p-5 backdrop-blur-sm shadow-sm">
                          <div className="mb-2 flex items-center gap-2 text-xs font-bold text-neutral-600">
                            <Calendar className="h-4 w-4" />
                            <span>Submitted</span>
                          </div>
                          <p className="text-lg font-bold text-neutral-900">
                            {new Date(application.createdAt).toLocaleDateString(
                              "en-US",
                              {
                                month: "long",
                                day: "numeric",
                                year: "numeric",
                              },
                            )}
                          </p>
                        </div>

                        <p className="text-sm leading-relaxed text-neutral-700">
                          {currentStatus.description}
                        </p>
                      </div>
                    </div>
                  ) : (
                    /* Enhanced Apply Card */
                    <div className="group relative overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-xl ring-1 ring-neutral-900/5 transition-all duration-500 hover:shadow-2xl">
                      {/* Background gradient on hover */}
                      <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-gradient-to-br from-primary-100 to-emerald-100 opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100" />
                      
                      <div className="relative border-b-4 border-primary-600 bg-gradient-to-br from-primary-50/50 via-white to-white p-6">
                        <h3 className="text-xl font-bold text-primary-900 transition-colors duration-300 group-hover:text-primary-700">
                          Ready to Apply?
                        </h3>
                      </div>

                      <div className="p-6">
                        <p className="mb-8 text-base leading-relaxed text-neutral-600">
                          Join our passionate team and help create unforgettable
                          travel experiences for adventurers worldwide.
                        </p>

                        <Link
                          to={`/apply/${job._id}`}
                          className="group/btn relative mb-6 inline-flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-primary-600 to-primary-700 px-6 py-4 font-bold text-white shadow-lg transition-all hover:scale-105 hover:shadow-xl"
                        >
                          <span className="relative z-10 flex items-center gap-2">
                            Apply Now
                            <ArrowRight className="h-5 w-5 transition-transform group-hover/btn:translate-x-1" />
                          </span>
                          <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 opacity-0 transition-opacity group-hover/btn:opacity-100"></div>
                        </Link>

                        <div className="flex items-center justify-center gap-2 rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-2.5 text-xs font-semibold text-neutral-600">
                          <Clock className="h-4 w-4 text-primary-600" />
                          <span>Takes approximately 5 minutes</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Enhanced Share Card */}
                  <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-lg ring-1 ring-neutral-900/5">
                    <h4 className="mb-5 text-lg font-bold text-primary-900">
                      Share This Job
                    </h4>
                    <div className="flex gap-3">
                      <button className="group flex-1 rounded-xl border-2 border-neutral-200 bg-white px-4 py-3 font-semibold text-neutral-700 transition-all hover:border-primary-600 hover:bg-primary-50 hover:text-primary-700">
                        <Share2 className="mx-auto h-5 w-5 transition-transform group-hover:scale-110" />
                      </button>
                      <button className="group flex-1 rounded-xl border-2 border-neutral-200 bg-white px-4 py-3 font-semibold text-neutral-700 transition-all hover:border-primary-600 hover:bg-primary-50 hover:text-primary-700">
                        <Bookmark className="mx-auto h-5 w-5 transition-transform group-hover:scale-110" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default JobDetails;
