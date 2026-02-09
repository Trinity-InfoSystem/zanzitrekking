const Order = require("../../models/order");
const { responseReturn } = require("../../utilities/response");
const {
  generatePaymentConfirmationEmail,
} = require("../../utilities/orderEmailTemplates");
const emailQueue = require("../../workers/emailQueue");
const crypto = require("crypto");

/**
 * WeTravel Webhook Controller
 * Handles webhook events from WeTravel for payment confirmations
 */
class WeTravelWebhookController {
  /**
   * Verify webhook signature (if WeTravel provides signature verification)
   * @param {Object} payload - Webhook payload
   * @param {string} signature - Webhook signature from headers
   * @returns {boolean} - True if signature is valid
   */
  verifyWebhookSignature(payload, signature) {
    // If webhook secret is configured, verify signature
    const webhookSecret = process.env.WETRAVEL_WEBHOOK_SECRET;
    if (!webhookSecret) {
      // If no secret configured, log warning but allow (for development)
      console.warn(
        "[Webhook] ⚠️ WETRAVEL_WEBHOOK_SECRET not configured - skipping signature verification"
      );
      return true; // Allow in development, but should be configured in production
    }

    if (!signature) {
      console.error("[Webhook] ❌ No signature provided");
      return false;
    }

    try {
      // WeTravel may use HMAC SHA256 or similar
      // Adjust the algorithm based on WeTravel's documentation
      // Try different signature formats (hex, base64, etc.)
      const payloadString = typeof payload === "string" ? payload : JSON.stringify(payload);
      
      const expectedSignature = crypto
        .createHmac("sha256", webhookSecret)
        .update(payloadString)
        .digest("hex");

      // Normalize signatures for comparison (remove any prefixes like "sha256=")
      const normalizedReceived = signature.replace(/^sha256=/, "").toLowerCase();
      const normalizedExpected = expectedSignature.toLowerCase();

      // Compare signatures (use constant-time comparison to prevent timing attacks)
      const isValid = crypto.timingSafeEqual(
        Buffer.from(normalizedReceived),
        Buffer.from(normalizedExpected)
      );

      if (!isValid) {
        console.error("[Webhook] ❌ Invalid webhook signature");
        console.error("[Webhook] Expected:", normalizedExpected.substring(0, 20) + "...");
        console.error("[Webhook] Received:", normalizedReceived.substring(0, 20) + "...");
      }

      return isValid;
    } catch (error) {
      console.error("[Webhook] ❌ Error verifying signature:", error);
      return false;
    }
  }

  /**
   * Extract order identifier from webhook payload
   * Handles different possible payload structures
   * @param {Object} payload - Webhook payload
   * @returns {Object} - { tripUuid, orderNumber, transactionId }
   */
  extractOrderIdentifier(payload) {
    // Try different possible payload structures
    // WeTravel may send data in different formats

    // Format 1: Direct fields
    let tripUuid =
      payload.trip_uuid ||
      payload.tripUuid ||
      payload.trip?.uuid ||
      payload.data?.trip?.uuid ||
      payload.data?.trip_uuid;

    let orderNumber =
      payload.trip_id ||
      payload.tripId ||
      payload.order_number ||
      payload.orderNumber ||
      payload.trip?.trip_id ||
      payload.data?.trip?.trip_id ||
      payload.data?.trip_id;

    let transactionId =
      payload.transaction_id ||
      payload.transactionId ||
      payload.transaction?.id ||
      payload.data?.transaction?.id ||
      payload.data?.transaction_id;

    // Format 2: Nested in data object
    if (!tripUuid && payload.data) {
      tripUuid = payload.data.uuid || payload.data.id;
    }

    return {
      tripUuid,
      orderNumber,
      transactionId,
    };
  }

