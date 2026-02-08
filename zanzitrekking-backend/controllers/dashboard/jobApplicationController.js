const JobApplication = require("../../models/jobApplication");
const { responseReturn } = require("../../utilities/response");
const emailQueue = require("../../workers/emailQueue");
const {
  generateApplicationAcceptanceEmail,
  generateApplicationRejectionEmail,
} = require("../../utilities/jobApplicationEmailTemplates");

class JobApplicationControllers {
  get_applications = async (req, res) => {
    const {
      page,
      searchValue,
      parPage,
      jobId,
      status,
      sort = "newest-desc",
    } = req.query;
    try {
      // Determine sort order
      let sortOptions = {};
      if (sort === "name-asc") {
        sortOptions = { firstName: 1, lastName: 1 };
      } else if (sort === "name-desc") {
        sortOptions = { firstName: -1, lastName: -1 };
      } else if (sort === "newest-asc") {
        sortOptions = { createdAt: 1 };
      } else {
        sortOptions = { createdAt: -1 };
      }

      let skipPage = "";
      if (parPage && page) {
        skipPage = +parPage * (+page - 1);
      }

      // Build query
      let query = {};
      if (jobId) {
        query.jobId = jobId;
      }
      if (status) {
        query.status = status;
      }
      if (searchValue) {
        query.$or = [
          { firstName: { $regex: searchValue, $options: "i" } },
          { lastName: { $regex: searchValue, $options: "i" } },
          { email: { $regex: searchValue, $options: "i" } },
          { phone: { $regex: searchValue, $options: "i" } },
        ];
      }

      if (page && parPage) {
        const applications = await JobApplication.find(query)
          .populate("jobId", "title location employmentType")
          .populate("reviewedBy", "name email")
          .skip(skipPage)
          .limit(+parPage)
          .sort(sortOptions);

        const totalApplications = await JobApplication.find(query).countDocuments();

        return responseReturn(res, 200, {
          totalApplications,
          applications,
        });
      } else {
        // Get all applications
        const applications = await JobApplication.find(query)
          .populate("jobId", "title location employmentType")
          .populate("reviewedBy", "name email")
          .sort(sortOptions);

        const totalApplications = await JobApplication.find(query).countDocuments();

        return responseReturn(res, 200, {
          totalApplications,
          applications,
          message: "Applications successfully fetched",
        });
      }
    } catch (error) {
      console.error("Error fetching applications:", error);
      return responseReturn(res, 500, { error: "Internal server error" });
    }
  };

  get_application = async (req, res) => {
    const { applicationId } = req.params;
    try {
      const application = await JobApplication.findById(applicationId)
        .populate("jobId", "title description location employmentType salaryRange")
        .populate("reviewedBy", "name email");

      if (!application) {
        return responseReturn(res, 404, { error: "Application not found" });
      }

      return responseReturn(res, 200, {
        message: "Application fetch successful",
        application,
      });
    } catch (error) {
      console.error("Error fetching application:", error);
      return responseReturn(res, 500, { error: "Internal server error" });
    }
  };

  update_application_status = async (req, res) => {
    try {
      const { applicationId } = req.params;
      const { status, adminNotes, rejectedReason } = req.body;

      if (!status) {
        return responseReturn(res, 400, { error: "Status is required" });
      }

      const validStatuses = ["pending", "reviewed", "accepted", "rejected"];
      if (!validStatuses.includes(status)) {
        return responseReturn(res, 400, {
          error: "Invalid status. Must be one of: pending, reviewed, accepted, rejected",
        });
      }

      const application = await JobApplication.findById(applicationId);

      if (!application) {
        return responseReturn(res, 404, { error: "Application not found" });
      }

      // Update application fields
      application.status = status;
      application.reviewedBy = req.user?.id || null;
      application.reviewedAt = new Date();

      // Update admin notes and rejected reason based on status
      if (status === "accepted" || status === "rejected") {
        if (adminNotes) {
          application.adminNotes = adminNotes.trim();
        }
      }

      if (status === "rejected") {
        if (rejectedReason) {
          application.rejectedReason = rejectedReason.trim();
        }
      }

      await application.save();

      await application.populate("jobId", "title location");
      await application.populate("reviewedBy", "name email");

      // Send email notification for accepted or rejected status
      if (status === "accepted" || status === "rejected") {
        try {
          let emailContent;
          let emailSubject;

          if (status === "accepted") {
            emailContent = await generateApplicationAcceptanceEmail(
              application,
              application.adminNotes || ""
            );
            emailSubject = `Congratulations! Your Application Has Been Accepted - ${application.jobId?.title || "Position"}`;
          } else if (status === "rejected") {
            emailContent = await generateApplicationRejectionEmail(
              application,
              application.rejectedReason || "",
              application.adminNotes || ""
            );
            emailSubject = `Update on Your Job Application - ${application.jobId?.title || "Position"}`;
          }

          if (emailContent && emailSubject) {
            emailQueue.add({
              subject: emailSubject,
              content: emailContent,
              recipients: [application.email],
            });
          }
        } catch (emailError) {
          console.error("Error sending email notification:", emailError);
          // Don't fail the request if email fails, just log the error
        }
      }

      return responseReturn(res, 200, {
        message: "Application status updated successfully",
        application,
      });
    } catch (err) {
      console.error("Error updating application status:", err);
      return responseReturn(res, 500, { error: "Internal server error" });
    }
  };

  // Send email to job applicant
  send_email_to_applicant = async (req, res) => {
    try {
      const { applicationId } = req.params;
      const { subject, message } = req.body;

      if (!subject || !message) {
        return responseReturn(res, 400, {
          error: "Subject and message are required",
        });
      }

      const application = await JobApplication.findById(applicationId).populate(
        "jobId",
        "title",
      );

      if (!application) {
        return responseReturn(res, 404, { error: "Application not found" });
      }

      const emailContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; background: #ffffff; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; background: #ffffff; }
            .content { background: #ffffff; padding: 30px; }
            .job-info { background: #ffffff; padding: 20px; margin: 20px 0; border: 1px solid #e0e0e0; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="content">
              <h1 style="color: #333; margin-top: 0;">${subject}</h1>
              
              <p>Dear ${application.firstName} ${application.lastName},</p>
              
              <div class="job-info">
                <h3 style="margin-top: 0; color: #333;">Regarding Your Application:</h3>
                <p><strong>Position:</strong> ${application.jobId?.title || "N/A"}</p>
              </div>

              <div style="background: #ffffff; padding: 20px; margin: 20px 0;">
                ${message}
              </div>

              <p>If you have any questions, please don't hesitate to contact us.</p>
              
              <p>Best regards,<br>The Hiring Team</p>
            </div>
            <div class="footer">
              <p>This is an automated email. Please do not reply to this message.</p>
            </div>
          </div>
        </body>
        </html>
      `;

      emailQueue.add({
        subject: subject,
        content: emailContent,
        recipients: [application.email],
      });

      return responseReturn(res, 200, {
        message: "Email sent successfully to applicant",
      });
    } catch (err) {
      console.error("Error sending email:", err);
      return responseReturn(res, 500, { error: "Internal server error" });
    }
  };
}

module.exports = new JobApplicationControllers();

