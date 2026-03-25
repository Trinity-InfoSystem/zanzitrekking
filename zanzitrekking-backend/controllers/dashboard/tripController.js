const TripModel = require("../../models/trip");
const logger = require('./../../utilities/logger');
const CategoryModel = require("../../models/category");
const { responseReturn } = require("../../utilities/response");
const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
const slugify = require("slugify");
const redis = require("../../redis");
const { delPattern } = require('../../utilities/cache');
const { publicUploadsRef } = require("../../utilities/storedAssetPath");
const crypto = require("crypto");

const isMongoObjectId = (value) => /^[a-f\d]{24}$/i.test(String(value || ""));

const generateUniqueSlug = async ({ model, base, excludeId }) => {
  const baseSlug = slugify(base || "", { lower: true, strict: true });
  if (!baseSlug) return "";

  let slug = baseSlug;
  let counter = 2;

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const query = { slug };
    if (excludeId && mongoose.Types.ObjectId.isValid(excludeId)) {
      query._id = { $ne: new mongoose.Types.ObjectId(excludeId) };
    }

    const exists = await model.findOne(query).select("_id").lean();
    if (!exists) return slug;

    slug = `${baseSlug}-${counter}`;
    counter += 1;
  }
};

const resolveCategoryData = async (categoryValue) => {
  if (!categoryValue) {
    return { categoryName: "", categoryId: "" };
  }

  const normalizedValue =
    typeof categoryValue === "string" ? categoryValue.trim() : categoryValue;

  if (mongoose.Types.ObjectId.isValid(normalizedValue)) {
    const categoryDoc = await CategoryModel.findById(normalizedValue).select(
      "name"
    );
    if (categoryDoc) {
      return {
        categoryName: categoryDoc.name,
        categoryId: categoryDoc._id.toString(),
      };
    }
    return {
      categoryName: "",
      categoryId: normalizedValue.toString(),
    };
  }

  const categoryDoc = await CategoryModel.findOne({
    name: { $regex: `^${normalizedValue}$`, $options: "i" },
  }).select("name");

  if (categoryDoc) {
    return {
      categoryName: categoryDoc.name,
      categoryId: categoryDoc._id.toString(),
    };
  }

  return {
    categoryName: normalizedValue,
    categoryId: "",
  };
};

const buildCategoryConditions = async (categoryValue) => {
  if (!categoryValue) return [];

  const conditions = [];

  // Try to resolve as ObjectId first
  if (mongoose.Types.ObjectId.isValid(categoryValue)) {
    conditions.push({ category: new mongoose.Types.ObjectId(categoryValue) });
    return conditions;
  }

  // If not ObjectId, try to find by name
  const categoryDoc = await CategoryModel.findOne({
    name: { $regex: `^${categoryValue.trim()}$`, $options: "i" },
  });

  if (categoryDoc) {
    conditions.push({ category: categoryDoc._id });
  }

  return conditions;
};

