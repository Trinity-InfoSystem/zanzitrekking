const express = require("express");
const router = express.Router();
const partnerController = require("../../controllers/dashboard/partnerController");
const { uploadOptions } = require("../../utilities/multerUpload");
const { jwtMiddleware } = require("../../middlewares/authJwtMiddleware");

// Public routes (for frontend)
router.get("/partners-active", partnerController.get_active_partners);

// Protected routes (for dashboard)
router.get("/partners-get", jwtMiddleware, partnerController.get_partners);
router.get(
  "/partner-get/:partnerId",
  jwtMiddleware,
  partnerController.get_partner
);

router.post(
  "/partner-add",
  jwtMiddleware,
  uploadOptions.single("logo"),
  partnerController.add_partner
);

router.put(
  "/partner-update/:partnerId",
  jwtMiddleware,
  uploadOptions.single("logo"),
  partnerController.update_partner
);

router.delete(
  "/partner-delete/:partnerId",
  jwtMiddleware,
  partnerController.delete_partner
);

router.put(
  "/partner-toggle-status/:partnerId",
  jwtMiddleware,
  partnerController.toggle_partner_status
);

router.post(
  "/partner-delete-multiple",
  jwtMiddleware,
  partnerController.delete_partners
);

module.exports = router;
