const cron = require("node-cron");
const { autoCompleteTrips } = require("./autoCompleteTrips");
const { sendPaymentReminders } = require("./paymentReminder");
const {
  generateMissingPaymentLinks,
} = require("./generateMissingPaymentLinks");

/**
 * Setup cron jobs for the application
 */
const setupCronJobs = () => {
  // Auto-complete trips every hour
  // Cron expression: "0 * * * *" means "at minute 0 of every hour"
  cron.schedule("0 * * * *", async () => {
    try {
      await autoCompleteTrips();
    } catch (error) {
      console.error("[Cron] Error in auto-complete trips job:", error);
    }
  });

  // Send payment reminders daily at 9 AM
  // Cron expression: "0 9 * * *" means "at 9:00 AM every day"
  cron.schedule("0 * * * *", async () => {
    try {
      await sendPaymentReminders();
    } catch (error) {
      console.error("[Cron] Error in payment reminder job:", error);
    }
  });

  // Cron expression: "*/30 * * * *" means "every 30 minutes"
  cron.schedule("0 * * * *", async () => {
    try {
      await generateMissingPaymentLinks();
    } catch (error) {
      console.error("[Cron] Error in missing payment links job:", error);
    }
  });
};

module.exports = { setupCronJobs };
