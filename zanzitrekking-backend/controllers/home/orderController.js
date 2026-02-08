const Order = require("../../models/order");
const Cart = require("../../models/cart");
const Customer = require("../../models/customer");
const Trip = require("../../models/trip");
const { responseReturn } = require("../../utilities/response");
const {
  autoCompleteTrips,
  checkOrderTripsCompletion,
} = require("../../utilities/autoCompleteTrips");
const weTravelService = require("../../utilities/wetravelService");
const emailQueue = require("../../workers/emailQueue");
const {
  generatePaymentConfirmationEmail,
  generatePaymentRejectionEmail,
} = require("../../utilities/orderEmailTemplates");

class OrderController {
  // Create new order from cart items
  createOrder = async (req, res) => {
    const { customerId, cartItems, personalInfo, billingAddress, paymentInfo } =
      req.body;

    try {
      // Validate required fields
      if (
        !customerId ||
        !cartItems ||
        !personalInfo ||
        !billingAddress ||
        !paymentInfo
      ) {
        return responseReturn(res, 400, {
          error:
            "Missing required fields: customerId, cartItems, personalInfo, billingAddress, paymentInfo",
        });
      }

      // Validate customer exists
      const customer = await Customer.findById(customerId);
      if (!customer) {
        return responseReturn(res, 404, { error: "Customer not found" });
      }

      // Validate cart items
      if (!Array.isArray(cartItems) || cartItems.length === 0) {
        return responseReturn(res, 400, { error: "Cart items are required" });
      }

      // Validate each cart item and calculate totals
      const validatedCartItems = [];
      let orderSubtotal = 0;

      for (const item of cartItems) {
        // Validate trip exists and populate category
        const trip = await Trip.findById(item.tripId).populate("category");
        if (!trip) {
          return responseReturn(res, 404, {
            error: `Trip with ID ${item.tripId} not found`,
          });
        }

        // Validate required fields for pricing calculation
        if (!item.startingDate || !item.travelersNumber) {
          return responseReturn(res, 400, {
            error: `Missing required fields for trip ${item.tripId}: startingDate and travelersNumber are required`,
          });
        }

        const startingDate = new Date(item.startingDate);
        const travelersNumber = item.travelersNumber || 1;

        // Calculate price based on pricing type
        let pricePerPerson = 0;
        let applicableSeason = null;

        // Get the selected category from cart item, default to 'standard'
        const selectedCategory = item.selectedCategory || "standard";

        if (trip.pricingType === "yearRound") {
          // Use regular prices for year-round pricing with selected category
          pricePerPerson = this.calculatePricePerPerson(
            trip.regularPrices,
            travelersNumber,
            selectedCategory
          );
        } else if (trip.pricingType === "seasonal") {
          // Find the appropriate season based on the trip's starting date
          applicableSeason = trip.seasons.find((season) => {
            const seasonStart = new Date(season.startDate);
            const seasonEnd = new Date(season.endDate);
            return startingDate >= seasonStart && startingDate <= seasonEnd;
          });

          if (applicableSeason) {
            // Use seasonal pricing with selected category
            pricePerPerson = this.calculatePricePerPerson(
              applicableSeason.rates,
              travelersNumber,
              selectedCategory
            );
          } else {
            // Fallback to regular prices if no season matches
            console.warn(
              "No matching season found for trip date, using regular prices"
            );
            pricePerPerson = this.calculatePricePerPerson(
              trip.regularPrices,
              travelersNumber,
              selectedCategory
            );
          }
        } else {
          console.error("Unknown pricing type:", trip.pricingType);
          pricePerPerson = 0;
        }

        // Calculate item totals
        const basePrice = pricePerPerson * travelersNumber;
        const discountAmount = (basePrice * (item.discount || 0)) / 100;
        const itemSubtotal = basePrice;
        const itemTotal = basePrice - discountAmount;

        // Get category information from trip
        const categoryId = trip.category?._id || trip.category || null;
        const categoryName = trip.category?.name || null;

        validatedCartItems.push({
          tripId: item.tripId,
          mainTitle: item.mainTitle || trip.mainTitle,
          mainImage: item.mainImage || trip.mainImage,
          startingDate: startingDate,
          days: trip.days?.length || 1,
          travelersNumber: travelersNumber,
          discount: item.discount || 0,
          pricingType: trip.pricingType,
          regularPrices: trip.regularPrices,
          seasons: trip.seasons,
          selectedCategory: selectedCategory,
          categoryId: categoryId,
          categoryName: categoryName,
          applicableSeason: applicableSeason,
          pricePerPerson: pricePerPerson,
          itemSubtotal: itemSubtotal,
          itemTotal: itemTotal,
          itemStatus: "pending",
          specialRequests: item.specialRequests || "",
        });

        orderSubtotal += itemSubtotal;
      }

      // Generate order number
      const generateOrderNumber = async () => {
        const date = new Date();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        const dateString = `${year}${month}${day}`;

        // Get the count of orders for today
        const todayStart = new Date(
          date.getFullYear(),
          date.getMonth(),
          date.getDate()
        );
        const todayEnd = new Date(
          date.getFullYear(),
          date.getMonth(),
          date.getDate() + 1
        );

        const todayOrders = await Order.countDocuments({
          createdAt: { $gte: todayStart, $lt: todayEnd },
        });

        // Generate order number with sequence
        const orderCount = todayOrders + 1;
        const paddedCount = String(orderCount).padStart(4, "0");
        const orderNumber = `ZT-${dateString}-${paddedCount}`;

        // Verify the order number doesn't already exist
        const existingOrder = await Order.findOne({ orderNumber });
        if (existingOrder) {
          // If duplicate exists, try with next sequence
          const nextOrderCount = orderCount + 1;
          const nextPaddedCount = String(nextOrderCount).padStart(4, "0");
          return `ZT-${dateString}-${nextPaddedCount}`;
        }

        return orderNumber;
      };

      const orderNumber = await generateOrderNumber();

      // Create order using the static method
      const order = await Order.createFromCartItems(
        customerId,
        validatedCartItems,
        personalInfo,
        billingAddress,
        {
          ...paymentInfo,
          method: "wetravel",
          status: "pending",
        },
        orderNumber
      );

      // Generate WeTravel payment link
      try {
        // Check if API key is configured
        if (!process.env.WETRAVEL_API_KEY) {
          throw new Error("WeTravel API key is not configured");
        }

        const orderData = weTravelService.formatOrderForPaymentLink(order);

        const weTravelResponse = await weTravelService.createPaymentLink(
          orderData
        );

        // Update order with WeTravel payment link
        order.payment.weTravelPaymentLink = weTravelResponse.trip.url;
        order.payment.weTravelTripUuid = weTravelResponse.trip.uuid;
        order.payment.weTravelTripUrl = weTravelResponse.trip.url;

        await order.save();
      } catch (error) {
        console.error(
          "❌ Error generating WeTravel payment link:",
          error.message
        );
        console.error("Error details:", error);
        // Continue with order creation even if payment link generation fails
        // Admin can manually create the payment link later
      }

      // Populate customer and trip details
      await order.populate([
        { path: "customerId", select: "name email" },
        { path: "cartItems.tripId", select: "mainTitle mainImage" },
      ]);

      return responseReturn(res, 201, {
        message: "Order created successfully",
        order,
      });
    } catch (error) {
      console.error("Create order error:", error);
      return responseReturn(res, 500, { error: "Internal Server Error" });
    }
  };

