const express = require("express");
const {
  getDashboardStats,
  getRecentOrders,
} = require("../../controllers/dashboard/dashboardController");
const { jwtMiddleware } = require("../../middlewares/authJwtMiddleware");

const router = express.Router();

// Dashboard statistics routes
router.get("/stats", jwtMiddleware, getDashboardStats);
router.get("/recent-orders", jwtMiddleware, getRecentOrders);

module.exports = router;
