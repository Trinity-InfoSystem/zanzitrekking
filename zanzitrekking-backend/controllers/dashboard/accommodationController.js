const Accommodation = require("../../models/accommodation");
const logger = require('./../../utilities/logger');
const { responseReturn } = require("../../utilities/response");
const StringSimilarity = require("../../utilities/stringSimilarity");
const { publicUploadsRef } = require("../../utilities/storedAssetPath");

class AccommodationControllers {
  // Adding new accommodation
  add_accommodation = async (req, res) => {
    try {
      const fields = req.body;
      const files = req.files;

      // Check if name is provided
      if (!fields.name) {
        return responseReturn(res, 400, { error: "Name is required" });
      }

      // Check for similar existing accommodations
      const existingAccommodations = await Accommodation.find({});
      const existingNames = existingAccommodations.map(acc => acc.name);
      
      const similarityCheck = StringSimilarity.checkSimilarity(fields.name, existingNames, 80);
      
      if (similarityCheck) {
        return responseReturn(res, 409, {
          error: "This item already exists or is very similar to an existing one.",
          similarItem: similarityCheck.string,
          similarity: similarityCheck.similarity
        });
      }

      // Prepare images array if files are uploaded
      let images = [];
      if (files && files.length > 0) {
        images = files.map((file) => publicUploadsRef(file.filename));
      }

      // Prepare amenities and contact
      let amenities = [];
      if (fields.amenities && typeof fields.amenities === "string") {
        amenities = fields.amenities.split(",").map((a) => a.trim());
      }
      let contact = fields.contact;
      if (contact && typeof contact === "string") {
        contact = JSON.parse(contact);
      }

      // Create the accommodation
      const accommodation = await Accommodation.create({
        ...fields,
        images,
        amenities,
        contact,
      });

      responseReturn(res, 201, {
        message: "Accommodation Added Successfully",
        accommodation,
      });
    } catch (error) {
      logger.error("Error adding accommodation:", error);
      responseReturn(res, 500, { error: "Internal server error" });
    }
  };
  get_accommodation = async (req, res) => {
    const { accommodationId } = req.params;

    try {
      const accommodation = await Accommodation.findById(accommodationId);
      if (!accommodation) {
        return responseReturn(res, 404, { error: "No Accommodation Found" });
      }
      return responseReturn(res, 202, { accommodation });
    } catch (error) {
      return responseReturn(res, 500, { error: "Internal server error" });
    }
  };
  // Getting accommodation list with pagination and search
  get_accommodations = async (req, res) => {
    const {
      page,
      searchValue,
      parPage,
      allAccommodations = "false",
      sort = "newest-desc",
    } = req.query;

    try {
      // Determine sort order
      let sortOptions = {};
      let collation = null;
      if (sort === "name-asc") {
        sortOptions = { name: 1 }; // A-Z
        collation = { locale: "en", strength: 2 }; // Case-insensitive collation
      } else if (sort === "name-desc") {
        sortOptions = { name: -1 }; // Z-A
        collation = { locale: "en", strength: 2 }; // Case-insensitive collation
      } else if (sort === "newest-asc") {
        sortOptions = { createdAt: 1 }; // Oldest first
      } else {
        sortOptions = { createdAt: -1 }; // Newest first (default)
      }

      let skipPage = "";
      if (parPage && page) {
        skipPage = +parPage * (+page - 1);
      }
      if (searchValue && page && parPage && allAccommodations === "false") {
        let query = Accommodation.find({
          name: { $regex: searchValue, $options: "i" },
        })
          .skip(skipPage)
          .limit(parPage);
        
        if (collation) {
          query = query.sort(sortOptions).collation(collation);
        } else {
          query = query.sort(sortOptions);
        }
        
        const accommodations = await query;
        const totalAccommodations = await Accommodation.find({
          name: { $regex: searchValue, $options: "i" },
        }).countDocuments();
        responseReturn(res, 200, {
          totalAccommodations,
          accommodations,
        });
      } else if (
        searchValue === "" &&
        page &&
        parPage &&
        allAccommodations === "false"
      ) {
        let query = Accommodation.find({})
          .skip(skipPage)
          .limit(parPage);
        
        if (collation) {
          query = query.sort(sortOptions).collation(collation);
        } else {
          query = query.sort(sortOptions);
        }
        
        const accommodations = await query;
        const totalAccommodations = await Accommodation.find(
          {}
        ).countDocuments();
        responseReturn(res, 200, {
          totalAccommodations,
          accommodations,
        });
      } else {
        let query = Accommodation.find({});
        
        if (collation) {
          query = query.sort(sortOptions).collation(collation);
        } else {
          query = query.sort(sortOptions);
        }
        
        const accommodations = await query;
        const totalAccommodations = await Accommodation.find(
          {}
        ).countDocuments();
        responseReturn(res, 200, {
          totalAccommodations,
          accommodations,
          message: "accommodations successfully fetched",
        });
      }
    } catch (error) {
      responseReturn(res, 500, { error: "internal server error" });
    }
  };
  update_accommodation = async (req, res) => {
    const { accommodationId } = req.params;
    const fields = req.body;
    const files = req.files;

    // Check if name is provided
    if (!fields.name) {
      return responseReturn(res, 400, { error: "Name is required" });
    }

    try {
      const accommodation = await Accommodation.findById(accommodationId);
      if (!accommodation) {
        return responseReturn(res, 404, {
          error: "Couldn't find matching accommodation",
        });
      }

      // Handle deleted images
      if (fields.deletedImages) {
        let deletedImages = [];
        try {
          deletedImages = JSON.parse(fields.deletedImages);
        } catch (e) {
          deletedImages = [];
        }
        if (Array.isArray(deletedImages) && deletedImages.length > 0) {
          // Remove from images array
          accommodation.images = (accommodation.images || []).filter(
            (img) => !deletedImages.includes(img)
          );
          // Delete files from disk
          const path = require("path");
          const fs = require("fs");
          deletedImages.forEach((imgUrl) => {
            const filename = imgUrl.split("/").pop();
            const filePath = path.resolve(
              __dirname,
              "../../../public/uploads",
              filename
            );
            fs.unlink(filePath, (err) => {
              if (err) {
                logger.error(`Error deleting image: ${filePath}`, err.message);
              }
            });
          });
        }
      }

      // If images are uploaded, update the images array
      if (files && files.length > 0) {
        const newImages = files.map((file) => publicUploadsRef(file.filename));
        accommodation.images = [...(accommodation.images || []), ...newImages];
      }

      // Update other fields from req.body
      Object.keys(fields).forEach((key) => {
        if (key === "contact" && typeof fields[key] === "string") {
          accommodation[key] = JSON.parse(fields[key]);
        } else if (key === "amenities" && typeof fields[key] === "string") {
          accommodation[key] = fields[key].split(",").map((a) => a.trim());
        } else if (key !== "images" && key !== "deletedImages") {
          accommodation[key] = fields[key];
        }
      });

      await accommodation.save();

      responseReturn(res, 200, {
        message: "Accommodation successfully updated",
        accommodation,
      });
    } catch (error) {
      responseReturn(res, 500, { error: "Internal server error" });
    }
  };
  delete_accommodation = async (req, res) => {
    const { accommodationId } = req.params;

    try {
      // Fetch the existing accommodation to check if it has an image
      const existingAccommodation = await Accommodation.findById(
        accommodationId
      );

      if (!existingAccommodation) {
        return responseReturn(res, 404, { error: "Accommodation not found" });
      }

      // Proceed to delete the accommodation
      const deletedAccommodation = await Accommodation.findByIdAndDelete(
        accommodationId
      );

      if (!deletedAccommodation) {
        return responseReturn(res, 404, { error: "Accommodation not found" });
      }

      return responseReturn(res, 200, {
        message: "Accommodation deleted successfully",
      });
    } catch (err) {
      logger.error("Error deleting accommodation:", err);
      return responseReturn(res, 500, { error: "Internal server error" });
    }
  };
  // Bulk delete accommodations
  delete_accommodations = async (req, res) => {
    const { ids } = req.body;
    try {
      const deletedAccommodations = await Accommodation.deleteMany({
        _id: { $in: ids },
      });

      return responseReturn(res, 200, {
        message: `Deleted ${deletedAccommodations.deletedCount} accommodations successfully`,
        deletedCount: deletedAccommodations.deletedCount,
      });
    } catch (err) {
      logger.error("Error deleting accommodations:", err);
      return responseReturn(res, 500, { error: "Internal server error" });
    }
  };
}

module.exports = new AccommodationControllers();
