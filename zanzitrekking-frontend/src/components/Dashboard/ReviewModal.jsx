import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createPortal } from "react-dom";
import { Loader2, Send, Star, X } from "lucide-react";
import RatingReact from "react-rating";
import { CiStar } from "react-icons/ci";
import { FaStar } from "react-icons/fa";
import toast from "react-hot-toast";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { reviewSchema } from "../../utils/validationSchemas";
import {
  clearMessage,
  createReview,
} from "../../store/reducers/reviewReducer";
import { resolveMediaUrl } from "../../utils/imageUtils";

const ReviewModal = ({
  isOpen,
  onClose,
  orderId,
  tripId,
  tripTitle,
  tripImage,
}) => {
  const dispatch = useDispatch();
  const userInfo = useSelector((state) => state.auth?.userInfo);
  const {
    createReviewLoader,
    successMessage,
    errorMessage,
  } = useSelector((state) => state.review);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(reviewSchema),
    defaultValues: {
      tripId,
      orderId: orderId || undefined,
      rating: 0,
      title: "",
      comment: "",
    },
  });

  const rating = watch("rating");

  useEffect(() => {
    if (isOpen) {
      reset({
        tripId,
        orderId: orderId || undefined,
        rating: 0,
        title: "",
        comment: "",
      });
      dispatch(clearMessage());
    }
  }, [isOpen, dispatch, tripId, orderId, reset]);

  useEffect(() => {
    if (successMessage) {
      toast.success(successMessage);
      dispatch(clearMessage());
      onClose();
    }
    if (errorMessage) {
      toast.error(errorMessage);
      dispatch(clearMessage());
    }
  }, [successMessage, errorMessage, dispatch, onClose]);

  const onSubmit = async (data) => {
    if (!userInfo?._id) {
      toast.error("User information not available");
      return;
    }

    dispatch(
      createReview({
        customerId: userInfo._id,
        tripId: data.tripId,
        orderId: data.orderId,
        rating: data.rating,
        title: data.title.trim(),
        comment: data.comment.trim(),
      }),
    );
  };

  if (!isOpen) {return null;}

  return createPortal(
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center px-4 pb-20 pt-4 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div
          className="fixed inset-0 bg-primary-900/50 backdrop-blur-sm transition-opacity"
          onClick={onClose}
        ></div>

        {/* Modal panel */}
        <span className="hidden sm:inline-block sm:h-screen sm:align-middle">
          &#8203;
        </span>

        <div className="inline-block transform overflow-hidden rounded-xl border border-neutral-200 bg-white text-left align-bottom shadow-soft-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:align-middle">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-neutral-200 bg-background-muted px-6 py-4">
            <div>
              <div className="mb-2 inline-flex items-center gap-2 rounded-lg border border-warning-200 bg-warning-50 px-2 py-1">
                <Star className="h-3 w-3 text-warning-600" />
                <span className="text-xs font-semibold text-warning-700">
                  Review
                </span>
              </div>
              <h3 className="text-lg font-bold text-primary-800">
                Write a Review
              </h3>
            </div>
            <button
              onClick={onClose}
              className="rounded-lg p-2 text-text-light transition-colors hover:bg-neutral-100 hover:text-primary-600"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Trip Info */}
          <div className="border-b border-neutral-200 bg-white px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="h-14 w-14 flex-shrink-0 overflow-hidden rounded-lg border border-neutral-200">
                <img
                  src={
                    tripImage ? resolveMediaUrl(tripImage) : "/placeholder.svg"
                  }
                  alt={tripTitle}
                  className="h-full w-full object-cover"
                />
              </div>
              <div>
                <h4 className="font-semibold text-primary-800">{tripTitle}</h4>
                <p className="text-sm text-text-light">Order #{orderId}</p>
              </div>
            </div>
          </div>

          {/* Review Form */}
          <div className="px-6 py-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                {/* Rating */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-primary-800">
                    Rating <span className="text-error-500">*</span>
                  </label>
                  <div className="flex gap-1">
                    <RatingReact
                      onChange={(e) => setValue("rating", e)}
                      initialRating={rating}
                      emptySymbol={
                        <span className="text-4xl text-neutral-300">
                          <CiStar />
                        </span>
                      }
                      fullSymbol={
                        <span className="text-4xl text-warning-500">
                          <FaStar />
                        </span>
                      }
                    />
                  </div>
                  {errors.rating && (
                    <p className="mt-1 text-sm text-red-600">{errors.rating.message}</p>
                  )}
                </div>

                {/* Title */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-primary-800">
                    Review Title <span className="text-error-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Give your review a title..."
                    {...register("title")}
                    className={`w-full rounded-lg border bg-white px-4 py-3 text-sm text-primary-800 placeholder-text-lighter transition-colors focus:outline-none focus:ring-2 ${
                      errors.title
                        ? "border-red-500 focus:border-red-500 focus:ring-red-200"
                        : "border-neutral-300 focus:border-primary-500 focus:ring-primary-200"
                    }`}
                  />
                  {errors.title && (
                    <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
                  )}
                </div>

                {/* Comment */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-primary-800">
                    Your Review <span className="text-error-500">*</span>
                  </label>
                  <textarea
                    placeholder="Share your experience with other travelers..."
                    rows="5"
                    {...register("comment")}
                    className={`w-full rounded-lg border bg-white px-4 py-3 text-sm text-primary-800 placeholder-text-lighter transition-colors focus:outline-none focus:ring-2 ${
                      errors.comment
                        ? "border-red-500 focus:border-red-500 focus:ring-red-200"
                        : "border-neutral-300 focus:border-primary-500 focus:ring-primary-200"
                    }`}
                  />
                  {errors.comment && (
                    <p className="mt-1 text-sm text-red-600">{errors.comment.message}</p>
                  )}
                </div>

                {/* Submit Button */}
                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="rounded-lg border border-neutral-300 bg-white px-5 py-2.5 text-sm font-semibold text-text transition-colors hover:bg-background-muted focus:outline-none focus:ring-2 focus:ring-primary-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={createReviewLoader}
                    className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white shadow-soft transition-all hover:bg-primary-700 hover:shadow-soft-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {createReviewLoader ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Submitting...</span>
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4" />
                        <span>Submit Review</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
};

export default ReviewModal;