class TripController {
  // Add Trip Controller
  add_trip = async (req, res) => {
    try {
      const {
        mainTitle,
        overview,
        description,
        mainDestination,
        startPoint,
        endPoint,
        pricingType,
        regularPrices,
        seasons,
        category,
        daysData,
        daysCount,
        discount,
      } = req.body;

      // Parse JSON strings for category-specific inclusions and exclusions
      const inclusions = JSON.parse(
        req.body.inclusions ||
          JSON.stringify({
            standard: [],
            midRange: [],
            luxury: [],
          })
      );
      const exclusions = JSON.parse(
        req.body.exclusions ||
          JSON.stringify({
            standard: [],
            midRange: [],
            luxury: [],
          })
      );
      // Parse mainDestination - ensure it's an array
      let parsedMainDestination = [];
      if (mainDestination) {
        const parsed =
          typeof mainDestination === "string"
            ? JSON.parse(mainDestination)
            : mainDestination;
        // Ensure it's an array
        parsedMainDestination = Array.isArray(parsed) ? parsed : [parsed];
      }

      const parsedStartPoint =
        typeof startPoint === "string" ? JSON.parse(startPoint) : startPoint;

      const parsedEndPoint =
        typeof endPoint === "string" ? JSON.parse(endPoint) : endPoint;

      // Parse pricing data based on pricing type
      let parsedRegularPrices = null;
      let parsedSeasons = [];

      if (pricingType === "yearRound") {
        parsedRegularPrices = JSON.parse(regularPrices || "{}");
      } else if (pricingType === "seasonal") {
        parsedSeasons = JSON.parse(seasons || "[]");
      }

      // Extract the main image and video
      const mainImageFile = req.files.find(
        (file) => file.fieldname === "mainImage"
      );
      const mainVideoFile = req.files.find(
        (file) => file.fieldname === "mainVideo"
      );
      const mainImage = mainImageFile ? mainImageFile.filename : null;
      const mainVideo = mainVideoFile ? mainVideoFile.filename : null;

      // Process days
      const tripDays = [];
      const parsedDaysData = JSON.parse(daysData || "[]");

      for (let i = 0; i < parseInt(daysCount); i++) {
        const dayImageFile = req.files.find(
          (file) => file.fieldname === `dayImage_${i}`
        );
        const dayData = parsedDaysData[i];

        // Store accommodation IDs (references) instead of full objects
        let accommodationIds = [];
        if (
          Array.isArray(dayData.accommodation) &&
          dayData.accommodation.length > 0
        ) {
          accommodationIds = dayData.accommodation;
        }
        tripDays.push({
          title: dayData.title,
          overview: dayData.overview || "",
          mainDestination: dayData.mainDestination,
          image: dayImageFile ? publicUploadsRef(dayImageFile.filename) : null,
          accommodation: accommodationIds,
          meals: dayData.meals || [],
        });
      }

      // Resolve category ID - save only ObjectId reference
      let categoryObjectId = null;
      if (category) {
        if (mongoose.Types.ObjectId.isValid(category)) {
          // If it's already a valid ObjectId, use it
          const categoryDoc = await CategoryModel.findById(category);
          if (categoryDoc) {
            categoryObjectId = new mongoose.Types.ObjectId(category);
          }
        } else {
          // If it's a name, find the category by name
          const categoryDoc = await CategoryModel.findOne({
            name: { $regex: `^${category.trim()}$`, $options: "i" },
          });
          if (categoryDoc) {
            categoryObjectId = categoryDoc._id;
          }
        }
      }

      // Create new trip object
      const newTrip = {
        mainTitle,
        overview,
        description,
        mainDestination: parsedMainDestination,
        startPoint: parsedStartPoint,
        endPoint: parsedEndPoint,
        category: categoryObjectId, // Store only ObjectId reference
        inclusions,
        exclusions,
        mainImage: mainImage ? `${basePath}${mainImage}` : null,
        mainVideo: mainVideo ? `${basePath}${mainVideo}` : null,
        discount: parseFloat(discount) || 0,
        pricingType,
        days: tripDays,
      };

      // Add pricing based on type
      if (pricingType === "yearRound") {
        newTrip.regularPrices = parsedRegularPrices;
      } else if (pricingType === "seasonal") {
        newTrip.seasons = parsedSeasons;
      }

      newTrip.slug = await generateUniqueSlug({
        model: TripModel,
        base: mainTitle,
      });

      const createdTrip = await TripModel.create(newTrip);
      await Promise.allSettled([
        redis.del("home:categories"),
        delPattern("home:trips:list:*"),
        redis.del("home:trips:special:all"),
        redis.del("home:trips:price-range"),
        delPattern("home:trips:query:*")
      ]);

      responseReturn(res, 201, {
        message: "Trip Added Successfully",
        trip: createdTrip,
      });
    } catch (error) {
      logger.error("Error adding trip:", error);
      res.status(500).json({
        message: error.message || "Internal server error",
        error: error.message,
        details: error.errors,
      });
    }
  };

