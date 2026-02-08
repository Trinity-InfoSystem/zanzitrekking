const express = require("express");
const router = express.Router();
const newsletterController = require("../../controllers/dashboard/newsletterController");
const { jwtMiddleware } = require("../../middlewares/authJwtMiddleware");
const { validate } = require("../../middlewares/validationMiddleware");
const { subscribeSchema } = require("../../validators/newsletterValidation");
const upload = require("../../utilities/multerUpload");

router.post(
  "/newsletter/subscribe",
  validate(subscribeSchema),
  newsletterController.subscribe
);
router.post(
  "/newsletter/unsubscribe",
  validate(subscribeSchema),
  newsletterController.unsubscribe
);

router.get(
  "/newsletter/subscribers",
  jwtMiddleware,
  newsletterController.getSubscribers
);

router.get(
  "/newsletter/subscribers/all",
  jwtMiddleware,
  newsletterController.getAllSubscribers
);

router.get(
  "/newsletter/subscriber/:email",
  jwtMiddleware,
  newsletterController.getSubscriber
);
router.put(
  "/newsletter/subscriber/:email",
  jwtMiddleware,
  newsletterController.updateSubscriber
);
router.delete(
  "/newsletter/subscriber/:email",
  jwtMiddleware,
  newsletterController.deleteSubscriber
);

router.get(
  "/newsletter/export",
  jwtMiddleware,
  newsletterController.exportSubscribers
);

router.post(
  "/newsletter/send",
  jwtMiddleware,
  upload.newsletterUpload.single("attachment"),
  newsletterController.sendNewsletter
);

module.exports = router;
