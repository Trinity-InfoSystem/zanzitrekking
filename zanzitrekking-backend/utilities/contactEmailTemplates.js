const Admin = require("../models/admin");

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

const escapeHtml = (str = "") =>
  String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

/**
 * Black/white themed email for Contact Us submissions (to company inbox)
 */
const generateContactUsEmail = async ({
  firstName,
  lastName,
  email,
  phone,
  message,
  subject,
}) => {
  const companyInfo = await getCompanyInfo();
  const fullName = [firstName, lastName].filter(Boolean).join(" ").trim();

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Contact Us Message</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); border: 1px solid #e0e0e0;">
          <tr>
            <td style="background-color: #000000; padding: 30px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: bold;">
                New Contact Message
              </h1>
              <p style="color: #ffffff; margin: 10px 0 0 0; font-size: 14px;">
                ${escapeHtml(subject || "Contact Us Form Submission")}
              </p>
            </td>
          </tr>

          <tr>
            <td style="background-color: #f5f5f5; padding: 20px; border-left: 4px solid #000000;">
              <p style="margin: 0; color: #000000; font-size: 14px; font-weight: bold;">
                You received a new message from the website contact form.
              </p>
            </td>
          </tr>

          <tr>
            <td style="padding: 30px;">
              <div style="background-color: #f5f5f5; border-radius: 8px; padding: 20px; margin: 0 0 20px 0; border: 1px solid #e0e0e0;">
                <h2 style="color: #000000; margin: 0 0 12px 0; font-size: 18px; font-weight: bold;">Sender Details</h2>
                <table width="100%" cellpadding="5" cellspacing="0">
                  <tr>
                    <td style="color: #333333; font-size: 14px; padding: 5px 0;"><strong>Name:</strong></td>
                    <td style="color: #000000; font-size: 14px; font-weight: bold; padding: 5px 0;">${escapeHtml(fullName || "N/A")}</td>
                  </tr>
                  <tr>
                    <td style="color: #333333; font-size: 14px; padding: 5px 0;"><strong>Email:</strong></td>
                    <td style="color: #333333; font-size: 14px; padding: 5px 0;">${escapeHtml(email || "N/A")}</td>
                  </tr>
                  ${
                    phone
                      ? `
                  <tr>
                    <td style="color: #333333; font-size: 14px; padding: 5px 0;"><strong>Phone:</strong></td>
                    <td style="color: #333333; font-size: 14px; padding: 5px 0;">${escapeHtml(phone)}</td>
                  </tr>
                  `
                      : ""
                  }
                </table>
              </div>

              <div style="border: 1px solid #e0e0e0; border-radius: 8px; padding: 18px;">
                <h2 style="color: #000000; margin: 0 0 12px 0; font-size: 18px; font-weight: bold;">Message</h2>
                <p style="margin: 0; color: #333333; font-size: 14px; line-height: 1.7; white-space: pre-wrap;">${escapeHtml(
                  message || ""
                )}</p>
              </div>

              <div style="background-color: #f5f5f5; border-left: 4px solid #000000; padding: 16px; margin: 24px 0 0 0; border-radius: 4px;">
                <p style="margin: 0; color: #333333; font-size: 13px; line-height: 1.6;">
                  Reply to: <a href="mailto:${escapeHtml(
                    email || companyInfo.email
                  )}" style="color: #000000; text-decoration: underline;">${escapeHtml(
                  email || companyInfo.email
                )}</a>
                </p>
              </div>
            </td>
          </tr>

          <tr>
            <td style="background-color: #f5f5f5; padding: 20px; text-align: center; border-top: 1px solid #e0e0e0;">
              <p style="font-size: 12px; color: #666666; margin: 0 0 10px;">
                © ${new Date().getFullYear()} Zanzi Trekking & Safaris. All rights reserved.
              </p>
              <p style="font-size: 12px; color: #999999; margin: 0;">
                This message was generated automatically from the website contact form.
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
  generateContactUsEmail,
};