  // Helper method to calculate price per person
  calculatePricePerPerson(pricing, travelersNumber, category = "standard") {
    // Handle new category-specific pricing structure
    let categoryPricing = null;
    if (pricing && pricing[category]) {
      categoryPricing = pricing[category];
    } else if (pricing && pricing.onePerson) {
      // Fallback for old pricing structure
      categoryPricing = pricing;
    }

    if (!categoryPricing) {
      return 0;
    }

    if (travelersNumber === 1) {
      return categoryPricing.onePerson;
    } else if (travelersNumber === 2) {
      return categoryPricing.twoPerson;
    } else if (travelersNumber === 3) {
      return categoryPricing.threePerson;
    } else if (travelersNumber === 4) {
      return categoryPricing.fourPerson;
    } else {
      return categoryPricing.fiveOrMorePerson;
    }
  }

  // Update order with new season pricing (if dates change)
  updateOrderPricing = async (req, res) => {
    const { orderId } = req.params;
    const { itemIndex, newStartingDate, newTravelersNumber } = req.body;

    try {
      const order = await Order.findById(orderId);
      if (!order) {
        return responseReturn(res, 404, { error: "Order not found" });
      }

      if (itemIndex === undefined || itemIndex >= order.cartItems.length) {
        return responseReturn(res, 400, { error: "Invalid item index" });
      }

      const item = order.cartItems[itemIndex];
      const trip = await Trip.findById(item.tripId);
      if (!trip) {
        return responseReturn(res, 404, { error: "Trip not found" });
      }

      // Use new values or existing values
      const startingDate = new Date(newStartingDate || item.startingDate);
      const travelersNumber = newTravelersNumber || item.travelersNumber;

      // Calculate new price based on pricing type
      let pricePerPerson = 0;
      let applicableSeason = null;
      const selectedCategory = item.selectedCategory || "standard";

      if (trip.pricingType === "yearRound") {
        // Use regular prices for year-round pricing with selected category
        pricePerPerson = this.calculatePricePerPerson(
          trip.regularPrices,
          travelersNumber,
          selectedCategory
        );
      } else if (trip.pricingType === "seasonal") {
        // Find the appropriate season based on the new starting date
        applicableSeason = trip.seasons.find((season) => {
          const seasonStart = new Date(season.startDate);
          const seasonEnd = new Date(season.endDate);
          return startingDate >= seasonStart && startingDate <= seasonEnd;
        });

        if (applicableSeason) {
          // Use seasonal pricing with selected category
          pricePerPerson = this.calculatePricePerPerson(
            applicableSeason.rates,
            travelersNumber,
            selectedCategory
          );
        } else {
          // Fallback to regular prices if no season matches
          pricePerPerson = this.calculatePricePerPerson(
            trip.regularPrices,
            travelersNumber,
            selectedCategory
          );
        }
      }

      const basePrice = pricePerPerson * travelersNumber;
      const discountAmount = (basePrice * (item.discount || 0)) / 100;

      // Update item
      item.startingDate = startingDate;
      item.travelersNumber = travelersNumber;
      item.pricingType = trip.pricingType;
      item.regularPrices = trip.regularPrices;
      item.seasons = trip.seasons;
      item.applicableSeason = applicableSeason;
      item.pricePerPerson = pricePerPerson;
      item.itemSubtotal = basePrice;
      item.itemTotal = basePrice - discountAmount;

      // Recalculate order totals
      order.calculateOrderTotals();
      await order.save();

      return responseReturn(res, 200, {
        message: "Order pricing updated successfully",
        order,
      });
    } catch (error) {
      console.error("Update order pricing error:", error);
      return responseReturn(res, 500, { error: "Internal Server Error" });
    }
  };

