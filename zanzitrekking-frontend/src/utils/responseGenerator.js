// src/utils/responseGenerator.js

export class ResponseGenerator {
  constructor(seedData) {
    this.data = seedData;
  }

  formatPrice(price) {
    return `$${price.toLocaleString()}`;
  }

  generateWelcome() {
    return `👋 **Welcome to Zanzi Trekking & Safaris!**

I'm your personal travel assistant for Tanzania adventures! 🗺️

**I can help you with:**
🏔️ Mountain climbing routes (Kilimanjaro, Meru)
🦁 Safari trips and packages
💰 Pricing for any configuration
🏨 Accommodation options
📅 Best times to visit
✅ What's included in packages
📞 Contact information

**Try asking:**
- "Show me 7-day Lemosho route prices"
- "What safaris are available for 4 days?"
- "Best time to climb Kilimanjaro?"
- "What's included in luxury packages?"

How can I help plan your Tanzania adventure? 😊`;
  }

  generatePricingResponse(details, searchResults) {
    const { numberOfPeople, days, routeName, category, season } = details;

    if (!searchResults || searchResults.length === 0) {
      return this.generateGeneralPricing(category);
    }

    let response = "💰 **Pricing Information**\n\n";

    searchResults.forEach((result, index) => {
      // Mountain climbing pricing
      response += `**${result.route}**\n`;
      response += `📅 Duration: ${result.duration.days} days / ${result.duration.nights} nights\n\n`;

      if (Array.isArray(result.pricing)) {
        result.pricing.forEach((pricing) => {
          // Skip if number of people specified and doesn't match
          if (numberOfPeople) {
            const pNum = pricing.numberOfPersons;
            if (
              !(
                (numberOfPeople === 1 && pNum === "1") ||
                (numberOfPeople === 2 &&
                  (pNum === "2" || pNum === "2 or more")) ||
                (numberOfPeople >= 3 &&
                  numberOfPeople <= 4 &&
                  (pNum === "3-4" || pNum === "2 or more")) ||
                (numberOfPeople > 4 && pNum === "More than 4")
              )
            ) {
              return;
            }
          }

          response += `👥 **${pricing.numberOfPersons} person(s)**:\n`;

          if (pricing.note) {
            response += `📝 ${pricing.note}\n\n`;
          } else {
            if (category) {
              const price = pricing[category];
              if (price) {
                response += `• **${this.capitalize(category)}**: ${this.formatPrice(price)}\n`;
              }
            } else {
              if (pricing.budget)
                {response += `• Budget: ${this.formatPrice(pricing.budget)}\n`;}
              if (pricing.midRange)
                {response += `• Mid-Range: ${this.formatPrice(pricing.midRange)}\n`;}
              if (pricing.luxury)
                {response += `• Luxury: ${this.formatPrice(pricing.luxury)}\n`;}
            }
            response += "\n";
          }
        });
      }

      if (index < searchResults.length - 1) {
        response += "---\n\n";
      }
    });

    response += "\n💡 **Note:** Prices in USD. Staff tips not included (voluntary basis).\n";

    if (season === "low") {
      response += "\n🌟 **Low Season Discount:** You can save money by traveling in April, May, or November!";
    }

    response += `\n\n📞 Want to book? Contact us at ${this.data.company.contact.phone}`;

    return response;
  }

  generateSafariPricingResponse(safaris, details) {
    const { numberOfPeople, category, season } = details;
    const seasonType = season === "low" ? "lowSeason" : "highSeason";

    let response = "🦁 **Safari Pricing**\n\n";

    safaris.slice(0, 3).forEach((safari, index) => {
      response += `**${safari.trip}**\n`;
      response += `📅 ${safari.duration.days} days / ${safari.duration.nights} nights\n\n`;

      safari.pricing.forEach((pricing) => {
        // Filter by number of people
        if (numberOfPeople) {
          const pNum = pricing.numberOfPersons;
          if (
            !(
              (numberOfPeople === 1 && pNum === "1") ||
              (numberOfPeople >= 2 && pNum === "2 or more")
            )
          ) {
            return;
          }
        }

        response += `👥 **${pricing.numberOfPersons} person(s)** (${season === "low" ? "Low" : "High"} Season):\n`;

        if (category) {
          const price = pricing[category]?.[seasonType];
          if (price) {
            response += `• **${this.capitalize(category)}**: ${this.formatPrice(price)}\n`;
          }
        } else {
          if (pricing.budget)
            {response += `• Budget: ${this.formatPrice(pricing.budget[seasonType])}\n`;}
          if (pricing.midRange)
            {response += `• Mid-Range: ${this.formatPrice(pricing.midRange[seasonType])}\n`;}
          if (pricing.luxury)
            {response += `• Luxury: ${this.formatPrice(pricing.luxury[seasonType])}\n`;}
        }
        response += "\n";
      });

      if (index < safaris.length - 1) {
        response += "---\n\n";
      }
    });

    response += `\n💡 **Note:** Prices shown for ${season === "low" ? "low" : "high"} season.\n`;
    response += `\n📞 Ready to book? Contact ${this.data.company.contact.phone}`;

    return response;
  }

