// wishlistRoutes.js
const express = require("express");
const wishlistController = require("../../controllers/home/cartController");
const { validate } = require("../../middlewares/validationMiddleware");
const {
  addToCartSchema,
  updateCartTripSchema,
  addToWishlistSchema,
} = require("../../validators/cartValidation");

const router = express.Router();

// Cart routes
router.get(
  "/home/trip/get-cart-trips/:userId",
  wishlistController.get_cart_trips
);
router.post(
  "/home/trip/add-to-cart",
  validate(addToCartSchema),
  wishlistController.add_to_cart
);

router.put("/home/trip/update-cart-trip", validate(updateCartTripSchema), wishlistController.update_cart_trip);
router.delete(
  "/home/trip/delete-cart-trip/:cartId",
  wishlistController.delete_cart_trip
);
router.delete(
  "/home/trip/clear-cart/:userId",
  wishlistController.clear_cart
);

// Wishlist routes
router.post(
  "/home/trip/add-to-wishlist",
  validate(addToWishlistSchema),
  wishlistController.add_to_wishlist
);
router.get(
  "/home/trip/get-wishlist-trips/:userId",
  wishlistController.get_wishlist_trips
);
router.delete(
  "/home/trip/remove-wishlist-trip/:wishlistId",
  wishlistController.remove_wishlist_trip
);
router.post(
  "/home/trip/add-wishlist-to-cart/:wishlistId",
  wishlistController.add_wishlist_to_cart
);

module.exports = router;