  // Update order status
  updateOrderStatus = async (req, res) => {
    const { orderId } = req.params;
    const { orderStatus, itemIndex, itemStatus } = req.body;

    try {
      const order = await Order.findById(orderId);
      if (!order) {
        return responseReturn(res, 404, { error: "Order not found" });
      }

      // Update overall order status
      if (orderStatus) {
        const validStatuses = [
          "pending",
          "confirmed",
          "preparing",
          "in-progress",
          "completed",
          "cancelled",
          "refunded",
        ];
        if (!validStatuses.includes(orderStatus)) {
          return responseReturn(res, 400, { error: "Invalid order status" });
        }

        order.orderStatus = orderStatus;

        // Update timestamps based on status
        if (orderStatus === "confirmed" && !order.confirmedAt) {
          order.confirmedAt = new Date();
        } else if (orderStatus === "completed" && !order.completedAt) {
          order.completedAt = new Date();
        } else if (orderStatus === "cancelled" && !order.cancelledAt) {
          order.cancelledAt = new Date();
        }
      }

      // Update specific item status
      if (itemIndex !== undefined && itemStatus) {
        const validItemStatuses = [
          "pending",
          "confirmed",
          "in-progress",
          "completed",
          "cancelled",
        ];
        if (!validItemStatuses.includes(itemStatus)) {
          return responseReturn(res, 400, { error: "Invalid item status" });
        }

        await order.updateItemStatus(parseInt(itemIndex), itemStatus);
      }

      await order.save();

      // Recalculate overall trip status
      order.overallTripStatus = order.calculatedTripStatus;
      await order.save();

      // Populate customer and trip details
      await order.populate([
        { path: "customerId", select: "name email" },
        { path: "cartItems.tripId", select: "mainTitle mainImage" },
      ]);

      return responseReturn(res, 200, {
        message: "Order status updated successfully",
        order,
      });
    } catch (error) {
      console.error("Update order status error:", error);
      return responseReturn(res, 500, { error: "Internal Server Error" });
    }
  };

