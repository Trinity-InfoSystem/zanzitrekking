const AchievementModel = require("../../models/achievement");
const logger = require('./../../utilities/logger');
const { responseReturn } = require("../../utilities/response");
const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");

class AchievementController {
  // Add Achievement
  add_achievement = async (req, res) => {
    try {
      const {
        name,
        fullName,
        status,
        imageUrl,
        icon,
        color,
        iconColor,
        type,
        order,
      } = req.body;

      // Extract the image file if uploaded
      const imageFile = req.file;
      const basePath = `${req.protocol}://${req.get("host")}/public/uploads/`;

      // Use uploaded file or URL
      const image = imageFile ? `${basePath}${imageFile.filename}` : null;

      const newAchievement = {
        name,
        fullName,
        status,
        image: image || null,
        imageUrl: imageUrl || null,
        icon: icon || null,
        color: color || "bg-primary-50",
        iconColor: iconColor || "text-primary-600",
        type: type || "certification",
        order: parseInt(order) || 0,
      };

      const createdAchievement = await AchievementModel.create(newAchievement);
      responseReturn(res, 201, {
        message: "Achievement Added Successfully",
        achievement: createdAchievement,
      });
    } catch (error) {
      logger.error("Error adding achievement:", error);
      responseReturn(res, 500, {
        error: "Internal server error",
        details: error.message,
      });
    }
  };

  // Update Achievement
  update_achievement = async (req, res) => {
    try {
      const { achievementId } = req.params;
      const {
        name,
        fullName,
        status,
        imageUrl,
        icon,
        color,
        iconColor,
        type,
        order,
      } = req.body;

      const existingAchievement = await AchievementModel.findById(achievementId);
      if (!existingAchievement) {
        return responseReturn(res, 404, { error: "Achievement not found" });
      }

      const basePath = `${req.protocol}://${req.get("host")}/public/uploads/`;

      const updateFields = {
        name: name || existingAchievement.name,
        fullName: fullName || existingAchievement.fullName,
        status: status || existingAchievement.status,
        icon: icon || existingAchievement.icon,
        color: color || existingAchievement.color,
        iconColor: iconColor || existingAchievement.iconColor,
        type: type || existingAchievement.type,
        order: parseInt(order) !== undefined ? parseInt(order) : existingAchievement.order,
      };

      // Handle image update
      const imageFile = req.file;
      if (imageFile) {
        // Delete old image if it exists and was uploaded
        if (existingAchievement.image && existingAchievement.image.includes("/public/uploads/")) {
          const oldImageFileName = path.basename(existingAchievement.image);
          const oldImagePath = path.resolve(
            __dirname,
            "..",
            "..",
            "public",
            "uploads",
            oldImageFileName
          );
          if (fs.existsSync(oldImagePath)) {
            try {
              await fs.promises.unlink(oldImagePath);
            } catch (error) {
              logger.error("Error deleting old image:", error);
            }
          }
        }
        updateFields.image = `${basePath}${imageFile.filename}`;
        updateFields.imageUrl = null; // Clear URL if file uploaded
      } else if (imageUrl !== undefined) {
        // If URL provided, use it and clear uploaded image
        updateFields.imageUrl = imageUrl || null;
        if (imageUrl && existingAchievement.image && existingAchievement.image.includes("/public/uploads/")) {
          const oldImageFileName = path.basename(existingAchievement.image);
          const oldImagePath = path.resolve(
            __dirname,
            "..",
            "..",
            "public",
            "uploads",
            oldImageFileName
          );
          if (fs.existsSync(oldImagePath)) {
            try {
              await fs.promises.unlink(oldImagePath);
            } catch (error) {
              logger.error("Error deleting old image:", error);
            }
          }
        }
        updateFields.image = null;
      }

      const updatedAchievement = await AchievementModel.findByIdAndUpdate(
        achievementId,
        updateFields,
        { new: true, runValidators: true }
      );

      responseReturn(res, 200, {
        message: "Achievement updated successfully",
        achievement: updatedAchievement,
      });
    } catch (error) {
      logger.error("Error updating achievement:", error);
      responseReturn(res, 500, {
        error: "Internal server error",
        details: error.message,
      });
    }
  };

