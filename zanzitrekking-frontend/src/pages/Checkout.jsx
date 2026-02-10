"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import OrderSummary from "../components/Checkout/OrderSummary";
import AvailabilityRequestForm from "../components/Checkout/AvailabilityRequestForm";
import { useCheckoutForm } from "../hooks/useCheckoutForm";
import {
  clearOrderMessages,
  createOrder,
} from "../store/reducers/orderReducer";
import { clear_cart, clearMessage } from "../store/reducers/cardReducer";
import { get_trip } from "../store/reducers/tripReducer";
import { IMAGES_URL } from "../utils/constants";
import toast from "react-hot-toast";
import {
  checkBookingEligibility,
  getMyRequests,
} from "../store/reducers/urgentBookingRequestReducer";
import { safeRedirect } from "../utils/urlValidation";
import { parse } from "date-fns";

const Checkout = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const directTripId = searchParams.get("trip");
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { userInfo } = useSelector((state) => state.auth);
  const { cart_trips } = useSelector((state) => state.card);
  const {
    orderCreationStatus,
    successMessage,
    errorMessage,
    loader,
    currentOrder,
  } = useSelector((state) => state.order);
  const { trip: directTrip } = useSelector((state) => state.trip);
  const { formData, errors, handleChange, validateStep } =
    useCheckoutForm(userInfo);

  // State for managing category selections
  const [selectedCategories, setSelectedCategories] = useState({});
  // State for booking restrictions
  const [blockedTrips, setBlockedTrips] = useState([]);
  const [showAvailabilityForm, setShowAvailabilityForm] = useState(false);
  const [checkingRestrictions, setCheckingRestrictions] = useState(true);
  const [existingRequests, setExistingRequests] = useState([]);
  const { requests: userRequests } = useSelector(
    (state) => state.urgentBookingRequest || { requests: [] },
  );

  // Fetch direct trip if needed and prepare it with booking details
  useEffect(() => {
    if (directTripId) {
      dispatch(get_trip(directTripId));
    }
  }, [directTripId, dispatch]);

  // Use direct trip or cart trips (memoized to avoid recreating arrays every render)
  const checkoutTrips = useMemo(() => {
    const isEmpty = !directTrip || Object.keys(directTrip).length === 0;
    if (directTripId && directTrip && !isEmpty) {
      const bookingDetailsStr = localStorage.getItem("directBookingDetails");
      const bookingDetails = bookingDetailsStr
        ? JSON.parse(bookingDetailsStr)
        : null;

      return [
        {
          ...directTrip,
          _id: directTrip._id,
          tripId: directTrip._id,
          startingDate:
            bookingDetails?.startingDate || new Date().toISOString(),
          travelersNumber: bookingDetails?.travelersNumber || 1,
          selectedCategory: bookingDetails?.selectedCategory || "standard",
          // Ensure categoryName is set for restriction checking
          categoryName:
            directTrip.categoryName || directTrip.category?.name || "",
        },
      ];
    }
    return cart_trips;
  }, [directTripId, directTrip, cart_trips]);

  // Initialize category selections
  useEffect(() => {
    const initialCategories = checkoutTrips.reduce((acc, trip) => {
      // For cart items: trip.tripId is the actual trip ID, trip._id is the cart item ID
      // For direct trips: trip._id is the trip ID
      const tripId = trip.tripId || trip._id;
      acc[tripId] = trip.selectedCategory || "standard";
      return acc;
    }, {});
    // Avoid state churn: only update if something actually changed
    setSelectedCategories((prev) => {
      const prevKeys = Object.keys(prev);
      const nextKeys = Object.keys(initialCategories);
      if (prevKeys.length !== nextKeys.length) {return initialCategories;}
      for (const k of nextKeys) {
        if (prev[k] !== initialCategories[k]) {return initialCategories;}
      }
      return prev;
    });
  }, [checkoutTrips]);

  // Calculate total price
  const serviceFee = 0;

  // Check booking restrictions for all trips
  const checkBookingRestrictions = async () => {
    if (!userInfo || checkoutTrips.length === 0) {
      setCheckingRestrictions(false);
      setBlockedTrips([]);
      setExistingRequests([]);
      return;
    }

    setCheckingRestrictions(true);

    try {
      // Fetch user's existing requests
    let userRequestsData = [];
    if (userInfo?.id) {
      try {
        const requestsResult = await dispatch(getMyRequests(userInfo.id));
        if (requestsResult.payload?.requests) {
          userRequestsData = requestsResult.payload.requests;
        }
      } catch (error) {
        // Error fetching user requests - continue without them
      }
    }

    const blocked = [];
    const matchedRequests = [];
    // CRITICAL: Use UTC for "today" to match backend calculation
    const now = new Date();
    const todayYear = now.getUTCFullYear();
    const todayMonth = now.getUTCMonth();
    const todayDay = now.getUTCDate();
    const today = new Date(Date.UTC(todayYear, todayMonth, todayDay, 0, 0, 0, 0));

    for (const trip of checkoutTrips) {
      // For cart items: trip.tripId is the actual trip ID, trip._id is the cart item ID
      // For direct trips: trip._id is the trip ID
      const tripId = trip.tripId || trip._id;
      // Get selected category - use current state, fallback to trip's default
      const selectedCategory =
        selectedCategories[tripId] !== undefined
          ? selectedCategories[tripId]
          : trip.selectedCategory || "standard";
      // Parse date correctly to avoid timezone issues
      let startingDate = null;
      if (trip.startingDate) {
        if (typeof trip.startingDate === "string" && /^\d{4}-\d{2}-\d{2}$/.test(trip.startingDate)) {
          startingDate = parse(trip.startingDate, "yyyy-MM-dd", new Date());
        } else if (typeof trip.startingDate === "string" && trip.startingDate.includes("T")) {
          // Handle ISO date strings - extract date part and parse as local
          const datePart = trip.startingDate.split("T")[0];
          startingDate = parse(datePart, "yyyy-MM-dd", new Date());
        } else {
          startingDate = new Date(trip.startingDate);
        }
      }
      const categoryName = trip.categoryName || trip.category?.name || "";

      if (!startingDate) {continue;}

      // CRITICAL: Use UTC for date calculations to match backend
      // IMPORTANT: When we have an ISO string like '2026-02-03T23:00:00.000Z',
      // we need to extract the UTC date components, not local ones
      let tripStartUTC;
      if (typeof trip.startingDate === "string" && trip.startingDate.includes("T")) {
        // ISO string - parse it and use UTC components (what backend will use)
        const parsed = new Date(trip.startingDate);
        const utcYear = parsed.getUTCFullYear();
        const utcMonth = parsed.getUTCMonth();
        const utcDay = parsed.getUTCDate();
        tripStartUTC = new Date(Date.UTC(utcYear, utcMonth, utcDay, 0, 0, 0, 0));
      } else {
        // Non-ISO string or Date object - extract local date components
        const localYear = startingDate.getFullYear();
        const localMonth = startingDate.getMonth();
        const localDay = startingDate.getDate();
        tripStartUTC = new Date(Date.UTC(localYear, localMonth, localDay, 0, 0, 0, 0));
      }

      // Use the already-calculated UTC today (calculated at the start of the function)
      const todayUTC = today;

      // Calculate days until trip using UTC dates (matching backend)
      const daysUntilTrip = Math.ceil(
        (tripStartUTC.getTime() - todayUTC.getTime()) / (1000 * 60 * 60 * 24),
      );

      const categoryLower = categoryName.toLowerCase();

      const isSafari = categoryLower.includes("safari");
      const isCultural = categoryLower.includes("cultural");
      const isTrekking = categoryLower.includes("trekking");
      const isZanzibar = categoryLower.includes("zanzibar");

      const isBudget = selectedCategory === "standard";
      const isMidOrLux =
        selectedCategory === "midRange" || selectedCategory === "luxury";

      let isBlocked = false;
      let restrictionMessage = "";

      // Block trips that start today or in the past (should never happen, but safety check)
      if (daysUntilTrip < 1) {
        isBlocked = true;
        restrictionMessage =
          "This trip date has already passed or is today. Please select a future date.";
      }
      // Cultural / Trekking / Zanzibar (all packages): block tomorrow
      else if (isCultural || isTrekking || isZanzibar) {
        if (daysUntilTrip === 1) {
          isBlocked = true;
          restrictionMessage =
            "This trip starts tomorrow. Please submit an availability request and we will review it. Once approved, you can proceed with checkout and payment.";
        }
      } else if (isSafari) {
        // Safaris - Budget: block tomorrow
        if (isBudget && daysUntilTrip === 1) {
          isBlocked = true;
          restrictionMessage =
            "This Safari trip starts tomorrow. Please submit an availability request and we will review it. Once approved, you can proceed with checkout and payment.";
        }

        // Safaris - Mid-Range / Luxury: block 1–4 days
        if (isMidOrLux && daysUntilTrip >= 1 && daysUntilTrip <= 4) {
          isBlocked = true;
          restrictionMessage = `This Midrange/Luxury Safari trip starts within 4 days (${daysUntilTrip} day${daysUntilTrip !== 1 ? "s" : ""}). Please submit an availability request and we will review it. Once approved, you can proceed with checkout and payment.`;
        }
      }

      // If blocked, check if user has an approved request
      let existingRequest = null;
      if (isBlocked && userInfo?.id) {
        // Check existing requests first - compare dates as YYYY-MM-DD strings to avoid timezone issues
        const requestDateStr = startingDate.toISOString().split("T")[0];
        existingRequest = userRequestsData.find((req) => {
          // Parse requestedDate correctly to avoid timezone issues
          let reqDateStr;
          if (req.requestedDate instanceof Date) {
            reqDateStr = req.requestedDate.toISOString().split("T")[0];
          } else if (typeof req.requestedDate === "string") {
            if (req.requestedDate.includes("T")) {
              reqDateStr = req.requestedDate.split("T")[0];
            } else {
              reqDateStr = req.requestedDate; // Already in YYYY-MM-DD format
            }
          } else {
            reqDateStr = new Date(req.requestedDate).toISOString().split("T")[0];
          }

          // Match trip ID (handle both populated and non-populated)
          const reqTripId = req.tripId?._id?.toString() || req.tripId?.toString();
          const matchesTrip = reqTripId === tripId.toString();

          // Match date and category
          const matchesDate = reqDateStr === requestDateStr;
          const matchesCategory = req.selectedCategory === selectedCategory;

          return matchesTrip && matchesDate && matchesCategory;
        });

        if (existingRequest) {
          if (existingRequest.status === "approved") {
            // User has approved request, allow booking - CRITICAL: Set isBlocked to false
            isBlocked = false;
            console.log(`✅ Approved request found for trip ${tripId}, date ${requestDateStr}, category ${selectedCategory} - allowing booking`);
          } else {
            // User has pending/rejected request, show status
            matchedRequests.push({
              trip,
              tripId,
              selectedCategory,
              startingDate,
              categoryName,
              daysUntilTrip,
              restrictionMessage,
              request: existingRequest,
            });
          }
        } else {
          // Check eligibility API as fallback - this is important for real-time checks
          try {
            const result = await dispatch(
              checkBookingEligibility({
                tripId,
                requestedDate: startingDate.toISOString(),
                selectedCategory,
                customerId: userInfo.id,
              }),
            );
            if (result.payload?.allowed && result.payload?.hasApprovedRequest) {
              // User has approved request, allow booking
              isBlocked = false;
              console.log(`✅ Approved request found via API for trip ${tripId} - allowing booking`);
            }
          } catch (error) {
            console.error("Error checking booking eligibility:", error);
            // If check fails, keep blocked status
          }
        }
      }

      // Add to blocked trips ONLY if still blocked after checking for approved requests
      // If isBlocked is false (because of approved request), don't add to blocked list
      if (isBlocked) {
        // Only add if there's no approved request (approved requests unblock the trip)
        if (!existingRequest || (existingRequest && existingRequest.status !== "approved")) {
          blocked.push({
            trip,
            tripId,
            selectedCategory,
            startingDate,
            categoryName,
            daysUntilTrip,
            restrictionMessage,
            existingRequest: existingRequest || null, // Include existing request info if any
          });
        } else {
          console.log(`✅ Trip ${tripId} has approved request - not adding to blocked list`);
        }
      } else {
        console.log(`✅ Trip ${tripId} is not blocked - allowing checkout`);
      }
    }

      setBlockedTrips(blocked);
      setExistingRequests(matchedRequests);
      // Show form only if there are blocked trips
      // This will show the availability form for blocked trips, and checkout for allowed trips
      setShowAvailabilityForm(blocked.length > 0);
      
      // Log for debugging (can be removed in production)
      if (process.env.NODE_ENV === 'development') {
        console.log('[Checkout] Availability check results:', {
          totalTrips: checkoutTrips.length,
          blockedTrips: blocked.length,
          allowedTrips: checkoutTrips.length - blocked.length,
          blockedTripIds: blocked.map(bt => bt.tripId?.toString() || bt.trip?._id?.toString()),
        });
      }
    } catch (error) {
      // On error, allow checkout but log the error
      setBlockedTrips([]);
      setExistingRequests([]);
    } finally {
      setCheckingRestrictions(false);
    }
  };

  // Check restrictions when trips change
  useEffect(() => {
    // Important: in direct-trip checkout, `checkoutTrips` can be temporarily empty
    // while the trip is fetching. Avoid getting stuck in a perpetual loading state.
    if (checkoutTrips.length === 0) {
      setCheckingRestrictions(false);
      return;
    }

    checkBookingRestrictions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [checkoutTrips.length, userInfo?.id]);

  // Re-check restrictions when categories change (category affects blocking rules)
  // Use a ref to track previous categories to avoid unnecessary re-checks
  const prevCategoriesRef = useRef(JSON.stringify(selectedCategories));
  useEffect(() => {
    const currentCategoriesStr = JSON.stringify(selectedCategories);
    // Only re-check if categories actually changed and we have trips
    if (
      checkoutTrips.length > 0 &&
      userInfo?.id &&
      currentCategoriesStr !== prevCategoriesRef.current &&
      Object.keys(selectedCategories).length > 0
    ) {
      prevCategoriesRef.current = currentCategoriesStr;
      checkBookingRestrictions();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategories, checkoutTrips.length, userInfo?.id]);

  // Helper function to get applicable rates based on pricing type and date
  const getApplicableRates = (trip) => {
    if (trip.pricingType === "yearRound") {
      return trip.regularPrices;
    }

    if (trip.pricingType === "seasonal" && trip.seasons) {
      const tripDate = trip.startingDate
        ? new Date(trip.startingDate)
        : new Date();

      const applicableSeason = trip.seasons.find((season) => {
        const startDate = new Date(season.startDate);
        const endDate = new Date(season.endDate);
        return tripDate >= startDate && tripDate <= endDate;
      });

      return applicableSeason ? applicableSeason.rates : trip.regularPrices;
    }

    return trip.regularPrices;
  };

  const getCategoryRates = (rates, category = "standard") => {
    // Handle new category-specific pricing structure
    if (rates && rates[category]) {
      return rates[category];
    } else if (rates && rates.onePerson) {
      // Fallback for old structure - return the rates as-is
      return rates;
    }
    return null;
  };

  const subtotal = checkoutTrips.reduce((sum, trip) => {
    // For cart items: trip.tripId is the actual trip ID, trip._id is the cart item ID
    // For direct trips: trip._id is the trip ID
    const tripId = trip.tripId || trip._id;
    const travelersNumber = trip.travelersNumber || 1;

    const rates = getApplicableRates(trip);

    if (!rates) {
      return sum;
    }

    // Get category-specific rates (defaulting to standard)
    const selectedCategory =
      selectedCategories[tripId] || trip.selectedCategory || "standard";
    const categoryRates = getCategoryRates(rates, selectedCategory);
    if (!categoryRates) {
      return sum;
    }

    // Get the appropriate rate based on number of travelers
    let pricePerPerson;
    switch (travelersNumber) {
      case 1:
        pricePerPerson = categoryRates.onePerson;
        break;
      case 2:
        pricePerPerson = categoryRates.twoPerson;
        break;
      case 3:
        pricePerPerson = categoryRates.threePerson;
        break;
      case 4:
        pricePerPerson = categoryRates.fourPerson;
        break;
      default:
        pricePerPerson = categoryRates.fiveOrMorePerson;
        break;
    }

    if (!pricePerPerson || pricePerPerson <= 0) {
      return sum;
    }

    const totalWithoutDiscount = pricePerPerson * travelersNumber;
    const discountAmount = (totalWithoutDiscount * (trip.discount || 0)) / 100;
    const finalPrice = totalWithoutDiscount - discountAmount;

    return sum + finalPrice;
  }, 0);

  const total = subtotal + serviceFee;

  // Handle category change
  const handleCategoryChange = (tripId, newCategory) => {
    setSelectedCategories((prev) => ({
      ...prev,
      [tripId]: newCategory,
    }));
  };

  // Handle order creation success
  useEffect(() => {
    if (orderCreationStatus === "success" && currentOrder) {
      if (!directTripId) {
        dispatch(clear_cart(userInfo.id));
        dispatch(clearMessage());
      }

      // Clear order messages
      dispatch(clearOrderMessages());

      // Check if WeTravel payment link exists - redirect DIRECTLY to payment
      const paymentLink = currentOrder?.payment?.weTravelPaymentLink;
      if (paymentLink) {
        // Validate and safely redirect DIRECTLY to WeTravel payment page
        // Allow WeTravel domains for payment processing
        const allowedDomains = [
          "wetravel.net",
          "wetravel.com",
          "wetravel.io",
          "www.wetravel.net",
          "www.wetravel.com",
        ];
        const redirectSuccess = safeRedirect(paymentLink, allowedDomains);
        if (!redirectSuccess) {
          toast.error("Invalid payment link. Please contact support.");
          navigate("/order-confirmation", {
            state: {
              orderId: currentOrder?._id,
              orderNumber: currentOrder?.orderNumber,
              paymentPending: true,
            },
          });
        }
        // If redirect is successful, don't navigate - safeRedirect handles it
        return; // Exit early to prevent navigation to order-confirmation
      } else {
        // No payment link available - this shouldn't happen if order was created successfully
        toast.error("Payment link not available. Please contact support.");
        navigate("/order-confirmation", {
          state: {
            orderId: currentOrder?._id,
            orderNumber: currentOrder?.orderNumber,
            paymentPending: true,
          },
        });
      }
    }
  }, [
    orderCreationStatus,
    currentOrder,
    dispatch,
    navigate,
    userInfo.id,
    directTripId,
  ]);

  // Clear messages when component unmounts
  useEffect(() => {
    return () => {
      dispatch(clearOrderMessages());
    };
  }, [dispatch]);

  const handlePlaceOrder = async () => {
    // Validate required fields first
    const { personalInfo, billingAddress } = formData;

    // Check if all required fields are filled
    // Note: Billing address is optional - WeTravel API doesn't require it
    const requiredFieldsEmpty = [
      !personalInfo.firstName,
      !personalInfo.lastName,
      !personalInfo.email,
      !personalInfo.phone,
    ].some(Boolean);

    if (requiredFieldsEmpty) {
      toast.error(
        "Please fill in all required fields (first name, last name, email, and phone) before placing your order.",
      );
      return;
    }

    // Validate email format
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(personalInfo.email)) {
      toast.error("Please enter a valid email address.");
      return;
    }

    try {
      // Filter out blocked trips - only include trips that are allowed
      const blockedTripIds = new Set(blockedTrips.map((bt) => bt.tripId?.toString() || bt.trip?._id?.toString()));
      const allowedTrips = checkoutTrips.filter((trip) => {
        const tripId = trip.tripId || trip._id;
        return !blockedTripIds.has(tripId?.toString());
      });

      if (allowedTrips.length === 0) {
        toast.error("No trips available for checkout. Please resolve availability issues first.");
        return;
      }

      // Prepare cart items for order creation (only allowed trips)
      const cartItems = allowedTrips.map((cartItem) => {
        // For cart items: cartItem.tripId is the actual trip ID, cartItem._id is the cart item ID
        // For direct trips: cartItem._id is the trip ID
        const tripId = cartItem.tripId || cartItem._id;
        // Get the trip data from the lookup
        const trip =
          cartItem.trip && cartItem.trip.length > 0
            ? cartItem.trip[0]
            : cartItem;

        // Ensure we have proper travelersNumber
        const travelersNumber = cartItem.travelersNumber || 1;

        // Get selected category for this trip
        const selectedCategory =
          selectedCategories[tripId] || cartItem.selectedCategory || "standard";

        // Get applicable rates
        const rates = getApplicableRates(trip);
        const categoryRates = getCategoryRates(rates, selectedCategory);

        // Determine price per person based on category and travelers
        let pricePerPerson = 0;
        if (categoryRates) {
          switch (travelersNumber) {
            case 1:
              pricePerPerson = categoryRates.onePerson;
              break;
            case 2:
              pricePerPerson = categoryRates.twoPerson;
              break;
            case 3:
              pricePerPerson = categoryRates.threePerson;
              break;
            case 4:
              pricePerPerson = categoryRates.fourPerson;
              break;
            default:
              pricePerPerson = categoryRates.fiveOrMorePerson;
              break;
          }
        }

        const totalWithoutDiscount = pricePerPerson * travelersNumber;
        const discountAmount =
          (totalWithoutDiscount * (trip.discount || cartItem.discount || 0)) /
          100;
        const finalPrice = totalWithoutDiscount - discountAmount;

        return {
          tripId, // Use the tripId we defined earlier (prioritizes tripId over _id)
          mainTitle:
            cartItem.mainTitle ||
            trip.mainTitle ||
            cartItem.title ||
            "Unknown Trip",
          mainImage: cartItem.mainImage || trip.mainImage || "",
          startingDate: cartItem.startingDate || new Date().toISOString(),
          travelersNumber,
          pricingType: trip.pricingType,
          discount: trip.discount || cartItem.discount || 0,
          itemSubtotal: finalPrice,
          itemTotal: finalPrice,
          specialRequests: "",
          regularPrices: trip.regularPrices,
          seasons: trip.seasons,
          selectedCategory,
        };
      });

      // Validate required fields
      const requiredFields = {
        customerId: userInfo.id,
        cartItems,
        personalInfo: {
          firstName: formData.personalInfo.firstName,
          lastName: formData.personalInfo.lastName,
          email: formData.personalInfo.email,
          phone: formData.personalInfo.phone,
        },
        // Billing address not collected - WeTravel handles it on their payment page
        billingAddress: undefined,
        paymentInfo: {
          method: "wetravel",
          status: "pending",
        },
        serviceFee: serviceFee, // Include service fee in order
      };

      // Check for missing required fields
      // Note: billingAddress is optional - only validate if provided
      const missingFields = [];
      if (!requiredFields.customerId) {missingFields.push("customerId");}
      if (!requiredFields.cartItems || requiredFields.cartItems.length === 0)
        {missingFields.push("cartItems");}
      if (!requiredFields.personalInfo.firstName)
        {missingFields.push("personalInfo.firstName");}
      if (!requiredFields.personalInfo.lastName)
        {missingFields.push("personalInfo.lastName");}
      if (!requiredFields.personalInfo.email)
        {missingFields.push("personalInfo.email");}
      if (!requiredFields.personalInfo.phone)
        {missingFields.push("personalInfo.phone");}
      // Billing address is optional - no validation needed

      if (missingFields.length > 0) {
        return;
      }

      // Create order
      const result = await dispatch(createOrder(requiredFields));

      if (result?.error) {
        toast.error(
          result.error.message || "Failed to create order. Please try again.",
        );
      }
    } catch (error) {
      toast.error(
        "An error occurred while creating your order. Please try again.",
      );
    }
  };

  return (
    <div className="from-background-nature via-background-sunset flex min-h-screen flex-col bg-gradient-to-br to-background-paper">
      <Header />
      <main className="flex-grow py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Checkout Header */}
          <div className="mb-10 text-center">
            <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl">
              {!checkingRestrictions && blockedTrips.length > 0 && checkoutTrips.length === blockedTrips.length
                ? "Availability Request Required"
                : "Complete Your Booking"}
            </h1>
            <p className="mt-3 text-lg text-gray-600">
              {!checkingRestrictions && blockedTrips.length > 0 && checkoutTrips.length === blockedTrips.length
                ? "Please submit availability requests for your trips before proceeding with checkout"
                : "Review your order summary and confirm your booking"}
            </p>
          </div>

          {/* Loading State */}
          {checkingRestrictions && (
            <div className="mb-8 flex items-center justify-center rounded-2xl border-2 border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50 p-12 shadow-lg">
              <div className="text-center">
                <div className="mb-4 inline-block h-12 w-12 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent"></div>
                <p className="text-base font-semibold text-emerald-700">
                  Checking booking availability...
                </p>
                <p className="mt-2 text-sm text-emerald-600">
                  Please wait while we verify your trip dates
                </p>
              </div>
            </div>
          )}

          {/* Show info message if there are mixed scenarios (some trips allowed, some blocked) */}
          {!checkingRestrictions && blockedTrips.length > 0 && (() => {
            const blockedTripIds = new Set(blockedTrips.map((bt) => bt.tripId?.toString() || bt.trip?._id?.toString()));
            const allowedTrips = checkoutTrips.filter((trip) => {
              const tripId = trip.tripId || trip._id;
              return !blockedTripIds.has(tripId?.toString());
            });
            return allowedTrips.length > 0;
          })() && (
            <div className="mb-6 rounded-xl border-2 border-blue-300 bg-gradient-to-r from-blue-50 to-cyan-50 p-6 shadow-lg">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-500">
                    <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="mb-2 text-xl font-bold text-blue-900">
                    Partial Checkout Available
                  </h3>
                  <p className="mb-2 text-sm font-medium text-blue-800">
                    You can proceed with booking the trips that are available now. For trips requiring availability approval, please submit availability requests below. Once approved, you&apos;ll be able to book those trips as well.
                  </p>
                  <p className="text-xs text-blue-700">
                    Only trips that meet booking requirements will be included in your order.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Show Request Status if user has existing requests */}
          {!checkingRestrictions && existingRequests.length > 0 && (
            <div className="mb-6 space-y-4">
              {existingRequests.map((item, index) => {
                const { request, trip } = item;
                const statusColors = {
                  pending: "bg-yellow-50 border-yellow-300 text-yellow-900",
                  approved: "bg-green-50 border-green-300 text-green-900",
                  rejected: "bg-red-50 border-red-300 text-red-900",
                };
                const statusIcons = {
                  pending: "⏳",
                  approved: "✅",
                  rejected: "❌",
                };
                const statusMessages = {
                  pending:
                    "Your request is pending review. We&apos;ll get back to you within 24-48 hours.",
                  approved:
                    "Your request has been approved! You can now proceed with checkout.",
                  rejected: request.rejectedReason
                    ? `Your request was rejected: ${request.rejectedReason}`
                    : "Your request was rejected. Please contact support for more information.",
                };

                return (
                  <div
                    key={request._id || index}
                    className={`rounded-xl border-2 p-6 shadow-lg ${statusColors[request.status] || statusColors.pending}`}
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/70 text-2xl">
                          {statusIcons[request.status] || "⏳"}
                        </div>
                      </div>
                      <div className="flex-1">
                        <h3 className="mb-2 text-xl font-bold">
                          Request Status:{" "}
                          {request.status?.charAt(0).toUpperCase() +
                            request.status?.slice(1)}
                        </h3>
                        <p className="mb-4 text-sm font-medium">
                          {trip.mainTitle || "Trip"}
                        </p>
                        <p className="mb-2 text-sm">
                          {statusMessages[request.status] ||
                            statusMessages.pending}
                        </p>
                        <div className="mt-4 space-y-1 text-xs">
                          <p>
                            <strong>Request ID:</strong> {request._id || "N/A"}
                          </p>
                          <p>
                            <strong>Requested Date:</strong>{" "}
                            {(() => {
                              // Parse date correctly to preserve intended date
                              // CRITICAL: Extract UTC date components to avoid timezone shifts
                              let displayDate;
                              if (typeof item.startingDate === "string" && /^\d{4}-\d{2}-\d{2}$/.test(item.startingDate)) {
                                displayDate = parse(item.startingDate, "yyyy-MM-dd", new Date());
                              } else if (typeof item.startingDate === "string" && item.startingDate.includes("T")) {
                                // ISO string - extract UTC date components to preserve intended date
                                const parsed = new Date(item.startingDate);
                                const utcYear = parsed.getUTCFullYear();
                                const utcMonth = parsed.getUTCMonth();
                                const utcDay = parsed.getUTCDate();
                                displayDate = new Date(Date.UTC(utcYear, utcMonth, utcDay));
                              } else {
                                displayDate = new Date(item.startingDate);
                              }
                              return displayDate.toLocaleDateString("en-US", {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              });
                            })()}
                          </p>
                          <p>
                            <strong>Package:</strong>{" "}
                            {item.selectedCategory === "standard"
                              ? "Budget"
                              : item.selectedCategory === "midRange"
                                ? "Mid-Range"
                                : "Luxury"}
                          </p>
                          {request.status === "approved" && (
                            <p className="mt-2 text-sm font-semibold">
                              You can now proceed with checkout and payment.
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Show Availability Form if trips are blocked */}
          {!checkingRestrictions &&
            blockedTrips.length > 0 && (
              <div className="mb-6">
                <AvailabilityRequestForm
                  blockedTrips={blockedTrips}
                  formData={formData}
                  handleChange={handleChange}
                  onRequestSubmitted={async () => {
                    // Navigate to dashboard booking requests page after successful submission
                    // Small delay to allow user to see the success message from AvailabilityRequestForm
                    setTimeout(() => {
                      navigate("/dashboard/booking-requests");
                    }, 4000); // 2 second delay to show success message
                  }}
                />
              </div>
            )}

          {/* Show checkout form ONLY if there are allowed trips
              - If ALL trips are blocked without approval: DON'T show checkout (only show availability form)
              - If SOME trips are allowed: Show checkout for allowed trips + availability form for blocked
              - If ALL trips are allowed: Show checkout normally */}
          {!checkingRestrictions && (() => {
            // Get blocked trip IDs for filtering - normalize all IDs to strings
            const blockedTripIds = new Set();
            blockedTrips.forEach((bt) => {
              const id1 = bt.tripId?.toString();
              const id2 = bt.trip?._id?.toString();
              if (id1) {
                blockedTripIds.add(id1);
              }
              if (id2 && id2 !== id1) {
                blockedTripIds.add(id2);
              }
            });

            // CRITICAL CHECK: If ALL trips are blocked without approval, BLOCK checkout entirely
            // Check if every trip in checkoutTrips is in the blocked set
            const allTripsAreBlocked = checkoutTrips.length > 0 && checkoutTrips.every((trip) => {
              const tripId1 = trip.tripId?.toString();
              const tripId2 = trip._id?.toString();
              return blockedTripIds.has(tripId1) || blockedTripIds.has(tripId2);
            });

            if (allTripsAreBlocked && blockedTrips.length > 0) {
              // All trips are blocked - check if ANY have approved requests
              const hasAnyApproved = blockedTrips.some((blockedTrip) => {
                // Check if this blocked trip has an approved request
                if (blockedTrip.existingRequest?.status === "approved") {
                  return true;
                }

                const tripId = blockedTrip.tripId?.toString() || blockedTrip.trip?._id?.toString();
                const approvedRequest = existingRequests.find((req) => {
                  const reqTripId = req.tripId?.toString() || req.tripId?._id?.toString();
                  return reqTripId === tripId && req.request?.status === "approved";
                });
                return Boolean(approvedRequest);
              });

              // If ALL trips are blocked and NONE have approved requests, BLOCK checkout entirely
              if (!hasAnyApproved) {
                return false; // Don't show checkout - only show availability form
              }
            }

            // Filter out trips with pending/rejected requests (unless approved)
            const tripsWithPendingRequests = new Set(
              existingRequests
                .filter((req) => req.request?.status !== "approved")
                .map((req) => req.tripId?.toString()),
            );

            // Get allowed trips (trips not blocked OR blocked but approved)
            const allowedTrips = checkoutTrips.filter((trip) => {
              const tripId1 = trip.tripId?.toString();
              const tripId2 = trip._id?.toString();
              const isBlocked = blockedTripIds.has(tripId1) || blockedTripIds.has(tripId2);

              // If trip is blocked, it must have an approved request to be allowed
              if (isBlocked) {
                // Check if this blocked trip has an approved request
                const blockedTrip = blockedTrips.find((bt) => {
                  const btId1 = bt.tripId?.toString();
                  const btId2 = bt.trip?._id?.toString();
                  return btId1 === tripId1 || btId1 === tripId2 || btId2 === tripId1 || btId2 === tripId2;
                });

                // Check blockedTrip's existingRequest first
                if (blockedTrip?.existingRequest?.status === "approved") {
                  return true;
                }

                // Also check in existingRequests array
                const approvedRequest = existingRequests.find((req) => {
                  const reqTripId = req.tripId?.toString() || req.tripId?._id?.toString();
                  return (reqTripId === tripId1 || reqTripId === tripId2) && req.request?.status === "approved";
                });
                return Boolean(approvedRequest);
              }

              // If trip is not blocked, check it doesn't have pending/rejected requests
              return !tripsWithPendingRequests.has(tripId1) && !tripsWithPendingRequests.has(tripId2);
            });

            // FINAL SAFEGUARD: If blocked trips count equals checkout trips count and none are approved, block checkout
            // This handles the case where ALL trips are blocked (single trip or multiple)
            if (blockedTrips.length === checkoutTrips.length && checkoutTrips.length > 0) {
              const allBlockedHaveApproval = blockedTrips.every((blockedTrip) => {
                // Check if this blocked trip has an approved request
                if (blockedTrip.existingRequest?.status === "approved") {
                  return true;
                }
                const tripId = blockedTrip.tripId?.toString() || blockedTrip.trip?._id?.toString();
                const approvedRequest = existingRequests.find((req) => {
                  const reqTripId = req.tripId?.toString() || req.tripId?._id?.toString();
                  return reqTripId === tripId && req.request?.status === "approved";
                });
                return Boolean(approvedRequest);
              });

              if (!allBlockedHaveApproval) {
                return false;
              }
            }

            // Show checkout form if there are ANY allowed trips
            return allowedTrips.length > 0;
          })() && (
              <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                {/* Left Column - Forms & Order Summary */}
                <div className="space-y-6 lg:col-span-2">
                  {/* Contact Information Form */}
                  <div className="overflow-hidden rounded-3xl border-2 border-gray-200 bg-white shadow-xl">
                    <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-5">
                      <h2 className="text-xl font-bold text-white">
                        Contact Information
                      </h2>
                      <p className="mt-1 text-sm text-emerald-50">
                        We'll use this to send your booking confirmation
                      </p>
                    </div>
                    <div className="p-6">
                      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                        <div>
                          <label className="mb-2 block text-sm font-semibold text-gray-700">
                            First Name *
                          </label>
                          <input
                            type="text"
                            value={formData.personalInfo.firstName}
                            onChange={(e) =>
                              handleChange(
                                "personalInfo",
                                "firstName",
                                e.target.value,
                              )
                            }
                            className="w-full rounded-xl border-2 border-gray-200 bg-white px-4 py-3 text-sm font-medium transition-all focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-500/10"
                            placeholder="John"
                          />
                        </div>
                        <div>
                          <label className="mb-2 block text-sm font-semibold text-gray-700">
                            Last Name *
                          </label>
                          <input
                            type="text"
                            value={formData.personalInfo.lastName}
                            onChange={(e) =>
                              handleChange(
                                "personalInfo",
                                "lastName",
                                e.target.value,
                              )
                            }
                            className="w-full rounded-xl border-2 border-gray-200 bg-white px-4 py-3 text-sm font-medium transition-all focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-500/10"
                            placeholder="Doe"
                          />
                        </div>
                        <div>
                          <label className="mb-2 block text-sm font-semibold text-gray-700">
                            Email *
                          </label>
                          <input
                            type="email"
                            value={formData.personalInfo.email}
                            onChange={(e) =>
                              handleChange(
                                "personalInfo",
                                "email",
                                e.target.value,
                              )
                            }
                            className="w-full rounded-xl border-2 border-gray-200 bg-white px-4 py-3 text-sm font-medium transition-all focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-500/10"
                            placeholder="john@example.com"
                          />
                        </div>
                        <div>
                          <label className="mb-2 block text-sm font-semibold text-gray-700">
                            Phone *
                          </label>
                          <input
                            type="tel"
                            value={formData.personalInfo.phone}
                            onChange={(e) =>
                              handleChange(
                                "personalInfo",
                                "phone",
                                e.target.value,
                              )
                            }
                            className="w-full rounded-xl border-2 border-gray-200 bg-white px-4 py-3 text-sm font-medium transition-all focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-500/10"
                            placeholder="+1234567890"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Order Summary */}
                  <div className="overflow-hidden rounded-3xl border-2 border-gray-200 bg-white shadow-xl">
                    <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-5">
                      <h2 className="text-xl font-bold text-white">
                        Order Summary
                      </h2>
                      <p className="mt-1 text-sm text-emerald-50">
                        Review your trip details
                      </p>
                    </div>
                    <div className="p-6">

                    <div className="space-y-6">
                      {(() => {
                        // Filter to show only allowed trips in checkout form
                        const blockedTripIds = new Set(blockedTrips.map((bt) => bt.tripId?.toString() || bt.trip?._id?.toString()));
                        const tripsWithPendingRequests = new Set(
                          existingRequests
                            .filter((req) => req.request?.status !== "approved")
                            .map((req) => req.tripId?.toString())
                        );
                        return checkoutTrips.filter((trip) => {
                          const tripId = trip.tripId || trip._id;
                          return !blockedTripIds.has(tripId?.toString()) &&
                                 !tripsWithPendingRequests.has(tripId?.toString());
                        });
                      })().map((trip) => {
                        // For cart items: trip.tripId is the actual trip ID, trip._id is the cart item ID
                        // For direct trips: trip._id is the trip ID
                        const tripId = trip.tripId || trip._id;
                        const currentCategory =
                          selectedCategories[tripId] ||
                          trip.selectedCategory ||
                          "standard";
                        const rates = getApplicableRates(trip);
                        const categoryRates = getCategoryRates(
                          rates,
                          currentCategory,
                        );

                        let pricePerPerson = 0;
                        if (categoryRates) {
                          switch (trip.travelersNumber) {
                            case 1:
                              pricePerPerson = categoryRates.onePerson;
                              break;
                            case 2:
                              pricePerPerson = categoryRates.twoPerson;
                              break;
                            case 3:
                              pricePerPerson = categoryRates.threePerson;
                              break;
                            case 4:
                              pricePerPerson = categoryRates.fourPerson;
                              break;
                            default:
                              pricePerPerson = categoryRates.fiveOrMorePerson;
                              break;
                          }
                        }

                        const totalWithoutDiscount =
                          pricePerPerson * trip.travelersNumber;
                        const discountAmount =
                          (totalWithoutDiscount * (trip.discount || 0)) / 100;
                        const finalPrice =
                          totalWithoutDiscount - discountAmount;

                        return (
                          <div
                            key={tripId}
                            className="border-b-2 border-gray-100 pb-6 last:border-b-0 last:pb-0"
                          >
                            <div className="flex items-start gap-4">
                              <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-xl shadow-md">
                                <img
                                  src={
                                    trip.mainImage
                                      ? IMAGES_URL +
                                        trip.mainImage.split("/").pop()
                                      : "/placeholder.svg"
                                  }
                                  alt={trip.mainTitle}
                                  className="h-full w-full object-cover"
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h3 className="text-lg font-bold text-gray-900">
                                  {trip.mainTitle}
                                </h3>
                                <p className="mt-2 text-sm font-medium text-gray-600">
                                  {(() => {
                                    // Parse date correctly to avoid timezone issues
                                    // CRITICAL: Extract UTC date components to preserve intended date
                                    let displayDate;
                                    if (typeof trip.startingDate === "string" && /^\d{4}-\d{2}-\d{2}$/.test(trip.startingDate)) {
                                      displayDate = parse(trip.startingDate, "yyyy-MM-dd", new Date());
                                    } else if (typeof trip.startingDate === "string" && trip.startingDate.includes("T")) {
                                      // ISO string - extract UTC date components to preserve intended date
                                      const parsed = new Date(trip.startingDate);
                                      const utcYear = parsed.getUTCFullYear();
                                      const utcMonth = parsed.getUTCMonth();
                                      const utcDay = parsed.getUTCDate();
                                      displayDate = new Date(Date.UTC(utcYear, utcMonth, utcDay));
                                    } else {
                                      displayDate = new Date(trip.startingDate);
                                    }
                                    return displayDate.toLocaleDateString();
                                  })()}{" "}
                                  • {trip.travelersNumber}{" "}
                                  {trip.travelersNumber === 1
                                    ? "person"
                                    : "people"}
                                </p>
                              </div>
                              <div className="text-xl font-extrabold text-emerald-600">
                                ${finalPrice.toFixed(2)}
                              </div>
                            </div>

                            {/* Category Selection */}
                            <div className="mt-4 flex flex-wrap items-center gap-4 rounded-lg bg-gray-50 p-4">
                              <label className="text-sm font-semibold text-gray-700">
                                Package Type:
                              </label>
                              <select
                                value={currentCategory}
                                onChange={(e) =>
                                  handleCategoryChange(tripId, e.target.value)
                                }
                                className="rounded-xl border-2 border-gray-200 bg-white px-4 py-2 text-sm font-medium transition-all focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-500/10"
                              >
                                <option value="standard">Budget</option>
                                <option value="midRange">Mid-Range</option>
                                <option value="luxury">Luxury</option>
                              </select>
                              <div className="ml-auto rounded-lg bg-emerald-100 px-3 py-1.5 text-sm font-semibold text-emerald-700">
                                ${pricePerPerson?.toFixed(2)} per person
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Show loading state */}
                    {loader && (
                      <div className="mt-4 text-center">
                        <div className="inline-flex items-center">
                          <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent"></div>
                          <span className="text-sm text-gray-600">
                            Processing your order...
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Show error message */}
                    {errorMessage && (
                      <div className="mt-4 rounded-lg bg-red-50 p-4">
                        <p className="text-sm text-red-600">{errorMessage}</p>
                      </div>
                    )}

                    {/* Show success message */}
                    {successMessage && (
                      <div className="mt-4 rounded-lg bg-green-50 p-4">
                        <p className="text-sm text-green-600">
                          {successMessage}
                        </p>
                      </div>
                    )}

                    {/* Place Order Button - Show if there are allowed trips */}
                    {(() => {
                      const blockedTripIds = new Set(blockedTrips.map((bt) => bt.tripId?.toString() || bt.trip?._id?.toString()));
                      const tripsWithPendingRequests = new Set(
                        existingRequests
                          .filter((req) => req.request?.status !== "approved")
                          .map((req) => req.tripId?.toString())
                      );
                      const allowedTrips = checkoutTrips.filter((trip) => {
                        const tripId = trip.tripId || trip._id;
                        return !blockedTripIds.has(tripId?.toString()) &&
                               !tripsWithPendingRequests.has(tripId?.toString());
                      });
                      return allowedTrips.length > 0;
                    })() && (
                        <div className="mt-8 border-t-2 border-gray-100 pt-6">
                          <button
                            onClick={handlePlaceOrder}
                            disabled={loader || checkoutTrips.length === 0}
                            className="flex w-full items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 px-8 py-4 text-base font-bold text-white shadow-lg transition-all hover:from-orange-600 hover:via-red-600 hover:to-pink-600 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
                          >
                            {loader ? (
                              <>
                                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                                <span>Processing...</span>
                              </>
                            ) : (
                              <>
                                <span>Place Order</span>
                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                </svg>
                              </>
                            )}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Column - Order Summary */}
                <div className="lg:col-span-1">
                  <OrderSummary
                    cart_trips={(() => {
                      // Show only allowed trips in order summary
                      const blockedTripIds = new Set(blockedTrips.map((bt) => bt.tripId?.toString() || bt.trip?._id?.toString()));
                      const tripsWithPendingRequests = new Set(
                        existingRequests
                          .filter((req) => req.request?.status !== "approved")
                          .map((req) => req.tripId?.toString())
                      );
                      return checkoutTrips.filter((trip) => {
                        const tripId = trip.tripId || trip._id;
                        return !blockedTripIds.has(tripId?.toString()) &&
                               !tripsWithPendingRequests.has(tripId?.toString());
                      });
                    })()}
                    subtotal={(() => {
                      // Recalculate subtotal for allowed trips only
                      const blockedTripIds = new Set(blockedTrips.map((bt) => bt.tripId?.toString() || bt.trip?._id?.toString()));
                      const tripsWithPendingRequests = new Set(
                        existingRequests
                          .filter((req) => req.request?.status !== "approved")
                          .map((req) => req.tripId?.toString())
                      );
                      const allowedTrips = checkoutTrips.filter((trip) => {
                        const tripId = trip.tripId || trip._id;
                        return !blockedTripIds.has(tripId?.toString()) &&
                               !tripsWithPendingRequests.has(tripId?.toString());
                      });
                      return allowedTrips.reduce((sum, trip) => {
                        const tripId = trip.tripId || trip._id;
                        const travelersNumber = trip.travelersNumber || 1;
                        const rates = getApplicableRates(trip);
                        if (!rates) return sum;
                        const selectedCategory = selectedCategories[tripId] || trip.selectedCategory || "standard";
                        const categoryRates = getCategoryRates(rates, selectedCategory);
                        if (!categoryRates) return sum;
                        let pricePerPerson = 0;
                        switch (travelersNumber) {
                          case 1: pricePerPerson = categoryRates.onePerson; break;
                          case 2: pricePerPerson = categoryRates.twoPerson; break;
                          case 3: pricePerPerson = categoryRates.threePerson; break;
                          case 4: pricePerPerson = categoryRates.fourPerson; break;
                          default: pricePerPerson = categoryRates.fiveOrMorePerson; break;
                        }
                        if (!pricePerPerson || pricePerPerson <= 0) return sum;
                        const totalWithoutDiscount = pricePerPerson * travelersNumber;
                        const discountAmount = (totalWithoutDiscount * (trip.discount || 0)) / 100;
                        return sum + (totalWithoutDiscount - discountAmount);
                      }, 0);
                    })()}
                    serviceFee={serviceFee}
                    total={(() => {
                      // Recalculate total for allowed trips only
                      const blockedTripIds = new Set(blockedTrips.map((bt) => bt.tripId?.toString() || bt.trip?._id?.toString()));
                      const tripsWithPendingRequests = new Set(
                        existingRequests
                          .filter((req) => req.request?.status !== "approved")
                          .map((req) => req.tripId?.toString())
                      );
                      const allowedTrips = checkoutTrips.filter((trip) => {
                        const tripId = trip.tripId || trip._id;
                        return !blockedTripIds.has(tripId?.toString()) &&
                               !tripsWithPendingRequests.has(tripId?.toString());
                      });
                      const allowedSubtotal = allowedTrips.reduce((sum, trip) => {
                        const tripId = trip.tripId || trip._id;
                        const travelersNumber = trip.travelersNumber || 1;
                        const rates = getApplicableRates(trip);
                        if (!rates) return sum;
                        const selectedCategory = selectedCategories[tripId] || trip.selectedCategory || "standard";
                        const categoryRates = getCategoryRates(rates, selectedCategory);
                        if (!categoryRates) return sum;
                        let pricePerPerson = 0;
                        switch (travelersNumber) {
                          case 1: pricePerPerson = categoryRates.onePerson; break;
                          case 2: pricePerPerson = categoryRates.twoPerson; break;
                          case 3: pricePerPerson = categoryRates.threePerson; break;
                          case 4: pricePerPerson = categoryRates.fourPerson; break;
                          default: pricePerPerson = categoryRates.fiveOrMorePerson; break;
                        }
                        if (!pricePerPerson || pricePerPerson <= 0) return sum;
                        const totalWithoutDiscount = pricePerPerson * travelersNumber;
                        const discountAmount = (totalWithoutDiscount * (trip.discount || 0)) / 100;
                        return sum + (totalWithoutDiscount - discountAmount);
                      }, 0);
                      return allowedSubtotal + serviceFee;
                    })()}
                  />
                </div>
              </div>
            )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Checkout;
