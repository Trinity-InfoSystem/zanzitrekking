const express = require("express");
const orderController = require("../../controllers/order/orderController");
const router = express.Router();

router.post("/home/order/place-order", orderController.place_order);
router.get(
  "/home/customer/get-dashboard-data/:userId",
  orderController.get_dashboard_data
);
router.get(
  "/home/customer/get-orders/details/:orderId",
  orderController.get_orders_details
);

router.get(
  "/home/customer/get-orders/:customerId/:status",
  orderController.get_orders
);

module.exports = router;
