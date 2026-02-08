const JobApplication = require("../../models/jobApplication");
const Job = require("../../models/job");
const { responseReturn } = require("../../utilities/response");
const emailQueue = require("../../workers/emailQueue");
const {
  generateApplicationConfirmationEmail,
} = require("../../utilities/jobApplicationEmailTemplates");

class JobApplicationControllers {
  apply_to_job = async (req, res) => {
    try {
      const { jobId } = req.params;
      const file = req.file;
      const { firstName, lastName, email, phone, additionalDetails, customerId } = req.body;

      // Validate customer ID (should be set by middleware)
      if (!customerId) {
        return responseReturn(res, 401, {
          error: "Authentication required. Please log in to apply.",
        });
      }

      // Validate required fields
      if (!firstName || !lastName || !email || !phone) {
        return responseReturn(res, 400, {
          error: "First name, last name, email, and phone are required",
        });
      }

      if (!file) {
        return responseReturn(res, 400, {
          error: "CV file is required",
        });
      }

      // Check if job exists and is active
      const job = await Job.findById(jobId);
      if (!job) {
        return responseReturn(res, 404, { error: "Job not found" });
      }

      if (!job.isActive) {
        return responseReturn(res, 400, {
          error: "This job is not currently accepting applications",
        });
      }

      // Check if application deadline has passed
      if (job.applicationDeadline && new Date(job.applicationDeadline) < new Date()) {
        return responseReturn(res, 400, {
          error: "Application deadline has passed",
        });
      }

      // Check if user has already applied to this job
      const existingApplication = await JobApplication.findOne({
        jobId,
        customerId,
      });

      if (existingApplication) {
        return responseReturn(res, 409, {
          error: "You have already applied to this job",
        });
      }

      // Create file path
      const basePath = `${req.protocol}://${req.get("host")}/public/uploads/cv_files/`;
      const cvFilePath = `${basePath}${file.filename}`;

      // Create application
      const application = await JobApplication.create({
        jobId,
        customerId,
        firstName,
        lastName,
        email,
        phone,
        additionalDetails: additionalDetails || "",
        cvFile: cvFilePath,
        cvOriginalName: file.originalname,
        status: "pending",
      });

      if (!application) {
        return responseReturn(res, 500, {
          error: "Application could not be submitted",
        });
      }

      // Populate job details
      await application.populate("jobId", "title location");

      // Send confirmation email to applicant
      try {
        const emailContent = await generateApplicationConfirmationEmail(
          application,
          job
        );

        emailQueue.add({
          subject: `Application Confirmation - ${job.title}`,
          content: emailContent,
          recipients: [email],
        });
      } catch (emailError) {
        console.error("Error generating confirmation email:", emailError);
        // Don't fail the request if email generation fails
      }

      return responseReturn(res, 201, {
        message: "Application submitted successfully",
        application,
      });
    } catch (err) {
      console.error("Error submitting application:", err);
      return responseReturn(res, 500, { error: "Internal server error" });
    }
  };

  // Get user's job applications by customer ID
  get_user_applications = async (req, res) => {
    try {
      const { page, parPage, customerId } = req.query;

      let skipPage = 0;
      if (parPage && page) {
        skipPage = +parPage * (+page - 1);
      }

      const query = { customerId };

      let applications;
      let totalApplications;

      if (page && parPage) {
        applications = await JobApplication.find(query)
          .populate("jobId", "title location employmentType salaryRange applicationDeadline")
          .sort({ createdAt: -1 })
          .skip(skipPage)
          .limit(+parPage);

        totalApplications = await JobApplication.find(query).countDocuments();
      } else {
        applications = await JobApplication.find(query)
          .populate("jobId", "title location employmentType salaryRange applicationDeadline")
          .sort({ createdAt: -1 });

        totalApplications = applications.length;
      }

      return responseReturn(res, 200, {
        message: "Applications fetched successfully",
        applications,
        totalApplications,
      });
    } catch (err) {
      console.error("Error fetching user applications:", err);
      return responseReturn(res, 500, { error: "Internal server error" });
    }
  };
}

module.exports = new JobApplicationControllers();

