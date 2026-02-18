const express = require("express");
const router = express.Router();
const blogPostController = require("../../controllers/dashboard/blogPostController");
const { uploadOptions } = require("../../utilities/multerUpload");
const { jwtMiddleware } = require("../../middlewares/authJwtMiddleware");
const { validate } = require("../../middlewares/validationMiddleware");
const {
  addBlogPostSchema,
  updateBlogPostSchema,
  updateBlogPostCategorySchema,
  addCommentSchema,
  updateCommentSchema,
} = require("../../validators/blogPostValidation");

router.get("/blogPosts-get", blogPostController.get_blogPosts);
router.get("/blog-categories", blogPostController.get_blog_categories);

router.get("/blogPost-get/:blogPostId", blogPostController.get_blogPost);
router.post(
  "/blogPost-add",
  jwtMiddleware,
  uploadOptions.any(),
  validate(addBlogPostSchema),
  blogPostController.add_blogPost
);

router.put(
  "/blogPost-update/:blogPostId",
  jwtMiddleware,
  uploadOptions.any(),
  validate(updateBlogPostSchema),
  blogPostController.update_blogPost
);
router.patch(
  "/blogPost-update-category/:blogPostId",
  jwtMiddleware,
  validate(updateBlogPostCategorySchema),
  blogPostController.update_blogPost_category
);
router.delete(
  "/blogPost-delete/:blogPostId",
  jwtMiddleware,
  blogPostController.delete_blogPost
);
router.post(
  "/add-comment-blogPost/:blogPostId",
  validate(addCommentSchema),
  blogPostController.add_comment
);
router.put(
  "/add-comment-blogPost/:blogPostId",
  validate(updateCommentSchema),
  blogPostController.updateComment
);
router.delete(
  "/add-comment-blogPost/:blogPostId",
  blogPostController.deleteComment
);
router.get(
  "/blogPost-comments/:blogPostId",
  jwtMiddleware,
  blogPostController.get_comments
);
module.exports = router;
