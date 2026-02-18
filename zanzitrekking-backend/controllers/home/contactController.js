const { responseReturn } = require("../../utilities/response");
const emailQueue = require("../../workers/emailQueue");
const logger = require('./../../utilities/logger');
const { generateContactUsEmail } = require("../../utilities/contactEmailTemplates");

const isValidEmail = (email = "") =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).trim());

class ContactController {
  send_contact_message = async (req, res) => {
    try {
      const {
        firstName = "",
        lastName = "",
        email = "",
        phone = "",
        message = "",
        subject = "",
      } = req.body || {};

      if (!firstName.trim() || !lastName.trim() || !email.trim() || !message.trim()) {
        return responseReturn(res, 400, {
          error: "First name, last name, email, and message are required",
        });
      }

      if (!isValidEmail(email)) {
        return responseReturn(res, 400, { error: "Invalid email address" });
      }

      // basic length guards
      if (message.length > 5000) {
        return responseReturn(res, 400, { error: "Message is too long" });
      }

      const toEmail = process.env.CONTACT_RECEIVER_EMAIL || "shaheerazam111@gmail.com";
      const safeSubject =
        (subject && String(subject).trim()) ||
        `Contact Us - ${firstName.trim()} ${lastName.trim()}`;

      const html = await generateContactUsEmail({
        firstName,
        lastName,
        email,
        phone,
        message,
        subject: safeSubject,
      });

      emailQueue.add({
        subject: safeSubject,
        content: html,
        recipients: [toEmail],
      });

      return responseReturn(res, 200, {
        message: "Message sent successfully",
      });
    } catch (err) {
      logger.error("Error sending contact message:", err);
      return responseReturn(res, 500, { error: "Internal server error" });
    }
  };
}

module.exports = new ContactController();

