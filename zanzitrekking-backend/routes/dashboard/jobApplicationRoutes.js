const express = require("express");
const JobApplicationController = require("../../controllers/dashboard/jobApplicationController");
const { jwtMiddleware } = require("../../middlewares/authJwtMiddleware");
const router = express.Router();

router.get(
  "/job-applications",
  jwtMiddleware,
  JobApplicationController.get_applications
);
router.get(
  "/job-application/:applicationId",
  jwtMiddleware,
  JobApplicationController.get_application
);
router.post(
  "/job-application-update-status/:applicationId",
  jwtMiddleware,
  JobApplicationController.update_application_status
);
router.post(
  "/send-email-to-applicant/:applicationId",
  jwtMiddleware,
  JobApplicationController.send_email_to_applicant
);

module.exports = router;

