"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  clearMessage,
  delete_cart_trip,
  get_cart_trips,
  update_cart_trip,
} from "../store/reducers/cardReducer";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { ShoppingCartIcon } from "lucide-react";
import { CartHeader } from "../components/Cart/CartHeader";
import { EmptyCart } from "../components/Cart/EmptyCart";
import { CartItem } from "../components/Cart/CartItem";
import { OrderSummary } from "../components/Cart/OrderSummary";
import toast from "react-hot-toast";
import { addDays, format, parse, isSameMonth, startOfMonth } from "date-fns";
import SEO from "../components/SEO";

const Cart = () => {
  const dispatch = useDispatch();
  const { userInfo } = useSelector((state) => state.auth);
  const { cart_trips, cart_trip_count, errorMessage, successMessage } =
    useSelector((state) => state.card);

  const [selectedDates, setSelectedDates] = useState({});
  const [selectedCategories, setSelectedCategories] = useState({});
  const [childrenCounts, setChildrenCounts] = useState({});
  const [childrenAges, setChildrenAges] = useState({});
  const [totalPrice, setTotalPrice] = useState(0);
  const [travelersTotal, setTravelersTotal] = useState(0);
  const [childrenTotal, setChildrenTotal] = useState(0);
  const [travelersCount, setTravelersCount] = useState(0);
  const serviceFee = 0;
  const updatingChildrenRef = useRef({}); // Track which trips are currently updating
  const dateUpdateTimeoutRef = useRef({}); // Track debounce timeouts for date updates
  const updatingDateRef = useRef({}); // Track which trips are currently updating dates

  // Helper function to get the applicable season for a given date
  const getApplicableSeason = (trip, date) => {
    if (!trip) {
      return { rates: null, seasonName: "Default" };
    }

    if (trip.pricingType === "yearRound") {
      return { rates: trip.regularPrices, seasonName: "Year Round" };
    }

    if (trip.pricingType === "seasonal" && trip.seasons) {
      const selectedDate = new Date(date);
      const applicableSeason = trip.seasons.find((season) => {
        const startDate = new Date(season.startDate);
        const endDate = new Date(season.endDate);
        return selectedDate >= startDate && selectedDate <= endDate;
      });

      return applicableSeason
        ? { rates: applicableSeason.rates, seasonName: applicableSeason.name }
        : { rates: trip.regularPrices, seasonName: "Default" };
    }

    return { rates: trip.regularPrices, seasonName: "Default" };
  };

  const getCategoryRates = (rates, category = "standard") => {
    // Handle new category-specific pricing structure
    if (rates && rates[category]) {
      return rates[category];
    } else if (rates && rates.onePerson) {
      // Fallback for old structure - return the rates as-is
      return rates;
    }
    return null;
  };

  // Calculate children discount based on age
  const calculateChildrenDiscount = useCallback((age) => {
    if (age >= 5 && age < 12) {
      return 0.15; // 15% discount for ages 5-11
    }
    if (age >= 12 && age <= 15) {
      return 0.10; // 10% discount for ages 12-15
    }
    return 0; // No discount for other ages
  }, []);

  /**
   * Calculates the total price for a trip based on:
   * 1. Season (determines which pricing rates to use)
   * 2. Package type/category (Budget/Mid-Range/Luxury)
   * 3. Number of travelers (adults + children) - determines base price per person
   * 4. Children ages - applies age-based discounts:
   *    - Ages 5-11: 15% discount
   *    - Ages 12-15: 10% discount
   *    - Ages 16+: Full adult price
   *    - Ages <5: No discount (under 5)
   *    - Age not provided: Full price
   * 5. Trip discount (if available) - percentage off total
   * 
   * Formula:
   * - Base price = rate for total travelers (1, 2, 3, 4, or 5+)
   * - Adult price = basePrice × numberOfAdults
   * - Child price = basePrice × (1 - ageDiscount) for each child
   * - Subtotal = adultPrice + sum of all child prices
   * - Final price = subtotal - (subtotal × tripDiscount / 100)
   */
  const calculateTripPrice = useCallback((
    trip,
    date,
    travelers = null,
    category = null,
  ) => {
    const numberOfTravelers = travelers ?? trip.travelersNumber;
    const selectedCategory =
      category ??
      selectedCategories[trip._id] ??
      trip.selectedCategory ??
      "standard";

    // Get children data for this trip
    const tripChildrenCount = childrenCounts[trip._id] || 0;
    const tripChildrenAges = childrenAges[trip._id] || [];

    // If this is the initial load and we have stored prices, use them
    if (!travelers && !category && trip.totalPrice && tripChildrenCount === 0) {
      return trip.totalPrice;
    }

    // Step 1: Get applicable season rates based on selected date
    const { rates } = getApplicableSeason(trip, date);

    if (!rates) {
      // Fallback to stored price if calculation fails
      return trip.totalPrice || 0;
    }

    // Step 2: Get category-specific rates (Budget/Mid-Range/Luxury)
    const categoryRates = getCategoryRates(rates, selectedCategory);
    if (!categoryRates) {
      // Fallback to stored price if calculation fails
      return trip.totalPrice || 0;
    }

    // Step 3: Determine base price per person based on total group size (adults + children)
    // The base price depends on the total number of people in the group
    const totalTravelers = numberOfTravelers + tripChildrenCount;
    let basePrice;
    switch (totalTravelers) {
      case 1:
        basePrice = categoryRates.onePerson;
        break;
      case 2:
        basePrice = categoryRates.twoPerson;
        break;
      case 3:
        basePrice = categoryRates.threePerson;
        break;
      case 4:
        basePrice = categoryRates.fourPerson;
        break;
      default:
        basePrice = categoryRates.fiveOrMorePerson;
        break;
    }

    if (!basePrice || basePrice <= 0) {
      // Fallback to stored price if calculation fails
      return trip.totalPrice || 0;
    }

    // Step 4: Calculate adult price (full base price × number of adults)
    const adultPrice = basePrice * numberOfTravelers;

    // Step 5: Calculate children prices with age-based discounts
    let childrenTotalPrice = 0;
    tripChildrenAges.forEach((age) => {
      if (age !== null && age !== undefined) {
        // Get discount percentage based on age
        const discount = calculateChildrenDiscount(age);
        // Child pays: basePrice × (1 - discount)
        // Example: basePrice = $100, age = 8 (15% discount)
        // Child pays: $100 × (1 - 0.15) = $100 × 0.85 = $85
        const childPrice = basePrice * (1 - discount);
        childrenTotalPrice += childPrice;
      } else {
        // If age not provided, charge full price
        childrenTotalPrice += basePrice;
      }
    });

    // Step 6: Calculate subtotal (adults + children)
    const totalWithoutTripDiscount = adultPrice + childrenTotalPrice;

    // Step 7: Apply trip-level discount (if available)
    // Example: If trip has 10% discount and subtotal is $1000
    // Discount = $1000 × 0.10 = $100
    // Final = $1000 - $100 = $900
    const discountAmount = trip.discount
      ? (totalWithoutTripDiscount * trip.discount) / 100
      : 0;
    const finalPrice = totalWithoutTripDiscount - discountAmount;

    return finalPrice;
  }, [selectedCategories, childrenCounts, childrenAges, calculateChildrenDiscount]);

  // Calculate price breakdown (travelers and children separately) for a trip
  // This matches the exact logic from calculateTripPrice to ensure consistency
  const calculateTripPriceBreakdown = useCallback((trip, date, category) => {
    const numberOfTravelers = trip.travelersNumber;
    const tripChildrenCount = childrenCounts[trip._id] || 0;
    const tripChildrenAges = childrenAges[trip._id] || [];

    // Get applicable season rates (same as calculateTripPrice)
    const { rates } = getApplicableSeason(trip, date);
    if (!rates) {
      return { travelersPrice: 0, childrenPrice: 0 };
    }

    // Get category-specific rates (same as calculateTripPrice)
    const categoryRates = getCategoryRates(rates, category);
    if (!categoryRates) {
      return { travelersPrice: 0, childrenPrice: 0 };
    }

    // Determine base price per person based on total group size (same as calculateTripPrice)
    const totalTravelers = numberOfTravelers + tripChildrenCount;
    let basePrice;
    switch (totalTravelers) {
      case 1:
        basePrice = categoryRates.onePerson;
        break;
      case 2:
        basePrice = categoryRates.twoPerson;
        break;
      case 3:
        basePrice = categoryRates.threePerson;
        break;
      case 4:
        basePrice = categoryRates.fourPerson;
        break;
      default:
        basePrice = categoryRates.fiveOrMorePerson;
        break;
    }

    if (!basePrice || basePrice <= 0) {
      return { travelersPrice: 0, childrenPrice: 0 };
    }

    // Calculate travelers (adults) price (same as calculateTripPrice)
    const adultPrice = basePrice * numberOfTravelers;

    // Calculate children price with age-based discounts (same as calculateTripPrice)
    let childrenTotalPrice = 0;
    tripChildrenAges.forEach((age) => {
      if (age !== null && age !== undefined) {
        const discount = calculateChildrenDiscount(age);
        const childPrice = basePrice * (1 - discount);
        childrenTotalPrice += childPrice;
      } else {
        // If age not provided, charge full price
        childrenTotalPrice += basePrice;
      }
    });

    // Calculate subtotal (same as calculateTripPrice)
    const totalWithoutTripDiscount = adultPrice + childrenTotalPrice;

    // Apply trip discount (same as calculateTripPrice)
    const discountAmount = trip.discount
      ? (totalWithoutTripDiscount * trip.discount) / 100
      : 0;
    const finalPrice = totalWithoutTripDiscount - discountAmount;

    // Distribute discount proportionally to maintain breakdown accuracy
    // This ensures travelersPrice + childrenPrice = finalPrice exactly
    let travelersPrice = adultPrice;
    let childrenPrice = childrenTotalPrice;
    
    if (discountAmount > 0 && totalWithoutTripDiscount > 0) {
      // Distribute discount proportionally
      const travelersDiscountRatio = adultPrice / totalWithoutTripDiscount;
      const childrenDiscountRatio = childrenTotalPrice / totalWithoutTripDiscount;
      
      travelersPrice = adultPrice - (discountAmount * travelersDiscountRatio);
      childrenPrice = childrenTotalPrice - (discountAmount * childrenDiscountRatio);
      
      // Ensure exact match with finalPrice (handle any rounding differences)
      const calculatedTotal = travelersPrice + childrenPrice;
      const difference = finalPrice - calculatedTotal;
      // Apply any rounding difference to ensure exact match
      if (Math.abs(difference) > 0.0001) {
        if (travelersPrice >= childrenPrice) {
          travelersPrice += difference;
        } else {
          childrenPrice += difference;
        }
      }
    }

    // Round to 2 decimal places for display
    travelersPrice = Math.round(travelersPrice * 100) / 100;
    childrenPrice = Math.round(childrenPrice * 100) / 100;

    return {
      travelersPrice,
      childrenPrice,
    };
  }, [childrenCounts, childrenAges, calculateChildrenDiscount]);

  // Helper function to calculate breakdown with specific ages (for immediate updates)
  const calculateBreakdownWithAges = useCallback((trip, date, category, tripAges, tripChildrenCount) => {
    const numberOfTravelers = trip.travelersNumber;

    // Get applicable season rates
    const { rates } = getApplicableSeason(trip, date);
    if (!rates) {
      return { travelersPrice: 0, childrenPrice: 0 };
    }

    // Get category-specific rates
    const categoryRates = getCategoryRates(rates, category);
    if (!categoryRates) {
      return { travelersPrice: 0, childrenPrice: 0 };
    }

    // Determine base price per person based on total group size
    const totalTravelers = numberOfTravelers + tripChildrenCount;
    let basePrice;
    switch (totalTravelers) {
      case 1:
        basePrice = categoryRates.onePerson;
        break;
      case 2:
        basePrice = categoryRates.twoPerson;
        break;
      case 3:
        basePrice = categoryRates.threePerson;
        break;
      case 4:
        basePrice = categoryRates.fourPerson;
        break;
      default:
        basePrice = categoryRates.fiveOrMorePerson;
        break;
    }

    if (!basePrice || basePrice <= 0) {
      return { travelersPrice: 0, childrenPrice: 0 };
    }

    // Calculate travelers (adults) price
    const adultPrice = basePrice * numberOfTravelers;

    // Calculate children price with age-based discounts using provided ages
    let childrenTotalPrice = 0;
    tripAges.forEach((age) => {
      if (age !== null && age !== undefined) {
        const discount = calculateChildrenDiscount(age);
        const childPrice = basePrice * (1 - discount);
        childrenTotalPrice += childPrice;
      } else {
        // If age not provided, charge full price
        childrenTotalPrice += basePrice;
      }
    });

    // Calculate subtotal
    const totalWithoutTripDiscount = adultPrice + childrenTotalPrice;

    // Apply trip discount
    const discountAmount = trip.discount
      ? (totalWithoutTripDiscount * trip.discount) / 100
      : 0;
    const finalPrice = totalWithoutTripDiscount - discountAmount;

    // Distribute discount proportionally
    let travelersPrice = adultPrice;
    let childrenPrice = childrenTotalPrice;
    
    if (discountAmount > 0 && totalWithoutTripDiscount > 0) {
      const travelersDiscountRatio = adultPrice / totalWithoutTripDiscount;
      const childrenDiscountRatio = childrenTotalPrice / totalWithoutTripDiscount;
      
      travelersPrice = adultPrice - (discountAmount * travelersDiscountRatio);
      childrenPrice = childrenTotalPrice - (discountAmount * childrenDiscountRatio);
      
      // Ensure exact match with finalPrice
      const calculatedTotal = travelersPrice + childrenPrice;
      const difference = finalPrice - calculatedTotal;
      if (Math.abs(difference) > 0.0001) {
        if (travelersPrice >= childrenPrice) {
          travelersPrice += difference;
        } else {
          childrenPrice += difference;
        }
      }
    }

    // Round to 2 decimal places
    travelersPrice = Math.round(travelersPrice * 100) / 100;
    childrenPrice = Math.round(childrenPrice * 100) / 100;

    return {
      travelersPrice,
      childrenPrice,
    };
  }, [calculateChildrenDiscount]);

  // Helper function to calculate price with specific ages (for immediate updates)
  const calculatePriceWithAges = useCallback((tripId, updatedAges) => {
    let travelersTotalPrice = 0;
    let childrenTotalPrice = 0;
    let totalTravelersCount = 0;

    cart_trips.forEach((trip) => {
      const tripDate = selectedDates[trip._id] || new Date();
      const category =
        selectedCategories[trip._id] || trip.selectedCategory || "standard";

      // Use updated ages for the specific trip, current state for others
      if (trip._id === tripId) {
        const breakdown = calculateBreakdownWithAges(trip, tripDate, category, updatedAges, updatedAges.length);
        travelersTotalPrice += breakdown.travelersPrice;
        childrenTotalPrice += breakdown.childrenPrice;
      } else {
        const breakdown = calculateTripPriceBreakdown(trip, tripDate, category);
        travelersTotalPrice += breakdown.travelersPrice;
        childrenTotalPrice += breakdown.childrenPrice;
      }
      totalTravelersCount += trip.travelersNumber || 1;
    });

    // Total is the sum of travelers and children
    const total = travelersTotalPrice + childrenTotalPrice;

    setTotalPrice(total);
    setTravelersTotal(travelersTotalPrice);
    setChildrenTotal(childrenTotalPrice);
    setTravelersCount(totalTravelersCount);
  }, [cart_trips, selectedDates, selectedCategories, calculateTripPriceBreakdown, calculateBreakdownWithAges]);

  const calculateTotalPrice = useCallback(() => {
    let travelersTotalPrice = 0;
    let childrenTotalPrice = 0;
    let totalTravelersCount = 0;

    cart_trips.forEach((trip) => {
      const tripDate = selectedDates[trip._id] || new Date();
      const category =
        selectedCategories[trip._id] || trip.selectedCategory || "standard";

      // Calculate breakdown - this gives us the exact breakdown
      const breakdown = calculateTripPriceBreakdown(trip, tripDate, category);
      travelersTotalPrice += breakdown.travelersPrice;
      childrenTotalPrice += breakdown.childrenPrice;
      totalTravelersCount += trip.travelersNumber || 1;
    });

    // Total is the sum of travelers and children (ensures exact match)
    const total = travelersTotalPrice + childrenTotalPrice;

    setTotalPrice(total);
    setTravelersTotal(travelersTotalPrice);
    setChildrenTotal(childrenTotalPrice);
    setTravelersCount(totalTravelersCount);
  }, [cart_trips, selectedDates, selectedCategories, calculateTripPriceBreakdown]);

  useEffect(() => {
    const tomorrow = addDays(new Date(), 1);
    tomorrow.setHours(0, 0, 0, 0);

    const initialDates = cart_trips.reduce((acc, trip) => {
        if (trip && trip._id) {
        let dateValue;
        if (trip.startingDate) {
          // Parse date string - backend returns YYYY-MM-DD format
          // Parse as local date for correct display
          if (typeof trip.startingDate === "string") {
            if (/^\d{4}-\d{2}-\d{2}$/.test(trip.startingDate)) {
              // Pure date string YYYY-MM-DD - parse as local date
              dateValue = parse(trip.startingDate, "yyyy-MM-dd", new Date());
            } else if (trip.startingDate.includes("T")) {
              // ISO string - extract date part and parse as local
              const datePart = trip.startingDate.split("T")[0];
              dateValue = parse(datePart, "yyyy-MM-dd", new Date());
            } else {
              dateValue = new Date(trip.startingDate);
            }
          } else {
            // If it's already a Date object
            dateValue = new Date(trip.startingDate);
          }
          // Validate the date
          if (isNaN(dateValue.getTime())) {
            dateValue = tomorrow;
          } else {
            dateValue.setHours(0, 0, 0, 0);
            // Ensure date is at least tomorrow
            if (dateValue < tomorrow) {
              dateValue = tomorrow;
            }
          }
        } else {
          dateValue = tomorrow;
        }
        acc[trip._id] = dateValue;
      }
      return acc;
    }, {});
    setSelectedDates(initialDates);

    const initialCategories = cart_trips.reduce((acc, trip) => {
      acc[trip._id] = trip.selectedCategory || "standard";
      return acc;
    }, {});
    setSelectedCategories(initialCategories);

    // Initialize children counts and ages (only if not currently updating and no local state exists)
    setChildrenCounts((prev) => {
      const newCounts = cart_trips.reduce((acc, trip) => {
        // Skip if currently updating this trip
        if (updatingChildrenRef.current[trip._id]) {
          // Keep existing local state
          if (prev[trip._id] !== undefined) {
            acc[trip._id] = prev[trip._id];
          }
          return acc;
        }
        // Only initialize if no local state exists, or if backend matches local (confirmation)
        const localCount = prev[trip._id];
        if (localCount === undefined || localCount === (trip.childrenCount || 0)) {
      acc[trip._id] = trip.childrenCount || 0;
        } else {
          // Keep local state if it differs (might be more recent)
          acc[trip._id] = localCount;
        }
      return acc;
    }, {});
      return { ...prev, ...newCounts };
    });

    setChildrenAges((prev) => {
      const newAges = cart_trips.reduce((acc, trip) => {
        // Skip if currently updating this trip
        if (updatingChildrenRef.current[trip._id]) {
          // Keep existing local state
          if (prev[trip._id] !== undefined) {
            acc[trip._id] = prev[trip._id];
          }
          return acc;
        }
        // Only initialize if no local state exists, or if backend matches local (confirmation)
        const localAges = prev[trip._id];
        const tripAges = trip.childrenAges || [];
        if (!localAges || JSON.stringify(localAges) === JSON.stringify(tripAges)) {
          acc[trip._id] = tripAges;
        } else {
          // Keep local state if it differs (might be more recent)
          acc[trip._id] = localAges;
        }
      return acc;
    }, {});
      return { ...prev, ...newAges };
    });
  }, [cart_trips]); // Removed calculateTotalPrice from dependencies to prevent infinite loop

  // Calculate total price and breakdown when relevant state changes
  useEffect(() => {
    if (cart_trips.length > 0) {
      calculateTotalPrice();
    }
  }, [cart_trips, childrenCounts, childrenAges, selectedCategories, selectedDates, calculateTotalPrice]);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      // Clear all pending date update timeouts
      Object.values(dateUpdateTimeoutRef.current).forEach((timeout) => {
        if (timeout) clearTimeout(timeout);
      });
      dateUpdateTimeoutRef.current = {};
    };
  }, []);

  const handleDateChange = async (tripId, newDate) => {
    // Prevent multiple simultaneous updates for the same trip
    if (updatingDateRef.current[tripId]) {
      return;
    }

    const tomorrow = addDays(new Date(), 1);
    tomorrow.setHours(0, 0, 0, 0);

    // newDate can be a Date object or a string (YYYY-MM-DD)
    let dateValue;
    if (newDate instanceof Date) {
      dateValue = new Date(newDate);
    } else if (typeof newDate === "string") {
      // Parse YYYY-MM-DD string as local date to avoid timezone issues
      const datePart = newDate.includes("T") ? newDate.split("T")[0] : newDate;
      dateValue = parse(datePart, "yyyy-MM-dd", new Date());
    } else {
      dateValue = new Date(newDate);
    }
    dateValue.setHours(0, 0, 0, 0);

    if (dateValue < tomorrow) {
      dateValue = tomorrow;
      toast.error("Trip start date must be at least 1 day from today");
    }

    // Update local state immediately for responsive UI
    setSelectedDates((prev) => ({
      ...prev,
      [tripId]: dateValue,
    }));

    // Clear any existing timeout for this trip
    if (dateUpdateTimeoutRef.current[tripId]) {
      clearTimeout(dateUpdateTimeoutRef.current[tripId]);
    }

    // Debounce the API call - wait 500ms after user stops changing the date
    dateUpdateTimeoutRef.current[tripId] = setTimeout(async () => {
      // Verify trip still exists in cart
      const trip = cart_trips.find((t) => t._id === tripId);
      if (!trip) {
        return;
      }

      // Mark as updating
      updatingDateRef.current[tripId] = true;

      const category = selectedCategories[tripId] || trip.selectedCategory || "standard";
      
      // Format date using LOCAL date components (what user selected)
      // Backend will store this as-is without timezone conversion
      const year = dateValue.getFullYear();
      const month = String(dateValue.getMonth() + 1).padStart(2, "0");
      const day = String(dateValue.getDate()).padStart(2, "0");
      const dateStringToSend = `${year}-${month}-${day}`;

      const updatePayload = {
        userId: userInfo._id,
        cartId: tripId,
        travelersNumber: trip.travelersNumber,
        startingDate: dateStringToSend,
        selectedCategory: category,
        childrenCount: childrenCounts[tripId] || 0,
        childrenAges: childrenAges[tripId] || [],
      };

      try {
        const result = await dispatch(
          update_cart_trip(updatePayload)
        );

        // Only refresh cart if update was successful
        if (result.type === "wishlist/update_cart_trip/fulfilled") {
          // Don't call get_cart_trips here - the update should return the updated data
          // Only refresh if there was an error
        } else if (result.type === "wishlist/update_cart_trip/rejected") {
          // Refresh cart on error to get the correct state
          dispatch(get_cart_trips(userInfo._id));
        }
      } catch (error) {
        toast.error("Failed to update trip date");
        // Refresh cart on error
        dispatch(get_cart_trips(userInfo._id));
      } finally {
        // Clear the updating flag
        updatingDateRef.current[tripId] = false;
        delete dateUpdateTimeoutRef.current[tripId];
      }
    }, 500); // 500ms debounce delay
  };

  const handleCategoryChange = async (tripId, newCategory) => {
    // Update local state immediately for responsive UI
    setSelectedCategories((prev) => ({
      ...prev,
      [tripId]: newCategory,
    }));

    // Update the cart item in the backend
    const trip = cart_trips.find((t) => t._id === tripId);
    if (trip) {
      const tripDate = selectedDates[tripId] || new Date();
      // Format date as YYYY-MM-DD to avoid timezone issues
      const dateString =
        tripDate instanceof Date ? format(tripDate, "yyyy-MM-dd") : tripDate;

      try {
        await dispatch(
          update_cart_trip({
            userId: userInfo._id,
            cartId: tripId,
            travelersNumber: trip.travelersNumber,
            startingDate: dateString,
            selectedCategory: newCategory,
            childrenCount: childrenCounts[tripId] || 0,
            childrenAges: childrenAges[tripId] || [],
          }),
        );

        // Refresh cart data after successful update
        dispatch(get_cart_trips(userInfo._id));
      } catch (error) {
        console.error("Error updating category:", error);
        toast.error("Failed to update package type");
        // Revert local state if backend update failed
        setSelectedCategories((prev) => ({
          ...prev,
          [tripId]: trip.selectedCategory || "standard",
        }));
      }
    }
  };

  const handleDelete = (trip) => {
    dispatch(delete_cart_trip(trip._id));
    dispatch(get_cart_trips(userInfo._id));
  };

  const handleTravelersChange = async (trip, newCount) => {
    if (newCount < 1 || newCount > 10) {return;}

    const tripDate = selectedDates[trip._id] || new Date();
    // Format date as YYYY-MM-DD to avoid timezone issues
    const dateString =
      tripDate instanceof Date ? format(tripDate, "yyyy-MM-dd") : tripDate;
    const category =
      selectedCategories[trip._id] || trip.selectedCategory || "standard";

    try {
      await dispatch(
        update_cart_trip({
          userId: userInfo._id,
          cartId: trip._id,
          travelersNumber: newCount,
          startingDate: dateString,
          selectedCategory: category,
          childrenCount: childrenCounts[trip._id] || 0,
          childrenAges: childrenAges[trip._id] || [],
        }),
      );

      dispatch(get_cart_trips(userInfo._id));
    } catch (error) {
      console.error("Error updating travelers:", error);
      toast.error("Failed to update travelers count");
    }
  };

  useEffect(() => {
    if (errorMessage) {
      toast.error(errorMessage);
      dispatch(clearMessage());
    }
    if (successMessage) {
      toast.success(successMessage);
      dispatch(get_cart_trips(userInfo._id));
      dispatch(clearMessage());
    }
  }, [dispatch, successMessage, errorMessage, userInfo?._id]);

  // Refresh cart data when cart_trips changes to ensure category updates are reflected
  useEffect(() => {
    if (cart_trips.length > 0) {
      const updatedCategories = cart_trips.reduce((acc, trip) => {
        acc[trip._id] = trip.selectedCategory || "standard";
        return acc;
      }, {});
      setSelectedCategories((prev) => {
        // Only update if there are actual changes
        const hasChanges = Object.keys(updatedCategories).some(
          (id) => prev[id] !== updatedCategories[id]
        );
        return hasChanges ? updatedCategories : prev;
      });

      // Update children counts and ages from cart trips (only if not currently updating)
      // Also skip if local state differs significantly (indicating stale backend data)
      const updatedChildrenCounts = cart_trips.reduce((acc, trip) => {
        // Skip if this trip is currently being updated
        if (updatingChildrenRef.current[trip._id]) {
          return acc;
        }
        // Only sync if trip has childrenCount defined
        if (trip.childrenCount !== undefined) {
          // Check if local state exists and differs - if so, might be stale backend data
          const localCount = childrenCounts[trip._id];
          // Only update if no local state exists, or if backend data matches local (confirmation)
          // This prevents stale backend data from overwriting recent local updates
          if (localCount === undefined || localCount === trip.childrenCount) {
          acc[trip._id] = trip.childrenCount;
          }
        }
        return acc;
      }, {});
      if (Object.keys(updatedChildrenCounts).length > 0) {
        setChildrenCounts((prev) => {
          const hasChanges = Object.keys(updatedChildrenCounts).some(
            (id) => prev[id] !== updatedChildrenCounts[id]
          );
          return hasChanges ? { ...prev, ...updatedChildrenCounts } : prev;
        });
      }

      const updatedChildrenAges = cart_trips.reduce((acc, trip) => {
        // Skip if this trip is currently being updated
        if (updatingChildrenRef.current[trip._id]) {
          return acc;
        }
        // Only sync if trip has childrenAges
        if (trip.childrenAges && Array.isArray(trip.childrenAges)) {
          const localAges = childrenAges[trip._id];
          // Only update if no local state exists, or if backend data matches local (confirmation)
          if (!localAges || JSON.stringify(localAges) === JSON.stringify(trip.childrenAges)) {
          acc[trip._id] = trip.childrenAges;
          }
        }
        return acc;
      }, {});
      if (Object.keys(updatedChildrenAges).length > 0) {
        setChildrenAges((prev) => {
          const hasChanges = Object.keys(updatedChildrenAges).some(
            (id) => JSON.stringify(prev[id]) !== JSON.stringify(updatedChildrenAges[id])
          );
          return hasChanges ? { ...prev, ...updatedChildrenAges } : prev;
        });
      }
    }
  }, [cart_trips]);

  const hasDiscounts = cart_trips.some((trip) => trip.discount > 0);


  return (
    <div className="from-background-nature via-background-sunset flex min-h-screen flex-col bg-gradient-to-br to-background-paper">
      <SEO />
      <Header />

      <main className="flex-grow py-6 sm:py-8 md:py-12">
        <div className="px-3 sm:px-4 md:px-8 lg:px-12">
          <CartHeader />

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <div className="overflow-hidden rounded-3xl border-2 border-gray-200 bg-white shadow-xl">
                <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-5">
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-white/20 p-2 backdrop-blur-sm">
                      <ShoppingCartIcon className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-white">
                        Ready to Book
                      </h2>
                      <p className="text-sm text-emerald-50">
                        {cart_trip_count} {cart_trip_count === 1 ? "trip" : "trips"} in your cart
                      </p>
                    </div>
                  </div>
                </div>

                {cart_trips.length === 0 ? (
                  <EmptyCart />
                ) : (
                  <div className="divide-y divide-gray-100 p-6">
                    {cart_trips.map((trip) => {
                      // Get current date - prefer selected date, then trip starting date, then tomorrow
                      const tomorrow = addDays(new Date(), 1);
                      tomorrow.setHours(0, 0, 0, 0);

                      let currentDate;
                      if (selectedDates[trip._id]) {
                        currentDate = selectedDates[trip._id];
                      } else if (trip.startingDate) {
                        // Parse date string - backend now returns YYYY-MM-DD format
                        if (typeof trip.startingDate === "string" && /^\d{4}-\d{2}-\d{2}$/.test(trip.startingDate)) {
                          currentDate = parse(trip.startingDate, "yyyy-MM-dd", new Date());
                        } else if (typeof trip.startingDate === "string" && trip.startingDate.includes("T")) {
                          // Fallback for ISO strings (shouldn't happen with new backend)
                          const datePart = trip.startingDate.split("T")[0];
                          currentDate = parse(datePart, "yyyy-MM-dd", new Date());
                        } else {
                          currentDate = new Date(trip.startingDate);
                        }
                      } else {
                        currentDate = tomorrow;
                      }

                      // Ensure it's a valid Date object and at least tomorrow
                      if (
                        !(currentDate instanceof Date) ||
                        isNaN(currentDate.getTime())
                      ) {
                        currentDate = tomorrow;
                      } else {
                        currentDate.setHours(0, 0, 0, 0);
                        if (currentDate < tomorrow) {
                          currentDate = tomorrow;
                        }
                      }

                      const validDate = currentDate;

                      const currentCategory =
                        selectedCategories[trip._id] ||
                        trip.selectedCategory ||
                        "standard";
                      const { seasonName } = getApplicableSeason(
                        trip,
                        validDate,
                      );
                      // Recalculate price including children discounts
                      const currentPrice = calculateTripPrice(
                        trip,
                        validDate,
                        null,
                        currentCategory,
                      );
                      // Calculate price per person (base price without children discounts)
                      const tripChildrenCount = childrenCounts[trip._id] || 0;
                      const totalTravelers = trip.travelersNumber + tripChildrenCount;
                      const pricePerPerson = totalTravelers > 0 
                        ? currentPrice / totalTravelers 
                        : currentPrice / trip.travelersNumber;

                      return (
                        <CartItem
                          key={trip._id}
                          trip={trip}
                          currentDate={validDate}
                          currentCategory={currentCategory}
                          currentSeasonName={seasonName}
                          currentPrice={currentPrice}
                          pricePerPerson={pricePerPerson}
                          onDateChange={(date) => {
                            // Ensure we're passing the date string correctly
                            handleDateChange(trip._id, date);
                          }}
                          onCategoryChange={(category) =>
                            handleCategoryChange(trip._id, category)
                          }
                          onTravelersChange={(t, count) =>
                            handleTravelersChange(t, count)
                          }
                          handleDelete={handleDelete}
                          childrenCount={childrenCounts[trip._id] || 0}
                          childrenAges={childrenAges[trip._id] || []}
                          onChildrenCountChange={async (count) => {
                            // Prevent multiple simultaneous updates for the same trip
                            if (updatingChildrenRef.current[trip._id]) {
                              console.log("Update already in progress, skipping");
                              return;
                            }
                            
                            // Verify trip still exists in cart
                            const currentTrip = cart_trips.find((t) => t._id === trip._id);
                            if (!currentTrip) {
                              console.warn("Trip no longer exists in cart");
                              return;
                            }
                            
                            // Set ref immediately to prevent double-clicks
                            updatingChildrenRef.current[trip._id] = true;
                            
                            // Calculate new ages based on current state
                            // Use the latest state from the closure, but we'll update it functionally
                            const currentAges = childrenAges[trip._id] || [];
                            let newAges = [...currentAges];
                            
                            // Remove extra ages if count decreased
                            if (count < newAges.length) {
                              newAges = newAges.slice(0, count);
                            }
                            // Add empty ages if count increased
                            while (newAges.length < count) {
                              newAges.push(null);
                            }
                            
                            // Update local state immediately for responsive UI
                              setChildrenAges((prev) => ({
                                ...prev,
                                [trip._id]: newAges,
                              }));
                            
                            // Update local state immediately for responsive UI
                            setChildrenCounts((prev) => ({
                              ...prev,
                              [trip._id]: count,
                            }));
                            
                            // Trigger immediate price recalculation after state updates
                            // Use setTimeout to ensure state has been updated
                            setTimeout(() => {
                              calculateTotalPrice();
                            }, 10);
                            
                            // Update backend
                            const tripDate = selectedDates[trip._id] || new Date();
                            const dateString =
                              tripDate instanceof Date ? format(tripDate, "yyyy-MM-dd") : tripDate;
                            const category =
                              selectedCategories[trip._id] || trip.selectedCategory || "standard";
                            
                            try {
                              const result = await dispatch(
                                update_cart_trip({
                                  userId: userInfo._id,
                                  cartId: trip._id,
                                  travelersNumber: trip.travelersNumber,
                                  startingDate: dateString,
                                  selectedCategory: category,
                                  childrenCount: count,
                                  childrenAges: newAges,
                                }),
                              );
                              
                              // Check if update was rejected (createAsyncThunk rejects with rejectWithValue)
                              if (result.type === "wishlist/update_cart_trip/rejected" || result?.payload?.errorMessage) {
                                throw new Error(result.payload?.errorMessage || "Update failed");
                              }
                              
                              // Wait a bit to ensure backend update is complete before refreshing
                              await new Promise(resolve => setTimeout(resolve, 100));
                              
                              // Refresh cart to get updated data with recalculated prices
                              // Keep ref true during refresh to prevent useEffect from overwriting
                              await dispatch(get_cart_trips(userInfo._id));
                              
                              // Wait a bit more to ensure useEffect has run and seen the ref as true
                              await new Promise(resolve => setTimeout(resolve, 100));
                              
                              // Now safe to set ref to false and recalculate price
                              updatingChildrenRef.current[trip._id] = false;
                              calculateTotalPrice();
                            } catch (error) {
                              console.error("Error updating children count:", error);
                              const errorMessage = error?.response?.data?.error || error?.payload?.errorMessage || error?.message || "Failed to update children count";
                              toast.error(errorMessage);
                              // Revert on error
                              setChildrenCounts((prev) => ({
                                ...prev,
                                [trip._id]: currentTrip.childrenCount || 0,
                              }));
                              setChildrenAges((prev) => ({
                                ...prev,
                                [trip._id]: currentTrip.childrenAges || [],
                              }));
                              updatingChildrenRef.current[trip._id] = false;
                            }
                          }}
                          onChildrenAgesChange={async (ages) => {
                            // Recalculate price immediately with updated ages (before state update)
                            calculatePriceWithAges(trip._id, ages);
                            
                            // Update local state immediately for responsive UI
                            setChildrenAges((prev) => ({
                              ...prev,
                              [trip._id]: ages,
                            }));
                            
                            // Update backend
                            const tripDate = selectedDates[trip._id] || new Date();
                            const dateString =
                              tripDate instanceof Date ? format(tripDate, "yyyy-MM-dd") : tripDate;
                            const category =
                              selectedCategories[trip._id] || trip.selectedCategory || "standard";
                            
                            try {
                              await dispatch(
                                update_cart_trip({
                                  userId: userInfo._id,
                                  cartId: trip._id,
                                  travelersNumber: trip.travelersNumber,
                                  startingDate: dateString,
                                  selectedCategory: category,
                                  childrenCount: childrenCounts[trip._id] || 0,
                                  childrenAges: ages,
                                }),
                              );
                              // Refresh cart to get updated data
                              await dispatch(get_cart_trips(userInfo._id));
                            } catch (error) {
                              console.error("Error updating children ages:", error);
                              toast.error("Failed to update children ages");
                              // Revert on error
                              setChildrenAges((prev) => ({
                                ...prev,
                                [trip._id]: trip.childrenAges || [],
                              }));
                            }
                          }}
                        />
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Order Summary */}
            <OrderSummary
              totalPrice={totalPrice}
              travelersTotal={travelersTotal}
              childrenTotal={childrenTotal}
              travelersCount={travelersCount}
              serviceFee={serviceFee}
              hasDiscounts={hasDiscounts}
              itemCount={cart_trip_count}
            />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Cart;