  // Get Achievements
  get_achievements = async (req, res) => {
    const { page, searchValue, parPage, type } = req.query;

    try {
      let skipPage = "";
      if (parPage && page) {
        skipPage = +parPage * (+page - 1);
      }
      let query = {};
      if (searchValue) {
        query.$or = [
          { name: { $regex: searchValue, $options: "i" } },
          { fullName: { $regex: searchValue, $options: "i" } },
        ];
      }
      if (type) {
        query.type = type;
      }
      let achievementsQuery = AchievementModel.find(query);
      if (page && parPage) {
        achievementsQuery = achievementsQuery.skip(skipPage).limit(parPage);
      }
      achievementsQuery = achievementsQuery.sort({ order: 1, createdAt: -1 });
      const achievements = await achievementsQuery;
      const totalAchievements = await AchievementModel.countDocuments(query);
      responseReturn(res, 200, {
        totalAchievements,
        achievements,
      });
    } catch (error) {
      responseReturn(res, 500, { error: "internal server error" });
    }
  };

  // Get Active Achievements for Frontend
  get_active_achievements = async (req, res) => {
    try {
      const { type } = req.query;
      let query = { isActive: true };
      if (type) {
        query.type = type;
      }
      const achievements = await AchievementModel.find(query)
        .sort({ order: 1, createdAt: -1 })
        .select("name fullName status image imageUrl icon color iconColor type");

      responseReturn(res, 200, {
        achievements,
      });
    } catch (error) {
      responseReturn(res, 500, {
        error: "Error fetching achievements",
        details: error.message,
      });
    }
  };

  // Get Single Achievement
  get_achievement = async (req, res) => {
    try {
      const { achievementId } = req.params;
      const achievement = await AchievementModel.findById(achievementId);
      if (!achievement) {
        return responseReturn(res, 404, { error: "Achievement not found" });
      }
      responseReturn(res, 200, { achievement });
    } catch (error) {
      responseReturn(res, 500, { error: "internal server error" });
    }
  };

  // Delete Achievement
  delete_achievement = async (req, res) => {
    try {
      const { achievementId } = req.params;
      const achievement = await AchievementModel.findById(achievementId);
      if (!achievement) {
        return responseReturn(res, 404, { error: "Achievement not found" });
      }

      // Delete image file if exists
      if (achievement.image && achievement.image.includes("/public/uploads/")) {
        const imageFileName = path.basename(achievement.image);
        const imagePath = path.resolve(
          __dirname,
          "..",
          "..",
          "public",
          "uploads",
          imageFileName
        );
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
        }
      }

      await AchievementModel.findByIdAndDelete(achievementId);
      responseReturn(res, 200, { message: "Achievement deleted successfully" });
    } catch (error) {
      responseReturn(res, 500, { error: "internal server error" });
    }
  };

  // Toggle Achievement Status
  toggle_achievement_status = async (req, res) => {
    try {
      const { achievementId } = req.params;
      const achievement = await AchievementModel.findById(achievementId);
      if (!achievement) {
        return responseReturn(res, 404, { error: "Achievement not found" });
      }

      achievement.isActive = !achievement.isActive;
      await achievement.save();

      responseReturn(res, 200, {
        message: "Achievement status updated successfully",
        achievement,
      });
    } catch (error) {
      responseReturn(res, 500, { error: "internal server error" });
    }
  };

  // Delete Multiple Achievements
  delete_achievements = async (req, res) => {
    try {
      const { achievementIds } = req.body;
      if (!Array.isArray(achievementIds) || achievementIds.length === 0) {
        return responseReturn(res, 400, { error: "Invalid achievement IDs" });
      }

      const achievements = await AchievementModel.find({
        _id: { $in: achievementIds },
      });

      // Delete image files
      achievements.forEach((achievement) => {
        if (achievement.image && achievement.image.includes("/public/uploads/")) {
          const imageFileName = path.basename(achievement.image);
          const imagePath = path.resolve(
            __dirname,
            "..",
            "..",
            "public",
            "uploads",
            imageFileName
          );
          if (fs.existsSync(imagePath)) {
            fs.unlinkSync(imagePath);
          }
        }
      });

      await AchievementModel.deleteMany({ _id: { $in: achievementIds } });
      responseReturn(res, 200, {
        message: "Achievements deleted successfully",
      });
    } catch (error) {
      responseReturn(res, 500, { error: "internal server error" });
    }
  };
}

module.exports = new AchievementController();

