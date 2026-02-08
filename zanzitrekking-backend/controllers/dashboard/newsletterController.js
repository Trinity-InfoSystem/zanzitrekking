const NewsletterModel = require("../../models/newsletter");
const { validateEmail } = require("../../utilities/validators");
const { responseReturn } = require("../../utilities/response");
const emailQueue = require("../../workers/emailQueue");
const path = require("path");

class NewsletterController {
  // Subscribe to newsletter
  async subscribe(req, res) {
    try {
      const { email, subscriptionSource = "website" } = req.body;

      // Validate input
      if (!email || !validateEmail(email)) {
        return responseReturn(res, 400, { error: "Valid email is required" });
      }

      if (
        !["website", "mobile-app", "admin", "other"].includes(
          subscriptionSource
        )
      ) {
        return responseReturn(res, 400, {
          error: "Invalid subscription source",
        });
      }

      // Check existing subscription
      const existing = await NewsletterModel.findOne({ email });

      if (existing) {
        if (existing.isSubscribed) {
          return responseReturn(res, 200, {
            message: "Already subscribed",
            subscription: existing,
          });
        }

        // Resubscribe
        const updated = await NewsletterModel.findOneAndUpdate(
          { email },
          {
            isSubscribed: true,
            subscriptionSource,
            subscribedAt: new Date(),
            $unset: { unsubscribedAt: 1 },
          },
          { new: true }
        );

        return responseReturn(res, 200, {
          message: "Resubscribed successfully",
          subscription: updated,
        });
      }

      // Create new subscription
      const newSubscription = await NewsletterModel.create({
        email,
        subscriptionSource,
        isSubscribed: true,
      });

      return responseReturn(res, 201, {
        message: "Subscribed successfully",
        subscription: newSubscription,
      });
    } catch (error) {
      console.error("Subscription error:", error);
      return responseReturn(res, 500, {
        error: "Internal server error",
        details: error.message,
      });
    }
  }

  // Unsubscribe from newsletter
  async unsubscribe(req, res) {
    try {
      const { email } = req.body;

      // Validate email
      if (!validateEmail(email)) {
        return responseReturn(res, 400, { error: "Invalid email address" });
      }

      const subscription = await NewsletterModel.findOne({ email });

      if (!subscription) {
        return responseReturn(res, 404, {
          error: "Email not found in our newsletter list",
        });
      }

      if (!subscription.isSubscribed) {
        return responseReturn(res, 200, {
          message: "You're already unsubscribed from our newsletter",
          subscription,
        });
      }

      subscription.isSubscribed = false;
      subscription.unsubscribedAt = new Date();
      await subscription.save();

      return responseReturn(res, 200, {
        message: "You've been unsubscribed from our newsletter",
        subscription,
      });
    } catch (error) {
      return responseReturn(res, 500, { error: error.message });
    }
  }

  // Get all subscribers (admin only)
  async getSubscribers(req, res) {
    try {
      const {
        status = "subscribed",
        page = 1,
        limit = 20,
        search = "",
        sort = "newest-desc",
      } = req.query;

      const query = {};
      if (status === "subscribed") {
        query.isSubscribed = true;
      } else if (status === "unsubscribed") {
        query.isSubscribed = false;
      }

      // Add search functionality
      if (search) {
        query.email = { $regex: search, $options: "i" };
      }

      // Determine sort order
      let sortOptions = {};
      let collation = null;
      if (sort === "name-asc") {
        sortOptions = { email: 1 }; // A-Z
        collation = { locale: "en", strength: 2 }; // Case-insensitive collation
      } else if (sort === "name-desc") {
        sortOptions = { email: -1 }; // Z-A
        collation = { locale: "en", strength: 2 }; // Case-insensitive collation
      } else if (sort === "newest-asc") {
        sortOptions = { subscribedAt: 1 }; // Oldest first
      } else {
        sortOptions = { subscribedAt: -1 }; // Newest first (default)
      }

      const parsedPage = Number.parseInt(page, 10);
      const parsedLimit = Number.parseInt(limit, 10);

      const options = {
        page: Number.isFinite(parsedPage) && parsedPage > 0 ? parsedPage : 1,
        limit:
          Number.isFinite(parsedLimit) && parsedLimit > 0 ? parsedLimit : 20,
        sort: sortOptions,
      };

      if (collation) {
        options.collation = collation;
      }

      const subscribers = await NewsletterModel.paginate(query, options);

      return responseReturn(res, 200, subscribers);
    } catch (error) {
      console.error("Get subscribers error:", error);
      return responseReturn(res, 500, { error: error.message });
    }
  }

  // Get all subscribers (admin only)
  async getAllSubscribers(req, res) {
    try {
      const { status = "subscribed" } = req.query;

      const query = {};
      if (status === "subscribed") {
        query.isSubscribed = true;
      } else if (status === "unsubscribed") {
        query.isSubscribed = false;
      }

      const options = {
        sort: { subscribedAt: -1 },
      };

      const subscribers = await NewsletterModel.find(query);

      return responseReturn(res, 200, subscribers);
    } catch (error) {
      return responseReturn(res, 500, { error: error.message });
    }
  }

