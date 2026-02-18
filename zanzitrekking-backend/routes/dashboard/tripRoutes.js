const express = require("express");
const router = express.Router();
const tripController = require("../../controllers/dashboard/tripController");
const { uploadOptions } = require("../../utilities/multerUpload");
const { jwtMiddleware } = require("../../middlewares/authJwtMiddleware");
const { validate } = require("../../middlewares/validationMiddleware");
const {
  addTripSchema,
  updateTripSchema,
  deleteTripsSchema,
} = require("../../validators/tripValidation");

router.get("/trips-get", tripController.get_trips);
router.get("/trip-get/:tripId", tripController.get_trip);
router.get("/special-trips-get", tripController.get_special_trips);
router.get("/trip/price-range", tripController.get_price_range);
router.get("/trip/query-trips", tripController.query_trips);

router.post(
  "/trip-add",
  jwtMiddleware,
  uploadOptions.any(),
  validate(addTripSchema),
  tripController.add_trip
);
router.delete(
  "/trip-delete/:tripId",
  jwtMiddleware,
  tripController.delete_trip
);
router.post(
  "/trip-delete-multiple",
  jwtMiddleware,
  validate(deleteTripsSchema),
  tripController.delete_trips
);

router.put(
  "/trip-update/:tripId",
  uploadOptions.any(),
  jwtMiddleware,
  validate(updateTripSchema),
  tripController.update_trip
);

module.exports = router;
