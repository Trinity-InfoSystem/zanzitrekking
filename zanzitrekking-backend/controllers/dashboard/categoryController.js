const Category = require("../../models/category");
const logger = require('./../../utilities/logger');
const { responseReturn } = require("../../utilities/response");
const StringSimilarity = require("../../utilities/stringSimilarity");
const fs = require("fs");
const path = require("path");
const redis = require('../../redis');
const { thumbnailGenerator } = require("../../utilities/multerUpload");
const debug = require('debug')('app:category');

class CategoryControllers {
  get_one_category = async (req, res) => {
    const { categoryId } = req.params;
    try {
      const category = await Category.findById(categoryId);
      if (!category) {
        return responseReturn(res, 404, { error: "Category Not Found" });
      }
      return responseReturn(res, 200, {
        message: "Category Fetch Successful",
        category,
      });
    } catch (error) {
      return responseReturn(res, 500, { error: "Internal Server Error" });
    }
  };
  add_category = async (req, res) => {
    try {
      const file = req.file;
      if (req.body.name === "")
        return responseReturn(res, 404, {
          error: "No category in the request",
        });
      if (!file)
        return responseReturn(res, 404, {
          error: "No image in the request",
        });

      // Check for similar existing categories
      const existingCategories = await Category.find({});
      const existingNames = existingCategories.map(cat => cat.name);
      
      const similarityCheck = StringSimilarity.checkSimilarity(req.body.name, existingNames, 80);
      
      if (similarityCheck) {
        return responseReturn(res, 409, {
          error: "This item already exists or is very similar to an existing one.",
          similarItem: similarityCheck.string,
          similarity: similarityCheck.similarity
        });
      }

      const fileName = req.file.filename;
      const basePath = `uploads/`;
      const imageThumbnail=fileName
        ? await thumbnailGenerator(fileName.path)
        : null;

      // Create the category
      let category = await Category.create({
        name: req.body.name,
        image: `${basePath}${fileName}`,
        imageThumbnail:imageThumbnail? `${basePath}${imageThumbnail}` : null,
      });

      if (!category) {
        return responseReturn(res, 404, {
          error: "Category couldn't be created",
        });
      } else {
        await redis.del("home:categories");
        // Send back the created category
        return responseReturn(res, 202, {
          message: "Category Successfully created",
          category,
        });
      }
    } catch (err) {
      // Catch any server errors
      logger.error(err);
      return responseReturn(res, 500, { error: "Internal server error" });
    }
  };

  get_category = async (req, res) => {
    const {
      page,
      searchValue,
      parPage,
      allCategories = "false",
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
      if (searchValue && page && parPage && allCategories === "false") {
        let query = Category.find({
          name: { $regex: searchValue, $options: "i" },
        })
          .skip(skipPage)
          .limit(parPage);
        
        if (collation) {
          query = query.sort(sortOptions).collation(collation);
        } else {
          query = query.sort(sortOptions);
        }
        
        const categories = await query;
        const totalCategory = await Category.find({
          name: { $regex: searchValue, $options: "i" },
        }).countDocuments();
        responseReturn(res, 200, {
          totalCategory,
          categories,
        });
      } else if (
        searchValue === "" &&
        page &&
        parPage &&
        allCategories === "false"
      ) {
        let query = Category.find({})
          .skip(skipPage)
          .limit(parPage);
        
        if (collation) {
          query = query.sort(sortOptions).collation(collation);
        } else {
          query = query.sort(sortOptions);
        }
        
        const categories = await query;
        const totalCategory = await Category.find({}).countDocuments();
        responseReturn(res, 200, {
          totalCategory,
          categories,
        });
      } else {
        // For dropdowns/selects, always use alphabetical
        const categories = await Category.find({}).sort({ name: 1 }).collation({ locale: "en", strength: 2 });
        const totalCategory = await Category.find({}).countDocuments();
        responseReturn(res, 200, {
          totalCategory,
          categories,
          message: "categories successfully fetched",
        });
      }
    } catch (error) {
      responseReturn(res, 500, { error: "internal server error" });
    }
  };
  // In CategoryController.js

  update_category = async (req, res) => {
    try {
      const { categoryId } = req.params;
      const file = req.file;
      const { name } = req.body;

      // Validate input
      if (!name) return responseReturn(res, 400, { error: "Name is required" });

      // Fetch the existing category
      const existingCategory = await Category.findById(categoryId);
      if (!existingCategory) {
        return responseReturn(res, 404, { error: "Category not found" });
      }

      // Prepare the update object
      const updateFields = { name };

      // Check if an image file is uploaded
      if (file) {
        // Delete the old image if it exists
        if (existingCategory.image) {
          // Extract the filename from the existing image URL
          const oldImageFileName = path.basename(existingCategory.image);
          const oldImageThumbnailName = path.basename(existingCategory.imageThumbnail);

          // Construct the path for the old image relative to the project root in an array
          const filesToDelete = [
            path.join(__dirname,"public",oldImageFileName),
            path.join(__dirname,"public",oldImageThumbnailName)
          ];

          // Log the old image path for debugging
          debug(`Attempting to delete file at: ${filesToDelete[0]}`);
          debug(`Attempting to delete file at: ${filesToDelete[1]}`);


          // Try to delete the old image and thumbnail
          await Promise.allSettled(
            filesToDelete.map(async (filepath) => {
              try {
                await fs.unlink(filepath);
                debug('Successfully deleted old image: %s', path.basename(filepath));
              } catch (e) {
                debug('Error deleting old image: %s (%s)', path.basename(filepath), e.code === 'ENOENT' ? 'Not found' : e.message);
              }
            })
          );
        }

        // Set the new image path
        const fileName = req.file.filename;
        const basePath = `uploads/`;
        const imageThumbnail=fileName
        ? await thumbnailGenerator(fileName.path)
        : null;
        updateFields.image = `${basePath}${fileName}`;
        updateFields.imageThumbnail = imageThumbnail? `${basePath}${imageThumbnail}` : null;
      }

      // Update the category
      const updatedCategory = await Category.findByIdAndUpdate(
        categoryId,
        updateFields,
        { new: true }
      );

      if (!updatedCategory) {
        return responseReturn(res, 404, { error: "Category not found" });
      }
      await redis.del("home:categories");
      return responseReturn(res, 200, {
        message: "Category successfully updated",
        data: updatedCategory,
      });
    } catch (err) {
      logger.error("Error updating category:", err);
      return responseReturn(res, 500, { error: "Internal server error" });
    }
  };
  // In CategoryController.js

