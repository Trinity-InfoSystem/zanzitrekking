const Admin = require("../models/admin");
const logger = require('./logger');
const Job = require("../models/job");

/**
 * Get company contact information
 * @returns {Promise<Object>} Company info object
 */
const getCompanyInfo = async () => {
  try {
    const admin = await Admin.findOne().select(
      "companyAddress companyEmail companyPhoneNumber"
    );
    return {
      email: admin?.companyEmail || "info@zanzisafaris.com",
      phone: admin?.companyPhoneNumber || "+255 752 777 701",
      address: admin?.companyAddress || "Zanzibar, Tanzania",
    };
  } catch (error) {
    logger.error("Error fetching company info:", error);
    return {
      email: "info@zanzisafaris.com",
      phone: "+255 752 777 701",
      address: "Zanzibar, Tanzania",
    };
  }
};

/**
 * Format date to readable string
 * @param {Date} date - Date object
 * @returns {string} Formatted date string
 */
const formatDate = (date) => {
  if (!date) return "N/A";
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

/**
 * Generate job application acceptance email HTML
 * @param {Object} application - JobApplication document (populated)
 * @param {string} adminNotes - Optional admin notes
 * @returns {Promise<string>} HTML email content
 */
const generateApplicationAcceptanceEmail = async (application, adminNotes = "") => {
  const applicantName = `${application.firstName} ${application.lastName}`;
  const companyInfo = await getCompanyInfo();
  const jobTitle = application.jobId?.title || "Position";
  const appliedDate = formatDate(application.createdAt);

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Application Accepted</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); border: 1px solid #e0e0e0;">
          <!-- Header -->
          <tr>
            <td style="background-color: #4caf50; padding: 30px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold;">
                Congratulations!
              </h1>
              <p style="color: #ffffff; margin: 10px 0 0 0; font-size: 16px;">
                Your application has been accepted
              </p>
            </td>
          </tr>
          
          <!-- Success Banner -->
          <tr>
            <td style="background-color: #e8f5e9; padding: 20px; border-left: 4px solid #4caf50;">
              <p style="margin: 0; color: #2e7d32; font-size: 16px; font-weight: bold;">
                We're excited to inform you that your application has been accepted!
              </p>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 30px;">
              <p style="font-size: 16px; color: #000000; margin: 0 0 20px; font-weight: bold;">
                Hello ${applicantName},
              </p>
              
              <p style="font-size: 14px; color: #333333; margin: 0 0 20px; line-height: 1.6;">
                We are delighted to inform you that after careful consideration of your application, we would like to offer you the position. We were impressed with your qualifications and believe you would be a valuable addition to our team.
              </p>

              <!-- Application Details -->
              <div style="background-color: #f5f5f5; border-radius: 8px; padding: 20px; margin: 20px 0; border: 1px solid #e0e0e0;">
                <h2 style="color: #000000; margin: 0 0 15px 0; font-size: 20px; font-weight: bold;">Application Details</h2>
                <table width="100%" cellpadding="5" cellspacing="0">
                  <tr>
                    <td style="color: #333333; font-size: 14px; padding: 5px 0;"><strong>Position:</strong></td>
                    <td style="color: #000000; font-size: 14px; font-weight: bold; padding: 5px 0;">${jobTitle}</td>
                  </tr>
                  <tr>
                    <td style="color: #333333; font-size: 14px; padding: 5px 0;"><strong>Application Date:</strong></td>
                    <td style="color: #333333; font-size: 14px; padding: 5px 0;">${appliedDate}</td>
                  </tr>
                  <tr>
                    <td style="color: #333333; font-size: 14px; padding: 5px 0;"><strong>Status:</strong></td>
                    <td style="color: #4caf50; font-size: 14px; padding: 5px 0; font-weight: bold;">Accepted</td>
                  </tr>
                </table>
              </div>

              ${adminNotes ? `
              <!-- Admin Notes -->
              <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 4px;">
                <p style="margin: 0 0 5px 0; color: #856404; font-size: 13px; font-weight: bold;">Additional Information:</p>
                <p style="margin: 0; color: #856404; font-size: 13px; line-height: 1.6;">${adminNotes}</p>
              </div>
              ` : ""}

              <!-- Next Steps -->
              <div style="margin: 30px 0;">
                <h2 style="color: #000000; margin: 0 0 15px 0; font-size: 18px; font-weight: bold;">What Happens Next?</h2>
                <ul style="margin: 0; padding-left: 20px; color: #333333; font-size: 14px; line-height: 1.8;">
                  <li>Our HR team will contact you shortly to discuss the next steps, including onboarding details and start date.</li>
                  <li>Please be prepared to provide any additional documentation we may need.</li>
                  <li>If you have any questions or need clarification, please don't hesitate to reach out to us.</li>
                </ul>
              </div>

              <!-- Contact Information -->
              <div style="background-color: #f5f5f5; border-left: 4px solid #000000; padding: 20px; margin: 30px 0; border-radius: 4px;">
                <h2 style="color: #000000; margin: 0 0 15px 0; font-size: 18px; font-weight: bold;">Contact Information</h2>
                <p style="margin: 5px 0; color: #333333; font-size: 14px;"><strong>Email:</strong> <a href="mailto:${companyInfo.email}" style="color: #000000; text-decoration: underline;">${companyInfo.email}</a></p>
                <p style="margin: 5px 0; color: #333333; font-size: 14px;"><strong>Phone:</strong> <a href="tel:${companyInfo.phone}" style="color: #000000; text-decoration: underline;">${companyInfo.phone}</a></p>
                ${companyInfo.address ? `<p style="margin: 5px 0; color: #333333; font-size: 14px;"><strong>Address:</strong> ${companyInfo.address}</p>` : ""}
              </div>

              <p style="font-size: 14px; color: #666666; margin: 30px 0 0 0; padding-top: 20px; border-top: 1px solid #e0e0e0; line-height: 1.6;">
                We look forward to welcoming you to our team and working together!
              </p>

              <p style="font-size: 14px; color: #000000; margin: 15px 0 0 0; font-weight: bold;">
                Best regards,<br>
                The Zanzi Trekking & Safaris Hiring Team
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f5f5f5; padding: 20px; text-align: center; border-top: 1px solid #e0e0e0;">
              <p style="font-size: 12px; color: #666666; margin: 0 0 10px;">
                © ${new Date().getFullYear()} Zanzi Trekking & Safaris. All rights reserved.
              </p>
              <p style="font-size: 12px; color: #999999; margin: 0;">
                This is an automated notification email. Please do not reply to this email.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
};

