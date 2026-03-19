const ImpactStatModel = require("../../models/impactStat");
const logger = require('./../../utilities/logger');
const { responseReturn } = require("../../utilities/response");
const mongoose = require("mongoose");
const redis = require('../../redis');

class ImpactStatController {
  // Add Impact Stat
  add_impact_stat = async (req, res) => {
    try {
      const { value, label, sublabel, prefix, suffix, labelStyle, duration, order } = req.body;

      const newImpactStat = {
        value: parseFloat(value) || 0,
        label: label || "",
        sublabel: sublabel || "",
        prefix: prefix || "",
        suffix: suffix || "",
        labelStyle: labelStyle || "normal",
        duration: parseInt(duration) || 2000,
        order: parseInt(order) || 0,
      };

      const createdImpactStat = await ImpactStatModel.create(newImpactStat);
      responseReturn(res, 201, {
        message: "Impact Stat Added Successfully",
        impactStat: createdImpactStat,
      });
    } catch (error) {
      logger.error("Error adding impact stat:", error);
      responseReturn(res, 500, {
        error: "Internal server error",
        details: error.message,
      });
    }
  };

  // Update Impact Stat
  update_impact_stat = async (req, res) => {
    try {
      const { impactStatId } = req.params;
      const { value, label, sublabel, prefix, suffix, labelStyle, duration, order } = req.body;

      const existingImpactStat = await ImpactStatModel.findById(impactStatId);
      if (!existingImpactStat) {
        return responseReturn(res, 404, { error: "Impact Stat not found" });
      }

      const updateFields = {
        value: parseFloat(value) !== undefined ? parseFloat(value) : existingImpactStat.value,
        label: label || existingImpactStat.label,
        sublabel: sublabel || existingImpactStat.sublabel,
        prefix: prefix !== undefined ? prefix : existingImpactStat.prefix,
        suffix: suffix !== undefined ? suffix : existingImpactStat.suffix,
        labelStyle: labelStyle || existingImpactStat.labelStyle,
        duration: parseInt(duration) !== undefined ? parseInt(duration) : existingImpactStat.duration,
        order: parseInt(order) !== undefined ? parseInt(order) : existingImpactStat.order,
      };

      const updatedImpactStat = await ImpactStatModel.findByIdAndUpdate(
        impactStatId,
        updateFields,
        { new: true, runValidators: true }
      );
      await redis.del(`home:impact-stats`);
      responseReturn(res, 200, {
        message: "Impact Stat updated successfully",
        impactStat: updatedImpactStat,
      });
    } catch (error) {
      logger.error("Error updating impact stat:", error);
      responseReturn(res, 500, {
        error: "Internal server error",
        details: error.message,
      });
    }
  };

  // Get Impact Stats
  get_impact_stats = async (req, res) => {
    const { page, parPage } = req.query;
    const key=`home:impact-stats` 
    try {
      const cached = await redis.get(key)
      if (cached) {
        return responseReturn(res, 200, JSON.parse(cached))
      }
      let skipPage = "";
      if (parPage && page) {
        skipPage = +parPage * (+page - 1);
      }
      let impactStatsQuery = ImpactStatModel.find({});
      if (page && parPage) {
        impactStatsQuery = impactStatsQuery.skip(skipPage).limit(parPage);
      }
      impactStatsQuery = impactStatsQuery.sort({ order: 1, createdAt: -1 });
      const impactStats = await impactStatsQuery;
      const totalImpactStats = await ImpactStatModel.countDocuments({});
      await redis.set(key, JSON.stringify(transformedPdfs), "EX", 86400);
      responseReturn(res, 200, {
        totalImpactStats,
        impactStats,
      });
    } catch (error) {
      responseReturn(res, 500, { error: "internal server error" });
    }
  };

  // Get Active Impact Stats for Frontend
  get_active_impact_stats = async (req, res) => {
    try {
      const impactStats = await ImpactStatModel.find({ isActive: true })
        .sort({ order: 1, createdAt: -1 })
        .select("value label sublabel prefix suffix labelStyle duration");

      responseReturn(res, 200, {
        impactStats,
      });
    } catch (error) {
      responseReturn(res, 500, {
        error: "Error fetching impact stats",
        details: error.message,
      });
    }
  };

  // Get Single Impact Stat
  get_impact_stat = async (req, res) => {
    try {
      const { impactStatId } = req.params;
      const impactStat = await ImpactStatModel.findById(impactStatId);
      if (!impactStat) {
        return responseReturn(res, 404, { error: "Impact Stat not found" });
      }
      responseReturn(res, 200, { impactStat });
    } catch (error) {
      responseReturn(res, 500, { error: "internal server error" });
    }
  };

  // Delete Impact Stat
  delete_impact_stat = async (req, res) => {
    try {
      const { impactStatId } = req.params;
      const impactStat = await ImpactStatModel.findById(impactStatId);
      if (!impactStat) {
        return responseReturn(res, 404, { error: "Impact Stat not found" });
      }

      await ImpactStatModel.findByIdAndDelete(impactStatId);
      responseReturn(res, 200, { message: "Impact Stat deleted successfully" });
    } catch (error) {
      responseReturn(res, 500, { error: "internal server error" });
    }
  };

  // Toggle Impact Stat Status
  toggle_impact_stat_status = async (req, res) => {
    try {
      const { impactStatId } = req.params;
      const impactStat = await ImpactStatModel.findById(impactStatId);
      if (!impactStat) {
        return responseReturn(res, 404, { error: "Impact Stat not found" });
      }

      impactStat.isActive = !impactStat.isActive;
      await impactStat.save();

      responseReturn(res, 200, {
        message: "Impact Stat status updated successfully",
        impactStat,
      });
    } catch (error) {
      responseReturn(res, 500, { error: "internal server error" });
    }
  };

  // Delete Multiple Impact Stats
  delete_impact_stats = async (req, res) => {
    try {
      const { impactStatIds } = req.body;
      if (!Array.isArray(impactStatIds) || impactStatIds.length === 0) {
        return responseReturn(res, 400, { error: "Invalid impact stat IDs" });
      }

      await ImpactStatModel.deleteMany({ _id: { $in: impactStatIds } });
      responseReturn(res, 200, {
        message: "Impact Stats deleted successfully",
      });
    } catch (error) {
      responseReturn(res, 500, { error: "internal server error" });
    }
  };
}

module.exports = new ImpactStatController();

