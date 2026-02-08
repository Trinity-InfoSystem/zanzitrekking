const express = require("express");
const ExclusionController = require("../../controllers/dashboard/exclusionController");
const { jwtMiddleware } = require("../../middlewares/authJwtMiddleware");

const router = express.Router();

router.post("/exclusion-add", jwtMiddleware, ExclusionController.add_exclusion);
router.get(
  "/exclusions-get",
  jwtMiddleware,
  ExclusionController.get_exclusions
);
router.get(
  "/exclusion-get/:exclusionId",
  jwtMiddleware,
  ExclusionController.get_exclusion
);
router.post(
  "/exclusion-update/:exclusionId",
  jwtMiddleware,
  ExclusionController.update_exclusion
);
router.delete(
  "/exclusion-delete/:exclusionId",
  jwtMiddleware,
  ExclusionController.delete_exclusion
);
router.post(
  "/exclusion-delete-multiple",
  jwtMiddleware,
  ExclusionController.delete_exclusions
);

module.exports = router;
