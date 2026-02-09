const axios = require("axios");
const { isTripDateInPast } = require("./bookingRestrictions");

class WeTravelService {
  constructor() {
    // Use production API by default, fallback to demo if WETRAVEL_USE_DEMO is set
    const useDemo = process.env.WETRAVEL_USE_DEMO === "true";
    this.apiKey = process.env.WETRAVEL_API_KEY;
    this.authUrl = useDemo
      ? "https://api.demo.wetravel.to/v2/auth/tokens/access"
      : "https://api.wetravel.com/v2/auth/tokens/access";
    this.apiUrl = useDemo
      ? "https://api.demo.wetravel.to/v2"
      : "https://api.wetravel.com/v2";
    this.accessToken = null;
  }

  /**
   * Get access token from WeTravel API
   */
  async getAccessToken() {
    try {
      const response = await axios.post(
        this.authUrl,
        {},
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            "Content-Type": "application/json",
          },
        }
      );

      this.accessToken = response.data.access_token;
      return this.accessToken;
    } catch (error) {
      console.error(
        "❌ Error getting WeTravel access token:",
        error.response?.data || error.message
      );
      console.error("Status Code:", error.response?.status);
      console.error("Full error:", error);
      throw new Error("Failed to obtain WeTravel access token");
    }
  }

  /**
   * Check if trip dates are in the past
   * @param {string} startDate - Trip start date (YYYY-MM-DD)
   * @param {string} endDate - Trip end date (YYYY-MM-DD) - optional
   * @returns {boolean} - True if dates are in the past
   */
  isTripDateInPast(startDate, endDate = null) {
    return isTripDateInPast(startDate);
  }

  /**
   * Create a payment link for an order
   * @param {Object} orderData - Order data including trip details and pricing
   * @returns {Promise<Object>} - Payment link data
   */
  async createPaymentLink(orderData) {
    try {
      // Ensure we have an access token
      if (!this.accessToken) {
        await this.getAccessToken();
      }

      const {
        tripTitle,
        tripId,
        startDate,
        endDate,
        totalAmount,
        currency = "USD",
        daysBeforeDeparture = 2,
        participantInfo, // Customer/participant information
        travelersNumber = 1, // Number of travelers
      } = orderData;

      // Validate that trip dates are not in the past
      if (this.isTripDateInPast(startDate, endDate)) {
        const errorMessage = `Cannot create payment link: Trip start date (${startDate}) is in the past`;
        console.error(`❌ ${errorMessage}`);
        throw new Error(errorMessage);
      }

      const paymentLinkData = {
        data: {
          trip: {
            participant_fees: "all",
            title: tripTitle,
            trip_id: tripId,
            start_date: startDate,
            end_date: endDate,
            currency: currency,
            // Set capacity to allow multiple bookings (or don't set it for unlimited)
            // Note: Setting a high capacity to prevent "sold out" issue
            capacity: Math.max(travelersNumber || 1, 100), // Allow at least 100 bookings
          },
          pricing: {
            payment_plan: {
              allow_auto_payment: false,
              allow_partial_payment: false,
              deposit: 0,
              installments: [
                {
                  price: totalAmount,
                  days_before_departure: daysBeforeDeparture,
                },
              ],
            },
            price: totalAmount,
            days_before_departure: daysBeforeDeparture,
          },
        },
      };


      const response = await axios.post(
        `${this.apiUrl}/payment_links`,
        paymentLinkData,
        {
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
            "Content-Type": "application/json",
          },
          params: {
            publish_immediately: "true",
          },
        }
      );

      console.log(
        "✅ WeTravel payment link created successfully:",
        response.data.data.trip.url
      );
      return response.data.data;
    } catch (error) {
      console.error(
        "❌ Error creating WeTravel payment link:",
        error.response?.data || error.message
      );
      console.error("Status Code:", error.response?.status);

      // If token expired, try to refresh and retry once
      if (error.response?.status === 401 || error.response?.status === 403) {
        console.log("Access token may be expired, refreshing...");
        await this.getAccessToken();

        // Prepare the data again for retry
        const {
          tripTitle,
          tripId,
          startDate,
          endDate,
          totalAmount,
          currency = "USD",
          daysBeforeDeparture = 2,
        } = orderData;

        const paymentLinkData = {
          data: {
            trip: {
              participant_fees: "all",
              title: tripTitle,
              trip_id: tripId,
              start_date: startDate,
              end_date: endDate,
              currency: currency,
            },
            pricing: {
              payment_plan: {
                allow_auto_payment: false,
                allow_partial_payment: false,
                deposit: 0,
                installments: [
                  {
                    price: totalAmount,
                    days_before_departure: daysBeforeDeparture,
                  },
                ],
              },
              price: totalAmount,
              days_before_departure: daysBeforeDeparture,
            },
          },
        };

        // Retry the request once
        try {
          const response = await axios.post(
            `${this.apiUrl}/payment_links`,
            paymentLinkData,
            {
              headers: {
                Authorization: `Bearer ${this.accessToken}`,
                "Content-Type": "application/json",
              },
              params: {
                publish_immediately: "true",
              },
            }
          );
          return response.data.data;
        } catch (retryError) {
          console.error(
            "❌ Retry failed:",
            retryError.response?.data || retryError.message
          );
          console.error("Status Code:", retryError.response?.status);
          throw new Error("Failed to create WeTravel payment link after retry");
        }
      }

      throw new Error("Failed to create WeTravel payment link");
    }
  }

  /**
   * Sanitize title for WeTravel API (remove special chars, limit length)
   * @param {string} title - Original title
   * @returns {string} - Sanitized title
   */
  sanitizeTitle(title) {
    if (!title) return "Safari Trip";
    // Remove special characters, keep alphanumeric, spaces, and basic punctuation
    let sanitized = title.replace(/[^\w\s\-.,&()]/g, "").trim();
    // Limit to 100 characters
    if (sanitized.length > 100) {
      sanitized = sanitized.substring(0, 97) + "...";
    }
    return sanitized || "Safari Trip";
  }

  /**
   * Format order data for WeTravel payment link creation
   * @param {Object} order - MongoDB order document
   * @returns {Object} - Formatted data for WeTravel API
   */
  formatOrderForPaymentLink(order) {
    // Get the first trip's start date or use the earliest date from cart items
    // CRITICAL: Extract UTC date components to avoid timezone shifts
    let startDateObj;
    if (order.cartItems && order.cartItems.length > 0 && order.cartItems[0].startingDate) {
      const dateInput = order.cartItems[0].startingDate;
      
      // Handle different date formats
      if (typeof dateInput === "string") {
        if (/^\d{4}-\d{2}-\d{2}$/.test(dateInput)) {
          // YYYY-MM-DD format - parse directly
          const [year, month, day] = dateInput.split("-").map(Number);
          startDateObj = new Date(Date.UTC(year, month - 1, day, 12, 0, 0, 0));
        } else if (dateInput.includes("T")) {
          // ISO string - extract UTC date components to preserve intended date
          const parsed = new Date(dateInput);
          const utcYear = parsed.getUTCFullYear();
          const utcMonth = parsed.getUTCMonth();
          const utcDay = parsed.getUTCDate();
          startDateObj = new Date(Date.UTC(utcYear, utcMonth, utcDay, 12, 0, 0, 0));
        } else {
          // Other string format - parse and extract UTC components
          const parsed = new Date(dateInput);
          const utcYear = parsed.getUTCFullYear();
          const utcMonth = parsed.getUTCMonth();
          const utcDay = parsed.getUTCDate();
          startDateObj = new Date(Date.UTC(utcYear, utcMonth, utcDay, 12, 0, 0, 0));
        }
      } else {
        // Date object - extract UTC components
        const parsed = new Date(dateInput);
        const utcYear = parsed.getUTCFullYear();
        const utcMonth = parsed.getUTCMonth();
        const utcDay = parsed.getUTCDate();
        startDateObj = new Date(Date.UTC(utcYear, utcMonth, utcDay, 12, 0, 0, 0));
      }
    } else {
      // No date provided - use today
      const now = new Date();
      const utcYear = now.getUTCFullYear();
      const utcMonth = now.getUTCMonth();
      const utcDay = now.getUTCDate();
      startDateObj = new Date(Date.UTC(utcYear, utcMonth, utcDay, 12, 0, 0, 0));
    }

    // Get cart item details for booking restriction check
    const firstCartItem =
      order.cartItems && order.cartItems.length > 0 ? order.cartItems[0] : null;

    // Calculate end date based on days (if available) or default to start date + 7 days
    const daysCount =
      order.cartItems && order.cartItems.length > 0
        ? order.cartItems[0].days || 7
        : 7;
    
    // Calculate end date using UTC to avoid timezone shifts
    const endDateObj = new Date(startDateObj);
    endDateObj.setUTCDate(endDateObj.getUTCDate() + daysCount);

    // Calculate days before departure (days between now and trip start)
    const now = new Date();
    const nowUTC = new Date(Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate(),
      0, 0, 0, 0
    ));
    const tripStartUTC = new Date(Date.UTC(
      startDateObj.getUTCFullYear(),
      startDateObj.getUTCMonth(),
      startDateObj.getUTCDate(),
      0, 0, 0, 0
    ));

    // Calculate difference in days
    const daysDiff = Math.ceil((tripStartUTC - nowUTC) / (1000 * 60 * 60 * 24));

    // Determine if this is a Midrange/Luxury Safari (requires 4-day rule)
    const isMidrangeOrLuxury =
      firstCartItem &&
      (firstCartItem.selectedCategory === "midRange" ||
        firstCartItem.selectedCategory === "luxury");

    const categoryName = firstCartItem?.categoryName
      ? firstCartItem.categoryName.toLowerCase()
      : "";
    const isSafariCategory = categoryName.includes("safari");
    const isMidrangeLuxurySafari = isMidrangeOrLuxury && isSafariCategory;

    // Set days before departure based on booking restrictions:
    // - Midrange/Luxury Safaris: require payment at least 4 days before departure
    // - All other trips: allow payment until 1 day before departure
    let daysBeforeDeparture;
    if (daysDiff <= 0) {
      daysBeforeDeparture = 0; // Trip is today or past, allow immediate payment
    } else if (daysDiff === 1) {
      daysBeforeDeparture = 0; // Trip is tomorrow, allow payment today
    } else if (isMidrangeLuxurySafari && daysDiff >= 4) {
      // For Midrange/Luxury Safaris with 4+ days until trip: require payment 4 days before
      // This means payment deadline is (daysDiff - 4) days from now
      daysBeforeDeparture = 4; // Payment must be completed at least 4 days before departure
    } else {
      // For all other trips: allow payment until 1 day before
      daysBeforeDeparture = Math.min(daysDiff - 1, 365); // Allow until 1 day before trip
    }

    // Create a descriptive title (sanitized for WeTravel API)
    const itemCount = order.cartItems?.length || 0;
    let rawTitle =
      itemCount === 1
        ? order.cartItems[0].mainTitle
        : `${itemCount} Safari Trips - ${order.orderNumber}`;
    const tripTitle = this.sanitizeTitle(rawTitle);

    // Get total travelers number from all cart items
    const totalTravelers = order.cartItems.reduce(
      (sum, item) => sum + (item.travelersNumber || 1),
      0
    );

    // Format dates as YYYY-MM-DD using UTC components to avoid timezone shifts
    const formatDateAsYYYYMMDD = (dateObj) => {
      const year = dateObj.getUTCFullYear();
      const month = String(dateObj.getUTCMonth() + 1).padStart(2, "0");
      const day = String(dateObj.getUTCDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    };

    return {
      tripTitle,
      tripId: order.orderNumber,
      startDate: formatDateAsYYYYMMDD(startDateObj), // Format: YYYY-MM-DD using UTC
      endDate: formatDateAsYYYYMMDD(endDateObj),
      totalAmount: order.totalAmount,
      currency: "USD",
      daysBeforeDeparture: daysBeforeDeparture,
      travelersNumber: totalTravelers,
      // Include participant/customer information (billing address is optional in WeTravel)
      participantInfo: order.personalInfo
        ? {
            firstName: order.personalInfo.firstName,
            lastName: order.personalInfo.lastName,
            email: order.personalInfo.email,
            phone: order.personalInfo.phone,
            // Include billing address if available (WeTravel allows this but it's optional)
            ...(order.billingAddress && {
              address: {
                street: order.billingAddress.street,
                city: order.billingAddress.city,
                state: order.billingAddress.state,
                zip: order.billingAddress.zip,
                country: order.billingAddress.country,
              },
            }),
          }
        : null,
    };
  }
}

// Export a singleton instance
module.exports = new WeTravelService();
