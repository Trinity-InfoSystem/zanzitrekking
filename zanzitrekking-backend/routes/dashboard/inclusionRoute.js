const express = require("express");
const InclusionController = require("../../controllers/dashboard/inclusionController");
const { jwtMiddleware } = require("../../middlewares/authJwtMiddleware");

const router = express.Router();

router.post("/inclusion-add", jwtMiddleware, InclusionController.add_inclusion);
router.get(
  "/inclusions-get",
  jwtMiddleware,
  InclusionController.get_inclusions
);
router.get(
  "/inclusion-get/:inclusionId",
  jwtMiddleware,
  InclusionController.get_inclusion
);
router.post(
  "/inclusion-update/:inclusionId",
  jwtMiddleware,
  InclusionController.update_inclusion
);
router.delete(
  "/inclusion-delete/:inclusionId",
  jwtMiddleware,
  InclusionController.deleteInclusion
);

// Bulk delete route
router.post(
  "/inclusion-delete-multiple",
  jwtMiddleware,
  InclusionController.deleteInclusions
);

module.exports = router;
