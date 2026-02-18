const express = require("express");
const router = express.Router();
const partnerController = require("../../controllers/dashboard/partnerController");
const { uploadOptions } = require("../../utilities/multerUpload");
const { jwtMiddleware } = require("../../middlewares/authJwtMiddleware");
const { validate } = require("../../middlewares/validationMiddleware");
const {
  addPartnerSchema,
  updatePartnerSchema,
  togglePartnerStatusSchema,
  deletePartnersSchema,
} = require("../../validators/partnerValidation");

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
  validate(addPartnerSchema),
  partnerController.add_partner
);

router.put(
  "/partner-update/:partnerId",
  jwtMiddleware,
  uploadOptions.single("logo"),
  validate(updatePartnerSchema),
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
  validate(togglePartnerStatusSchema),
  partnerController.toggle_partner_status
);

router.post(
  "/partner-delete-multiple",
  jwtMiddleware,
  validate(deletePartnersSchema),
  partnerController.delete_partners
);

module.exports = router;
