const Admin = require("../models/admin");
const logger = require('./logger');
const Trip = require("../models/trip");

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
 * Get category display name
 * @param {string} category - Category key
 * @returns {string} Display name
 */
const getCategoryDisplayName = (category) => {
  const categoryMap = {
    standard: "Budget",
    midRange: "Mid-Range",
    luxury: "Luxury",
  };
  return categoryMap[category] || category;
};

/**
 * Generate request confirmation email HTML (sent when request is created)
 * @param {Object} request - UrgentBookingRequest document (populated)
 * @returns {Promise<string>} HTML email content
 */
const generateRequestConfirmationEmail = async (request) => {
  const customerName = request.personalInfo?.firstName && request.personalInfo?.lastName
    ? `${request.personalInfo.firstName} ${request.personalInfo.lastName}`
    : request.customerId?.name || "Valued Customer";

  const companyInfo = await getCompanyInfo();
  const tripTitle = request.tripTitle || request.tripId?.mainTitle || "Trip";
  const requestedDate = formatDate(request.requestedDate);
  const categoryName = getCategoryDisplayName(request.selectedCategory);

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Availability Request Received</title>
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
                Request Received
              </h1>
              <p style="color: #ffffff; margin: 10px 0 0 0; font-size: 16px;">
                We've received your availability request
              </p>
            </td>
          </tr>
          
          <!-- Info Banner -->
          <tr>
            <td style="background-color: #f5f5f5; padding: 20px; border-left: 4px solid #000000;">
              <p style="margin: 0; color: #000000; font-size: 16px; font-weight: bold;">
                Thank you for your interest! We're reviewing your request.
              </p>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 30px;">
              <p style="font-size: 16px; color: #000000; margin: 0 0 20px; font-weight: bold;">
                Hello ${customerName},
              </p>
              
              <p style="font-size: 14px; color: #333333; margin: 0 0 20px; line-height: 1.6;">
                We have received your availability request for a trip that starts within our standard booking window. Our team is currently reviewing your request and will get back to you as soon as possible.
              </p>

              <!-- Request Details -->
              <div style="background-color: #f5f5f5; border-radius: 8px; padding: 20px; margin: 20px 0; border: 1px solid #e0e0e0;">
                <h2 style="color: #000000; margin: 0 0 15px 0; font-size: 20px; font-weight: bold;">Request Details</h2>
                <table width="100%" cellpadding="5" cellspacing="0">
                  <tr>
                    <td style="color: #333333; font-size: 14px; padding: 5px 0;"><strong>Trip:</strong></td>
                    <td style="color: #000000; font-size: 14px; font-weight: bold; padding: 5px 0;">${tripTitle}</td>
                  </tr>
                  <tr>
                    <td style="color: #333333; font-size: 14px; padding: 5px 0;"><strong>Requested Date:</strong></td>
                    <td style="color: #333333; font-size: 14px; padding: 5px 0;">${requestedDate}</td>
                  </tr>
                  <tr>
                    <td style="color: #333333; font-size: 14px; padding: 5px 0;"><strong>Package Type:</strong></td>
                    <td style="color: #333333; font-size: 14px; padding: 5px 0;">${categoryName}</td>
                  </tr>
                  <tr>
                    <td style="color: #333333; font-size: 14px; padding: 5px 0;"><strong>Travelers:</strong></td>
                    <td style="color: #333333; font-size: 14px; padding: 5px 0;">${request.travelersNumber} ${request.travelersNumber === 1 ? "person" : "people"}</td>
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
                  <li>Our team will review your request and check availability for your requested dates.</li>
                  <li>We typically respond within 24-48 hours.</li>
                  <li>If approved, you will receive an email with instructions to proceed with checkout and payment.</li>
                  <li>If we cannot accommodate your request, we will contact you with alternative options.</li>
                </ul>
              </div>

              <!-- Contact Information -->
              <div style="background-color: #f5f5f5; border-left: 4px solid #000000; padding: 20px; margin: 30px 0; border-radius: 4px;">
                <h2 style="color: #000000; margin: 0 0 15px 0; font-size: 18px; font-weight: bold;">Contact Information</h2>
                <p style="margin: 5px 0; color: #333333; font-size: 14px;"><strong>Email:</strong> <a href="mailto:${companyInfo.email}" style="color: #000000; text-decoration: underline;">${companyInfo.email}</a></p>
                <p style="margin: 5px 0; color: #333333; font-size: 14px;"><strong>Phone:</strong> <a href="tel:${companyInfo.phone}" style="color: #000000; text-decoration: underline;">${companyInfo.phone}</a></p>
                ${companyInfo.address ? `<p style="margin: 5px 0; color: #333333; font-size: 14px;"><strong>Address:</strong> ${companyInfo.address}</p>` : ""}
                <p style="margin: 15px 0 0 0; color: #666666; font-size: 13px; line-height: 1.6;">
                  If you have any questions or need to modify your request, please don't hesitate to contact us.
                </p>
              </div>

              <p style="font-size: 14px; color: #666666; margin: 30px 0 0 0; padding-top: 20px; border-top: 1px solid #e0e0e0; line-height: 1.6;">
                Thank you for your patience. We look forward to making your travel dreams come true!
              </p>

              <p style="font-size: 14px; color: #000000; margin: 15px 0 0 0; font-weight: bold;">
                Best regards,<br>
                The Zanzi Trekking & Safaris Team
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

/**
 * Generate request approval email HTML (sent when request is approved)
 * @param {Object} request - UrgentBookingRequest document (populated)
 * @param {string} checkoutUrl - URL to proceed to checkout
 * @returns {Promise<string>} HTML email content
 */
const generateRequestApprovalEmail = async (request, checkoutUrl) => {
  const customerName = request.personalInfo?.firstName && request.personalInfo?.lastName
    ? `${request.personalInfo.firstName} ${request.personalInfo.lastName}`
    : request.customerId?.name || "Valued Customer";

  const companyInfo = await getCompanyInfo();
  const tripTitle = request.tripTitle || request.tripId?.mainTitle || "Trip";
  const requestedDate = formatDate(request.requestedDate);
  const categoryName = getCategoryDisplayName(request.selectedCategory);

  return {
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Availability Request Approved</title>
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
                Request Approved!
              </h1>
              <p style="color: #ffffff; margin: 10px 0 0 0; font-size: 16px;">
                You can now proceed with booking
              </p>
            </td>
          </tr>
          
          <!-- Success Banner -->
          <tr>
            <td style="background-color: #f5f5f5; padding: 20px; border-left: 4px solid #000000;">
              <p style="margin: 0; color: #000000; font-size: 16px; font-weight: bold;">
                Great news! Your availability request has been approved.
              </p>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 30px;">
              <p style="font-size: 16px; color: #000000; margin: 0 0 20px; font-weight: bold;">
                Hello ${customerName},
              </p>
              
              <p style="font-size: 14px; color: #333333; margin: 0 0 20px; line-height: 1.6;">
                We're excited to inform you that your availability request has been approved! We have confirmed availability for your requested dates and you can now proceed with checkout and payment.
              </p>

              <!-- Request Details -->
              <div style="background-color: #f5f5f5; border-radius: 8px; padding: 20px; margin: 20px 0; border: 1px solid #e0e0e0;">
                <h2 style="color: #000000; margin: 0 0 15px 0; font-size: 20px; font-weight: bold;">Approved Request Details</h2>
                <table width="100%" cellpadding="5" cellspacing="0">
                  <tr>
                    <td style="color: #333333; font-size: 14px; padding: 5px 0;"><strong>Trip:</strong></td>
                    <td style="color: #000000; font-size: 14px; font-weight: bold; padding: 5px 0;">${tripTitle}</td>
                  </tr>
                  <tr>
                    <td style="color: #333333; font-size: 14px; padding: 5px 0;"><strong>Requested Date:</strong></td>
                    <td style="color: #333333; font-size: 14px; padding: 5px 0;">${requestedDate}</td>
                  </tr>
                  <tr>
                    <td style="color: #333333; font-size: 14px; padding: 5px 0;"><strong>Package Type:</strong></td>
                    <td style="color: #333333; font-size: 14px; padding: 5px 0;">${categoryName}</td>
                  </tr>
                  <tr>
                    <td style="color: #333333; font-size: 14px; padding: 5px 0;"><strong>Travelers:</strong></td>
                    <td style="color: #333333; font-size: 14px; padding: 5px 0;">${request.travelersNumber} ${request.travelersNumber === 1 ? "person" : "people"}</td>
                  </tr>
                  <tr>
                    <td style="color: #333333; font-size: 14px; padding: 5px 0;"><strong>Status:</strong></td>
                    <td style="color: #4caf50; font-size: 14px; padding: 5px 0; font-weight: bold;">Approved</td>
                  </tr>
                </table>
              </div>

              <!-- CTA Button -->
              <div style="text-align: center; margin: 30px 0;">
                <a href="${checkoutUrl}" style="display: inline-block; background-color: #000000; color: #ffffff; padding: 15px 40px; text-decoration: none; border-radius: 5px; font-size: 16px; font-weight: bold; margin: 10px 0;">
                  Proceed to Checkout
                </a>
              </div>

              <p style="font-size: 14px; color: #666666; margin: 20px 0; text-align: center; line-height: 1.6;">
                Click the button above to complete your booking and payment. This approval is valid for your requested trip and dates.
              </p>

              ${request.adminNotes ? `
              <!-- Admin Notes -->
              <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 4px;">
                <p style="margin: 0 0 5px 0; color: #856404; font-size: 13px; font-weight: bold;">Note from our team:</p>
                <p style="margin: 0; color: #856404; font-size: 13px; line-height: 1.6;">${request.adminNotes}</p>
              </div>
              ` : ""}

              <!-- Important Information -->
              <div style="margin: 30px 0;">
                <h2 style="color: #000000; margin: 0 0 15px 0; font-size: 18px; font-weight: bold;">Important Information</h2>
                <ul style="margin: 0; padding-left: 20px; color: #333333; font-size: 14px; line-height: 1.8;">
                  <li>Please complete your booking within 48 hours to secure your spot.</li>
                  <li>Your approval is specific to the trip, date, and package type requested.</li>
                  <li>If you need to make changes, please contact us before completing payment.</li>
                  <li>Once payment is confirmed, you will receive a booking confirmation email.</li>
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
                We're excited to have you join us for this amazing adventure!
              </p>

              <p style="font-size: 14px; color: #000000; margin: 15px 0 0 0; font-weight: bold;">
                Best regards,<br>
                The Zanzi Trekking & Safaris Team
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
    `,
    attachment: null,
  };
};

/**
 * Generate request rejection email HTML (sent when request is rejected)
 * @param {Object} request - UrgentBookingRequest document (populated)
 * @returns {Promise<string>} HTML email content
 */
const generateRequestRejectionEmail = async (request) => {
  const customerName = request.personalInfo?.firstName && request.personalInfo?.lastName
    ? `${request.personalInfo.firstName} ${request.personalInfo.lastName}`
    : request.customerId?.name || "Valued Customer";

  const companyInfo = await getCompanyInfo();
  const tripTitle = request.tripTitle || request.tripId?.mainTitle || "Trip";
  const requestedDate = formatDate(request.requestedDate);
  const categoryName = getCategoryDisplayName(request.selectedCategory);

  return {
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Availability Request Update</title>
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
                Request Update
              </h1>
              <p style="color: #ffffff; margin: 10px 0 0 0; font-size: 16px;">
                Regarding your availability request
              </p>
            </td>
          </tr>
          
          <!-- Alert Banner -->
          <tr>
            <td style="background-color: #f5f5f5; padding: 20px; border-left: 4px solid #000000;">
              <p style="margin: 0; color: #000000; font-size: 16px; font-weight: bold;">
                We regret to inform you that we cannot accommodate your request at this time.
              </p>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 30px;">
              <p style="font-size: 16px; color: #000000; margin: 0 0 20px; font-weight: bold;">
                Hello ${customerName},
              </p>
              
              <p style="font-size: 14px; color: #333333; margin: 0 0 20px; line-height: 1.6;">
                Thank you for your interest in booking with us. Unfortunately, we are unable to accommodate your availability request for the dates you specified. We sincerely apologize for any inconvenience this may cause.
              </p>

              <!-- Request Details -->
              <div style="background-color: #f5f5f5; border-radius: 8px; padding: 20px; margin: 20px 0; border: 1px solid #e0e0e0;">
                <h2 style="color: #000000; margin: 0 0 15px 0; font-size: 20px; font-weight: bold;">Request Details</h2>
                <table width="100%" cellpadding="5" cellspacing="0">
                  <tr>
                    <td style="color: #333333; font-size: 14px; padding: 5px 0;"><strong>Trip:</strong></td>
                    <td style="color: #000000; font-size: 14px; font-weight: bold; padding: 5px 0;">${tripTitle}</td>
                  </tr>
                  <tr>
                    <td style="color: #333333; font-size: 14px; padding: 5px 0;"><strong>Requested Date:</strong></td>
                    <td style="color: #333333; font-size: 14px; padding: 5px 0;">${requestedDate}</td>
                  </tr>
                  <tr>
                    <td style="color: #333333; font-size: 14px; padding: 5px 0;"><strong>Package Type:</strong></td>
                    <td style="color: #333333; font-size: 14px; padding: 5px 0;">${categoryName}</td>
                  </tr>
                  <tr>
                    <td style="color: #333333; font-size: 14px; padding: 5px 0;"><strong>Travelers:</strong></td>
                    <td style="color: #333333; font-size: 14px; padding: 5px 0;">${request.travelersNumber} ${request.travelersNumber === 1 ? "person" : "people"}</td>
                  </tr>
                  <tr>
                    <td style="color: #333333; font-size: 14px; padding: 5px 0;"><strong>Status:</strong></td>
                    <td style="color: #f44336; font-size: 14px; padding: 5px 0; font-weight: bold;">Not Available</td>
                  </tr>
                </table>
              </div>

              ${request.rejectedReason ? `
              <!-- Rejection Reason -->
              <div style="background-color: #ffebee; border-left: 4px solid #f44336; padding: 15px; margin: 20px 0; border-radius: 4px;">
                <p style="margin: 0 0 5px 0; color: #c62828; font-size: 13px; font-weight: bold;">Reason:</p>
                <p style="margin: 0; color: #c62828; font-size: 13px; line-height: 1.6;">${request.rejectedReason}</p>
              </div>
              ` : ""}

              <!-- Alternative Options -->
              <div style="margin: 30px 0;">
                <h2 style="color: #000000; margin: 0 0 15px 0; font-size: 18px; font-weight: bold;">Alternative Options</h2>
                <p style="font-size: 14px; color: #333333; margin: 0 0 15px; line-height: 1.6;">
                  We'd love to help you find an alternative that works for you:
                </p>
                <ul style="margin: 0; padding-left: 20px; color: #333333; font-size: 14px; line-height: 1.8;">
                  <li>Consider booking for dates that are further in advance (4+ days for Safaris, 1+ day for other trips).</li>
                  <li>Contact us to discuss alternative dates or similar trips that may be available.</li>
                  <li>Browse our website for other exciting trips that might interest you.</li>
                </ul>
              </div>

              <!-- Contact Information -->
              <div style="background-color: #f5f5f5; border-left: 4px solid #000000; padding: 20px; margin: 30px 0; border-radius: 4px;">
                <h2 style="color: #000000; margin: 0 0 15px 0; font-size: 18px; font-weight: bold;">We're Here to Help</h2>
                <p style="margin: 5px 0; color: #333333; font-size: 14px;"><strong>Email:</strong> <a href="mailto:${companyInfo.email}" style="color: #000000; text-decoration: underline;">${companyInfo.email}</a></p>
                <p style="margin: 5px 0; color: #333333; font-size: 14px;"><strong>Phone:</strong> <a href="tel:${companyInfo.phone}" style="color: #000000; text-decoration: underline;">${companyInfo.phone}</a></p>
                ${companyInfo.address ? `<p style="margin: 5px 0; color: #333333; font-size: 14px;"><strong>Address:</strong> ${companyInfo.address}</p>` : ""}
                <p style="margin: 15px 0 0 0; color: #666666; font-size: 13px; line-height: 1.6;">
                  Our team is available to help you find the perfect alternative. Please don't hesitate to reach out if you have any questions or would like to explore other options.
                </p>
              </div>

              <p style="font-size: 14px; color: #666666; margin: 30px 0 0 0; padding-top: 20px; border-top: 1px solid #e0e0e0; line-height: 1.6;">
                We apologize for any inconvenience and hope to serve you in the future.
              </p>

              <p style="font-size: 14px; color: #000000; margin: 15px 0 0 0; font-weight: bold;">
                Best regards,<br>
                The Zanzi Trekking & Safaris Team
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
    `,
    attachment: null,
  };
};

/**
 * Generate admin notification email HTML (sent to notifications@zanzisafaris.com when request is created)
 * @param {Object} request - UrgentBookingRequest document (populated)
 * @returns {Promise<string>} HTML email content
 */
const generateAdminNotificationEmail = async (request) => {
  const customerName = request.personalInfo?.firstName && request.personalInfo?.lastName
    ? `${request.personalInfo.firstName} ${request.personalInfo.lastName}`
    : request.customerId?.name || "Unknown Customer";

  const customerEmail = request.personalInfo?.email || request.customerId?.email || "N/A";
  const customerPhone = request.personalInfo?.phone || "N/A";
  
  const tripTitle = request.tripTitle || request.tripId?.mainTitle || "Trip";
  const requestedDate = formatDate(request.requestedDate);
  const categoryName = getCategoryDisplayName(request.selectedCategory);
  
  const billingAddress = request.billingAddress || {};
  const fullAddress = [
    billingAddress.street,
    billingAddress.city,
    billingAddress.state,
    billingAddress.zip,
    billingAddress.country
  ].filter(Boolean).join(", ") || "N/A";

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Availability Request</title>
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
                New Availability Request
              </h1>
              <p style="color: #ffffff; margin: 10px 0 0 0; font-size: 16px;">
                A customer has submitted an availability request
              </p>
            </td>
          </tr>
          
          <!-- Alert Banner -->
          <tr>
            <td style="background-color: #fff3cd; padding: 20px; border-left: 4px solid #ffc107;">
              <p style="margin: 0; color: #856404; font-size: 16px; font-weight: bold;">
                ⚠️ Action Required: Review this availability request
              </p>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 30px;">
              <p style="font-size: 16px; color: #000000; margin: 0 0 20px; font-weight: bold;">
                Hello Team,
              </p>
              
              <p style="font-size: 14px; color: #333333; margin: 0 0 20px; line-height: 1.6;">
                A new availability request has been submitted and requires your review. Please see the details below:
              </p>

              <!-- Customer Information -->
              <div style="background-color: #f5f5f5; border-radius: 8px; padding: 20px; margin: 20px 0; border: 1px solid #e0e0e0;">
                <h2 style="color: #000000; margin: 0 0 15px 0; font-size: 20px; font-weight: bold;">Customer Information</h2>
                <table width="100%" cellpadding="5" cellspacing="0">
                  <tr>
                    <td style="color: #333333; font-size: 14px; padding: 5px 0; width: 40%;"><strong>Name:</strong></td>
                    <td style="color: #000000; font-size: 14px; font-weight: bold; padding: 5px 0;">${customerName}</td>
                  </tr>
                  <tr>
                    <td style="color: #333333; font-size: 14px; padding: 5px 0;"><strong>Email:</strong></td>
                    <td style="color: #333333; font-size: 14px; padding: 5px 0;"><a href="mailto:${customerEmail}" style="color: #000000; text-decoration: underline;">${customerEmail}</a></td>
                  </tr>
                  <tr>
                    <td style="color: #333333; font-size: 14px; padding: 5px 0;"><strong>Phone:</strong></td>
                    <td style="color: #333333; font-size: 14px; padding: 5px 0;"><a href="tel:${customerPhone}" style="color: #000000; text-decoration: underline;">${customerPhone}</a></td>
                  </tr>
                  <tr>
                    <td style="color: #333333; font-size: 14px; padding: 5px 0; vertical-align: top;"><strong>Billing Address:</strong></td>
                    <td style="color: #333333; font-size: 14px; padding: 5px 0;">${fullAddress}</td>
                  </tr>
                </table>
              </div>

              <!-- Trip Information -->
              <div style="background-color: #f5f5f5; border-radius: 8px; padding: 20px; margin: 20px 0; border: 1px solid #e0e0e0;">
                <h2 style="color: #000000; margin: 0 0 15px 0; font-size: 20px; font-weight: bold;">Trip & Booking Details</h2>
                <table width="100%" cellpadding="5" cellspacing="0">
                  <tr>
                    <td style="color: #333333; font-size: 14px; padding: 5px 0; width: 40%;"><strong>Trip:</strong></td>
                    <td style="color: #000000; font-size: 14px; font-weight: bold; padding: 5px 0;">${tripTitle}</td>
                  </tr>
                  <tr>
                    <td style="color: #333333; font-size: 14px; padding: 5px 0;"><strong>Requested Date:</strong></td>
                    <td style="color: #333333; font-size: 14px; padding: 5px 0; font-weight: bold;">${requestedDate}</td>
                  </tr>
                  <tr>
                    <td style="color: #333333; font-size: 14px; padding: 5px 0;"><strong>Package Type:</strong></td>
                    <td style="color: #333333; font-size: 14px; padding: 5px 0;">${categoryName}</td>
                  </tr>
                  <tr>
                    <td style="color: #333333; font-size: 14px; padding: 5px 0;"><strong>Number of Travelers:</strong></td>
                    <td style="color: #333333; font-size: 14px; padding: 5px 0;">${request.travelersNumber} ${request.travelersNumber === 1 ? "person" : "people"}</td>
                  </tr>
                  <tr>
                    <td style="color: #333333; font-size: 14px; padding: 5px 0;"><strong>Request ID:</strong></td>
                    <td style="color: #333333; font-size: 14px; padding: 5px 0; font-family: monospace;">${request._id}</td>
                  </tr>
                  <tr>
                    <td style="color: #333333; font-size: 14px; padding: 5px 0;"><strong>Status:</strong></td>
                    <td style="color: #ff9800; font-size: 14px; padding: 5px 0; font-weight: bold;">Pending Review</td>
                  </tr>
                </table>
              </div>

              <!-- Action Required -->
              <div style="background-color: #e3f2fd; border-left: 4px solid #2196f3; padding: 20px; margin: 30px 0; border-radius: 4px;">
                <h2 style="color: #000000; margin: 0 0 10px 0; font-size: 18px; font-weight: bold;">Next Steps</h2>
                <p style="margin: 0; color: #333333; font-size: 14px; line-height: 1.6;">
                  Please review this availability request in the admin dashboard and either approve or reject it. The customer is waiting for your response.
                </p>
              </div>

              <p style="font-size: 14px; color: #666666; margin: 30px 0 0 0; padding-top: 20px; border-top: 1px solid #e0e0e0; line-height: 1.6;">
                This is an automated notification. Please log into the admin dashboard to review and respond to this request.
              </p>

              <p style="font-size: 14px; color: #000000; margin: 15px 0 0 0; font-weight: bold;">
                Best regards,<br>
                Zanzi Trekking & Safaris System
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

module.exports = {
  generateRequestConfirmationEmail,
  generateRequestApprovalEmail,
  generateRequestRejectionEmail,
  generateAdminNotificationEmail,
};

