// routes/dashboard/safariAnalyticsRoutes.js
const express = require("express");
const router = express.Router();
const fetch = require("node-fetch");

// Test route to verify routing works
router.get("/safari-analytics/test", (req, res) => {
  res.json({ success: true, message: "Route is working!" });
});

/**
 * GET /api/safari-analytics/summary
 * Returns a summary of all analytics data in one call
 * Includes request counts by status
 * Note: Travelers count is computed in the frontend to avoid rate limits
 */
router.get("/safari-analytics/summary", async (req, res) => {
  try {
    const SAFARI_TOKEN = process.env.SAFARI_TOKEN;
    const BASE_URL = "https://api.safarioffice.com/v1";
    
    if (!SAFARI_TOKEN) {
      return res.status(500).json({
        success: false,
        error: "Safari API token not configured"
      });
    }

    const statuses = ['new', 'working', 'open', 'prebooked', 'booked', 'completed', 'notbooked'];
    const statusCounts = {};

    // Fetch counts for each status
    for (const status of statuses) {
      try {
        const response = await fetch(
          `${BASE_URL}/requests?status=${status}&per_page=1&page=1`,
          {
            headers: {
              Authorization: `Bearer ${SAFARI_TOKEN}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          statusCounts[status] = data.result?.meta?.total || 0;
        } else {
          statusCounts[status] = 0;
        }
      } catch (err) {
        console.warn(`Error fetching ${status} count:`, err.message);
        statusCounts[status] = 0;
      }
    }

    // Get total requests
    try {
      const totalResponse = await fetch(
        `${BASE_URL}/requests?per_page=1&page=1`,
        {
          headers: {
            Authorization: `Bearer ${SAFARI_TOKEN}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (totalResponse.ok) {
        const totalData = await totalResponse.json();
        statusCounts.total = totalData.result?.meta?.total || 0;
      } else {
        statusCounts.total = Object.values(statusCounts).reduce((sum, count) => sum + count, 0);
      }
    } catch (err) {
      statusCounts.total = Object.values(statusCounts).reduce((sum, count) => sum + count, 0);
    }

    res.json({
      success: true,
      data: {
        status_counts: statusCounts
      }
    });

  } catch (error) {
    console.error("Error in safari-analytics/summary endpoint:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch analytics summary",
      message: error.message
    });
  }
});

module.exports = router;