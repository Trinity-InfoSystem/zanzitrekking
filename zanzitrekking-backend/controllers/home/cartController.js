// wishlistController.js
const Wishlist = require("../../models/wishlist");
const logger = require('./../../utilities/logger');
const Cart = require("../../models/cart");
const Trip = require("../../models/trip"); // Import Trip model
const { responseReturn } = require("../../utilities/response");
const { ObjectId } = require("mongodb");

class WishlistController {
  // Helper function to format a date as YYYY-MM-DD string
  // Handles both old dates (stored at midnight local) and new dates (stored at noon UTC)
  formatDateString = (dateInput) => {
    if (!dateInput) {
      return null;
    }

    // If it's already a YYYY-MM-DD string, return it
    if (typeof dateInput === "string" && /^\d{4}-\d{2}-\d{2}$/.test(dateInput)) {
      return dateInput;
    }

    let date;
    if (dateInput instanceof Date) {
      date = dateInput;
    } else if (typeof dateInput === "string") {
      // If it's an ISO string, parse it
      if (dateInput.includes("T")) {
        date = new Date(dateInput);
      } else {
        date = new Date(dateInput);
      }
    } else {
      date = new Date(dateInput);
    }

    if (isNaN(date.getTime())) {
      return null;
    }

    // Check if this is a date stored at midnight local time (old format)
    // Dates stored at midnight in timezones ahead of UTC will have UTC hours >= 20 (evening UTC)
    // Dates stored at noon UTC (new format) will have UTC hours = 12
    const utcHours = date.getUTCHours();
    const utcYear = date.getUTCFullYear();
    const utcMonth = date.getUTCMonth();
    const utcDay = date.getUTCDate();

    // If UTC hours >= 20, it's likely a date stored at midnight in a timezone ahead of UTC
    // In this case, the UTC date is one day earlier than intended, so we add 1 day
    if (utcHours >= 20) {
      // This is an old date stored at midnight local time
      // Add 1 day to get the correct date
      const correctedDate = new Date(Date.UTC(utcYear, utcMonth, utcDay + 1, 12, 0, 0, 0));
      const year = correctedDate.getUTCFullYear();
      const month = String(correctedDate.getUTCMonth() + 1).padStart(2, "0");
      const day = String(correctedDate.getUTCDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    }

    // For dates stored at noon UTC (new format) or other times, use UTC components directly
    const year = utcYear;
    const month = String(utcMonth + 1).padStart(2, "0");
    const day = String(utcDay).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // Helper function to parse date string (YYYY-MM-DD) as local date to avoid timezone issues
  // When you do new Date("2024-02-15"), it interprets as UTC midnight, which can shift the date
  // This function parses it as a local date instead
  parseLocalDate = (dateInput) => {
    if (!dateInput) {
      return null;
    }

    // If it's already a Date object, convert to noon UTC to prevent timezone shifts
    if (dateInput instanceof Date) {
      const year = dateInput.getUTCFullYear();
      const month = dateInput.getUTCMonth();
      const day = dateInput.getUTCDate();
      return new Date(Date.UTC(year, month, day, 12, 0, 0, 0));
    }

    // If it's a string in YYYY-MM-DD format, parse and store at noon UTC
    // This prevents timezone shifts when MongoDB stores/retrieves dates
    if (typeof dateInput === "string") {
      // Handle YYYY-MM-DD format
      if (/^\d{4}-\d{2}-\d{2}$/.test(dateInput)) {
        const [year, month, day] = dateInput.split("-").map(Number);
        // Store at noon UTC to prevent timezone shifts
        // This ensures the UTC date components match the intended date
        const date = new Date(Date.UTC(year, month - 1, day, 12, 0, 0, 0));
        return date;
      }
      // Handle ISO string with time (YYYY-MM-DDTHH:mm:ss...)
      if (dateInput.includes("T")) {
        const datePart = dateInput.split("T")[0];
        const [year, month, day] = datePart.split("-").map(Number);
        // Store at noon UTC to prevent timezone shifts
        const date = new Date(Date.UTC(year, month - 1, day, 12, 0, 0, 0));
        return date;
      }
      // Fallback to regular Date parsing
      const date = new Date(dateInput);
      if (isNaN(date.getTime())) {
        return null;
      }
      // Extract date components and store at noon UTC
      const year = date.getUTCFullYear();
      const month = date.getUTCMonth();
      const day = date.getUTCDate();
      return new Date(Date.UTC(year, month, day, 12, 0, 0, 0));
    }

    // Fallback - convert to noon UTC to prevent timezone shifts
    const date = new Date(dateInput);
    if (isNaN(date.getTime())) {
      return null;
    }
    const year = date.getUTCFullYear();
    const month = date.getUTCMonth();
    const day = date.getUTCDate();
    return new Date(Date.UTC(year, month, day, 12, 0, 0, 0));
  };

  // Helper function to determine the price based on pricing type, date, and category
  getPriceForTrip = async (
    tripId,
    date,
    travelersNumber,
    category = "standard"
  ) => {
    try {
      const trip = await Trip.findById(tripId);
      if (!trip) {
        throw new Error("Trip not found");
      }

      const travelers = parseInt(travelersNumber) || 1;
      let price = 0;

      if (trip.pricingType === "yearRound") {
        // Handle new category-specific pricing structure
        let categoryPrices = null;
        if (trip.regularPrices && trip.regularPrices[category]) {
          categoryPrices = trip.regularPrices[category];
        } else if (trip.regularPrices && trip.regularPrices.onePerson) {
          // Fallback for old pricing structure
          categoryPrices = trip.regularPrices;
        }

        if (categoryPrices) {
          if (travelers >= 5) {
            price = categoryPrices.fiveOrMorePerson;
          } else if (travelers === 4) {
            price = categoryPrices.fourPerson;
          } else if (travelers === 3) {
            price = categoryPrices.threePerson;
          } else if (travelers === 2) {
            price = categoryPrices.twoPerson;
          } else {
            price = categoryPrices.onePerson;
          }
        }
      } else if (trip.pricingType === "seasonal") {
        // Find the appropriate season for the given date
        // Ensure date is parsed correctly (could be Date object or string)
        const bookingDate = date instanceof Date ? date : this.parseLocalDate(date) || new Date(date);
        bookingDate.setHours(0, 0, 0, 0);
        let applicableSeason = trip.seasons.find((season) => {
          const startDate = new Date(season.startDate);
          const endDate = new Date(season.endDate);
          startDate.setHours(0, 0, 0, 0);
          endDate.setHours(0, 0, 0, 0);
          return bookingDate >= startDate && bookingDate <= endDate;
        });

        // If no season found, find the next upcoming season or use the first season
        if (!applicableSeason && trip.seasons && trip.seasons.length > 0) {
          const upcomingSeasons = trip.seasons
            .map((season) => ({
              ...season,
              startDate: new Date(season.startDate),
            }))
            .filter((season) => season.startDate > bookingDate)
            .sort((a, b) => a.startDate - b.startDate);

          if (upcomingSeasons.length > 0) {
            // Use the next upcoming season
            applicableSeason = upcomingSeasons[0];
          } else {
            // No upcoming seasons, use the first season (assume yearly cycle)
            applicableSeason = trip.seasons[0];
          }
        }

        // If still no season, try regular prices
        if (!applicableSeason) {
          if (trip.regularPrices) {
            let categoryPrices = null;
            if (trip.regularPrices[category]) {
              categoryPrices = trip.regularPrices[category];
            } else if (trip.regularPrices.onePerson) {
              categoryPrices = trip.regularPrices;
            }

            if (categoryPrices) {
              if (travelers >= 5) {
                price = categoryPrices.fiveOrMorePerson;
              } else if (travelers === 4) {
                price = categoryPrices.fourPerson;
              } else if (travelers === 3) {
                price = categoryPrices.threePerson;
              } else if (travelers === 2) {
                price = categoryPrices.twoPerson;
              } else {
                price = categoryPrices.onePerson;
              }
            }
            return price;
          } else {
            // Last resort: return 0 instead of throwing error
            logger.error(
              "No season or regular prices available for trip:",
              trip._id
            );
            return 0;
          }
        }

        // Handle new category-specific pricing structure
        let categoryPrices = null;
        if (applicableSeason.rates && applicableSeason.rates[category]) {
          categoryPrices = applicableSeason.rates[category];
        } else if (applicableSeason.rates && applicableSeason.rates.onePerson) {
          // Fallback for old pricing structure
          categoryPrices = applicableSeason.rates;
        }

        if (categoryPrices) {
          if (travelers >= 5) {
            price = categoryPrices.fiveOrMorePerson;
          } else if (travelers === 4) {
            price = categoryPrices.fourPerson;
          } else if (travelers === 3) {
            price = categoryPrices.threePerson;
          } else if (travelers === 2) {
            price = categoryPrices.twoPerson;
          } else {
            price = categoryPrices.onePerson;
          }
        } else {
          logger.error(
            "No category prices found for season:",
            applicableSeason.name
          );
          return 0;
        }
      } else {
        
        return 0;
      }

      return price;
    } catch (error) {
      
      // Return 0 instead of throwing to prevent cart operations from failing
      return 0;
    }
  };

  // Helper function to calculate minimum valid booking date based on rules
  // Note: All trips can be booked from tomorrow (1 day minimum)
  // The 4-day restriction for Midrange/Luxury Safaris is handled on frontend with warnings only
  getMinimumBookingDate = (categoryName, selectedCategory) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // For ALL trips (Budget, Midrange, Luxury, all categories) - minimum is 1 day (tomorrow)
    // The frontend will show warnings for Midrange/Luxury Safaris if less than 4 days
    // but the backend allows any date from tomorrow onwards
    const minDate = new Date(today);
    minDate.setDate(minDate.getDate() + 1);
    return minDate;
  };

  // Helper function to validate and adjust date based on booking deadline rules
  validateAndAdjustBookingDate = (date, categoryName, selectedCategory) => {
    const bookingDate = new Date(date);
    bookingDate.setHours(0, 0, 0, 0);

    const minValidDate = this.getMinimumBookingDate(
      categoryName,
      selectedCategory
    );
    minValidDate.setHours(0, 0, 0, 0);

    // If booking date is before minimum valid date, adjust it
    if (bookingDate < minValidDate) {
      return minValidDate;
    }

    return bookingDate;
  };

  // Helper function to get the season name for a given date
  getSeasonNameForDate = (trip, date) => {
    if (!trip) {
      return "Default";
    }

    if (trip.pricingType === "yearRound") {
      return "Year Round";
    } else if (trip.pricingType === "seasonal") {
      // Ensure date is parsed correctly (could be Date object or string)
      const bookingDate = date instanceof Date ? date : this.parseLocalDate(date) || new Date(date);
      bookingDate.setHours(0, 0, 0, 0);
      let applicableSeason = trip.seasons.find((season) => {
        const startDate = new Date(season.startDate);
        const endDate = new Date(season.endDate);
        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(0, 0, 0, 0);
        return bookingDate >= startDate && bookingDate <= endDate;
      });

      // If no season found, find the next upcoming season or use the first season
      if (!applicableSeason && trip.seasons && trip.seasons.length > 0) {
        const upcomingSeasons = trip.seasons
          .map((season) => ({
            ...season,
            startDate: new Date(season.startDate),
          }))
          .filter((season) => season.startDate > bookingDate)
          .sort((a, b) => a.startDate - b.startDate);

        if (upcomingSeasons.length > 0) {
          applicableSeason = upcomingSeasons[0];
        } else {
          // No upcoming seasons, use the first season
          applicableSeason = trip.seasons[0];
        }
      }

      return applicableSeason ? applicableSeason.name : "Default";
    }
    return "Default";
  };

  add_to_cart = async (req, res) => {
    const {
      userId,
      tripId,
      startingDate,
      mainTitle,
      mainImage,
      travelersNumber,
      discount,
      selectedCategory = "standard",
    } = req.body;

    try {
      if (!tripId) {
        return responseReturn(res, 400, { error: "Trip ID is required" });
      }

      if (!startingDate) {
        return responseReturn(res, 400, { error: "Start date is required" });
      }

      // Parse date as local date to avoid timezone issues
      let bookingDate = this.parseLocalDate(startingDate);
      if (!bookingDate || isNaN(bookingDate.getTime())) {
        return responseReturn(res, 400, { error: "Invalid date format" });
      }

      // Get the trip to determine pricing and category
      const trip = await Trip.findById(tripId).populate("category", "name");
      if (!trip) {
        return responseReturn(res, 404, { error: "Trip not found" });
      }

      // Get category name for validation
      const categoryName = trip.category?.name || null;

      // Accept the selected date as-is (no adjustment)
      // Users can select any date, warnings are shown on frontend

      // If seasonal pricing, check if date falls within a season
      // If not, find the next upcoming season and adjust the date
      if (
        trip.pricingType === "seasonal" &&
        trip.seasons &&
        trip.seasons.length > 0
      ) {
        const applicableSeason = trip.seasons.find((season) => {
          const startDate = new Date(season.startDate);
          const endDate = new Date(season.endDate);
          return bookingDate >= startDate && bookingDate <= endDate;
        });

        // If no season found, find the next upcoming season or use first season
        if (!applicableSeason) {
          const upcomingSeasons = trip.seasons
            .map((season) => ({
              ...season,
              startDate: new Date(season.startDate),
            }))
            .filter((season) => season.startDate > bookingDate)
            .sort((a, b) => a.startDate - b.startDate);

          if (upcomingSeasons.length > 0) {
            // Adjust booking date to the start of the next upcoming season
            bookingDate = upcomingSeasons[0].startDate;
          } else {
            // No upcoming seasons, use the first season's start date (assume yearly cycle)
            bookingDate = new Date(trip.seasons[0].startDate);
          }

          // Accept the adjusted seasonal date as-is
        }
      }

      // Check for existing cart item with the adjusted date
      const existingCart = await Cart.findOne({
        userId,
        tripId,
        startingDate: bookingDate,
      });

      if (existingCart) {
        return responseReturn(res, 200, {
          message: "Trip Already Added To Cart",
        });
      }

      // Calculate price based on pricing type, date, and category
      const pricePerPerson = await this.getPriceForTrip(
        tripId,
        bookingDate,
        travelersNumber,
        selectedCategory
      );

      if (!pricePerPerson || pricePerPerson === 0) {
        return responseReturn(res, 400, {
          error:
            "Unable to calculate price for this trip. Please contact support.",
        });
      }

      const totalPrice = pricePerPerson * (parseInt(travelersNumber) || 1);

      // Get season name for display
      const seasonName = this.getSeasonNameForDate(trip, bookingDate);

      // Create new cart item
      const newCart = await Cart.create({
        userId,
        tripId,
        startingDate: bookingDate,
        travelersNumber: parseInt(travelersNumber) || 1,
        mainTitle,
        mainImage,
        discount: discount || 0,
        pricingType: trip.pricingType,
        regularPrices: trip.regularPrices,
        seasons: trip.seasons,
        selectedCategory,
        pricePerPerson,
        totalPrice,
        seasonName,
      });

      return responseReturn(res, 201, {
        message: "Added To Cart Successfully",
        cart: newCart,
      });
    } catch (error) {
      
      return responseReturn(res, 500, {
        error: "Internal Server Error",
        details: error.message,
      });
    }
  };

  update_cart_trip = async (req, res) => {
    try {
      const {
        userId,
        cartId,
        travelersNumber,
        startingDate,
        selectedCategory,
        childrenCount,
        childrenAges,
      } = req.body;

      // Find the cart item
      const cartItem = await Cart.findOne({ _id: cartId, userId });
      if (!cartItem) {
        return res.status(404).json({
          error: "Cart item not found",
        });
      }

      // Get trip to fetch category information
      const trip = await Trip.findById(cartItem.tripId).populate(
        "category",
        "name"
      );
      if (!trip) {
        return res.status(404).json({
          error: "Trip not found",
        });
      }

      const categoryName = trip.category?.name || null;
      const categoryToUse =
        selectedCategory || cartItem.selectedCategory || "standard";

      // Accept the selected date as-is (no adjustment)
      // Users can select any date, warnings are shown on frontend
      let validatedDate = cartItem.startingDate;
      if (startingDate) {
        // Parse date as local date to avoid timezone issues
        validatedDate = this.parseLocalDate(startingDate);
        if (!validatedDate || isNaN(validatedDate.getTime())) {
          return res.status(400).json({
            error: "Invalid date format",
          });
        }
      }

      // Recalculate price if date or travelers number changed
      let pricePerPerson = cartItem.pricePerPerson;
      let totalPrice = cartItem.totalPrice;
      let seasonName = cartItem.seasonName;

      // Normalize dates for comparison
      const cartItemDate = this.parseLocalDate(cartItem.startingDate) || new Date(cartItem.startingDate);
      cartItemDate.setHours(0, 0, 0, 0);
      validatedDate.setHours(0, 0, 0, 0);

      const dateChanged =
        startingDate && validatedDate.getTime() !== cartItemDate.getTime();

      if (dateChanged) {
        pricePerPerson = await this.getPriceForTrip(
          cartItem.tripId,
          validatedDate,
          travelersNumber || cartItem.travelersNumber,
          categoryToUse
        );
        seasonName = this.getSeasonNameForDate(trip, validatedDate);
      }

      if (travelersNumber && travelersNumber !== cartItem.travelersNumber) {
        pricePerPerson = await this.getPriceForTrip(
          cartItem.tripId,
          validatedDate,
          travelersNumber,
          categoryToUse
        );
      }

      if (selectedCategory && selectedCategory !== cartItem.selectedCategory) {
        // Accept date as-is when category changes (no adjustment)
        // Users can select any date, warnings are shown on frontend

        pricePerPerson = await this.getPriceForTrip(
          cartItem.tripId,
          validatedDate,
          travelersNumber || cartItem.travelersNumber,
          selectedCategory
        );
        seasonName = this.getSeasonNameForDate(trip, validatedDate);
      }

      // Check if children data changed and recalculate price if needed
      const finalChildrenCount = childrenCount !== undefined ? childrenCount : cartItem.childrenCount || 0;
      const finalChildrenAges = childrenAges !== undefined && Array.isArray(childrenAges) ? childrenAges : cartItem.childrenAges || [];
      const childrenChanged = 
        (childrenCount !== undefined && childrenCount !== (cartItem.childrenCount || 0)) ||
        (childrenAges !== undefined && JSON.stringify(childrenAges) !== JSON.stringify(cartItem.childrenAges || []));

      // Recalculate price if children data changed
      if (childrenChanged) {
        // Get base price per person (for adults)
        const basePricePerPerson = pricePerPerson || await this.getPriceForTrip(
          cartItem.tripId,
          validatedDate,
          travelersNumber || cartItem.travelersNumber,
          categoryToUse
        );
        
        // Calculate total with children discounts
        const adultCount = parseInt(travelersNumber) || cartItem.travelersNumber;
        let totalAdultPrice = basePricePerPerson * adultCount;
        let totalChildrenPrice = 0;

        finalChildrenAges.forEach((age) => {
          if (age !== null && age !== undefined) {
            let childDiscountRate = 0;
            if (age >= 5 && age < 12) {
              childDiscountRate = 0.15; // 15% discount for ages 5-11
            } else if (age >= 12 && age <= 15) {
              childDiscountRate = 0.10; // 10% discount for ages 12-15
            }
            // Children 16+ pay full price, under 5 pay full price
            const childPrice = basePricePerPerson * (1 - childDiscountRate);
            totalChildrenPrice += childPrice;
          } else {
            // If age not provided, charge full price
            totalChildrenPrice += basePricePerPerson;
          }
        });

        // Apply trip discount if available
        const totalBeforeDiscount = totalAdultPrice + totalChildrenPrice;
        const discountAmount = cartItem.discount
          ? (totalBeforeDiscount * cartItem.discount) / 100
          : 0;
        totalPrice = totalBeforeDiscount - discountAmount;
      } else {
        // Calculate total price normally (no children or children unchanged)
        totalPrice =
          pricePerPerson *
          (parseInt(travelersNumber) || cartItem.travelersNumber);
      }

      // Build update object
      const updateData = {
        travelersNumber: travelersNumber || cartItem.travelersNumber,
        startingDate: validatedDate,
        selectedCategory: categoryToUse,
        pricePerPerson,
        totalPrice,
        seasonName,
      };

      // Add children data if provided
      if (childrenCount !== undefined) {
        updateData.childrenCount = childrenCount;
      }
      if (childrenAges !== undefined && Array.isArray(childrenAges)) {
        updateData.childrenAges = childrenAges;
      }

      const updatedCart = await Cart.findOneAndUpdate(
        { _id: cartId, userId },
        {
          $set: updateData,
        },
        { new: true }
      );

      // Format startingDate as YYYY-MM-DD string for consistent response
      const responseCart = updatedCart.toObject ? updatedCart.toObject() : updatedCart;
      if (responseCart.startingDate) {
        responseCart.startingDate = this.formatDateString(responseCart.startingDate);
      }

      res.status(200).json({
        message: "Cart updated successfully",
        cart: responseCart,
      });
    } catch (error) {
      
      res.status(500).json({
        error: error.message,
      });
    }
  };

  get_cart_trips = async (req, res) => {
    const { userId } = req.params;
    try {
      const cart_trips = await Cart.find({
        userId: ObjectId.createFromHexString(userId),
      }).lean();

      let total_price = 0;
      let cart_trip_count = cart_trips.length;

      // Calculate total price from cart items and ensure all have calculated prices
      for (let item of cart_trips) {
        // Fetch trip to get category information
        const trip = await Trip.findById(item.tripId)
          .populate("category", "name")
          .lean();
        if (trip && trip.category) {
          item.categoryName = trip.category.name;
          item.categoryId = trip.category._id;
        }

        const categoryName = trip?.category?.name || null;
        const selectedCategory = item.selectedCategory || "standard";

        // Validate and adjust booking date based on booking deadline rules
        // Parse date as local date to avoid timezone issues
        const currentDate = this.parseLocalDate(item.startingDate) || new Date(item.startingDate);
        const minValidDate = this.getMinimumBookingDate(
          categoryName,
          selectedCategory
        );

        let needsDateUpdate = false;
        let adjustedDate = currentDate;

        // Check if current date is before minimum valid date or is today/past
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        currentDate.setHours(0, 0, 0, 0);

        if (currentDate < minValidDate || currentDate <= today) {
          // Use minValidDate directly (which is always tomorrow - 1 day minimum)
          adjustedDate = minValidDate;
          needsDateUpdate = true;
        }

        // If date needs to be updated, recalculate price and update cart item
        if (needsDateUpdate) {
          try {
            const pricePerPerson = await this.getPriceForTrip(
              item.tripId,
              adjustedDate,
              item.travelersNumber,
              selectedCategory
            );
            const totalPrice = pricePerPerson * item.travelersNumber;
            const seasonName = this.getSeasonNameForDate(trip, adjustedDate);

            // Update the cart item with adjusted date and recalculated prices
            await Cart.findByIdAndUpdate(item._id, {
              $set: {
                startingDate: adjustedDate,
                pricePerPerson,
                totalPrice,
                seasonName,
              },
            });

            item.startingDate = adjustedDate;
            item.pricePerPerson = pricePerPerson;
            item.totalPrice = totalPrice;
            item.seasonName = seasonName;
          } catch (error) {
            logger.error(
              `Error updating date and price for cart item ${item._id}:`,
              error
            );
          }
        } else {
          // Recalculate price if missing
          if (!item.totalPrice || !item.pricePerPerson) {
            try {
              const pricePerPerson = await this.getPriceForTrip(
                item.tripId,
                item.startingDate,
                item.travelersNumber,
                selectedCategory
              );
              const totalPrice = pricePerPerson * item.travelersNumber;

              // Update the cart item with calculated prices
              await Cart.findByIdAndUpdate(item._id, {
                $set: {
                  pricePerPerson,
                  totalPrice,
                },
              });

              item.pricePerPerson = pricePerPerson;
              item.totalPrice = totalPrice;
            } catch (error) {
              logger.error(
                `Error calculating price for cart item ${item._id}:`,
                error
              );
              item.pricePerPerson = 0;
              item.totalPrice = 0;
            }
          }
        }

        total_price += item.totalPrice || 0;

        // Format startingDate as YYYY-MM-DD string to avoid timezone issues on frontend
        if (item.startingDate) {
          item.startingDate = this.formatDateString(item.startingDate);
        }
      }

      responseReturn(res, 200, {
        cart_trips,
        total_price,
        cart_trip_count,
      });
    } catch (error) {
      
      responseReturn(res, 500, { error: "Internal Server Error" });
    }
  };

  delete_cart_trip = async (req, res) => {
    const { cartId } = req.params;

    try {
      await Cart.findByIdAndDelete(cartId);
      responseReturn(res, 200, { message: "Cart Trip Deleted Successfully" });
    } catch (error) {
      
      responseReturn(res, 500, { error: "Internal Server Error" });
    }
  };

  clear_cart = async (req, res) => {
    const { userId } = req.params;

    try {
      const result = await Cart.deleteMany({ userId });

      if (result.deletedCount === 0) {
        return responseReturn(res, 404, {
          message: "No cart items found for this user",
        });
      }

      responseReturn(res, 200, {
        message: `Successfully cleared ${result.deletedCount} cart items`,
      });
    } catch (error) {
      
      responseReturn(res, 500, { error: "Internal Server Error" });
    }
  };

  add_to_wishlist = async (req, res) => {
    const {
      userId,
      tripId,
      mainTitle,
      discount,
      rating,
      mainImage,
      days,
      mainDestination,
    } = req.body;

    try {
      const wishlistItem = await Wishlist.findOne({
        userId,
        tripId,
      });

      if (wishlistItem) {
        responseReturn(res, 400, { error: "Trip Already In Wishlist" });
      } else {
        // Get trip details to store pricing information
        const trip = await Trip.findById(tripId);
        if (!trip) {
          return responseReturn(res, 404, { error: "Trip not found" });
        }

        // Use values from request body, fallback to trip object if not provided
        // This ensures required fields are always present
        const wishlistMainTitle = mainTitle || trip.mainTitle;
        const wishlistMainImage = mainImage || trip.mainImage;
        const wishlistDays = days !== undefined ? days : (trip.days ? trip.days.length : 0);
        
        // Validate required fields
        if (!wishlistMainTitle) {
          return responseReturn(res, 400, { error: "Main title is required" });
        }
        if (!wishlistMainImage) {
          return responseReturn(res, 400, { error: "Main image is required" });
        }
        if (!wishlistDays || wishlistDays === 0) {
          return responseReturn(res, 400, { error: "Days is required and must be greater than 0" });
        }

        // Use first destination if mainDestination is an array
        // Handle mainDestination - it should be an object with name and location, or undefined
        let destinationForWishlist = null;
        if (mainDestination) {
          destinationForWishlist = Array.isArray(mainDestination)
            ? mainDestination[0]
            : mainDestination;
          // Ensure it has the correct structure
          if (typeof destinationForWishlist === 'object' && destinationForWishlist !== null) {
            // Valid structure
          } else {
            destinationForWishlist = null;
          }
        } else if (trip.days && trip.days.length > 0 && trip.days[0].mainDestination) {
          // Fallback to trip's first day destination if not provided
          destinationForWishlist = trip.days[0].mainDestination;
        }

        // Ensure pricingType is valid (required field, must be "yearRound" or "seasonal")
        const pricingType = (trip.pricingType && ["yearRound", "seasonal"].includes(trip.pricingType))
          ? trip.pricingType
          : "yearRound";

        await Wishlist.create({
          userId,
          tripId,
          mainTitle: wishlistMainTitle,
          discount: discount !== undefined ? discount : (trip.discount || 0),
          rating: rating !== undefined ? rating : (trip.rating || 0),
          mainImage: wishlistMainImage,
          days: wishlistDays,
          mainDestination: destinationForWishlist,
          pricingType: pricingType,
          regularPrices: trip.regularPrices || undefined,
          seasons: trip.seasons || undefined,
          inclusions: trip.inclusions || undefined,
          exclusions: trip.exclusions || undefined,
          selectedCategory: "standard", // Default to standard category
        });

        const wishlist = await Wishlist.find({ userId });
        const wishlist_count = wishlist.length;
        responseReturn(res, 201, {
          message: "Added To Wishlist Successfully",
          data: {
            wishlist,
            wishlist_count,
          },
        });
      }
    } catch (error) {
      responseReturn(res, 500, { error: "Internal Server Error" });
    }
  };

  get_wishlist_trips = async (req, res) => {
    const { userId } = req.params;
    try {
      const wishlist = await Wishlist.find({ userId });
      const wishlist_count = wishlist.length;

      responseReturn(res, 200, {
        wishlist,
        wishlist_count,
      });
    } catch (error) {
      
      responseReturn(res, 500, { error: "Internal Server Error" });
    }
  };

  remove_wishlist_trip = async (req, res) => {
    const { wishlistId } = req.params;
    try {
      const removedWishlist = await Wishlist.findByIdAndDelete(wishlistId);

      if (!removedWishlist) {
        return responseReturn(res, 404, { error: "Wishlist item not found" });
      }

      const wishlist = await Wishlist.find({ userId: removedWishlist.userId });
      const wishlist_count = wishlist.length;

      responseReturn(res, 200, {
        message: "Removed From Wishlist Successfully",
        data: {
          wishlist,
          wishlist_count,
        },
      });
    } catch (error) {
      
      responseReturn(res, 500, { error: "Internal Server Error" });
    }
  };

  add_wishlist_to_cart = async (req, res) => {
    const { wishlistId } = req.params;
    const { startingDate, travelersNumber } = req.body;

    try {
      const wishlistItem = await Wishlist.findById(wishlistId);
      if (!wishlistItem) {
        return responseReturn(res, 404, { error: "Wishlist item not found" });
      }

      // Parse date as local date to avoid timezone issues
      const parsedStartingDate = this.parseLocalDate(startingDate);
      if (!parsedStartingDate || isNaN(parsedStartingDate.getTime())) {
        return responseReturn(res, 400, { error: "Invalid date format" });
      }

      // Check if already in cart
      const existingCart = await Cart.findOne({
        userId: wishlistItem.userId,
        tripId: wishlistItem.tripId,
        startingDate: parsedStartingDate,
      });

      if (existingCart) {
        return responseReturn(res, 400, { error: "Trip already in cart" });
      }

      // Use the existing getPriceForTrip method with the wishlist item's selected category
      const pricePerPerson = await this.getPriceForTrip(
        wishlistItem.tripId,
        parsedStartingDate,
        travelersNumber,
        wishlistItem.selectedCategory || "standard"
      );
      const totalPrice = pricePerPerson * (parseInt(travelersNumber) || 1);

      // Get season name for display
      const trip = await Trip.findById(wishlistItem.tripId);
      const seasonName = this.getSeasonNameForDate(trip, parsedStartingDate);

      const cart = await Cart.create({
        userId: wishlistItem.userId,
        tripId: wishlistItem.tripId,
        startingDate: parsedStartingDate,
        travelersNumber: parseInt(travelersNumber) || 1,
        mainTitle: wishlistItem.mainTitle,
        mainImage: wishlistItem.mainImage,
        discount: wishlistItem.discount || 0,
        pricingType: wishlistItem.pricingType,
        regularPrices: wishlistItem.regularPrices,
        seasons: wishlistItem.seasons,
        selectedCategory: wishlistItem.selectedCategory || "standard",
      });

      responseReturn(res, 201, {
        message: "Wishlist item added to cart successfully",
        cart,
      });
    } catch (error) {
      
      responseReturn(res, 500, { error: "Internal Server Error" });
    }
  };
}

module.exports = new WishlistController();
