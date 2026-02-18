const Order = require("../../models/order");
const logger = require('./../../utilities/logger');
const weTravelService = require("../../utilities/wetravelService");
const { responseReturn } = require("../../utilities/response");

/**
 * Test Payment Controller
 * Used for testing payment flows without completing real payments
 */
class TestPaymentController {
  /**
   * Create a test order with minimal data
   * Useful for testing payment link generation
   */
  createTestOrder = async (req, res) => {
    try {
      const { customerId, tripId, amount = 1.0 } = req.body;

      if (!customerId || !tripId) {
        return responseReturn(res, 400, {
          error: "customerId and tripId are required",
        });
      }

      // Create a minimal test order
      const testOrder = {
        customerId,
        orderNumber: `TEST-${Date.now()}`,
        cartItems: [
          {
            tripId,
            mainTitle: "Test Trip",
            mainImage: "",
            startingDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
            days: 1,
            travelersNumber: 1,
            selectedCategory: "standard",
            itemSubtotal: amount,
            itemTotal: amount,
            itemStatus: "pending",
          },
        ],
        personalInfo: {
          firstName: "Test",
          lastName: "User",
          email: "test@example.com",
          phone: "+1234567890",
        },
        billingAddress: {
          street: "123 Test St",
          city: "Test City",
          state: "TS",
          zip: "12345",
          country: "United States",
        },
        payment: {
          method: "wetravel",
          status: "pending",
        },
        subtotal: amount,
        totalAmount: amount,
        serviceFee: 0,
        orderStatus: "pending",
      };

      // Try to create payment link
      try {
        const orderData = weTravelService.formatOrderForPaymentLink(testOrder);
        const weTravelResponse = await weTravelService.createPaymentLink(
          orderData
        );

        return responseReturn(res, 200, {
          message: "Test order and payment link created successfully",
          testOrder: {
            orderNumber: testOrder.orderNumber,
            totalAmount: testOrder.totalAmount,
          },
          paymentLink: weTravelResponse.trip.url,
          tripUuid: weTravelResponse.trip.uuid,
          note: "This is a test order. Use the payment link to test payment flow.",
        });
      } catch (error) {
        return responseReturn(res, 200, {
          message: "Test order created but payment link generation failed",
          testOrder: {
            orderNumber: testOrder.orderNumber,
            totalAmount: testOrder.totalAmount,
          },
          error: error.message,
          note: "Payment link generation failed. Check WeTravel API configuration.",
        });
      }
    } catch (error) {
      logger.error("Test order creation error:", error);
      return responseReturn(res, 500, {
        error: "Failed to create test order",
        message: error.message,
      });
    }
  };

  /**
   * Simulate a webhook event for testing
   * This allows testing webhook processing without completing a real payment
   */
  simulateWebhook = async (req, res) => {
    try {
      const { orderNumber, tripUuid, status = "paid" } = req.body;

      if (!orderNumber && !tripUuid) {
        return responseReturn(res, 400, {
          error: "orderNumber or tripUuid is required",
        });
      }

      // Find the order
      const order = tripUuid
        ? await Order.findOne({ "payment.weTravelTripUuid": tripUuid })
        : await Order.findOne({ orderNumber });

      if (!order) {
        return responseReturn(res, 404, {
          error: "Order not found",
          orderNumber,
          tripUuid,
        });
      }

      // Simulate webhook payload
      const webhookPayload = {
        event: "payment.completed",
        trip_uuid: order.payment.weTravelTripUuid || tripUuid,
        trip_id: order.orderNumber,
        status: status,
        transaction_id: `test_txn_${Date.now()}`,
        paid_at: new Date().toISOString(),
      };

      // Import webhook controller
      const wetravelWebhookController = require("./wetravelWebhookController");

      // Create a mock request object
      const mockReq = {
        body: webhookPayload,
        headers: {},
      };

      // Create a mock response object
      let webhookResponse = null;
      const mockRes = {
        status: (code) => ({
          json: (data) => {
            webhookResponse = { status: code, data };
          },
        }),
        json: (data) => {
          webhookResponse = { status: 200, data };
        },
      };

      // Process webhook
      await wetravelWebhookController.handleWebhook(mockReq, mockRes);

      return responseReturn(res, 200, {
        message: "Webhook simulation completed",
        webhookPayload,
        webhookResponse,
        orderBefore: {
          paymentStatus: order.payment.status,
          orderStatus: order.orderStatus,
        },
        note: "Check the order in database to verify status was updated",
      });
    } catch (error) {
      logger.error("Webhook simulation error:", error);
      return responseReturn(res, 500, {
        error: "Failed to simulate webhook",
        message: error.message,
      });
    }
  };
}

module.exports = new TestPaymentController();
