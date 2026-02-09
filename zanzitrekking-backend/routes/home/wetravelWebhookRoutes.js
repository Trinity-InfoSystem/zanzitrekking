const express = require("express");
const router = express.Router();
const wetravelWebhookController = require("../../controllers/home/wetravelWebhookController");

// WeTravel webhook endpoint
// This endpoint receives webhook events from WeTravel when payments are completed
// POST /api/webhooks/wetravel
router.post("/wetravel", wetravelWebhookController.handleWebhook);

// Health check endpoint for webhook verification
// GET /api/webhooks/wetravel/health
router.get("/wetravel/health", wetravelWebhookController.healthCheck);

module.exports = router;
