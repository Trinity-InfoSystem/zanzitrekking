const express = require("express");
const JobController = require("../../controllers/dashboard/jobController");
const router = express.Router();

// Public routes - only active jobs
router.get("/jobs", async (req, res) => {
  try {
    const Job = require("../../models/job");
    const { page, parPage, searchValue, sort = "newest-desc" } = req.query;

    // Determine sort order
    let sortOptions = {};
    if (sort === "title-asc") {
      sortOptions = { title: 1 };
    } else if (sort === "title-desc") {
      sortOptions = { title: -1 };
    } else if (sort === "newest-asc") {
      sortOptions = { createdAt: 1 };
    } else {
      sortOptions = { createdAt: -1 };
    }

    let skipPage = "";
    if (parPage && page) {
      skipPage = +parPage * (+page - 1);
    }

    // Build query - only active jobs
    let query = { isActive: true };

    // Check if application deadline has passed
    query.$or = [
      { applicationDeadline: { $exists: false } },
      { applicationDeadline: null },
      { applicationDeadline: { $gte: new Date() } },
    ];

    if (searchValue) {
      query.$and = [
        {
          $or: [
            { title: { $regex: searchValue, $options: "i" } },
            { description: { $regex: searchValue, $options: "i" } },
            { location: { $regex: searchValue, $options: "i" } },
          ],
        },
      ];
    }

    if (page && parPage) {
      const jobs = await Job.find(query)
        .populate("createdBy", "name email")
        .skip(skipPage)
        .limit(+parPage)
        .sort(sortOptions);

      const totalJobs = await Job.find(query).countDocuments();

      return res.status(200).json({
        totalJobs,
        jobs,
      });
    } else {
      const jobs = await Job.find(query)
        .populate("createdBy", "name email")
        .sort(sortOptions);

      const totalJobs = await Job.find(query).countDocuments();

      return res.status(200).json({
        totalJobs,
        jobs,
        message: "Jobs successfully fetched",
      });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/job/:jobId", async (req, res) => {
  try {
    const Job = require("../../models/job");
    const { jobId } = req.params;

    const job = await Job.findById(jobId).populate("createdBy", "name email");

    if (!job) {
      return res.status(404).json({ error: "Job Not Found" });
    }

    // Only return if job is active
    if (!job.isActive) {
      return res.status(404).json({ error: "Job Not Found" });
    }

    // Check if application deadline has passed
    if (
      job.applicationDeadline &&
      new Date(job.applicationDeadline) < new Date()
    ) {
      return res.status(404).json({ error: "Job Not Found" });
    }

    return res.status(200).json({
      message: "Job Fetch Successful",
      job,
    });
  } catch (error) {
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;

