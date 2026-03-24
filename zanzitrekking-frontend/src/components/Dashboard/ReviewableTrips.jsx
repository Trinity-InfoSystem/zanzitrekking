import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import {
  Calendar,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Clock,
  Loader2,
  MapPin,
  Star,
} from "lucide-react";
import toast from "react-hot-toast";
import {
  clearMessage,
  getReviewableTrips,
} from "../../store/reducers/reviewReducer";
import { resolveMediaUrl } from "../../utils/imageUtils";

const ReviewableTrips = () => {
  const [currentPage, setCurrentPage] = useState(1);

  const dispatch = useDispatch();
  const userInfo = useSelector((state) => state.customer?.userInfo);
  const { reviewableTrips, pagination, reviewableTripsLoader, errorMessage } =
    useSelector((state) => state.review);

  useEffect(() => {
    if (userInfo?._id) {
      dispatch(
        getReviewableTrips({
          customerId: userInfo._id,
          page: currentPage,
          limit: 6,
        }),
      );
    }
  }, [currentPage, userInfo?._id, dispatch]);

  useEffect(() => {
    if (errorMessage) {
      toast.error(errorMessage);
      dispatch(clearMessage());
    }
  }, [errorMessage, dispatch]);

  if (!userInfo) {
    return (
      <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex min-h-[400px] flex-col items-center justify-center rounded-xl border border-neutral-200 bg-white p-10 text-center shadow-soft">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-warning-50">
              <Star className="h-8 w-8 text-warning-500" />
            </div>
            <h3 className="mb-2 text-lg font-bold text-primary-800">
              Login Required
            </h3>
            <p className="mb-4 text-sm text-text-light">
              Please log in to view your reviewable trips.
            </p>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-6 py-2.5 text-sm font-semibold text-white shadow-soft transition-all hover:bg-primary-700 hover:shadow-soft-md"
            >
              Login here
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (reviewableTripsLoader) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
          <div className="text-sm font-semibold text-primary-800">
            Loading trips...
          </div>
        </div>
      </div>
    );
  }

  if (!reviewableTrips || reviewableTrips.length === 0) {
    return (
      <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex min-h-[400px] flex-col items-center justify-center rounded-xl border border-neutral-200 bg-white p-10 text-center shadow-soft">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-warning-50">
              <Star className="h-8 w-8 text-warning-500" />
            </div>
            <h3 className="mb-2 text-lg font-bold text-primary-800">
              No Reviewable Trips
            </h3>
            <p className="mb-6 text-sm text-text-light">
              You don&apos;t have any completed trips that can be reviewed yet.
            </p>
            <Link
              to="/trips"
              className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-6 py-2.5 text-sm font-semibold text-white shadow-soft transition-all hover:bg-primary-700 hover:shadow-soft-md"
            >
              Browse Trips
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="mb-4 inline-flex items-center gap-2 rounded-lg border border-warning-200 bg-warning-50 px-3 py-1">
            <Star className="h-4 w-4 text-warning-600" />
            <span className="text-xs font-semibold text-warning-700">
              Reviews
            </span>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-2xl font-bold text-primary-800 lg:text-3xl">
              Review Your Trips
            </h2>
            <p className="text-sm text-text-light">
              Share your experience with other travelers
            </p>
          </div>
        </div>

        {/* Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {reviewableTrips.map((trip) => (
            <div
              key={`${trip.tripId}-${trip.orderId}`}
              className="group overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-soft transition-all duration-200 hover:border-primary-300 hover:shadow-soft-md"
            >
              <div className="relative h-56 overflow-hidden">
                <img
                  src={
                    trip.tripImage
                      ? resolveMediaUrl(trip.tripImage)
                      : "/placeholder.svg"
                  }
                  alt={trip.tripTitle}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute right-3 top-3">
                  <div className="flex items-center gap-1 rounded-lg bg-success-100 px-2.5 py-1 text-xs font-semibold text-success-700 shadow-soft backdrop-blur-sm">
                    <CheckCircle className="h-3 w-3" />
                    Completed
                  </div>
                </div>
              </div>

              <div className="p-5">
                <h3 className="mb-3 line-clamp-2 text-lg font-bold text-primary-800">
                  {trip.tripTitle}
                </h3>

                <div className="mb-4 space-y-2">
                  <div className="flex items-center gap-2 text-sm text-text-light">
                    <MapPin className="h-4 w-4 text-primary-600" />
                    <span>{trip.tripDestination?.name || "Tanzania"}</span>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-text-light">
                    <Calendar className="h-4 w-4 text-primary-600" />
                    <span className="line-clamp-1">
                      {new Date(trip.tripStartDate).toLocaleDateString()} -{" "}
                      {new Date(trip.tripEndDate).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-text-light">
                    <Clock className="h-4 w-4 text-primary-600" />
                    <span>Order #{trip.orderNumber}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-neutral-100 pt-4">
                  <div className="text-xs text-text-lighter">
                    Completed {new Date(trip.tripEndDate).toLocaleDateString()}
                  </div>
                  <Link
                    to={`/trip-details/${trip.tripId}?tab=reviews&orderId=${trip.orderId}`}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white shadow-soft transition-all hover:bg-primary-700 hover:shadow-soft-md"
                  >
                    <Star className="h-4 w-4" />
                    <span>Write Review</span>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        {pagination?.totalPages > 1 && (
          <div className="mt-8 flex justify-center">
            <div className="inline-flex items-center gap-2 rounded-lg border border-neutral-200 bg-white p-1 shadow-soft">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="inline-flex items-center gap-1 rounded-md bg-white px-3 py-2 text-sm font-semibold text-primary-700 transition-colors hover:bg-primary-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <ChevronLeft className="h-4 w-4" />
                <span>Previous</span>
              </button>

              <div className="flex items-center gap-1 px-3">
                <span className="text-sm font-medium text-primary-800">
                  {currentPage}
                </span>
                <span className="text-sm text-text-light">of</span>
                <span className="text-sm font-medium text-primary-800">
                  {pagination?.totalPages}
                </span>
              </div>

              <button
                onClick={() =>
                  setCurrentPage((prev) =>
                    Math.min(prev + 1, pagination?.totalPages),
                  )
                }
                disabled={currentPage === pagination?.totalPages}
                className="inline-flex items-center gap-1 rounded-md bg-white px-3 py-2 text-sm font-semibold text-primary-700 transition-colors hover:bg-primary-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <span>Next</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReviewableTrips;
