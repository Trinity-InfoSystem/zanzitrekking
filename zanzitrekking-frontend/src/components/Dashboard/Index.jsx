"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { get_dashboard_index_data } from "../../store/reducers/dashboardReducer";
import { getCustomerOrderStatistics } from "../../store/reducers/orderReducer";
import {
  Calendar,
  Clock,
  CreditCard,
  DollarSign,
  Eye,
  MapPin,
  Package,
  ShoppingBag,
  TrendingUp,
  Users,
  XCircle,
} from "lucide-react";
import ReviewTimer from "./ReviewTimer";
import ReviewTestHelper from "./ReviewTestHelper";
import ReviewModal from "./ReviewModal";

const Index = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const { orderStatistics } = useSelector((state) => state.order);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Review modal state
  const [reviewModal, setReviewModal] = useState({
    isOpen: false,
    orderId: null,
    tripId: null,
    tripTitle: null,
    tripImage: null,
  });

  useEffect(() => {
    dispatch(getCustomerOrderStatistics(userInfo.id));
  }, [userInfo.id, dispatch]);

  // Review modal handlers
  const openReviewModal = (orderId, tripId, tripTitle, tripImage) => {
    setReviewModal({
      isOpen: true,
      orderId,
      tripId,
      tripTitle,
      tripImage,
    });
  };

  const closeReviewModal = () => {
    setReviewModal({
      isOpen: false,
      orderId: null,
      tripId: null,
      tripTitle: null,
      tripImage: null,
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "bg-emerald-100 text-emerald-800";
      case "confirmed":
        return "bg-emerald-100 text-emerald-800";
      case "review":
        return "bg-blue-100 text-blue-800";
      case "processing":
        return "bg-purple-100 text-purple-800";
      case "failed":
        return "bg-red-100 text-red-800";
      case "refunded":
        return "bg-gray-100 text-gray-800";
      case "pending":
        return "bg-amber-100 text-amber-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      case "delivered":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "completed":
        return "Payment Completed";
      case "review":
        return "Payment Under Review";
      case "processing":
        return "Processing Payment";
      case "failed":
        return "Payment Failed";
      case "refunded":
        return "Payment Refunded";
      case "pending":
        return "Pending";
      case "cancelled":
        return "Cancelled";
      case "delivered":
        return "Delivered";
      default:
        return status;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mb-8">
        <h1 className="mb-2 text-2xl font-bold text-gray-800">
          Dashboard Overview
        </h1>
        <p className="text-gray-500">
          Welcome back! Heres whats happening with your bookings.
        </p>
      </div>

      {/* Review Test Helper - Only show in development */}
      {/* <ReviewTestHelper /> */}

      {/* Stats Cards */}
      <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm transition-all hover:shadow-md">
          <div className="flex items-center">
            <div className="flex-shrink-0 rounded-lg bg-blue-50 p-3">
              <ShoppingBag className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-5">
              <p className="text-sm font-medium uppercase tracking-wider text-gray-500">
                Total Bookings
              </p>
              <h3 className="mt-1 text-3xl font-semibold text-gray-900">
                {orderStatistics?.statistics?.orders?.total || 0}
              </h3>
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm font-medium text-green-600">
            <TrendingUp className="mr-1.5 h-4 w-4" />
            <span>Active bookings</span>
          </div>
        </div>

        <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm transition-all hover:shadow-md">
          <div className="flex items-center">
            <div className="flex-shrink-0 rounded-lg bg-emerald-50 p-3">
              <DollarSign className="h-6 w-6 text-emerald-600" />
            </div>
            <div className="ml-5">
              <p className="text-sm font-medium uppercase tracking-wider text-gray-500">
                Total Spent
              </p>
              <h3 className="mt-1 text-3xl font-semibold text-gray-900">
                $
                {orderStatistics?.statistics?.budget?.confirmed?.toFixed(2) ||
                  "0.00"}
              </h3>
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm font-medium text-emerald-600">
            <Calendar className="mr-1.5 h-4 w-4" />
            <span>Lifetime value</span>
          </div>
        </div>

        <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm transition-all hover:shadow-md">
          <div className="flex items-center">
            <div className="flex-shrink-0 rounded-lg bg-amber-50 p-3">
              <Clock className="h-6 w-6 text-amber-600" />
            </div>
            <div className="ml-5">
              <p className="text-sm font-medium uppercase tracking-wider text-gray-500">
                Pending Bookings
              </p>
              <h3 className="mt-1 text-3xl font-semibold text-gray-900">
                {orderStatistics?.statistics?.orders?.pending || 0}
              </h3>
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm font-medium text-amber-600">
            <Package className="mr-1.5 h-4 w-4" />
            <span>Awaiting processing</span>
          </div>
        </div>

        <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm transition-all hover:shadow-md">
          <div className="flex items-center">
            <div className="flex-shrink-0 rounded-lg bg-green-50 p-3">
              <Users className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-5">
              <p className="text-sm font-medium uppercase tracking-wider text-gray-500">
                Total Trips
              </p>
              <h3 className="mt-1 text-3xl font-semibold text-gray-900">
                {orderStatistics?.statistics?.trips?.total || 0}
              </h3>
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm font-medium text-green-600">
            <MapPin className="mr-1.5 h-4 w-4" />
            <span>Adventures booked</span>
          </div>
        </div>
      </div>

      {/* Detailed Statistics */}
      {orderStatistics && (
        <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Booking Status Breakdown */}
          <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
            <h3 className="mb-4 text-lg font-semibold text-gray-800">
              Booking Status
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Completed</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-900">
                    {orderStatistics.statistics.orders.completed}
                  </span>
                  <span className="text-xs text-green-600">
                    ${orderStatistics.statistics.budget.completed.toFixed(2)}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Confirmed</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-900">
                    {orderStatistics.statistics.orders.confirmed}
                  </span>
                  <span className="text-xs text-blue-600">
                    ${orderStatistics.statistics.budget.confirmed.toFixed(2)}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">In Progress</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-900">
                    {orderStatistics.statistics.orders.inProgress}
                  </span>
                  <span className="text-xs text-orange-600">
                    ${orderStatistics.statistics.budget.total.toFixed(2)}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Cancelled</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-900">
                    {orderStatistics.statistics.orders.cancelled}
                  </span>
                  <span className="text-xs text-red-600">
                    ${orderStatistics.statistics.budget.cancelled.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Trip Statistics */}
          <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
            <h3 className="mb-4 text-lg font-semibold text-gray-800">
              Trip Statistics
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Total Trips</span>
                <span className="text-sm font-medium text-gray-900">
                  {orderStatistics.statistics.trips.total}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Completed Trips</span>
                <span className="text-sm font-medium text-green-600">
                  {orderStatistics.statistics.trips.completed}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Pending Trips</span>
                <span className="text-sm font-medium text-amber-600">
                  {orderStatistics.statistics.trips.pending}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">
                  Average Booking Value
                </span>
                <span className="text-sm font-medium text-emerald-600">
                  ${orderStatistics.statistics.budget.average.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Monthly Statistics Chart */}
      {orderStatistics?.statistics?.monthlyStats && (
        <div className="mb-8 rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-lg font-semibold text-gray-800">
            Monthly Activity
          </h3>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-6">
            {orderStatistics.statistics.monthlyStats.map((month, index) => (
              <div key={index} className="text-center">
                <div className="mb-2 text-sm font-medium text-gray-900">
                  {month.month}
                </div>
                <div className="text-xs text-gray-500">
                  <div>{month.orders} bookings</div>
                  <div className="text-emerald-600">
                    ${month.budget.toFixed(2)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Bookings */}
      <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
        <div className="border-b border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-800">
              Recent Bookings
            </h2>
            <Link
              to="/dashboard/orders"
              className="text-sm font-medium text-blue-600 transition-colors hover:text-blue-800"
            >
              View all
            </Link>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                <th className="px-6 py-4">Booking ID</th>
                <th className="px-6 py-4">Price</th>
                <th className="px-6 py-4">Payment Status</th>
                <th className="px-6 py-4">Booking Status</th>
                <th className="px-6 py-4">Review Status</th>
                <th className="px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {orderStatistics?.recentOrders?.map((order, i) => (
                <tr key={i} className="transition-colors hover:bg-gray-50">
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="flex items-center">
                      <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gray-100">
                        <ShoppingBag className="h-4 w-4 text-gray-600" />
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900">
                          #{order.orderNumber}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">
                      ${order.totalAmount?.toFixed(2) || "0.00"}
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusColor(order.payment?.status || "review")}`}
                    >
                      <span
                        className={`mr-1.5 h-1.5 w-1.5 rounded-full ${
                          order.payment?.status === "completed"
                            ? "bg-emerald-500"
                            : order.payment?.status === "review"
                              ? "bg-blue-500"
                              : order.payment?.status === "processing"
                                ? "bg-purple-500"
                                : order.payment?.status === "failed"
                                  ? "bg-red-500"
                                  : "bg-amber-500"
                        }`}
                      ></span>
                      {getStatusText(order.payment?.status || "review")}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusColor(order.orderStatus)}`}
                    >
                      {order.orderStatus}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    {order.cartItems && order.cartItems.length > 0 ? (
                      <ReviewTimer
                        tripStartDate={order.cartItems[0].startingDate}
                        tripDuration={order.cartItems[0].days || 1}
                        orderId={order.id}
                        tripId={order.cartItems[0].tripId?._id}
                        tripTitle={order.cartItems[0].mainTitle}
                        tripImage={order.cartItems[0].tripId?.mainImage}
                        onOpenReviewModal={openReviewModal}
                      />
                    ) : (
                      <span className="text-xs text-gray-500">
                        No trip data
                      </span>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm font-medium">
                    <div className="flex space-x-2">
                      <Link
                        to={`/dashboard/orders/${order.id}`}
                        className="inline-flex items-center rounded-md border border-transparent bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-700 transition-colors hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                      >
                        <Eye className="mr-1 h-3.5 w-3.5" />
                        View
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}

              {(!orderStatistics?.recentOrders ||
                orderStatistics.recentOrders.length === 0) && (
                <tr>
                  <td
                    colSpan="6"
                    className="px-6 py-10 text-center text-sm text-gray-500"
                  >
                    No recent bookings found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Review Modal */}
      <ReviewModal
        isOpen={reviewModal.isOpen}
        onClose={closeReviewModal}
        orderId={reviewModal.orderId}
        tripId={reviewModal.tripId}
        tripTitle={reviewModal.tripTitle}
        tripImage={reviewModal.tripImage}
      />
    </div>
  );
};

export default Index;