  // Get subscriber by email (admin only)
  async getSubscriber(req, res) {
    try {
      const { email } = req.params;

      const subscription = await NewsletterModel.findOne({ email });

      if (!subscription) {
        return responseReturn(res, 404, { error: "Subscriber not found" });
      }

      return responseReturn(res, 200, { subscription });
    } catch (error) {
      return responseReturn(res, 500, { error: error.message });
    }
  }

  // Update subscriber (admin only)
  async updateSubscriber(req, res) {
    try {
      const { email } = req.params;
      const { isSubscribed, subscriptionSource } = req.body;

      const subscription = await NewsletterModel.findOne({ email });

      if (!subscription) {
        return responseReturn(res, 404, { error: "Subscriber not found" });
      }

      if (typeof isSubscribed !== "undefined") {
        subscription.isSubscribed = isSubscribed;
        if (isSubscribed) {
          subscription.subscribedAt = new Date();
          subscription.unsubscribedAt = null;
        } else {
          subscription.unsubscribedAt = new Date();
        }
      }

      if (subscriptionSource) {
        subscription.subscriptionSource = subscriptionSource;
      }

      await subscription.save();

      return responseReturn(res, 200, {
        message: "Subscriber updated successfully",
        subscription,
      });
    } catch (error) {
      return responseReturn(res, 500, { error: error.message });
    }
  }

  // Delete subscriber (admin only)
  async deleteSubscriber(req, res) {
    try {
      const { email } = req.params;

      const result = await NewsletterModel.deleteOne({ email });

      if (result.deletedCount === 0) {
        return responseReturn(res, 404, { error: "Subscriber not found" });
      }

      return responseReturn(res, 200, {
        message: "Subscriber deleted successfully",
      });
    } catch (error) {
      return responseReturn(res, 500, { error: error.message });
    }
  }

  // Add to newsletterController.js
  async exportSubscribers(req, res) {
    try {
      const { format = "csv" } = req.query;
      const subscribers = await NewsletterModel.find(
        { isSubscribed: true },
        "email subscriptionSource subscribedAt"
      ).sort({ subscribedAt: -1 });

      if (format === "json") {
        return responseReturn(res, 200, { subscribers });
      } else {
        // CSV format
        let csv = "Email,Subscription Source,Subscribed At\n";
        subscribers.forEach((sub) => {
          csv += `"${sub.email}","${
            sub.subscriptionSource
          }","${sub.subscribedAt.toISOString()}"\n`;
        });

        res.setHeader("Content-Type", "text/csv");
        res.setHeader(
          "Content-Disposition",
          "attachment; filename=subscribers.csv"
        );
        return res.send(csv);
      }
    } catch (error) {
      return responseReturn(res, 500, { error: error.message });
    }
  }

  async sendNewsletter(req, res) {
    try {
      const { subject, content, emails = "[]" } = req.body;
      let attachment = null;

      // Check for file attachment
      if (req.file) {
        const filePath = path.join(
          __dirname,
          "../../public/newsletter",
          req.file.filename
        );
        attachment = {
          filename: req.file.originalname,
          path: filePath,
          contentType: req.file.mimetype,
        };
      }

      // Validate input
      if (!subject || !content) {
        return responseReturn(res, 400, {
          error: "Subject and content are required",
        });
      }

      // Get recipients - either from provided array or all subscribers
      let recipients = [];
      
      let mails = [];
      if (emails && emails !== "[]") {
        try {
          mails = JSON.parse(emails);
        } catch (parseError) {
          console.error("[Newsletter] Error parsing emails JSON:", parseError);
          return responseReturn(res, 400, {
            error: "Invalid emails format. Expected JSON array.",
          });
        }
      }
      
      if (mails && mails.length > 0) {
        // Validate provided emails
        const invalidEmails = mails.filter((email) => !validateEmail(email));
        if (invalidEmails.length > 0) {
          return responseReturn(res, 400, {
            error: "Invalid email addresses",
            invalidEmails,
          });
        }

        // Check if emails exist in database
        const existingSubscribers = await NewsletterModel.find({
          email: { $in: mails },
          isSubscribed: true,
        });

        recipients = existingSubscribers.map((sub) => sub.email);

        if (recipients.length === 0) {
          return responseReturn(res, 400, {
            error: "None of the provided emails are subscribed",
          });
        }
      } else {
        // Get all subscribed emails if no specific emails provided
        const subscribers = await NewsletterModel.find(
          { isSubscribed: true },
          "email"
        );
        recipients = subscribers.map((sub) => sub.email);

        if (recipients.length === 0) {
          return responseReturn(res, 400, {
            error: "No subscribers found",
          });
        }
      }

      // Add emails to queue in batches
      const batchSize = 100; // Process 100 emails at a time
      const totalBatches = Math.ceil(recipients.length / batchSize);
      
      for (let i = 0; i < recipients.length; i += batchSize) {
        const batch = recipients.slice(i, i + batchSize);
        const batchNumber = Math.floor(i / batchSize) + 1;

        emailQueue.add({
          subject,
          content,
          recipients: batch,
          attachment: i === 0 ? attachment : null, // Only attach file to first batch
        });
      }

      return responseReturn(res, 200, {
        message: "Newsletter is being processed",
        totalRecipients: recipients.length,
        batches: totalBatches,
        hasAttachment: !!attachment,
        preview: { subject, content },
      });
    } catch (error) {
      return responseReturn(res, 500, { error: error.message });
    }
  }
}

module.exports = new NewsletterController();
