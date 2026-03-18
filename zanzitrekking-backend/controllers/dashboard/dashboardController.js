const Order = require("../../models/order");
const logger = require('./../../utilities/logger');
const Customer = require("../../models/customer");
const Trip = require("../../models/trip");
const Cart = require("../../models/cart");
const redis = require("../../redis");

// Get dashboard statistics
const getDashboardStats = async (req, res) => {
  try {
    const currentDate = new Date();
    const startOfMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      1
    );
    const startOfLastMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() - 1,
      1
    );
    const endOfLastMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      0
    );
    const key=`dashboard:stats`

    // Execute all independent queries in parallel for better performance
    const [
      totalRevenueResult,
      currentMonthRevenueResult,
      lastMonthRevenueResult,
      totalCustomers,
      activeTrips,
      totalOrders,
      pendingPayments,
      completedPayments,
      monthlyRevenueData,
      monthlyCustomerData,
    ] = await Promise.all([
      // Get total revenue (completed orders)
      Order.aggregate([
        {
          $match: {
            "payment.status": "completed",
          },
        },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: "$totalAmount" },
          },
        },
      ]),
      // Get current month revenue
      Order.aggregate([
        {
          $match: {
            "payment.status": "completed",
            createdAt: { $gte: startOfMonth },
          },
        },
        {
          $group: {
            _id: null,
            currentMonthRevenue: { $sum: "$totalAmount" },
          },
        },
      ]),
      // Get last month revenue for comparison
      Order.aggregate([
        {
          $match: {
            "payment.status": "completed",
            createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth },
          },
        },
        {
          $group: {
            _id: null,
            lastMonthRevenue: { $sum: "$totalAmount" },
          },
        },
      ]),
      // Get total customers
      Customer.countDocuments(),
      // Get active trips (trips with upcoming dates)
      Trip.countDocuments({
        $or: [
          { pricingType: "yearRound" },
          {
            pricingType: "seasonal",
            "seasons.endDate": { $gte: currentDate },
          },
        ],
      }),
      // Get total orders
      Order.countDocuments(),
      // Get pending payments
      Order.countDocuments({
        "payment.status": { $in: ["processing", "pending"] },
      }),
      // Get completed payments
      Order.countDocuments({
        "payment.status": "completed",
      }),
      // Get monthly revenue data for chart (last 12 months)
      Order.aggregate([
        {
          $match: {
            "payment.status": "completed",
            createdAt: {
              $gte: new Date(
                currentDate.getFullYear() - 1,
                currentDate.getMonth(),
                1
              ),
            },
          },
        },
        {
          $group: {
            _id: {
              year: { $year: "$createdAt" },
              month: { $month: "$createdAt" },
            },
            revenue: { $sum: "$totalAmount" },
            orders: { $sum: 1 },
          },
        },
        {
          $sort: { "_id.year": 1, "_id.month": 1 },
        },
      ]),
      // Get monthly customer registrations
      Customer.aggregate([
        {
          $match: {
            createdAt: {
              $gte: new Date(
                currentDate.getFullYear() - 1,
                currentDate.getMonth(),
                1
              ),
            },
          },
        },
        {
          $group: {
            _id: {
              year: { $year: "$createdAt" },
              month: { $month: "$createdAt" },
            },
            customers: { $sum: 1 },
          },
        },
        {
          $sort: { "_id.year": 1, "_id.month": 1 },
        },
      ]),
    ]);

    // Calculate revenue change percentage
    const totalRevenue = totalRevenueResult[0]?.totalRevenue || 0;
    const currentMonthRevenue =
      currentMonthRevenueResult[0]?.currentMonthRevenue || 0;
    const lastMonthRevenue = lastMonthRevenueResult[0]?.lastMonthRevenue || 0;

    // Calculate revenue change percentage
    const revenueChange =
      lastMonthRevenue > 0
        ? (
            ((currentMonthRevenue - lastMonthRevenue) / lastMonthRevenue) *
            100
          ).toFixed(1)
        : 0;

    // Format chart data
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    const chartData = {
      revenue: new Array(12).fill(0),
      orders: new Array(12).fill(0),
      customers: new Array(12).fill(0),
    };

    monthlyRevenueData.forEach((item) => {
      const monthIndex = item._id.month - 1;
      chartData.revenue[monthIndex] = item.revenue;
      chartData.orders[monthIndex] = item.orders;
    });

    monthlyCustomerData.forEach((item) => {
      const monthIndex = item._id.month - 1;
      chartData.customers[monthIndex] = item.customers;
    });

    const stats = {
      totalRevenue: {
        value: totalRevenue,
        formatted: `$${totalRevenue.toLocaleString()}`,
        change: `${revenueChange}% from last month`,
        changeType: revenueChange >= 0 ? "positive" : "negative",
      },
      activeTrips: {
        value: activeTrips,
        formatted: activeTrips.toString(),
        change: "Live count",
        changeType: "neutral",
      },
      totalCustomers: {
        value: totalCustomers,
        formatted: totalCustomers.toString(),
        change: "Total registered",
        changeType: "neutral",
      },
      totalPayments: {
        value: completedPayments,
        formatted: completedPayments.toString(),
        change: `${pendingPayments} pending`,
        changeType: "neutral",
      },
      chartData: {
        months,
        revenue: chartData.revenue,
        orders: chartData.orders,
        customers: chartData.customers,
      },
      summary: {
        totalOrders,
        pendingPayments,
        completedPayments,
        currentMonthRevenue,
        lastMonthRevenue,
      },
    };

    await redis.set(key, JSON.stringify({stats }), "EX", 1800);
    res.status(200).json({
      success: true,
      message: "Dashboard statistics retrieved successfully",
      data: stats,
    });
  } catch (error) {
    logger.error("Error fetching dashboard statistics:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch dashboard statistics",
      error: error.message,
    });
  }
};

// Get recent orders for dashboard
const getRecentOrders = async (req, res) => {
  try {
    const recentOrders = await Order.find()
      .populate("customerId", "name email image")
      .populate("cartItems.tripId", "mainTitle mainImage")
      .sort({ createdAt: -1 })
      .limit(10)
      .select("customerId cartItems totalAmount payment.status createdAt");

    res.status(200).json({
      success: true,
      message: "Recent orders retrieved successfully",
      data: recentOrders,
    });
  } catch (error) {
    logger.error("Error fetching recent orders:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch recent orders",
      error: error.message,
    });
  }
};

module.exports = {
  getDashboardStats,
  getRecentOrders,
};
