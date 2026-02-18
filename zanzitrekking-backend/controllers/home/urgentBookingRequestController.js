const UrgentBookingRequest = require("../../models/urgentBookingRequest");
const logger = require('./../../utilities/logger');
const Trip = require("../../models/trip");
const Customer = require("../../models/customer");
const { responseReturn } = require("../../utilities/response");
const { checkBookingRestriction } = require("../../utilities/bookingRestrictions");
const emailQueue = require("../../workers/emailQueue");
const {
  generateRequestConfirmationEmail,
  generateAdminNotificationEmail,
} = require("../../utilities/urgentBookingEmailTemplates");
const mongoose = require("mongoose");


class UrgentBookingRequestController {
  // Create a new urgent booking request
  createRequest = async (req, res) => {
    try {
      const {
        customerId,
        tripId,
        requestedDate,
        selectedCategory,
        travelersNumber,
        personalInfo,
        billingAddress,
      } = req.body;

      // Validate required fields (billingAddress is optional)
      if (
        !customerId ||
        !tripId ||
        !requestedDate ||
        !selectedCategory ||
        !travelersNumber ||
        !personalInfo
      ) {
        return responseReturn(res, 400, {
          message:
            "Missing required fields: customerId, tripId, requestedDate, selectedCategory, travelersNumber, and personalInfo are required.",
        });
      }

      // Validate customer exists
      let customerObjectId;
      try {
        customerObjectId = new mongoose.Types.ObjectId(customerId);
      } catch (error) {
        logger.error("Invalid customerId format:", customerId, error);
        return responseReturn(res, 400, {
          message: "Invalid customer ID format",
        });
      }

      const customer = await Customer.findById(customerObjectId);
      if (!customer) {
        return responseReturn(res, 404, {
          message: "Customer not found",
        });
      }

      // Validate trip exists and get category
      let tripObjectId;
      try {
        tripObjectId = new mongoose.Types.ObjectId(tripId);
      } catch (error) {
        logger.error("Invalid tripId format:", tripId, error);
        return responseReturn(res, 400, {
          message: "Invalid trip ID format",
        });
      }

      const trip = await Trip.findById(tripObjectId).populate("category");
      if (!trip) {
        return responseReturn(res, 404, {
          message: "Trip not found",
          tripId: tripId,
        });
      }

      // DEBUG: Log what we received
      // Extract date components to see what we'll parse
      let debugParsed;
      if (typeof requestedDate === "string" && requestedDate.includes("T")) {
        const datePart = requestedDate.split("T")[0];
        const [yearStr, monthStr, dayStr] = datePart.split("-");
        debugParsed = {
          datePart,
          year: parseInt(yearStr, 10),
          month: parseInt(monthStr, 10),
          day: parseInt(dayStr, 10),
        };
      } else {
        const parsed = new Date(requestedDate);
        debugParsed = {
          parsedISO: parsed.toISOString(),
          utcYear: parsed.getUTCFullYear(),
          utcMonth: parsed.getUTCMonth() + 1,
          utcDay: parsed.getUTCDate(),
        };
      }
      
      // CRITICAL: Ensure we pass the date correctly to checkBookingRestriction
      // The date should be passed as-is (string) so the function can extract the date part
      // Check booking restriction
      const restrictionCheck = await checkBookingRestriction({
        tripId: tripObjectId,
        selectedCategory,
        startingDate: requestedDate, // Pass as string - checkBookingRestriction will parse it
        categoryName: trip.category?.name || "",
        categoryId: trip.category?._id || null,
      });

      // Only allow request creation if booking is blocked
      if (!restrictionCheck.blocked) {
        return responseReturn(res, 400, {
          message:
            "This trip does not require an availability request. You can proceed with normal booking.",
        });
      }

      // Normalize requestedDate to UTC for checking existing requests
      // Extract UTC date components from the requested date string
      let year, month, day;
      
      if (typeof requestedDate === "string") {
        // If it's an ISO string, extract the date part (YYYY-MM-DD)
        if (requestedDate.includes("T")) {
          const datePart = requestedDate.split("T")[0]; // e.g., "2026-02-10"
          const [yearStr, monthStr, dayStr] = datePart.split("-");
          year = parseInt(yearStr, 10);
          month = parseInt(monthStr, 10) - 1; // JavaScript months are 0-indexed
          day = parseInt(dayStr, 10);
        } else {
          // Already in YYYY-MM-DD format
          const [yearStr, monthStr, dayStr] = requestedDate.split("-");
          year = parseInt(yearStr, 10);
          month = parseInt(monthStr, 10) - 1;
          day = parseInt(dayStr, 10);
        }
      } else if (requestedDate instanceof Date) {
        // Date object - extract UTC components
        year = requestedDate.getUTCFullYear();
        month = requestedDate.getUTCMonth();
        day = requestedDate.getUTCDate();
      } else {
        // Fallback: try to parse as Date
        const dateObj = new Date(requestedDate);
        year = dateObj.getUTCFullYear();
        month = dateObj.getUTCMonth();
        day = dateObj.getUTCDate();
      }
      
      // Create UTC date at midnight for consistent comparison
      const normalizedRequestedDate = new Date(Date.UTC(year, month, day, 0, 0, 0, 0));
      const normalizedRequestedDateEnd = new Date(Date.UTC(year, month, day, 23, 59, 59, 999));

      // Check if user already has a pending or approved request for this trip-date combination
      const existingRequest = await UrgentBookingRequest.findOne({
        customerId: customerObjectId,
        tripId: tripObjectId,
        requestedDate: {
          $gte: normalizedRequestedDate,
          $lte: normalizedRequestedDateEnd,
        },
        selectedCategory,
        status: { $in: ["pending", "approved"] },
      });

      if (existingRequest) {
        return responseReturn(res, 400, {
          message:
            "You already have a pending or approved request for this trip and date. Please check your requests or proceed to checkout if approved.",
          existingRequest,
        });
      }

      // Create the request (using normalizedRequestedDate from above)
      const requestData = {
        customerId: customerObjectId,
        tripId: tripObjectId,
        requestedDate: normalizedRequestedDate,
        selectedCategory,
        travelersNumber: parseInt(travelersNumber),
        personalInfo: {
          firstName: personalInfo.firstName.trim(),
          lastName: personalInfo.lastName.trim(),
          email: personalInfo.email.trim(),
          phone: personalInfo.phone.trim(),
        },
        // Billing address is optional for availability requests
        // Handle null, undefined, or empty object
        billingAddress: billingAddress && typeof billingAddress === "object" && billingAddress !== null
          ? {
              street: (billingAddress.street || "").trim(),
              city: (billingAddress.city || "").trim(),
              state: (billingAddress.state || "").trim(),
              zip: (billingAddress.zip || "").trim(),
              country: (billingAddress.country || "United States").trim(),
            }
          : {
              street: "",
              city: "",
              state: "",
              zip: "",
              country: "United States",
            },
        categoryName: trip.category?.name || "",
        tripTitle: trip.mainTitle || "",
        status: "pending",
      };

      const request = await UrgentBookingRequest.create(requestData);

      // Populate trip and customer for email
      await request.populate("tripId", "mainTitle");
      await request.populate("customerId", "name email");

      // Send confirmation email to customer
      try {
        const emailContent = await generateRequestConfirmationEmail(request);
        emailQueue.add({
          subject: `Availability Request Received - ${trip.mainTitle}`,
          content: emailContent,
          recipients: [request.personalInfo.email],
        });
      } catch (emailError) {
        logger.error("Error sending customer confirmation email:", emailError);
        // Don't fail the request creation if email fails
      }

      // Send notification email to admin
      try {
        const adminEmailContent = await generateAdminNotificationEmail(request);
        const customerNameForSubject = request.personalInfo?.firstName && request.personalInfo?.lastName
          ? `${request.personalInfo.firstName} ${request.personalInfo.lastName}`
          : customer?.name || "Customer";
        emailQueue.add({
          subject: `New Availability Request - ${trip.mainTitle} - ${customerNameForSubject}`,
          content: adminEmailContent,
          recipients: ["notifications@zanzisafaris.com"],
        });
        logger.info(`[Email] Admin notification email queued for request ${request._id}`);
      } catch (emailError) {
        logger.error("Error sending admin notification email:", emailError);
        // Don't fail the request creation if email fails
      }

      return responseReturn(res, 201, {
        message: "Availability request submitted successfully",
        request,
      });
    } catch (error) {
      logger.error("Error creating urgent booking request:", error);
      return responseReturn(res, 500, {
        message: "Internal server error",
        error: error.message,
      });
    }
  };