  /**
   * Map WeTravel payment status to internal payment status
   * @param {string} wetravelStatus - WeTravel payment status
   * @returns {string} - Internal payment status
   */
  mapPaymentStatus(wetravelStatus) {
    if (!wetravelStatus) return "pending";

    const statusMap = {
      paid: "completed",
      completed: "completed",
      success: "completed",
      succeeded: "completed",
      pending: "pending",
      processing: "processing",
      failed: "failed",
      cancelled: "failed",
      refunded: "refunded",
      refund: "refunded",
    };

    const normalized = wetravelStatus.toLowerCase().trim();
    return statusMap[normalized] || "pending";
  }

  /**
   * Find order by WeTravel identifiers
   * @param {Object} identifiers - Order identifiers
   * @returns {Promise<Object|null>} - Order document or null
   */
  async findOrderByIdentifiers(identifiers) {
    const { tripUuid, orderNumber, transactionId } = identifiers;

    // Try to find order by WeTravel trip UUID first (most reliable)
    if (tripUuid) {
      const orderByUuid = await Order.findOne({
        "payment.weTravelTripUuid": tripUuid,
      });
      if (orderByUuid) {
        console.log(
          `[Webhook] ✅ Found order by trip UUID: ${orderByUuid.orderNumber}`
        );
        return orderByUuid;
      }
    }

    // Try to find by order number (trip_id in WeTravel)
    if (orderNumber) {
      const orderByNumber = await Order.findOne({
        orderNumber: orderNumber,
      });
      if (orderByNumber) {
        console.log(
          `[Webhook] ✅ Found order by order number: ${orderByNumber.orderNumber}`
        );
        return orderByNumber;
      }
    }

    // Try to find by transaction ID
    if (transactionId) {
      const orderByTransaction = await Order.findOne({
        "payment.transactionId": transactionId,
      });
      if (orderByTransaction) {
        console.log(
          `[Webhook] ✅ Found order by transaction ID: ${orderByTransaction.orderNumber}`
        );
        return orderByTransaction;
      }
    }

    return null;
  }

