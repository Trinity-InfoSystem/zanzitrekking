const express = require("express");
const ProductController = require("../../controllers/dashboard/productController");
const { jwtMiddleware } = require("../../middlewares/authJwtMiddleware");

const router = express.Router();

router.post("/product-add", jwtMiddleware, ProductController.add_product);
router.get("/products-get", jwtMiddleware, ProductController.get_products);
router.get(
  "/product-get/:productId",
  jwtMiddleware,
  ProductController.get_product
);
router.post("/product-update", jwtMiddleware, ProductController.update_product);
router.post(
  "/product-image-update",
  jwtMiddleware,
  ProductController.update_product_image
);

module.exports = router;
