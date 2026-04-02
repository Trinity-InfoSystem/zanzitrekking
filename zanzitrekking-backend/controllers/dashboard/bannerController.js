const Banner = require("../../models/banner");
const logger = require('./../../utilities/logger');
const { responseReturn } = require("../../utilities/response");
const fs = require("fs");
const path = require("path");
const { publicUploadsRef } = require("../../utilities/storedAssetPath");

class BannerController {
  create_banner = async (req, res) => {
    try {
      const banners = req.body.banners;
      const files = req.files || [];

      if (!banners || banners.length === 0) {
        return responseReturn(res, 404, { error: "No banners in the request" });
      }

      // Handle shared video
      const sharedVideoFile = files.find((f) => f.fieldname === 'sharedVideo');
      const sharedVideo = sharedVideoFile ? publicUploadsRef(sharedVideoFile.filename) : null;

      // Handle new banners creation
      let bannerData = [];

      // Map through each banner and files to assign them
      bannerData = banners.map((banner, index) => {
        const imageFile = files.find(
          (f) => f.fieldname === `banners[${index}][image]`
        );

        return {
          title: banner.title,
          description: banner.description,
          image: imageFile ? publicUploadsRef(imageFile.filename) : null,
        };
      });

      // Create a new banner document
      const newBanner = await Banner.create({ 
        title: req.title,
        description: req.description,
        sharedVideo: sharedVideo,
        banners: bannerData 
      });
      return responseReturn(res, 201, {
        message: "Banner created successfully",
        banner: newBanner,
      });
    } catch (err) {
      logger.error("Error in createBanner:", err);
      return responseReturn(res, 500, { error: "Internal server error" });
    }
  };

  update_banner = async (req, res) => {
    try {
      const banners = req.body.banners;
      const files = req.files || [];

      if (!banners || banners.length === 0) {
        return responseReturn(res, 404, { error: "No banners in the request" });
      }

      // Fetch the existing banner document
      const existingBanner = await Banner.findOne();
      if (!existingBanner) {
        return responseReturn(res, 404, { error: "No existing banners found" });
      }

      // Handle shared video update
      const sharedVideoFile = files.find((f) => f.fieldname === 'sharedVideo');
      let newSharedVideo = existingBanner.sharedVideo;

      if (sharedVideoFile) {
        // Delete the old shared video if it's being replaced
        if (existingBanner.sharedVideo) {
          const oldVideoPath = path.join(
            __dirname,
            "..",
            "public",
            "uploads",
            existingBanner.sharedVideo.split("/uploads/")[1]
          );

          // Check if the old video exists, then delete it
          if (fs.existsSync(oldVideoPath)) {
            try {
              await fs.promises.unlink(oldVideoPath); // Delete the old video
            } catch (error) {
              logger.error("Error deleting old video:", error);
            }
          }
        }

        newSharedVideo = `${basePath}${sharedVideoFile.filename}`;
      }

      // Process each banner (update title, description, and image if provided)
      const updatedBanners = banners.map((banner, index) => {
        const existingImage = existingBanner.banners[index]?.image;

        // Check if there's an image file for the current banner
        const imageFile = files.find(
          (f) => f.fieldname === `banners[${index}][image]`
        );

        let newImage = existingImage;

        // Handle image update
        if (imageFile) {
          // Delete the old image if it's being replaced
          if (existingImage) {
            const oldImagePath = path.join(
              __dirname,
              "..",
              "public",
              "uploads",
              existingImage.split("/uploads/")[1]
            );

            // Check if the old image exists, then delete it
            if (fs.existsSync(oldImagePath)) {
              try {
                fs.unlinkSync(oldImagePath); // Delete the old image
              } catch (error) {
                logger.error("Error deleting old image:", error);
              }
            }
          }

          newImage = publicUploadsRef(imageFile.filename);
        }

        return {
          title: banner.title,
          description: banner.description,
          image: newImage,
        };
      });

      // Update the existing banner with the new data
      existingBanner.sharedVideo = newSharedVideo;
      existingBanner.banners = updatedBanners;
      existingBanner.title= req.title;
      existingBanner.description = req.description;

      // Save the updated banner
      const savedBanner = await existingBanner.save();

      return responseReturn(res, 200, {
        message: "Banner updated successfully",
        banner: savedBanner,
      });
    } catch (err) {
      logger.error("Error in updateBanner:", err);
      return responseReturn(res, 500, { error: "Internal server error" });
    }
  };
  fetchBanner = async (req, res) => {
    try {
      const banner = await Banner.findOne(); // Fetch the single banner document

      if (!banner) {
        return res.status(404).json({ message: "Banner not found" });
      }

      res.status(200).json({ banner });
    } catch (error) {
      logger.error("Error fetching banner:", error);
      res.status(500).json({ message: "Server error" });
    }
  };
}

module.exports = new BannerController();
