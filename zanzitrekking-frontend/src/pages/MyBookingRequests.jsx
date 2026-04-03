import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { clearMessage, getMyRequests, deleteRequest } from "../store/reducers/urgentBookingRequestReducer";
import { resolveMediaUrl } from "../utils/imageUtils";
import toast from "react-hot-toast";
import { Copy,Trash  } from "lucide-react";

const statusStyles = {
  pending: "border-yellow-200 bg-yellow-50 text-yellow-900",
  approved: "border-green-200 bg-green-50 text-green-900",
  rejected: "border-red-200 bg-red-50 text-red-900",
};

const statusLabel = (status = "") =>
  status ? status.charAt(0).toUpperCase() + status.slice(1) : "Pending";

const RequestCard = ({ req }) => {
  const trip = req.tripId || {};
  const imageName = trip.mainImage
    ? resolveMediaUrl(trip.mainImage)
    : "/placeholder.svg";
  const style = statusStyles[req.status] || statusStyles.pending;

  return (
    <div className={`rounded-xl border p-5${style}`}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex gap-4">
          <div className="h-16 w-16 overflow-hidden rounded-lg bg-white/60">
            <img
              src={imageName}
              alt={trip.mainTitle || "Trip"}
              className="h-full w-full object-cover"
            />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-base font-bold">
                {trip.mainTitle || req.tripTitle || "Trip"}
              </h3>
              <span className="rounded-full bg-white/70 px-2 py-0.5 text-xs font-semibold">
                {statusLabel(req.status)}
              </span>
            </div>
            <div className="mt-1 text-sm opacity-90">
              <div className="flex items-center gap-2">
                <span className="font-semibold">Request ID:</span>{" "}
                <span className="font-mono text-xs">{req._id}</span>
                <button
                  onClick={() => handleCopyRequestId(req._id)}
                  className="text-primary-600 hover:text-primary-800"
                  title="Copy Request ID"
                >
                  <Copy className="h-3 w-3" />
                </button>
              </div>
              <div>
                <span className="font-semibold">Requested Date:</span>{" "}
                {new Date(req.requestedDate).toLocaleDateString()}
              </div>
              <div>
                <span className="font-semibold">Package:</span>{" "}
                {req.selectedCategory === "standard"
                  ? "Budget"
                  : req.selectedCategory === "midRange"
                    ? "Mid-Range"
                    : "Luxury"}
                {" · "}
                <span className="font-semibold">Travelers:</span>{" "}
                {req.travelersNumber || 1}
              </div>
            </div>
            {req.status === "rejected" && req.rejectedReason && (
              <div className="mt-3 rounded-lg bg-white/70 p-2 text-sm">
                <span className="font-semibold">Rejected Reason:</span>{" "}
                {req.rejectedReason}
              </div>
            )}
            {req.status === "approved" && (
              <div className="mt-3 rounded-lg bg-white/70 p-2 text-sm">
                Your request is approved. You can proceed to checkout.
              </div>
            )}

          </div>
        </div>

        {/* Show action buttons */}
        <div className="sm:ml-4 flex flex-col gap-2 sm:flex-row">
          {req.status === "approved" && (
            <button
              onClick={() => handleProceedToCheckout(req)}
              className="w-full rounded-lg bg-gradient-to-r from-primary-600 to-primary-700 px-4 py-2 text-sm font-semibold text-white shadow-soft transition-all hover:from-primary-700 hover:to-primary-800 sm:w-auto"
            >
              Proceed to Checkout
            </button>
          )}
          {req.status === "rejected" && (
            <button
              onClick={() => handleDeleteRequest(req._id)}
              disabled={deletingId === req._id}
              className="w-full flex items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-soft transition-all hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed sm:w-auto"
            >
              {deletingId === req._id ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                  <span>Deleting...</span>
                </>
              ) : (
                <>
                  <Trash className="h-4 w-4" />
                  <span>Delete</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

const MyBookingRequests = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { userInfo } = useSelector((state) => state.auth);
  const { requests = [], loader, errorMessage, successMessage } = useSelector(
    (state) => state.urgentBookingRequest,
  );
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    if (!userInfo?._id) {return;}
    dispatch(getMyRequests(userInfo._id));
  }, [dispatch, userInfo?._id]);

  useEffect(() => {
    if (!errorMessage) {return;}
    toast.error(errorMessage);
    dispatch(clearMessage());
  }, [dispatch, errorMessage]);

  useEffect(() => {
    if (successMessage) {
      toast.success(successMessage);
      dispatch(clearMessage());
      // Refresh requests after deletion
      if (userInfo?._id) {
        dispatch(getMyRequests(userInfo._id));
      }
    }
  }, [dispatch, successMessage, userInfo?._id]);

  const grouped = useMemo(() => {
    const pending = [];
    const approved = [];
    const rejected = [];
    for (const r of requests) {
      if (r.status === "approved") {approved.push(r);}
      else if (r.status === "rejected") {rejected.push(r);}
      else {pending.push(r);}
    }
    return { pending, approved, rejected };
  }, [requests]);

  const handleProceedToCheckout = (req) => {
    const tripId = req.tripId?._id || req.tripId;
    if (!tripId) {
      toast.error("Trip not found for this request.");
      return;
    }

    // Parse the requested date correctly to preserve the intended date
    // Extract UTC date components to avoid timezone shifts
    let startingDateStr;
    if (typeof req.requestedDate === "string" && req.requestedDate.includes("T")) {
      // ISO string - extract the date part (YYYY-MM-DD)
      startingDateStr = req.requestedDate.split("T")[0];
    } else {
      // Fallback: parse and extract date part using UTC components
      const parsed = new Date(req.requestedDate);
      const utcYear = parsed.getUTCFullYear();
      const utcMonth = String(parsed.getUTCMonth() + 1).padStart(2, "0");
      const utcDay = String(parsed.getUTCDate()).padStart(2, "0");
      startingDateStr = `${utcYear}-${utcMonth}-${utcDay}`;
    }

    // Pass details to Checkout the same way BookingModal does
    localStorage.setItem(
      "directBookingDetails",
      JSON.stringify({
        tripId,
        startingDate: startingDateStr,
        travelersNumber: req.travelersNumber || 1,
        selectedCategory: req.selectedCategory || "standard",
      }),
    );

    navigate(`/checkout?trip=${tripId}`);
  };

  const handleDeleteRequest = async (requestId) => {
    if (!userInfo?._id) {
      toast.error("Please login to delete requests");
      return;
    }

    if (!window.confirm("Are you sure you want to delete this rejected request? This action cannot be undone.")) {
      return;
    }

    setDeletingId(requestId);
    try {
      await dispatch(deleteRequest({ requestId, customerId: userInfo._id })).unwrap();
    } catch (error) {
      toast.error(error || "Failed to delete request");
    } finally {
      setDeletingId(null);
    }
  };

  const handleCopyRequestId = (requestId) => {
    navigator.clipboard.writeText(requestId);
    toast.success("Request ID copied to clipboard!");
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-black text-primary-800">
          Booking Requests
        </h1>
        <p className="mt-1 text-sm text-text-light">
          View your pending, approved, and rejected availability requests.
        </p>
      </div>

      {loader ? (
        <div className="rounded-xl border border-neutral-200 bg-white p-8 text-center">
          <div className="mx-auto mb-3 h-7 w-7 animate-spin rounded-full border-4 border-primary-200 border-t-primary-700" />
          <p className="text-sm font-medium text-text">Loading requests...</p>
        </div>
      ) : requests.length === 0 ? (
        <div className="rounded-xl border border-neutral-200 bg-white p-8 text-center">
          <p className="text-sm font-medium text-text">
            You don’t have any booking requests yet.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          <section>
            <h2 className="mb-3 text-sm font-extrabold uppercase tracking-wider text-text-lighter">
              Pending ({grouped.pending.length})
            </h2>
            <div className="space-y-3">
              {grouped.pending.map((req) => (
                <RequestCard key={req._id} req={req} />
              ))}
            </div>
          </section>

          <section>
            <h2 className="mb-3 text-sm font-extrabold uppercase tracking-wider text-text-lighter">
              Approved ({grouped.approved.length})
            </h2>
            <div className="space-y-3">
              {grouped.approved.map((req) => (
                <RequestCard key={req._id} req={req} />
              ))}
            </div>
          </section>

          <section>
            <h2 className="mb-3 text-sm font-extrabold uppercase tracking-wider text-text-lighter">
              Rejected ({grouped.rejected.length})
            </h2>
            <div className="space-y-3">
              {grouped.rejected.map((req) => (
                <RequestCard key={req._id} req={req} />
              ))}
            </div>
          </section>
        </div>
      )}
    </div>
  );
};

export default MyBookingRequests;

