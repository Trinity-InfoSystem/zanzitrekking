const UrgentBookingRequest = require("../../models/urgentBookingRequest");
const Trip = require("../../models/trip");
const { responseReturn } = require("../../utilities/response");
const mongoose = require("mongoose");
const emailQueue = require("../../workers/emailQueue");
const {
  generateRequestApprovalEmail,
  generateRequestRejectionEmail,
} = require("../../utilities/urgentBookingEmailTemplates");

class AdminUrgentBookingRequestController {
  // Get all requests with filters (for admin dashboard)
  getAllRequests = async (req, res) => {
    try {
      const {
        page = 1,
        limit = 10,
        status,
        tripId,
        searchValue,
        dateFrom,
        dateTo,
        sortBy = "createdAt",
        sortOrder = "desc",
      } = req.query;

      const skip = (parseInt(page) - 1) * parseInt(limit);

      // Build query
      const query = {};
      if (status) query.status = status;
      if (tripId) {
        try {
          query.tripId = new mongoose.Types.ObjectId(tripId);
        } catch (error) {
          return responseReturn(res, 400, {
            message: "Invalid trip ID format",
          });
        }
      }

      // Date range filter
      if (dateFrom || dateTo) {
        query.requestedDate = {};
        if (dateFrom) {
          query.requestedDate.$gte = new Date(dateFrom);
        }
        if (dateTo) {
          query.requestedDate.$lte = new Date(dateTo);
        }
      }

      // Search filter
      if (searchValue) {
        query.$or = [
          { "personalInfo.firstName": { $regex: searchValue, $options: "i" } },
          { "personalInfo.lastName": { $regex: searchValue, $options: "i" } },
          { "personalInfo.email": { $regex: searchValue, $options: "i" } },
          { tripTitle: { $regex: searchValue, $options: "i" } },
        ];
      }

      // Get requests with pagination
      const requests = await UrgentBookingRequest.find(query)
        .populate("customerId", "name email image")
        .populate("tripId", "mainTitle mainImage")
        .populate("approvedBy", "name email")
        .sort({ [sortBy]: sortOrder === "desc" ? -1 : 1 })
        .skip(skip)
        .limit(parseInt(limit));

      // Get total count
      const totalRequests = await UrgentBookingRequest.countDocuments(query);

      // Get status counts
      const statusCounts = await UrgentBookingRequest.aggregate([
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
          },
        },
      ]);

      const stats = {
        total: totalRequests,
        pending: 0,
        approved: 0,
        rejected: 0,
      };

      statusCounts.forEach((item) => {
        stats[item._id] = item.count;
      });

