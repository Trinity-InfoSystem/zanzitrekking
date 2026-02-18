const express = require("express");
const router = express.Router();
const whoWeAreController = require("../../controllers/dashboard/whoWeAreController");
const { uploadOptions } = require("../../utilities/multerUpload");
const { jwtMiddleware } = require("../../middlewares/authJwtMiddleware");
const { validate } = require("../../middlewares/validationMiddleware");
const { addWhoWeAreSchema } = require("../../validators/whoWeAreValidation");

router.get("/whoWeAre-get", whoWeAreController.get_whoWeAre);

router.post(
  "/add-whoWeAre",
  jwtMiddleware,
  uploadOptions.any(),
  validate(addWhoWeAreSchema),
  whoWeAreController.add_whoWeAre
);

module.exports = router;
