const express = require("express");
const CategoryController = require("../../controllers/dashboard/categoryController");
const { jwtMiddleware } = require("../../middlewares/authJwtMiddleware");
const { uploadOptions } = require("../../utilities/multerUpload");
const { validate } = require("../../middlewares/validationMiddleware");
const {
  addCategorySchema,
  updateCategorySchema,
  deleteCategoriesSchema,
} = require("../../validators/categoryValidation");
const router = express.Router();

router.post(
  "/category-add",
  uploadOptions.single("image"),
  jwtMiddleware,
  validate(addCategorySchema),
  CategoryController.add_category
);
router.get("/category-get", jwtMiddleware, CategoryController.get_category);
router.get(
  "/category-one-get/:categoryId",

  CategoryController.get_one_category
);
router.post(
  "/category-update/:categoryId",
  uploadOptions.single("image"),
  jwtMiddleware,
  validate(updateCategorySchema),
  CategoryController.update_category
);
router.post(
  "/category-image-update/:categoryId",
  uploadOptions.single("newImage"),
  jwtMiddleware,
  CategoryController.update_category_image
);
router.delete(
  "/category-delete/:categoryId",
  jwtMiddleware,
  CategoryController.deleteCategory
);
router.post(
  "/category-delete-multiple",
  jwtMiddleware,
  validate(deleteCategoriesSchema),
  CategoryController.delete_categories
);

module.exports = router;