  /**
   * Handle WeTravel webhook events
   * Main webhook handler endpoint
   */
  handleWebhook = async (req, res) => {
    try {
      const payload = req.body;
      const signature = req.headers["x-wetravel-signature"] || req.headers["wetravel-signature"] || req.headers["signature"];

      console.log("[Webhook] 📥 Received WeTravel webhook event");
      console.log("[Webhook] Event type:", payload.event || payload.type || "unknown");
      console.log("[Webhook] Payload keys:", Object.keys(payload));

      // Verify webhook signature (if configured)
      if (!this.verifyWebhookSignature(payload, signature)) {
        console.error("[Webhook] ❌ Invalid webhook signature");
        return responseReturn(res, 401, {
          error: "Invalid webhook signature",
        });
      }

      // Extract event type
      const eventType =
        payload.event ||
        payload.type ||
        payload.event_type ||
        payload.data?.event ||
        "payment.completed";

      console.log(`[Webhook] Processing event: ${eventType}`);

      // Only process payment-related events
      if (
        !eventType.includes("payment") &&
        !eventType.includes("transaction") &&
        !eventType.includes("order")
      ) {
        console.log(`[Webhook] ⏭️ Skipping non-payment event: ${eventType}`);
        return responseReturn(res, 200, {
          message: "Event received but not processed",
          eventType,
        });
      }

      // Extract payment status
      const paymentStatus =
        payload.status ||
        payload.payment_status ||
        payload.payment?.status ||
        payload.data?.status ||
        payload.data?.payment_status ||
        payload.transaction?.status ||
        "pending";

      const mappedStatus = this.mapPaymentStatus(paymentStatus);

      console.log(
        `[Webhook] Payment status: ${paymentStatus} -> ${mappedStatus}`
      );

      // Extract order identifiers
      const identifiers = this.extractOrderIdentifier(payload);
      console.log("[Webhook] Order identifiers:", identifiers);

      if (!identifiers.tripUuid && !identifiers.orderNumber && !identifiers.transactionId) {
        console.error("[Webhook] ❌ No order identifier found in payload");
        return responseReturn(res, 400, {
          error: "No order identifier found in webhook payload",
          payloadKeys: Object.keys(payload),
        });
      }

      // Find the order
      const order = await this.findOrderByIdentifiers(identifiers);

      if (!order) {
        console.error(
          `[Webhook] ❌ Order not found for identifiers:`,
          identifiers
        );
        return responseReturn(res, 404, {
          error: "Order not found",
          identifiers,
        });
      }

      console.log(
        `[Webhook] ✅ Found order: ${order.orderNumber} (current status: ${order.payment.status})`
      );

      // Prevent duplicate processing
      if (
        order.payment.status === "completed" &&
        mappedStatus === "completed"
      ) {
        console.log(
          `[Webhook] ⏭️ Order ${order.orderNumber} already marked as completed - skipping`
        );
        return responseReturn(res, 200, {
          message: "Order already processed",
          orderNumber: order.orderNumber,
          status: "already_completed",
        });
      }

      // Update payment status
      order.payment.status = mappedStatus;

      // Update transaction ID if provided
      if (identifiers.transactionId) {
        order.payment.transactionId = identifiers.transactionId;
      }

      // Update payment date if payment is completed
      if (mappedStatus === "completed") {
        order.payment.paymentDate = new Date(
          payload.paid_at ||
            payload.paidAt ||
            payload.payment_date ||
            payload.paymentDate ||
            payload.data?.paid_at ||
            payload.data?.paidAt ||
            Date.now()
        );

        // Update order status to confirmed if it's pending
        if (order.orderStatus === "pending") {
          order.orderStatus = "confirmed";
          order.confirmedAt = new Date();
        }

        // Update all cart items to confirmed status
        if (order.cartItems && order.cartItems.length > 0) {
          order.cartItems.forEach((item) => {
            if (item.itemStatus === "pending") {
              item.itemStatus = "confirmed";
            }
          });
        }
      }

      // Save order
      await order.save();

      console.log(
        `[Webhook] ✅ Updated order ${order.orderNumber} - Payment status: ${mappedStatus}, Order status: ${order.orderStatus}`
      );

      // Send email notification if payment is completed
      if (mappedStatus === "completed") {
        try {
          const customerEmail =
            order.personalInfo?.email || order.customerId?.email;

          if (customerEmail) {
            console.log(
              `[Webhook] 📧 Preparing payment confirmation email for order ${order.orderNumber}`
            );

            // Populate order data for email
            await order.populate([
              { path: "customerId", select: "name email" },
              { path: "cartItems.tripId", select: "title mainImage days" },
            ]);

            const emailData = await generatePaymentConfirmationEmail(order);
            emailQueue.add({
              subject: `Payment Confirmed - Booking #${order.orderNumber}`,
              content: emailData.html,
              recipients: [customerEmail],
              attachment: emailData.attachment,
            });

            console.log(
              `[Webhook] ✅ Payment confirmation email queued for order ${order.orderNumber}`
            );
          } else {
            console.warn(
              `[Webhook] ⚠️ No email found for order ${order.orderNumber}`
            );
          }
        } catch (emailError) {
          console.error(
            `[Webhook] ❌ Error sending confirmation email:`,
            emailError
          );
          // Don't fail the webhook if email fails
        }
      }

      // Return success response
      return responseReturn(res, 200, {
        message: "Webhook processed successfully",
        orderNumber: order.orderNumber,
        paymentStatus: mappedStatus,
        orderStatus: order.orderStatus,
      });
    } catch (error) {
      console.error("[Webhook] ❌ Error processing webhook:", error);
      console.error("[Webhook] Error stack:", error.stack);
      return responseReturn(res, 500, {
        error: "Internal server error",
        message: error.message,
      });
    }
  };

  /**
   * Health check endpoint for webhook
   * Used to verify webhook endpoint is accessible
   */
  healthCheck = async (req, res) => {
    return responseReturn(res, 200, {
      message: "WeTravel webhook endpoint is active",
      timestamp: new Date().toISOString(),
    });
  };
}

module.exports = new WeTravelWebhookController();
