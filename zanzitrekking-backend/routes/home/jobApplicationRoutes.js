const express = require("express");
const JobApplicationController = require("../../controllers/home/jobApplicationController");
const { cvFileUpload } = require("../../utilities/multerUpload");
const { validate } = require("../../middlewares/validationMiddleware");
const { applyToJobSchema } = require("../../validators/jobApplicationValidation");
const router = express.Router();

router.post(
  "/job-apply/:jobId",
  cvFileUpload.single("cvFile"),
  validate(applyToJobSchema),
  JobApplicationController.apply_to_job
);

router.get(
  "/user-applications",
  JobApplicationController.get_user_applications
);

module.exports = router;
