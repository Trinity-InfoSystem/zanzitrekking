import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { getCustomerOrderHistory } from "../store/reducers/orderReducer";
import {
  ArrowLeft,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Clock,
  Eye,
  Filter,
  Package,
  Search,
  XCircle,
} from "lucide-react";
import AOS from "aos";
import "aos/dist/aos.css";

const Orders = () => {
  const dispatch = useDispatch();
  const { userInfo } = useSelector((state) => state.auth);
  const { orderHistory, loader, totalOrders, currentPage, totalPages } =
    useSelector((state) => state.order);

  const [searchValue, setSearchValue] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [currentPageState, setCurrentPageState] = useState(1);
  const [parPage, setParPage] = useState(10);

  useEffect(() => {
    AOS.init({
      once: true,
      duration: 400,
      offset: 60,
      easing: "ease-out-cubic",
    });
    if (userInfo?._id) {
      dispatch(
        getCustomerOrderHistory({
          customerId: userInfo._id,
          page: currentPageState,
          parPage,
          status: statusFilter,
        }),
      );
    }
  }, [userInfo?._id, currentPageState, parPage, statusFilter, dispatch]);

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPageState(1);
    // Note: Search functionality would need to be implemented in the backend
  };

  const handleStatusFilter = (status) => {
    setStatusFilter(status === statusFilter ? "" : status);
    setCurrentPageState(1);
  };

  const handlePageChange = (page) => {
    setCurrentPageState(page);
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

  const getStatusIcon = (status) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "confirmed":
        return <CheckCircle className="h-4 w-4 text-blue-600" />;
      case "pending":
        return <Clock className="h-4 w-4 text-amber-600" />;
      case "cancelled":
        return <XCircle className="h-4 w-4 text-red-600" />;
      case "in-progress":
        return <Package className="h-4 w-4 text-purple-600" />;
      case "preparing":
        return <Package className="h-4 w-4 text-indigo-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
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

  const statusOptions = [
    { value: "", label: "All Statuses" },
    { value: "pending", label: "Pending" },
    { value: "confirmed", label: "Confirmed" },
    { value: "preparing", label: "Preparing" },
    { value: "in-progress", label: "In Progress" },
    { value: "completed", label: "Completed" },
    { value: "cancelled", label: "Cancelled" },
  ];

  const generatePagination = () => {
    const pages = [];
    const maxVisiblePages = 5;
    const startPage = Math.max(
      1,
      currentPage - Math.floor(maxVisiblePages / 2),
    );
    const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (startPage > 1) {
      pages.push(
        <button
          key={1}
          onClick={() => handlePageChange(1)}
          className="px-3 py-2 text-sm font-medium text-gray-500 hover:text-gray-700"
        >
          1
        </button>,
      );
      if (startPage > 2) {
        pages.push(
          <span key="ellipsis1" className="px-3 py-2 text-sm text-gray-500">
            ...
          </span>,
        );
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`px-3 py-2 text-sm font-medium ${
            i === currentPage
              ? "bg-blue-600 text-white"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          {i}
        </button>,
      );
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pages.push(
          <span key="ellipsis2" className="px-3 py-2 text-sm text-gray-500">
            ...
          </span>,
        );
      }
      pages.push(
        <button
          key={totalPages}
          onClick={() => handlePageChange(totalPages)}
          className="px-3 py-2 text-sm font-medium text-gray-500 hover:text-gray-700"
        >
          {totalPages}
        </button>,
      );
    }

    return pages;
  };

  return (
    <div className="from-background-nature via-background-sunset min-h-screen bg-gradient-to-br to-background-paper p-6">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8" data-aos="fade-up">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-black text-primary">My Bookings</h1>
              <p className="mt-1 text-text-light">
                View and manage all your trip bookings
              </p>
            </div>
            <Link
              to="/dashboard"
              className="shadow-nature-soft hover:shadow-nature-medium inline-flex items-center rounded-2xl bg-gradient-to-r from-primary to-primary-600 px-4 py-2 text-sm font-semibold text-white transition-all hover:scale-105"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Link>
          </div>
        </div>

        {/* Filters and Search */}
        <div
          className="to-background-nature/20 shadow-nature-large mb-6 rounded-3xl border border-primary/10 bg-gradient-to-br from-white via-background-paper p-6 backdrop-blur-xl"
          data-aos="fade-up"
        >
          <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
            {/* Search */}
            <div className="max-w-md flex-1">
              <form onSubmit={handleSearch} className="relative">
                <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-primary/60" />
                <input
                  type="text"
                  placeholder="Search bookings..."
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  className="shadow-nature-soft w-full rounded-2xl border-0 bg-gradient-to-r from-primary/5 to-secondary/5 py-3 pl-10 pr-4 text-sm text-primary ring-2 ring-primary/10 transition-all placeholder:text-primary/60 focus:bg-white focus:ring-2 focus:ring-secondary"
                />
              </form>
            </div>

            {/* Status Filter */}
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-primary/60" />
              <span className="text-sm font-bold text-primary">Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => handleStatusFilter(e.target.value)}
                className="shadow-nature-soft rounded-2xl border-0 bg-gradient-to-r from-primary/5 to-secondary/5 px-3 py-2 text-sm text-primary ring-2 ring-primary/10 transition-all focus:bg-white focus:ring-2 focus:ring-secondary"
              >
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Items per page */}
            <div className="flex items-center space-x-2">
              <span className="text-sm font-bold text-primary">Show:</span>
              <select
                value={parPage}
                onChange={(e) => {
                  setParPage(parseInt(e.target.value));
                  setCurrentPageState(1);
                }}
                className="shadow-nature-soft rounded-2xl border-0 bg-gradient-to-r from-primary/5 to-secondary/5 px-3 py-2 text-sm text-primary ring-2 ring-primary/10 transition-all focus:bg-white focus:ring-2 focus:ring-secondary"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>
          </div>
        </div>

        {/* Orders Table */}
        <div
          className="shadow-nature-medium bg-white/80 backdrop-blur-xl"
          data-aos="fade-up"
        >
          <div className="overflow-x-auto rounded-3xl border border-primary/10">
            <table className="w-full">
              <thead>
                <tr className="border-b border-primary/10 bg-gradient-to-r from-primary/5 to-secondary/5">
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-primary">
                    Booking
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-primary">
                    Date
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-primary">
                    Total Cost
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-primary">
                    Payment
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-primary">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-primary">
                    Trips
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-primary">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-primary/10 bg-white/80">
                {loader ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-8 text-center">
                      <div className="flex items-center justify-center">
                        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                        <span className="ml-2 text-sm text-text-light">
                          Loading bookings...
                        </span>
                      </div>
                    </td>
                  </tr>
                ) : orderHistory.length > 0 ? (
                  orderHistory.map((order) => (
                    <tr key={order._id} className="hover:bg-primary/5">
                      <td className="whitespace-nowrap px-6 py-4">
                        <div>
                          <div className="text-sm font-bold text-primary">
                            #{order.orderNumber}
                          </div>
                          <div className="text-xs text-text-lighter">
                            {order.cartItems?.length || 0} trip(s)
                          </div>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="text-sm text-text-dark">
                          {formatDate(order.createdAt)}
                        </div>
                        <div className="text-xs text-text-lighter">
                          {formatDateTime(order.createdAt)}
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="text-sm font-bold text-text-dark">
                          ${order.totalAmount?.toFixed(2)}
                        </div>
                        {order.discountAmount > 0 && (
                          <div className="text-xs text-success">
                            -${order.discountAmount?.toFixed(2)} saved
                          </div>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold ${getPaymentStatusColor(order.payment?.status)}`}
                        >
                          {order.payment?.status || "pending"}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="flex items-center">
                          {getStatusIcon(order.orderStatus)}
                          <span
                            className={`ml-2 inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold ${getStatusColor(order.orderStatus)}`}
                          >
                            {order.orderStatus}
                          </span>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="text-sm text-text-dark">
                          {order.cartItems?.map((item, index) => (
                            <div key={index} className="mb-1">
                              <div className="font-semibold text-primary">
                                {item.mainTitle}
                              </div>
                              <div className="text-xs text-text-lighter">
                                {formatDate(item.startingDate)} •{" "}
                                {item.travelersNumber} traveler(s)
                              </div>
                            </div>
                          ))}
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm font-medium">
                        <Link
                          to={`/dashboard/orders/${order._id}`}
                          className="shadow-nature-soft inline-flex items-center rounded-2xl bg-gradient-to-r from-primary/10 to-secondary/10 px-3 py-1.5 text-xs font-semibold text-primary hover:from-primary/20 hover:to-secondary/20"
                        >
                          <Eye className="mr-1 h-3.5 w-3.5" />
                          View Details
                        </Link>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="px-6 py-12 text-center">
                      <div className="text-center" data-aos="fade-up">
                        <Package className="mx-auto h-12 w-12 text-primary" />
                        <h3 className="mt-2 text-sm font-bold text-primary">
                          No bookings found
                        </h3>
                        <p className="mt-1 text-sm text-text-light">
                          {statusFilter
                            ? `No bookings with status "${statusFilter}" found.`
                            : "You haven&apos;t made any bookings yet."}
                        </p>
                        <div className="mt-6">
                          <Link
                            to="/trips"
                            className="shadow-nature-soft hover:shadow-nature-medium inline-flex items-center rounded-2xl bg-gradient-to-r from-primary to-primary-600 px-4 py-2 text-sm font-semibold text-white transition-all hover:scale-105"
                          >
                            Browse Trips
                          </Link>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="border-t border-primary/10 bg-white/80 px-6 py-4 backdrop-blur-md">
              <div className="flex items-center justify-between">
                <div className="flex items-center text-sm text-text-dark">
                  <span>
                    Showing {(currentPage - 1) * parPage + 1} to{" "}
                    {Math.min(currentPage * parPage, totalOrders)} of{" "}
                    {totalOrders} results
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="shadow-nature-soft inline-flex items-center rounded-2xl border border-primary/20 bg-white/80 px-3 py-2 text-sm font-semibold text-primary hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </button>
                  <div className="flex items-center space-x-1">
                    {generatePagination()}
                  </div>
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="shadow-nature-soft inline-flex items-center rounded-2xl border border-primary/20 bg-white/80 px-3 py-2 text-sm font-semibold text-primary hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Orders;
