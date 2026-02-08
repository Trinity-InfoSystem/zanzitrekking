"use client";

import { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import Pagination from "../Pagination";
import { FaSearch, FaDownload, FaEye, FaEnvelope, FaCheck, FaTimes } from "react-icons/fa";
import { PropagateLoader } from "react-spinners";
import { overrideStyle } from "../../utils/utilis";
import {
  get_applications,
  get_application,
  update_application_status,
  send_email_to_applicant,
  clearMessage,
  clearApplication,
} from "../../store/Reducers/jobApplicationReducer";
import { get_jobs } from "../../store/Reducers/jobReducer";
import toast from "react-hot-toast";
import HeaderText from "./HeaderText";
import SortSelect from "../components/SortSelect";
import { DOWNLOAD_URL } from "../../utils/constants";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import "../admin/quill-custom.css";

const JobApplications = () => {
  const dispatch = useDispatch();
  const {
    loader,
    successMessage,
    errorMessage,
    applications,
    application,
    totalApplications,
  } = useSelector((state) => state.jobApplication);
  const { jobs } = useSelector((state) => state.job);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchValue, setSearchValue] = useState("");
  const [parPage, setParPage] = useState(10);
  const [sort, setSort] = useState("newest-desc");
  const [selectedJobId, setSelectedJobId] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailSubject, setEmailSubject] = useState("");
  const [emailMessage, setEmailMessage] = useState("");
  const [sendingEmail, setSendingEmail] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [adminNotes, setAdminNotes] = useState("");
  const [pendingStatus, setPendingStatus] = useState(null);

  // Quill modules configuration
  const quillModules = useMemo(
    () => ({
      toolbar: [
        [{ header: [1, 2, 3, false] }],
        ["bold", "italic", "underline", "strike"],
        [{ list: "ordered" }, { list: "bullet" }],
        [{ color: [] }, { background: [] }],
        ["link"],
        ["clean"],
      ],
    }),
    [],
  );

  useEffect(() => {
    dispatch(get_jobs({ allJobs: "true" }));
  }, [dispatch]);

  useEffect(() => {
    if (errorMessage) {
      toast.error(errorMessage);
      dispatch(clearMessage());
    }
    if (successMessage) {
      toast.success(successMessage);
      dispatch(
        get_applications({
          parPage: +parPage,
          currentPage: +currentPage,
          searchValue,
          jobId: selectedJobId || undefined,
          status: selectedStatus || undefined,
          sort,
        }),
      );
      dispatch(clearMessage());
    }
  }, [
    successMessage,
    errorMessage,
    dispatch,
    parPage,
    currentPage,
    searchValue,
    selectedJobId,
    selectedStatus,
    sort,
  ]);

  useEffect(() => {
    const obj = {
      parPage: +parPage,
      currentPage: +currentPage,
      searchValue,
      jobId: selectedJobId || undefined,
      status: selectedStatus || undefined,
      sort,
    };
    dispatch(get_applications(obj));
  }, [
    searchValue,
    currentPage,
    parPage,
    selectedJobId,
    selectedStatus,
    sort,
    dispatch,
  ]);

  const handleViewApplication = async (applicationId) => {
    const result = await dispatch(get_application(applicationId));
    if (result.type.endsWith("fulfilled")) {
      setSelectedApplication(result.payload.application);
      setShowModal(true);
    }
  };

  const handleStatusChange = (applicationId, newStatus, app = null) => {
    if (newStatus === "rejected") {
      // Show rejection modal to get reason
      const application = app || applications.find((a) => a._id === applicationId);
      if (application) {
        setSelectedApplication(application);
        setRejectionReason(application.rejectedReason || "");
        setAdminNotes(application.adminNotes || "");
        setPendingStatus("rejected");
        setShowRejectModal(true);
      }
    } else if (newStatus === "accepted") {
      // Show acceptance modal to optionally add admin notes
      const application = app || applications.find((a) => a._id === applicationId);
      if (application) {
        setSelectedApplication(application);
        setAdminNotes(application.adminNotes || "");
        setRejectionReason(""); // Clear rejection reason for acceptance
        setPendingStatus("accepted");
        setShowRejectModal(true); // Reuse the same modal for acceptance
      }
    } else {
      dispatch(update_application_status({ applicationId, status: newStatus }));
    }
  };

  const handleConfirmStatusChange = async () => {
    if (!selectedApplication || !pendingStatus) return;

    const payload = {
      applicationId: selectedApplication._id,
      status: pendingStatus,
    };

    if (pendingStatus === "rejected" && rejectionReason.trim()) {
      payload.rejectedReason = rejectionReason.trim();
    }

    if (adminNotes.trim()) {
      payload.adminNotes = adminNotes.trim();
    }

    try {
      await dispatch(update_application_status(payload)).unwrap();
      setShowRejectModal(false);
      setRejectionReason("");
      setAdminNotes("");
      setSelectedApplication(null);
      setPendingStatus(null);
    } catch (error) {
      toast.error(error?.errorMessage || "Failed to update application status");
    }
  };

  const handleOpenEmailModal = (application) => {
    setSelectedApplication(application);
    // Pre-fill subject based on status
    const statusSubjects = {
      accepted: "Congratulations! Your Application Has Been Accepted",
      rejected: "Update on Your Job Application",
      reviewed: "Update on Your Job Application",
      pending: "Update on Your Job Application",
    };
    setEmailSubject(
      statusSubjects[application.status] || "Update on Your Job Application",
    );
    setEmailMessage("");
    setShowEmailModal(true);
  };

  const handleSendEmail = async () => {
    if (!emailSubject.trim() || !emailMessage.trim()) {
      toast.error("Please fill in both subject and message");
      return;
    }

    setSendingEmail(true);
    try {
      await dispatch(
        send_email_to_applicant({
          applicationId: selectedApplication._id,
          subject: emailSubject,
          message: emailMessage,
        }),
      ).unwrap();
      setShowEmailModal(false);
      setEmailSubject("");
      setEmailMessage("");
      setSelectedApplication(null);
    } catch (error) {
      toast.error(error?.errorMessage || "Failed to send email");
    } finally {
      setSendingEmail(false);
    }
  };

  const handleDownloadCV = async (cvFile, originalName) => {
    if (!cvFile) {
      toast.error("CV file not found");
      return;
    }

    // Extract filename from full URL path
    // cvFile can be: "https://domain.com/public/uploads/cv_files/filename.docx"
    // or: "public/uploads/cv_files/filename.docx"
    let storedFileName = cvFile.split(/[\\/]/).pop();

    // Remove query parameters if any
    storedFileName = storedFileName.split("?")[0];

    // If no filename extracted, try to get it from the path
    if (!storedFileName || storedFileName === cvFile) {
      // Try extracting from URL
      const urlMatch = cvFile.match(/[^/]+\.(pdf|doc|docx)$/i);
      if (urlMatch) {
        storedFileName = urlMatch[0];
      }
    }

    if (!storedFileName) {
      toast.error("Could not extract filename from CV file path");
      return;
    }

    const displayFileName = originalName || storedFileName || "cv-file";

    const downloadUrl = `${DOWNLOAD_URL}/api/download-file/${encodeURIComponent(
      storedFileName,
    )}?original=${encodeURIComponent(displayFileName)}`;

    try {
      const response = await fetch(downloadUrl, {
        method: "GET",
        mode: "cors",
        credentials: "include",
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        toast.error(
          `Failed to download CV file: ${response.status} ${response.statusText}`,
        );
        return;
      }

      // Check if response is actually a file (not JSON error)
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        const errorData = await response.json();
        toast.error(errorData.error || "Failed to download CV file");
        return;
      }

      const blob = await response.blob();

      // Check if blob is empty or too small (might be an error page)
      if (blob.size === 0) {
        toast.error("Downloaded file is empty");
        return;
      }

      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = displayFileName;
      link.style.display = "none";
      document.body.appendChild(link);
      link.click();

      // Clean up after a short delay to ensure download starts
      setTimeout(() => {
        document.body.removeChild(link);
        window.URL.revokeObjectURL(blobUrl);
      }, 100);

      toast.success("CV downloaded successfully");
    } catch (error) {
      // Only show error if it's not a network error that might have still worked
      if (error.name !== "TypeError" || !error.message.includes("fetch")) {
        toast.error("Failed to download CV file. Please check server logs.");
      }
      // Fallback: try opening in new tab
      window.open(downloadUrl, "_blank");
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "accepted":
        return "bg-green-100 text-green-700";
      case "rejected":
        return "bg-red-100 text-red-700";
      case "reviewed":
        return "bg-blue-100 text-blue-700";
      default:
        return "bg-yellow-100 text-yellow-700";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-primary-50/30 p-4 md:p-5">
      <div className="mx-auto max-w-7xl">
        <HeaderText title={"Job Applications"} />

        <div className="overflow-hidden rounded-2xl bg-white shadow-nature-medium ring-1 ring-primary-100">
          <div className="border-b border-primary-200 bg-gradient-to-r from-primary-50 to-secondary-50 p-5">
            <div className="relative mb-4">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                <FaSearch className="h-4 w-4 text-primary-700" />
              </div>
              <input
                type="text"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                placeholder="Search applications..."
                className="w-full rounded-full border-2 border-primary-200 bg-white py-2.5 pl-11 pr-4 text-sm text-text-dark outline-none transition-all placeholder:text-text-light focus:border-secondary focus:ring-2 focus:ring-secondary-200"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
              <div>
                <label className="mb-2 block text-sm font-semibold text-primary-800">
                  Filter by Job
                </label>
                <select
                  value={selectedJobId}
                  onChange={(e) => setSelectedJobId(e.target.value)}
                  className="w-full rounded-lg border-2 border-primary-200 bg-white px-4 py-2.5 text-sm text-text-dark focus:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary-200"
                >
                  <option value="">All Jobs</option>
                  {jobs.map((job) => (
                    <option key={job._id} value={job._id}>
                      {job.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-primary-800">
                  Filter by Status
                </label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full rounded-lg border-2 border-primary-200 bg-white px-4 py-2.5 text-sm text-text-dark focus:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary-200"
                >
                  <option value="">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="reviewed">Reviewed</option>
                  <option value="accepted">Accepted</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-primary-800">
                  Sort
                </label>
                <SortSelect sort={sort} setSort={setSort} />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-primary-800">
                  Show
                </label>
                <select
                  value={parPage}
                  onChange={(e) => setParPage(e.target.value)}
                  className="w-full rounded-lg border-2 border-primary-200 bg-white px-4 py-2.5 text-sm text-text-dark focus:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary-200"
                >
                  <option value="10">10</option>
                  <option value="20">20</option>
                  <option value="30">30</option>
                </select>
              </div>
            </div>

            <div className="mt-4 text-sm text-text-dark">
              Showing{" "}
              <span className="font-medium text-secondary">
                {applications.length}
              </span>{" "}
              of {totalApplications} applications
            </div>
          </div>

          {loader ? (
            <div className="flex h-64 items-center justify-center">
              <PropagateLoader
                cssOverride={overrideStyle}
                color="#36d7b7"
                size={15}
              />
            </div>
          ) : applications.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full table-auto">
                <thead>
                  <tr className="border-b border-primary-200 bg-gradient-to-r from-primary-50 to-secondary-50 text-left text-xs font-semibold uppercase tracking-wider text-primary-700">
                    <th className="px-4 py-3">No</th>
                    <th className="px-4 py-3">Applicant</th>
                    <th className="px-4 py-3">Job Title</th>
                    <th className="px-4 py-3">Email</th>
                    <th className="px-4 py-3">Phone</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Applied Date</th>
                    <th className="px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-primary-100">
                  {applications.map((app, i) => (
                    <tr
                      key={i}
                      className="group transition-colors hover:bg-primary-50/50"
                    >
                      <td className="px-4 py-3 text-sm text-text-dark">
                        {(currentPage - 1) * parPage + i + 1}
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm font-semibold text-primary-800">
                          {app.firstName} {app.lastName}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-text-dark">
                        {app.jobId?.title || "N/A"}
                      </td>
                      <td className="px-4 py-3 text-sm text-text-dark">
                        {app.email}
                      </td>
                      <td className="px-4 py-3 text-sm text-text-dark">
                        {app.phone}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {app.status === "accepted" ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
                              <FaCheck className="h-3 w-3" />
                              Accepted
                            </span>
                          ) : app.status === "rejected" ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-700">
                              <FaTimes className="h-3 w-3" />
                              Rejected
                            </span>
                          ) : (
                            <>
                              <button
                                onClick={() => handleStatusChange(app._id, "accepted", app)}
                                className="flex items-center gap-1 rounded-lg bg-green-100 px-3 py-1.5 text-xs font-medium text-green-700 transition-colors hover:bg-green-200"
                                title="Accept Application"
                              >
                                <FaCheck className="h-3 w-3" />
                                Accept
                              </button>
                              <button
                                onClick={() => handleStatusChange(app._id, "rejected", app)}
                                className="flex items-center gap-1 rounded-lg bg-red-100 px-3 py-1.5 text-xs font-medium text-red-700 transition-colors hover:bg-red-200"
                                title="Reject Application"
                              >
                                <FaTimes className="h-3 w-3" />
                                Reject
                              </button>
                              {app.status === "pending" && (
                                <button
                                  onClick={() => handleStatusChange(app._id, "reviewed")}
                                  className="rounded-lg bg-blue-100 px-3 py-1.5 text-xs font-medium text-blue-700 transition-colors hover:bg-blue-200"
                                  title="Mark as Reviewed"
                                >
                                  Review
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-text-dark">
                        {new Date(app.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleViewApplication(app._id)}
                            className="rounded-lg bg-primary-100 p-2 text-primary-700 transition-colors hover:bg-primary-200"
                            title="View Details"
                          >
                            <FaEye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleOpenEmailModal(app)}
                            className="rounded-lg bg-secondary-100 p-2 text-secondary-700 transition-colors hover:bg-secondary-200"
                            title="Send Email"
                          >
                            <FaEnvelope className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-8 text-center text-text-light">
              No applications found
            </div>
          )}

          {applications.length > 0 && (
            <div className="border-t border-primary-200 bg-neutral-50 p-5">
              <div className="flex justify-end">
                <Pagination
                  pageNumber={currentPage}
                  setPageNumber={setCurrentPage}
                  totalItem={totalApplications}
                  parPage={parPage}
                  showItem={3}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Application Details Modal */}
      {showModal && (selectedApplication || application) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-xl">
            <div className="border-b border-primary-200 bg-gradient-to-r from-primary via-primary-600 to-primary-700 px-6 py-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white">
                  Application Details
                </h2>
                <button
                  onClick={() => {
                    setShowModal(false);
                    setSelectedApplication(null);
                    dispatch(clearApplication());
                  }}
                  className="text-white hover:text-gray-200"
                >
                  ×
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-semibold text-primary-800">
                    Applicant Name
                  </h3>
                  <p className="text-text-dark">
                    {(selectedApplication || application).firstName}{" "}
                    {(selectedApplication || application).lastName}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-primary-800">
                    Email
                  </h3>
                  <p className="text-text-dark">
                    {(selectedApplication || application).email}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-primary-800">
                    Phone
                  </h3>
                  <p className="text-text-dark">
                    {(selectedApplication || application).phone}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-primary-800">
                    Job Applied For
                  </h3>
                  <p className="text-text-dark">
                    {(selectedApplication || application).jobId?.title || "N/A"}
                  </p>
                </div>
                {(selectedApplication || application).additionalDetails && (
                  <div>
                    <h3 className="text-sm font-semibold text-primary-800">
                      Additional Details
                    </h3>
                    <p className="text-text-dark">
                      {(selectedApplication || application).additionalDetails}
                    </p>
                  </div>
                )}
                {(selectedApplication || application).adminNotes && (
                  <div>
                    <h3 className="text-sm font-semibold text-primary-800">
                      Admin Notes
                    </h3>
                    <p className="text-text-dark whitespace-pre-wrap">
                      {(selectedApplication || application).adminNotes}
                    </p>
                  </div>
                )}
                {(selectedApplication || application).rejectedReason && (
                  <div>
                    <h3 className="text-sm font-semibold text-primary-800">
                      Rejection Reason
                    </h3>
                    <p className="text-text-dark whitespace-pre-wrap">
                      {(selectedApplication || application).rejectedReason}
                    </p>
                  </div>
                )}
                <div>
                  <h3 className="text-sm font-semibold text-primary-800">
                    CV File
                  </h3>
                  <button
                    onClick={() =>
                      handleDownloadCV(
                        (selectedApplication || application).cvFile,
                        (selectedApplication || application).cvOriginalName,
                      )
                    }
                    className="mt-2 rounded-lg bg-secondary px-4 py-2 text-white transition-colors hover:bg-secondary-600"
                  >
                    <FaDownload className="mr-2 inline" />
                    Download CV
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Send Email Modal */}
      {showEmailModal && selectedApplication && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white shadow-xl">
            <div className="border-b border-primary-200 bg-gradient-to-r from-primary via-primary-600 to-primary-700 px-6 py-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white">
                  Send Email to Applicant
                </h2>
                <button
                  onClick={() => {
                    setShowEmailModal(false);
                    setEmailSubject("");
                    setEmailMessage("");
                    setSelectedApplication(null);
                  }}
                  className="text-white hover:text-gray-200"
                >
                  ×
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="mb-4 rounded-lg border border-neutral-200 bg-neutral-50 p-4">
                <p className="text-sm font-semibold text-primary-800">
                  Applicant: {selectedApplication.firstName}{" "}
                  {selectedApplication.lastName}
                </p>
                <p className="text-sm text-text-dark">
                  Email: {selectedApplication.email}
                </p>
                <p className="text-sm text-text-dark">
                  Job: {selectedApplication.jobId?.title || "N/A"}
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-primary-800">
                    Subject *
                  </label>
                  <input
                    type="text"
                    value={emailSubject}
                    onChange={(e) => setEmailSubject(e.target.value)}
                    className="w-full rounded-lg border-2 border-primary-200 bg-white px-4 py-2.5 text-sm text-text-dark focus:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary-200"
                    placeholder="Email subject"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-primary-800">
                    Message *
                  </label>
                  <div className="rounded-lg border-2 border-primary-200 bg-white">
                    <ReactQuill
                      theme="snow"
                      value={emailMessage}
                      onChange={setEmailMessage}
                      modules={quillModules}
                      placeholder="Write your message here..."
                      style={{ minHeight: "300px" }}
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    onClick={() => {
                      setShowEmailModal(false);
                      setEmailSubject("");
                      setEmailMessage("");
                      setSelectedApplication(null);
                    }}
                    className="rounded-lg border-2 border-primary-200 bg-white px-6 py-2.5 font-semibold text-primary-700 transition-colors hover:bg-primary-50"
                    disabled={sendingEmail}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSendEmail}
                    disabled={
                      sendingEmail ||
                      !emailSubject.trim() ||
                      !emailMessage.trim()
                    }
                    className="rounded-lg bg-secondary px-6 py-2.5 font-semibold text-white transition-colors hover:bg-secondary-600 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {sendingEmail ? (
                      <PropagateLoader
                        cssOverride={overrideStyle}
                        color="#ffffff"
                        size={8}
                      />
                    ) : (
                      "Send Email"
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Accept/Reject Modal */}
      {showRejectModal && selectedApplication && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-xl">
            <div
              className={`border-b px-6 py-4 ${
                pendingStatus === "rejected"
                  ? "bg-gradient-to-r from-red-600 to-red-700"
                  : "bg-gradient-to-r from-green-600 to-green-700"
              }`}
            >
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white">
                  {pendingStatus === "rejected"
                    ? "Reject Application"
                    : "Accept Application"}
                </h2>
                <button
                  onClick={() => {
                    setShowRejectModal(false);
                    setRejectionReason("");
                    setAdminNotes("");
                    setSelectedApplication(null);
                    setPendingStatus(null);
                  }}
                  className="text-white hover:text-gray-200"
                >
                  ×
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="mb-4 rounded-lg border border-neutral-200 bg-neutral-50 p-4">
                <p className="text-sm font-semibold text-primary-800">
                  Applicant: {selectedApplication.firstName}{" "}
                  {selectedApplication.lastName}
                </p>
                <p className="text-sm text-text-dark">
                  Email: {selectedApplication.email}
                </p>
                <p className="text-sm text-text-dark">
                  Job: {selectedApplication.jobId?.title || "N/A"}
                </p>
              </div>

              <div className="space-y-4">
                {pendingStatus === "rejected" && (
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-primary-800">
                      Rejection Reason *
                    </label>
                    <textarea
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      className="w-full rounded-lg border-2 border-primary-200 bg-white px-4 py-2.5 text-sm text-text-dark focus:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary-200"
                      placeholder="Please provide a reason for rejection..."
                      rows={4}
                      required
                    />
                    <p className="mt-1 text-xs text-text-light">
                      This reason will be included in the email sent to the
                      applicant.
                    </p>
                  </div>
                )}

                <div>
                  <label className="mb-2 block text-sm font-semibold text-primary-800">
                    Admin Notes (Optional)
                  </label>
                  <textarea
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    className="w-full rounded-lg border-2 border-primary-200 bg-white px-4 py-2.5 text-sm text-text-dark focus:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary-200"
                    placeholder="Add any additional notes or information..."
                    rows={4}
                  />
                  <p className="mt-1 text-xs text-text-light">
                    These notes will be included in the email sent to the
                    applicant.
                  </p>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    onClick={() => {
                      setShowRejectModal(false);
                      setRejectionReason("");
                      setAdminNotes("");
                      setSelectedApplication(null);
                    }}
                    className="rounded-lg border-2 border-primary-200 bg-white px-6 py-2.5 font-semibold text-primary-700 transition-colors hover:bg-primary-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirmStatusChange}
                    disabled={
                      pendingStatus === "rejected" &&
                      !rejectionReason.trim()
                    }
                    className={`rounded-lg px-6 py-2.5 font-semibold text-white transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
                      pendingStatus === "rejected"
                        ? "bg-red-600 hover:bg-red-700"
                        : "bg-green-600 hover:bg-green-700"
                    }`}
                  >
                    {pendingStatus === "rejected"
                      ? "Confirm Rejection"
                      : "Confirm Acceptance"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobApplications;