  update_trip = async (req, res) => {
    try {
      const { tripId } = req.params;
      const {
        mainTitle,
        overview,
        description,
        mainDestination,
        startPoint,
        endPoint,
        pricingType,
        regularPrices,
        seasons,
        daysData,
        daysCount,
        inclusions,
        exclusions,
        category,
        discount,
      } = req.body;

      // Fetch the existing trip
      const existingTrip = await TripModel.findById(tripId);
      if (!existingTrip) {
        return responseReturn(res, 404, { error: "Trip not found" });
      }

      // Parse JSON data for category-specific inclusions and exclusions
      const parsedInclusions = JSON.parse(
        inclusions ||
          JSON.stringify({
            standard: [],
            midRange: [],
            luxury: [],
          })
      );
      const parsedExclusions = JSON.parse(
        exclusions ||
          JSON.stringify({
            standard: [],
            midRange: [],
            luxury: [],
          })
      );
      const parsedDaysData = JSON.parse(daysData || "[]");
      // Parse mainDestination - ensure it's an array
      let parsedMainDestination = [];
      if (mainDestination) {
        const parsed =
          typeof mainDestination === "string"
            ? JSON.parse(mainDestination)
            : mainDestination;
        // Ensure it's an array
        parsedMainDestination = Array.isArray(parsed) ? parsed : [parsed];
      }

      const parsedStartPoint =
        typeof startPoint === "string" ? JSON.parse(startPoint) : startPoint;

      const parsedEndPoint =
        typeof endPoint === "string" ? JSON.parse(endPoint) : endPoint;

      // Parse pricing data based on pricing type
      let parsedRegularPrices = null;
      let parsedSeasons = [];

      if (pricingType === "yearRound") {
        parsedRegularPrices = JSON.parse(regularPrices || "{}");
      } else if (pricingType === "seasonal") {
        parsedSeasons = JSON.parse(seasons || "[]");
      }

      // Prepare update fields
      const updateFields = {
        mainTitle: mainTitle || existingTrip.mainTitle,
        overview: overview || existingTrip.overview,
        description: description || existingTrip.description,
        mainDestination:
          parsedMainDestination.length > 0
            ? parsedMainDestination
            : Array.isArray(existingTrip.mainDestination)
            ? existingTrip.mainDestination
            : existingTrip.mainDestination
            ? [existingTrip.mainDestination]
            : [],
        startPoint: parsedStartPoint || existingTrip.startPoint,
        endPoint: parsedEndPoint || existingTrip.endPoint,
        discount: parseFloat(discount) || existingTrip.discount || 0,
        pricingType: pricingType || existingTrip.pricingType,
        inclusions: parsedInclusions,
        exclusions: parsedExclusions,
      };

      if (mainTitle && mainTitle !== existingTrip.mainTitle) {
        updateFields.slug = await generateUniqueSlug({
          model: TripModel,
          base: mainTitle,
          excludeId: tripId,
        });
      }

      // Resolve category ID - save only ObjectId reference
      let categoryObjectId = existingTrip.category; // Keep existing if not changing
      if (category) {
        if (mongoose.Types.ObjectId.isValid(category)) {
          // If it's already a valid ObjectId, use it
          const categoryDoc = await CategoryModel.findById(category);
          if (categoryDoc) {
            categoryObjectId = new mongoose.Types.ObjectId(category);
          }
        } else {
          // If it's a name, find the category by name
          const categoryDoc = await CategoryModel.findOne({
            name: { $regex: `^${category.trim()}$`, $options: "i" },
          });
          if (categoryDoc) {
            categoryObjectId = categoryDoc._id;
          }
        }
      }

      updateFields.category = categoryObjectId; // Store only ObjectId reference

      // Update pricing based on type
      if (pricingType === "yearRound") {
        updateFields.regularPrices =
          parsedRegularPrices || existingTrip.regularPrices;
        updateFields.seasons = []; // Clear seasons if switching to year-round
      } else if (pricingType === "seasonal") {
        updateFields.seasons =
          parsedSeasons.length > 0 ? parsedSeasons : existingTrip.seasons;
        updateFields.regularPrices = null; // Clear regular prices if switching to seasonal
      }

      // Handle main image
      const mainImageFile = req.files.find(
        (file) => file.fieldname === "mainImage"
      );
      if (mainImageFile) {
        // Delete old image if it exists
        if (existingTrip.mainImage) {
          const oldImageFileName = path.basename(existingTrip.mainImage);
          const oldImagePath = path.resolve(
            __dirname,
            "..",
            "..",
            "public",
            "uploads",
            oldImageFileName
          );
          try {
            await fs.promises.unlink(oldImagePath);
            logger.info("Deleted old main image:", oldImagePath);
          } catch (err) {
            logger.error(`Error deleting old main image: ${err.message}`);
          }
        }
        updateFields.mainImage = `${basePath}${mainImageFile.filename}`;
      }

      // Handle main video
      const mainVideoFile = req.files.find(
        (file) => file.fieldname === "mainVideo"
      );
      if (mainVideoFile) {
        // Delete old video if it exists
        if (existingTrip.mainVideo) {
          const oldVideoFileName = path.basename(existingTrip.mainVideo);
          const oldVideoPath = path.resolve(
            __dirname,
            "..",
            "..",
            "public",
            "uploads",
            oldVideoFileName
          );
          try {
            await fs.promises.unlink(oldVideoPath);
            logger.info("Deleted old main video:", oldVideoPath);
          } catch (err) {
            logger.error(`Error deleting old main video: ${err.message}`);
          }
        }
        updateFields.mainVideo = publicUploadsRef(mainVideoFile.filename);
      }

      // Process days
      const updatedDays = [];
      for (let i = 0; i < parseInt(daysCount || parsedDaysData.length); i++) {
        const dayData = parsedDaysData[i];
        const existingDay = existingTrip.days[i];
        const dayImageFile = req.files.find(
          (file) => file.fieldname === `dayImage_${i}`
        );

        // Store accommodation IDs (references) instead of full objects
        let accommodationIds = [];
        if (
          Array.isArray(dayData.accommodation) &&
          dayData.accommodation.length > 0
        ) {
          accommodationIds = dayData.accommodation;
        }
        // Prepare day data
        const updatedDay = {
          title: dayData.title || (existingDay ? existingDay.title : ""),
          overview:
            dayData.overview || (existingDay ? existingDay.overview : ""),
          mainDestination:
            dayData.mainDestination ||
            (existingDay ? existingDay.mainDestination : ""),
          accommodation: accommodationIds,
          meals: dayData.meals || (existingDay ? existingDay.meals : []),
        };

        // Handle day image
        if (dayImageFile) {
          // Delete old day image if it exists
          if (existingDay && existingDay.image) {
            const oldDayImageFileName = path.basename(existingDay.image);
            const oldDayImagePath = path.resolve(
              __dirname,
              "..",
              "..",
              "public",
              "uploads",
              oldDayImageFileName
            );
            try {
              await fs.promises.unlink(oldDayImagePath);
              logger.info("Deleted old day image:", oldDayImagePath);
            } catch (err) {
              logger.error(`Error deleting old day image: ${err.message}`);
            }
          }
          updatedDay.image = publicUploadsRef(dayImageFile.filename);
        } else if (existingDay) {
          updatedDay.image = existingDay.image;
        }

        updatedDays.push(updatedDay);
      }

      updateFields.days = updatedDays;

      // Update the trip
      const updatedTrip = await TripModel.findByIdAndUpdate(
        tripId,
        updateFields,
        { new: true, runValidators: true }
      )
        .populate("category")
        .populate("days.accommodation");

      await Promise.allSettled([
        redis.del("home:categories"),
        redis.del(`home:trip:${tripId}`),
        existingTrip.slug ? redis.del(`home:trip:${existingTrip.slug}`) : null,
        redis.del("home:trips:special:all"),
        redis.del("home:trips:price-range"),
        delPattern("home:trips:list:*"),
        delPattern("home:trips:query:*")
      ]);

      responseReturn(res, 200, {
        message: "Trip updated successfully",
        trip: updatedTrip,
      });
    } catch (error) {
      logger.error("Error updating trip:", error);
      responseReturn(res, 500, {
        error: "Internal server error",
        details: error.message,
        validationErrors: error.errors,
      });
    }
  };

