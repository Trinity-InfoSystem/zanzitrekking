const express = require("express");
const AccommodationController = require("../../controllers/dashboard/accommodationController");
const { jwtMiddleware } = require("../../middlewares/authJwtMiddleware");
const { uploadOptions } = require("../../utilities/multerUpload");

const router = express.Router();

router.post(
  "/accommodation-add",
  jwtMiddleware,
  uploadOptions.any(),
  AccommodationController.add_accommodation
);
router.get(
  "/accommodations-get",
  jwtMiddleware,
  AccommodationController.get_accommodations
);
router.get(
  "/accommodation-get/:accommodationId",
  jwtMiddleware,
  AccommodationController.get_accommodation
);
router.post(
  "/accommodation-update/:accommodationId",
  jwtMiddleware,
  uploadOptions.any(),
  AccommodationController.update_accommodation
);
router.delete(
  "/accommodation-delete/:accommodationId",
  jwtMiddleware,
  AccommodationController.delete_accommodation
);
router.post(
  "/accommodation-delete-multiple",
  jwtMiddleware,
  AccommodationController.delete_accommodations
);
module.exports = router;
