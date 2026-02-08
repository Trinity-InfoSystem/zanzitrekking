// src/utils/intelligentSearch.js

/**
 * Intelligent search class that provides advanced search capabilities
 * for trips, routes, and pricing information based on natural language queries.
 *
 * @class IntelligentSearch
 */
export class IntelligentSearch {
  /**
   * Creates an instance of IntelligentSearch.
   *
   * @param {Object} seedData - The seed data containing trips, routes, and pricing information
   */
  constructor(seedData) {
    this.data = seedData;
  }

  /**
   * Categorizes a user query into relevant categories (pricing, routes, safari, etc.).
   *
   * @param {string} query - The user's search query
   * @returns {string[]} Array of category names that match the query
   *
   * @example
   * categorizeQuery("How much does a 5-day Machame route cost?")
   * // Returns: ['pricing', 'routes', 'duration']
   */
  categorizeQuery(query) {
    const lowerQuery = query.toLowerCase();
    const categories = new Set();

    const patterns = {
      pricing: /price|cost|expensive|cheap|budget|how much|rate|fee|charge/i,
      routes:
        /route|climb|trail|path|way|machame|marangu|lemosho|rongai|umbwe|kilimanjaro|meru|mountain/i,
      safari:
        /safari|wildlife|animal|park|serengeti|ngorongoro|tarangire|manyara|lion|elephant|game drive/i,
      accommodation:
        /hotel|lodge|camp|tent|stay|sleep|accommodation|room|where.*stay/i,
      duration: /day|night|long|duration|time|how many/i,
      inclusions:
        /include|what.*in|come with|provided|gear|equipment|pack|bring/i,
      booking: /book|reserve|confirm|payment|deposit|cancel|refund/i,
      season: /when|season|weather|best time|month|visit/i,
      contact: /contact|phone|email|reach|call|address|location/i,
      company: /about|who are you|company|info|information/i,
      terms: /terms|conditions|policy|rules|cancellation/i,
    };

    Object.entries(patterns).forEach(([category, pattern]) => {
      if (pattern.test(lowerQuery)) {
        categories.add(category);
      }
    });

    return Array.from(categories);
  }

  /**
   * Extracts specific details from a user query such as number of people,
   * days, nights, route names, categories, park names, and seasons.
   *
   * @param {string} query - The user's search query
   * @returns {Object} Object containing extracted details:
   *   - numberOfPeople: number|null
   *   - days: number|null
   *   - nights: number|null
   *   - routeName: string|null
   *   - category: string|null ('luxury', 'midRange', 'budget')
   *   - parkName: string|null
   *   - season: string|null ('high', 'low')
   *
   * @example
   * extractDetails("I want a 5-day Machame route for 2 people")
   * // Returns: { numberOfPeople: 2, days: 5, routeName: 'machame', ... }
   */
  extractDetails(query) {
    const lowerQuery = query.toLowerCase();
    const details = {
      numberOfPeople: null,
      days: null,
      nights: null,
      routeName: null,
      category: null,
      parkName: null,
      season: null,
    };

    // Extract number of people (various patterns)
    const peoplePatterns = [
      /(\d+)\s*(people|person|pax|traveler|guest)/i,
      /(solo|alone|one person|1 person)/i,
      /(couple|two people|2 people)/i,
    ];

    for (const pattern of peoplePatterns) {
      const match = query.match(pattern);
      if (match) {
        if (match[1]) {
          details.numberOfPeople = parseInt(match[1]);
        } else if (/solo|alone|one/i.test(match[0])) {
          details.numberOfPeople = 1;
        } else if (/couple|two/i.test(match[0])) {
          details.numberOfPeople = 2;
        }
        break;
      }
    }

    // Extract days
    const daysMatch = query.match(/(\d+)\s*[-\s]?day/i);
    if (daysMatch) {details.days = parseInt(daysMatch[1]);}

    // Extract nights
    const nightsMatch = query.match(/(\d+)\s*[-\s]?night/i);
    if (nightsMatch) {details.nights = parseInt(nightsMatch[1]);}

    // Extract route names
    const routes = {
      machame: /machame/i,
      marangu: /marangu|mrangu|coca[- ]?cola/i,
      lemosho: /lemosho/i,
      rongai: /rongai/i,
      umbwe: /umbwe/i,
      meru: /meru/i,
    };

    Object.entries(routes).forEach(([name, pattern]) => {
      if (pattern.test(lowerQuery)) {
        details.routeName = name;
      }
    });

    // Extract category
    if (/luxury|luxurious|premium|high[- ]?end/i.test(lowerQuery)) {
      details.category = "luxury";
    } else if (/mid[- ]?range|moderate|standard/i.test(lowerQuery)) {
      details.category = "midRange";
    } else if (/budget|cheap|affordable|economical/i.test(lowerQuery)) {
      details.category = "budget";
    }

    // Extract park names
    const parks = ["serengeti", "ngorongoro", "tarangire", "manyara"];
    parks.forEach((park) => {
      if (lowerQuery.includes(park)) {
        details.parkName = park;
      }
    });

    // Extract season
    if (
      /high season|peak season|june|july|august|september|october|december|january|february|march/i.test(
        lowerQuery,
      )
    ) {
      details.season = "high";
    } else if (/low season|off season|april|may|november/i.test(lowerQuery)) {
      details.season = "low";
    }

    return details;
  }

