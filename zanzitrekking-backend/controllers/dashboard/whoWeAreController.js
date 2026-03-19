const WhoWeAreModel = require("../../models/whoWeAre");
const logger = require('./../../utilities/logger');
const Trip = require("../../models/trip");
const Order = require("../../models/order");
const { responseReturn } = require("../../utilities/response");
const path = require("path");
const fs = require("fs");
const redis = require('../../redis');

class WhoWeAreController {
  get_whoWeAre = async (req, res) => {
    try {
      // Fetch the single instance of WhoWeAre
      const whoWeAre = await WhoWeAreModel.findOne({
        identifier: "single_instance",
      });

      if (!whoWeAre) {
        return responseReturn(res, 404, { error: "WhoWeAre data not found" });
      }

      // Respond with the found data
      responseReturn(res, 200, { whoWeAre });
    } catch (error) {
      // Handle any potential errors
      logger.error("Error fetching WhoWeAre data:", error);
      responseReturn(res, 500, {
        message: "Internal server error",
        error: error.message,
      });
    }
  };

  add_whoWeAre = async (req, res) => {
    try {
      const { mainTitle, paragraph } = req.body;
      const files = req.files;

      // Validate input
      const validationError = this.validateInput(mainTitle, paragraph, files);
      if (validationError) {
        return responseReturn(res, 400, { message: validationError });
      }

      // Find existing record
      const existingWhoWeAre = await WhoWeAreModel.findOne({
        identifier: "single_instance",
      });

      // Process new images
      const basePath = `${req.protocol}://${req.get("host")}/public/uploads/`;
      const newImages = this.processImages(files, basePath);

      // If no existing record, create new one
      if (!existingWhoWeAre) {
        if (!files || files.length < 3) {
          return responseReturn(res, 400, {
            message: "For initial creation, all three images are required",
          });
        }

        const whoWeAre = await WhoWeAreModel.create({
          identifier: "single_instance",
          mainTitle,
          paragraph,
          ...newImages,
        });

        return responseReturn(res, 200, {
          message: "WhoWeAre successfully created",
          whoWeAre,
        });
      }

      // Check if anything has changed
      const hasContentChanged =
        existingWhoWeAre.mainTitle !== mainTitle ||
        existingWhoWeAre.paragraph !== paragraph;

      const hasImagesChanged = files && files.length > 0;

      // If nothing has changed, return existing record
      if (!hasContentChanged && !hasImagesChanged) {
        return responseReturn(res, 200, {
          message: "No changes detected",
          whoWeAre: existingWhoWeAre,
        });
      }

      // Prepare update object
      const updateData = {
        mainTitle,
        paragraph,
      };

      // Only process and update images if new files were uploaded
      if (hasImagesChanged) {
        // Delete old images only for the fields being updated
        this.deleteOldImages(existingWhoWeAre, files);
        // Add new images to update data
        Object.assign(updateData, newImages);
      }

      // Update document
      const whoWeAre = await WhoWeAreModel.findOneAndUpdate(
        { identifier: "single_instance" },
        updateData,
        { new: true }
      );

      if (!whoWeAre) {
        throw new Error("Failed to update WhoWeAre document");
      }

      responseReturn(res, 200, {
        message: "WhoWeAre successfully updated",
        whoWeAre,
      });
    } catch (err) {
      logger.error("WhoWeAre Error:", err.message);
      responseReturn(res, 500, {
        error: err.message || "Internal server error",
      });
    }
  };

  validateInput(mainTitle, paragraph, files) {
    if (!mainTitle || !paragraph) {
      return "mainTitle and paragraph are required fields";
    }

    if (files && files.length > 0) {
      const validImageFields = ["image1", "image2", "image3"];
      const invalidFields = files.filter(
        (file) => !validImageFields.includes(file.fieldname)
      );

      if (invalidFields.length > 0) {
        return `Invalid image fields: ${invalidFields
          .map((f) => f.fieldname)
          .join(", ")}`;
      }
    }

    return null;
  }

  processImages(files, basePath) {
    if (!files) return {};
    return files.reduce((acc, file) => {
      acc[file.fieldname] = `${basePath}${file.filename}`;
      return acc;
    }, {});
  }

  deleteOldImages(existingRecord, newFiles) {
    const fieldsToUpdate = newFiles.map((file) => file.fieldname);

    for (const field of fieldsToUpdate) {
      if (existingRecord[field]) {
        try {
          const oldImageFileName = path.basename(existingRecord[field]);
          const oldImagePath = path.resolve(
            __dirname,
            "..",
            "..",
            "public",
            "uploads",
            oldImageFileName
          );

          if (fs.existsSync(oldImagePath)) {
            fs.unlink(oldImagePath, (err) => {
              if (err) {
                logger.error(
                  `Error deleting old image for ${field}: ${err.message}`
                );
              } else {
                logger.info(`Successfully deleted old image: ${oldImagePath}`);
              }
            });
          }
        } catch (err) {
          logger.error(
            `Error processing old image for ${field}: ${err.message}`
          );
        }
      }
    }
  }

  // get Statistic data
  get_statistic_data = async (req, res) => {
    const key=`home:statistics`
    try {
      const cached = await redis.get(key)
      if (cached) {
        return responseReturn(res, 200, JSON.parse(cached))
      }
      const totalTrips = await Trip.countDocuments();
      // overall rating
      const overallRating = await Trip.aggregate([
        { $group: { _id: null, total: { $sum: "$rating" } } },
      ]);
      // total order traveller
      const totalOrderTraveller = await Order.aggregate([
        {
          $unwind: "$cartItems", // Unwind the cartItems array first
        },
        {
          $group: {
            _id: null,
            total: { $sum: "$cartItems.travelersNumber" },
          },
        },
      ]);
      // total order revenue
      const totalOrderRevenue = await Order.aggregate([
        { $group: { _id: null, total: { $sum: "$totalAmount" } } },
      ]);
      
      await redis.set(key, JSON.stringify({
        statisticData: {
          totalTrips,
          totalOrderTraveller: totalOrderTraveller[0]?.total || 0,
          totalOrderRevenue: totalOrderRevenue[0]?.total || 0,
          overallRating: overallRating[0]?.total || 0,
        },
      }), "EX", 3600);
      responseReturn(res, 200, {
        statisticData: {
          totalTrips,
          totalOrderTraveller: totalOrderTraveller[0]?.total || 0,
          totalOrderRevenue: totalOrderRevenue[0]?.total || 0,
          overallRating: overallRating[0]?.total || 0,
        },
      });
    } catch (error) {
      responseReturn(res, 500, { error: error.message });
    }
  };
}

module.exports = new WhoWeAreController();