  generateRouteDetails(routeName, routeData) {
    if (!routeData) {
      return `❌ Sorry, I couldn't find information about the ${routeName} route. Please try asking about Machame, Marangu, or Lemosho routes.`;
    }

    let response = `⛰️ **${routeData.name}**\n`;
    response += `*${routeData.nickname}*\n\n`;
    response += `${routeData.description}\n\n`;

    response += `📍 **Starting Point:** ${routeData.startingPoint.name} (${routeData.startingPoint.elevation}m)\n`;
    response += `🏔️ **Summit:** ${routeData.summit.name} (${routeData.summit.elevation}m / ${routeData.summit.elevationFeet}ft)\n\n`;

    response += "**Available Itineraries:**\n\n";

    Object.entries(routeData.itineraries).forEach(([key, itinerary]) => {
      response += `**${itinerary.days} Days / ${itinerary.nights} Nights**`;
      if (itinerary.recommended) {response += " ⭐ *Recommended*";}
      if (itinerary.acclimatizationDay)
        {response += " 🏔️ *Includes acclimatization*";}
      response += "\n";

      // Show first few days as sample
      itinerary.dailyRoutes.slice(0, 3).forEach((day) => {
        response += `• Day ${day.day}: ${day.segment} (${day.distance}km, ${day.time})\n`;
      });

      if (itinerary.dailyRoutes.length > 3) {
        response += `• ... and ${itinerary.dailyRoutes.length - 3} more days\n`;
      }

      response += "\n";
    });

    response += `\n💡 Want pricing for this route? Ask me: "Price for ${routeName} ${Object.values(routeData.itineraries)[0].days} days"`;

    return response;
  }

  generateSafariOverview(safaris) {
    let response = "🦁 **Safari Adventures in Tanzania**\n\n";

    response += "**Available Parks:**\n";
    this.data.safariParks.available.forEach((park) => {
      response += `• ${this.capitalize(park)}\n`;
    });
    response += "\n";

    if (safaris && safaris.length > 0) {
      response += "**Recommended Options:**\n\n";

      const uniqueDays = [...new Set(safaris.map((s) => s.duration.days))];
      uniqueDays.slice(0, 4).forEach((days) => {
        const dayTrips = safaris.filter((s) => s.duration.days === days);
        response += `**${days}-Day Safaris:**\n`;
        dayTrips.slice(0, 2).forEach((trip) => {
          response += `• ${trip.trip}\n`;
        });
        response += "\n";
      });
    }

    response += "\n**Trip Types:**\n";
    response += "• 🚙 Lodge Safaris (comfortable accommodations)\n";
    response += "• ⛺ Camping Safaris (authentic experience)\n";
    response += "• 📅 Day Trips (1-day adventures)\n";
    response += "• 🌍 Multi-Day Tours (3-7 days)\n";

    response += "\n💡 Ask me: \"4-day safari price for 2 people\" or \"What parks for 3 days?\"";

    return response;
  }

