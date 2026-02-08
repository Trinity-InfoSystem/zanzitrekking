const express = require("express");
const router = express.Router();
const impactStatController = require("../../controllers/dashboard/impactStatController");
const { jwtMiddleware } = require("../../middlewares/authJwtMiddleware");

// Public routes (for frontend)
router.get("/impact-stats-active", impactStatController.get_active_impact_stats);

// Protected routes (for dashboard)
router.get("/impact-stats-get", jwtMiddleware, impactStatController.get_impact_stats);
router.get(
  "/impact-stat-get/:impactStatId",
  jwtMiddleware,
  impactStatController.get_impact_stat
);

router.post(
  "/impact-stat-add",
  jwtMiddleware,
  impactStatController.add_impact_stat
);

router.put(
  "/impact-stat-update/:impactStatId",
  jwtMiddleware,
  impactStatController.update_impact_stat
);

router.delete(
  "/impact-stat-delete/:impactStatId",
  jwtMiddleware,
  impactStatController.delete_impact_stat
);

router.put(
  "/impact-stat-toggle-status/:impactStatId",
  jwtMiddleware,
  impactStatController.toggle_impact_stat_status
);

router.post(
  "/impact-stat-delete-multiple",
  jwtMiddleware,
  impactStatController.delete_impact_stats
);

module.exports = router;

