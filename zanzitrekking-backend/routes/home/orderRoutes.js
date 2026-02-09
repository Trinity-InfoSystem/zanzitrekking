const express = require("express");
const router = express.Router();
const orderController = require("../../controllers/home/orderController");
const { authJwtMiddleware } = require("../../middlewares/authJwtMiddleware");
const {
  generateMissingPaymentLinks,
} = require("../../utilities/generateMissingPaymentLinks");

// Order management routes
router.post("/create", orderController.createOrder);
router.get("/number/:orderNumber", orderController.getOrderByNumber); // For QR code scanning
router.get("/:orderId", orderController.getOrderById);
router.put("/:orderId/status", orderController.updateOrderStatus);
router.put("/:orderId/payment", orderController.updatePaymentStatus);
router.put("/:orderId/cancel", orderController.cancelOrder);

// Auto-complete trips
router.post("/auto-complete-trips", orderController.autoCompleteTripsEndpoint);
router.post("/:orderId/check-completion", orderController.checkOrderCompletion);

// Generate missing payment links (test/manual trigger)
router.post("/generate-missing-payment-links", async (req, res) => {
  try {
    const result = await generateMissingPaymentLinks();
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Customer order history
router.get(
  "/customer/:customerId/history",
  orderController.getCustomerOrderHistory
);
router.get(
  "/customer/:customerId/statistics",
  orderController.getCustomerOrderStatistics
);

// Admin routes (all orders with pagination and filters)
router.get("/admin/all", orderController.getAllOrders);
router.get("/admin/statistics", orderController.getOrderStatistics);

module.exports = router;
