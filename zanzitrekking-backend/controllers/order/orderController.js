const moment = require("moment");
const cardModel = require("../../models/cart");
const authorOrder = require("../../models/authOrder");
const customerOrder = require("../../models/customerOrder");
const { responseReturn } = require("../../utilities/response");

class OrderController {
  payment_check = async (id, res) => {
    try {
      const order = await customerOrder.findById(id);
      if (order.payment_status === "unpaid") {
        await customerOrder.findByIdAndUpdate(id, {
          delivery_status: "cancelled",
        });
        await authorOrder.updateMany({
          orderId: id,
          delivery_status: "cancelled",
        });
      }
      return true;
    } catch (error) {
      return responseReturn(res, 500, { error: "Internal Server Error" });
    }
  };

  place_order = async (req, res) => {
    const { price, products, shipping_fee, shippingInfo, userId } = req.body;
    let authorOrderData = [];
    let cardId = [];
    const tempDate = moment(Date.now()).format("LLL");
    let customerOrderProduct = [];

    // Process products to build customerOrderProduct and cardId arrays
    for (const product of products) {
      const pro = product.products;
      for (const pr of pro) {
        const tempCusPro = { ...pr.productInfo, quantity: pr.quantity };
        customerOrderProduct.push(tempCusPro);
        if (pr._id) {
          cardId.push(pr._id);
        }
      }
    }

    try {
      const order = await customerOrder.create({
        orderNumber: await customerOrder.generateOrderNumber(),
        customerId: userId,
        shippingInfo,
        products: customerOrderProduct,
        price: price + shipping_fee,
        payment_status: "unpaid",
        delivery_status: "pending",
        date: tempDate,
      });

      // Create authorOrder data
      for (const product of products) {
        const pro = product.products;
        const pri = product.price;
        const sellerId = product.sellerId;
        let storePro = [];
        for (const pr of pro) {
          const tempPro = { ...pr.productInfo, quantity: pr.quantity };
          storePro.push(tempPro);
        }
        authorOrderData.push({
          orderId: order.id,
          sellerId,
          products: storePro,
          price: pri,
          payment_status: "unpaid",
          shippingInfo: "Easy Main Warehouse",
          delivery_status: "pending",
          date: tempDate,
        });
      }

      // Insert author orders
      await authorOrder.insertMany(authorOrderData);

      // Delete products from cart
      for (const id of cardId) {
        await cardModel.deleteMany({ _id: id });
      }

      // Schedule payment check after 15 seconds
      setTimeout(() => {
        this.payment_check(order._id, res);
      }, 15000);

      return responseReturn(res, 201, {
        message: "Order Placed Successfully",
        orderId: order.id,
      });
    } catch (error) {
      return responseReturn(res, 500, { error: "Internal Server Error" });
    }
  };
  get_dashboard_data = async (req, res) => {
    const { userId } = req.params;
    try {
      const recentOrders = await customerOrder
        .find({ customerId: userId })
        .limit(5);
      const pendingOrders = await customerOrder
        .find({ customerId: userId, delivery_status: "pending" })
        .countDocuments();
      const totalOrders = await customerOrder
        .find({ customerId: userId })
        .countDocuments();
      const cancelledOrders = await customerOrder
        .find({ customerId: userId, delivery_status: "cancelled" })
        .countDocuments();

      responseReturn(res, 200, {
        recentOrders,
        pendingOrders,
        totalOrders,
        cancelledOrders,
      });
    } catch (error) {}
  };
  get_orders = async (req, res) => {
    const { customerId, status } = req.params;

    try {
      // Define a mapping from status to the corresponding query

      const statusQuery = {
        all: {},
        cancelled: { delivery_status: "cancelled" },
        pending: { delivery_status: "pending" },
        placed: { delivery_status: "placed" },
        warehouse: { delivery_status: "warehouse" },
      };

      // Check if the status provided matches one of the keys in statusQuery

      if (statusQuery[status]) {
        const orders = await customerOrder.find({
          customerId,
          ...statusQuery[status],
        });
        return responseReturn(res, 200, { orders });
      } else {
        // Handle case where status is invalid
        return responseReturn(res, 400, { error: "Invalid order status" });
      }
    } catch (error) {
      return responseReturn(res, 500, { error: "Internal Server Error" });
    }
  };
  get_orders_details = async (req, res) => {
    const { orderId } = req.params;
    const order = await customerOrder.findById(orderId);
    responseReturn(res, 200, { order });
  };
}

module.exports = new OrderController();
