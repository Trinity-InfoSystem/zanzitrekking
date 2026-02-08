import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useSearchParams } from "react-router-dom";
import Pagination from "../Pagination";
import Rating from "./Rating";
import RatingReact from "react-rating";
import { CiStar } from "react-icons/ci";
import {
  FaCheckCircle,
  FaEdit,
  FaPlus,
  FaQuoteLeft,
  FaStar,
  FaTimes,
  FaTrash,
  FaUserCircle,
} from "react-icons/fa";
import toast from "react-hot-toast";
import api from "../../api/api";
import RatingTemp from "./RatingTemp";
import TripadvisorReviews from "../TripadvisorReviews";
import GoogleReviewsWidget from "../GoogleReviewsWidget";

const Reviews = ({ tripId, orderId: propOrderId }) => {
  const [searchParams] = useSearchParams();
  const orderId = propOrderId || searchParams.get("orderId");
  const [parPage] = useState(1);
  const [pageNumber] = useState(5);
  const [reviews, setReviews] = useState([]);
  const [ratingStats, setRatingStats] = useState({
    averageRating: 0,
    totalReviews: 0,
  });
  const [ratingDistribution, setRatingDistribution] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editingReview, setEditingReview] = useState(null);
  const [deletingReview, setDeletingReview] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);

  const userInfo = useSelector((state) => state.auth?.userInfo);
  const [rate, setRate] = useState(0);
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");

  const calculateRatingDistribution = (reviews) => {
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach((review) => {
      if (Object.prototype.hasOwnProperty.call(distribution, review.rating)) {
        distribution[review.rating]++;
      }
    });
    return distribution;
  };

  const fetchReviews = async () => {
    if (!tripId) {return;}

    setLoading(true);
    try {
      const customerId = userInfo?._id || userInfo?.id;
      const queryParams = new URLSearchParams({
        page: parPage.toString(),
        limit: pageNumber.toString(),
      });

      if (customerId) {
        queryParams.append("customerId", customerId);
      }

      const response = await api.get(
        `/reviews/trip/${tripId}?${queryParams.toString()}`,
      );
      setReviews(response.data.reviews);
      setRatingStats(response.data.ratingStats);

      const distribution = calculateRatingDistribution(response.data.reviews);
      setRatingDistribution(distribution);
    } catch (error) {
      console.error("Error fetching reviews:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();

    if (!rate || !title.trim() || !comment.trim()) {
      toast.error("Please fill in all fields");
      return;
    }

    setSubmitting(true);
    try {
      if (editingReview) {
        const customerId = userInfo?._id || userInfo?.id;

        if (!customerId) {
          toast.error("User information not found. Please login again.");
          setSubmitting(false);
          return;
        }

        await api.put(`/reviews/${editingReview._id}`, {
          customerId,
          rating: rate,
          title: title.trim(),
          comment: comment.trim(),
        });

        toast.success("Review updated successfully!");
      } else {
        const customerId = userInfo?._id || userInfo?.id;

        if (!customerId) {
          toast.error("User information not found. Please login again.");
          setSubmitting(false);
          return;
        }

        if (!tripId) {
          toast.error("Trip information not found. Please refresh the page.");
          setSubmitting(false);
          return;
        }

        if (!rate || rate < 1 || rate > 5) {
          toast.error("Please select a valid rating (1-5 stars).");
          setSubmitting(false);
          return;
        }

        await api.post("/reviews/create", {
          customerId,
          tripId,
          rating: rate,
          title: title.trim(),
          comment: comment.trim(),
        });

        toast.success(
          "Review submitted successfully! Thank you for sharing your experience.",
        );
      }

      handleCloseReviewModal();
      fetchReviews();
    } catch (error) {
      console.error("Error submitting review:", error);
      const errorMessage =
        error.response?.data?.message || "Failed to submit review";
      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditReview = (review) => {
    setEditingReview(review);
    setRate(review.rating);
    setTitle(review.title);
    setComment(review.comment);
    setShowReviewModal(true);
  };

  const handleOpenReviewModal = () => {
    setEditingReview(null);
    setRate(0);
    setTitle("");
    setComment("");
    setShowReviewModal(true);
  };

  const handleCloseReviewModal = () => {
    setShowReviewModal(false);
    setEditingReview(null);
    setRate(0);
    setTitle("");
    setComment("");
  };

  const handleDeleteReview = async (reviewId) => {
    try {
      await api.delete(
        `/reviews/${reviewId}?customerId=${userInfo?._id || userInfo?.id}`,
        {
          params: { customerId: userInfo?._id },
        },
      );

      toast.success("Review deleted successfully");
      setShowDeleteConfirm(false);
      setDeletingReview(null);

      fetchReviews();
    } catch (error) {
      console.error("Error deleting review:", error);
      const errorMessage =
        error.response?.data?.message || "Failed to delete review";
      toast.error(errorMessage);
    }
  };
  const isUserReview = (review) => {
    if (!userInfo) {return false;}
    const userId = userInfo._id || userInfo.id;
    if (!userId) {return false;}

    let reviewUserId = null;
    if (typeof review.customerId === "string") {
      reviewUserId = review.customerId;
    } else if (review.customerId) {
      reviewUserId = review.customerId._id || review.customerId.id;
    }

    return reviewUserId && userId.toString() === reviewUserId.toString();
  };

  const hasUserReviewed = () => {
    if (!userInfo || !reviews.length) {return false;}
    const userId = (userInfo._id || userInfo.id)?.toString();
    if (!userId) {return false;}

    return reviews.some((review) => {
      let reviewUserId = null;
      if (typeof review.customerId === "string") {
        reviewUserId = review.customerId;
      } else if (review.customerId) {
        reviewUserId = review.customerId._id || review.customerId.id;
      }
      return reviewUserId && userId === reviewUserId.toString();
    });
  };

  useEffect(() => {
    fetchReviews();
  }, [tripId, parPage, userInfo?._id || userInfo?.id]);

  return (
    <div className="safari-reviews my-8">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&display=swap');
        
        .safari-reviews {
          font-family: 'Outfit', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        }
        
        .review-card {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .review-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 32px rgba(0, 0, 0, 0.08);
        }
        
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fade-in {
          animation: fadeIn 0.4s ease-out;
        }
      `}</style>

      {/* Google Reviews Widget */}
      <GoogleReviewsWidget />

      {/* TripAdvisor Reviews */}
      <TripadvisorReviews />

      {/* Rating Overview Card */}
      <div className="mb-8 px-4 lg:px-8">
        <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
          <div className="bg-gradient-to-r from-slate-50/50 to-transparent p-6 lg:p-8">
            <div className="flex flex-col gap-8 md:flex-row md:gap-12">
              {/* Average Rating Section */}
              <div className="flex flex-col items-center justify-center gap-4 border-b border-neutral-200 pb-8 md:items-start md:border-b-0 md:border-r md:pb-0 md:pr-12">
                <div className="flex items-baseline gap-2">
                  <span className="bg-gradient-to-br from-slate-700 to-slate-900 bg-clip-text text-6xl font-bold text-transparent md:text-7xl">
                    {ratingStats.averageRating.toFixed(1)}
                  </span>
                  <span className="text-3xl font-semibold text-neutral-400 md:text-4xl">
                    /5
                  </span>
                </div>
                <div className="flex text-3xl md:text-4xl">
                  <Rating ratings={ratingStats.averageRating} />
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100">
                    <FaCheckCircle className="text-sm text-emerald-600" />
                  </div>
                  <p className="text-base font-bold text-neutral-900">
                    {ratingStats.totalReviews}{" "}
                    {ratingStats.totalReviews === 1 ? "Review" : "Reviews"}
                  </p>
                </div>
              </div>

              {/* Rating Distribution */}
              <div className="flex flex-1 flex-col gap-3">
                {[5, 4, 3, 2, 1].map((rating) => {
                  const count = ratingDistribution[rating] || 0;
                  const percentage =
                    ratingStats.totalReviews > 0
                      ? (count / ratingStats.totalReviews) * 100
                      : 0;

                  return (
                    <div
                      key={rating}
                      className="group flex items-center justify-start gap-3"
                    >
                      <div className="flex w-[90px] gap-1 text-sm">
                        <RatingTemp rating={rating} />
                      </div>
                      <div className="relative h-3 max-w-[300px] flex-1 overflow-hidden rounded-full bg-neutral-200 shadow-inner">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 shadow-sm transition-all duration-500 group-hover:shadow-md"
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                      <p className="min-w-[35px] text-base font-bold text-neutral-900">
                        {count}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Write Review Button */}
      {userInfo && !hasUserReviewed() && (
        <div className="mb-8 px-4 lg:px-8">
          <button
            onClick={handleOpenReviewModal}
            className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-br from-slate-600 to-slate-700 px-6 py-3 text-sm font-bold text-white shadow-lg transition-all hover:shadow-xl"
          >
            <FaPlus className="text-base" />
            <span>Write a Review</span>
            <FaStar className="text-base" />
          </button>
        </div>
      )}

      {/* Reviews List */}
      <div className="px-4 lg:px-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="relative">
              <div className="h-16 w-16 animate-spin rounded-full border-4 border-slate-200 border-t-slate-700"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <FaStar className="text-xl text-amber-500" />
              </div>
            </div>
            <p className="mt-4 font-bold text-neutral-600">
              Loading reviews...
            </p>
          </div>
        ) : reviews.length > 0 ? (
          <div className="space-y-5">
            {reviews.map((review) => (
              <div
                key={review._id}
                className="review-card animate-fade-in overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm"
              >
                <div className="p-6 md:p-8">
                  {/* Review Header */}
                  <div className="mb-5 flex items-start gap-4">
                    {/* Avatar */}
                    <div className="relative flex-shrink-0">
                      {review.customerId?.image ? (
                        <img
                          src={review.customerId.image}
                          alt={review.customerId.name}
                          className="h-14 w-14 rounded-full object-cover ring-2 ring-neutral-200 transition-all md:h-16 md:w-16"
                        />
                      ) : (
                        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-slate-100 to-slate-200 ring-2 ring-neutral-200 transition-all md:h-16 md:w-16">
                          <FaUserCircle className="text-2xl text-slate-600" />
                        </div>
                      )}
                      <div className="absolute -bottom-1 -right-1 rounded-full bg-white p-1 shadow-md">
                        <FaCheckCircle className="text-xs text-emerald-600" />
                      </div>
                    </div>

                    {/* User Info */}
                    <div className="min-w-0 flex-1">
                      <h4 className="text-base font-bold text-neutral-900 md:text-lg">
                        {review.customerId?.name || "Guest Traveler"}
                      </h4>
                      <div className="mt-2 flex flex-wrap items-center gap-3">
                        <div className="flex text-base md:text-lg">
                          <Rating ratings={review.rating} />
                        </div>
                        <span className="text-xs font-medium text-neutral-500 md:text-sm">
                          {review.formattedDate}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Review Content */}
                  <div className="relative">
                    <FaQuoteLeft className="absolute -left-1 -top-1 text-3xl text-slate-100" />
                    <div className="pl-8">
                      <h5 className="mb-3 text-base font-bold text-neutral-900 md:text-lg">
                        {review.title}
                      </h5>
                      <p className="text-sm leading-relaxed text-neutral-600 md:text-base">
                        {review.comment}
                      </p>
                    </div>
                  </div>

                  {/* Review Footer */}
                  <div className="mt-5 border-t border-neutral-100 pt-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 text-xs text-neutral-500 md:text-sm">
                          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100">
                            <FaCheckCircle className="text-[10px] text-emerald-600" />
                          </div>
                          <span className="font-bold">Verified Traveler</span>
                        </div>
                        {isUserReview(review) &&
                          review.status === "pending" && (
                            <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-700">
                              Pending Approval
                            </span>
                          )}
                      </div>
                      {isUserReview(review) && (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEditReview(review)}
                            className="flex items-center gap-2 rounded-lg bg-slate-100 px-3 py-2 text-xs font-bold text-slate-700 transition-all hover:bg-slate-200"
                            title="Edit review"
                          >
                            <FaEdit className="text-xs" />
                            <span>Edit</span>
                          </button>
                          <button
                            onClick={() => {
                              setDeletingReview(review._id);
                              setShowDeleteConfirm(true);
                            }}
                            className="flex items-center gap-2 rounded-lg bg-slate-100 px-3 py-2 text-xs font-bold text-slate-700 transition-all hover:bg-slate-200"
                            title="Delete review"
                          >
                            <FaTrash className="text-xs" />
                            <span>Delete</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-16 text-center">
            <div className="rounded-2xl border-2 border-dashed border-neutral-300 bg-gradient-to-br from-slate-50 to-white p-12">
              <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200">
                <FaStar className="text-3xl text-amber-500" />
              </div>
              <h3 className="mb-2 text-xl font-bold text-neutral-900 md:text-2xl">
                No reviews yet
              </h3>
              <p className="mx-auto max-w-md text-sm text-neutral-600 md:text-base">
                Be the first to share your experience with this amazing trip!
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Review Modal */}
      {showReviewModal && userInfo && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
          onClick={handleCloseReviewModal}
        >
          <div
            className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="sticky top-0 z-10 bg-gradient-to-br from-slate-600 to-slate-700 px-6 py-5">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 shadow-lg">
                    <FaStar className="text-xl text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">
                      {editingReview
                        ? "Edit Your Review"
                        : "Share Your Experience"}
                    </h3>
                    <p className="text-sm text-white/80">
                      {editingReview
                        ? "Update your review below"
                        : "Help others by writing a review"}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleCloseReviewModal}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition-all hover:bg-white/20"
                  aria-label="Close modal"
                >
                  <FaTimes className="text-base" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-8">
              <form onSubmit={handleSubmitReview} className="space-y-6">
                {/* Rating Selector */}
                <div>
                  <label className="mb-3 block text-sm font-bold text-neutral-900">
                    Your Rating <span className="text-red-600">*</span>
                  </label>
                  <div className="inline-flex gap-2 rounded-xl border-2 border-neutral-200 bg-slate-50 p-4 shadow-sm">
                    <RatingReact
                      onChange={(e) => setRate(e)}
                      initialRating={rate}
                      emptySymbol={
                        <span className="cursor-pointer text-4xl text-neutral-300 transition-colors hover:text-amber-400 md:text-5xl">
                          <CiStar />
                        </span>
                      }
                      fullSymbol={
                        <span className="cursor-pointer text-4xl text-amber-500 transition-colors hover:text-amber-600 md:text-5xl">
                          <FaStar />
                        </span>
                      }
                    />
                  </div>
                </div>

                {/* Title Input */}
                <div>
                  <label className="mb-2 block text-sm font-bold text-neutral-900">
                    Review Title <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Summarize your experience"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full rounded-xl border-2 border-neutral-200 bg-white p-4 text-sm shadow-sm outline-none transition-all focus:border-slate-600 focus:ring-4 focus:ring-slate-100"
                    required
                    maxLength={100}
                  />
                </div>

                {/* Comment Textarea */}
                <div>
                  <label className="mb-2 block text-sm font-bold text-neutral-900">
                    Your Review <span className="text-red-600">*</span>
                  </label>
                  <textarea
                    placeholder="Share your experience, what you loved, and what could be improved..."
                    rows="5"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="w-full resize-none rounded-xl border-2 border-neutral-200 bg-white p-4 text-sm shadow-sm outline-none transition-all focus:border-slate-600 focus:ring-4 focus:ring-slate-100"
                    required
                    maxLength={1000}
                  />
                  <p className="mt-2 text-xs text-neutral-500">
                    {comment.length}/1000 characters
                  </p>
                </div>

                {/* Submit Button */}
                <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center sm:justify-between">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-br from-slate-600 to-slate-700 px-6 py-3 text-sm font-bold text-white shadow-lg transition-all hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {submitting ? (
                      <>
                        <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                        <span>Submitting...</span>
                      </>
                    ) : (
                      <>
                        <FaStar className="text-base" />
                        <span>
                          {editingReview ? "Update Review" : "Submit Review"}
                        </span>
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={handleCloseReviewModal}
                    className="rounded-xl border-2 border-neutral-200 bg-white px-8 py-3 text-sm font-bold text-neutral-700 transition-all hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="mx-4 w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-100">
                <FaTrash className="text-xl text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-neutral-900">
                Delete Review
              </h3>
            </div>
            <p className="mb-6 text-base text-neutral-600">
              Are you sure you want to delete this review? This action cannot be
              undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setDeletingReview(null);
                }}
                className="flex-1 rounded-xl border-2 border-neutral-200 bg-white px-6 py-3 text-sm font-bold text-neutral-700 transition-all hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteReview(deletingReview)}
                className="flex-1 rounded-xl bg-gradient-to-br from-slate-600 to-slate-700 px-6 py-3 text-sm font-bold text-white shadow-lg transition-all hover:shadow-xl"
              >
                Delete Review
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reviews;