  // Get order by ID
  getOrderById = async (req, res) => {
    const { orderId } = req.params;

    try {
      const order = await Order.findById(orderId)
        .populate([
          { path: "customerId", select: "name email phone" },
          {
            path: "cartItems.tripId",
            select: "mainTitle mainImage description",
          },
        ])
        .lean();

      if (!order) {
        return responseReturn(res, 404, { error: "Order not found" });
      }

      return responseReturn(res, 200, { order });
    } catch (error) {
      console.error("Get order by ID error:", error);
      return responseReturn(res, 500, { error: "Internal Server Error" });
    }
  };

  // Get customer order history
  getCustomerOrderHistory = async (req, res) => {
    const { customerId } = req.params;
    const { page = 1, parPage = 10, status } = req.query;

    try {
      // Validate customer exists
      const customer = await Customer.findById(customerId);
      if (!customer) {
        return responseReturn(res, 404, { error: "Customer not found" });
      }

      const options = {
        page: parseInt(page),
        limit: parseInt(parPage),
        sort: { createdAt: -1 },
        select: "+payment", // Explicitly include payment field
        populate: [
          { path: "customerId", select: "name email" },
          { path: "cartItems.tripId", select: "mainTitle mainImage" },
        ],
      };

      const query = { customerId };

      // Filter by status if provided
      if (status) {
        query.orderStatus = status;
      }

      const orders = await Order.paginate(query, options);

      return responseReturn(res, 200, {
        orders: orders.docs,
        pagination: {
          totalDocs: orders.totalDocs,
          limit: orders.limit,
          totalPages: orders.totalPages,
          page: orders.page,
          pagingCounter: orders.pagingCounter,
          hasPrevPage: orders.hasPrevPage,
          hasNextPage: orders.hasNextPage,
          prevPage: orders.prevPage,
          nextPage: orders.nextPage,
        },
      });
    } catch (error) {
      console.error("Get customer order history error:", error);
      return responseReturn(res, 500, { error: "Internal Server Error" });
    }
  };

