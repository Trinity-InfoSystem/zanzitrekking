const express = require("express");
const router = express.Router();
const homeController = require("../../controllers/home/homeController");
const whoWeAreController = require("../../controllers/dashboard/whoWeAreController");
const contactController = require("../../controllers/home/contactController");

router.get("/get-categories", homeController.get_catgories);
router.get("/get-products", homeController.get_products);
router.get("/price-range-latest-product", homeController.price_range_product);
router.get("/query-products", homeController.query_products);
router.get("/product-details/:productId", homeController.product_details);
router.get("/get-statistic-data", whoWeAreController.get_statistic_data);
router.post("/contact", contactController.send_contact_message);

module.exports = router;
