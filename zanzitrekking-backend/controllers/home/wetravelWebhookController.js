const Order = require("../../models/order");
const logger = require('./../../utilities/logger');
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
  verifyWebhookSignature(payload, signature, req = null) {
    // If webhook secret is configured, verify signature
    let webhookSecret = process.env.WETRAVEL_WEBHOOK_SECRET;
    if (!webhookSecret) {
      // In production, webhook secret is required for security
      if (process.env.NODE_ENV === 'production') {
        logger.error(
          "[Webhook] ❌ WETRAVEL_WEBHOOK_SECRET not configured in production - rejecting webhook"
        );
        return false;
      }
      // Allow in development only
      logger.warn(
        "[Webhook] ⚠️ WETRAVEL_WEBHOOK_SECRET not configured - skipping signature verification (development mode)"
      );
      return true;
    }

    // Check for Svix signature format (svix-signature header)
    if (req && req.headers["svix-signature"]) {
      return this.verifySvixSignature(payload, req, webhookSecret);
    }

    // Standard signature verification (WeTravel direct or other formats)
    if (!signature) {
      // In production, signature is required
      if (process.env.NODE_ENV === 'production') {
        logger.error("[Webhook] ❌ No signature provided in production - rejecting webhook");
        return false;
      }
      // Allow in development only
      logger.warn("[Webhook] ⚠️ No signature provided - allowing in development");
      return true;
    }

    try {
      // Use payload as-is if it's a string (raw body), otherwise stringify
      // For webhook signature verification, we need the exact raw body string
      const payloadString = typeof payload === "string" ? payload : JSON.stringify(payload);
      
      // WeTravel may use HMAC SHA256 or similar
      // Adjust the algorithm based on WeTravel's documentation
      const expectedSignature = crypto
        .createHmac("sha256", webhookSecret)
        .update(payloadString)
        .digest("hex");

      // Normalize signatures for comparison (remove any prefixes like "sha256=")
      const normalizedReceived = signature.replace(/^sha256=/, "").toLowerCase().trim();
      const normalizedExpected = expectedSignature.toLowerCase().trim();

      // Compare signatures (use constant-time comparison to prevent timing attacks)
      const isValid = crypto.timingSafeEqual(
        Buffer.from(normalizedReceived),
        Buffer.from(normalizedExpected)
      );

      if (!isValid) {
        logger.error("[Webhook] ❌ Invalid webhook signature");
        logger.error("[Webhook] Expected (first 20 chars):", normalizedExpected.substring(0, 20) + "...");
        logger.error("[Webhook] Received (first 20 chars):", normalizedReceived.substring(0, 20) + "...");
        logger.error("[Webhook] Payload length:", payloadString.length);
      } else {
        logger.info("[Webhook] ✅ Webhook signature verified successfully");
      }

      return isValid;
    } catch (error) {
      logger.error("[Webhook] ❌ Error verifying signature:", error);
      return false;
    }
  }

  /**
   * Verify Svix webhook signature
   * Svix uses format: v1,<signature> where signature is HMAC SHA256 of svix-id:svix-timestamp:body
   * The secret can be in whsec_ format (base64) or plain format
   */
  verifySvixSignature(payload, req, secret) {
    try {
      const svixSignature = req.headers["svix-signature"];
      const svixId = req.headers["svix-id"];
      const svixTimestamp = req.headers["svix-timestamp"];

      if (!svixSignature || !svixId || !svixTimestamp) {
        logger.error("[Webhook] ❌ Missing Svix headers (svix-signature, svix-id, svix-timestamp)");
        return false;
      }

      // Get raw body for signature verification
      const rawBody = req.rawBody || (typeof payload === "string" ? payload : JSON.stringify(payload));

      // Handle Svix secret format (whsec_ prefix means base64 encoded)
      let signingSecret = secret;
      if (secret.startsWith("whsec_")) {
        try {
          // Decode base64 secret
          signingSecret = Buffer.from(secret.substring(6), "base64").toString("utf8");
          logger.info("[Webhook] 🔐 Detected Svix whsec_ format - decoded");
        } catch (error) {
          logger.warn("[Webhook] ⚠️ Could not decode whsec_ secret, using as-is");
        }
      }

      // Svix signature format: v1,<signature1> v1,<signature2> (can have multiple)
      const signatures = svixSignature.split(" ");

      // Create the signed content: svix-id:svix-timestamp:body
      const signedContent = `${svixId}.${svixTimestamp}.${rawBody}`;

      // Verify each signature
      for (const signatureEntry of signatures) {
        const [version, signature] = signatureEntry.split(",");
        if (version !== "v1") continue;

        // Calculate expected signature (Svix uses base64 output)
        const expectedSignature = crypto
          .createHmac("sha256", signingSecret)
          .update(signedContent)
          .digest("base64");

        // Compare signatures (constant-time comparison)
        try {
          const isValid = crypto.timingSafeEqual(
            Buffer.from(signature),
            Buffer.from(expectedSignature)
          );

          if (isValid) {
            logger.info("[Webhook] ✅ Svix webhook signature verified successfully");
            return true;
          }
        } catch (error) {
          // Continue to next signature if this one fails
          continue;
        }
      }

      logger.error("[Webhook] ❌ Invalid Svix webhook signature");
      return false;
    } catch (error) {
      logger.error("[Webhook] ❌ Error verifying Svix signature:", error);
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
      processed: "processed",
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
        logger.info(
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
        logger.info(
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
        logger.info(
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
      // Use raw body if available (for signature verification), otherwise use parsed body
      const rawBody = req.rawBody || (typeof req.body === 'string' ? req.body : JSON.stringify(req.body));
      const payload = typeof req.body === 'object' ? req.body : JSON.parse(req.body || '{}');
      // Check for Svix signature headers first, then fallback to standard headers
      const signature = req.headers["svix-signature"] 
        ? null // Svix uses svix-signature header, handled separately in verifyWebhookSignature
        : req.headers["x-wetravel-signature"] || req.headers["wetravel-signature"] || req.headers["signature"];

      logger.info("[Webhook] 📥 Received WeTravel webhook event");
      logger.info("[Webhook] Event type:",payload.type);
      logger.info("[Webhook] Payload keys:", Object.keys(payload));
      logger.info("[Webhook] Has raw body:", !!req.rawBody);
      logger.info("[Webhook] Has signature:", !!signature);

      // Verify webhook signature (if configured)
      // Pass req object to support Svix format verification
      const signaturePayload = req.rawBody || rawBody;
      if (!this.verifyWebhookSignature(signaturePayload, signature, req)) {
        logger.error("[Webhook] ❌ Invalid webhook signature");
        return responseReturn(res, 401, {
          error: "Invalid webhook signature",
        });
      }

      // Extract event type
      const eventType = payload.type

      logger.info(`[Webhook] Processing event: ${eventType}`);

      // Only process payment-related events
      if (
        !eventType.includes("payment") &&
        !eventType.includes("transaction") &&
        !eventType.includes("order")
      ) {
        logger.info(`[Webhook] ⏭️ Skipping non-payment event: ${eventType}`);
        return responseReturn(res, 200, {
          message: "Event received but not processed",
          eventType,
        });
      }

      // Extract payment status
      const paymentStatus = payload.data.status
      
      const mappedStatus = this.mapPaymentStatus(paymentStatus);

      logger.info(
        `[Webhook] Payment status: ${paymentStatus} -> ${mappedStatus}`
      );

      // Extract order identifiers
      const identifiers = this.extractOrderIdentifier(payload);
      logger.info("[Webhook] Order identifiers:", identifiers);

      if (!identifiers.tripUuid && !identifiers.orderNumber && !identifiers.transactionId) {
        logger.error("[Webhook] ❌ No order identifier found in payload");
        return responseReturn(res, 400, {
          error: "No order identifier found in webhook payload",
          payloadKeys: Object.keys(payload),
        });
      }

      // Find the order
      const order = await this.findOrderByIdentifiers(identifiers);

      if (!order) {
        logger.error(
          `[Webhook] ❌ Order not found for identifiers:`,
          identifiers
        );
        return responseReturn(res, 404, {
          error: "Order not found",
          identifiers,
        });
      }

      logger.info(
        `[Webhook] ✅ Found order: ${order.orderNumber} (current status: ${order.payment.status})`
      );

      // Prevent duplicate processing
      if (
        order.payment.status === "completed" &&
        mappedStatus === "completed"
      ) {
        logger.info(
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
      if (mappedStatus === "completed" || mappedStatus === "processed") {
        order.payment.paymentDate = new Date(payload.data.updated_at)

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

      logger.info(
        `[Webhook] ✅ Updated order ${order.orderNumber} - Payment status: ${mappedStatus}, Order status: ${order.orderStatus}`
      );

      // Send email notification if payment is completed
      if (mappedStatus === "completed") {
        try {
          const customerEmail =
            order.personalInfo?.email || order.customerId?.email;

          logger.info(
            `[Webhook] 📧 Email check for order ${order.orderNumber}:`,
            {
              hasPersonalInfoEmail: !!order.personalInfo?.email,
              hasCustomerIdEmail: !!order.customerId?.email,
              customerEmail: customerEmail || "NOT FOUND",
            }
          );

          if (customerEmail) {
            logger.info(
              `[Webhook] 📧 Preparing payment confirmation email for order ${order.orderNumber} to ${customerEmail}`
            );

            // Populate order data for email
            try {
              await order.populate([
                { path: "customerId", select: "name email" },
                { path: "cartItems.tripId", select: "title mainImage days" },
              ]);
              logger.info(
                `[Webhook] ✅ Order populated successfully. Cart items: ${order.cartItems?.length || 0}`
              );
            } catch (populateError) {
              logger.error(
                `[Webhook] ❌ Error populating order:`,
                populateError
              );
              throw populateError;
            }

            let emailData;
            try {
              emailData = await generatePaymentConfirmationEmail(order);
              logger.info(
                `[Webhook] ✅ Email HTML generated successfully (${emailData.html?.length || 0} chars)`
              );
            } catch (emailGenError) {
              logger.error(
                `[Webhook] ❌ Error generating email HTML:`,
                emailGenError
              );
              throw emailGenError;
            }

            emailQueue.add({
              subject: `Payment Confirmed - Booking #${order.orderNumber}`,
              content: emailData.html,
              recipients: [customerEmail],
              attachment: emailData.attachment,
            });

            // Update email notification flag
            if (!order.emailNotifications) {
              order.emailNotifications = {};
            }
            order.emailNotifications.paymentConfirmation = true;
            await order.save();

            logger.info(
              `[Webhook] ✅ Payment confirmation email queued for order ${order.orderNumber} to ${customerEmail}`
            );
          } else {
            logger.warn(
              `[Webhook] ⚠️ No email found for order ${order.orderNumber}. PersonalInfo: ${JSON.stringify(order.personalInfo)}, CustomerId: ${order.customerId?._id || 'null'}`
            );
          }
        } catch (emailError) {
          logger.error(
            `[Webhook] ❌ Error sending confirmation email for order ${order.orderNumber}:`,
            emailError.message || emailError
          );
          logger.error(`[Webhook] Full error stack:`, emailError.stack);
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
      logger.error("[Webhook] ❌ Error processing webhook:", error);
      logger.error("[Webhook] Error stack:", error);
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
