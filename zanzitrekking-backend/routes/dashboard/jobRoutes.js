const express = require("express");
const JobController = require("../../controllers/dashboard/jobController");
const { jwtMiddleware } = require("../../middlewares/authJwtMiddleware");
const { validate } = require("../../middlewares/validationMiddleware");
const {
  addJobSchema,
  updateJobSchema,
  toggleJobStatusSchema,
} = require("../../validators/jobValidation");
const router = express.Router();

router.post("/job-add", jwtMiddleware, validate(addJobSchema), JobController.add_job);
router.get("/job-get", jwtMiddleware, JobController.get_jobs);
router.get("/job-one-get/:jobId", jwtMiddleware, JobController.get_one_job);
router.post("/job-update/:jobId", jwtMiddleware, validate(updateJobSchema), JobController.update_job);
router.delete("/job-delete/:jobId", jwtMiddleware, JobController.delete_job);
router.post(
  "/job-toggle-status/:jobId",
  jwtMiddleware,
  validate(toggleJobStatusSchema),
  JobController.toggle_job_status
);

module.exports = router;

