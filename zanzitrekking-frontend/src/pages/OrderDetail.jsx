import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useParams } from "react-router-dom";
import { clearOrderMessages, getOrderById } from "../store/reducers/orderReducer";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle,
  Clock,
  Mail,
  MapPin,
  Package,
  Phone,
  Truck,
  User,
  XCircle,
} from "lucide-react";
import AOS from "aos";
import "aos/dist/aos.css";
import QRCodeDisplay from "../components/QRCodeDisplay";

const OrderDetail = () => {
  const { orderId } = useParams();
  const dispatch = useDispatch();
  const { currentOrder, loader, successMessage, errorMessage } = useSelector(
    (state) => state.order,
  );

  useEffect(() => {
    AOS.init({
      once: true,
      duration: 800,
      offset: 60,
      easing: "ease-out-cubic",
    });
    if (orderId) {
      dispatch(getOrderById(orderId));
    }
  }, [orderId, dispatch]);

  useEffect(() => {
    const timer = setTimeout(() => {
      dispatch(clearOrderMessages());
    }, 5000);

    return () => clearTimeout(timer);
  }, [successMessage, errorMessage, dispatch]);

  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "confirmed":
        return "bg-blue-100 text-blue-800";
      case "pending":
        return "bg-amber-100 text-amber-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      case "in-progress":
        return "bg-purple-100 text-purple-800";
      case "preparing":
        return "bg-indigo-100 text-indigo-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPaymentStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "processing":
        return "bg-blue-100 text-blue-800";
      case "pending":
        return "bg-amber-100 text-amber-800";
      case "failed":
        return "bg-red-100 text-red-800";
      case "refunded":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case "confirmed":
        return <CheckCircle className="h-5 w-5 text-blue-600" />;
      case "pending":
        return <Clock className="h-5 w-5 text-amber-600" />;
      case "cancelled":
        return <XCircle className="h-5 w-5 text-red-600" />;
      case "in-progress":
        return <Truck className="h-5 w-5 text-purple-600" />;
      case "preparing":
        return <Package className="h-5 w-5 text-indigo-600" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-600" />;
    }
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
        return "Standard";
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loader) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background-nature via-background-sunset to-background-paper">
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="text-text-light">Loading booking details...</p>
        </div>
      </div>
    );
  }

  if (!currentOrder) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background-nature via-background-sunset to-background-paper p-6">
        <div className="mx-auto max-w-4xl">
          <div className="text-center" data-aos="fade-up">
            <h1 className="mb-4 text-3xl font-black text-primary">
              Booking Not Found
            </h1>
            <p className="mb-6 text-text-light">
              The booking you&apos;re looking for doesn&apos;t exist or has been
              removed.
            </p>
            <Link
              to="/dashboard/orders"
              className="inline-flex items-center rounded-2xl bg-gradient-to-r from-primary to-primary-600 px-4 py-2 text-sm font-semibold text-white shadow-nature-soft transition-all hover:scale-105 hover:shadow-nature-medium"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Bookings
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background-nature via-background-sunset to-background-paper p-6">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div
          className="mb-6 flex items-center justify-between"
          data-aos="fade-up"
        >
          <div className="flex items-center space-x-4">
            <Link
              to="/dashboard/orders"
              className="inline-flex items-center text-sm font-semibold text-primary hover:text-primary-600"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Bookings
            </Link>
            <div>
              <h1 className="text-3xl font-black text-primary">
                Booking #{currentOrder.orderNumber}
              </h1>
              <p className="text-sm text-text-lighter">
                Booked on {formatDate(currentOrder.createdAt)}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <span
              className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-bold ${getStatusColor(currentOrder.orderStatus)}`}
            >
              {getStatusIcon(currentOrder.orderStatus)}
              <span className="ml-2">{currentOrder.orderStatus}</span>
            </span>
          </div>
        </div>

        {/* Payment Link Section - Show if payment is pending/processing and link exists */}
        {(currentOrder.payment?.status === "pending" || currentOrder.payment?.status === "processing") &&
          currentOrder.payment?.weTravelPaymentLink && (
            <div
              className="mb-6 rounded-xl border-2 border-orange-200 bg-gradient-to-r from-orange-50 to-red-50 p-6 shadow-lg"
              data-aos="fade-up"
            >
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
                    href={currentOrder.payment?.weTravelPaymentLink}
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

        {/* Success/Error Messages */}
        {successMessage && (
          <div
            className="mb-6 rounded-2xl bg-green-50 p-4 shadow-nature-soft"
            data-aos="fade-up"
          >
            <div className="flex">
              <CheckCircle className="h-5 w-5 text-green-400" />
              <p className="ml-3 text-sm text-green-800">{successMessage}</p>
            </div>
          </div>
        )}

        {errorMessage && (
          <div
            className="mb-6 rounded-2xl bg-red-50 p-4 shadow-nature-soft"
            data-aos="fade-up"
          >
            <div className="flex">
              <XCircle className="h-5 w-5 text-red-400" />
              <p className="ml-3 text-sm text-red-800">{errorMessage}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Main Content */}
          <div className="space-y-6 lg:col-span-2">
            {/* Booking Status Card - Simplified */}
            <div
              className="rounded-2xl border-2 border-primary/20 bg-gradient-to-br from-white to-primary/5 p-6 shadow-lg"
              data-aos="fade-up"
            >
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-medium text-text-light mb-1">Booking Status</p>
                  <span
                    className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-bold ${getStatusColor(currentOrder.orderStatus)}`}
                  >
                    {getStatusIcon(currentOrder.orderStatus)}
                    <span className="ml-2 capitalize">{currentOrder.orderStatus}</span>
                  </span>
                </div>
                <div>
                  <p className="text-xs font-medium text-text-light mb-1">Payment Status</p>
                  <span
                    className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-bold ${getPaymentStatusColor(currentOrder.payment?.status)}`}
                  >
                    {currentOrder.payment?.status === "completed" ? (
                      <CheckCircle className="h-4 w-4 mr-2" />
                    ) : (
                      <Clock className="h-4 w-4 mr-2" />
                    )}
                    <span className="capitalize">{currentOrder.payment?.status || "pending"}</span>
                  </span>
                </div>
              </div>
              {currentOrder.payment?.paymentDate && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-xs text-text-light">Paid on {formatDate(currentOrder.payment.paymentDate)}</p>
                </div>
              )}
            </div>

            {/* QR Code Section - Only show for completed payments */}
            {currentOrder.payment?.status === "completed" && (
              <div
                className="rounded-3xl border-2 border-primary/20 bg-gradient-to-br from-primary/5 via-white to-secondary/5 p-8 shadow-nature-large backdrop-blur-xl"
                data-aos="fade-up"
              >
                <h2 className="mb-6 text-center text-xl font-bold text-primary">
                  Your Booking QR Code
                </h2>
                <QRCodeDisplay orderNumber={currentOrder.orderNumber} />
                <div className="mt-6 rounded-lg bg-primary/10 p-4 text-center">
                  <p className="text-sm text-text-dark">
                    <strong>Note:</strong> This QR code is automatically generated when payment is completed. 
                    You can download or print it to present at check-in for quick access to your booking details.
                  </p>
                </div>
              </div>
            )}

            {/* Trip Details - Cleaner Design */}
            <div
              className="rounded-2xl border-2 border-primary/20 bg-white p-6 shadow-lg"
              data-aos="fade-up"
            >
              <h2 className="mb-4 text-xl font-bold text-primary">
                Trip Details
              </h2>
              <div className="space-y-4">
                {currentOrder.cartItems?.map((item, index) => (
                  <div
                    key={index}
                    className="rounded-xl border border-gray-200 bg-gray-50 p-5"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-primary mb-2">
                          {item.mainTitle}
                        </h3>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div>
                            <span className="font-semibold text-text-dark">Date:</span>
                            <p className="text-text-light">{formatDate(item.startingDate)}</p>
                          </div>
                          <div>
                            <span className="font-semibold text-text-dark">Travelers:</span>
                            <p className="text-text-light">{item.travelersNumber} person{item.travelersNumber > 1 ? 's' : ''}</p>
                          </div>
                          <div>
                            <span className="font-semibold text-text-dark">Package:</span>
                            <p className="text-text-light">{getCategoryName(item.selectedCategory)}</p>
                          </div>
                          <div>
                            <span className="font-semibold text-text-dark">Status:</span>
                            <span
                              className={`ml-1 inline-flex items-center rounded-full px-2 py-0.5 text-xs font-bold ${getStatusColor(item.itemStatus)}`}
                            >
                              {item.itemStatus}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-primary">
                          ${item.itemTotal?.toFixed(2)}
                        </div>
                        {item.discount > 0 && (
                          <div className="text-sm text-success mt-1">
                            -${item.discount?.toFixed(2)} discount
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Customer Information - Compact */}
            <div
              className="rounded-2xl border-2 border-primary/20 bg-white p-6 shadow-lg"
              data-aos="fade-up"
            >
              <h2 className="mb-4 text-lg font-bold text-primary">
                Contact Information
              </h2>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <User className="h-5 w-5 text-primary flex-shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-text-dark">
                      {currentOrder.personalInfo?.firstName}{" "}
                      {currentOrder.personalInfo?.lastName}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Mail className="h-5 w-5 text-primary flex-shrink-0" />
                  <p className="text-sm text-text-light break-all">
                    {currentOrder.personalInfo?.email}
                  </p>
                </div>
                <div className="flex items-center space-x-3">
                  <Phone className="h-5 w-5 text-primary flex-shrink-0" />
                  <p className="text-sm text-text-light">
                    {currentOrder.personalInfo?.phone}
                  </p>
                </div>
              </div>
            </div>

            {/* Billing Address - Only show if address exists */}
            {currentOrder.billingAddress && 
             (currentOrder.billingAddress.street || 
              currentOrder.billingAddress.city || 
              currentOrder.billingAddress.state) && (
              <div
                className="rounded-3xl border border-primary/10 bg-gradient-to-br from-white via-background-paper to-background-nature/20 p-6 shadow-nature-large backdrop-blur-xl"
                data-aos="fade-up"
              >
                <h2 className="mb-4 text-lg font-bold text-primary">
                  Billing Address
                </h2>
                <div className="space-y-2">
                  <div className="flex items-start space-x-2">
                    <MapPin className="mt-0.5 h-4 w-4 text-primary" />
                    <div className="text-sm text-text-light">
                      {currentOrder.billingAddress.street && (
                        <p>{currentOrder.billingAddress.street}</p>
                      )}
                      {(currentOrder.billingAddress.city || currentOrder.billingAddress.state || currentOrder.billingAddress.zip) && (
                        <p>
                          {currentOrder.billingAddress.city && `${currentOrder.billingAddress.city}, `}
                          {currentOrder.billingAddress.state && `${currentOrder.billingAddress.state} `}
                          {currentOrder.billingAddress.zip}
                        </p>
                      )}
                      {currentOrder.billingAddress.country && (
                        <p>{currentOrder.billingAddress.country}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Payment Information - Simplified */}
            <div
              className="rounded-2xl border-2 border-primary/20 bg-white p-6 shadow-lg"
              data-aos="fade-up"
            >
              <h2 className="mb-4 text-lg font-bold text-primary">
                Payment Details
              </h2>
              <div className="space-y-3">
                <div>
                  <span className="text-xs font-medium text-text-light">Method:</span>
                  <p className="text-sm font-semibold capitalize text-text-dark mt-1">
                    {currentOrder.payment?.method?.replace("-", " ") || "WeTravel"}
                  </p>
                </div>
                {/* Payment Link Button - Prominent for pending/processing */}
                {(currentOrder.payment?.status === "pending" || currentOrder.payment?.status === "processing") &&
                  currentOrder.payment?.weTravelPaymentLink && (
                    <div className="mt-4">
                      <a
                        href={currentOrder.payment.weTravelPaymentLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-4 text-base font-bold text-white shadow-lg transition-all hover:from-emerald-700 hover:to-teal-700 hover:shadow-xl hover:scale-105"
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
                      <p className="mt-2 text-xs text-center text-text-light">
                        Click to complete your payment securely
                      </p>
                    </div>
                  )}
                {currentOrder.payment?.transactionId && (
                  <div className="pt-3 border-t border-gray-200">
                    <span className="text-xs font-medium text-text-light">Transaction ID:</span>
                    <p className="text-xs font-mono text-text-dark mt-1 break-all">
                      {currentOrder.payment.transactionId}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Order Summary - Clean */}
            <div
              className="rounded-2xl border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-white p-6 shadow-lg"
              data-aos="fade-up"
            >
              <h2 className="mb-4 text-lg font-bold text-primary">
                Price Summary
              </h2>
              <div className="space-y-2">
                {currentOrder.discountAmount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-text-light">Subtotal:</span>
                    <span className="font-semibold text-text-dark">
                      ${currentOrder.subtotal?.toFixed(2)}
                    </span>
                  </div>
                )}
                {currentOrder.discountAmount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-text-light">Discount:</span>
                    <span className="font-semibold text-success">
                      -${currentOrder.discountAmount?.toFixed(2)}
                    </span>
                  </div>
                )}
                <div className="border-t-2 border-primary/20 pt-3 mt-3">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-primary">
                      Total:
                    </span>
                    <span className="text-2xl font-black text-primary">
                      ${currentOrder.totalAmount?.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;
