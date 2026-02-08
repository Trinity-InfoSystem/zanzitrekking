const Order = require("../models/order");

/**
 * Automatically update trip item status to "completed" when trip end date has passed
 * This should be called periodically (e.g., via cron job or manually)
 */
const autoCompleteTrips = async () => {
  try {
    const now = new Date();
    console.log(
      `[Auto-Complete] Checking for trips to complete at ${now.toISOString()}`
    );

    // Find all orders with items that are confirmed or in-progress
    const orders = await Order.find({
      "cartItems.itemStatus": { $in: ["confirmed", "in-progress", "pending"] },
    });

    let totalUpdated = 0;
    const updatePromises = [];

    const normalizePaymentStatus = (order) => {
      if (
        order.payment &&
        order.payment.status &&
        order.payment.status === "review"
      ) {
        order.payment.status = "processing";
      }
    };

    for (const order of orders) {
      let orderModified = false;

      for (let i = 0; i < order.cartItems.length; i++) {
        const item = order.cartItems[i];

        // Skip if already completed or cancelled
        if (
          item.itemStatus === "completed" ||
          item.itemStatus === "cancelled"
        ) {
          continue;
        }

        // Calculate trip end date
        const tripStartDate = new Date(item.startingDate);
        const tripDuration = item.days || 1;
        const tripEndDate = new Date(tripStartDate);
        tripEndDate.setDate(tripEndDate.getDate() + tripDuration - 1);
        tripEndDate.setHours(23, 59, 59, 999); // Set to end of day

        // Check if trip has ended
        if (tripEndDate < now) {
          console.log(
            `[Auto-Complete] Completing trip: Order ${order.orderNumber}, Item ${i}, Trip ID: ${item.tripId}`
          );
          console.log(
            `  - Start: ${tripStartDate.toISOString()}, Duration: ${tripDuration} days, End: ${tripEndDate.toISOString()}`
          );

          // Update item status to completed
          order.cartItems[i].itemStatus = "completed";
          orderModified = true;
          totalUpdated++;
        }
      }

      // Save the order if any items were updated
      if (orderModified) {
        // Update overall order status if all items are completed
        const allCompleted = order.cartItems.every(
          (item) =>
            item.itemStatus === "completed" || item.itemStatus === "cancelled"
        );

        if (allCompleted && order.orderStatus !== "completed") {
          order.orderStatus = "completed";
          order.completedAt = now;
          console.log(
            `[Auto-Complete] Order ${order.orderNumber} fully completed`
          );
        }

        // Update overall trip status
        order.overallTripStatus = order.calculatedTripStatus;

        normalizePaymentStatus(order);
        updatePromises.push(order.save());
      }
    }

    // Wait for all updates to complete
    await Promise.all(updatePromises);

    console.log(
      `[Auto-Complete] Successfully completed ${totalUpdated} trips across ${updatePromises.length} orders`
    );

    return {
      success: true,
      tripsCompleted: totalUpdated,
      ordersUpdated: updatePromises.length,
      checkedAt: now,
    };
  } catch (error) {
    console.error("[Auto-Complete] Error auto-completing trips:", error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Check if a specific order needs trip completion updates
 */
const checkOrderTripsCompletion = async (orderId) => {
  try {
    const order = await Order.findById(orderId);
    if (!order) {
      throw new Error("Order not found");
    }

    const now = new Date();
    let modified = false;

    for (let i = 0; i < order.cartItems.length; i++) {
      const item = order.cartItems[i];

      // Skip if already completed or cancelled
      if (item.itemStatus === "completed" || item.itemStatus === "cancelled") {
        continue;
      }

      // Calculate trip end date
      const tripStartDate = new Date(item.startingDate);
      const tripDuration = item.days || 1;
      const tripEndDate = new Date(tripStartDate);
      tripEndDate.setDate(tripEndDate.getDate() + tripDuration - 1);
      tripEndDate.setHours(23, 59, 59, 999);

      // Check if trip has ended
      if (tripEndDate < now) {
        order.cartItems[i].itemStatus = "completed";
        modified = true;
      }
    }

    if (modified) {
      normalizePaymentStatus(order);
      // Update overall order status if all items are completed
      const allCompleted = order.cartItems.every(
        (item) =>
          item.itemStatus === "completed" || item.itemStatus === "cancelled"
      );

      if (allCompleted && order.orderStatus !== "completed") {
        order.orderStatus = "completed";
        order.completedAt = now;
      }

      // Update overall trip status
      order.overallTripStatus = order.calculatedTripStatus;

      await order.save();
    }

    return {
      success: true,
      modified,
      order,
    };
  } catch (error) {
    console.error("[Auto-Complete] Error checking order trips:", error);
    throw error;
  }
};

module.exports = {
  autoCompleteTrips,
  checkOrderTripsCompletion,
};
