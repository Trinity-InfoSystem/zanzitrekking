import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { clearMessage, createUrgentBookingRequest } from "../../store/reducers/urgentBookingRequestReducer";
import toast from "react-hot-toast";
import { IMAGES_URL } from "../../utils/constants";
import { AlertCircle, Calendar, Package, Send, Users } from "lucide-react";
import { parse } from "date-fns";

const AvailabilityRequestForm = ({
  blockedTrips,
  formData: parentFormData,
  handleChange: _parentHandleChange,
  onRequestSubmitted,
}) => {
  const dispatch = useDispatch();
  const { userInfo } = useSelector((state) => state.auth);

  // Create separate state for availability request form to avoid conflicts with checkout form
  const [formData, setFormData] = useState({
    personalInfo: {
      firstName: parentFormData?.personalInfo?.firstName || userInfo?.name?.split(" ")[0] || "",
      lastName: parentFormData?.personalInfo?.lastName || userInfo?.name?.split(" ").slice(1).join(" ") || "",
      email: parentFormData?.personalInfo?.email || userInfo?.email || "",
      phone: parentFormData?.personalInfo?.phone || userInfo?.phone || "",
    },
    billingAddress: {
      street: parentFormData?.billingAddress?.street || "",
      city: parentFormData?.billingAddress?.city || "",
      state: parentFormData?.billingAddress?.state || "",
      zip: parentFormData?.billingAddress?.zip || "",
      country: parentFormData?.billingAddress?.country || "United States",
    },
  });

  // Separate handleChange for availability request form
  const handleChange = (section, field, value) => {
    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
  };
  const { loader, successMessage, errorMessage, request } = useSelector(
    (state) => state.urgentBookingRequest,
  );
  const [submittedRequests, setSubmittedRequests] = useState([]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!userInfo) {
      toast.error("Please login to submit an availability request");
      return;
    }

    // Validate required fields
    const { personalInfo, billingAddress } = formData;
    if (
      !personalInfo.firstName ||
      !personalInfo.lastName ||
      !personalInfo.email ||
      !personalInfo.phone ||
      !billingAddress.street ||
      !billingAddress.city ||
      !billingAddress.state ||
      !billingAddress.zip
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    // Validate email format
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(personalInfo.email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    try {
      // Submit a request for each blocked trip
      const requests = [];
      const failedRequests = [];

      // Calculate today in UTC (matching backend)
      const now = new Date();
      const todayYear = now.getUTCFullYear();
      const todayMonth = now.getUTCMonth();
      const todayDay = now.getUTCDate();
      const todayUTC = new Date(Date.UTC(todayYear, todayMonth, todayDay, 0, 0, 0, 0));

      for (const blockedTrip of blockedTrips) {
        // Skip if trip already has an approved request
        if (blockedTrip.existingRequest?.status === "approved") {
          continue;
        }

        // Re-validate that this trip should actually be blocked
        // Calculate daysUntilTrip using the same logic as backend
        let tripStartUTC;
        if (typeof blockedTrip.startingDate === "string" && blockedTrip.startingDate.includes("T")) {
          const parsed = new Date(blockedTrip.startingDate);
          const utcYear = parsed.getUTCFullYear();
          const utcMonth = parsed.getUTCMonth();
          const utcDay = parsed.getUTCDate();
          tripStartUTC = new Date(Date.UTC(utcYear, utcMonth, utcDay, 0, 0, 0, 0));
        } else {
          const dateObj = blockedTrip.startingDate instanceof Date
            ? blockedTrip.startingDate
            : new Date(blockedTrip.startingDate);
          const localYear = dateObj.getFullYear();
          const localMonth = dateObj.getMonth();
          const localDay = dateObj.getDate();
          tripStartUTC = new Date(Date.UTC(localYear, localMonth, localDay, 0, 0, 0, 0));
        }

        const daysUntilTrip = Math.ceil((tripStartUTC.getTime() - todayUTC.getTime()) / (1000 * 60 * 60 * 24));

        // Check if trip should actually be blocked based on rules
        // IMPORTANT: Match the checkout logic exactly
        // - Block trips that start today or in the past (daysUntilTrip < 1)
        // - Cultural/Trekking/Zanzibar: block tomorrow (daysUntilTrip === 1)
        // - Safari Budget: block tomorrow (daysUntilTrip === 1)
        // - Safari Mid/Lux: block 1-4 days (daysUntilTrip >= 1 && daysUntilTrip <= 4)
        const categoryName = (blockedTrip.categoryName || blockedTrip.trip?.category?.name || "").toLowerCase();
        const isSafari = categoryName.includes("safari");
        const isCultural = categoryName.includes("cultural");
        const isTrekking = categoryName.includes("trekking");
        const isZanzibar = categoryName.includes("zanzibar");
        const isBudget = blockedTrip.selectedCategory === "standard";
        const isMidOrLux = blockedTrip.selectedCategory === "midRange" || blockedTrip.selectedCategory === "luxury";
        
        let shouldBeBlocked = false;
        
        // Block trips that start today or in the past (matching checkout logic)
        if (daysUntilTrip < 1) {
          shouldBeBlocked = true;
        }
        // Cultural / Trekking / Zanzibar (all packages): block tomorrow
        else if (isCultural || isTrekking || isZanzibar) {
          shouldBeBlocked = daysUntilTrip === 1;
        }
        // Safaris
        else if (isSafari) {
          // Budget Safaris: block tomorrow
          if (isBudget) {
            shouldBeBlocked = daysUntilTrip === 1;
          }
          // Mid-Range / Luxury Safaris: block 1–4 days
          else if (isMidOrLux) {
            shouldBeBlocked = daysUntilTrip >= 1 && daysUntilTrip <= 4;
          }
        }

        if (!shouldBeBlocked) {
          continue;
        }

        // Get the correct trip ID - prefer tripId, fallback to trip._id or trip.tripId
        const tripId = blockedTrip.tripId || blockedTrip.trip?._id || blockedTrip.trip?.tripId;
        if (!tripId) {
          toast.error(`Missing trip information for ${blockedTrip.trip?.mainTitle || blockedTrip.categoryName || "trip"}. Please refresh and try again.`);
          continue;
        }

        // Ensure tripId is a string
        const tripIdStr = tripId.toString();

        try {
          // Use the tripStartUTC we calculated above (which matches backend logic exactly)
          // This ensures the backend will calculate the same daysUntilTrip
          // CRITICAL: Construct the date string explicitly to ensure it's at UTC midnight
          // Extract the date part (YYYY-MM-DD) and construct a UTC midnight ISO string
          // This prevents any timezone conversion issues during transmission
          const datePart = tripStartUTC.toISOString().split("T")[0]; // e.g., "2026-02-04"
          const requestedDateStr = `${datePart}T00:00:00.000Z`; // Force UTC midnight for the intended date

          const requestData = {
            customerId: userInfo.id || userInfo._id,
            tripId: tripIdStr,
            requestedDate: requestedDateStr,
            selectedCategory: blockedTrip.selectedCategory,
            travelersNumber: blockedTrip.trip?.travelersNumber || 1,
            personalInfo: {
              firstName: personalInfo.firstName.trim(),
              lastName: personalInfo.lastName.trim(),
              email: personalInfo.email.trim(),
              phone: personalInfo.phone.trim(),
            },
            billingAddress: {
              street: billingAddress.street.trim(),
              city: billingAddress.city.trim(),
              state: billingAddress.state.trim(),
              zip: billingAddress.zip.trim(),
              country: billingAddress.country || "United States",
            },
          };

          const result = await dispatch(createUrgentBookingRequest(requestData));

          // Check if the action was rejected
          if (createUrgentBookingRequest.rejected.match(result)) {
            const errorMsg = result.payload?.errorMessage || result.error?.message || "Unknown error";

            // If backend says trip doesn't need request, it might be a date calculation mismatch
            // Don't show error toast for this - just add to failedRequests
            if (errorMsg.includes("does not require an availability request")) {
              failedRequests.push({
                tripId: tripIdStr,
                tripName: blockedTrip.trip?.mainTitle || blockedTrip.categoryName,
                error: errorMsg,
              });
            } else {
              toast.error(
                `Failed to submit request for ${blockedTrip.trip?.mainTitle || blockedTrip.categoryName || "trip"}: ${errorMsg}`,
              );
            }
          } else if (result.payload?.request) {
            requests.push(result.payload.request);
          }
        } catch (error) {
          const errorMsg = error.response?.data?.message || error.message || "Unknown error";
          toast.error(
            `Failed to submit request for ${blockedTrip.trip?.mainTitle || blockedTrip.categoryName || "trip"}: ${errorMsg}`,
          );
        }
      }

      if (requests.length > 0) {
        setSubmittedRequests(requests);
        toast.success(
          `Successfully submitted ${requests.length} availability request${requests.length > 1 ? "s" : ""}! We'll review them and get back to you soon.`,
        );
        dispatch(clearMessage());
        if (onRequestSubmitted) {
          onRequestSubmitted();
        }
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Failed to submit availability request. Please try again.",
      );
    }
  };

  if (submittedRequests.length > 0) {
    return (
      <div className="rounded-xl border-2 border-green-300 bg-gradient-to-r from-green-50 to-emerald-50 p-6 shadow-lg">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-500">
            <Send className="h-8 w-8 text-white" />
          </div>
          <h3 className="mb-2 text-xl font-bold text-green-900">
            Request{submittedRequests.length > 1 ? "s" : ""} Submitted
            Successfully!
          </h3>
          <p className="mb-4 text-sm text-green-800">
            We&apos;ve received your availability request
            {submittedRequests.length > 1 ? "s" : ""}. Our team will review
            {submittedRequests.length > 1 ? " them" : " it"} and get back to you
            within 24-48 hours.
          </p>
          <div className="mt-4 space-y-2">
            {submittedRequests.map((request, index) => (
              <div
                key={request._id || index}
                className="rounded-lg border border-green-200 bg-white/70 p-3 text-left"
              >
                <p className="text-sm font-medium text-green-900">
                  Request ID: {request._id || "N/A"}
                </p>
                <p className="text-xs text-green-700">
                  Status: Pending Review
                </p>
              </div>
            ))}
          </div>
          <p className="mt-4 text-xs text-green-700">
            You&apos;ll receive an email confirmation shortly. Once your request is
            approved, you&apos;ll be able to proceed with checkout and payment.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border-2 border-orange-300 bg-gradient-to-r from-orange-50 to-yellow-50 p-6 shadow-lg">
      <div className="mb-6 flex items-start gap-4">
        <div className="flex-shrink-0">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-500">
            <AlertCircle className="h-6 w-6 text-white" />
          </div>
        </div>
        <div className="flex-1">
          <h3 className="mb-2 text-xl font-bold text-orange-900">
            Availability Request Required
          </h3>
          <p className="mb-4 text-sm font-medium text-orange-800">
            The following trip{blockedTrips.length > 1 ? "s" : ""} start
            {blockedTrips.length === 1 ? "s" : ""} within our standard booking
            window. Please submit an availability request and we&apos;ll review it.
            Once approved, you can proceed with checkout and payment.
          </p>
        </div>
      </div>

      {/* Blocked Trips List */}
      <div className="mb-6 space-y-4">
        {blockedTrips.map((blockedTrip, index) => (
          <div
            key={blockedTrip.tripId || index}
            className="rounded-lg border border-orange-200 bg-white/70 p-4"
          >
            <div className="flex items-start gap-4">
              <div className="h-16 w-16 overflow-hidden rounded-lg">
                <img
                  src={
                    blockedTrip.trip.mainImage
                      ? IMAGES_URL +
                        blockedTrip.trip.mainImage.split("/").pop()
                      : "/placeholder.svg"
                  }
                  alt={blockedTrip.trip.mainTitle}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-orange-900">
                  {blockedTrip.trip.mainTitle || "Trip"}
                </h4>
                <div className="mt-2 space-y-1 text-sm text-orange-800">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>
                      {(() => {
                        // Handle date display - support both Date objects and strings
                        // CRITICAL: Preserve the intended date by using local date components
                        let displayDate;
                        if (blockedTrip.startingDate instanceof Date) {
                          displayDate = blockedTrip.startingDate;
                        } else if (typeof blockedTrip.startingDate === "string") {
                          if (/^\d{4}-\d{2}-\d{2}$/.test(blockedTrip.startingDate)) {
                            displayDate = parse(blockedTrip.startingDate, "yyyy-MM-dd", new Date());
                          } else if (blockedTrip.startingDate.includes("T")) {
                            // ISO string - parse it first, then extract local date components
                            const parsed = new Date(blockedTrip.startingDate);
                            const localYear = parsed.getFullYear();
                            const localMonth = parsed.getMonth();
                            const localDay = parsed.getDate();
                            displayDate = new Date(localYear, localMonth, localDay);
                          } else {
                            displayDate = new Date(blockedTrip.startingDate);
                          }
                        } else {
                          displayDate = new Date(blockedTrip.startingDate);
                        }
                        return displayDate.toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        });
                      })()}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    <span>
                      {blockedTrip.trip.travelersNumber || 1}{" "}
                      {blockedTrip.trip.travelersNumber === 1
                        ? "person"
                        : "people"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4" />
                    <span>
                      {blockedTrip.selectedCategory === "standard"
                        ? "Budget"
                        : blockedTrip.selectedCategory === "midRange"
                          ? "Mid-Range"
                          : "Luxury"}
                    </span>
                  </div>
                </div>
                <p className="mt-2 text-xs font-medium text-orange-700">
                  {blockedTrip.restrictionMessage}
                </p>
                {blockedTrip.existingRequest && blockedTrip.existingRequest.status !== "approved" && (
                  <p className="mt-2 text-xs font-semibold text-orange-900">
                    ⚠️ You have a {blockedTrip.existingRequest.status} request for this trip. You can submit a new request below.
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Request Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="rounded-lg border border-orange-200 bg-white/70 p-6">
          <h4 className="mb-4 text-lg font-semibold text-orange-900">
            Contact Information
          </h4>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                First Name *
              </label>
              <input
                type="text"
                value={formData.personalInfo.firstName}
                onChange={(e) =>
                  handleChange("personalInfo", "firstName", e.target.value)
                }
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                placeholder="John"
                required
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Last Name *
              </label>
              <input
                type="text"
                value={formData.personalInfo.lastName}
                onChange={(e) =>
                  handleChange("personalInfo", "lastName", e.target.value)
                }
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                placeholder="Doe"
                required
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Email *
              </label>
              <input
                type="email"
                value={formData.personalInfo.email}
                onChange={(e) =>
                  handleChange("personalInfo", "email", e.target.value)
                }
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                placeholder="john@example.com"
                required
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Phone *
              </label>
              <input
                type="tel"
                value={formData.personalInfo.phone}
                onChange={(e) =>
                  handleChange("personalInfo", "phone", e.target.value)
                }
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                placeholder="+1234567890"
                required
              />
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-orange-200 bg-white/70 p-6">
          <h4 className="mb-4 text-lg font-semibold text-orange-900">
            Billing Address
          </h4>
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Street Address *
              </label>
              <input
                type="text"
                value={formData.billingAddress.street}
                onChange={(e) =>
                  handleChange("billingAddress", "street", e.target.value)
                }
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                placeholder="123 Main St"
                required
              />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  City *
                </label>
                <input
                  type="text"
                  value={formData.billingAddress.city}
                  onChange={(e) =>
                    handleChange("billingAddress", "city", e.target.value)
                  }
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                  placeholder="New York"
                  required
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  State *
                </label>
                <input
                  type="text"
                  value={formData.billingAddress.state}
                  onChange={(e) =>
                    handleChange("billingAddress", "state", e.target.value)
                  }
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                  placeholder="NY"
                  required
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  ZIP Code *
                </label>
                <input
                  type="text"
                  value={formData.billingAddress.zip}
                  onChange={(e) =>
                    handleChange("billingAddress", "zip", e.target.value)
                  }
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                  placeholder="10001"
                  required
                />
              </div>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Country *
              </label>
              <input
                type="text"
                value={formData.billingAddress.country}
                onChange={(e) =>
                  handleChange("billingAddress", "country", e.target.value)
                }
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                placeholder="United States"
                required
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <button
            type="submit"
            disabled={loader}
            className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-orange-500 to-red-500 px-8 py-3 font-semibold text-white shadow-lg transition-all hover:from-orange-600 hover:to-red-600 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loader ? (
              <>
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                <span>Submitting...</span>
              </>
            ) : (
              <>
                <Send className="h-5 w-5" />
                <span>Submit Availability Request</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AvailabilityRequestForm;

