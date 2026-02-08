"use client";

import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  apply_to_job,
  clearApplication,
  clearMessage,
} from "../store/reducers/jobApplicationReducer";
import { clearJob, get_job } from "../store/reducers/jobReducer";
import Footer from "../components/Footer";
import Header from "../components/Header";
import {
  ArrowLeft,
  ArrowRight,
  Briefcase,
  CheckCircle,
  FileText,
  Mail,
  Phone,
  Upload,
  User,
} from "lucide-react";
import toast from "react-hot-toast";
import { PropagateLoader } from "react-spinners";

const overrideStyle = {
  display: "flex",
  margin: "0 auto",
  height: "24px",
  justifyContent: "center",
  alignItems: "center",
};

const ApplyToJob = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { categories } = useSelector((state) => state.home);
  const { userInfo } = useSelector((state) => state.auth);
  const { job, loader: jobLoader } = useSelector((state) => state.job);
  const {
    loader,
    successMessage,
    errorMessage,
    application: jobApplication,
  } = useSelector((state) => state.jobApplication);
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    additionalDetails: "",
  });
  const [cvFile, setCvFile] = useState(null);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (jobId) {
      dispatch(get_job(jobId));
    }
    return () => {
      dispatch(clearJob());
      dispatch(clearApplication());
    };
  }, [dispatch, jobId]);

  // Initialize form data with user info when userInfo is available
  useEffect(() => {
    if (userInfo) {
      const nameParts = userInfo.name?.split(" ") || [];
      setFormData((prev) => ({
        ...prev,
        firstName: nameParts[0] || "",
        lastName: nameParts.slice(1).join(" ") || "",
        email: userInfo.email || "",
      }));
    }
  }, [userInfo]);

  useEffect(() => {
    if (successMessage) {
      // Navigate to success page with application and job data
      navigate("/job-application-success", {
        state: {
          application: jobApplication || {},
          job,
        },
      });
      dispatch(clearMessage());
    }
    if (errorMessage) {
      toast.error(errorMessage);
      dispatch(clearMessage());
    }
  }, [successMessage, errorMessage, dispatch, navigate, job, jobApplication]);

  const validateForm = () => {
    const newErrors = {};
    let valid = true;

    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required";
      valid = false;
    }
    if (!formData.lastName.trim()) {
      newErrors.lastName = "Last name is required";
      valid = false;
    }
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
      valid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
      valid = false;
    }
    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
      valid = false;
    }
    if (!cvFile) {
      newErrors.cvFile = "CV file is required";
      valid = false;
    } else {
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (cvFile.size > maxSize) {
        newErrors.cvFile = "CV file size must be less than 5MB";
        valid = false;
      }
      const allowedTypes = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ];
      if (!allowedTypes.includes(cvFile.type)) {
        newErrors.cvFile = "CV must be a PDF, DOC, or DOCX file";
        valid = false;
      }
    }

    setErrors(newErrors);
    return valid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {return;}

    const submitFormData = new FormData();
    submitFormData.append("firstName", formData.firstName);
    submitFormData.append("lastName", formData.lastName);
    submitFormData.append("email", formData.email);
    submitFormData.append("phone", formData.phone);
    submitFormData.append("additionalDetails", formData.additionalDetails);
    submitFormData.append("cvFile", cvFile);
    submitFormData.append("customerId", userInfo._id || userInfo.id);

    dispatch(apply_to_job({ jobId, formData: submitFormData }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setCvFile(file);
      setErrors({ ...errors, cvFile: "" });
    }
  };

  // Check if user is logged in
  useEffect(() => {
    if (!userInfo) {
      toast.error("Please log in to apply for this job");
      navigate("/login", { state: { from: `/apply/${jobId}` } });
    }
  }, [userInfo, navigate, jobId]);

  if (jobLoader) {
    return (
      <div className="min-h-screen bg-white">
        <Header categories={categories} />
        <div className="flex h-64 items-center justify-center">
          <div className="text-center">
            <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            <p className="text-text-light">Loading job details...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!userInfo) {
    return (
      <div className="min-h-screen bg-white">
        <Header categories={categories} />
        <div className="flex h-64 items-center justify-center">
          <div className="text-center">
            <h2 className="mb-2 text-2xl font-bold text-primary-800">
              Login Required
            </h2>
            <p className="mb-4 text-text-light">
              Please log in to apply for this job.
            </p>
            <Link
              to="/login"
              state={{ from: `/apply/${jobId}` }}
              className="inline-flex items-center gap-2 rounded-lg bg-secondary px-4 py-2 text-white transition-colors hover:bg-secondary-600"
            >
              Go to Login
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!job || !job._id) {
    return (
      <div className="min-h-screen bg-white">
        <Header categories={categories} />
        <div className="flex h-64 items-center justify-center">
          <div className="text-center">
            <h2 className="mb-2 text-2xl font-bold text-primary-800">
              Job Not Found
            </h2>
            <Link
              to="/jobs"
              className="inline-flex items-center gap-2 rounded-lg bg-secondary px-4 py-2 text-white transition-colors hover:bg-secondary-600"
            >
              View All Jobs
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Header categories={categories} />

      <section className="relative overflow-hidden bg-gradient-to-br from-primary-700 via-primary-800 to-primary-900 py-16 lg:py-20">
        {/* Background elements */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute left-1/4 top-20 h-96 w-96 rounded-full bg-emerald-500 blur-3xl"></div>
          <div className="absolute bottom-20 right-1/4 h-96 w-96 rounded-full bg-primary-500 blur-3xl"></div>
        </div>

        <div className="relative z-10 px-4 md:px-12">
          <div className="mx-auto max-w-4xl">
            <div>
              <Link
                to={`/careers/${jobId}`}
                className="group mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-5 py-2.5 text-sm font-semibold text-white/90 backdrop-blur-md transition-all hover:bg-white/20 hover:text-white"
              >
                <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                <span>Back to Job Details</span>
              </Link>
            </div>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-5 py-2.5 backdrop-blur-md shadow-lg">
              <Briefcase className="h-4 w-4 text-white" />
              <span className="text-sm font-semibold text-white">
                Apply for Position
              </span>
            </div>
            <h1 className="mb-3 text-4xl font-bold text-white lg:text-5xl xl:text-6xl">
              {job.title}
            </h1>
            <p className="text-lg text-white/90">{job.location}</p>
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-gradient-to-b from-white via-neutral-50/50 to-white py-16 lg:py-20">
        {/* Background elements */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-0 top-1/4 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-primary-100/40 blur-3xl" />
          <div className="absolute right-0 top-2/3 h-[500px] w-[500px] translate-x-1/2 rounded-full bg-emerald-100/40 blur-3xl" />
        </div>

        <div className="relative z-10 px-4 md:px-12">
          <div className="mx-auto max-w-3xl">
            <div className="mb-10 overflow-hidden rounded-3xl border-2 border-primary-200 bg-gradient-to-br from-primary-50/50 via-white to-white p-8 shadow-xl">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary-200 bg-white px-5 py-2.5 shadow-sm">
                <FileText className="h-4 w-4 text-primary-600" />
                <span className="text-sm font-semibold text-primary-700">
                  Application Form
                </span>
              </div>
              <h2 className="mb-3 text-3xl font-bold text-primary-900 lg:text-4xl">
                Application Form
              </h2>
              <div className="mb-4 h-1 w-24 rounded-full bg-gradient-to-r from-primary-500 via-primary-600 to-primary-700" />
              <p className="text-base text-neutral-600">
                Please fill out all required fields and upload your CV to
                complete your application.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="group/field">
                  <label className="mb-3 flex items-center gap-2 text-sm font-bold text-primary-900 transition-colors duration-300 group-focus-within/field:text-primary-700">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary-100 to-primary-50 transition-all duration-300 group-focus-within/field:scale-110 group-focus-within/field:rotate-3">
                      <User className="h-4 w-4 text-primary-600 transition-transform duration-300 group-focus-within/field:scale-110" />
                    </div>
                    First Name *
                  </label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) =>
                      setFormData({ ...formData, firstName: e.target.value })
                    }
                    className="w-full rounded-xl border-2 border-neutral-200 bg-white px-4 py-3.5 text-sm font-medium text-neutral-900 transition-all duration-300 placeholder:text-neutral-400 focus:border-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-600/20 focus:shadow-lg"
                    placeholder="Enter your first name"
                  />
                  {errors.firstName && (
                    <p className="mt-2 text-xs font-semibold text-red-600">
                      {errors.firstName}
                    </p>
                  )}
                </div>

                <div className="group/field">
                  <label className="mb-3 flex items-center gap-2 text-sm font-bold text-primary-900 transition-colors duration-300 group-focus-within/field:text-primary-700">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary-100 to-primary-50 transition-all duration-300 group-focus-within/field:scale-110 group-focus-within/field:rotate-3">
                      <User className="h-4 w-4 text-primary-600 transition-transform duration-300 group-focus-within/field:scale-110" />
                    </div>
                    Last Name *
                  </label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) =>
                      setFormData({ ...formData, lastName: e.target.value })
                    }
                    className="w-full rounded-xl border-2 border-neutral-200 bg-white px-4 py-3.5 text-sm font-medium text-neutral-900 transition-all duration-300 placeholder:text-neutral-400 focus:border-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-600/20 focus:shadow-lg"
                    placeholder="Enter your last name"
                  />
                  {errors.lastName && (
                    <p className="mt-2 text-xs font-semibold text-red-600">
                      {errors.lastName}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="group/field">
                  <label className="mb-3 flex items-center gap-2 text-sm font-bold text-primary-900 transition-colors duration-300 group-focus-within/field:text-primary-700">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary-100 to-primary-50 transition-all duration-300 group-focus-within/field:scale-110 group-focus-within/field:rotate-3">
                      <Mail className="h-4 w-4 text-primary-600 transition-transform duration-300 group-focus-within/field:scale-110" />
                    </div>
                    Email Address *
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="w-full rounded-xl border-2 border-neutral-200 bg-white px-4 py-3.5 text-sm font-medium text-neutral-900 transition-all duration-300 placeholder:text-neutral-400 focus:border-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-600/20 focus:shadow-lg"
                    placeholder="your.email@example.com"
                  />
                  {errors.email && (
                    <p className="mt-2 text-xs font-semibold text-red-600">
                      {errors.email}
                    </p>
                  )}
                </div>

                <div className="group/field">
                  <label className="mb-3 flex items-center gap-2 text-sm font-bold text-primary-900 transition-colors duration-300 group-focus-within/field:text-primary-700">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary-100 to-primary-50 transition-all duration-300 group-focus-within/field:scale-110 group-focus-within/field:rotate-3">
                      <Phone className="h-4 w-4 text-primary-600 transition-transform duration-300 group-focus-within/field:scale-110" />
                    </div>
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    className="w-full rounded-xl border-2 border-neutral-200 bg-white px-4 py-3.5 text-sm font-medium text-neutral-900 transition-all duration-300 placeholder:text-neutral-400 focus:border-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-600/20 focus:shadow-lg"
                    placeholder="+1234567890"
                  />
                  {errors.phone && (
                    <p className="mt-2 text-xs font-semibold text-red-600">
                      {errors.phone}
                    </p>
                  )}
                </div>
              </div>

              <div className="group/field">
                <label className="mb-3 flex items-center gap-2 text-sm font-bold text-primary-900 transition-colors duration-300 group-focus-within/field:text-primary-700">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary-100 to-primary-50 transition-all duration-300 group-focus-within/field:scale-110 group-focus-within/field:rotate-3">
                    <FileText className="h-4 w-4 text-primary-600 transition-transform duration-300 group-focus-within/field:scale-110" />
                  </div>
                  Additional Details
                </label>
                <textarea
                  value={formData.additionalDetails}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      additionalDetails: e.target.value,
                    })
                  }
                  rows={6}
                  className="w-full rounded-xl border-2 border-neutral-200 bg-white px-4 py-3.5 text-sm font-medium text-neutral-900 transition-all duration-300 placeholder:text-neutral-400 focus:border-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-600/20 focus:shadow-lg"
                  placeholder="Tell us why you're interested in this position, your relevant experience, or any other information you'd like to share..."
                />
              </div>

              <div>
                <label className="mb-3 flex items-center gap-2 text-sm font-bold text-primary-900">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary-100 to-primary-50">
                    <Upload className="h-4 w-4 text-primary-600" />
                  </div>
                  Upload CV/Resume *
                </label>
                <div className="group relative overflow-hidden rounded-2xl border-2 border-dashed border-primary-300 bg-gradient-to-br from-primary-50/50 to-white p-8 transition-all duration-300 hover:border-primary-500 hover:bg-primary-50 hover:shadow-lg">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileChange}
                    className="hidden"
                    id="cv-upload"
                  />
                  <label
                    htmlFor="cv-upload"
                    className="flex cursor-pointer flex-col items-center justify-center gap-3"
                  >
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-100 to-primary-50 shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:rotate-3">
                      <Upload className="h-8 w-8 text-primary-600 transition-transform duration-300 group-hover:scale-110" />
                    </div>
                    <span className="text-base font-bold text-primary-700">
                      {cvFile
                        ? cvFile.name
                        : "Click to upload or drag and drop"}
                    </span>
                    <span className="text-xs font-medium text-neutral-500">
                      PDF, DOC, or DOCX (Max 5MB)
                    </span>
                  </label>
                </div>
                {errors.cvFile && (
                  <p className="mt-2 text-xs font-semibold text-red-600">
                    {errors.cvFile}
                  </p>
                )}
                {cvFile && (
                  <div className="mt-3 flex items-center gap-2 rounded-xl border border-emerald-200 bg-gradient-to-r from-emerald-50 to-transparent px-4 py-2.5 text-sm font-semibold text-emerald-700">
                    <CheckCircle className="h-5 w-5" />
                    <span>File selected: {cvFile.name}</span>
                  </div>
                )}
              </div>

              <div className="flex gap-4 pt-4">
                <Link
                  to={`/careers/${jobId}`}
                  className="rounded-xl border-2 border-neutral-300 bg-white px-8 py-3.5 font-bold text-neutral-700 transition-all hover:border-neutral-400 hover:bg-neutral-50"
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  disabled={loader}
                  className="group flex-1 rounded-xl bg-gradient-to-r from-primary-600 to-primary-700 px-8 py-3.5 font-bold text-white shadow-lg transition-all hover:scale-105 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loader ? (
                    <PropagateLoader
                      cssOverride={overrideStyle}
                      color="#ffffff"
                      size={8}
                    />
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      Submit Application
                      <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                    </span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default ApplyToJob;