  get_trips = async (req, res) => {
    const { page, searchValue, parPage, sort = "newest-desc" } = req.query;

    try {
      // Build stable query hash
      const hash = crypto
      .createHash("md5")
      .update(
        JSON.stringify({
          page: Number(page) || 1,
          parPage: Number(parPage) || 10,
          searchValue: searchValue || "",
          sort: sort || "newest-desc",
        })
      )
      .digest("hex");

    const key = `home:trips:list:${hash}`;
      // Determine sort order
      let sortOptions = {};
      let collation = null;
      if (sort === "name-asc") {
        sortOptions = { mainTitle: 1 }; // A-Z
        collation = { locale: "en", strength: 2 }; // Case-insensitive collation
      } else if (sort === "name-desc") {
        sortOptions = { mainTitle: -1 }; // Z-A
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
      let query = {};
      if (searchValue) {
        query.mainTitle = { $regex: searchValue, $options: "i" };
      }
      let tripsQuery = mongoose.model("Trip").find(query);

      if (collation) {
        tripsQuery = tripsQuery.collation(collation);
      }

      if (page && parPage) {
        tripsQuery = tripsQuery.skip(skipPage).limit(parPage);
      }
      tripsQuery = tripsQuery
        .sort(sortOptions)
        .populate("category")
        .populate("days.accommodation");
      const trips = await tripsQuery;
      const totalTrips = await mongoose.model("Trip").countDocuments(query);
      await redis.set(key, JSON.stringify({
          totalTrips,
          trips,
        }), "EX", 43200);
      responseReturn(res, 200, {
        totalTrips,
        trips,
      });
    } catch (error) {
      responseReturn(res, 500, { error: "internal server error" });
    }
  };

  get_special_trips = async (req, res) => {
    try {
      const key = `home:trips:special:all`;

      // Get all trips and total count
      const allTrips = await TripModel.find({})
        .populate("category")
        .populate("days.accommodation");
      const totalTrips = await TripModel.countDocuments();

      // Get latest trips
      const latestTrips = await TripModel.find({})
        .sort({ createdAt: -1 })
        .limit(4)
        .populate("category")
        .populate("days.accommodation");

      // Get trips with most days
      const mostDaysTripsIds = await TripModel.aggregate([
        {
          $addFields: {
            daysCount: { $size: "$days" },
          },
        },
        {
          $sort: { daysCount: -1 },
        },
        {
          $limit: 4,
        },
        {
          $project: { _id: 1 },
        },
      ]);

      // Populate the aggregated trips
      const mostDaysTrips = await TripModel.find({
        _id: { $in: mostDaysTripsIds.map((t) => t._id) },
      })
        .populate("category")
        .populate("days.accommodation");

      // Get trips with discounts
      const discountTrips = await TripModel.find({
        discount: { $gt: 0 },
      })
        .sort({ discount: -1 })
        .limit(4)
        .populate("category")
        .populate("days.accommodation");

      const responseData = {
        totalTrips: totalTrips,
        trips: allTrips,
        latest_trips: latestTrips,
        most_days_trips: mostDaysTrips,
        discount_trips: discountTrips,
      };

      await redis.set(key, JSON.stringify(responseData), "EX", 43200);
      responseReturn(res, 200, responseData);
    } catch (error) {
      responseReturn(res, 500, {
        error: "Error fetching trips",
        details: error.message,
      });
    }
  };

  get_trip = async (req, res) => {
    const { tripId } = req.params;
    try {
      const trip = isMongoObjectId(tripId)
        ? await mongoose
            .model("Trip")
            .findById(tripId)
            .populate("category")
            .populate("days.accommodation")
        : await mongoose
            .model("Trip")
            .findOne({ slug: tripId })
            .populate("category")
            .populate("days.accommodation");

      if (!trip) {
        return responseReturn(res, 404, { error: "No Trip Found" });
      }

      const cacheKeyId = trip.slug || trip._id.toString();
      const key = `home:trip:${cacheKeyId}`;

      await redis.set(key, JSON.stringify(trip), "EX", 172800);
      return responseReturn(res, 202, { trip });
    } catch (error) {
      return responseReturn(res, 500, { error: "Internal server error" });
    }
  };

  delete_trip = async (req, res) => {
    const { tripId } = req.params;
    try {
      // Fetch the existing trip from the database
      const trip = await TripModel.findById(tripId);
      if (!trip) {
        return responseReturn(res, 404, { error: "Trip Not Found" });
      }

      // Delete the main image if it exists
      if (trip.mainImage) {
        const oldMainImageFileName = path.basename(trip.mainImage);
        const oldMainImagePath = path.resolve(
          __dirname,
          "..",
          "..",
          "public",
          "uploads",
          oldMainImageFileName
        );

        fs.unlink(oldMainImagePath, (err) => {
          if (err) {
            logger.error(`Error deleting old main image: ${err.message}`);
          } else {
            logger.info(
              `Successfully deleted old main image: ${oldMainImagePath}`
            );
          }
        });
      }

      // Delete the main video if it exists
      if (trip.mainVideo) {
        const oldMainVideoFileName = path.basename(trip.mainVideo);
        const oldMainVideoPath = path.resolve(
          __dirname,
          "..",
          "..",
          "public",
          "uploads",
          oldMainVideoFileName
        );

        fs.unlink(oldMainVideoPath, (err) => {
          if (err) {
            logger.error(`Error deleting old main video: ${err.message}`);
          } else {
            logger.info(
              `Successfully deleted old main video: ${oldMainVideoPath}`
            );
          }
        });
      }

      // Delete each day's image if it exists
      for (const day of trip.days) {
        if (day.image) {
          const oldDayImageFileName = path.basename(day.image);
          const oldDayImagePath = path.resolve(
            __dirname,
            "..",
            "..",
            "public",
            "uploads",
            oldDayImageFileName
          );

          fs.unlink(oldDayImagePath, (err) => {
            if (err) {
              logger.error(`Error deleting old day image: ${err.message}`);
            } else {
              logger.info(
                `Successfully deleted old day image: ${oldDayImagePath}`
              );
            }
          });
        }
      }

      // Now that all images are deleted, proceed to remove the trip
      await TripModel.findByIdAndDelete(tripId);
      await Promise.allSettled([
        redis.del("home:categories"),
        redis.del(`home:trip:${tripId}`),
        trip.slug ? redis.del(`home:trip:${trip.slug}`) : null,
        redis.del("home:trips:special:all"),
        redis.del("home:trips:price-range"),
        delPattern("home:trips:list:*"),
        delPattern("home:trips:query:*")
      ]);

      responseReturn(res, 200, { message: "Trip deleted successfully" });
      logger.info("Trip Deleted:", tripId);
    } catch (error) {
      logger.error("Error deleting trip:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  };

  get_price_range = async (req, res) => {
    try {
       const key = "home:trips:price-range";
      // Find the lowest and highest prices from both regular and seasonal pricing
      const result = await TripModel.aggregate([
        {
          $facet: {
            // Regular prices - handle both new category structure and old structure
            regularMin: [
              { $match: { pricingType: "yearRound" } },
              {
                $addFields: {
                  minPrice: {
                    $min: {
                      $filter: {
                        input: [
                          "$regularPrices.standard.onePerson",
                          "$regularPrices.midRange.onePerson",
                          "$regularPrices.luxury.onePerson",
                          "$regularPrices.onePerson", // Fallback for old structure
                        ],
                        cond: { $ne: ["$$this", null] },
                      },
                    },
                  },
                },
              },
              { $match: { minPrice: { $ne: null } } },
              { $sort: { minPrice: 1 } },
              { $limit: 1 },
              { $project: { price: "$minPrice" } },
            ],
            regularMax: [
              { $match: { pricingType: "yearRound" } },
              {
                $addFields: {
                  maxPrice: {
                    $max: {
                      $filter: {
                        input: [
                          "$regularPrices.standard.fiveOrMorePerson",
                          "$regularPrices.midRange.fiveOrMorePerson",
                          "$regularPrices.luxury.fiveOrMorePerson",
                          "$regularPrices.fiveOrMorePerson", // Fallback for old structure
                        ],
                        cond: { $ne: ["$$this", null] },
                      },
                    },
                  },
                },
              },
              { $match: { maxPrice: { $ne: null } } },
              { $sort: { maxPrice: -1 } },
              { $limit: 1 },
              { $project: { price: "$maxPrice" } },
            ],
            // Seasonal prices - handle both new category structure and old structure
            seasonalMin: [
              { $match: { pricingType: "seasonal" } },
              { $unwind: "$seasons" },
              {
                $addFields: {
                  minPrice: {
                    $min: {
                      $filter: {
                        input: [
                          "$seasons.rates.standard.onePerson",
                          "$seasons.rates.midRange.onePerson",
                          "$seasons.rates.luxury.onePerson",
                          "$seasons.rates.onePerson", // Fallback for old structure
                        ],
                        cond: { $ne: ["$$this", null] },
                      },
                    },
                  },
                },
              },
              { $match: { minPrice: { $ne: null } } },
              { $sort: { minPrice: 1 } },
              { $limit: 1 },
              { $project: { price: "$minPrice" } },
            ],
            seasonalMax: [
              { $match: { pricingType: "seasonal" } },
              { $unwind: "$seasons" },
              {
                $addFields: {
                  maxPrice: {
                    $max: {
                      $filter: {
                        input: [
                          "$seasons.rates.standard.fiveOrMorePerson",
                          "$seasons.rates.midRange.fiveOrMorePerson",
                          "$seasons.rates.luxury.fiveOrMorePerson",
                          "$seasons.rates.fiveOrMorePerson", // Fallback for old structure
                        ],
                        cond: { $ne: ["$$this", null] },
                      },
                    },
                  },
                },
              },
              { $match: { maxPrice: { $ne: null } } },
              { $sort: { maxPrice: -1 } },
              { $limit: 1 },
              { $project: { price: "$maxPrice" } },
            ],
          },
        },
        {
          $project: {
            prices: {
              $concatArrays: [
                "$regularMin",
                "$regularMax",
                "$seasonalMin",
                "$seasonalMax",
              ],
            },
          },
        },
        {
          $unwind: "$prices",
        },
        {
          $match: {
            "prices.price": { $ne: null, $type: "number" },
          },
        },
        {
          $group: {
            _id: null,
            minPrice: { $min: "$prices.price" },
            maxPrice: { $max: "$prices.price" },
          },
        },
      ]);

      const priceRange =
        result.length > 0 && result[0].minPrice && result[0].maxPrice
          ? {
              low: result[0].minPrice,
              high: result[0].maxPrice,
            }
          : { low: 200, high: 5000 }; // Default fallback values

      await redis.set(key, JSON.stringify(priceRange), "EX", 86400);
      responseReturn(res, 200, {
        priceRange,
      });
    } catch (error) {
      logger.error("Error in get_price_range:", error);
      responseReturn(res, 500, {
        error: "Error fetching price range",
        details: error.message,
      });
    }
  };

  query_trips = async (req, res) => {
    try {
      const {
        low,
        high,
        category,
        rating,
        sort,
        pageNumber,
        search,
        perPage: queryPerPage,
      } = req.query;

      const normalizedQuery = {
        low: Number(low) || 0,
        high: Number(high) || 0,
        category: category || "",
        rating: rating || "",
        sort: sort || "newest-desc",
        pageNumber: Number(pageNumber) || 1,
        search: search || "",
        perPage: Number(queryPerPage) || 6,
      };
       // Build stable query hash for cache key
      const hash = crypto
        .createHash("md5")
        .update(JSON.stringify(normalizedQuery || {}))
        .digest("hex");
      const key = `home:trips:query:${hash}`;

      const perPage = queryPerPage ? parseInt(queryPerPage) : 6;
      const skip = (parseInt(pageNumber) - 1) * perPage;

      
      let baseQuery = {};

      if (category) {
        const categoryConditions = await buildCategoryConditions(category);
        if (categoryConditions.length) {
          baseQuery.$or = categoryConditions;
        } else {
          baseQuery.category = category;
        }
      }

      if (rating) {
        baseQuery.rating = { $gte: parseInt(rating) };
      }

      if (search) {
        baseQuery.mainTitle = { $regex: search, $options: "i" };
      }

      // Fetch all trips that match base criteria
      let allTrips = await TripModel.find(baseQuery)
        .populate("category")
        .populate("days.accommodation");

      // Get total count of ALL trips in database (for display purposes)
      const totalTripsCount = await TripModel.countDocuments({});

      // Function to get minimum price from trip (matching frontend logic)
      const getMinimumPrice = (trip) => {
        const prices = [];

        if (trip.pricingType === "yearRound" && trip.regularPrices) {
          // Check new category structure
          if (
            trip.regularPrices.standard ||
            trip.regularPrices.midRange ||
            trip.regularPrices.luxury
          ) {
            const categories = ["standard", "midRange", "luxury"];
            categories.forEach((categoryName) => {
              const categoryPrices = trip.regularPrices[categoryName];
              if (categoryPrices) {
                prices.push(
                  categoryPrices.onePerson,
                  categoryPrices.twoPerson,
                  categoryPrices.threePerson,
                  categoryPrices.fourPerson,
                  categoryPrices.fiveOrMorePerson
                );
              }
            });
          } else {
            // Fallback for old structure
            prices.push(
              trip.regularPrices.onePerson,
              trip.regularPrices.twoPerson,
              trip.regularPrices.threePerson,
              trip.regularPrices.fourPerson,
              trip.regularPrices.fiveOrMorePerson
            );
          }
        } else if (trip.pricingType === "seasonal" && trip.seasons) {
          // Get current season or first season
          const today = new Date();
          let currentSeason = trip.seasons.find((season) => {
            const startDate = new Date(season.startDate);
            const endDate = new Date(season.endDate);
            return today >= startDate && today <= endDate;
          });
          currentSeason = currentSeason || trip.seasons[0];

          if (currentSeason && currentSeason.rates) {
            // Check new category structure
            if (
              currentSeason.rates.standard ||
              currentSeason.rates.midRange ||
              currentSeason.rates.luxury
            ) {
              const categories = ["standard", "midRange", "luxury"];
              categories.forEach((categoryName) => {
                const categoryPrices = currentSeason.rates[categoryName];
                if (categoryPrices) {
                  prices.push(
                    categoryPrices.onePerson,
                    categoryPrices.twoPerson,
                    categoryPrices.threePerson,
                    categoryPrices.fourPerson,
                    categoryPrices.fiveOrMorePerson
                  );
                }
              });
            } else {
              // Fallback for old structure
              prices.push(
                currentSeason.rates.onePerson,
                currentSeason.rates.twoPerson,
                currentSeason.rates.threePerson,
                currentSeason.rates.fourPerson,
                currentSeason.rates.fiveOrMorePerson
              );
            }
          }
        }

        // Filter valid prices and return minimum
        const validPrices = prices.filter(
          (price) => typeof price === "number" && !isNaN(price) && price > 0
        );
        // Return minimum price, or null if no valid prices (to distinguish from 0 price)
        return validPrices.length > 0 ? Math.min(...validPrices) : null;
      };

      // Filter trips by minimum price if price range is provided
      let filteredTrips = allTrips;
      if (
        low !== undefined &&
        high !== undefined &&
        low !== null &&
        high !== null
      ) {
        const minPrice = parseInt(low);
        const maxPrice = parseInt(high);
        // Only filter if we have valid price range values
        if (!isNaN(minPrice) && !isNaN(maxPrice)) {
          filteredTrips = allTrips.filter((trip) => {
            const tripMinimumPrice = getMinimumPrice(trip);
            // If trip has no valid price (null), always include it
            // This ensures trips without pricing data are still shown
            if (tripMinimumPrice === null || tripMinimumPrice === undefined) {
              return true; // Include trips with no valid pricing
            }
            // If trip has price 0, include it only if 0 is within range
            if (tripMinimumPrice === 0) {
              return minPrice <= 0 && maxPrice >= 0;
            }
            return tripMinimumPrice >= minPrice && tripMinimumPrice <= maxPrice;
          });
        }
      }

      // Apply sorting to filtered trips
      let sortedTrips = [...filteredTrips];

      switch (sort) {
        case "low-to-high":
          sortedTrips.sort((a, b) => getMinimumPrice(a) - getMinimumPrice(b));
          break;
        case "high-to-low":
          sortedTrips.sort((a, b) => getMinimumPrice(b) - getMinimumPrice(a));
          break;
        case "rating":
          sortedTrips.sort((a, b) => (b.rating || 0) - (a.rating || 0));
          break;
        case "duration":
          sortedTrips.sort(
            (a, b) => (a.days?.length || 0) - (b.days?.length || 0)
          );
          break;
        case "alphabetical":
          sortedTrips.sort((a, b) => {
            const titleA = (a.mainTitle || "").toLowerCase();
            const titleB = (b.mainTitle || "").toLowerCase();
            if (titleA < titleB) return -1;
            if (titleA > titleB) return 1;
            return 0;
          });
          break;
        case "created-at":
          sortedTrips.sort(
            (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
          );
          break;
        default:
          sortedTrips.sort(
            (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
          );
      }

      // Apply pagination
      const filteredTripsCount = sortedTrips.length;
      const trips = sortedTrips.slice(skip, skip + perPage);

      const responseData = {
        trips,
        totalTrips: filteredTripsCount, // Count after filters (used for pagination)
        overallTrips: totalTripsCount, // Total count before price filtering (for stats)
        perPage,
      };

      await redis.set(key, JSON.stringify(responseData), "EX", 21600);
      responseReturn(res, 200, responseData);
    } catch (error) {
      responseReturn(res, 500, {
        error: "Error querying trips",
        details: error.message,
      });
    }
  };

  // Bulk delete trips
  delete_trips = async (req, res) => {
    const { ids } = req.body;
    try {
      const tripsToDelete = await TripModel.find({ _id: { $in: ids } })
        .select("_id slug")
        .lean();

      const deletedTrips = await TripModel.deleteMany({ _id: { $in: ids } });

      await Promise.allSettled([
        redis.del('home:categories'),
        ...ids.map((id) => delPattern(`home:trip:${id}`)),
        ...tripsToDelete
          .filter((t) => t.slug)
          .map((t) => delPattern(`home:trip:${t.slug}`)),
        delPattern("home:trips:list:*"),
        redis.del("home:trips:special:all"),
        redis.del("home:trips:price-range"),
        delPattern("home:trips:query:*")
      ])

      return responseReturn(res, 200, {
        message: `Deleted ${deletedTrips.deletedCount} trips successfully`,
        deletedCount: deletedTrips.deletedCount,
      });
    } catch (err) {
      logger.error("Error deleting trips:", err);
      return responseReturn(res, 500, { error: "Internal server error" });
    }
  };
}

module.exports = new TripController();

/*
  NOTE: The below legacy definitions were duplicated earlier in this file.
  They have been replaced above to support slug-based detail URLs and cache invalidation.
*/
