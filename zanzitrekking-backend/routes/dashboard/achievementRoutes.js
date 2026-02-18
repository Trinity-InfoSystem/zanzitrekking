const express = require("express");
const router = express.Router();
const achievementController = require("../../controllers/dashboard/achievementController");
const { uploadOptions } = require("../../utilities/multerUpload");
const { jwtMiddleware } = require("../../middlewares/authJwtMiddleware");
const { validate } = require("../../middlewares/validationMiddleware");
const {
  addAchievementSchema,
  updateAchievementSchema,
  toggleAchievementStatusSchema,
  deleteAchievementsSchema,
} = require("../../validators/achievementValidation");

// Public routes (for frontend)
router.get("/achievements-active", achievementController.get_active_achievements);

// Protected routes (for dashboard)
router.get("/achievements-get", jwtMiddleware, achievementController.get_achievements);
router.get(
  "/achievement-get/:achievementId",
  jwtMiddleware,
  achievementController.get_achievement
);

router.post(
  "/achievement-add",
  jwtMiddleware,
  uploadOptions.single("image"),
  validate(addAchievementSchema),
  achievementController.add_achievement
);

router.put(
  "/achievement-update/:achievementId",
  jwtMiddleware,
  uploadOptions.single("image"),
  validate(updateAchievementSchema),
  achievementController.update_achievement
);

router.delete(
  "/achievement-delete/:achievementId",
  jwtMiddleware,
  achievementController.delete_achievement
);

router.put(
  "/achievement-toggle-status/:achievementId",
  jwtMiddleware,
  validate(toggleAchievementStatusSchema),
  achievementController.toggle_achievement_status
);

router.post(
  "/achievement-delete-multiple",
  jwtMiddleware,
  validate(deleteAchievementsSchema),
  achievementController.delete_achievements
);

module.exports = router;

