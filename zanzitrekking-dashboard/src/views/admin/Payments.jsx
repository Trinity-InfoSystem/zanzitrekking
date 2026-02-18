"use client";

import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  FaSearch,
  FaChevronDown,
  FaEye,
  FaTimes,
  FaCheck,
  FaBan,
  FaCreditCard,
  FaCalendar,
  FaUser,
  FaDollarSign,
} from "react-icons/fa";
import { FixedSizeList as List } from "react-window";
import HeaderText from "./HeaderText";
import Pagination from "../Pagination";
import {
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  updatePaymentStatus,
  cancelOrder,
} from "../../store/Reducers/orderReducer";
import { Link } from "react-router-dom";
import { isAdmin } from "../../utils/roleVerification";
import QRCodeDisplay from "../../components/QRCodeDisplay";

const Payments = () => {
  const dispatch = useDispatch();
  const [currentPage, setCurrentPage] = useState(1);
  const [parPage, setParPage] = useState(10);
  const [searchValue, setSearchValue] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);
  const [showPaymentStatusModal, setShowPaymentStatusModal] = useState(false);
  const [pendingPaymentStatus, setPendingPaymentStatus] = useState(null);
  const [pendingOrderId, setPendingOrderId] = useState(null);
  const role = useSelector((state) => state.auth?.userInfo?.role);

  const { orders, totalOrders, loading, currentOrder, summary } = useSelector(
    (state) => state.order,
  );

  useEffect(() => {
    dispatch(
      getAllOrders({
        parPage,
        currentPage,
        searchValue,
        status: statusFilter,
        paymentStatus: paymentStatusFilter,
        dateFrom,
        dateTo,
        sortBy,
        sortOrder,
      }),
    );
  }, [
    dispatch,
    currentPage,
    parPage,
    searchValue,
    statusFilter,
    paymentStatusFilter,
    dateFrom,
    dateTo,
    sortBy,
    sortOrder,
  ]);

  // Auto-refresh orders every 30 seconds to catch webhook updates
  useEffect(() => {
    const refreshInterval = setInterval(() => {
      dispatch(
        getAllOrders({
          parPage,
          currentPage,
          searchValue,
          status: statusFilter,
          paymentStatus: paymentStatusFilter,
          dateFrom,
          dateTo,
          sortBy,
          sortOrder,
        }),
      );
    }, 30000); // Refresh every 30 seconds

    // Cleanup interval on unmount
    return () => clearInterval(refreshInterval);
  }, [
    dispatch,
    currentPage,
    parPage,
    searchValue,
    statusFilter,
    paymentStatusFilter,
    dateFrom,
    dateTo,
    sortBy,
    sortOrder,
  ]);

  const handleViewOrder = (orderId) => {
    dispatch(getOrderById(orderId)).then(() => {
      setSelectedOrder(currentOrder);
      setShowModal(true);
    });
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    setActionLoading(orderId);
    try {
      await dispatch(updateOrderStatus({ orderId, orderStatus: newStatus }));
      // Refresh the orders list
      dispatch(
        getAllOrders({
          parPage,
          currentPage,
          searchValue,
          status: statusFilter,
          paymentStatus: paymentStatusFilter,
          dateFrom,
          dateTo,
          sortBy,
          sortOrder,
        }),
      );
    } catch (error) {
      console.error("Failed to update order status:", error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleUpdatePaymentStatus = async (orderId, paymentStatus) => {
    // Show warning modal for manual payment status updates (except refund which is always manual)
    if (paymentStatus !== "refunded") {
      setPendingOrderId(orderId);
      setPendingPaymentStatus(paymentStatus);
      setShowPaymentStatusModal(true);
      return;
    }
    
    // For refunds, proceed directly (always manual)
    await confirmUpdatePaymentStatus(orderId, paymentStatus);
  };

  const confirmUpdatePaymentStatus = async (orderId, paymentStatus) => {
    setShowPaymentStatusModal(false);
    setActionLoading(orderId);
    try {
      await dispatch(updatePaymentStatus({ orderId, paymentStatus }));
      // Refresh the orders list
      dispatch(
        getAllOrders({
          parPage,
          currentPage,
          searchValue,
          status: statusFilter,
          paymentStatus: paymentStatusFilter,
          dateFrom,
          dateTo,
          sortBy,
          sortOrder,
        }),
      );
    } catch (error) {
      console.error("Failed to update payment status:", error);
    } finally {
      setActionLoading(null);
      setPendingOrderId(null);
      setPendingPaymentStatus(null);
    }
  };

  const handleCancelOrder = async (
    orderId,
    cancellationReason = "Cancelled by admin",
  ) => {
    setActionLoading(orderId);
    try {
      await dispatch(cancelOrder({ orderId, cancellationReason }));
      // Refresh the orders list
      dispatch(
        getAllOrders({
          parPage,
          currentPage,
          searchValue,
          status: statusFilter,
          paymentStatus: paymentStatusFilter,
          dateFrom,
          dateTo,
          sortBy,
          sortOrder,
        }),
      );
    } catch (error) {
      console.error("Failed to cancel order:", error);
    } finally {
      setActionLoading(null);
    }
  };

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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-neutral-50 via-white to-primary-50/30">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-secondary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-primary-50/30 p-4 md:p-5">
      <div className="max-w-8xl mx-auto">
        <HeaderText title="Orders & Payments Management" />

        {/* Summary Cards */}
        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-4">
          <div className="shadow-coral-soft rounded-2xl bg-gradient-to-br from-success via-success-500 to-success-600 p-4">
            <div className="flex items-center">
              <FaDollarSign className="h-8 w-8 text-white" />
              <div className="ml-4">
                <p className="text-sm font-semibold text-white/90">
                  Total Revenue
                </p>
                <p className="text-2xl font-bold text-white">
                  ${summary?.totalRevenue?.toFixed(2) || "0.00"}
                </p>
              </div>
            </div>
          </div>
          <div className="shadow-sunshine-soft rounded-2xl bg-gradient-to-br from-info via-info-500 to-info-600 p-4">
            <div className="flex items-center">
              <FaCreditCard className="h-8 w-8 text-white" />
              <div className="ml-4">
                <p className="text-sm font-semibold text-white/90">
                  Total Orders
                </p>
                <p className="text-2xl font-bold text-white">
                  {summary?.totalOrders || 0}
                </p>
              </div>
            </div>
          </div>
          <div className="rounded-2xl bg-gradient-to-br from-sunshine via-sunshine-500 to-sunshine-600 p-4 shadow-sm">
            <div className="flex items-center">
              <FaCalendar className="h-8 w-8 text-white" />
              <div className="ml-4">
                <p className="text-sm font-semibold text-white/90">
                  Pending Orders
                </p>
                <p className="text-2xl font-bold text-white">
                  {summary?.pendingOrders || 0}
                </p>
              </div>
            </div>
          </div>
          <div className="rounded-2xl bg-gradient-to-br from-primary via-primary-600 to-primary-700 p-4 shadow-nature-soft">
            <div className="flex items-center">
              <FaCheck className="h-8 w-8 text-white" />
              <div className="ml-4">
                <p className="text-sm font-semibold text-white/90">
                  Completed Orders
                </p>
                <p className="text-2xl font-bold text-white">
                  {summary?.completedOrders || 0}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Order Detail Modal */}
        {showModal && selectedOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-primary-900/20 backdrop-blur-sm">
            <div className="relative w-full max-w-4xl rounded-2xl bg-white p-6 shadow-nature-large ring-1 ring-primary-200">
              <button
                onClick={() => setShowModal(false)}
                className="absolute right-4 top-4 text-text-light transition-colors hover:text-accent"
              >
                <FaTimes className="h-6 w-6" />
              </button>

              <div className="mb-6">
                <h2 className="text-2xl font-bold text-primary-800">
                  Order #{selectedOrder.orderNumber}
                </h2>
                <p className="text-text">
                  Created on {formatDateTime(selectedOrder.createdAt)}
                </p>
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {/* Customer Information */}
                <div className="rounded-xl bg-primary-50/50 p-4 ring-1 ring-primary-100">
                  <h3 className="mb-3 text-lg font-semibold text-primary-800">
                    Customer Information
                  </h3>
                  <div className="space-y-2 text-text-dark">
                    <p>
                      <span className="font-semibold">Name:</span>{" "}
                      {selectedOrder.personalInfo?.firstName}{" "}
                      {selectedOrder.personalInfo?.lastName}
                    </p>
                    <p>
                      <span className="font-semibold">Email:</span>{" "}
                      {selectedOrder.personalInfo?.email}
                    </p>
                    <p>
                      <span className="font-semibold">Phone:</span>{" "}
                      {selectedOrder.personalInfo?.phone}
                    </p>
                  </div>
                </div>

                {/* Order Status */}
                <div className="rounded-xl bg-primary-50/50 p-4 ring-1 ring-primary-100">
                  <h3 className="mb-3 text-lg font-semibold text-primary-800">
                    Order Status
                  </h3>
                  <div className="space-y-2 text-text-dark">
                    <p>
                      <span className="font-semibold">Status:</span>{" "}
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${getStatusColor(selectedOrder.orderStatus)}`}
                      >
                        {selectedOrder.orderStatus}
                      </span>
                    </p>
                    <p>
                      <span className="font-semibold">Payment Status:</span>{" "}
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${getPaymentStatusColor(selectedOrder.payment?.status)}`}
                      >
                        {selectedOrder.payment?.status || "pending"}
                      </span>
                    </p>
                    <p>
                      <span className="font-semibold">Total Amount:</span> $
                      {selectedOrder.totalAmount?.toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>

              {/* QR Code Section - Only show for completed payments */}
              {selectedOrder.payment?.status === "completed" && (
                <div className="mt-6 rounded-xl bg-gradient-to-br from-primary-50 to-secondary-50 p-6 ring-2 ring-primary-200">
                  <h3 className="mb-4 text-center text-lg font-semibold text-primary-800">
                    Booking QR Code
                  </h3>
                  <QRCodeDisplay orderNumber={selectedOrder.orderNumber} />
                  <div className="mt-4 rounded-lg bg-white/80 p-3 text-center">
                    <p className="text-xs text-text">
                      <span className="font-semibold text-primary-800">Note:</span> This QR code
                      is automatically generated when payment is completed. It can be scanned at
                      check-in to quickly access booking details.
                    </p>
                  </div>
                </div>
              )}

              {/* Trip Details */}
              <div className="mt-6 rounded-xl bg-primary-50/50 p-4 ring-1 ring-primary-100">
                <h3 className="mb-3 text-lg font-semibold text-primary-800">
                  Trip Details
                </h3>
                <div className="space-y-3">
                  {selectedOrder.cartItems?.map((item, index) => (
                    <div
                      key={index}
                      className="rounded-lg border border-primary-200 bg-white p-3"
                    >
                      <div className="flex justify-between">
                        <div>
                          <p className="font-semibold text-primary-800">
                            {item.mainTitle}
                          </p>
                          <p className="text-sm text-text">
                            {formatDate(item.startingDate)} •{" "}
                            {item.travelersNumber} traveler(s)
                          </p>
                          <p className="text-sm text-text">
                            Status:{" "}
                            <span
                              className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${getStatusColor(item.itemStatus)}`}
                            >
                              {item.itemStatus}
                            </span>
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-primary-800">
                            ${item.itemTotal?.toFixed(2)}
                          </p>
                          {item.discount > 0 && (
                            <p className="text-sm text-success-600">
                              -${item.discount?.toFixed(2)} discount
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => setShowModal(false)}
                  className="rounded-xl bg-neutral-200 px-4 py-2 font-medium text-text-dark transition-all hover:bg-neutral-300"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="overflow-hidden rounded-2xl bg-white shadow-nature-medium ring-1 ring-primary-100">
          {/* Search and Filter Section */}
          <div className="border-b border-primary-200 bg-gradient-to-r from-primary-50 to-secondary-50 p-5">
            <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
              <div className="flex items-center space-x-2">
                <div className="relative">
                  <select
                    value={parPage}
                    onChange={(e) => {
                      setParPage(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    className="appearance-none rounded-xl border-2 border-primary-200 bg-white py-2.5 pl-4 pr-10 text-sm text-text-dark focus:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary-200"
                  >
                    <option value="5">5 per page</option>
                    <option value="10">10 per page</option>
                    <option value="20">20 per page</option>
                    <option value="30">30 per page</option>
                    <option value="50">50 per page</option>
                  </select>
                  <FaChevronDown className="pointer-events-none absolute right-3 top-3 text-primary-700" />
                </div>

                <select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="rounded-xl border-2 border-primary-200 bg-white py-2.5 pl-4 pr-10 text-sm text-text-dark focus:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary-200"
                >
                  <option value="">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="preparing">Preparing</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>

                <select
                  value={paymentStatusFilter}
                  onChange={(e) => {
                    setPaymentStatusFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="rounded-xl border-2 border-primary-200 bg-white py-2.5 pl-4 pr-10 text-sm text-text-dark focus:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary-200"
                >
                  <option value="">All Payment Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="completed">Completed</option>
                  <option value="failed">Failed</option>
                  <option value="refunded">Refunded</option>
                </select>
              </div>

              <div className="relative w-full lg:w-1/3">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <FaSearch className="text-primary-700" />
                </div>
                <input
                  className="w-full rounded-xl border-2 border-primary-200 bg-white py-2.5 pl-10 pr-4 text-sm text-text-dark transition-all duration-200 placeholder:text-text-light focus:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary-200"
                  type="text"
                  placeholder="Search orders, customers, order numbers..."
                  value={searchValue}
                  onChange={(e) => {
                    setSearchValue(e.target.value);
                    setCurrentPage(1);
                  }}
                />
              </div>
            </div>

            {/* Date Range Filters */}
            <div className="mt-4 flex flex-col space-y-2 md:flex-row md:items-center md:space-x-4 md:space-y-0">
              <div className="flex items-center space-x-2">
                <label className="text-sm font-medium text-primary-800">
                  From:
                </label>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => {
                    setDateFrom(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="rounded-xl border-2 border-primary-200 bg-white px-3 py-2 text-sm text-text-dark focus:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary-200"
                />
              </div>
              <div className="flex items-center space-x-2">
                <label className="text-sm font-medium text-primary-800">
                  To:
                </label>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => {
                    setDateTo(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="rounded-xl border-2 border-primary-200 bg-white px-3 py-2 text-sm text-text-dark focus:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary-200"
                />
              </div>
              <div className="flex items-center space-x-2">
                <label className="text-sm font-medium text-primary-800">
                  Sort by:
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => {
                    setSortBy(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="rounded-xl border-2 border-primary-200 bg-white px-3 py-2 text-sm text-text-dark focus:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary-200"
                >
                  <option value="createdAt">Date Created</option>
                  <option value="totalAmount">Amount</option>
                  <option value="orderStatus">Status</option>
                </select>
                <select
                  value={sortOrder}
                  onChange={(e) => {
                    setSortOrder(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="rounded-xl border-2 border-primary-200 bg-white px-3 py-2 text-sm text-text-dark focus:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary-200"
                >
                  <option value="desc">Descending</option>
                  <option value="asc">Ascending</option>
                </select>
              </div>
            </div>
          </div>

          {/* Table Header */}
          <div className="hidden border-b border-primary-200 bg-gradient-to-r from-primary-50 to-secondary-50 px-4 py-3 md:block">
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-1 text-sm font-bold text-primary-700">
                #
              </div>
              <div className="col-span-2 text-sm font-bold text-primary-700">
                Order Info
              </div>
              <div className="col-span-2 text-sm font-bold text-primary-700">
                Customer
              </div>
              <div className="col-span-1 text-sm font-bold text-primary-700">
                Amount
              </div>
              <div className="col-span-2 text-sm font-bold text-primary-700">
                Status
              </div>
              <div className="col-span-2 text-sm font-bold text-primary-700">
                Payment
              </div>
              {isAdmin(role) && (
                <div className="col-span-2 text-right text-sm font-bold text-primary-700">
                  Actions
                </div>
              )}
            </div>
          </div>

          {/* Table/List Section */}
          <div className="overflow-x-auto p-1">
            <div className="min-w-[800px]">
              {orders.length > 10 ? (
                <List
                  height={400}
                  itemCount={orders.length}
                  itemSize={80}
                  width="100%"
                  className="scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-thin"
                >
                  {({ index, style }) => {
                    const order = orders[index];
                    const rowNumber = (currentPage - 1) * parPage + index + 1;
                    return (
                      <div
                        style={style}
                        className="grid grid-cols-12 items-center gap-4 border-b border-primary-100 px-4 py-4 hover:bg-primary-50/50"
                      >
                        <div className="col-span-1 text-primary-800">
                          {rowNumber}
                        </div>
                        <div className="col-span-2">
                          <div className="text-sm font-semibold text-primary-800">
                            #{order.orderNumber}
                          </div>
                          <div className="text-xs text-text-light">
                            {formatDate(order.createdAt)}
                          </div>
                          <div className="text-xs text-text-light">
                            {order.cartItems?.length || 0} items
                          </div>
                        </div>
                        <div className="col-span-2">
                          <div className="text-sm font-medium text-text-dark">
                            {order.personalInfo?.firstName}{" "}
                            {order.personalInfo?.lastName}
                          </div>
                          <div className="text-xs text-text-light">
                            {order.personalInfo?.email}
                          </div>
                        </div>
                        <div className="col-span-1 text-sm font-semibold text-primary-800">
                          ${order.totalAmount?.toFixed(2)}
                        </div>
                        <div className="col-span-2">
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusColor(order.orderStatus)}`}
                          >
                            {order.orderStatus}
                          </span>
                        </div>
                        <div className="col-span-2">
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getPaymentStatusColor(order.payment?.status)}`}
                          >
                            {order.payment?.status || "pending"}
                          </span>
                        </div>
                        <div className="col-span-2 flex justify-end space-x-1">
                          <button
                            onClick={() => handleViewOrder(order._id)}
                            className="shadow-sunshine-soft hover:shadow-sunshine-medium inline-flex items-center rounded-lg bg-gradient-to-r from-sunshine-400 to-sunshine-500 px-2 py-1 text-xs font-semibold text-white transition-all hover:scale-110"
                            title="View Details"
                          >
                            <FaEye />
                          </button>
                          {order.orderStatus === "pending" && (
                            <button
                              onClick={() =>
                                handleUpdateStatus(order._id, "confirmed")
                              }
                              disabled={actionLoading === order._id}
                              className="inline-flex items-center rounded-lg bg-gradient-to-r from-info to-info-600 px-2 py-1 text-xs font-semibold text-white shadow-sm transition-all hover:scale-110 disabled:opacity-50"
                              title="Approve Order"
                            >
                              {actionLoading === order._id ? (
                                <div className="h-3 w-3 animate-spin rounded-full border border-white border-t-transparent"></div>
                              ) : (
                                <FaCheck />
                              )}
                            </button>
                          )}
                          {(order.payment?.status === "pending" ||
                            order.payment?.status === "processing") && (
                            <button
                              onClick={() =>
                                handleUpdatePaymentStatus(
                                  order._id,
                                  "completed",
                                )
                              }
                              disabled={actionLoading === order._id}
                              className="inline-flex items-center rounded-lg bg-gradient-to-r from-success to-success-600 px-2 py-1 text-xs font-semibold text-white shadow-nature-soft transition-all hover:scale-110 hover:shadow-nature-medium disabled:opacity-50"
                              title="Mark Payment Complete (Edge Case Only)"
                            >
                              {actionLoading === order._id ? (
                                <div className="h-3 w-3 animate-spin rounded-full border border-white border-t-transparent"></div>
                              ) : (
                                <FaCreditCard />
                              )}
                            </button>
                          )}
                          {order.payment?.status === "completed" && (
                            <button
                              onClick={() =>
                                handleUpdatePaymentStatus(order._id, "refunded")
                              }
                              disabled={actionLoading === order._id}
                              className="inline-flex items-center rounded-lg bg-gradient-to-r from-warning to-warning-600 px-2 py-1 text-xs font-semibold text-white shadow-sm transition-all hover:scale-110 disabled:opacity-50"
                              title="Process Refund"
                            >
                              {actionLoading === order._id ? (
                                <div className="h-3 w-3 animate-spin rounded-full border border-white border-t-transparent"></div>
                              ) : (
                                <FaDollarSign />
                              )}
                            </button>
                          )}
                          {order.orderStatus !== "cancelled" &&
                            order.orderStatus !== "completed" && (
                              <button
                                onClick={() => handleCancelOrder(order._id)}
                                disabled={actionLoading === order._id}
                                className="inline-flex items-center rounded-lg bg-gradient-to-r from-accent to-accent-600 px-2 py-1 text-xs font-semibold text-white shadow-sm transition-all hover:scale-110 disabled:opacity-50"
                                title="Cancel Order"
                              >
                                {actionLoading === order._id ? (
                                  <div className="h-3 w-3 animate-spin rounded-full border border-white border-t-transparent"></div>
                                ) : (
                                  <FaBan />
                                )}
                              </button>
                            )}
                        </div>
                      </div>
                    );
                  }}
                </List>
              ) : (
                <div className="scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 max-h-[400px] overflow-y-auto scrollbar-thin">
                  {orders.length > 0 ? (
                    orders.map((order, idx) => {
                      const rowNumber = (currentPage - 1) * parPage + idx + 1;
                      return (
                        <div
                          key={order._id}
                          className="grid grid-cols-12 items-center gap-4 border-b border-primary-100 px-4 py-4 transition-colors duration-150 hover:bg-primary-50/50"
                        >
                          <div className="col-span-1 text-primary-800">
                            {rowNumber}
                          </div>
                          <div className="col-span-2">
                            <div className="text-sm font-semibold text-primary-800">
                              #{order.orderNumber}
                            </div>
                            <div className="text-xs text-text-light">
                              {formatDate(order.createdAt)}
                            </div>
                            <div className="text-xs text-text-light">
                              {order.cartItems?.length || 0} items
                            </div>
                          </div>
                          <div className="col-span-2">
                            <div className="text-sm font-medium text-text-dark">
                              {order.personalInfo?.firstName}{" "}
                              {order.personalInfo?.lastName}
                            </div>
                            <div className="text-xs text-text-light">
                              {order.personalInfo?.email}
                            </div>
                          </div>
                          <div className="col-span-1 text-sm font-semibold text-primary-800">
                            ${order.totalAmount?.toFixed(2)}
                          </div>
                          <div className="col-span-2">
                            <span
                              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusColor(order.orderStatus)}`}
                            >
                              {order.orderStatus}
                            </span>
                          </div>
                          <div className="col-span-2">
                            <span
                              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getPaymentStatusColor(order.payment?.status)}`}
                            >
                              {order.payment?.status || "pending"}
                            </span>
                          </div>
                          {isAdmin(role) && (
                            <div className="col-span-2 flex justify-end space-x-1">
                              <button
                                onClick={() => handleViewOrder(order._id)}
                                className="shadow-sunshine-soft hover:shadow-sunshine-medium inline-flex items-center rounded-lg bg-gradient-to-r from-sunshine-400 to-sunshine-500 px-2 py-1 text-xs font-semibold text-white transition-all hover:scale-110"
                                title="View Details"
                              >
                                <FaEye />
                              </button>
                              {order.orderStatus === "pending" && (
                                <button
                                  onClick={() =>
                                    handleUpdateStatus(order._id, "confirmed")
                                  }
                                  disabled={actionLoading === order._id}
                                  className="inline-flex items-center rounded-lg bg-gradient-to-r from-info to-info-600 px-2 py-1 text-xs font-semibold text-white shadow-sm transition-all hover:scale-110 disabled:opacity-50"
                                  title="Approve Order"
                                >
                                  {actionLoading === order._id ? (
                                    <div className="h-3 w-3 animate-spin rounded-full border border-white border-t-transparent"></div>
                                  ) : (
                                    <FaCheck />
                                  )}
                                </button>
                              )}
                              {(order.payment?.status === "pending" ||
                                order.payment?.status === "processing") && (
                                <button
                                  onClick={() =>
                                    handleUpdatePaymentStatus(
                                      order._id,
                                      "completed",
                                    )
                                  }
                                  disabled={actionLoading === order._id}
                                  className="inline-flex items-center rounded-lg bg-gradient-to-r from-success to-success-600 px-2 py-1 text-xs font-semibold text-white shadow-nature-soft transition-all hover:scale-110 hover:shadow-nature-medium disabled:opacity-50"
                                  title="Mark Payment Complete (Edge Case Only)"
                                >
                                  {actionLoading === order._id ? (
                                    <div className="h-3 w-3 animate-spin rounded-full border border-white border-t-transparent"></div>
                                  ) : (
                                    <FaCreditCard />
                                  )}
                                </button>
                              )}
                              {order.payment?.status === "completed" && (
                                <button
                                  onClick={() =>
                                    handleUpdatePaymentStatus(order._id, "refunded")
                                  }
                                  disabled={actionLoading === order._id}
                                  className="inline-flex items-center rounded-lg bg-gradient-to-r from-warning to-warning-600 px-2 py-1 text-xs font-semibold text-white shadow-sm transition-all hover:scale-110 disabled:opacity-50"
                                  title="Process Refund"
                                >
                                  {actionLoading === order._id ? (
                                    <div className="h-3 w-3 animate-spin rounded-full border border-white border-t-transparent"></div>
                                  ) : (
                                    <FaDollarSign />
                                  )}
                                </button>
                              )}
                              {order.orderStatus !== "cancelled" &&
                                order.orderStatus !== "completed" && (
                                  <button
                                    onClick={() => handleCancelOrder(order._id)}
                                    disabled={actionLoading === order._id}
                                    className="inline-flex items-center rounded-lg bg-gradient-to-r from-accent to-accent-600 px-2 py-1 text-xs font-semibold text-white shadow-sm transition-all hover:scale-110 disabled:opacity-50"
                                    title="Cancel Order"
                                  >
                                    {actionLoading === order._id ? (
                                      <div className="h-3 w-3 animate-spin rounded-full border border-white border-t-transparent"></div>
                                    ) : (
                                      <FaBan />
                                    )}
                                  </button>
                                )}
                            </div>
                          )}
                        </div>
                      );
                    })
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12">
                      <div className="flex h-24 w-24 items-center justify-center rounded-full bg-primary-50 ring-2 ring-primary-200">
                        <FaCreditCard className="h-12 w-12 text-primary-600" />
                      </div>
                      <h3 className="mt-4 text-lg font-semibold text-primary-800">
                        No orders found
                      </h3>
                      <button
                        onClick={() => {
                          setSearchValue("");
                          setStatusFilter("");
                          setPaymentStatusFilter("");
                          setDateFrom("");
                          setDateTo("");
                        }}
                        className="shadow-coral-soft hover:shadow-coral-medium mt-4 inline-flex items-center rounded-xl bg-gradient-to-r from-secondary to-sunshine-400 px-4 py-2 text-sm font-semibold text-white transition-all hover:scale-105 focus:outline-none"
                      >
                        Clear filters
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Pagination */}
          {orders.length > 0 && (
            <div className="border-t border-primary-200 bg-neutral-50 p-4">
              <div className="flex items-center justify-between">
                <div className="text-sm text-text-dark">
                  Showing{" "}
                  <span className="font-semibold text-secondary">
                    {(currentPage - 1) * parPage + 1}
                  </span>{" "}
                  to{" "}
                  <span className="font-semibold text-secondary">
                    {Math.min(currentPage * parPage, totalOrders)}
                  </span>{" "}
                  of{" "}
                  <span className="font-semibold text-secondary">
                    {totalOrders}
                  </span>{" "}
                  orders
                </div>
                <Pagination
                  pageNumber={currentPage}
                  setPageNumber={setCurrentPage}
                  totalItem={totalOrders}
                  parPage={parPage}
                  showItem={3}
                />
              </div>
            </div>
          )}
        </div>

        {/* Payment Status Update Warning Modal */}
        {showPaymentStatusModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="mx-4 w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-warning-100">
                  <FaCreditCard className="h-6 w-6 text-warning-600" />
                </div>
                <h3 className="text-xl font-bold text-primary-800">
                  Manual Payment Status Update
                </h3>
              </div>

              <div className="mb-6 space-y-4">
                <div className="rounded-lg border-2 border-warning-200 bg-warning-50 p-4">
                  <p className="mb-2 text-sm font-semibold text-warning-900">
                    ⚠️ Edge Cases Only
                  </p>
                  <p className="text-sm text-warning-800">
                    Payment status updates are typically handled automatically via webhooks when payments are completed. Manual updates should only be used for:
                  </p>
                  <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-warning-800">
                    <li>Error recovery (if webhook failed)</li>
                    <li>Testing purposes</li>
                    <li>Special circumstances</li>
                  </ul>
                </div>

                <div className="rounded-lg border border-primary-200 bg-primary-50 p-4">
                  <p className="text-sm text-primary-800">
                    <strong>Note:</strong> Most payment confirmations happen automatically when customers complete payment on WeTravel. This manual update is for exceptional cases only.
                  </p>
                </div>

                <p className="text-sm text-text-dark">
                  Are you sure you want to manually update the payment status to{" "}
                  <strong className="text-primary-800">{pendingPaymentStatus}</strong>?
                </p>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowPaymentStatusModal(false);
                    setPendingOrderId(null);
                    setPendingPaymentStatus(null);
                  }}
                  className="rounded-lg border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-text-dark transition-colors hover:bg-neutral-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() =>
                    confirmUpdatePaymentStatus(
                      pendingOrderId,
                      pendingPaymentStatus,
                    )
                  }
                  className="rounded-lg bg-gradient-to-r from-warning to-warning-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:from-warning-600 hover:to-warning-700"
                >
                  Confirm Update
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Payments;