  // Check if booking is allowed for a user-trip-date combination
  checkBookingEligibility = async (req, res) => {
    try {
      const { customerId, tripId, requestedDate, selectedCategory } = req.query;

      if (!customerId || !tripId || !requestedDate || !selectedCategory) {
        return responseReturn(res, 400, {
          message:
            "Missing required parameters: customerId, tripId, requestedDate, and selectedCategory are required.",
        });
      }

      // Convert customerId to ObjectId
      let customerObjectId;
      try {
        customerObjectId = new mongoose.Types.ObjectId(customerId);
      } catch (error) {
        logger.error("Invalid customerId format in checkBookingEligibility:", customerId, error);
        return responseReturn(res, 400, {
          message: "Invalid customer ID format",
        });
      }

      // Convert tripId to ObjectId
      let tripObjectId;
      try {
        tripObjectId = new mongoose.Types.ObjectId(tripId);
      } catch (error) {
        logger.error("Invalid tripId format in checkBookingEligibility:", tripId, error);
        return responseReturn(res, 400, {
          message: "Invalid trip ID format",
        });
      }

      // Check if there's an approved request
      const isAllowed = await UrgentBookingRequest.isBookingAllowed(
        customerObjectId,
        tripObjectId,
        requestedDate,
        selectedCategory
      );

      // Also check booking restriction

      const trip = await Trip.findById(tripObjectId).populate("category");
      if (!trip) {
        return responseReturn(res, 404, {
          message: "Trip not found",
        });
      }

      const restrictionCheck = await checkBookingRestriction({
        tripId: tripObjectId,
        selectedCategory,
        startingDate: requestedDate,
        categoryName: trip.category?.name || "",
        categoryId: trip.category?._id || null,
      });

      return responseReturn(res, 200, {
        allowed: isAllowed || !restrictionCheck.blocked,
        blocked: restrictionCheck.blocked && !isAllowed,
        hasApprovedRequest: isAllowed,
        restrictionCheck,
      });
    } catch (error) {
      logger.error("Error checking booking eligibility:", error);
      return responseReturn(res, 500, {
        message: "Internal server error",
        error: error.message,
      });
    }
  };

