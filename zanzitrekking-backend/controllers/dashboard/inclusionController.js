const Inclusion = require("../../models/inclusion");
const logger = require('./../../utilities/logger');
const { responseReturn } = require("../../utilities/response");
const StringSimilarity = require("../../utilities/stringSimilarity");

class InclusionControllers {
  // Adding new inclusion
  add_inclusion = async (req, res) => {
    const { name } = req.body;
    try {
      // Check for similar existing inclusions
      const existingInclusions = await Inclusion.find({});
      const existingNames = existingInclusions.map(inclusion => inclusion.name);
      
      const similarityCheck = StringSimilarity.checkSimilarity(name, existingNames, 80);
      
      if (similarityCheck) {
        return responseReturn(res, 409, {
          error: "This item already exists or is very similar to an existing one.",
          similarItem: similarityCheck.string,
          similarity: similarityCheck.similarity
        });
      }

      const inclusion = await Inclusion.create({ name }); // await the async operation

      // Success status should be 201
      responseReturn(res, 201, {
        message: "Inclusion Added Successfully",
        inclusion,
      });
    } catch (error) {
      responseReturn(res, 500, { error: "Internal server error" });
    }
  };
  get_inclusion = async (req, res) => {
    const { inclusionId } = req.params;

    try {
      const inclusion = await Inclusion.findById(inclusionId);
      if (!inclusion) {
        return responseReturn(res, 404, { error: "No Inclusion Found" });
      }
      return responseReturn(res, 202, { inclusion });
    } catch (error) {
      return responseReturn(res, 500, { error: "Internal server error" });
    }
  };
  // Getting inclusion list with pagination and search
  get_inclusions = async (req, res) => {
    const {
      page,
      searchValue,
      parPage,
      allInclusions = "false",
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
      if (searchValue && page && parPage && allInclusions === "false") {
        let query = Inclusion.find({
          name: { $regex: searchValue, $options: "i" },
        })
          .skip(skipPage)
          .limit(parPage);
        
        if (collation) {
          query = query.sort(sortOptions).collation(collation);
        } else {
          query = query.sort(sortOptions);
        }
        
        const inclusions = await query;
        const totalInclusions = await Inclusion.find({
          name: { $regex: searchValue, $options: "i" },
        }).countDocuments();
        responseReturn(res, 200, {
          totalInclusions,
          inclusions,
        });
      } else if (
        searchValue === "" &&
        page &&
        parPage &&
        allInclusions === "false"
      ) {
        let query = Inclusion.find({})
          .skip(skipPage)
          .limit(parPage);
        
        if (collation) {
          query = query.sort(sortOptions).collation(collation);
        } else {
          query = query.sort(sortOptions);
        }
        
        const inclusions = await query;
        const totalInclusions = await Inclusion.find({}).countDocuments();
        responseReturn(res, 200, {
          totalInclusions,
          inclusions,
        });
      } else {
        // For dropdowns/selects, always use alphabetical
        const inclusions = await Inclusion.find({}).sort({ name: 1 }).collation({ locale: "en", strength: 2 });
        const totalInclusions = await Inclusion.find({}).countDocuments();
        responseReturn(res, 200, {
          totalInclusions,
          inclusions,
          message: "inclusions successfully fetched",
        });
      }
    } catch (error) {
      responseReturn(res, 500, { error: "internal server error" });
    }
  };
  update_inclusion = async (req, res) => {
    const { name } = req.body;
    const { inclusionId } = req.params;

    // Check if name is provided
    if (!name) {
      return responseReturn(res, 400, { error: "Name is required" });
    }

    try {
      const inclusion = await Inclusion.findById(inclusionId);

      // Return early if inclusion is not found
      if (!inclusion) {
        return responseReturn(res, 404, {
          error: "Couldn't find matching inclusion",
        });
      }

      // Update inclusion name and save
      inclusion.name = name;
      await inclusion.save();

      responseReturn(res, 200, { message: "Inclusion successfully updated" });
    } catch (error) {
      responseReturn(res, 500, { error: "Internal server error" });
    }
  };
  deleteInclusion = async (req, res) => {
    const { inclusionId } = req.params;

    try {
      // Fetch the existing inclusion to check if it has an image
      const existingInclusion = await Inclusion.findById(inclusionId);

      if (!existingInclusion) {
        return responseReturn(res, 404, { error: "Inclusion not found" });
      }

      // Proceed to delete the inclusion
      const deletedInclusion = await Inclusion.findByIdAndDelete(inclusionId);

      if (!deletedInclusion) {
        return responseReturn(res, 404, { error: "Inclusion not found" });
      }

      return responseReturn(res, 200, {
        message: "Inclusion deleted successfully",
      });
    } catch (err) {
      logger.error("Error deleting inclusion:", err);
      return responseReturn(res, 500, { error: "Internal server error" });
    }
  };

  // Bulk delete inclusions
  deleteInclusions = async (req, res) => {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return responseReturn(res, 400, { error: "No inclusion IDs provided" });
    }
    try {
      const result = await Inclusion.deleteMany({ _id: { $in: ids } });
      return responseReturn(res, 200, {
        message: `Deleted ${result.deletedCount} inclusions successfully`,
        deletedCount: result.deletedCount,
      });
    } catch (err) {
      logger.error("Error deleting inclusions:", err);
      return responseReturn(res, 500, { error: "Internal server error" });
    }
  };
}

module.exports = new InclusionControllers();
