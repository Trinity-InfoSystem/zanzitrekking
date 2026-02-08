const Trip = require("../models/trip");

/**
 * Check if a booking is allowed based on category, package type, and trip start date
 * @param {Object} orderItem - Order cart item with tripId, selectedCategory, startingDate
 * @param {Date} tripStartDate - Trip start date
 * @param {boolean} isTestOrder - If true, enable verbose logging (for testing specific orders)
 * @returns {Object} - { allowed: boolean, blocked: boolean, warning: string|null, restrictionType: string|null, daysUntilTrip: number }
 */
const checkBookingRestriction = async (
  orderItem,
  tripStartDate = null,
  isTestOrder = false
) => {
  try {
    if (isTestOrder) {
      console.log("[Booking Restriction] Starting check...");
      console.log("[Booking Restriction] Order Item:", {
        tripId: orderItem.tripId,
        selectedCategory: orderItem.selectedCategory,
        startingDate: orderItem.startingDate,
      });
    }

    // Get trip start date from order item or parameter
    const startDate = tripStartDate || orderItem.startingDate;
    
    // CRITICAL: If we receive an ISO string, extract the date part and parse it correctly
    // The frontend sends dates like '2026-02-04T00:00:00.000Z' which represents Feb 4 at UTC midnight
    // We need to extract the UTC date components from this string, not parse it as local time
    let year, month, day;
    
    if (typeof startDate === "string") {
      // If it's an ISO string, extract the date part (YYYY-MM-DD)
      if (startDate.includes("T")) {
        const datePart = startDate.split("T")[0]; // e.g., "2026-02-04"
        const [yearStr, monthStr, dayStr] = datePart.split("-");
        year = parseInt(yearStr, 10);
        month = parseInt(monthStr, 10) - 1; // JavaScript months are 0-indexed
        day = parseInt(dayStr, 10);
        
      }
    } else if (startDate instanceof Date) {
      // Date object - extract UTC components
      year = startDate.getUTCFullYear();
      month = startDate.getUTCMonth();
      day = startDate.getUTCDate();
    } else {
      // Fallback: try to parse as Date
      const startDateObj = new Date(startDate);
      year = startDateObj.getUTCFullYear();
      month = startDateObj.getUTCMonth();
      day = startDateObj.getUTCDate();
    }
    
    // Create UTC date at midnight for the trip start date
    const tripStart = new Date(Date.UTC(year, month, day, 0, 0, 0, 0));
    
    // Get current date in UTC at midnight
    const now = new Date();
    const nowYear = now.getUTCFullYear();
    const nowMonth = now.getUTCMonth();
    const nowDay = now.getUTCDate();
    const nowUTC = new Date(Date.UTC(nowYear, nowMonth, nowDay, 0, 0, 0, 0));

    // Calculate days until trip using UTC dates
    const daysUntilTrip = Math.ceil((tripStart - nowUTC) / (1000 * 60 * 60 * 24));
    
    if (isTestOrder) {
      console.log("[Booking Restriction] Days until trip:", daysUntilTrip);
      console.log(
        "[Booking Restriction] Trip start date (UTC):",
        tripStart.toISOString().split("T")[0]
      );
      console.log(
        "[Booking Restriction] Today's date (UTC):",
        nowUTC.toISOString().split("T")[0]
      );
      console.log(
        "[Booking Restriction] Original startDate input:",
        startDate instanceof Date ? startDate.toISOString() : startDate
      );
    }

    // Get trip category - prefer saved category from order item, otherwise fetch from trip
    let tripCategory = null;

    // First check if category is already saved in the order item
    if (orderItem.categoryName) {
      tripCategory = orderItem.categoryName;
      if (isTestOrder) {
        console.log(
          "[Booking Restriction] Using saved category from order item:",
          tripCategory
        );
      }
    } else if (orderItem.categoryId) {
      // If we have categoryId but no name, fetch the category
      const Category = require("../models/category");
      const category = await Category.findById(orderItem.categoryId);
      if (category) {
        tripCategory = category.name;
        if (isTestOrder) {
          console.log(
            "[Booking Restriction] Fetched category by ID:",
            tripCategory
          );
        }
      }
    } else if (orderItem.tripId) {
      // Fallback: fetch category from trip if not saved in order item
      const trip = await Trip.findById(orderItem.tripId).populate("category");
      if (isTestOrder) {
        console.log("[Booking Restriction] Trip:", trip);
      }
      if (trip && trip.category) {
        tripCategory = trip.category.name || trip.category;
        if (isTestOrder) {
          console.log(
            "[Booking Restriction] Fetched category from trip:",
            tripCategory
          );
        }
      }
    }

    if (isTestOrder) {
      console.log("[Booking Restriction] Trip Category:", tripCategory);
    }

    // Get package type (selectedCategory)
    const packageType = orderItem.selectedCategory || "standard";
    if (isTestOrder) {
      console.log("[Booking Restriction] Package Type:", packageType);
    }

    // Normalize category name for comparison
    const categoryName = tripCategory ? tripCategory.toLowerCase() : "";
    if (isTestOrder) {
      console.log(
        "[Booking Restriction] Normalized Category Name:",
        categoryName
      );
    }

    // Booking Rules (aligned with frontend Checkout restrictions):
    // 1. Budget package (standard) - NO restrictions
    // 2. Trekking, Cultural Tours, Zanzibar (any package type) - BLOCK if trip starts tomorrow (or earlier)
    // 3. Midrange/Luxury SAFARIS ONLY - BLOCK if trip starts within 4 days (tomorrow up to 4 days)

    const isSafariCategory = categoryName.includes("safari");
    const isCulturalCategory = categoryName.includes("cultural");
    const isTrekkingCategory = categoryName.includes("trekking");
    const isZanzibarCategory = categoryName.includes("zanzibar");

    const isBudgetPackage = packageType === "standard";
    const isMidrangeOrLuxuryPackage =
      packageType === "midRange" || packageType === "luxury";

    if (isTestOrder) {
      console.log("[Booking Restriction] Rule Check - Category:", categoryName);
      console.log(
        "[Booking Restriction] Rule Check - Safari Category:",
        isSafariCategory
      );
      console.log(
        "[Booking Restriction] Rule Check - Cultural/Trekking/Zanzibar:",
        isCulturalCategory || isTrekkingCategory || isZanzibarCategory
      );
      console.log(
        "[Booking Restriction] Rule Check - Budget Package:",
        isBudgetPackage
      );
      console.log(
        "[Booking Restriction] Rule Check - Midrange/Luxury Package:",
        isMidrangeOrLuxuryPackage
      );
    }

    // Cultural Tours / Trekking / Zanzibar trips (all package types):
    // Block if trip starts today or tomorrow (daysUntilTrip < 1 or daysUntilTrip === 1)
    // This matches the frontend logic which blocks daysUntilTrip < 1
    if (isCulturalCategory || isTrekkingCategory || isZanzibarCategory) {
      // Block trips that start today or in the past (matching frontend logic)
      if (daysUntilTrip < 1) {
        return {
          allowed: false,
          blocked: true,
          warning:
            "This trip date has already passed or is today. Please select a future date.",
          restrictionType: "other_past_or_today",
          daysUntilTrip,
        };
      }
      
      // Block trips that start tomorrow
      if (daysUntilTrip === 1) {
        return {
          allowed: false,
          blocked: true,
          warning:
            "This trip starts tomorrow. Please submit an availability request and we will review it. Once approved, you can proceed with checkout and payment.",
          restrictionType: "other_1_day",
          daysUntilTrip,
        };
      }

      return {
        allowed: true,
        blocked: false,
        warning: null,
        restrictionType: null,
        daysUntilTrip,
      };
    }

    // Safaris
    if (isSafariCategory) {
      // Block trips that start today or in the past (matching frontend logic)
      if (daysUntilTrip < 1) {
        return {
          allowed: false,
          blocked: true,
          warning:
            "This trip date has already passed or is today. Please select a future date.",
          restrictionType: "safari_past_or_today",
          daysUntilTrip,
        };
      }
      
      // Budget Safaris: urgent if tomorrow
      if (isBudgetPackage && daysUntilTrip === 1) {
        return {
          allowed: false,
          blocked: true,
          warning:
            "This Safari trip starts tomorrow. Please submit an availability request and we will review it. Once approved, you can proceed with checkout and payment.",
          restrictionType: "safari_budget_1_day",
          daysUntilTrip,
        };
      }

      // Mid-Range / Luxury Safaris: urgent if 1–4 days after today
      if (isMidrangeOrLuxuryPackage && daysUntilTrip >= 1 && daysUntilTrip <= 4) {
        return {
          allowed: false,
          blocked: true,
          warning:
            "This Midrange/Luxury Safari trip starts within 4 days. Please submit an availability request and we will review it. Once approved, you can proceed with checkout and payment.",
          restrictionType: "safari_4_day",
          daysUntilTrip,
        };
      }

      // Safari but outside urgent window
      return {
        allowed: true,
        blocked: false,
        warning: null,
        restrictionType: null,
        daysUntilTrip,
      };
    }

    // Default: categories not covered by the matrix → no extra restrictions
    if (isTestOrder) {
      console.log(
        "[Booking Restriction] ⚠️ No specific rule matched, allowing booking"
      );
    }
    return {
      allowed: true,
      blocked: false,
      warning: null,
      restrictionType: null,
      daysUntilTrip,
    };
  } catch (error) {
    console.error(
      "[Booking Restriction] ❌ Error checking booking restriction:",
      error
    );
    // On error, allow booking but log warning
    return {
      allowed: true,
      blocked: false,
      warning:
        "Unable to verify booking restrictions. Please proceed with caution.",
      restrictionType: null,
      daysUntilTrip: null,
    };
  }
};

/**
 * Check if trip date is in the past
 * @param {Date|string} tripStartDate - Trip start date
 * @returns {boolean} - True if trip date is in the past
 */
const isTripDateInPast = (tripStartDate) => {
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  const tripStart = new Date(tripStartDate);
  tripStart.setHours(0, 0, 0, 0);

  return tripStart < now;
};

module.exports = {
  checkBookingRestriction,
  isTripDateInPast,
};
