"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  FaCheck,
  FaClock,
  FaTimes,
  FaUser,
  FaCalendar,
  FaMapMarkerAlt,
  FaUsers,
  FaTag,
  FaExclamationTriangle,
  FaEye,
  FaInfoCircle,
} from "react-icons/fa";
import toast from "react-hot-toast";
import { PropagateLoader } from "react-spinners";
import { overrideStyle } from "../../utils/utilis";
import HeaderText from "./HeaderText";
import Pagination from "../Pagination";
import Search from "../components/Search";
import {
  getAllUrgentBookingRequests,
  updateRequestStatus,
  bulkUpdateRequestStatus,
  getRequestStats,
  clearMessage,
} from "../../store/Reducers/urgentBookingRequestReducer";

// Confirm Modal with reason input
const ConfirmModal = ({
  open,
  onConfirm,
  onCancel,
  message,
  showReasonInput = false,
  reasonLabel = "Reason",
  reasonValue = "",
  onReasonChange = () => { },
  showNotesInput = false,
  notesLabel = "Admin Notes",
  notesValue = "",
  onNotesChange = () => { },
}) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-primary-900/20 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-nature-large ring-1 ring-primary-200">
        <h2 className="mb-4 text-lg font-bold text-accent">Confirm Action</h2>
        <p className="mb-4 text-text-dark">{message}</p>

        {showReasonInput && (
          <div className="mb-4">
            <label className="mb-2 block text-sm font-medium text-text-dark">
              {reasonLabel} *
            </label>
            <textarea
              value={reasonValue}
              onChange={(e) => onReasonChange(e.target.value)}
              className="w-full rounded-lg border border-primary-200 px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent-200"
              rows={3}
              placeholder="Enter reason for rejection..."
              required
            />
          </div>
        )}

        {showNotesInput && (
          <div className="mb-4">
            <label className="mb-2 block text-sm font-medium text-text-dark">
              {notesLabel}
            </label>
            <textarea
              value={notesValue}
              onChange={(e) => onNotesChange(e.target.value)}
              className="w-full rounded-lg border border-primary-200 px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent-200"
              rows={3}
              placeholder="Add admin notes (optional)..."
            />
          </div>
        )}

        <div className="flex justify-end gap-3">
          <button
            className="rounded-xl bg-neutral-200 px-4 py-2 font-medium text-text-dark transition-all hover:bg-neutral-300"
            onClick={onCancel}
          >
            Cancel
          </button>
          <button
            className="rounded-xl bg-gradient-to-r from-accent to-accent-600 px-4 py-2 font-semibold text-white shadow-sm transition-all hover:scale-105"
            onClick={onConfirm}
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

