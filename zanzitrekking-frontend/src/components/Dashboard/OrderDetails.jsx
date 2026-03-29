import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useParams } from "react-router-dom";
import { get_orders_details } from "../../store/reducers/orderReducer";
import { resolveMediaUrl } from "../../utils/imageUtils";
import {
  ArrowLeft,
  Calendar,
  CheckCircle,
  Clock,
  DollarSign,
  Mail,
  MapPin,
  Package,
  ShoppingBag,
} from "lucide-react";

const OrderDetails = () => {
  const dispatch = useDispatch();
  const { orderId } = useParams();
  const { myOrder } = useSelector((state) => state.order);
  const { userInfo } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(get_orders_details(orderId));
  }, [orderId, dispatch]);

  const getStatusColor = (status) => {
    const statusLower = status?.toLowerCase();
    switch (statusLower) {
      case "paid":
      case "completed":
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
      <div className="mx-auto max-w-5xl">
        {/* Back Button */}
        <Link
          to="/dashboard/orders"
          className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-primary-600 transition-colors hover:text-primary-700"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Orders</span>
        </Link>

        {/* Header */}
        <div className="mb-6 overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-soft">
          <div className="border-b border-neutral-200 bg-background-muted p-4 sm:p-6">
            <div className="mb-3 inline-flex items-center gap-2 rounded-lg border border-primary-200 bg-primary-50 px-3 py-1">
              <Package className="h-4 w-4 text-primary-600" />
              <span className="text-xs font-semibold text-primary-700">
                Order Details
              </span>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-xl font-bold text-primary-800 sm:text-2xl">
                  Order #{myOrder._id}
                </h1>
                {myOrder.date && (
                  <p className="mt-1 flex items-center gap-2 text-sm text-text-light">
                    <Calendar className="h-4 w-4" />
                    <span>{myOrder.date}</span>
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Order Info Grid */}
          <div className="grid gap-6 p-4 sm:p-6 md:grid-cols-2">
            {/* Delivery Information */}
            <div className="space-y-4">
              <h3 className="flex items-center gap-2 text-base font-bold text-primary-800">
                <MapPin className="h-5 w-5 text-primary-600" />
                Delivery Information
              </h3>
              <div className="space-y-3 rounded-lg border border-neutral-200 bg-background-muted p-4">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-text-lighter">
                    Recipient
                  </p>
                  <p className="mt-1 text-sm font-semibold text-primary-800">
                    {myOrder.shippingInfo?.name || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-text-lighter">
                    Address
                  </p>
                  <div className="mt-1 flex items-start gap-2">
                    <span className="mt-0.5 inline-flex items-center rounded-md bg-info-100 px-2 py-0.5 text-xs font-medium text-info-700">
                      Home
                    </span>
                    <p className="text-sm text-text">
                      {myOrder.shippingInfo?.address}{" "}
                      {myOrder.shippingInfo?.city}
                    </p>
                  </div>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-text-lighter">
                    Email
                  </p>
                  <p className="mt-1 flex items-center gap-2 text-sm text-text">
                    <Mail className="h-4 w-4 text-primary-600" />
                    <span>{userInfo.email}</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="space-y-4">
              <h3 className="flex items-center gap-2 text-base font-bold text-primary-800">
                <DollarSign className="h-5 w-5 text-primary-600" />
                Order Summary
              </h3>
              <div className="space-y-3 rounded-lg border border-neutral-200 bg-background-muted p-4">
                <div className="flex items-center justify-between border-b border-neutral-200 pb-3">
                  <p className="text-sm font-medium text-text">Total Price</p>
                  <p className="text-lg font-bold text-primary-800">
                    ${myOrder.price}
                  </p>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium uppercase tracking-wider text-text-lighter">
                    Payment Status
                  </p>
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${getStatusColor(myOrder.payment_status)}`}
                  >
                    {myOrder.payment_status === "paid" ? (
                      <CheckCircle className="h-3 w-3" />
                    ) : (
                      <Clock className="h-3 w-3" />
                    )}
                    {myOrder.payment_status}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium uppercase tracking-wider text-text-lighter">
                    Order Status
                  </p>
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${getStatusColor(myOrder.delivery_status)}`}
                  >
                    {myOrder.delivery_status === "delivered" ? (
                      <CheckCircle className="h-3 w-3" />
                    ) : (
                      <Clock className="h-3 w-3" />
                    )}
                    {myOrder.delivery_status}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Order Items (Trips) */}
        <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-soft">
          <div className="border-b border-neutral-200 bg-background-muted p-4 sm:p-6">
            <h2 className="flex items-center gap-2 text-lg font-bold text-primary-800">
              <ShoppingBag className="h-5 w-5 text-primary-600" />
              Order Items
            </h2>
          </div>

          <div className="divide-y divide-neutral-100 p-4 sm:p-6">
            {myOrder.cartItems?.length > 0 ? (
              myOrder.cartItems.map((item, i) => (
                <div
                  key={i}
                  className="flex flex-col gap-4 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex gap-4">
                    <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg border border-neutral-200">
                      <img
                        className="h-full w-full object-cover"
                        src={
                          resolveMediaUrl(
                            item.mainImage || item.tripId?.mainImage,
                          ) || "/placeholder.svg"
                        }
                        alt={item.mainTitle || item.tripId?.mainTitle || "Trip"}
                      />
                    </div>
                    <div className="flex flex-col justify-center">
                      {item.tripId?.slug ? (
                        <Link
                          to={`/trip/details/${item.tripId.slug}`}
                          className="text-sm font-semibold text-primary-800 hover:text-primary-600"
                        >
                          {item.mainTitle || item.tripId?.mainTitle || "Trip"}
                        </Link>
                      ) : (
                        <span className="text-sm font-semibold text-primary-800">
                          {item.mainTitle || item.tripId?.mainTitle || "Trip"}
                        </span>
                      )}
                      <p className="mt-1 text-xs text-text-light">
                        Travelers: {item.travelersNumber || 1}
                      </p>
                      {item.startingDate && (
                        <p className="text-xs text-text-light">
                          Date: {new Date(item.startingDate).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-4 sm:flex-col sm:items-end">
                    <div className="text-right">
                      <p className="text-base font-bold text-primary-800">
                        ${(item.itemTotal || item.itemSubtotal || 0).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-8 text-center">
                <p className="text-sm text-text-light">No items found</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;