  /**
   * Searches for specific mountain climbing routes based on route name and duration.
   *
   * @param {string} routeName - The name of the route (e.g., 'machame', 'marangu')
   * @param {number} days - The number of days for the route
   * @returns {Array|null} Array of matching routes or null if no matches found
   */
  findMountainRoute(routeName, days) {
    if (!this.data.mountainClimbingPrices) {return null;}

    const routes = this.data.mountainClimbingPrices.filter((route) => {
      const routeNameMatch = routeName
        ? route.route.toLowerCase().includes(routeName)
        : true;
      const daysMatch = days ? route.duration.days === days : true;
      return routeNameMatch && daysMatch;
    });

    return routes.length > 0 ? routes : null;
  }

  /**
   * Searches for safari options based on duration and park name.
   * Searches across all safari types (regular, longer, camping).
   *
   * @param {number} days - The number of days for the safari
   * @param {string} parkName - The name of the park (e.g., 'serengeti', 'ngorongoro')
   * @returns {Array|null} Array of matching safari options or null if no matches found
   */
  findSafariOptions(days, parkName) {
    const allSafaris = [
      ...(this.data.safariPrices || []),
      ...(this.data.longerSafariPrices || []),
      ...(this.data.campingSafariPrices || []),
    ];

    const filtered = allSafaris.filter((safari) => {
      const daysMatch = days ? safari.duration.days === days : true;
      const parkMatch = parkName
        ? safari.trip.toLowerCase().includes(parkName)
        : true;
      return daysMatch && parkMatch;
    });

    return filtered.length > 0 ? filtered : null;
  }

  /**
   * Gets detailed information about a specific Kilimanjaro route.
   *
   * @param {string} routeName - The name of the route
   * @returns {Object|null} Route details object or null if route not found
   */
  getRouteDetails(routeName) {
    if (!this.data.kilimanjaroRoutes || !routeName) {return null;}
    return this.data.kilimanjaroRoutes[routeName] || null;
  }

  /**
   * Gets pricing information for a specific route configuration.
   * Returns pricing based on number of people and category (budget, midRange, luxury).
   *
   * @param {Object} routeData - The route data object containing pricing information
   * @param {number} numberOfPeople - The number of people for the trip
   * @param {string} category - The category ('budget', 'midRange', 'luxury')
   * @returns {Object|null} Pricing object or null if pricing not available.
   *   For groups larger than 4, returns an object with a note to contact for custom quote.
   */
  getPricing(routeData, numberOfPeople, category) {
    if (!routeData || !routeData.pricing) {return null;}

    let relevantPricing = null;

    // Find pricing based on number of people
    if (numberOfPeople === 1) {
      relevantPricing = routeData.pricing.find(
        (p) => p.numberOfPersons === "1",
      );
    } else if (numberOfPeople >= 2 && numberOfPeople <= 4) {
      relevantPricing = routeData.pricing.find(
        (p) => p.numberOfPersons === "2" || p.numberOfPersons === "3-4",
      );
      if (!relevantPricing) {
        relevantPricing = routeData.pricing.find(
          (p) => p.numberOfPersons === "2 or more",
        );
      }
    } else if (numberOfPeople > 4) {
      return {
        note: "For groups larger than 4 people, please contact us for a custom quote.",
      };
    } else {
      // No specific number provided, return all
      relevantPricing = routeData.pricing;
    }

    if (!relevantPricing) {return null;}

    // Extract prices based on category
    if (Array.isArray(relevantPricing)) {
      return relevantPricing.map((p) => ({
        numberOfPersons: p.numberOfPersons,
        budget: p.budget,
        midRange: p.midRange,
        luxury: p.luxury,
      }));
    }

    return {
      numberOfPersons: relevantPricing.numberOfPersons,
      budget: relevantPricing.budget,
      midRange: relevantPricing.midRange,
      luxury: relevantPricing.luxury,
    };
  }

  /**
   * Performs a fuzzy search across all data in the seed data object.
   * Searches through strings recursively and returns results sorted by relevance.
   *
   * @param {string} query - The search query
   * @param {number} maxResults - Maximum number of results to return (default: 5)
   * @returns {Array} Array of search results with path, content, and relevance score
   */
  fuzzySearch(query, maxResults = 5) {
    const results = [];
    const lowerQuery = query.toLowerCase();
    const queryTerms = lowerQuery.split(" ").filter((t) => t.length > 2);

    const searchObject = (obj, path = "", depth = 0) => {
      if (depth > 5) {return;} // Prevent infinite recursion

      if (typeof obj === "string") {
        const lowerStr = obj.toLowerCase();
        const relevance = queryTerms.filter((term) =>
          lowerStr.includes(term),
        ).length;
        if (relevance > 0) {
          results.push({ path, content: obj, relevance });
        }
      } else if (Array.isArray(obj)) {
        obj.forEach((item, index) => {
          searchObject(item, `${path}[${index}]`, depth + 1);
        });
      } else if (typeof obj === "object" && obj !== null) {
        Object.entries(obj).forEach(([key, value]) => {
          const newPath = path ? `${path}.${key}` : key;
          searchObject(value, newPath, depth + 1);
        });
      }
    };

    searchObject(this.data);

    // Sort by relevance and return top results
    return results
      .sort((a, b) => b.relevance - a.relevance)
      .slice(0, maxResults);
  }
}
