// workers/emailQueue.js
const EventEmitter = require("events");
const logger = require('./../utilities/logger');
const nodemailer = require("nodemailer");
const fs = require("fs");
const path = require("path");

class EmailQueue extends EventEmitter {
  constructor() {
    super();
    this.queue = [];
    this.isProcessing = false;
    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT),
      secure: process.env.EMAIL_SECURE === "true",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    // Start processing
    this.startProcessing();
  }

  add(job) {
    this.queue.push(job);
    this.emit("jobAdded");
  }

  async startProcessing() {
    if (this.isProcessing) return;

    this.isProcessing = true;
    while (this.queue.length > 0) {
      const job = this.queue.shift();
      try {
        await this.processJob(job);
      } catch (error) {
        logger.error(
          `[Email Queue] ❌ Error processing email job - Subject: "${job?.subject}":`,
          error
        );
        // You might want to implement retry logic here
      }
    }
    this.isProcessing = false;
  }

  async processJob(job) {
    const { subject, content, recipients, attachment } = job;

    // Prepare attachments array
    let attachments = [];
    if (attachment) {
      let attachmentData = {
        filename: attachment.filename || "attachment.png",
      };

      // If attachment has content (buffer), use it directly
      if (attachment.content) {
        attachmentData.content = attachment.content;
        attachmentData.cid = attachment.cid || "qrcode"; // Content-ID for inline images
      } 
      // If attachment has a path, read the file from disk
      else if (attachment.path) {
        try {
          attachmentData.path = attachment.path;
        } catch (error) {
          logger.error(
            `[Email Queue] Error reading attachment file ${attachment.path}:`,
            error
          );
        }
      }

      attachments.push(attachmentData);
    }

    // Prepare email options
    const mailOptions = {
      from:
        process.env.EMAIL_FROM || '"Newsletter Service" <noreply@example.com>',
      subject,
      html: content,
      attachments: attachments,
    };

    // Send to each recipient in this batch
    let successCount = 0;
    let failureCount = 0;

    for (const email of recipients) {
      try {
        await this.transporter.sendMail({
          ...mailOptions,
          to: email,
        });
        successCount++;

        // Add slight delay between emails to avoid rate limiting
        await new Promise((resolve) => setTimeout(resolve, 100));
      } catch (error) {
        logger.error(
          `[Email Queue] ❌ Failed to send email to ${email} - Subject: "${subject}"`
        );
        logger.error(`[Email Queue] Error Code: ${error.code || 'N/A'}`);
        logger.error(`[Email Queue] Error Message: ${error.message}`);
        if (error.response) {
          logger.error(`[Email Queue] SMTP Response:`, error.response);
        }
        failureCount++;
        // Continue with next email even if one fails
      }
    }

    // Clean up attachment file after sending (only if it's a file path)
    if (attachment && attachment.path) {
      try {
        await fs.promises.unlink(attachment.path);
      } catch (err) {
        logger.error(
          `[Email Queue] Error deleting attachment ${attachment.path}:`,
          err
        );
      }
    }
  }
}

// Initialize the queue
const emailQueue = new EmailQueue();

// Listen for new jobs
emailQueue.on("jobAdded", () => {
  if (!emailQueue.isProcessing) {
    emailQueue.startProcessing();
  }
});

module.exports = emailQueue;
