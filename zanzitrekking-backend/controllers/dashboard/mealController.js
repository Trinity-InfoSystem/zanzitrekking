const Meal = require("../../models/meal");
const { responseReturn } = require("../../utilities/response");
const StringSimilarity = require("../../utilities/stringSimilarity");

class MealControllers {
  // Adding new meal
  add_meal = async (req, res) => {
    const { name } = req.body;
    try {
      // Check for similar existing meals
      const existingMeals = await Meal.find({});
      const existingNames = existingMeals.map(meal => meal.name);
      
      const similarityCheck = StringSimilarity.checkSimilarity(name, existingNames, 80);
      
      if (similarityCheck) {
        return responseReturn(res, 409, {
          error: "This item already exists or is very similar to an existing one.",
          similarItem: similarityCheck.string,
          similarity: similarityCheck.similarity
        });
      }

      const meal = await Meal.create({ name }); // await the async operation

      // Success status should be 201
      responseReturn(res, 201, {
        message: "Meal Added Successfully",
        meal,
      });
    } catch (error) {
      responseReturn(res, 500, { error: "Internal server error" });
    }
  };
  get_meal = async (req, res) => {
    const { mealId } = req.params;

    try {
      const meal = await Meal.findById(mealId);
      if (!meal) {
        return responseReturn(res, 404, { error: "No Meal Found" });
      }
      return responseReturn(res, 202, { meal });
    } catch (error) {
      return responseReturn(res, 500, { error: "Internal server error" });
    }
  };
  // Getting meal list with pagination and search
  get_meals = async (req, res) => {
    const {
      page,
      searchValue,
      parPage,
      allMeals = "false",
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
      if (searchValue && page && parPage && allMeals === "false") {
        let query = Meal.find({
          name: { $regex: searchValue, $options: "i" },
        })
          .skip(skipPage)
          .limit(parPage);
        
        if (collation) {
          query = query.sort(sortOptions).collation(collation);
        } else {
          query = query.sort(sortOptions);
        }
        
        const meals = await query;
        const totalMeals = await Meal.find({
          name: { $regex: searchValue, $options: "i" },
        }).countDocuments();
        responseReturn(res, 200, {
          totalMeals,
          meals,
        });
      } else if (
        searchValue === "" &&
        page &&
        parPage &&
        allMeals === "false"
      ) {
        let query = Meal.find({})
          .skip(skipPage)
          .limit(parPage);
        
        if (collation) {
          query = query.sort(sortOptions).collation(collation);
        } else {
          query = query.sort(sortOptions);
        }
        
        const meals = await query;
        const totalMeals = await Meal.find({}).countDocuments();
        responseReturn(res, 200, {
          totalMeals,
          meals,
        });
      } else {
        // For dropdowns/selects, always use alphabetical
        const meals = await Meal.find({}).sort({ name: 1 }).collation({ locale: "en", strength: 2 });
        const totalMeals = await Meal.find({}).countDocuments();
        responseReturn(res, 200, {
          totalMeals,
          meals,
          message: "meals successfully fetched",
        });
      }
    } catch (error) {
      responseReturn(res, 500, { error: "internal server error" });
    }
  };
  update_meal = async (req, res) => {
    const { name } = req.body;
    const { mealId } = req.params;

    // Check if name is provided
    if (!name) {
      return responseReturn(res, 400, { error: "Name is required" });
    }

    try {
      const meal = await Meal.findById(mealId);

      // Return early if meal is not found
      if (!meal) {
        return responseReturn(res, 404, {
          error: "Couldn't find matching meal",
        });
      }

      // Update meal name and save
      meal.name = name;
      await meal.save();

      responseReturn(res, 200, {
        message: "Meal successfully updated",
      });
    } catch (error) {
      responseReturn(res, 500, { error: "Internal server error" });
    }
  };
  delete_meal = async (req, res) => {
    const { mealId } = req.params;

    try {
      // Fetch the existing meal to check if it has an image
      const existingMeal = await Meal.findById(mealId);

      if (!existingMeal) {
        return responseReturn(res, 404, { error: "Meal not found" });
      }

      // Proceed to delete the meal
      const deletedMeal = await Meal.findByIdAndDelete(mealId);

      if (!deletedMeal) {
        return responseReturn(res, 404, { error: "Meal not found" });
      }

      return responseReturn(res, 200, {
        message: "Meal deleted successfully",
      });
    } catch (err) {
      console.error("Error deleting meal:", err);
      return responseReturn(res, 500, { error: "Internal server error" });
    }
  };
  // Bulk delete meals
  delete_meals = async (req, res) => {
    const { ids } = req.body;
    try {
      const deletedMeals = await Meal.deleteMany({ _id: { $in: ids } });
      return responseReturn(res, 200, {
        message: `Deleted ${deletedMeals.deletedCount} meals successfully`,
        deletedCount: deletedMeals.deletedCount,
      });
    } catch (err) {
      console.error("Error deleting meals:", err);
      return responseReturn(res, 500, { error: "Internal server error" });
    }
  };
}

module.exports = new MealControllers();