/**
 * Generate job application rejection email HTML
 * @param {Object} application - JobApplication document (populated)
 * @param {string} rejectedReason - Rejection reason
 * @param {string} adminNotes - Optional admin notes
 * @returns {Promise<string>} HTML email content
 */
const generateApplicationRejectionEmail = async (application, rejectedReason = "", adminNotes = "") => {
  const applicantName = `${application.firstName} ${application.lastName}`;
  const companyInfo = await getCompanyInfo();
  const jobTitle = application.jobId?.title || "Position";
  const appliedDate = formatDate(application.createdAt);

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Application Update</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); border: 1px solid #e0e0e0;">
          <!-- Header -->
          <tr>
            <td style="background-color: #000000; padding: 30px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold;">
                Application Update
              </h1>
              <p style="color: #ffffff; margin: 10px 0 0 0; font-size: 16px;">
                Regarding your job application
              </p>
            </td>
          </tr>
          
          <!-- Alert Banner -->
          <tr>
            <td style="background-color: #ffebee; padding: 20px; border-left: 4px solid #f44336;">
              <p style="margin: 0; color: #c62828; font-size: 16px; font-weight: bold;">
                Thank you for your interest in joining our team.
              </p>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 30px;">
              <p style="font-size: 16px; color: #000000; margin: 0 0 20px; font-weight: bold;">
                Hello ${applicantName},
              </p>
              
              <p style="font-size: 14px; color: #333333; margin: 0 0 20px; line-height: 1.6;">
                Thank you for taking the time to apply for the position at Zanzi Trekking & Safaris. We appreciate your interest in joining our team and the effort you put into your application.
              </p>

              <p style="font-size: 14px; color: #333333; margin: 0 0 20px; line-height: 1.6;">
                After careful consideration, we regret to inform you that we have decided to move forward with other candidates whose qualifications more closely match our current needs for this position.
              </p>

              <!-- Application Details -->
              <div style="background-color: #f5f5f5; border-radius: 8px; padding: 20px; margin: 20px 0; border: 1px solid #e0e0e0;">
                <h2 style="color: #000000; margin: 0 0 15px 0; font-size: 20px; font-weight: bold;">Application Details</h2>
                <table width="100%" cellpadding="5" cellspacing="0">
                  <tr>
                    <td style="color: #333333; font-size: 14px; padding: 5px 0;"><strong>Position:</strong></td>
                    <td style="color: #000000; font-size: 14px; font-weight: bold; padding: 5px 0;">${jobTitle}</td>
                  </tr>
                  <tr>
                    <td style="color: #333333; font-size: 14px; padding: 5px 0;"><strong>Application Date:</strong></td>
                    <td style="color: #333333; font-size: 14px; padding: 5px 0;">${appliedDate}</td>
                  </tr>
                  <tr>
                    <td style="color: #333333; font-size: 14px; padding: 5px 0;"><strong>Status:</strong></td>
                    <td style="color: #f44336; font-size: 14px; padding: 5px 0; font-weight: bold;">Not Selected</td>
                  </tr>
                </table>
              </div>

              ${rejectedReason ? `
              <!-- Rejection Reason -->
              <div style="background-color: #ffebee; border-left: 4px solid #f44336; padding: 15px; margin: 20px 0; border-radius: 4px;">
                <p style="margin: 0 0 5px 0; color: #c62828; font-size: 13px; font-weight: bold;">Reason:</p>
                <p style="margin: 0; color: #c62828; font-size: 13px; line-height: 1.6;">${rejectedReason}</p>
              </div>
              ` : ""}

              ${adminNotes ? `
              <!-- Admin Notes -->
              <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 4px;">
                <p style="margin: 0 0 5px 0; color: #856404; font-size: 13px; font-weight: bold;">Additional Notes:</p>
                <p style="margin: 0; color: #856404; font-size: 13px; line-height: 1.6;">${adminNotes}</p>
              </div>
              ` : ""}

              <!-- Encouragement -->
              <div style="margin: 30px 0;">
                <h2 style="color: #000000; margin: 0 0 15px 0; font-size: 18px; font-weight: bold;">Keep in Touch</h2>
                <p style="font-size: 14px; color: #333333; margin: 0 0 15px; line-height: 1.6;">
                  We encourage you to continue exploring opportunities with us. We keep all applications on file and may contact you if a position that better matches your qualifications becomes available.
                </p>
                <ul style="margin: 0; padding-left: 20px; color: #333333; font-size: 14px; line-height: 1.8;">
                  <li>Visit our careers page regularly for new openings</li>
                  <li>Follow us on social media for company updates</li>
                  <li>Feel free to apply for other positions that interest you</li>
                </ul>
              </div>

              <!-- Contact Information -->
              <div style="background-color: #f5f5f5; border-left: 4px solid #000000; padding: 20px; margin: 30px 0; border-radius: 4px;">
                <h2 style="color: #000000; margin: 0 0 15px 0; font-size: 18px; font-weight: bold;">Contact Information</h2>
                <p style="margin: 5px 0; color: #333333; font-size: 14px;"><strong>Email:</strong> <a href="mailto:${companyInfo.email}" style="color: #000000; text-decoration: underline;">${companyInfo.email}</a></p>
                <p style="margin: 5px 0; color: #333333; font-size: 14px;"><strong>Phone:</strong> <a href="tel:${companyInfo.phone}" style="color: #000000; text-decoration: underline;">${companyInfo.phone}</a></p>
                ${companyInfo.address ? `<p style="margin: 5px 0; color: #333333; font-size: 14px;"><strong>Address:</strong> ${companyInfo.address}</p>` : ""}
              </div>

              <p style="font-size: 14px; color: #666666; margin: 30px 0 0 0; padding-top: 20px; border-top: 1px solid #e0e0e0; line-height: 1.6;">
                We wish you the best of luck in your job search and thank you again for your interest in Zanzi Trekking & Safaris.
              </p>

              <p style="font-size: 14px; color: #000000; margin: 15px 0 0 0; font-weight: bold;">
                Best regards,<br>
                The Zanzi Trekking & Safaris Hiring Team
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f5f5f5; padding: 20px; text-align: center; border-top: 1px solid #e0e0e0;">
              <p style="font-size: 12px; color: #666666; margin: 0 0 10px;">
                © ${new Date().getFullYear()} Zanzi Trekking & Safaris. All rights reserved.
              </p>
              <p style="font-size: 12px; color: #999999; margin: 0;">
                This is an automated notification email. Please do not reply to this email.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
};

