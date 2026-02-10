const QRCode = require("qrcode");
const Admin = require("../models/admin");
const Trip = require("../models/trip");

/**
 * Generate QR code buffer from text (for email attachment)
 * @param {string} text - Text to encode in QR code
 * @returns {Promise<Buffer>} Buffer of QR code image
 */
const generateQRCodeBuffer = async (text) => {
  try {
    const qrBuffer = await QRCode.toBuffer(text, {
      errorCorrectionLevel: "H",
      type: "png",
      margin: 2,
      color: {
        dark: "#000000",
        light: "#FFFFFF",
      },
      width: 300,
    });
    console.log(`[QR Code] Generated QR code for: ${text}`);
    return qrBuffer;
  } catch (error) {
    console.error("[QR Code] Error generating QR code:", error);
    return null;
  }
};

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
    console.error("Error fetching company info:", error);
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
 * Format date and time to readable string
 * @param {Date} date - Date object
 * @returns {string} Formatted date and time string
 */
const formatDateTime = (date) => {
  if (!date) return "N/A";
  return new Date(date).toLocaleString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

/**
 * Generate payment confirmation email HTML
 * @param {Object} order - Order document (fully populated)
 * @returns {Promise<Object>} Object with HTML content and attachment
 */
const generatePaymentConfirmationEmail = async (order) => {
  // Validate that all trips in cartItems still exist in the database
  if (order.cartItems && order.cartItems.length > 0) {
    // Extract trip IDs - handle both populated objects and plain IDs
    const tripData = order.cartItems
      .map((item) => {
        if (!item.tripId) return null;
        // Check if tripId is populated (has _id property) - if so, it exists
        const isPopulated = item.tripId && typeof item.tripId === 'object' && item.tripId._id;
        const tripId = isPopulated ? item.tripId._id : item.tripId;
        return { tripId, isPopulated };
      })
      .filter((data) => data && data.tripId); // Filter out null/undefined

    // Separate populated trips (already verified) from unpopulated ones (need DB check)
    const populatedTripIds = tripData
      .filter((data) => data.isPopulated)
      .map((data) => data.tripId.toString());
    
    const unpopulatedTripIds = tripData
      .filter((data) => !data.isPopulated)
      .map((data) => data.tripId);

    // Only check unpopulated trips in database
    if (unpopulatedTripIds.length > 0) {
      const existingTrips = await Trip.find({
        _id: { $in: unpopulatedTripIds },
      }).select("_id");

      const existingTripIds = new Set(
        existingTrips.map((trip) => trip._id.toString())
      );
      const missingTripIds = unpopulatedTripIds.filter(
        (id) => !existingTripIds.has(id.toString())
      );

      if (missingTripIds.length > 0) {
        console.warn(
          `[Email Templates] Cannot generate confirmation email for order ${order.orderNumber}: Some trips no longer exist (tripIds: ${missingTripIds.map(id => id.toString()).join(", ")})`
        );
        throw new Error(
          `Cannot generate email: Some trips in order no longer exist in database`
        );
      }
    }
    
    // If we have populated trips, they're already verified to exist
    if (populatedTripIds.length > 0) {
      console.log(
        `[Email Templates] Skipping DB check for ${populatedTripIds.length} populated trip(s) in order ${order.orderNumber}`
      );
    }
  }

  const customerName =
    order.personalInfo?.firstName && order.personalInfo?.lastName
      ? `${order.personalInfo.firstName} ${order.personalInfo.lastName}`
      : order.customerId?.name || "Valued Customer";

  const companyInfo = await getCompanyInfo();

  // Generate QR code buffer for attachment
  const qrCodeBuffer = await generateQRCodeBuffer(order.orderNumber);
  const hasQRCode = qrCodeBuffer !== null;

  // Format trip details
  let tripDetailsHTML = "";
  if (order.cartItems && order.cartItems.length > 0) {
    tripDetailsHTML = order.cartItems
      .map((item, index) => {
        const tripTitle = item.mainTitle || "Trip";
        const startDate = formatDate(item.startingDate);
        const travelers = item.travelersNumber || 1;
        const itemTotal = item.itemTotal?.toFixed(2) || "0.00";
        const days = item.days || 1;

        return `
          <div style="background-color: #f5f5f5; border-left: 4px solid #000000; padding: 15px; margin: 10px 0; border-radius: 4px;">
            <h3 style="margin: 0 0 10px 0; color: #000000; font-size: 18px; font-weight: bold;">Trip ${index + 1}: ${tripTitle}</h3>
            <p style="margin: 5px 0; color: #333333; font-size: 14px;"><strong>Start Date:</strong> ${startDate}</p>
            <p style="margin: 5px 0; color: #333333; font-size: 14px;"><strong>Duration:</strong> ${days} ${days === 1 ? "day" : "days"}</p>
            <p style="margin: 5px 0; color: #333333; font-size: 14px;"><strong>Travelers:</strong> ${travelers} ${travelers === 1 ? "person" : "people"}</p>
            <p style="margin: 5px 0; color: #333333; font-size: 14px;"><strong>Amount:</strong> $${itemTotal}</p>
          </div>
        `;
      })
      .join("");
  }

  const emailHTML = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Payment Confirmation</title>
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
                Payment Confirmed
              </h1>
              <p style="color: #ffffff; margin: 10px 0 0 0; font-size: 16px;">
                Your booking is now confirmed
              </p>
            </td>
          </tr>
          
          <!-- Success Banner -->
          <tr>
            <td style="background-color: #f5f5f5; padding: 20px; border-left: 4px solid #000000;">
              <p style="margin: 0; color: #000000; font-size: 16px; font-weight: bold;">
                Congratulations! Your payment has been successfully processed.
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
                We are delighted to confirm that your payment has been successfully processed. Your booking is now confirmed and we look forward to providing you with an unforgettable experience!
              </p>

              <!-- Booking Details -->
              <div style="background-color: #f5f5f5; border-radius: 8px; padding: 20px; margin: 20px 0; border: 1px solid #e0e0e0;">
                <h2 style="color: #000000; margin: 0 0 15px 0; font-size: 20px; font-weight: bold;">Booking Details</h2>
                <table width="100%" cellpadding="5" cellspacing="0">
                  <tr>
                    <td style="color: #333333; font-size: 14px; padding: 5px 0;"><strong>Booking Number:</strong></td>
                    <td style="color: #000000; font-size: 14px; font-weight: bold; padding: 5px 0;">${order.orderNumber}</td>
                  </tr>
                  <tr>
                    <td style="color: #333333; font-size: 14px; padding: 5px 0;"><strong>Payment Date:</strong></td>
                    <td style="color: #333333; font-size: 14px; padding: 5px 0;">${formatDateTime(order.payment?.paymentDate || order.updatedAt)}</td>
                  </tr>
                  <tr>
                    <td style="color: #333333; font-size: 14px; padding: 5px 0;"><strong>Total Amount:</strong></td>
                    <td style="color: #000000; font-size: 16px; font-weight: bold; padding: 5px 0;">$${order.totalAmount?.toFixed(2) || "0.00"}</td>
                  </tr>
                </table>
              </div>

              <!-- QR Code Section -->
              ${hasQRCode ? `
              <div style="text-align: center; margin: 30px 0; padding: 20px; background-color: #f5f5f5; border-radius: 8px; border: 2px solid #000000;">
                <p style="color: #000000; font-size: 14px; margin: 0 0 15px 0; font-weight: bold;">Your Booking QR Code</p>
                <img src="cid:qrcode" alt="Booking QR Code" style="display: block; margin: 0 auto; max-width: 300px; height: auto; border: 2px solid #000000; padding: 10px; background-color: #ffffff;" />
                <p style="color: #666666; font-size: 12px; margin: 15px 0 0 0;">
                  Present this QR code at check-in for quick access to your booking details
                </p>
                <p style="color: #000000; font-size: 14px; margin: 10px 0 0 0; font-weight: bold;">
                  Booking Code: ${order.orderNumber}
                </p>
              </div>
              ` : `
              <div style="text-align: center; margin: 30px 0; padding: 20px; background-color: #f5f5f5; border-radius: 8px; border: 2px solid #000000;">
                <p style="color: #000000; font-size: 18px; margin: 0; font-weight: bold;">
                  Booking Code: ${order.orderNumber}
                </p>
                <p style="color: #666666; font-size: 12px; margin: 10px 0 0 0;">
                  Please keep this code for your records and present it at check-in
                </p>
              </div>
              `}

              <!-- Trip Details -->
              <div style="margin: 30px 0;">
                <h2 style="color: #000000; margin: 0 0 20px 0; font-size: 20px; font-weight: bold;">Trip Details</h2>
                ${tripDetailsHTML || "<p style='color: #666666; font-size: 14px;'>No trip details available.</p>"}
              </div>

              <!-- Contact Information -->
              <div style="background-color: #f5f5f5; border-left: 4px solid #000000; padding: 20px; margin: 30px 0; border-radius: 4px;">
                <h2 style="color: #000000; margin: 0 0 15px 0; font-size: 18px; font-weight: bold;">Contact Information</h2>
                <p style="margin: 5px 0; color: #333333; font-size: 14px;"><strong>Email:</strong> <a href="mailto:${companyInfo.email}" style="color: #000000; text-decoration: underline;">${companyInfo.email}</a></p>
                <p style="margin: 5px 0; color: #333333; font-size: 14px;"><strong>Phone:</strong> <a href="tel:${companyInfo.phone}" style="color: #000000; text-decoration: underline;">${companyInfo.phone}</a></p>
                ${companyInfo.address ? `<p style="margin: 5px 0; color: #333333; font-size: 14px;"><strong>Address:</strong> ${companyInfo.address}</p>` : ""}
                <p style="margin: 15px 0 0 0; color: #666666; font-size: 13px; line-height: 1.6;">
                  Our team is available to assist you with any questions or special requests. Please don't hesitate to reach out if you need any assistance before or during your trip.
                </p>
              </div>

              <!-- Next Steps -->
              <div style="margin: 30px 0;">
                <h2 style="color: #000000; margin: 0 0 15px 0; font-size: 18px; font-weight: bold;">What's Next?</h2>
                <ul style="margin: 0; padding-left: 20px; color: #333333; font-size: 14px; line-height: 1.8;">
                  <li>You will receive further details about your trip itinerary via email shortly.</li>
                  <li>Our team will contact you within 24-48 hours to confirm all arrangements.</li>
                  <li>Please ensure you have all necessary travel documents ready.</li>
                  <li>If you have any special requirements or questions, please contact us using the information above.</li>
                  <li>Keep this confirmation email and your booking code (${order.orderNumber}) handy for check-in.</li>
                </ul>
              </div>

              <p style="font-size: 14px; color: #666666; margin: 30px 0 0 0; padding-top: 20px; border-top: 1px solid #e0e0e0; line-height: 1.6;">
                Thank you for choosing Zanzi Trekking & Safaris. We are excited to make your travel dreams come true!
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

  return {
    html: emailHTML,
    attachment: hasQRCode
      ? {
          filename: `booking-qrcode-${order.orderNumber}.png`,
          content: qrCodeBuffer,
          cid: "qrcode", // Content ID for referencing in HTML
        }
      : null,
  };
};

/**
 * Generate payment rejection/failed email HTML
 * @param {Object} order - Order document (fully populated)
 * @returns {Promise<string>} HTML email content
 */
const generatePaymentRejectionEmail = async (order) => {
  // Validate that all trips in cartItems still exist in the database
  if (order.cartItems && order.cartItems.length > 0) {
    const tripIds = order.cartItems
      .map((item) => item.tripId)
      .filter((id) => id); // Filter out null/undefined

    if (tripIds.length > 0) {
      const existingTrips = await Trip.find({
        _id: { $in: tripIds },
      }).select("_id");

      const existingTripIds = new Set(
        existingTrips.map((trip) => trip._id.toString())
      );
      const missingTripIds = tripIds.filter(
        (id) => !existingTripIds.has(id.toString())
      );

      if (missingTripIds.length > 0) {
        console.warn(
          `[Email Templates] Cannot generate rejection email for order ${order.orderNumber}: Some trips no longer exist (tripIds: ${missingTripIds.join(", ")})`
        );
        throw new Error(
          `Cannot generate email: Some trips in order no longer exist in database`
        );
      }
    }
  }

  const customerName =
    order.personalInfo?.firstName && order.personalInfo?.lastName
      ? `${order.personalInfo.firstName} ${order.personalInfo.lastName}`
      : order.customerId?.name || "Valued Customer";

  const companyInfo = await getCompanyInfo();

  // Format trip details
  let tripDetailsHTML = "";
  if (order.cartItems && order.cartItems.length > 0) {
    tripDetailsHTML = order.cartItems
      .map((item, index) => {
        const tripTitle = item.mainTitle || "Trip";
        const startDate = formatDate(item.startingDate);
        const travelers = item.travelersNumber || 1;
        const itemTotal = item.itemTotal?.toFixed(2) || "0.00";

        return `
          <div style="background-color: #f5f5f5; border-left: 4px solid #000000; padding: 15px; margin: 10px 0; border-radius: 4px;">
            <h3 style="margin: 0 0 10px 0; color: #000000; font-size: 18px; font-weight: bold;">Trip ${index + 1}: ${tripTitle}</h3>
            <p style="margin: 5px 0; color: #333333; font-size: 14px;"><strong>Start Date:</strong> ${startDate}</p>
            <p style="margin: 5px 0; color: #333333; font-size: 14px;"><strong>Travelers:</strong> ${travelers} ${travelers === 1 ? "person" : "people"}</p>
            <p style="margin: 5px 0; color: #333333; font-size: 14px;"><strong>Amount:</strong> $${itemTotal}</p>
          </div>
        `;
      })
      .join("");
  }

  return {
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Payment Status Update</title>
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
                Payment Status Update
              </h1>
              <p style="color: #ffffff; margin: 10px 0 0 0; font-size: 16px;">
                Your payment could not be processed
              </p>
            </td>
          </tr>
          
          <!-- Alert Banner -->
          <tr>
            <td style="background-color: #f5f5f5; padding: 20px; border-left: 4px solid #000000;">
              <p style="margin: 0; color: #000000; font-size: 16px; font-weight: bold;">
                We regret to inform you that your payment could not be processed successfully.
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
                We are writing to inform you that your payment for booking <strong>#${order.orderNumber}</strong> could not be processed successfully. Your booking has been placed on hold until payment is completed.
              </p>

              <!-- Booking Details -->
              <div style="background-color: #f5f5f5; border-radius: 8px; padding: 20px; margin: 20px 0; border: 1px solid #e0e0e0;">
                <h2 style="color: #000000; margin: 0 0 15px 0; font-size: 20px; font-weight: bold;">Booking Details</h2>
                <table width="100%" cellpadding="5" cellspacing="0">
                  <tr>
                    <td style="color: #333333; font-size: 14px; padding: 5px 0;"><strong>Booking Number:</strong></td>
                    <td style="color: #000000; font-size: 14px; font-weight: bold; padding: 5px 0;">${order.orderNumber}</td>
                  </tr>
                  <tr>
                    <td style="color: #333333; font-size: 14px; padding: 5px 0;"><strong>Total Amount:</strong></td>
                    <td style="color: #000000; font-size: 16px; font-weight: bold; padding: 5px 0;">$${order.totalAmount?.toFixed(2) || "0.00"}</td>
                  </tr>
                  <tr>
                    <td style="color: #333333; font-size: 14px; padding: 5px 0;"><strong>Status:</strong></td>
                    <td style="color: #000000; font-size: 14px; padding: 5px 0; font-weight: bold;">Payment Failed</td>
                  </tr>
                </table>
              </div>

              <!-- Trip Details -->
              <div style="margin: 30px 0;">
                <h2 style="color: #000000; margin: 0 0 20px 0; font-size: 20px; font-weight: bold;">Trip Details</h2>
                ${tripDetailsHTML || "<p style='color: #666666; font-size: 14px;'>No trip details available.</p>"}
              </div>

              <!-- Contact Information -->
              <div style="background-color: #f5f5f5; border-left: 4px solid #000000; padding: 20px; margin: 30px 0; border-radius: 4px;">
                <h2 style="color: #000000; margin: 0 0 15px 0; font-size: 18px; font-weight: bold;">Need Help?</h2>
                <p style="margin: 5px 0; color: #333333; font-size: 14px;"><strong>Email:</strong> <a href="mailto:${companyInfo.email}" style="color: #000000; text-decoration: underline;">${companyInfo.email}</a></p>
                <p style="margin: 5px 0; color: #333333; font-size: 14px;"><strong>Phone:</strong> <a href="tel:${companyInfo.phone}" style="color: #000000; text-decoration: underline;">${companyInfo.phone}</a></p>
                ${companyInfo.address ? `<p style="margin: 5px 0; color: #333333; font-size: 14px;"><strong>Address:</strong> ${companyInfo.address}</p>` : ""}
                <p style="margin: 15px 0 0 0; color: #666666; font-size: 13px; line-height: 1.6;">
                  Our support team is ready to assist you with resolving payment issues or answering any questions you may have.
                </p>
              </div>

              <!-- Next Steps -->
              <div style="margin: 30px 0;">
                <h2 style="color: #000000; margin: 0 0 15px 0; font-size: 18px; font-weight: bold;">What You Can Do</h2>
                <ul style="margin: 0; padding-left: 20px; color: #333333; font-size: 14px; line-height: 1.8;">
                  <li>Check your payment method and ensure sufficient funds are available.</li>
                  <li>Verify that your payment details are correct.</li>
                  <li>Try completing the payment again using the payment link if available.</li>
                  <li>Contact us directly if you continue to experience issues.</li>
                  <li>Your booking will remain on hold until payment is successfully processed.</li>
                </ul>
              </div>

              <p style="font-size: 14px; color: #666666; margin: 30px 0 0 0; padding-top: 20px; border-top: 1px solid #e0e0e0; line-height: 1.6;">
                We understand that payment issues can be frustrating. Please don't hesitate to contact us if you need assistance or have any questions.
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
 * Generate refund notification email
 * @param {Object} order - Order object
 * @returns {Promise<Object>} Email data with HTML and attachment
 */
const generateRefundEmail = async (order) => {
  const customerName =
    order.personalInfo?.firstName && order.personalInfo?.lastName
      ? `${order.personalInfo.firstName} ${order.personalInfo.lastName}`
      : order.personalInfo?.firstName ||
        order.customerId?.name ||
        "Valued Customer";

  const companyInfo = await getCompanyInfo();

  // Build trip details HTML
  let tripDetailsHTML = "";
  if (order.cartItems && order.cartItems.length > 0) {
    tripDetailsHTML = order.cartItems
      .map((item, index) => {
        const tripTitle = item.mainTitle || "Trip";
        const startDate = item.startingDate
          ? new Date(item.startingDate).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })
          : "TBD";
        const travelers = item.travelersNumber || 1;
        const amount = item.itemTotal || 0;

        return `
          <div style="background-color: #f5f5f5; border-radius: 8px; padding: 15px; margin: 10px 0; border: 1px solid #e0e0e0;">
            <h3 style="color: #000000; margin: 0 0 10px 0; font-size: 16px; font-weight: bold;">${tripTitle}</h3>
            <table width="100%" cellpadding="5" cellspacing="0">
              <tr>
                <td style="color: #333333; font-size: 13px; padding: 3px 0;"><strong>Start Date:</strong></td>
                <td style="color: #000000; font-size: 13px; padding: 3px 0;">${startDate}</td>
              </tr>
              <tr>
                <td style="color: #333333; font-size: 13px; padding: 3px 0;"><strong>Travelers:</strong></td>
                <td style="color: #000000; font-size: 13px; padding: 3px 0;">${travelers} ${travelers === 1 ? "person" : "people"}</td>
              </tr>
              <tr>
                <td style="color: #333333; font-size: 13px; padding: 3px 0;"><strong>Amount:</strong></td>
                <td style="color: #000000; font-size: 14px; font-weight: bold; padding: 3px 0;">$${amount.toFixed(2)}</td>
              </tr>
            </table>
          </div>
        `;
      })
      .join("");
  }

  return {
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Refund Processed</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); border: 1px solid #e0e0e0;">
          <!-- Header -->
          <tr>
            <td style="background-color: #10b981; padding: 30px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold;">
                Refund Processed
              </h1>
              <p style="color: #ffffff; margin: 10px 0 0 0; font-size: 16px;">
                Your refund has been successfully processed
              </p>
            </td>
          </tr>
          
          <!-- Success Banner -->
          <tr>
            <td style="background-color: #d1fae5; padding: 20px; border-left: 4px solid #10b981;">
              <p style="margin: 0; color: #065f46; font-size: 16px; font-weight: bold;">
                ✅ Your refund of $${order.totalAmount?.toFixed(2) || "0.00"} has been processed successfully.
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
                We are writing to confirm that your refund for booking <strong>#${order.orderNumber}</strong> has been successfully processed. The refunded amount will be credited back to your original payment method within 5-10 business days, depending on your bank or payment provider.
              </p>

              <!-- Refund Details -->
              <div style="background-color: #f5f5f5; border-radius: 8px; padding: 20px; margin: 20px 0; border: 1px solid #e0e0e0;">
                <h2 style="color: #000000; margin: 0 0 15px 0; font-size: 20px; font-weight: bold;">Refund Details</h2>
                <table width="100%" cellpadding="5" cellspacing="0">
                  <tr>
                    <td style="color: #333333; font-size: 14px; padding: 5px 0;"><strong>Booking Number:</strong></td>
                    <td style="color: #000000; font-size: 14px; font-weight: bold; padding: 5px 0;">${order.orderNumber}</td>
                  </tr>
                  <tr>
                    <td style="color: #333333; font-size: 14px; padding: 5px 0;"><strong>Refund Amount:</strong></td>
                    <td style="color: #10b981; font-size: 18px; font-weight: bold; padding: 5px 0;">$${order.totalAmount?.toFixed(2) || "0.00"}</td>
                  </tr>
                  <tr>
                    <td style="color: #333333; font-size: 14px; padding: 5px 0;"><strong>Refund Date:</strong></td>
                    <td style="color: #000000; font-size: 14px; padding: 5px 0;">${new Date().toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}</td>
                  </tr>
                  <tr>
                    <td style="color: #333333; font-size: 14px; padding: 5px 0;"><strong>Status:</strong></td>
                    <td style="color: #10b981; font-size: 14px; padding: 5px 0; font-weight: bold;">Refunded</td>
                  </tr>
                </table>
              </div>

              <!-- Trip Details -->
              <div style="margin: 30px 0;">
                <h2 style="color: #000000; margin: 0 0 20px 0; font-size: 20px; font-weight: bold;">Cancelled Trip Details</h2>
                ${tripDetailsHTML || "<p style='color: #666666; font-size: 14px;'>No trip details available.</p>"}
              </div>

              <!-- Important Information -->
              <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 20px; margin: 30px 0; border-radius: 4px;">
                <h2 style="color: #92400e; margin: 0 0 15px 0; font-size: 18px; font-weight: bold;">Important Information</h2>
                <ul style="margin: 0; padding-left: 20px; color: #78350f; font-size: 14px; line-height: 1.8;">
                  <li>Refunds typically take 5-10 business days to appear in your account.</li>
                  <li>The refund will be credited to the original payment method used for the booking.</li>
                  <li>If you don't see the refund after 10 business days, please contact your bank or payment provider.</li>
                  <li>If you have any questions about this refund, please don't hesitate to contact us.</li>
                </ul>
              </div>

              <!-- Contact Information -->
              <div style="background-color: #f5f5f5; border-left: 4px solid #000000; padding: 20px; margin: 30px 0; border-radius: 4px;">
                <h2 style="color: #000000; margin: 0 0 15px 0; font-size: 18px; font-weight: bold;">Need Help?</h2>
                <p style="margin: 5px 0; color: #333333; font-size: 14px;"><strong>Email:</strong> <a href="mailto:${companyInfo.email}" style="color: #000000; text-decoration: underline;">${companyInfo.email}</a></p>
                <p style="margin: 5px 0; color: #333333; font-size: 14px;"><strong>Phone:</strong> <a href="tel:${companyInfo.phone}" style="color: #000000; text-decoration: underline;">${companyInfo.phone}</a></p>
                ${companyInfo.address ? `<p style="margin: 5px 0; color: #333333; font-size: 14px;"><strong>Address:</strong> ${companyInfo.address}</p>` : ""}
                <p style="margin: 15px 0 0 0; color: #666666; font-size: 13px; line-height: 1.6;">
                  Our support team is here to assist you with any questions or concerns regarding your refund.
                </p>
              </div>

              <p style="font-size: 14px; color: #666666; margin: 30px 0 0 0; padding-top: 20px; border-top: 1px solid #e0e0e0; line-height: 1.6;">
                We apologize for any inconvenience and thank you for your understanding. We hope to serve you again in the future.
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

module.exports = {
  generatePaymentConfirmationEmail,
  generatePaymentRejectionEmail,
  generateRefundEmail,
};