  // Get all orders with pagination and filters
  getAllOrders = async (req, res) => {
    try {
      const {
        page = 1,
        parPage = 10,
        searchValue = "",
        status,
        paymentStatus,
        dateFrom,
        dateTo,
        sortBy = "createdAt",
        sortOrder = "desc",
      } = req.query;

      const options = {
        page: parseInt(page),
        limit: parseInt(parPage),
        sort: { [sortBy]: sortOrder === "desc" ? -1 : 1 },
        populate: [
          { path: "customerId", select: "name email" },
          { path: "cartItems.tripId", select: "title mainImage" },
        ],
      };

      const query = {};

      // Search by order number, customer name, or email
      if (searchValue) {
        query.$or = [
          { orderNumber: { $regex: searchValue, $options: "i" } },
          { "personalInfo.firstName": { $regex: searchValue, $options: "i" } },
          { "personalInfo.lastName": { $regex: searchValue, $options: "i" } },
          { "personalInfo.email": { $regex: searchValue, $options: "i" } },
        ];
      }

      // Filter by order status
      if (status) {
        query.orderStatus = status;
      }

      // Filter by payment status
      if (paymentStatus) {
        query["payment.status"] = paymentStatus;
      }

      // Filter by date range
      if (dateFrom || dateTo) {
        query.createdAt = {};
        if (dateFrom) {
          query.createdAt.$gte = new Date(dateFrom);
        }
        if (dateTo) {
          query.createdAt.$lte = new Date(dateTo);
        }
      }

      const orders = await Order.paginate(query, options);

      // Calculate summary statistics
      const totalOrders = orders.totalDocs;
      const totalRevenue = orders.docs.reduce(
        (sum, order) => sum + (order.totalAmount || 0),
        0
      );
      const pendingOrders = orders.docs.filter(
        (order) => order.orderStatus === "pending"
      ).length;
      const completedOrders = orders.docs.filter(
        (order) => order.orderStatus === "completed"
      ).length;

      return responseReturn(res, 200, {
        orders: orders.docs,
        summary: {
          totalOrders,
          totalRevenue,
          pendingOrders,
          completedOrders,
        },
        pagination: {
          totalDocs: orders.totalDocs,
          limit: orders.limit,
          totalPages: orders.totalPages,
          page: orders.page,
          pagingCounter: orders.pagingCounter,
          hasPrevPage: orders.hasPrevPage,
          hasNextPage: orders.hasNextPage,
          prevPage: orders.prevPage,
          nextPage: orders.nextPage,
        },
      });
    } catch (error) {
      console.error("Get all orders error:", error);
      return responseReturn(res, 500, { error: "Internal Server Error" });
    }
  };

  // Update payment status
  updatePaymentStatus = async (req, res) => {
    const { orderId } = req.params;
    const { paymentStatus, transactionId, cardLast4, cardBrand } = req.body;

    try {
      const order = await Order.findById(orderId);
      if (!order) {
        return responseReturn(res, 404, { error: "Order not found" });
      }

      const normalizedStatus =
        paymentStatus === "review" ? "processing" : paymentStatus;

      const validPaymentStatuses = [
        "pending",
        "processing",
        "completed",
        "failed",
        "refunded",
      ];

      if (!validPaymentStatuses.includes(normalizedStatus)) {
        return responseReturn(res, 400, { error: "Invalid payment status" });
      }

      order.payment.status = normalizedStatus;

      if (transactionId) {
        order.payment.transactionId = transactionId;
      }

      if (cardLast4) {
        order.payment.cardLast4 = cardLast4;
      }

      if (cardBrand) {
        order.payment.cardBrand = cardBrand;
      }

      if (paymentStatus === "completed") {
        order.payment.paymentDate = new Date();
        // Update order status to confirmed when payment is completed
        if (order.orderStatus === "pending") {
          order.orderStatus = "confirmed";
          order.confirmedAt = new Date();
        }
      }

      await order.save();

      // Populate customer and trip details
      await order.populate([
        { path: "customerId", select: "name email" },
        { path: "cartItems.tripId", select: "title mainImage days" },
      ]);

      // Send email notification based on payment status
      const customerEmail =
        order.personalInfo?.email || order.customerId?.email;

      if (customerEmail) {
        try {
          if (normalizedStatus === "completed") {
            // Send payment confirmation email
            console.log(
              `[Email] Preparing payment confirmation email for order ${order.orderNumber} to ${customerEmail}`
            );
            const emailData =
              await generatePaymentConfirmationEmail(order);
            emailQueue.add({
              subject: `Payment Confirmed - Booking #${order.orderNumber}`,
              content: emailData.html,
              recipients: [customerEmail],
              attachment: emailData.attachment,
            });
            console.log(
              `[Email] ✅ Payment confirmation email queued successfully for order ${order.orderNumber} to ${customerEmail}${emailData.attachment ? " (with QR code attachment)" : ""}`
            );
          } else if (normalizedStatus === "failed") {
            // Send payment rejection email
            console.log(
              `[Email] Preparing payment rejection email for order ${order.orderNumber} to ${customerEmail}`
            );
            const emailData = await generatePaymentRejectionEmail(order);
            emailQueue.add({
              subject: `Payment Update - Booking #${order.orderNumber}`,
              content: emailData.html,
              recipients: [customerEmail],
              attachment: emailData.attachment,
            });
            console.log(
              `[Email] ✅ Payment rejection email queued successfully for order ${order.orderNumber} to ${customerEmail}`
            );
          } else {
            console.log(
              `[Email] Payment status "${normalizedStatus}" for order ${order.orderNumber} - no email notification required`
            );
          }
        } catch (emailError) {
          console.error(
            `[Email] ❌ Error preparing/sending payment status email for order ${order.orderNumber} to ${customerEmail}:`,
            emailError
          );
          // Don't fail the request if email sending fails
        }
      } else {
        console.warn(
          `[Email] ⚠️ No email found for order ${order.orderNumber}, skipping email notification`
        );
      }

      return responseReturn(res, 200, {
        message: "Payment status updated successfully",
        order,
      });
    } catch (error) {
      console.error("Update payment status error:", error);
      return responseReturn(res, 500, { error: "Internal Server Error" });
    }
  };