/**
 * Generate job application confirmation email HTML (sent when application is submitted)
 * @param {Object} application - JobApplication document (populated)
 * @param {Object} job - Job document
 * @returns {Promise<string>} HTML email content
 */
const generateApplicationConfirmationEmail = async (application, job) => {
  const applicantName = `${application.firstName} ${application.lastName}`;
  const companyInfo = await getCompanyInfo();
  const jobTitle = job?.title || "Position";
  const jobLocation = job?.location || "";
  const appliedDate = formatDate(application.createdAt || new Date());

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Application Received</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); border: 1px solid #e0e0e0;">
          <!-- Header -->
          <tr>
            <td style="background-color: #000000; padding: 30px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold;">
                Application Received
              </h1>
              <p style="color: #ffffff; margin: 10px 0 0 0; font-size: 16px;">
                We've received your job application
              </p>
            </td>
          </tr>
          
          <!-- Info Banner -->
          <tr>
            <td style="background-color: #f5f5f5; padding: 20px; border-left: 4px solid #000000;">
              <p style="margin: 0; color: #000000; font-size: 16px; font-weight: bold;">
                Thank you for your interest! We're reviewing your application.
              </p>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 30px;">
              <p style="font-size: 16px; color: #000000; margin: 0 0 20px; font-weight: bold;">
                Hello ${applicantName},
              </p>
              
              <p style="font-size: 14px; color: #333333; margin: 0 0 20px; line-height: 1.6;">
                Thank you for your interest in joining our team! We have successfully received your job application. Our team is currently reviewing your application and will get back to you as soon as possible.
              </p>

              <!-- Application Details -->
              <div style="background-color: #f5f5f5; border-radius: 8px; padding: 20px; margin: 20px 0; border: 1px solid #e0e0e0;">
                <h2 style="color: #000000; margin: 0 0 15px 0; font-size: 20px; font-weight: bold;">Application Details</h2>
                <table width="100%" cellpadding="5" cellspacing="0">
                  <tr>
                    <td style="color: #333333; font-size: 14px; padding: 5px 0;"><strong>Position:</strong></td>
                    <td style="color: #000000; font-size: 14px; font-weight: bold; padding: 5px 0;">${jobTitle}</td>
                  </tr>
                  ${jobLocation ? `
                  <tr>
                    <td style="color: #333333; font-size: 14px; padding: 5px 0;"><strong>Location:</strong></td>
                    <td style="color: #333333; font-size: 14px; padding: 5px 0;">${jobLocation}</td>
                  </tr>
                  ` : ""}
                  <tr>
                    <td style="color: #333333; font-size: 14px; padding: 5px 0;"><strong>Application Date:</strong></td>
                    <td style="color: #333333; font-size: 14px; padding: 5px 0;">${appliedDate}</td>
                  </tr>
                  <tr>
                    <td style="color: #333333; font-size: 14px; padding: 5px 0;"><strong>Status:</strong></td>
                    <td style="color: #ff9800; font-size: 14px; padding: 5px 0; font-weight: bold;">Pending Review</td>
                  </tr>
                </table>
              </div>

              <!-- Next Steps -->
              <div style="margin: 30px 0;">
                <h2 style="color: #000000; margin: 0 0 15px 0; font-size: 18px; font-weight: bold;">What Happens Next?</h2>
                <ul style="margin: 0; padding-left: 20px; color: #333333; font-size: 14px; line-height: 1.8;">
                  <li>Our hiring team will carefully review your application and qualifications.</li>
                  <li>We typically review applications within 5-7 business days.</li>
                  <li>If your application matches our requirements, we will contact you for the next steps.</li>
                  <li>You will receive an email notification once a decision has been made.</li>
                </ul>
              </div>

              <!-- Contact Information -->
              <div style="background-color: #f5f5f5; border-left: 4px solid #000000; padding: 20px; margin: 30px 0; border-radius: 4px;">
                <h2 style="color: #000000; margin: 0 0 15px 0; font-size: 18px; font-weight: bold;">Contact Information</h2>
                <p style="margin: 5px 0; color: #333333; font-size: 14px;"><strong>Email:</strong> <a href="mailto:${companyInfo.email}" style="color: #000000; text-decoration: underline;">${companyInfo.email}</a></p>
                <p style="margin: 5px 0; color: #333333; font-size: 14px;"><strong>Phone:</strong> <a href="tel:${companyInfo.phone}" style="color: #000000; text-decoration: underline;">${companyInfo.phone}</a></p>
                ${companyInfo.address ? `<p style="margin: 5px 0; color: #333333; font-size: 14px;"><strong>Address:</strong> ${companyInfo.address}</p>` : ""}
                <p style="margin: 15px 0 0 0; color: #666666; font-size: 13px; line-height: 1.6;">
                  If you have any questions about your application or need to provide additional information, please don't hesitate to contact us.
                </p>
              </div>

              <p style="font-size: 14px; color: #666666; margin: 30px 0 0 0; padding-top: 20px; border-top: 1px solid #e0e0e0; line-height: 1.6;">
                We appreciate your patience during this process and look forward to potentially working with you!
              </p>

              <p style="font-size: 14px; color: #000000; margin: 15px 0 0 0; font-weight: bold;">
                Best regards,<br>
                The Zanzi Trekking & Safaris Hiring Team
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f5f5f5; padding: 20px; text-align: center; border-top: 1px solid #e0e0e0;">
              <p style="font-size: 12px; color: #666666; margin: 0 0 10px;">
                © ${new Date().getFullYear()} Zanzi Trekking & Safaris. All rights reserved.
              </p>
              <p style="font-size: 12px; color: #999999; margin: 0;">
                This is an automated confirmation email. Please do not reply to this email.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
};

module.exports = {
  generateApplicationConfirmationEmail,
  generateApplicationAcceptanceEmail,
  generateApplicationRejectionEmail,
};
