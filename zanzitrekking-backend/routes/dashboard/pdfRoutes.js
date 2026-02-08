const express = require("express");
const router = express.Router();
const pdfController = require("../../controllers/dashboard/pdfController");
const { pdfUpload } = require("../../utilities/multerUpload");
const { jwtMiddleware } = require("../../middlewares/authJwtMiddleware");

// Get routes
router.get("/pdfs-get", pdfController.get_pdfs);
router.get("/pdf-get/:type", pdfController.get_pdf);

// Post routes
router.post(
  "/pdf-add",
  jwtMiddleware,
  pdfUpload.single("pdf"),
  pdfController.add_pdf
);

// Delete route
router.delete("/pdf-delete/:pdfId", jwtMiddleware, pdfController.delete_pdf);

// Update route
router.put(
  "/pdf-update/:pdfId",
  jwtMiddleware,
  pdfUpload.single("pdf"),
  pdfController.update_pdf
);

module.exports = router;
