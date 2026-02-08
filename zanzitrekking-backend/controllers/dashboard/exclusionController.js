const Exclusion = require("../../models/exclusion");
const { responseReturn } = require("../../utilities/response");
const StringSimilarity = require("../../utilities/stringSimilarity");

class ExclusionControllers {
  // Adding new exclusion
  add_exclusion = async (req, res) => {
    const { name } = req.body;
    try {
      // Check for similar existing exclusions
      const existingExclusions = await Exclusion.find({});
      const existingNames = existingExclusions.map(exclusion => exclusion.name);
      
      const similarityCheck = StringSimilarity.checkSimilarity(name, existingNames, 80);
      
      if (similarityCheck) {
        return responseReturn(res, 409, {
          error: "This item already exists or is very similar to an existing one.",
          similarItem: similarityCheck.string,
          similarity: similarityCheck.similarity
        });
      }

      const exclusion = await Exclusion.create({ name }); // await the async operation

      // Success status should be 201
      responseReturn(res, 201, {
        message: "Exclusion Added Successfully",
        exclusion,
      });
    } catch (error) {
      responseReturn(res, 500, { error: "Internal server error" });
    }
  };
  get_exclusion = async (req, res) => {
    const { exclusionId } = req.params;

    try {
      const exclusion = await Exclusion.findById(exclusionId);
      if (!exclusion) {
        return responseReturn(res, 404, { error: "No Exclusion Found" });
      }
      return responseReturn(res, 202, { exclusion });
    } catch (error) {
      return responseReturn(res, 500, { error: "Internal server error" });
    }
  };
  // Getting exclusion list with pagination and search
  get_exclusions = async (req, res) => {
    const {
      page,
      searchValue,
      parPage,
      allExclusions = "false",
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
      if (searchValue && page && parPage && allExclusions === "false") {
        let query = Exclusion.find({
          name: { $regex: searchValue, $options: "i" },
        })
          .skip(skipPage)
          .limit(parPage);
        
        if (collation) {
          query = query.sort(sortOptions).collation(collation);
        } else {
          query = query.sort(sortOptions);
        }
        
        const exclusions = await query;
        const totalExclusions = await Exclusion.find({
          name: { $regex: searchValue, $options: "i" },
        }).countDocuments();
        responseReturn(res, 200, {
          totalExclusions,
          exclusions,
        });
      } else if (
        searchValue === "" &&
        page &&
        parPage &&
        allExclusions === "false"
      ) {
        let query = Exclusion.find({})
          .skip(skipPage)
          .limit(parPage);
        
        if (collation) {
          query = query.sort(sortOptions).collation(collation);
        } else {
          query = query.sort(sortOptions);
        }
        
        const exclusions = await query;
        const totalExclusions = await Exclusion.find({}).countDocuments();
        responseReturn(res, 200, {
          totalExclusions,
          exclusions,
        });
      } else {
        // For dropdowns/selects, always use alphabetical
        const exclusions = await Exclusion.find({}).sort({ name: 1 }).collation({ locale: "en", strength: 2 });
        const totalExclusions = await Exclusion.find({}).countDocuments();
        responseReturn(res, 200, {
          totalExclusions,
          exclusions,
          message: "exclusions successfully fetched",
        });
      }
    } catch (error) {
      responseReturn(res, 500, { error: "internal server error" });
    }
  };
  update_exclusion = async (req, res) => {
    const { name } = req.body;
    const { exclusionId } = req.params;

    // Check if name is provided
    if (!name) {
      return responseReturn(res, 400, { error: "Name is required" });
    }

    try {
      const exclusion = await Exclusion.findById(exclusionId);

      // Return early if exclusion is not found
      if (!exclusion) {
        return responseReturn(res, 404, {
          error: "Couldn't find matching exclusion",
        });
      }

      // Update exclusion name and save
      exclusion.name = name;
      await exclusion.save();

      responseReturn(res, 200, { message: "Exclusion successfully updated" });
    } catch (error) {
      responseReturn(res, 500, { error: "Internal server error" });
    }
  };
  delete_exclusion = async (req, res) => {
    const { exclusionId } = req.params;

    try {
      // Fetch the existing exclusion to check if it has an image
      const existingExclusion = await Exclusion.findById(exclusionId);

      if (!existingExclusion) {
        return responseReturn(res, 404, { error: "Exclusion not found" });
      }

      // Proceed to delete the exclusion
      const deletedExclusion = await Exclusion.findByIdAndDelete(exclusionId);

      if (!deletedExclusion) {
        return responseReturn(res, 404, { error: "Exclusion not found" });
      }

      return responseReturn(res, 200, {
        message: "Exclusion deleted successfully",
      });
    } catch (err) {
      console.error("Error deleting exclusion:", err);
      return responseReturn(res, 500, { error: "Internal server error" });
    }
  };
  // Bulk delete exclusions
  delete_exclusions = async (req, res) => {
    const { ids } = req.body;
    try {
      const deletedExclusions = await Exclusion.deleteMany({
        _id: { $in: ids },
      });
      return responseReturn(res, 200, {
        message: `Deleted ${deletedExclusions.deletedCount} exclusions successfully`,
        deletedCount: deletedExclusions.deletedCount,
      });
    } catch (err) {
      console.error("Error deleting exclusions:", err);
      return responseReturn(res, 500, { error: "Internal server error" });
    }
  };
}

module.exports = new ExclusionControllers();