  generateInclusionsResponse(category) {
    let response = "✅ **What's Included in Your Package**\n\n";

    const packageType = category || "all";

    if (packageType === "all" || packageType === "luxury") {
      response += "**💎 Luxury Package:**\n";
      const {luxury} = this.data.packageInclusions;
      response += "• ✈️ Airport transfers (Arusha)\n";
      response += "• 🏨 2 nights luxury hotel (before/after)\n";
      response += "• 🍽️ 3 luxury meals daily on mountain\n";
      response += "• ⛺ Premium tents with furniture\n";
      response += "• 🚿 Private toilet & hot shower\n";
      response += "• 💨 Oxygen tank included\n";
      response += "• 👨‍🏫 Professional guides & porters\n";
      response += "• 🎫 All park & rescue fees\n\n";
    }

    if (packageType === "all" || packageType === "midRange") {
      response += "**⭐ Mid-Range Package:**\n";
      response += "• ✈️ Airport transfers (Arusha)\n";
      response += "• 🏨 2 nights mid-range hotel\n";
      response += "• 🍽️ 3 meals daily on mountain\n";
      response += "• ⛺ Comfort tents\n";
      response += "• 💨 Oxygen tank included\n";
      response += "• 🚽 Private toilet\n";
      response += "• 👨‍🏫 Professional guides & porters\n";
      response += "• 🎫 All park & rescue fees\n\n";
    }

    if (packageType === "all" || packageType === "budget") {
      response += "**💰 Budget Package:**\n";
      response += "• ⛺ Basic camping equipment\n";
      response += "• 🍽️ 3 meals daily on mountain\n";
      response += "• 👨‍🏫 Professional guides & porters\n";
      response += "• 🎫 All park & rescue fees\n";
      response += "• 🔧 Optional upgrades available:\n";
      response += "  - Airport transfers\n";
      response += "  - Hotel accommodation\n";
      response += "  - Private toilet\n";
      response += "  - Oxygen tank\n\n";
    }

    response += "\n**🦁 Safari Packages Include:**\n";
    response += "• 🚙 4x4 Land Cruiser (WiFi, fridge, open roof)\n";
    response += "• 🎫 All park entrance fees\n";
    response += "• 🍽️ All meals during safari\n";
    response += "• 🥤 Soft drinks during game drives\n";
    response += "• 🏨 Accommodation as per package\n";
    response += "• 👨‍🏫 Expert safari guide\n";

    response += "\n\n💡 **Not Included:** Staff tips (voluntary), personal items, travel insurance";

    return response;
  }

  generateAccommodationResponse() {
    let response = "🏨 **Accommodation Options**\n\n";

    response += "**Before/After Mountain Climbs:**\n\n";
    const {hotels} = this.data.accommodationExamples;
    response += `• **Luxury**: ${hotels.luxury.name}\n`;
    response += `• **Mid-Range**: ${hotels.midRange.name}\n`;
    response += `• **Budget**: ${hotels.budget.name}\n\n`;

    response += "**Safari Lodges:**\n\n";
    const {lodges} = this.data.accommodationExamples;
    response += "**Luxury Options:**\n";
    lodges.luxury.examples.forEach((lodge) => {
      response += `• ${lodge.name}\n`;
    });
    response += "\n**Mid-Range Options:**\n";
    lodges.midRange.examples.forEach((lodge) => {
      response += `• ${lodge.name}\n`;
    });
    response += "\n**Budget Options:**\n";
    lodges.budget.examples.forEach((lodge) => {
      response += `• ${lodge.name}\n`;
    });

    response += "\n\n**Camping Options:**\n";
    const {tents} = this.data.accommodationExamples;
    response += `• **Luxury Tents**: ${tents.luxury.equipment.join(", ")}\n`;
    response += `• **Mid-Range Tents**: ${tents.midRange.equipment.join(", ")}\n`;
    response += "• **Budget Tents**: Basic setup with optional upgrades\n";

    response += "\n\n💡 All accommodations are carefully selected for comfort and safety!";

    return response;
  }

  generateSeasonResponse() {
    let response = "🌍 **Best Times to Visit Tanzania**\n\n";

    response += "**🌞 High Season (Best Weather):**\n";
    this.data.seasons.highSeason.periods.forEach((period) => {
      response += `• ${period.from} - ${period.to}\n`;
    });
    response += "\n**Why visit in high season:**\n";
    response += "• ☀️ Dry weather, clear skies\n";
    response += "• 🌡️ Comfortable temperatures\n";
    response += "• 🏔️ Best climbing conditions\n";
    response += "• 🦁 Excellent wildlife viewing\n\n";

    response += "**🌧️ Low Season (Better Prices):**\n";
    response += `• ${this.data.seasons.lowSeason.months.join(", ")}\n\n`;
    response += "**Why visit in low season:**\n";
    response += "• 💰 Lower prices (save 10-20%)\n";
    response += "• 👥 Fewer crowds\n";
    response += "• 🌿 Lush green landscapes\n";
    response += "• 🦜 Great for bird watching\n\n";

    response += "**⚠️ Note:** April-May are wettest months. November has short rains but still climbable.\n\n";
    response += "💡 **Recommendation:** Book high season trips 3-6 months in advance!";

    return response;
  }

