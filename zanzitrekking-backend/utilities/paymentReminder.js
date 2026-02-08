const Order = require("../models/order");
const Trip = require("../models/trip");
const emailQueue = require("../workers/emailQueue");
const {
  isTripDateInPast,
  checkBookingRestriction,
} = require("./bookingRestrictions");

/**
 * Send payment reminder emails to customers with pending payments
 */
const sendPaymentReminders = async () => {
  try {
    console.log("[Payment Reminder] Starting payment reminder job...");

    // Find all orders with processing payment status
    const ordersWithPendingPayment = await Order.find({
      "payment.status": "processing",
      "payment.weTravelPaymentLink": { $exists: true, $ne: "" },
    })
      .populate("customerId", "name email")
      .lean();

    console.log(
      `[Payment Reminder] Found ${ordersWithPendingPayment.length} orders with pending payment`
    );

    let emailsSent = 0;
    let emailsFailed = 0;

    for (const order of ordersWithPendingPayment) {
      try {
        // TESTING: Check booking restrictions for specific order
        const isTestOrder = order.orderNumber === "ZT-20251008-0004";

        if (isTestOrder) {
          console.log(
            `[Payment Reminder] 🧪 TESTING ORDER: ${order.orderNumber}`
          );
          console.log(`[Payment Reminder] Order details:`, {
            orderNumber: order.orderNumber,
            cartItemsCount: order.cartItems?.length || 0,
            paymentStatus: order.payment?.status,
          });
        }

        // Check if all trips in cartItems still exist in the database
        if (order.cartItems && order.cartItems.length > 0) {
          // Verify all trips exist
          const tripIds = order.cartItems
            .map((item) => item.tripId)
            .filter((id) => id); // Filter out null/undefined

          if (tripIds.length > 0) {
            const existingTrips = await Trip.find({
              _id: { $in: tripIds },
            }).select("_id");

            const existingTripIds = new Set(
              existingTrips.map((trip) => trip._id.toString())
            );
            const missingTripIds = tripIds.filter(
              (id) => !existingTripIds.has(id.toString())
            );

            if (missingTripIds.length > 0) {
              console.log(
                `[Payment Reminder] ⏭️  Skipping order ${
                  order.orderNumber
                }: Some trips no longer exist in database (tripIds: ${missingTripIds.join(
                  ", "
                )})`
              );
              continue;
            }
          }

          const firstTripStartDate = order.cartItems[0].startingDate;

          if (isTestOrder) {
            console.log(
              `[Payment Reminder] 🧪 Checking trip date for test order:`,
              {
                tripStartDate: firstTripStartDate,
                isInPast: isTripDateInPast(firstTripStartDate),
              }
            );
          }

          if (isTripDateInPast(firstTripStartDate)) {
            console.log(
              `[Payment Reminder] ⏭️  Skipping order ${order.orderNumber}: Trip start date (${firstTripStartDate}) is in the past`
            );
            continue;
          }

          // TESTING: Check booking restrictions for test order
          if (isTestOrder) {
            console.log(
              `[Payment Reminder] 🧪 Checking booking restrictions for test order...`
            );
            for (const cartItem of order.cartItems) {
              console.log(`[Payment Reminder] 🧪 Cart Item:`, {
                mainTitle: cartItem.mainTitle,
                selectedCategory: cartItem.selectedCategory,
                startingDate: cartItem.startingDate,
                tripId: cartItem.tripId,
              });

              // Pass isTestOrder=true to enable verbose logging in bookingRestrictions
              const restriction = await checkBookingRestriction(
                cartItem,
                null,
                true
              );
              console.log(`[Payment Reminder] 🧪 Booking Restriction Result:`, {
                allowed: restriction.allowed,
                warning: restriction.warning,
                daysUntilTrip: restriction.daysUntilTrip,
              });
            }
          }
        }

        // Calculate days since order creation
        const orderDate = new Date(order.createdAt);
        const now = new Date();
        const daysSinceOrder = Math.floor(
          (now - orderDate) / (1000 * 60 * 60 * 24)
        );

        // Get customer email
        const customerEmail =
          order.personalInfo?.email || order.customerId?.email;

        if (!customerEmail) {
          console.warn(
            `[Payment Reminder] No email found for order ${order.orderNumber}`
          );
          continue;
        }

        // Prepare email job
        const emailJob = {
          subject: `Payment Reminder: Complete Your Booking #${order.orderNumber}`,
          content: generatePaymentReminderEmail(order, daysSinceOrder),
          recipients: [customerEmail],
          attachment: null,
        };

        // Add to email queue
        emailQueue.add(emailJob);
        emailsSent++;

        console.log(
          `[Payment Reminder] Reminder sent for order ${order.orderNumber} (${daysSinceOrder} days old)`
        );
      } catch (error) {
        console.error(
          `[Payment Reminder] Failed to send reminder for order ${order.orderNumber}:`,
          error
        );
        emailsFailed++;
      }
    }

    console.log(
      `[Payment Reminder] Job complete. Sent: ${emailsSent}, Failed: ${emailsFailed}`
    );

    return {
      success: true,
      emailsSent,
      emailsFailed,
      totalOrders: ordersWithPendingPayment.length,
    };
  } catch (error) {
    console.error("[Payment Reminder] Error in payment reminder job:", error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Generate HTML email for payment reminder
 * @param {Object} order - Order document
 * @param {number} daysSinceOrder - Days since order was created
 * @returns {string} HTML email content
 */
const generatePaymentReminderEmail = (order, daysSinceOrder) => {
  const customerName =
    order.personalInfo?.firstName ||
    order.customerId?.name ||
    "Valued Customer";

  const urgencyMessage =
    daysSinceOrder >= 3
      ? "⚠️ <strong>URGENT:</strong> Your booking reservation will expire soon!"
      : daysSinceOrder >= 1
      ? "⏰ <strong>REMINDER:</strong> Please complete your payment to secure your trip."
      : "📋 Your booking is pending payment confirmation.";

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Payment Reminder</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); border: 1px solid #e0e0e0;">
          <!-- Header -->
          <tr>
            <td style="background-color: #000000; padding: 30px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold;">
                💳 Payment Reminder
              </h1>
            </td>
          </tr>
          
          <!-- Urgency Banner -->
          <tr>
            <td style="background-color: #f0f0f0; padding: 20px; border-left: 4px solid #000000;">
              <p style="margin: 0; color: #000000; font-size: 16px; font-weight: bold;">
                ${urgencyMessage}
              </p>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 30px;">
              <p style="font-size: 16px; color: #000000; margin: 0 0 20px; font-weight: normal;">
                Hello ${customerName},
              </p>
              
              <p style="font-size: 14px; color: #333333; margin: 0 0 20px; line-height: 1.6;">
                This is a friendly reminder that your booking <strong style="color: #000000;">#${
                  order.orderNumber
                }</strong> is awaiting payment confirmation.
              </p>

              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9f9f9; border-radius: 8px; padding: 20px; margin: 20px 0; border: 1px solid #e0e0e0;">
                <tr>
                  <td>
                    <p style="font-size: 14px; color: #000000; margin: 0 0 10px;"><strong>Order Number:</strong> ${
                      order.orderNumber
                    }</p>
                    <p style="font-size: 14px; color: #000000; margin: 0 0 10px;"><strong>Total Amount:</strong> $${order.totalAmount?.toFixed(
                      2
                    )}</p>
                    <p style="font-size: 14px; color: #000000; margin: 0 0 10px;"><strong>Number of Trips:</strong> ${
                      order.cartItems?.length || 0
                    }</p>
                    <p style="font-size: 14px; color: #000000; margin: 0;"><strong>Days Since Order:</strong> ${daysSinceOrder} ${
    daysSinceOrder === 1 ? "day" : "days"
  }</p>
                  </td>
                </tr>
              </table>

              <p style="font-size: 14px; color: #333333; margin: 20px 0; line-height: 1.6;">
                <strong style="color: #000000;">Important:</strong> To secure your reservation and guarantee your spot, please complete your payment as soon as possible.
              </p>

              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                <tr>
                  <td align="center">
                    <a href="${order.payment.weTravelPaymentLink}" 
                       style="display: inline-block; background-color: #000000; color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-size: 16px; font-weight: bold; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2); border: 2px solid #000000;">
                      Complete Payment Now →
                    </a>
                  </td>
                </tr>
              </table>

              <p style="font-size: 12px; color: #666666; margin: 20px 0 0; padding-top: 20px; border-top: 1px solid #e0e0e0; line-height: 1.5;">
                If you've already completed your payment, please disregard this email. It may take a few hours for payment confirmation to be processed.
              </p>

              <p style="font-size: 12px; color: #666666; margin: 10px 0 0; line-height: 1.5;">
                If you have any questions or need assistance, please don't hesitate to contact our support team.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f9f9f9; padding: 20px; text-align: center; border-top: 1px solid #e0e0e0;">
              <p style="font-size: 12px; color: #333333; margin: 0 0 10px;">
                © ${new Date().getFullYear()} Zanzi Trekking & Safaris. All rights reserved.
              </p>
              <p style="font-size: 12px; color: #666666; margin: 0;">
                This is an automated reminder. Please do not reply to this email.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
};

module.exports = {
  sendPaymentReminders,
};
