const emailQueue = require("../../workers/emailQueue");
const { responseReturn } = require("../../utilities/response");

/**
 * Test Email Controller
 * Used to test email sending functionality
 */
class TestEmailController {
  /**
   * Test email sending
   */
  testEmail = async (req, res) => {
    try {
      const { recipientEmail } = req.body;

      if (!recipientEmail) {
        return responseReturn(res, 400, {
          error: "recipientEmail is required",
        });
      }

      // Check email configuration
      const emailConfig = {
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        secure: process.env.EMAIL_SECURE,
        user: process.env.EMAIL_USER,
        from: process.env.EMAIL_FROM,
        passwordConfigured: !!process.env.EMAIL_PASSWORD,
      };

      console.log("[Test Email] Email configuration:", {
        ...emailConfig,
        password: "***hidden***",
      });

      // Create test email
      const testEmailContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #1B4332; color: white; padding: 20px; text-align: center; }
            .content { background: #f9f9f9; padding: 20px; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Test Email from Zanzi Trekking and Safaris</h1>
            </div>
            <div class="content">
              <p>This is a test email to verify email sending functionality.</p>
              <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
              <p>If you received this email, the email service is working correctly!</p>
            </div>
            <div class="footer">
              <p>This is an automated test email.</p>
            </div>
          </div>
        </body>
        </html>
      `;

      // Add email to queue
      emailQueue.add({
        subject: "Test Email - WeTravel Integration",
        content: testEmailContent,
        recipients: [recipientEmail],
      });

      console.log(`[Test Email] ✅ Test email queued for ${recipientEmail}`);

      return responseReturn(res, 200, {
        message: "Test email queued successfully",
        recipientEmail,
        emailConfig: {
          ...emailConfig,
          password: "***hidden***",
        },
        note: "Check your inbox and spam folder. If email doesn't arrive, check server logs for errors.",
      });
    } catch (error) {
      console.error("[Test Email] ❌ Error:", error);
      return responseReturn(res, 500, {
        error: "Failed to queue test email",
        message: error.message,
      });
    }
  };

  /**
   * Check email configuration
   */
  checkEmailConfig = async (req, res) => {
    try {
      const config = {
        EMAIL_HOST: process.env.EMAIL_HOST ? "✅ Configured" : "❌ Missing",
        EMAIL_PORT: process.env.EMAIL_PORT || "Not set",
        EMAIL_SECURE: process.env.EMAIL_SECURE || "Not set",
        EMAIL_USER: process.env.EMAIL_USER ? "✅ Configured" : "❌ Missing",
        EMAIL_PASSWORD: process.env.EMAIL_PASSWORD ? "✅ Configured" : "❌ Missing",
        EMAIL_FROM: process.env.EMAIL_FROM || "Not set",
      };

      const allConfigured =
        process.env.EMAIL_HOST &&
        process.env.EMAIL_PORT &&
        process.env.EMAIL_USER &&
        process.env.EMAIL_PASSWORD;

      return responseReturn(res, 200, {
        message: allConfigured
          ? "Email configuration is complete"
          : "Email configuration is incomplete",
        config,
        status: allConfigured ? "ready" : "not_ready",
      });
    } catch (error) {
      return responseReturn(res, 500, {
        error: "Failed to check email configuration",
        message: error.message,
      });
    }
  };
}

module.exports = new TestEmailController();
