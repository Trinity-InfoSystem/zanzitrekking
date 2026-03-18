const PartnerModel = require("../../models/partner");
const logger = require('./../../utilities/logger');
const { responseReturn } = require("../../utilities/response");
const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
const redis = require('../../redis');

class PartnerController {
  // Add Partner
  add_partner = async (req, res) => {
    try {
      const {
        name,
        badge,
        color,
        rating,
        reviews,
        website,
        description,
        order,
      } = req.body;

      // Extract the logo file
      const logoFile = req.file;
      const logo = logoFile ? logoFile.filename : null;
      const basePath = `${req.protocol}://${req.get("host")}/public/uploads/`;

      // Create new partner object
      const newPartner = {
        name,
        badge,
        color,
        rating: parseFloat(rating) || 0,
        reviews: parseInt(reviews) || 0,
        website: website || "",
        description: description || "",
        order: parseInt(order) || 0,
        logo: logo ? `${basePath}${logo}` : null,
      };

      // Create the partner in the database
      const createdPartner = await PartnerModel.create(newPartner);
      responseReturn(res, 201, {
        message: "Partner Added Successfully",
        partner: createdPartner,
      });
    } catch (error) {
      logger.error("Error adding partner:", error);
      res.status(500).json({
        message: error.message || "Internal server error",
        error: error.message,
        details: error.errors,
      });
    }
  };

  // Update Partner
  update_partner = async (req, res) => {
    try {
      const { partnerId } = req.params;
      const {
        name,
        badge,
        color,
        rating,
        reviews,
        website,
        description,
        order,
      } = req.body;

      // Fetch the existing partner
      const existingPartner = await PartnerModel.findById(partnerId);
      if (!existingPartner) {
        return responseReturn(res, 404, { error: "Partner not found" });
      }

      const basePath = `${req.protocol}://${req.get("host")}/public/uploads/`;

      // Prepare update fields
      const updateFields = {
        name: name || existingPartner.name,
        badge: badge || existingPartner.badge,
        color: color || existingPartner.color,
        rating: parseFloat(rating) || existingPartner.rating,
        reviews: parseInt(reviews) || existingPartner.reviews,
        website: website || existingPartner.website,
        description: description || existingPartner.description,
        order: parseInt(order) || existingPartner.order,
      };

      // Handle logo update
      const logoFile = req.file;
      if (logoFile) {
        // Delete old logo if it exists
        if (existingPartner.logo) {
          const oldLogoFileName = path.basename(existingPartner.logo);
          const oldLogoPath = path.resolve(
            __dirname,
            "..",
            "..",
            "public",
            "uploads",
            oldLogoFileName
          );
          try {
            await fs.promises.unlink(oldLogoPath);
            logger.info("Deleted old logo:", oldLogoPath);
          } catch (err) {
            logger.error(`Error deleting old logo: ${err.message}`);
          }
        }
        updateFields.logo = `${basePath}${logoFile.filename}`;
      }

      // Update the partner
      const updatedPartner = await PartnerModel.findByIdAndUpdate(
        partnerId,
        updateFields,
        { new: true, runValidators: true }
      );

      await redis.del(`home:partners`);

      responseReturn(res, 200, {
        message: "Partner updated successfully",
        partner: updatedPartner,
      });
    } catch (error) {
      logger.error("Error updating partner:", error);
      responseReturn(res, 500, {
        error: "Internal server error",
        details: error.message,
        validationErrors: error.errors,
      });
    }
  };

  // Get Partners
  get_partners = async (req, res) => {
    const { page, searchValue, parPage } = req.query;
    const key=`home:partners` 
    try {
      let skipPage = "";
      if (parPage && page) {
        skipPage = +parPage * (+page - 1);
      }
      let query = {};
      if (searchValue) {
        query.name = { $regex: searchValue, $options: "i" };
      }
      let partnersQuery = mongoose.model("Partner").find(query);
      if (page && parPage) {
        partnersQuery = partnersQuery.skip(skipPage).limit(parPage);
      }
      partnersQuery = partnersQuery.sort({ order: 1, createdAt: -1 });
      const partners = await partnersQuery;
      const totalPartners = await mongoose
        .model("Partner")
        .countDocuments(query);

      await redis.set(key, JSON.stringify({
        totalPartners,
        partners,
      }), "EX", 86400);

      responseReturn(res, 200, {
        totalPartners,
        partners,
      });
    } catch (error) {
      responseReturn(res, 500, { error: "internal server error" });
    }
  };

  // Get Active Partners for Frontend
  get_active_partners = async (req, res) => {
    try {
      const partners = await PartnerModel.find({ isActive: true })
        .sort({ order: 1, createdAt: -1 })
        .select("name logo badge color rating reviews website description");

      responseReturn(res, 200, {
        partners,
      });
    } catch (error) {
      responseReturn(res, 500, {
        error: "Error fetching partners",
        details: error.message,
      });
    }
  };

  // Get Single Partner
  get_partner = async (req, res) => {
    const { partnerId } = req.params;
    try {
      const partner = await mongoose.model("Partner").findById(partnerId);
      if (!partner) {
        return responseReturn(res, 404, { error: "No Partner Found" });
      }
      return responseReturn(res, 202, { partner });
    } catch (error) {
      return responseReturn(res, 500, { error: "Internal server error" });
    }
  };

  // Delete Partner
  delete_partner = async (req, res) => {
    const { partnerId } = req.params;
    try {
      // Fetch the existing partner from the database
      const partner = await PartnerModel.findById(partnerId);
      if (!partner) {
        return responseReturn(res, 404, { error: "Partner Not Found" });
      }

      // Delete the logo if it exists
      if (partner.logo) {
        const oldLogoFileName = path.basename(partner.logo);
        const oldLogoPath = path.resolve(
          __dirname,
          "..",
          "..",
          "public",
          "uploads",
          oldLogoFileName
        );

        fs.unlink(oldLogoPath, (err) => {
          if (err) {
            logger.error(`Error deleting old logo: ${err.message}`);
          } else {
            logger.info(`Successfully deleted old logo: ${oldLogoPath}`);
          }
        });
      }

      // Now that logo is deleted, proceed to remove the partner
      await PartnerModel.findByIdAndDelete(partnerId);

      responseReturn(res, 200, { message: "Partner deleted successfully" });
      logger.info("Partner Deleted:", partnerId);
    } catch (error) {
      logger.error("Error deleting partner:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  };

  // Toggle Partner Status
  toggle_partner_status = async (req, res) => {
    const { partnerId } = req.params;
    try {
      const partner = await PartnerModel.findById(partnerId);
      if (!partner) {
        return responseReturn(res, 404, { error: "Partner Not Found" });
      }

      partner.isActive = !partner.isActive;
      await partner.save();

      responseReturn(res, 200, {
        message: `Partner ${
          partner.isActive ? "activated" : "deactivated"
        } successfully`,
        partner,
      });
    } catch (error) {
      logger.error("Error toggling partner status:", error);
      responseReturn(res, 500, { error: "Internal server error" });
    }
  };

  // Bulk delete partners
  delete_partners = async (req, res) => {
    const { ids } = req.body;
    try {
      const deletedPartners = await PartnerModel.deleteMany({
        _id: { $in: ids },
      });
      return responseReturn(res, 200, {
        message: `Deleted ${deletedPartners.deletedCount} partners successfully`,
        deletedCount: deletedPartners.deletedCount,
      });
    } catch (err) {
      logger.error("Error deleting partners:", err);
      return responseReturn(res, 500, { error: "Internal server error" });
    }
  };
}

module.exports = new PartnerController();
