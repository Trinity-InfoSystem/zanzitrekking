const express = require("express");
const router = express.Router();
const wetravelWebhookController = require("../../controllers/home/wetravelWebhookController");
const testWeTravelController = require("../../controllers/home/testWeTravelController");
const testPaymentController = require("../../controllers/home/testPaymentController");

// WeTravel webhook endpoint
// This endpoint receives webhook events from WeTravel when payments are completed
// POST /api/webhooks/wetravel
router.post("/wetravel", wetravelWebhookController.handleWebhook);

// Health check endpoint for webhook verification
// GET /api/webhooks/wetravel/health
router.get("/wetravel/health", wetravelWebhookController.healthCheck);

// Test WeTravel API connection
// GET /api/webhooks/wetravel/test
router.get("/wetravel/test", testWeTravelController.testConnection);

// Test payment endpoints (for testing only)
// POST /api/webhooks/wetravel/test/order - Create test order
router.post("/wetravel/test/order", testPaymentController.createTestOrder);

// POST /api/webhooks/wetravel/test/webhook - Simulate webhook event
router.post("/wetravel/test/webhook", testPaymentController.simulateWebhook);

module.exports = router;
