const express = require("express");
const router = express.Router();
const whoWeAreController = require("../../controllers/dashboard/whoWeAreController");
const { uploadOptions } = require("../../utilities/multerUpload");
const { jwtMiddleware } = require("../../middlewares/authJwtMiddleware");

router.get("/whoWeAre-get", whoWeAreController.get_whoWeAre);

router.post(
  "/add-whoWeAre",
  jwtMiddleware,
  uploadOptions.any(),
  whoWeAreController.add_whoWeAre
);

module.exports = router;
