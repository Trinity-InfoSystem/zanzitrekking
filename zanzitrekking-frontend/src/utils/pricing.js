export const formatPrice = (price) => {
  if (!price || price === 0) {
    return "Contact Us";
  }
  return new Intl.NumberFormat("en-US").format(price);
};

export const getCurrentSeason = (trip) => {
  if (!trip) return null;
  if (trip.pricingType === "yearRound") {
    return null;
  }

  const today = new Date();
  return (
    trip.seasons?.find((season) => {
      const startDate = new Date(season.startDate);
      const endDate = new Date(season.endDate);
      return today >= startDate && today <= endDate;
    }) || trip.seasons?.[0]
  );
};

export const getStartingPrice = (trip) => {
  if (!trip) return 0;
  const prices = [];

  if (trip.pricingType === "yearRound" && trip.regularPrices) {
    if (
      trip.regularPrices.standard ||
      trip.regularPrices.midRange ||
      trip.regularPrices.luxury
    ) {
      const categories = ["standard", "midRange", "luxury"];
      categories.forEach((category) => {
        const categoryPrices = trip.regularPrices[category];
        if (categoryPrices) {
          prices.push(
            categoryPrices.onePerson,
            categoryPrices.twoPerson,
            categoryPrices.threePerson,
            categoryPrices.fourPerson,
            categoryPrices.fiveOrMorePerson,
          );
        }
      });
    } else {
      prices.push(
        trip.regularPrices.onePerson,
        trip.regularPrices.twoPerson,
        trip.regularPrices.threePerson,
        trip.regularPrices.fourPerson,
        trip.regularPrices.fiveOrMorePerson,
      );
    }
  } else if (trip.pricingType === "seasonal" && trip.seasons) {
    const currentSeason = getCurrentSeason(trip);
    if (currentSeason?.rates) {
      if (
        currentSeason.rates.standard ||
        currentSeason.rates.midRange ||
        currentSeason.rates.luxury
      ) {
        const categories = ["standard", "midRange", "luxury"];
        categories.forEach((category) => {
          const categoryPrices = currentSeason.rates[category];
          if (categoryPrices) {
            prices.push(
              categoryPrices.onePerson,
              categoryPrices.twoPerson,
              categoryPrices.threePerson,
              categoryPrices.fourPerson,
              categoryPrices.fiveOrMorePerson,
            );
          }
        });
      } else {
        prices.push(
          currentSeason.rates.onePerson,
          currentSeason.rates.twoPerson,
          currentSeason.rates.threePerson,
          currentSeason.rates.fourPerson,
          currentSeason.rates.fiveOrMorePerson,
        );
      }
    }
  }

  const validPrices = prices.filter(
    (price) => typeof price === "number" && !isNaN(price) && price > 0,
  );
  return validPrices.length > 0 ? Math.min(...validPrices) : 0;
};