  update_category_image = async (req, res) => {
    try {
      const { categoryId } = req.params;
      const file = req.file;

      // Validate input
      if (!file) return res.status(400).send("Image file is required");

      // Fetch the existing category
      const existingCategory = await Category.findById(categoryId);
      if (!existingCategory) {
        return responseReturn(res, 404, { error: "Category not found" });
      }

      // Check if the file exists and delete it
      if (existingCategory.image) {


        // Construct the absolute path for the old image relative to the project root
        // Adjust path to match the 'public/uploads' directory
        const filesToDelete = [
            path.join(__dirname,"public",path.basename(existingCategory.image)),
            path.join(__dirname,"public",path.basename(existingCategory.imageThumbnail))
          ];

        // Log the old image path for debugging
        debug(`Attempting to delete file at: ${filesToDelete[0]}`);
        debug(`Attempting to delete file at: ${filesToDelete[1]}`);

        // Try to delete the old image
        await Promise.allSettled(
            filesToDelete.map(async (filepath) => {
              try {
                await fs.unlink(filepath);
                debug('Successfully deleted old image: %s', path.basename(filepath));
              } catch (e) {
                debug('Error deleting old image: %s (%s)', path.basename(filepath), e.code === 'ENOENT' ? 'Not found' : e.message);
              }
            })
          );
      }

      // Update the category image
      const fileName = req.file.filename;
      const basePath = `uploads/`;
      const imageThumbnail=fileName
        ? await thumbnailGenerator(fileName.path)
        : null;
      const updatedCategory = await Category.findByIdAndUpdate(
        categoryId,
        { image: `${basePath}${fileName}` },
        { imageThumbnail: imageThumbnail? `${basePath}${imageThumbnail}` : null},
        { new: true }
      );

      if (!updatedCategory) {
        return responseReturn(res, 404, { error: "Category not found" });
      }
      await redis.del("home:categories");
      return responseReturn(res, 200, {
        message: "Category image successfully updated",
        data: updatedCategory,
      });
    } catch (err) {
      logger.error("Error updating category image:", err);
      responseReturn(res, 500, { error: "Internal server error" });
    }
  };
  deleteCategory = async (req, res) => {
    const { categoryId } = req.params;

    try {
      // Fetch the existing category to check if it has an image
      const existingCategory = await Category.findById(categoryId);

      if (!existingCategory) {
        return responseReturn(res, 404, { error: "Category not found" });
      }

      // Check if the category has an image to delete
      if (existingCategory.image) {
        // Construct the absolute path for the old image relative to the project root
        const filesToDelete = [
          path.join(__dirname, "public", path.basename(existingCategory.image)),
          path.join(__dirname, "public", path.basename(existingCategory.imageThumbnail))
        ];

        // Log the old image path for debugging
        debug(`Attempting to delete file at: ${filesToDelete[0]}`);
        debug(`Attempting to delete file at: ${filesToDelete[1]}`);

        // Try to delete the old image
        await Promise.allSettled(
          filesToDelete.map(async (filePath) => {
            try {
              await fs.unlink(filePath);
              debug(`Successfully deleted: ${filePath}`);
            } catch (err) {
              if (err.code === 'ENOENT') {
                debug(`File not found, skipping: ${filePath}`);
              } else {
                debug(`Error deleting file ${filePath}: ${err.message}`);
              }
            }
          })
        );
      }

      // Proceed to delete the category
      const deletedCategory = await Category.findByIdAndDelete(categoryId);

      if (!deletedCategory) {
        return responseReturn(res, 404, { error: "Category not found" });
      }
      await redis.del("home:categories");
      return responseReturn(res, 200, {
        message: "Category deleted successfully",
      });
    } catch (err) {
      logger.error("Error deleting category:", err);
      return responseReturn(res, 500, { error: "Internal server error" });
    }
  };
  // Bulk delete categories
  delete_categories = async (req, res) => {
    const { ids } = req.body;
    try {
      const deletedCategories = await Category.deleteMany({
        _id: { $in: ids },
      });
      await redis.del("home:categories");
      return responseReturn(res, 200, {
        message: `Deleted ${deletedCategories.deletedCount} categories successfully`,
        deletedCount: deletedCategories.deletedCount,
      });
    } catch (err) {
      logger.error("Error deleting categories:", err);
      return responseReturn(res, 500, { error: "Internal server error" });
    }
  };
}

module.exports = new CategoryControllers();