      return responseReturn(res, 200, {
        requests,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalRequests / parseInt(limit)),
          totalRequests,
          hasNext: skip + requests.length < totalRequests,
          hasPrev: parseInt(page) > 1,
        },
        stats,
      });
    } catch (error) {
      console.error("Error getting all urgent booking requests:", error);
      return responseReturn(res, 500, { message: "Internal server error" });
    }
  };

  // Update request status (approve, reject)
  updateRequestStatus = async (req, res) => {
    try {
      const { requestId } = req.params;
      const { status, adminNotes, rejectedReason } = req.body;
      const adminId = req.adminId || req.userId; // Get admin ID from auth middleware

      // Validate status
      const validStatuses = ["pending", "approved", "rejected"];
      if (!validStatuses.includes(status)) {
        return responseReturn(res, 400, {
          message: "Invalid status. Must be pending, approved, or rejected",
        });
      }

      const request = await UrgentBookingRequest.findById(requestId)
        .populate("tripId", "mainTitle")
        .populate("customerId", "name email");

      if (!request) {
        return responseReturn(res, 404, {
          message: "Request not found",
        });
      }

      // Update request
      const updateData = {
        status,
      };

      if (status === "approved") {
        updateData.approvedBy = adminId;
        updateData.approvedAt = new Date();
        if (adminNotes) {
          updateData.adminNotes = adminNotes.trim();
        }
      } else if (status === "rejected") {
        if (rejectedReason) {
          updateData.rejectedReason = rejectedReason.trim();
        }
        if (adminNotes) {
          updateData.adminNotes = adminNotes.trim();
        }
      }

      const updatedRequest = await UrgentBookingRequest.findByIdAndUpdate(
        requestId,
        updateData,
        { new: true }
      )
        .populate("customerId", "name email")
        .populate("tripId", "mainTitle")
        .populate("approvedBy", "name email");

      // Send email notification
      try {
        const customerEmail = request.personalInfo?.email;
        if (customerEmail) {
          if (status === "approved") {
            // Generate checkout URL (frontend URL)
            const frontendUrl =
              process.env.FRONTEND_URL || "http://localhost:3000";
            const checkoutUrl = `${frontendUrl}/checkout?trip=${
              request.tripId
            }&date=${request.requestedDate.toISOString()}&category=${
              request.selectedCategory
            }&travelers=${request.travelersNumber}`;

            const emailData = await generateRequestApprovalEmail(
              updatedRequest,
              checkoutUrl
            );
            emailQueue.add({
              subject: `Availability Request Approved - ${
                request.tripTitle || request.tripId?.mainTitle || "Trip"
              }`,
              content: emailData.html,
              recipients: [customerEmail],
              attachment: emailData.attachment,
            });
            console.log(
              `[Urgent Booking Request] Approval email queued for request ${requestId}`
            );
          } else if (status === "rejected") {
            const emailData = await generateRequestRejectionEmail(
              updatedRequest
            );
            emailQueue.add({
              subject: `Availability Request Update - ${
                request.tripTitle || request.tripId?.mainTitle || "Trip"
              }`,
              content: emailData.html,
              recipients: [customerEmail],
              attachment: emailData.attachment,
            });
            console.log(
              `[Urgent Booking Request] Rejection email queued for request ${requestId}`
            );
          }
        }
      } catch (emailError) {
        console.error(
          "[Urgent Booking Request] Error sending notification email:",
          emailError
        );
        // Don't fail the status update if email fails
      }

      return responseReturn(res, 200, {
        message: `Request ${status} successfully`,
        request: updatedRequest,
      });
    } catch (error) {
      console.error("Error updating request status:", error);
      return responseReturn(res, 500, { message: "Internal server error" });
    }
  };

  // Get request statistics
  getRequestStats = async (req, res) => {
    try {
      const statusCounts = await UrgentBookingRequest.aggregate([
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
          },
        },
      ]);

      const stats = {
        total: 0,
        pending: 0,
        approved: 0,
        rejected: 0,
      };

      statusCounts.forEach((item) => {
        stats.total += item.count;
        stats[item._id] = item.count;
      });

      // Get urgent requests count (daysUntilTrip < threshold)
      const urgentCount = await UrgentBookingRequest.countDocuments({
        $or: [
          {
            // Safari trips with < 4 days
            categoryName: { $regex: /safari/i },
            daysUntilTrip: { $lt: 4 },
          },
          {
            // Other trips with < 1 day
            categoryName: { $not: { $regex: /safari/i } },
            daysUntilTrip: { $lt: 1 },
          },
        ],
        status: "pending",
      });

      return responseReturn(res, 200, {
        stats: {
          ...stats,
          urgent: urgentCount,
        },
      });
    } catch (error) {
      console.error("Error getting request stats:", error);
      return responseReturn(res, 500, { message: "Internal server error" });
    }
  };

  // Bulk update request status
  bulkUpdateStatus = async (req, res) => {
    try {
      const { requestIds, status, adminNotes, rejectedReason } = req.body;
      const adminId = req.adminId || req.userId;

      // Validate
      if (!Array.isArray(requestIds) || requestIds.length === 0) {
        return responseReturn(res, 400, {
          message: "requestIds must be a non-empty array",
        });
      }

      const validStatuses = ["pending", "approved", "rejected"];
      if (!validStatuses.includes(status)) {
        return responseReturn(res, 400, {
          message: "Invalid status",
        });
      }

      // Build update data
      const updateData = {
        status,
      };

      if (status === "approved") {
        updateData.approvedBy = adminId;
        updateData.approvedAt = new Date();
        if (adminNotes) {
          updateData.adminNotes = adminNotes.trim();
        }
      } else if (status === "rejected") {
        if (rejectedReason) {
          updateData.rejectedReason = rejectedReason.trim();
        }
        if (adminNotes) {
          updateData.adminNotes = adminNotes.trim();
        }
      }

      // Update all requests
      const result = await UrgentBookingRequest.updateMany(
        { _id: { $in: requestIds } },
        updateData
      );

      // Send email notifications for each updated request
      if (result.modifiedCount > 0) {
        const updatedRequests = await UrgentBookingRequest.find({
          _id: { $in: requestIds },
        })
          .populate("tripId", "mainTitle")
          .populate("customerId", "name email");

        for (const request of updatedRequests) {
          try {
            const customerEmail = request.personalInfo?.email;
            if (customerEmail) {
              if (status === "approved") {
                const frontendUrl =
                  process.env.FRONTEND_URL || "http://localhost:3000";
                const checkoutUrl = `${frontendUrl}/checkout?trip=${
                  request.tripId
                }&date=${request.requestedDate.toISOString()}&category=${
                  request.selectedCategory
                }&travelers=${request.travelersNumber}`;

                const emailData = await generateRequestApprovalEmail(
                  request,
                  checkoutUrl
                );
                emailQueue.add({
                  subject: `Availability Request Approved - ${
                    request.tripTitle || request.tripId?.mainTitle || "Trip"
                  }`,
                  content: emailData.html,
                  recipients: [customerEmail],
                  attachment: emailData.attachment,
                });
              } else if (status === "rejected") {
                const emailData = await generateRequestRejectionEmail(request);
                emailQueue.add({
                  subject: `Availability Request Update - ${
                    request.tripTitle || request.tripId?.mainTitle || "Trip"
                  }`,
                  content: emailData.html,
                  recipients: [customerEmail],
                  attachment: emailData.attachment,
                });
              }
            }
          } catch (emailError) {
            console.error(
              `[Urgent Booking Request] Error sending email for request ${request._id}:`,
              emailError
            );
            // Continue with other requests even if one email fails
          }
        }
      }

      return responseReturn(res, 200, {
        message: `${result.modifiedCount} requests updated to ${status}`,
        modifiedCount: result.modifiedCount,
      });
    } catch (error) {
      console.error("Error bulk updating requests:", error);
      return responseReturn(res, 500, { message: "Internal server error" });
    }
  };

  // Get a single request by ID
  getRequestById = async (req, res) => {
    try {
      const { requestId } = req.params;

      const request = await UrgentBookingRequest.findById(requestId)
        .populate("customerId", "name email image")
        .populate("tripId", "mainTitle mainImage")
        .populate("approvedBy", "name email");

      if (!request) {
        return responseReturn(res, 404, {
          message: "Request not found",
        });
      }

      return responseReturn(res, 200, {
        request,
      });
    } catch (error) {
      console.error("Error getting request by ID:", error);
      return responseReturn(res, 500, { message: "Internal server error" });
    }
  };
}

module.exports = new AdminUrgentBookingRequestController();