const UrgentBookingRequests = () => {
  const dispatch = useDispatch();
  const { requests, stats, pagination, loader, successMessage, errorMessage } =
    useSelector((state) => state.urgentBookingRequest);
  const [currentPage, setCurrentPage] = useState(1);
  const [parPage, setParPage] = useState(10);
  const [searchValue, setSearchValue] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedIds, setSelectedIds] = useState([]);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [adminNotes, setAdminNotes] = useState("");
  const [selectedRequestId, setSelectedRequestId] = useState(null);
  const [selectedAction, setSelectedAction] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);

  // Fetch requests
  const fetchRequests = () => {
    dispatch(
      getAllUrgentBookingRequests({
        page: currentPage,
        limit: parPage,
        searchValue,
        status: statusFilter,
        sortBy: "createdAt",
        sortOrder: "desc",
      }),
    );
  };

  useEffect(() => {
    fetchRequests();
    dispatch(getRequestStats());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, parPage, searchValue, statusFilter]);

  // Show success/error messages
  useEffect(() => {
    if (successMessage) {
      toast.success(successMessage);
      dispatch(clearMessage());
      fetchRequests();
    }
    if (errorMessage) {
      toast.error(errorMessage);
      dispatch(clearMessage());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [successMessage, errorMessage, dispatch]);

  // Update request status
  const handleUpdateStatus = (
    requestId,
    newStatus,
    reason = "",
    notes = "",
  ) => {
    dispatch(
      updateRequestStatus({
        requestId,
        status: newStatus,
        rejectedReason: reason,
        adminNotes: notes,
      }),
    );
  };

  // Bulk actions
  const handleBulkAction = (action) => {
    if (selectedIds.length === 0) {
      toast.error("Please select requests first");
      return;
    }

    if (action === "rejected" && !rejectionReason.trim()) {
      toast.error("Please provide a rejection reason");
      return;
    }

    dispatch(
      bulkUpdateRequestStatus({
        requestIds: selectedIds,
        status: action,
        rejectedReason: action === "rejected" ? rejectionReason.trim() : "",
        adminNotes: adminNotes,
      }),
    );
    setSelectedIds([]);
    setRejectionReason("");
    setAdminNotes("");
  };

  // Checkbox handlers
  const isAllSelected =
    requests.length > 0 && selectedIds.length === requests.length;
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(requests.map((r) => r._id));
    } else {
      setSelectedIds([]);
    }
  };
  const handleSelectRow = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((sid) => sid !== id) : [...prev, id],
    );
  };

  // Get status badge color
  const getStatusColor = (status) => {
    switch (status) {
      case "approved":
        return "bg-success-100 text-success-700";
      case "pending":
        return "bg-sunshine-100 text-sunshine-700";
      case "rejected":
        return "bg-accent-100 text-accent-700";
      default:
        return "bg-neutral-100 text-neutral-700";
    }
  };

  // Get category display name
  const getCategoryDisplayName = (category) => {
    const categoryMap = {
      standard: "Budget",
      midRange: "Mid-Range",
      luxury: "Luxury",
    };
    return categoryMap[category] || category;
  };

  // Format date
  const formatDate = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const startIndex = (currentPage - 1) * parPage;

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-primary-50/30 p-4 md:p-5 overflow-x-hidden">
      {/* Details Modal - View Admin Notes and Rejection Reason */}
      {showDetailsModal && selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-xl">
            <div className="border-b border-primary-200 bg-gradient-to-r from-primary via-primary-600 to-primary-700 px-6 py-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white">
                  Request Details
                </h2>
                <button
                  onClick={() => {
                    setShowDetailsModal(false);
                    setSelectedRequest(null);
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
                  Customer:{" "}
                  {selectedRequest.personalInfo?.firstName &&
                    selectedRequest.personalInfo?.lastName
                    ? `${selectedRequest.personalInfo.firstName} ${selectedRequest.personalInfo.lastName}`
                    : selectedRequest.customerId?.name || "Unknown"}
                </p>
                <p className="text-sm text-text-dark">
                  Email:{" "}
                  {selectedRequest.personalInfo?.email ||
                    selectedRequest.customerId?.email}
                </p>
                <p className="text-sm text-text-dark">
                  Trip:{" "}
                  {selectedRequest.tripTitle ||
                    selectedRequest.tripId?.mainTitle ||
                    "N/A"}
                </p>
                <p className="text-sm text-text-dark">
                  Status:{" "}
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-semibold ${getStatusColor(selectedRequest.status)}`}
                  >
                    {selectedRequest.status}
                  </span>
                </p>
              </div>

              <div className="space-y-4">
                {selectedRequest.rejectedReason && (
                  <div>
                    <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-primary-800">
                      <FaInfoCircle className="h-4 w-4 text-red-500" />
                      Rejection Reason
                    </h3>
                    <div className="rounded-lg border-2 border-red-200 bg-red-50 p-4">
                      <p className="whitespace-pre-wrap text-sm text-red-900">
                        {selectedRequest.rejectedReason}
                      </p>
                    </div>
                  </div>
                )}

                {selectedRequest.adminNotes ? (
                  <div>
                    <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-primary-800">
                      <FaInfoCircle className={`h-4 w-4 ${selectedRequest.status === "approved" ? "text-green-500" : "text-blue-500"}`} />
                      Admin Notes
                      {selectedRequest.status === "approved" && (
                        <span className="ml-2 rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-700">
                          Approved
                        </span>
                      )}
                    </h3>
                    <div className={`rounded-lg border-2 p-4 ${selectedRequest.status === "approved" ? "border-green-200 bg-green-50" : "border-blue-200 bg-blue-50"}`}>
                      <p className={`whitespace-pre-wrap text-sm ${selectedRequest.status === "approved" ? "text-green-900" : "text-blue-900"}`}>
                        {selectedRequest.adminNotes}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-lg border-2 border-neutral-200 bg-neutral-50 p-4 text-center">
                    <p className="text-sm text-text-light">
                      No admin notes available for this request.
                    </p>
                  </div>
                )}

                {!selectedRequest.rejectedReason &&
                  !selectedRequest.adminNotes && (
                    <div className="rounded-lg border-2 border-neutral-200 bg-neutral-50 p-4 text-center">
                      <p className="text-sm text-text-light">
                        No additional details available for this request.
                      </p>
                    </div>
                  )}
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => {
                    setShowDetailsModal(false);
                    setSelectedRequest(null);
                  }}
                  className="rounded-lg border-2 border-primary-200 bg-white px-6 py-2.5 font-semibold text-primary-700 transition-colors hover:bg-primary-50"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Modal */}
      <ConfirmModal
        open={confirmOpen}
        message={
          selectedAction === "rejected"
            ? "Are you sure you want to reject this request? Please provide a reason."
            : selectedAction === "approved"
              ? "Are you sure you want to approve this request? The user will be able to proceed with checkout."
              : "Are you sure you want to perform this action?"
        }
        showReasonInput={selectedAction === "rejected"}
        reasonLabel="Rejection Reason"
        reasonValue={rejectionReason}
        onReasonChange={setRejectionReason}
        showNotesInput={
          selectedAction === "approved" || selectedAction === "rejected"
        }
        notesLabel="Admin Notes"
        notesValue={adminNotes}
        onNotesChange={setAdminNotes}
        onCancel={() => {
          setConfirmOpen(false);
          setSelectedRequestId(null);
          setSelectedAction(null);
          setRejectionReason("");
          setAdminNotes("");
        }}
        onConfirm={() => {
          if (!selectedRequestId || !selectedAction) return;

          if (selectedAction === "rejected" && !rejectionReason.trim()) {
            toast.error("Please provide a rejection reason");
            return;
          }

          if (selectedRequestId === "bulk") {
            // Handle bulk action
            handleBulkAction(selectedAction);
          } else {
            // Handle single action
            handleUpdateStatus(
              selectedRequestId,
              selectedAction,
              selectedAction === "rejected" ? rejectionReason.trim() : "",
              adminNotes,
            );
          }

          setConfirmOpen(false);
          setSelectedRequestId(null);
          setSelectedAction(null);
          setRejectionReason("");
          setAdminNotes("");
        }}
      />

      <div className="mx-auto max-w-full">
        <HeaderText title="Urgent Booking Requests" />

        {/* Stats Cards */}
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <div className="rounded-2xl bg-gradient-to-br from-primary via-primary-600 to-primary-700 p-6 shadow-nature-soft">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/90">Total Requests</p>
                <h3 className="text-3xl font-bold text-white">{stats.total}</h3>
              </div>
              <FaExclamationTriangle className="text-4xl text-sunshine-300" />
            </div>
          </div>

          <div className="rounded-2xl bg-gradient-to-br from-sunshine via-sunshine-500 to-sunshine-600 p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/90">Pending</p>
                <h3 className="text-3xl font-bold text-white">
                  {stats.pending}
                </h3>
              </div>
              <FaClock className="text-4xl text-white" />
            </div>
          </div>

          <div className="rounded-2xl bg-gradient-to-br from-success via-success-500 to-success-600 p-6 shadow-nature-soft">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/90">Approved</p>
                <h3 className="text-3xl font-bold text-white">
                  {stats.approved}
                </h3>
              </div>
              <FaCheck className="text-4xl text-white" />
            </div>
          </div>

          <div className="rounded-2xl bg-gradient-to-br from-accent via-accent-500 to-accent-600 p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/90">Rejected</p>
                <h3 className="text-3xl font-bold text-white">
                  {stats.rejected}
                </h3>
              </div>
              <FaTimes className="text-4xl text-white" />
            </div>
          </div>

          <div className="rounded-2xl bg-gradient-to-br from-red-500 via-red-600 to-red-700 p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/90">Urgent</p>
                <h3 className="text-3xl font-bold text-white">
                  {stats.urgent || 0}
                </h3>
              </div>
              <FaExclamationTriangle className="text-4xl text-white" />
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl bg-white shadow-nature-medium ring-1 ring-primary-100 w-full">
          {/* Filters Section */}
          <div className="border-b border-primary-200 bg-gradient-to-r from-primary-50 to-secondary-50 p-4 md:p-6">
            <div className="mb-4 flex flex-wrap gap-4">
              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="rounded-xl border-2 border-primary-200 bg-white px-4 py-2 text-text-dark focus:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary-200"
              >
                <option value="">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            <Search
              setParPage={setParPage}
              setSearchValue={setSearchValue}
              searchValue={searchValue}
            />

            {/* Bulk Actions */}
            {selectedIds.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  className="rounded-xl bg-gradient-to-r from-success to-success-600 px-4 py-2 font-semibold text-white shadow-nature-soft transition-all hover:scale-105 hover:shadow-nature-medium"
                  onClick={() => {
                    setSelectedAction("approved");
                    setSelectedRequestId("bulk");
                    setRejectionReason("");
                    setAdminNotes("");
                    setConfirmOpen(true);
                  }}
                >
                  Approve ({selectedIds.length})
                </button>
                <button
                  className="rounded-xl bg-gradient-to-r from-red-500 to-red-600 px-4 py-2 font-semibold text-white shadow-sm transition-all hover:scale-105"
                  onClick={() => {
                    setSelectedAction("rejected");
                    setSelectedRequestId("bulk");
                    setRejectionReason("");
                    setAdminNotes("");
                    setConfirmOpen(true);
                  }}
                >
                  Reject ({selectedIds.length})
                </button>
              </div>
            )}
          </div>

          {/* Table Section */}
          <div className="overflow-x-auto w-full">
            {loader ? (
              <div className="flex h-64 items-center justify-center">
                <PropagateLoader
                  cssOverride={overrideStyle}
                  color="#E76F51"
                  size={15}
                />
              </div>
            ) : (
              <table className="w-full table-fixed min-w-full">
                <colgroup>
                  <col className="w-12" /> {/* Checkbox */}
                  <col className="w-12" /> {/* No */}
                  <col className="w-32" /> {/* Request ID */}
                  <col className="w-40" /> {/* Customer */}
                  <col className="w-48" /> {/* Trip */}
                  <col className="w-28" /> {/* Date */}
                  <col className="w-24" /> {/* Days Until */}
                  <col className="w-28" /> {/* Package */}
                  <col className="w-20" /> {/* Travelers */}
                  <col className="w-28" /> {/* Status */}
                  <col className="w-32" /> {/* Actions */}
                </colgroup>
                <thead>
                  <tr className="border-b border-primary-200 bg-gradient-to-r from-primary-50 to-secondary-50">
                    <th className="px-2 py-3">
                      <input
                        type="checkbox"
                        checked={isAllSelected}
                        onChange={handleSelectAll}
                        className="h-4 w-4 rounded border-primary-300 text-secondary accent-secondary focus:ring-secondary"
                      />
                    </th>
                    <th className="px-2 py-3 text-left text-xs font-bold uppercase text-primary-700">
                      #
                    </th>
                    <th className="px-2 py-3 text-left text-xs font-bold uppercase text-primary-700">
                      ID
                    </th>
                    <th className="px-2 py-3 text-left text-xs font-bold uppercase text-primary-700">
                      Customer
                    </th>
                    <th className="px-2 py-3 text-left text-xs font-bold uppercase text-primary-700">
                      Trip
                    </th>
                    <th className="px-2 py-3 text-left text-xs font-bold uppercase text-primary-700">
                      Date
                    </th>
                    <th className="px-2 py-3 text-left text-xs font-bold uppercase text-primary-700">
                      Days
                    </th>
                    <th className="px-2 py-3 text-left text-xs font-bold uppercase text-primary-700">
                      Package
                    </th>
                    <th className="px-2 py-3 text-left text-xs font-bold uppercase text-primary-700">
                      Ppl
                    </th>
                    <th className="px-2 py-3 text-left text-xs font-bold uppercase text-primary-700">
                      Status
                    </th>
                    <th className="px-2 py-3 text-left text-xs font-bold uppercase text-primary-700 sticky right-0 bg-gradient-to-r from-primary-50 to-secondary-50">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-primary-100">
                  {requests.map((request, i) => (
                    <tr
                      key={request._id}
                      className="group bg-white transition-colors hover:bg-primary-50/50"
                    >
                      <td className="px-2 py-3">
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(request._id)}
                          onChange={() => handleSelectRow(request._id)}
                          className="h-4 w-4 rounded border-primary-300 text-secondary accent-secondary focus:ring-secondary"
                        />
                      </td>
                      <td className="px-2 py-3 text-center">
                        <div className="shadow-coral-soft flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-r from-secondary to-sunshine-400 text-xs font-bold text-white transition-all duration-300 group-hover:scale-110">
                          {startIndex + i + 1}
                        </div>
                      </td>
                      <td className="px-2 py-3">
                        <div className="flex items-center gap-1">
                          <span 
                            className="font-mono text-xs text-text-dark truncate" 
                            title={request._id}
                          >
                            {request._id.length > 12 
                              ? `${request._id.substring(0, 8)}...` 
                              : request._id}
                          </span>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(request._id);
                              toast.success("Request ID copied!");
                            }}
                            className="text-primary-600 hover:text-primary-800 flex-shrink-0"
                            title={`Copy: ${request._id}`}
                          >
                            <FaInfoCircle className="h-3 w-3" />
                          </button>
                        </div>
                      </td>
                      <td className="px-2 py-3">
                        <div className="flex items-center gap-2 min-w-0">
                          {request.customerId?.image ? (
                            <img
                              src={request.customerId.image}
                              alt={request.customerId.name}
                              className="h-8 w-8 flex-shrink-0 rounded-full object-cover ring-2 ring-primary-200"
                            />
                          ) : (
                            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-neutral-200">
                              <FaUser className="h-4 w-4 text-neutral-500" />
                            </div>
                          )}
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-xs font-semibold text-primary-800" title={
                              request.personalInfo?.firstName &&
                              request.personalInfo?.lastName
                                ? `${request.personalInfo.firstName} ${request.personalInfo.lastName}`
                                : request.customerId?.name || "Unknown"
                            }>
                              {request.personalInfo?.firstName &&
                                request.personalInfo?.lastName
                                ? `${request.personalInfo.firstName} ${request.personalInfo.lastName}`
                                : request.customerId?.name || "Unknown"}
                            </p>
                            <p className="truncate text-xs text-text-light" title={
                              request.personalInfo?.email ||
                              request.customerId?.email
                            }>
                              {request.personalInfo?.email ||
                                request.customerId?.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-2 py-3">
                        <p 
                          className="truncate text-xs font-semibold text-text-dark" 
                          title={request.tripTitle ||
                            request.tripId?.mainTitle ||
                            "N/A"}
                        >
                          {request.tripTitle ||
                            request.tripId?.mainTitle ||
                            "N/A"}
                        </p>
                        <p className="truncate text-xs text-text-light">
                          {request.categoryName || ""}
                        </p>
                      </td>
                      <td className="px-2 py-3">
                        <div className="flex items-center gap-1 text-xs text-text-dark">
                          <FaCalendar className="h-3 w-3 flex-shrink-0 text-primary-400" />
                          <span className="whitespace-nowrap">{formatDate(request.requestedDate)}</span>
                        </div>
                      </td>
                      <td className="px-2 py-3">
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold whitespace-nowrap ${request.daysUntilTrip < 1
                            ? "bg-red-100 text-red-700"
                            : request.daysUntilTrip < 4
                              ? "bg-orange-100 text-orange-700"
                              : "bg-neutral-100 text-neutral-700"
                            }`}
                        >
                          {request.daysUntilTrip}
                        </span>
                      </td>
                      <td className="px-2 py-3">
                        <div className="flex items-center gap-1 text-xs text-text-dark">
                          <FaTag className="h-3 w-3 flex-shrink-0 text-primary-400" />
                          <span className="truncate">
                            {getCategoryDisplayName(request.selectedCategory)}
                          </span>
                        </div>
                      </td>
                      <td className="px-2 py-3 text-center">
                        <div className="flex items-center justify-center gap-1 text-xs text-text-dark">
                          <FaUsers className="h-3 w-3 text-primary-400" />
                          <span>{request.travelersNumber}</span>
                        </div>
                      </td>
                      <td className="px-2 py-3">
                        <div className="flex items-center gap-1">
                          <span
                            className={`rounded-full px-2 py-0.5 text-xs font-semibold whitespace-nowrap ${getStatusColor(request.status)}`}
                          >
                            {request.status}
                          </span>
                          {((request.status === "rejected" && (request.rejectedReason || request.adminNotes)) ||
                            (request.status === "approved" && request.adminNotes)) && (
                            <button
                              onClick={() => {
                                setSelectedRequest(request);
                                setShowDetailsModal(true);
                              }}
                              className="rounded-lg bg-primary-100 p-1 text-primary-700 transition-colors hover:bg-primary-200 flex-shrink-0"
                              title="View Details"
                            >
                              <FaEye className="h-3 w-3" />
                            </button>
                          )}
                        </div>
                      </td>
                      <td className="px-2 py-3 sticky right-0 bg-white group-hover:bg-primary-50/50">
                        <div className="flex gap-1 justify-end">
                          {request.status !== "approved" && (
                            <button
                              onClick={() => {
                                setSelectedRequestId(request._id);
                                setSelectedAction("approved");
                                setConfirmOpen(true);
                              }}
                              className="rounded-lg bg-gradient-to-r from-success to-success-600 p-1.5 text-white shadow-nature-soft transition-all hover:scale-110 hover:shadow-nature-medium flex-shrink-0"
                              title="Approve"
                            >
                              <FaCheck className="h-3 w-3" />
                            </button>
                          )}
                          {request.status !== "rejected" && (
                            <button
                              onClick={() => {
                                setSelectedRequestId(request._id);
                                setSelectedAction("rejected");
                                setConfirmOpen(true);
                              }}
                              className="rounded-lg bg-gradient-to-r from-red-500 to-red-600 p-1.5 text-white shadow-sm transition-all hover:scale-110 flex-shrink-0"
                              title="Reject"
                            >
                              <FaTimes className="h-3 w-3" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Pagination */}
          <div className="border-t border-primary-200 bg-neutral-50 p-6">
            <div className="flex justify-end">
              <Pagination
                pageNumber={currentPage}
                setPageNumber={setCurrentPage}
                totalItem={pagination.totalRequests}
                parPage={parPage}
                showItem={3}
              />
            </div>
          </div>
        </div>

        {/* Empty State */}
        {!loader && requests.length === 0 && (
          <div className="mt-8 text-center">
            <div className="rounded-2xl bg-white p-12 shadow-nature-medium ring-1 ring-primary-100">
              <FaExclamationTriangle className="mx-auto mb-6 text-6xl text-sunshine-500" />
              <h3 className="mb-2 text-2xl font-bold text-primary-800">
                No requests found
              </h3>
              <p className="text-text">
                {searchValue
                  ? `No requests match your search for "${searchValue}"`
                  : "No urgent booking requests available yet"}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UrgentBookingRequests;