  // Get all requests for a logged-in user
  getUserRequests = async (req, res) => {
    try {
      const { customerId } = req.query;

      if (!customerId) {
        return responseReturn(res, 400, {
          message: "customerId is required",
        });
      }

      const requests = await UrgentBookingRequest.find({ customerId })
        .populate("tripId", "mainTitle mainImage")
        .populate("customerId", "name email")
        .sort({ createdAt: -1 });

      return responseReturn(res, 200, {
        requests,
        total: requests.length,
      });
    } catch (error) {
      logger.error("Error fetching user requests:", error);
      return responseReturn(res, 500, {
        message: "Internal server error",
        error: error.message,
      });
    }
  };

  // Delete a rejected request (only for rejected requests by the customer)
  deleteRequest = async (req, res) => {
    try {
      const { requestId } = req.params;
      const { customerId } = req.query;

      if (!customerId) {
        return responseReturn(res, 400, {
          message: "customerId is required",
        });
      }

      // Convert to ObjectId
      let requestObjectId;
      let customerObjectId;
      try {
        requestObjectId = new mongoose.Types.ObjectId(requestId);
        customerObjectId = new mongoose.Types.ObjectId(customerId);
      } catch (error) {
        return responseReturn(res, 400, {
          message: "Invalid ID format",
        });
      }

      // Find the request
      const request = await UrgentBookingRequest.findById(requestObjectId);

      if (!request) {
        return responseReturn(res, 404, {
          message: "Request not found",
        });
      }

      // Verify the request belongs to the customer
      if (request.customerId.toString() !== customerObjectId.toString()) {
        return responseReturn(res, 403, {
          message: "You can only delete your own requests",
        });
      }

      // Only allow deletion of rejected requests
      if (request.status !== "rejected") {
        return responseReturn(res, 400, {
          message: "Only rejected requests can be deleted",
        });
      }

      // Delete the request
      await UrgentBookingRequest.findByIdAndDelete(requestObjectId);

      return responseReturn(res, 200, {
        message: "Request deleted successfully",
      });
    } catch (error) {
      logger.error("Error deleting request:", error);
      return responseReturn(res, 500, {
        message: "Internal server error",
        error: error.message,
      });
    }
  };
}

module.exports = new UrgentBookingRequestController();

