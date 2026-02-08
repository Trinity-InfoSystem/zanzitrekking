"use client";

import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import Header from "../components/Header";
import Footer from "../components/Footer";
import {
  ArrowLeft,
  Briefcase,
  Calendar,
  CheckCircle,
  FileText,
  MapPin,
} from "lucide-react";
import { clearApplication } from "../store/reducers/jobApplicationReducer";

const JobApplicationSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [application, setApplication] = useState(null);
  const [job, setJob] = useState(null);

  useEffect(() => {
    // Get application data from location state
    const applicationData = location.state?.application;
    const jobData = location.state?.job;

    if (applicationData && Object.keys(applicationData).length > 0) {
      setApplication(applicationData);
    }
    if (jobData && Object.keys(jobData).length > 0) {
      setJob(jobData);
    }

    // Clean up application state
    return () => {
      dispatch(clearApplication());
    };
  }, [location.state, dispatch]);

  // If no application data, redirect to jobs page
  useEffect(() => {
    if (!application && (!location.state?.application || Object.keys(location.state?.application || {}).length === 0)) {
      const timer = setTimeout(() => {
        navigate("/careers");
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [application, location.state, navigate]);

  if (!application) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="flex h-64 items-center justify-center">
          <div className="text-center">
            <p className="text-text-light">Loading...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <section className="bg-gradient-to-br from-primary-900 via-primary-800 to-primary-900 py-16">
        <div className="px-4 md:px-12">
          <div className="mx-auto max-w-4xl">
            <div className="text-center">
              <div className="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-full bg-green-500">
                <CheckCircle className="h-12 w-12 text-white" />
              </div>
              <h1 className="mb-4 text-4xl font-bold text-white lg:text-5xl">
                Application Submitted Successfully!
              </h1>
              <p className="text-lg text-primary-100">
                Thank you for your interest in joining our team
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-16">
        <div className="px-4 md:px-12">
          <div className="mx-auto max-w-4xl">
            {/* Application Details Card */}
            <div className="mb-8 rounded-2xl border-2 border-primary-100 bg-primary-50 p-8">
              <h2 className="mb-6 text-2xl font-bold text-primary-800">
                Application Details
              </h2>

              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-primary-100">
                    <Briefcase className="h-5 w-5 text-primary-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-text-light">
                      Position Applied For
                    </p>
                    <p className="text-lg font-semibold text-primary-800">
                      {job?.title || application.jobId?.title || "N/A"}
                    </p>
                  </div>
                </div>

                {job?.location && (
                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-primary-100">
                      <MapPin className="h-5 w-5 text-primary-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-text-light">
                        Location
                      </p>
                      <p className="text-lg font-semibold text-primary-800">
                        {job.location}
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-primary-100">
                    <Calendar className="h-5 w-5 text-primary-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-text-light">
                      Application Date
                    </p>
                    <p className="text-lg font-semibold text-primary-800">
                      {formatDate(application.createdAt || new Date())}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-primary-100">
                    <FileText className="h-5 w-5 text-primary-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-text-light">
                      Application Status
                    </p>
                    <p className="text-lg font-semibold text-yellow-600">
                      Pending Review
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Applicant Information */}
            <div className="mb-8 rounded-2xl border-2 border-neutral-200 bg-white p-8">
              <h2 className="mb-6 text-2xl font-bold text-primary-800">
                Your Information
              </h2>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <p className="text-sm font-medium text-text-light">
                    Full Name
                  </p>
                  <p className="text-lg font-semibold text-primary-800">
                    {application.firstName} {application.lastName}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-text-light">Email</p>
                  <p className="text-lg font-semibold text-primary-800">
                    {application.email}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-text-light">Phone</p>
                  <p className="text-lg font-semibold text-primary-800">
                    {application.phone}
                  </p>
                </div>
                {application.cvOriginalName && (
                  <div>
                    <p className="text-sm font-medium text-text-light">
                      CV File
                    </p>
                    <p className="text-lg font-semibold text-primary-800">
                      {application.cvOriginalName}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Next Steps */}
            <div className="mb-8 rounded-2xl border-2 border-success-100 bg-success-50 p-8">
              <h2 className="mb-4 text-2xl font-bold text-primary-800">
                What&apos;s Next?
              </h2>
              <ul className="space-y-3 text-text-dark">
                <li className="flex items-start gap-3">
                  <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-success-600" />
                  <span>
                    Our hiring team will review your application carefully.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-success-600" />
                  <span>
                    You will receive an email confirmation shortly (check your
                    inbox).
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-success-600" />
                  <span>
                    We&apos;ll contact you via email if your application matches our
                    requirements.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-success-600" />
                  <span>
                    You can track your application status in your dashboard&apos;s
                    Career History section.
                  </span>
                </li>
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Link
                to="/careers"
                className="inline-flex items-center justify-center gap-2 rounded-lg border-2 border-primary-200 bg-white px-6 py-3 font-semibold text-primary-700 transition-colors hover:bg-primary-50"
              >
                <ArrowLeft className="h-5 w-5" />
                Back to Jobs
              </Link>
              <Link
                to="/dashboard/career-history"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-primary-700"
              >
                <Briefcase className="h-5 w-5" />
                View Career History
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default JobApplicationSuccess;

