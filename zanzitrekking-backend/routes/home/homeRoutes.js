const express = require("express");
const router = express.Router();
const homeController = require("../../controllers/home/homeController");
const whoWeAreController = require("../../controllers/dashboard/whoWeAreController");
const contactController = require("../../controllers/home/contactController");
const { validate } = require("../../middlewares/validationMiddleware");
const { contactSchema } = require("../../validators/contactValidation");

router.get("/get-categories", homeController.get_catgories);
router.get("/get-statistic-data", whoWeAreController.get_statistic_data);
router.post("/contact", validate(contactSchema), contactController.send_contact_message);

module.exports = router;
