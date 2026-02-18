const express = require("express");
const { jwtMiddleware } = require("../../middlewares/authJwtMiddleware");
const { uploadOptions } = require("../../utilities/multerUpload");
const { validate } = require("../../middlewares/validationMiddleware");
const {
  createBannerSchema,
  updateBannerSchema,
} = require("../../validators/bannerValidation");
const router = express.Router();
const BannerController = require("../../controllers/dashboard/bannerController");

router.post(
  "/create-banner",
  jwtMiddleware,
  uploadOptions.any(),
  validate(createBannerSchema),
  BannerController.create_banner
);
router.post(
  "/update-banner",
  jwtMiddleware,
  uploadOptions.any(),
  validate(updateBannerSchema),
  BannerController.update_banner
);
router.get("/banner-get", BannerController.fetchBanner);
module.exports = router;
