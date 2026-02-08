import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { get_orders } from "../../store/reducers/orderReducer";
import { Eye, Filter, Package, ShoppingBag } from "lucide-react";
import ReviewTimer from "./ReviewTimer";
import ReviewModal from "./ReviewModal";

const Orders = () => {
  const dispatch = useDispatch();
  const [state, setState] = useState("all");
  const { userInfo } = useSelector((state) => state.auth);
  const { myOrders } = useSelector((state) => state.order);

  const [reviewModal, setReviewModal] = useState({
    isOpen: false,
    orderId: null,
    tripId: null,
    tripTitle: null,
    tripImage: null,
  });

  useEffect(() => {
    dispatch(get_orders({ status: state, customerId: userInfo.id }));
  }, [userInfo.id, state, dispatch]);

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
    const statusLower = status?.toLowerCase();
    switch (statusLower) {
      case "completed":
      case "confirmed":
      case "delivered":
        return "bg-success-100 text-success-800";
      case "pending":
        return "bg-warning-100 text-warning-800";
      case "cancelled":
      case "failed":
        return "bg-error-100 text-error-800";
      case "processing":
        return "bg-info-100 text-info-800";
      default:
        return "bg-neutral-200 text-neutral-700";
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">
        <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-soft">
          {/* Header */}
          <div className="border-b border-neutral-200 bg-background-muted p-4 sm:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="mb-2 inline-flex items-center gap-2 rounded-lg border border-primary-200 bg-primary-50 px-3 py-1">
                  <Package className="h-4 w-4 text-primary-600" />
                  <span className="text-xs font-semibold text-primary-700">
                    Orders
                  </span>
                </div>
                <h2 className="text-xl font-bold text-primary-800 sm:text-2xl">
                  My Orders
                </h2>
              </div>

              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-text-light" />
                <select
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm font-medium text-text transition-colors hover:border-primary-300 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
                >
                  <option value="all">All Orders</option>
                  <option value="placed">Placed</option>
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-neutral-200 bg-background-muted text-left text-xs font-semibold uppercase tracking-wider text-text-light">
                  <th className="px-4 py-3 sm:px-6">Order ID</th>
                  <th className="px-4 py-3 sm:px-6">Price</th>
                  <th className="px-4 py-3 sm:px-6">Payment Status</th>
                  <th className="px-4 py-3 sm:px-6">Order Status</th>
                  <th className="px-4 py-3 sm:px-6">Review Status</th>
                  <th className="px-4 py-3 sm:px-6">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {myOrders && myOrders.length > 0 ? (
                  myOrders.map((order, i) => (
                    <tr
                      key={i}
                      className="transition-colors hover:bg-background-muted"
                    >
                      <td className="whitespace-nowrap px-4 py-4 sm:px-6">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-primary-50">
                            <ShoppingBag className="h-5 w-5 text-primary-600" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-primary-800">
                              #{order._id}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-4 py-4 sm:px-6">
                        <div className="text-sm font-bold text-primary-800">
                          ${order.price}
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-4 py-4 sm:px-6">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${getStatusColor(order.payment_status)}`}
                        >
                          {order.payment_status}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-4 py-4 sm:px-6">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${getStatusColor(order.delivery_status)}`}
                        >
                          {order.delivery_status}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-4 py-4 sm:px-6">
                        {order.cartItems && order.cartItems.length > 0 ? (
                          <ReviewTimer
                            tripStartDate={order.cartItems[0].startingDate}
                            tripDuration={order.cartItems[0].days || 1}
                            orderId={order._id}
                            tripId={order.cartItems[0].tripId}
                            tripTitle={order.cartItems[0].mainTitle}
                            tripImage={order.cartItems[0].mainImage}
                            onOpenReviewModal={openReviewModal}
                          />
                        ) : (
                          <span className="text-xs text-text-lighter">
                            No trip data
                          </span>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-4 py-4 sm:px-6">
                        <Link
                          to={`/dashboard/details/${order._id}`}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-primary-50 px-3 py-1.5 text-xs font-semibold text-primary-700 transition-colors hover:bg-primary-100"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          <span>View</span>
                        </Link>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="px-4 py-12 text-center sm:px-6">
                      <div className="flex flex-col items-center justify-center">
                        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-neutral-100">
                          <ShoppingBag className="h-8 w-8 text-neutral-400" />
                        </div>
                        <h3 className="mb-1 text-base font-semibold text-primary-800">
                          No orders found
                        </h3>
                        <p className="text-sm text-text-light">
                          {state === "all"
                            ? "You haven't placed any orders yet"
                            : `No ${state} orders found`}
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

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

export default Orders;