  // Cancel order
  cancelOrder = async (req, res) => {
    const { orderId } = req.params;
    const { cancellationReason, refundAmount } = req.body;

    try {
      const order = await Order.findById(orderId);
      if (!order) {
        return responseReturn(res, 404, { error: "Order not found" });
      }

      // Check if order can be cancelled
      if (
        order.orderStatus === "completed" ||
        order.orderStatus === "cancelled"
      ) {
        return responseReturn(res, 400, { error: "Order cannot be cancelled" });
      }

      order.orderStatus = "cancelled";
      order.cancelledAt = new Date();

      if (cancellationReason) {
        order.cancellationReason = cancellationReason;
      }

      if (refundAmount) {
        order.refundAmount = refundAmount;
        order.refundDate = new Date();
        order.payment.status = "refunded";
      }

      await order.save();

      // Populate customer and trip details
      await order.populate([
        { path: "customerId", select: "name email" },
        { path: "cartItems.tripId", select: "title mainImage" },
      ]);

      return responseReturn(res, 200, {
        message: "Order cancelled successfully",
        order,
      });
    } catch (error) {
      console.error("Cancel order error:", error);
      return responseReturn(res, 500, { error: "Internal Server Error" });
    }
  };

  // Get order statistics
  getOrderStatistics = async (req, res) => {
    try {
      const today = new Date();
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      const startOfYear = new Date(today.getFullYear(), 0, 1);

      const [
        totalOrders,
        todayOrders,
        monthOrders,
        yearOrders,
        pendingOrders,
        completedOrders,
        totalRevenue,
        monthRevenue,
        yearRevenue,
      ] = await Promise.all([
        Order.countDocuments(),
        Order.countDocuments({
          createdAt: { $gte: new Date(today.setHours(0, 0, 0, 0)) },
        }),
        Order.countDocuments({ createdAt: { $gte: startOfMonth } }),
        Order.countDocuments({ createdAt: { $gte: startOfYear } }),
        Order.countDocuments({ orderStatus: "pending" }),
        Order.countDocuments({ orderStatus: "completed" }),
        Order.aggregate([
          { $group: { _id: null, total: { $sum: "$totalAmount" } } },
        ]),
        Order.aggregate([
          { $match: { createdAt: { $gte: startOfMonth } } },
          { $group: { _id: null, total: { $sum: "$totalAmount" } } },
        ]),
        Order.aggregate([
          { $match: { createdAt: { $gte: startOfYear } } },
          { $group: { _id: null, total: { $sum: "$totalAmount" } } },
        ]),
      ]);

      return responseReturn(res, 200, {
        statistics: {
          totalOrders,
          todayOrders,
          monthOrders,
          yearOrders,
          pendingOrders,
          completedOrders,
          totalRevenue: totalRevenue[0]?.total || 0,
          monthRevenue: monthRevenue[0]?.total || 0,
          yearRevenue: yearRevenue[0]?.total || 0,
        },
      });
    } catch (error) {
      console.error("Get order statistics error:", error);
      return responseReturn(res, 500, { error: "Internal Server Error" });
    }
  };

