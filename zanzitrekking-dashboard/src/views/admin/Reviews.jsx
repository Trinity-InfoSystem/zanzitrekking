"use client";

import { useEffect, useState } from "react";
import {
  FaCheck,
  FaClock,
  FaTimes,
  FaTrash,
  FaStar,
  FaUser,
} from "react-icons/fa";
import toast from "react-hot-toast";
import { PropagateLoader } from "react-spinners";
import { overrideStyle } from "../../utils/utilis";
import HeaderText from "./HeaderText";
import api from "../../api/api";
import Pagination from "../Pagination";
import Search from "../components/Search";

// Confirm Modal
const ConfirmModal = ({ open, onConfirm, onCancel, message }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-primary-900/20 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-nature-large ring-1 ring-primary-200">
        <h2 className="mb-4 text-lg font-bold text-accent">Confirm Action</h2>
        <p className="mb-6 text-text-dark">{message}</p>
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

const Reviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    approved: 0,
    pending: 0,
    rejected: 0,
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [parPage, setParPage] = useState(10);
  const [totalReviews, setTotalReviews] = useState(0);
  const [searchValue, setSearchValue] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedIds, setSelectedIds] = useState([]);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);

  // Fetch reviews
  const fetchReviews = async () => {
    setLoading(true);
    try {
      const params = {
        page: currentPage,
        limit: parPage,
        searchValue,
        sortBy: "createdAt",
        sortOrder: "desc",
      };
      if (statusFilter) params.status = statusFilter;

      const response = await api.get("/admin/reviews", { params });
      setReviews(response.data.reviews);
      setTotalReviews(response.data.pagination.totalReviews);
      setStats(response.data.stats);
    } catch (error) {
      console.error("Error fetching reviews:", error);
      toast.error("Failed to load reviews");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [currentPage, parPage, searchValue, statusFilter]);

  // Update review status
  const updateStatus = async (reviewId, newStatus) => {
    try {
      await api.put(`/admin/reviews/${reviewId}/status`, { status: newStatus });
      toast.success(`Review ${newStatus} successfully`);
      fetchReviews();
    } catch (error) {
      console.error("Error updating review:", error);
      toast.error("Failed to update review");
    }
  };

  // Delete review
  const deleteReview = async (reviewId) => {
    try {
      await api.delete(`/admin/reviews/${reviewId}`);
      toast.success("Review deleted successfully");
      fetchReviews();
    } catch (error) {
      console.error("Error deleting review:", error);
      toast.error("Failed to delete review");
    }
  };

  // Bulk actions
  const handleBulkAction = async (action) => {
    if (selectedIds.length === 0) {
      toast.error("Please select reviews first");
      return;
    }

    try {
      if (action === "delete") {
        await api.post("/admin/reviews/bulk-delete", {
          reviewIds: selectedIds,
        });
        toast.success(`${selectedIds.length} reviews deleted`);
      } else {
        await api.post("/admin/reviews/bulk-update", {
          reviewIds: selectedIds,
          status: action,
        });
        toast.success(`${selectedIds.length} reviews updated to ${action}`);
      }
      setSelectedIds([]);
      fetchReviews();
    } catch (error) {
      console.error("Error performing bulk action:", error);
      toast.error("Failed to perform action");
    }
  };

  // Checkbox handlers
  const isAllSelected =
    reviews.length > 0 && selectedIds.length === reviews.length;
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(reviews.map((r) => r._id));
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

  const startIndex = (currentPage - 1) * parPage;

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-primary-50/30 p-4 md:p-5">
      {/* Confirm Modal */}
      <ConfirmModal
        open={confirmOpen}
        message="Are you sure you want to perform this action?"
        onCancel={() => {
          setConfirmOpen(false);
          setConfirmAction(null);
        }}
        onConfirm={() => {
          if (confirmAction) {
            confirmAction();
            setConfirmOpen(false);
            setConfirmAction(null);
          }
        }}
      />

      <div className="mx-auto max-w-7xl">
        <HeaderText title="Reviews Management" />

        {/* Stats Cards */}
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl bg-gradient-to-br from-primary via-primary-600 to-primary-700 p-6 shadow-nature-soft">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/90">Total Reviews</p>
                <h3 className="text-3xl font-bold text-white">{stats.total}</h3>
              </div>
              <FaStar className="text-4xl text-sunshine-300" />
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
        </div>

        <div className="overflow-hidden rounded-2xl bg-white shadow-nature-medium ring-1 ring-primary-100">
          {/* Filters Section */}
          <div className="border-b border-primary-200 bg-gradient-to-r from-primary-50 to-secondary-50 p-6">
            <div className="mb-4 flex flex-wrap gap-4">
              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="rounded-xl border-2 border-primary-200 bg-white px-4 py-2 text-text-dark focus:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary-200"
              >
                <option value="">All Status</option>
                <option value="approved">Approved</option>
                <option value="pending">Pending</option>
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
                    setConfirmAction(() => () => handleBulkAction("approved"));
                    setConfirmOpen(true);
                  }}
                >
                  Approve ({selectedIds.length})
                </button>
                <button
                  className="rounded-xl bg-gradient-to-r from-sunshine to-sunshine-600 px-4 py-2 font-semibold text-white shadow-sm transition-all hover:scale-105"
                  onClick={() => {
                    setConfirmAction(() => () => handleBulkAction("pending"));
                    setConfirmOpen(true);
                  }}
                >
                  Set Pending ({selectedIds.length})
                </button>
                <button
                  className="rounded-xl bg-gradient-to-r from-red-500 to-red-600 px-4 py-2 font-semibold text-white shadow-sm transition-all hover:scale-105"
                  onClick={() => {
                    setConfirmAction(() => () => handleBulkAction("rejected"));
                    setConfirmOpen(true);
                  }}
                >
                  Reject ({selectedIds.length})
                </button>
                <button
                  className="rounded-xl bg-gradient-to-r from-accent to-accent-600 px-4 py-2 font-semibold text-white shadow-sm transition-all hover:scale-105"
                  onClick={() => {
                    setConfirmAction(() => () => handleBulkAction("delete"));
                    setConfirmOpen(true);
                  }}
                >
                  Delete ({selectedIds.length})
                </button>
              </div>
            )}
          </div>

          {/* Table Section */}
          <div className="overflow-x-auto">
            {loading ? (
              <div className="flex h-64 items-center justify-center">
                <PropagateLoader
                  cssOverride={overrideStyle}
                  color="#E76F51"
                  size={15}
                />
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-primary-200 bg-gradient-to-r from-primary-50 to-secondary-50">
                    <th className="px-4 py-4">
                      <input
                        type="checkbox"
                        checked={isAllSelected}
                        onChange={handleSelectAll}
                        className="h-4 w-4 rounded border-primary-300 text-secondary accent-secondary focus:ring-secondary"
                      />
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-bold uppercase text-primary-700">
                      No
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-bold uppercase text-primary-700">
                      Customer
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-bold uppercase text-primary-700">
                      Trip
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-bold uppercase text-primary-700">
                      Rating
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-bold uppercase text-primary-700">
                      Review
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-bold uppercase text-primary-700">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-bold uppercase text-primary-700">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-primary-100">
                  {reviews.map((review, i) => (
                    <tr
                      key={review._id}
                      className="group bg-white transition-colors hover:bg-primary-50/50"
                    >
                      <td className="px-4 py-4">
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(review._id)}
                          onChange={() => handleSelectRow(review._id)}
                          className="h-4 w-4 rounded border-primary-300 text-secondary accent-secondary focus:ring-secondary"
                        />
                      </td>
                      <td className="px-6 py-4 text-sm font-medium">
                        <div className="shadow-coral-soft flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-r from-secondary to-sunshine-400 font-bold text-white transition-all duration-300 group-hover:scale-110">
                          {startIndex + i + 1}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          {review.customerId?.image ? (
                            <img
                              src={review.customerId.image}
                              alt={review.customerId.name}
                              className="h-10 w-10 rounded-full object-cover ring-2 ring-primary-200"
                            />
                          ) : (
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-200">
                              <FaUser className="text-neutral-500" />
                            </div>
                          )}
                          <div>
                            <p className="font-semibold text-primary-800">
                              {review.customerId?.name || "Unknown"}
                            </p>
                            <p className="text-xs text-text-light">
                              {review.customerId?.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-text-dark">
                          {review.tripId?.mainTitle || "N/A"}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-1">
                          {[...Array(5)].map((_, index) => (
                            <FaStar
                              key={index}
                              className={
                                index < review.rating
                                  ? "text-sunshine-500"
                                  : "text-neutral-300"
                              }
                            />
                          ))}
                        </div>
                      </td>
                      <td className="max-w-xs px-6 py-4">
                        <p className="font-semibold text-primary-800">
                          {review.title}
                        </p>
                        <p className="truncate text-sm text-text">
                          {review.comment}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusColor(review.status)}`}
                        >
                          {review.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          {review.status !== "approved" && (
                            <button
                              onClick={() =>
                                updateStatus(review._id, "approved")
                              }
                              className="rounded-lg bg-gradient-to-r from-success to-success-600 p-2 text-white shadow-nature-soft transition-all hover:scale-110 hover:shadow-nature-medium"
                              title="Approve"
                            >
                              <FaCheck />
                            </button>
                          )}
                          {review.status !== "pending" && (
                            <button
                              onClick={() =>
                                updateStatus(review._id, "pending")
                              }
                              className="rounded-lg bg-gradient-to-r from-sunshine to-sunshine-600 p-2 text-white shadow-sm transition-all hover:scale-110"
                              title="Set to Pending"
                            >
                              <FaClock />
                            </button>
                          )}
                          {review.status !== "rejected" && (
                            <button
                              onClick={() =>
                                updateStatus(review._id, "rejected")
                              }
                              className="rounded-lg bg-gradient-to-r from-red-500 to-red-600 p-2 text-white shadow-sm transition-all hover:scale-110"
                              title="Reject"
                            >
                              <FaTimes />
                            </button>
                          )}
                          <button
                            onClick={() => {
                              setConfirmAction(
                                () => () => deleteReview(review._id),
                              );
                              setConfirmOpen(true);
                            }}
                            className="rounded-lg bg-gradient-to-r from-accent to-accent-600 p-2 text-white shadow-sm transition-all hover:scale-110"
                            title="Delete"
                          >
                            <FaTrash />
                          </button>
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
                totalItem={totalReviews}
                parPage={parPage}
                showItem={3}
              />
            </div>
          </div>
        </div>

        {/* Empty State */}
        {!loading && reviews.length === 0 && (
          <div className="mt-8 text-center">
            <div className="rounded-2xl bg-white p-12 shadow-nature-medium ring-1 ring-primary-100">
              <FaStar className="mx-auto mb-6 text-6xl text-sunshine-500" />
              <h3 className="mb-2 text-2xl font-bold text-primary-800">
                No reviews found
              </h3>
              <p className="text-text">
                {searchValue
                  ? `No reviews match your search for "${searchValue}"`
                  : "No reviews available yet"}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Reviews;