  generateContactResponse() {
    const {company} = this.data;
    let response = "📞 **Contact Zanzi Trekking & Safaris**\n\n";

    response += "**Get in Touch:**\n";
    response += `📱 Phone: ${company.contact.phone}\n`;
    response += `✉️ Email: ${company.contact.email}\n`;
    response += `🌐 Website: ${company.contact.website}\n\n`;

    response += "**Office Location:**\n";
    response += `${company.address.poBox}\n`;
    response += `${company.address.city}, ${company.address.country}\n\n`;

    response += "**Banking Information:**\n";
    response += `🏦 Bank: ${company.banking.usd.bankName}\n`;
    response += `💵 USD Account: ${company.banking.usd.accountNumber}\n`;
    response += `💴 TZS Account: ${company.banking.tzs.accountNumber}\n`;
    response += `🔄 SWIFT: ${company.banking.usd.swiftCode[0]}\n\n`;

    response += "**Office Hours:**\n";
    response += "Monday - Friday: 8:00 AM - 6:00 PM (EAT)\n";
    response += "Saturday: 9:00 AM - 2:00 PM (EAT)\n";
    response += "Sunday: Closed\n\n";

    response += "💡 We respond to emails within 24 hours!";

    return response;
  }

  generateCompanyInfo() {
    const {company} = this.data;
    let response = "🏢 **About Zanzi Trekking & Safaris**\n\n";

    response += `${company.name}\n`;
    response += `📋 Registration: ${company.registrationNumber}\n\n`;

    response += "**Our Services:**\n";
    company.services.forEach((service) => {
      response += `• ${service}\n`;
    });
    response += "\n";

    response += "**Licensed & Certified:**\n";
    company.licenses.forEach((license) => {
      response += `• ✅ ${license}\n`;
    });
    response += "\n";

    response += "**Why Choose Us:**\n";
    response += "• 🏆 Experienced local guides\n";
    response += "• 🌿 Eco-friendly practices\n";
    response += "• 💯 100% summit success focus\n";
    response += "• 👥 Small group sizes\n";
    response += "• 🛡️ Comprehensive safety measures\n";
    response += "• 💚 Community support initiatives\n\n";

    response += `📞 Contact: ${company.contact.phone}\n`;
    response += `✉️ Email: ${company.contact.email}`;

    return response;
  }

  generateGeneralPricing(category) {
    let response = "💰 **General Pricing Overview**\n\n";

    response += "**🏔️ Kilimanjaro Climbing:**\n";
    if (!category || category === "budget") {
      response += "• **Budget**: From $1,229 per person\n";
    }
    if (!category || category === "midRange") {
      response += "• **Mid-Range**: From $1,672 per person\n";
    }
    if (!category || category === "luxury") {
      response += "• **Luxury**: From $2,558 per person\n";
    }
    response += "\n";

    response += "**🦁 Safari Day Trips:**\n";
    response += "• Tarangire/Manyara: From $185 per person\n";
    response += "• Ngorongoro Crater: From $215 per person\n\n";

    response += "**🏕️ Multi-Day Safaris:**\n";
    response += "• 3 Days: From $620 per person\n";
    response += "• 4 Days: From $855 per person\n";
    response += "• 5-7 Days: Custom pricing\n\n";

    response += "**💡 Good to Know:**\n";
    response += "• Prices in USD\n";
    response += "• Group discounts available (2+ people)\n";
    response += "• Low season savings (April, May, November)\n";
    response += "• Staff tips not included (voluntary)\n\n";

    response += "Want specific pricing? Ask me:\n";
    response += "• \"7-day Lemosho price for 2 people\"\n";
    response += "• \"4-day safari luxury package\"\n";
    response += "• \"Budget Machame 6 days\"";

    return response;
  }

  generateDefaultResponse() {
    return `I'm here to help you plan your Tanzania adventure! 🗺️

**Ask me about:**

🏔️ **Mountain Climbing:**
- "Show me Lemosho route details"
- "Price for 6-day Machame for 2 people"
- "Best route for beginners"

🦁 **Safaris:**
- "4-day safari options"
- "Which parks in 3 days?"
- "Safari pricing for 2 people"

💰 **Pricing & Packages:**
- "What's included in luxury package?"
- "Budget vs luxury differences"
- "Group discounts available?"

📅 **Planning:**
- "Best time to climb Kilimanjaro"
- "High season vs low season"
- "How long is Serengeti safari?"

📞 **Contact & Booking:**
- "How to contact you?"
- "Booking process"
- "Payment options"

Try asking a specific question! 😊`;
  }

  capitalize(str) {
    if (str === "midRange") {return "Mid-Range";}
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
}