  // Auto-complete trips that have ended
  autoCompleteTripsEndpoint = async (req, res) => {
    try {
      const result = await autoCompleteTrips();
      return responseReturn(res, 200, result);
    } catch (error) {
      console.error("Auto-complete trips endpoint error:", error);
      return responseReturn(res, 500, { error: "Internal Server Error" });
    }
  };

  // Check and update specific order trips
  checkOrderCompletion = async (req, res) => {
    const { orderId } = req.params;

    try {
      const result = await checkOrderTripsCompletion(orderId);
      return responseReturn(res, 200, result);
    } catch (error) {
      console.error("Check order completion error:", error);
      return responseReturn(res, 500, { error: "Internal Server Error" });
    }
  };

  // Get customer-specific order statistics
  getCustomerOrderStatistics = async (req, res) => {
    const { customerId } = req.params;

    try {
      // Auto-check for completed trips before getting statistics
      await autoCompleteTrips();

      // Validate customer exists
      const customer = await Customer.findById(customerId);
      if (!customer) {
        return responseReturn(res, 404, { error: "Customer not found" });
      }

      // Get all orders for this customer
      const customerOrders = await Order.find({ customerId })
        .select("+payment") // Explicitly include payment field
        .populate([
          { path: "customerId", select: "name email" },
          { path: "cartItems.tripId", select: "mainTitle mainImage" },
        ])
        .sort({ createdAt: -1 })
        .lean();

      // Calculate statistics
      const totalOrders = customerOrders.length;
      const pendingOrders = customerOrders.filter(
        (order) => order.orderStatus === "pending"
      ).length;
      const confirmedOrders = customerOrders.filter(
        (order) => order.orderStatus === "confirmed"
      ).length;
      const preparingOrders = customerOrders.filter(
        (order) => order.orderStatus === "preparing"
      ).length;
      const inProgressOrders = customerOrders.filter(
        (order) => order.orderStatus === "in-progress"
      ).length;
      const completedOrders = customerOrders.filter(
        (order) => order.orderStatus === "completed"
      ).length;
      const cancelledOrders = customerOrders.filter(
        (order) => order.orderStatus === "cancelled"
      ).length;
      const refundedOrders = customerOrders.filter(
        (order) => order.orderStatus === "refunded"
      ).length;

      // Calculate budget statistics
      // Total spent should only include orders with completed status AND completed payment
      const totalSpent = customerOrders
        .filter(
          (order) =>
            order.orderStatus === "completed" &&
            order.payment?.status === "completed"
        )
        .reduce((sum, order) => sum + (order.totalAmount || 0), 0);

      const totalBudget = customerOrders.reduce(
        (sum, order) => sum + (order.totalAmount || 0),
        0
      );
      const pendingBudget = customerOrders
        .filter((order) => order.orderStatus === "pending")
        .reduce((sum, order) => sum + (order.totalAmount || 0), 0);
      const confirmedBudget = customerOrders
        .filter((order) => order.orderStatus === "confirmed")
        .reduce((sum, order) => sum + (order.totalAmount || 0), 0);
      const completedBudget = customerOrders
        .filter((order) => order.orderStatus === "completed")
        .reduce((sum, order) => sum + (order.totalAmount || 0), 0);
      const cancelledBudget = customerOrders
        .filter((order) => order.orderStatus === "cancelled")
        .reduce((sum, order) => sum + (order.totalAmount || 0), 0);
      const refundedBudget = customerOrders
        .filter((order) => order.orderStatus === "refunded")
        .reduce((sum, order) => sum + (order.totalAmount || 0), 0);

      // Get last 5 orders
      const lastFiveOrders = customerOrders.slice(0, 5);

      // Calculate average order value
      const averageOrderValue = totalOrders > 0 ? totalBudget / totalOrders : 0;

      // Get monthly statistics for the last 6 months
      const monthlyStats = [];
      for (let i = 5; i >= 0; i--) {
        const monthStart = new Date();
        monthStart.setMonth(monthStart.getMonth() - i);
        monthStart.setDate(1);
        monthStart.setHours(0, 0, 0, 0);

        const monthEnd = new Date(monthStart);
        monthEnd.setMonth(monthEnd.getMonth() + 1);
        monthEnd.setDate(0);
        monthEnd.setHours(23, 59, 59, 999);

        const monthOrders = customerOrders.filter((order) => {
          const orderDate = new Date(order.createdAt);
          return orderDate >= monthStart && orderDate <= monthEnd;
        });

        const monthBudget = monthOrders.reduce(
          (sum, order) => sum + (order.totalAmount || 0),
          0
        );

        monthlyStats.push({
          month: monthStart.toLocaleDateString("en-US", {
            month: "short",
            year: "numeric",
          }),
          orders: monthOrders.length,
          budget: monthBudget,
        });
      }

      // Calculate trip statistics
      const totalTrips = customerOrders.reduce(
        (sum, order) => sum + (order.cartItems?.length || 0),
        0
      );
      const completedTrips = customerOrders.reduce((sum, order) => {
        return (
          sum +
          (order.cartItems?.filter((item) => item.itemStatus === "completed")
            .length || 0)
        );
      }, 0);
      const pendingTrips = customerOrders.reduce((sum, order) => {
        return (
          sum +
          (order.cartItems?.filter((item) => item.itemStatus === "pending")
            .length || 0)
        );
      }, 0);

      return responseReturn(res, 200, {
        customer: {
          id: customer._id,
          name: customer.name,
          email: customer.email,
        },
        statistics: {
          orders: {
            total: totalOrders,
            pending: pendingOrders,
            confirmed: confirmedOrders,
            preparing: preparingOrders,
            inProgress: inProgressOrders,
            completed: completedOrders,
            cancelled: cancelledOrders,
            refunded: refundedOrders,
          },
          budget: {
            total: totalBudget,
            totalSpent: totalSpent, // Only completed orders with completed payments
            pending: pendingBudget,
            confirmed: confirmedBudget,
            completed: completedBudget,
            cancelled: cancelledBudget,
            refunded: refundedBudget,
            average: averageOrderValue,
          },
          trips: {
            total: totalTrips,
            completed: completedTrips,
            pending: pendingTrips,
          },
          monthlyStats: monthlyStats,
        },
        recentOrders: lastFiveOrders.map((order) => ({
          id: order._id,
          orderNumber: order.orderNumber,
          orderStatus: order.orderStatus,
          totalAmount: order.totalAmount,
          createdAt: order.createdAt,
          payment: order.payment, // Include payment information
          cartItems:
            order.cartItems?.map((item) => ({
              mainTitle: item.mainTitle,
              startingDate: item.startingDate,
              travelersNumber: item.travelersNumber,
              itemStatus: item.itemStatus,
              tripId: item.tripId,
              days: item.days,
            })) || [],
        })),
      });
    } catch (error) {
      console.error("Get customer order statistics error:", error);
      return responseReturn(res, 500, { error: "Internal Server Error" });
    }
  };
}

module.exports = new OrderController();
