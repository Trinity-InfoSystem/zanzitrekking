import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import Header from "../components/Header";
import Footer from "../components/Footer";
import {
  clearOrderMessages,
  getOrderById,
  resetOrderCreationStatus,
} from "../store/reducers/orderReducer";
import { IMAGES_URL } from "../utils/constants";
import QRCodeDisplay from "../components/QRCodeDisplay";

import SEO from "../components/SEO";
const OrderConfirmation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { userInfo } = useSelector((state) => state.auth);
  const { currentOrder, loader, errorMessage, orderCreationStatus } =
    useSelector((state) => state.order);

  const [orderDetails, setOrderDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const hasFetched = useRef(false); // Track if we've already fetched

  // Get order details from location state or fetch from API
  useEffect(() => {
    // Skip if already fetched
    if (hasFetched.current) {
      return;
    }

    const { orderId } = location.state || {};

    if (orderId) {
      // Fetch order details from API using the specific orderId
      hasFetched.current = true;
      dispatch(getOrderById(orderId))
        .then((result) => {
          if (result.payload) {
            setOrderDetails(result.payload.order);
          }
          setIsLoading(false);
        })
        .catch(() => {
          setIsLoading(false);
        });
    } else if (currentOrder && orderCreationStatus === "success") {
      // Only use current order from Redux if we just created an order
      hasFetched.current = true;
      setOrderDetails(currentOrder);
      setIsLoading(false);
    } else {
      // No order data available
      setIsLoading(false);
    }
  }, [dispatch, location.state, currentOrder, orderCreationStatus]);

  // Clear messages on unmount
  useEffect(() => {
    return () => {
      dispatch(clearOrderMessages());
      dispatch(resetOrderCreationStatus());
    };
  }, [dispatch]);

  const handleViewOrders = () => {
    navigate("/dashboard");
  };

  const handleContinueShopping = () => {
    navigate("/trips");
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const getStatusColor = (status) => {
    const statusColors = {
      pending: "bg-yellow-100 text-yellow-800",
      confirmed: "bg-blue-100 text-blue-800",
      preparing: "bg-purple-100 text-purple-800",
      "in-progress": "bg-orange-100 text-orange-800",
      completed: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800",
      refunded: "bg-gray-100 text-gray-800",
    };
    return statusColors[status] || "bg-gray-100 text-gray-800";
  };

  const getCategoryName = (category) => {
    switch (category) {
      case "standard":
        return "Budget";
      case "midRange":
        return "Mid-Range";
      case "luxury":
        return "Luxury";
      default:
        return category;
    }
  };

  // Check for cancelled payment in URL params or location state
  const urlParams = new URLSearchParams(window.location.search);
  const locationState = location.state || {};
  const orderIdFromUrl = urlParams.get("orderId");
  const paymentCancelled = urlParams.get("cancelled") === "true" || 
                          urlParams.get("payment_cancelled") === "true" ||
                          urlParams.get("cancel") === "true" ||
                          locationState.paymentCancelled === true;

  // If payment is cancelled, redirect to booking page immediately
  useEffect(() => {
    if (paymentCancelled && (orderIdFromUrl || orderDetails?._id) && !isLoading) {
      const orderId = orderIdFromUrl || orderDetails?._id;
      // Redirect to booking detail page instead of staying on order confirmation
      navigate(`/dashboard/orders/${orderId}`, {
        replace: true,
        state: {
          paymentCancelled: true,
        },
      });
    }
  }, [paymentCancelled, orderIdFromUrl, orderDetails?._id, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col bg-gray-50">
        <SEO />
        <Header />
        <main className="flex-grow py-12">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <div className="inline-flex items-center">
                <div className="mr-2 h-6 w-6 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent"></div>
                <span className="text-lg text-gray-600">
                  Loading booking details...
                </span>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!orderDetails) {
    return (
      <div className="flex min-h-screen flex-col bg-gray-50">
        <Header />
        <main className="flex-grow py-12">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <div className="mx-auto mb-4 h-16 w-16 text-gray-400">
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h1 className="mb-4 text-2xl font-bold text-gray-900">
                Booking Not Found
              </h1>
              <p className="mb-8 text-gray-600">
                We couldn&apos;t find the booking details. Please check your booking
                history or contact support.
              </p>
              <div className="space-x-4">
                <button
                  onClick={handleViewOrders}
                  className="rounded-lg bg-emerald-600 px-6 py-2 text-white hover:bg-emerald-700"
                >
                  View My Bookings
                </button>
                <button
                  onClick={handleContinueShopping}
                  className="rounded-lg border border-gray-300 bg-white px-6 py-2 text-gray-700 hover:bg-gray-50"
                >
                  Continue Shopping
                </button>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Determine payment status
  const paymentStatus = orderDetails?.payment?.status;
  const isPaymentPending = paymentStatus === "pending" || paymentStatus === "processing";
  const isPaymentCompleted = paymentStatus === "completed";
  const isPaymentFailed = paymentStatus === "failed" || paymentCancelled;

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <Header />
      <main className="flex-grow py-12">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          {/* Conditional Header based on payment status */}
          {isPaymentCompleted ? (
            <div className="mb-8 text-center">
              <div className="mx-auto mb-4 h-16 w-16 text-green-500">
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h1 className="mb-2 text-3xl font-bold text-gray-900">
                🎉 Payment Confirmed!
              </h1>
              <p className="text-lg text-gray-600">
                Your booking has been confirmed. We&apos;ll send you a confirmation email shortly.
              </p>
            </div>
          ) : isPaymentFailed ? (
            <div className="mb-8 text-center">
              <div className="mx-auto mb-4 h-16 w-16 text-red-500">
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h1 className="mb-2 text-3xl font-bold text-gray-900">
                Payment Not Completed
              </h1>
              <p className="text-lg text-gray-600">
                Your payment was cancelled or failed. Don&apos;t worry, your booking is still reserved.
              </p>
            </div>
          ) : (
            <div className="mb-8 text-center">
              <div className="mx-auto mb-4 h-16 w-16 text-amber-500">
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h1 className="mb-2 text-3xl font-bold text-gray-900">
                Booking Reserved
              </h1>
              <p className="text-lg text-gray-600">
                Thank you for your booking. Please complete your payment to secure your reservation.
              </p>
            </div>
          )}

          {/* Cancelled/Failed Payment Alert */}
          {isPaymentFailed && orderDetails.payment?.weTravelPaymentLink && (
            <div className="mb-8 rounded-xl border-2 border-red-200 bg-gradient-to-r from-red-50 to-orange-50 p-6 shadow-lg">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-500">
                    <svg
                      className="h-6 w-6 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="mb-2 text-xl font-bold text-gray-900">
                    ⚠️ Payment Not Completed
                  </h3>
                  <p className="mb-4 text-gray-700">
                    Your payment was cancelled or could not be processed. Your booking is still reserved, but you need to complete payment to confirm it.
                  </p>
                  <div className="mb-4 rounded-lg border border-red-200 bg-white p-4">
                    <p className="mb-2 text-sm font-semibold text-gray-900">
                      What happened?
                    </p>
                    <ul className="list-inside list-disc space-y-1 text-sm text-gray-600">
                      <li>You may have closed the payment window</li>
                      <li>There might have been an issue with your payment method</li>
                      <li>The payment session may have expired</li>
                    </ul>
                  </div>
                  <div className="mb-4 rounded-lg border border-green-200 bg-green-50 p-4">
                    <p className="mb-2 text-sm font-semibold text-green-900">
                      ✅ Good news: Your booking is still reserved!
                    </p>
                    <p className="text-sm text-green-800">
                      You can complete your payment anytime using the button below. Your booking will be confirmed once payment is successful.
                    </p>
                  </div>
                  <a
                    href={orderDetails.payment.weTravelPaymentLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-green-600 to-emerald-600 px-8 py-4 text-lg font-bold text-white shadow-lg transition-all hover:from-green-700 hover:to-emerald-700 hover:shadow-xl"
                  >
                    <svg
                      className="h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                    </svg>
                    Complete Payment Now
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 7l5 5m0 0l-5 5m5-5H6"
                      />
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* Booking Warning Message */}
          {(() => {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            let warningTrip = null;

            // Check if any trip requires contact warning
            for (const item of orderDetails.cartItems || []) {
              const selectedCategory = item.selectedCategory || "standard";
              const categoryName = item.categoryName || "";
              const startingDate = item.startingDate
                ? new Date(item.startingDate)
                : null;

              if (!startingDate) {continue;}

              startingDate.setHours(0, 0, 0, 0);
              const daysUntilTrip = Math.ceil(
                (startingDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
              );

              // Budget packages - no restriction
              if (selectedCategory === "standard") {
                continue;
              }

              // Trekking, Cultural Tours, Zanzibar (all package types) - no restriction
              const categoryLower = categoryName.toLowerCase();
              if (
                categoryLower.includes("trekking") ||
                categoryLower.includes("cultural") ||
                categoryLower.includes("zanzibar")
              ) {
                continue;
              }

              // Only Midrange/Luxury Safaris with less than 4 days need warning
              const isSafari = categoryLower.includes("safari");
              const isMidrangeOrLuxury =
                selectedCategory === "midRange" || selectedCategory === "luxury";

              if (isSafari && isMidrangeOrLuxury && daysUntilTrip < 4 && daysUntilTrip >= 1) {
                warningTrip = { item, daysUntilTrip };
                break;
              }
            }

            return warningTrip ? (
              <div className="mb-8 rounded-xl border-2 border-orange-300 bg-gradient-to-r from-orange-50 to-yellow-50 p-6 shadow-lg">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-500">
                      <svg
                        className="h-6 w-6 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                        />
                      </svg>
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="mb-2 text-xl font-bold text-orange-900">
                      ⚠️ Contact Required Before Payment
                    </h3>
                    <p className="mb-3 text-sm font-medium text-orange-800">
                      This Midrange/Luxury Safari trip starts in less than 4 days (
                      {warningTrip.daysUntilTrip} day
                      {warningTrip.daysUntilTrip > 1 ? "s" : ""}). Please contact us
                      first to confirm availability before completing your payment.
                    </p>
                    <div className="rounded-lg border border-orange-200 bg-white/70 p-4">
                      <p className="text-sm text-orange-700">
                        <strong>Important:</strong> Please contact us to confirm
                        availability before completing payment. This ensures your
                        reservation can be properly confirmed.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : null;
          })()}

          {/* Payment Link Section - Only show if payment is pending/processing and not failed */}
          {isPaymentPending && orderDetails.payment?.weTravelPaymentLink && !isPaymentFailed && (
            <div className="mb-8 rounded-xl border-2 border-orange-200 bg-gradient-to-r from-orange-50 to-red-50 p-6 shadow-lg">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-500">
                    <svg
                      className="h-6 w-6 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="mb-2 text-xl font-bold text-gray-900">
                    🚨 Payment Required - Act Now!
                  </h3>
                  <p className="mb-4 text-gray-700">
                    Your booking is reserved but <strong>not confirmed</strong>{" "}
                    until payment is completed. Please click the button below to
                    proceed with payment as soon as possible.
                  </p>
                  <div className="mb-4 rounded-lg border border-orange-200 bg-white p-4">
                    <p className="mb-2 text-sm text-gray-600">
                      <strong>Important:</strong> Unpaid bookings may be
                      cancelled. Complete your payment to secure your spot!
                    </p>
                    <p className="text-sm text-gray-500">
                      You will receive email reminders until payment is
                      completed.
                    </p>
                  </div>
                  <a
                    href={orderDetails.payment.weTravelPaymentLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-orange-500 to-red-500 px-8 py-4 text-lg font-bold text-white shadow-lg transition-all hover:from-orange-600 hover:to-red-600 hover:shadow-xl"
                  >
                    <svg
                      className="h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                    </svg>
                    Complete Payment Now
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 7l5 5m0 0l-5 5m5-5H6"
                      />
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* Order Summary Card */}
          <div className="mb-8 rounded-xl bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-center justify-between border-b border-gray-200 pb-4">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Booking Summary
                </h2>
                <p className="text-sm text-gray-500">
                  Booking Reference: <span className="font-semibold text-gray-700">#{orderDetails.orderNumber}</span>
                </p>
                <p className="mt-1 text-xs text-gray-400">
                  Order ID: {orderDetails._id}
                </p>
              </div>
              <div className="text-right">
                <span
                  className={`inline-flex rounded-full px-3 py-1 text-sm font-medium ${getStatusColor(orderDetails.orderStatus)}`}
                >
                  {orderDetails.orderStatus.charAt(0).toUpperCase() +
                    orderDetails.orderStatus.slice(1)}
                </span>
                <p className="mt-1 text-sm text-gray-500">
                  Booked on {formatDate(orderDetails.createdAt)}
                </p>
                <p className="mt-1 text-xs text-gray-400">
                  Payment Status: <span className={`font-semibold ${isPaymentCompleted ? 'text-green-600' : isPaymentPending ? 'text-yellow-600' : 'text-red-600'}`}>
                    {paymentStatus || 'pending'}
                  </span>
                </p>
              </div>
            </div>

            {/* Booking Trips */}
            <div className="mb-6">
              <h3 className="mb-4 text-lg font-medium text-gray-900">
                Your Trips
              </h3>
              <div className="space-y-4">
                {orderDetails.cartItems?.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-4 rounded-lg border border-gray-200 p-4"
                  >
                    <div className="h-16 w-16 overflow-hidden rounded-lg">
                      <img
                        src={
                          item.mainImage
                            ? IMAGES_URL + item.mainImage.split("/").pop()
                            : "/placeholder.svg"
                        }
                        alt={item.mainTitle}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">
                        {item.mainTitle}
                      </h4>
                      <p className="mt-1 text-sm text-gray-500">
                        {formatDate(item.startingDate)} • {item.travelersNumber}{" "}
                        {item.travelersNumber === 1 ? "person" : "people"}
                      </p>
                      <div className="mt-2 flex items-center gap-2">
                        <span
                          className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(item.itemStatus)}`}
                        >
                          {item.itemStatus.charAt(0).toUpperCase() +
                            item.itemStatus.slice(1)}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex flex-col gap-2 font-medium text-emerald-600">
                        <p>{formatCurrency(item.itemTotal)}</p>
                        <p>{getCategoryName(item.selectedCategory)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Booking Totals */}
            <div className="border-t border-gray-200 pt-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">
                    {formatCurrency(orderDetails.subtotal || 0)}
                  </span>
                </div>
                {orderDetails.serviceFee && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Service Fee</span>
                    <span className="font-medium">
                      {formatCurrency(orderDetails.serviceFee)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between border-t border-gray-200 pt-2">
                  <span className="text-lg font-semibold text-gray-900">
                    Total Cost
                  </span>
                  <span className="text-lg font-semibold text-emerald-600">
                    {formatCurrency(orderDetails.totalAmount)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* QR Code Section - Only show for completed payments */}
          {orderDetails.payment?.status === "completed" && (
            <div className="mb-8 rounded-xl border-2 border-green-200 bg-gradient-to-br from-green-50 to-emerald-50 p-8 shadow-lg">
              <h3 className="mb-6 text-center text-2xl font-bold text-gray-900">
                🎉 Payment Confirmed - Your Booking QR Code
              </h3>
              <QRCodeDisplay orderNumber={orderDetails.orderNumber} />
              <div className="mt-6 rounded-lg bg-white/80 p-4 text-center">
                <p className="text-sm text-gray-700">
                  <strong>Important:</strong> Save this QR code to your phone or print it. 
                  Present it at check-in for quick access to your booking details.
                </p>
              </div>
            </div>
          )}

          {/* Customer Information */}
          <div className="mb-8 rounded-xl bg-white p-6 shadow-sm">
            <h3 className="mb-4 text-lg font-medium text-gray-900">
              Customer Information
            </h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <p className="text-sm text-gray-500">Name</p>
                <p className="font-medium">
                  {orderDetails.personalInfo?.firstName}{" "}
                  {orderDetails.personalInfo?.lastName}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium">
                  {orderDetails.personalInfo?.email}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Phone</p>
                <p className="font-medium">
                  {orderDetails.personalInfo?.phone}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Payment Method</p>
                <p className="font-medium capitalize">
                  {orderDetails.payment?.method?.replace("-", " ")}
                </p>
              </div>
            </div>
          </div>

          {/* Billing Address */}
          {orderDetails.billingAddress && (
            <div className="mb-8 rounded-xl bg-white p-6 shadow-sm">
              <h3 className="mb-4 text-lg font-medium text-gray-900">
                Billing Address
              </h3>
              <div className="text-gray-700">
                <p>{orderDetails.billingAddress.street}</p>
                <p>
                  {orderDetails.billingAddress.city},{" "}
                  {orderDetails.billingAddress.state}{" "}
                  {orderDetails.billingAddress.zip}
                </p>
                <p>{orderDetails.billingAddress.country}</p>
              </div>
            </div>
          )}

          {/* Next Steps */}
          <div className="mb-8 rounded-xl bg-blue-50 p-6">
            <h3 className="mb-4 text-lg font-medium text-blue-900">
              What&apos;s Next?
            </h3>
            <div className="space-y-3 text-sm text-blue-800">
              <div className="flex items-start gap-3">
                <div className="mt-1 h-2 w-2 rounded-full bg-blue-600"></div>
                <p>
                  <strong>Complete your payment</strong> using the payment link
                  above to secure your booking.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="mt-1 h-2 w-2 rounded-full bg-blue-600"></div>
                <p>
                  You&apos;ll receive daily email reminders until your payment is
                  completed.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="mt-1 h-2 w-2 rounded-full bg-blue-600"></div>
                <p>
                  After payment confirmation, our team will contact you within
                  24 hours.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="mt-1 h-2 w-2 rounded-full bg-blue-600"></div>
                <p>
                  You can track your booking and payment status in your dashboard.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="mt-1 h-2 w-2 rounded-full bg-blue-600"></div>
                <p>For any questions, please contact our support team.</p>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default OrderConfirmation;
