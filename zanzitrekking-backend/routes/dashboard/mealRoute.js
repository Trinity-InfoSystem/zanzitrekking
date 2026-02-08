const express = require("express");
const MealController = require("../../controllers/dashboard/mealController");
const { jwtMiddleware } = require("../../middlewares/authJwtMiddleware");

const router = express.Router();

router.post("/meal-add", jwtMiddleware, MealController.add_meal);
router.get("/meals-get", jwtMiddleware, MealController.get_meals);
router.get("/meal-get/:mealId", jwtMiddleware, MealController.get_meal);
router.post("/meal-update/:mealId", jwtMiddleware, MealController.update_meal);
router.delete(
  "/meal-delete/:mealId",
  jwtMiddleware,
  MealController.delete_meal
);
router.post(
  "/meal-delete-multiple",
  jwtMiddleware,
  MealController.delete_meals
);

module.exports = router;
