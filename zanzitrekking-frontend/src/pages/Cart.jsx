"use client";

import { useEffect, useState, useCallback } from "react";
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
  const serviceFee = 0;

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

    // Initialize children counts and ages
    const initialChildrenCounts = cart_trips.reduce((acc, trip) => {
      acc[trip._id] = trip.childrenCount || 0;
      return acc;
    }, {});
    setChildrenCounts(initialChildrenCounts);

    const initialChildrenAges = cart_trips.reduce((acc, trip) => {
      acc[trip._id] = trip.childrenAges || [];
      return acc;
    }, {});
    setChildrenAges(initialChildrenAges);

    calculateTotalPrice();
  }, [dispatch, cart_trips, calculateTotalPrice]);
  
  // Recalculate price when children data or categories change
  useEffect(() => {
    if (cart_trips.length > 0) {
      calculateTotalPrice();
    }
  }, [childrenCounts, childrenAges, selectedCategories, selectedDates, calculateTotalPrice]);

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

    const { rates } = getApplicableSeason(trip, date);

    if (!rates) {
      // Fallback to stored price if calculation fails
      return trip.totalPrice || 0;
    }

    // Get category-specific rates
    const categoryRates = getCategoryRates(rates, selectedCategory);
    if (!categoryRates) {
      // Fallback to stored price if calculation fails
      return trip.totalPrice || 0;
    }

    // Get the appropriate rate based on number of travelers (adults + children)
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

    // Calculate adult price (number of travelers without children)
    const adultPrice = basePrice * numberOfTravelers;

    // Calculate children prices with discounts
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

    // Apply trip discount if available
    const totalWithoutTripDiscount = adultPrice + childrenTotalPrice;
    const discountAmount = trip.discount
      ? (totalWithoutTripDiscount * trip.discount) / 100
      : 0;
    const finalPrice = totalWithoutTripDiscount - discountAmount;

    return finalPrice;
  }, [selectedCategories, childrenCounts, childrenAges, calculateChildrenDiscount]);

  const calculateTotalPrice = useCallback(() => {
    const total = cart_trips.reduce((sum, trip) => {
      const tripDate = selectedDates[trip._id] || new Date();
      const category =
        selectedCategories[trip._id] || trip.selectedCategory || "standard";

      // Always recalculate to include children discounts
      const calculatedPrice = calculateTripPrice(
        trip,
        tripDate,
        null,
        category,
      );
      return sum + calculatedPrice;
    }, 0);
    setTotalPrice(total);
  }, [cart_trips, selectedDates, selectedCategories, calculateTripPrice]);

  const handleDateChange = async (tripId, newDate) => {
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

    // Update local state immediately
    setSelectedDates((prev) => ({
      ...prev,
      [tripId]: dateValue,
    }));

    // Update backend - format ONLY when sending to API
    // Use LOCAL date components - backend stores YYYY-MM-DD as-is without timezone conversion
    const trip = cart_trips.find((t) => t._id === tripId);
    if (trip) {
      const category = selectedCategories[tripId] || trip.selectedCategory || "standard";
      
      // Format date using LOCAL date components (what user selected)
      // Backend will store this as-is without timezone conversion
      const year = dateValue.getFullYear();
      const month = String(dateValue.getMonth() + 1).padStart(2, "0");
      const day = String(dateValue.getDate()).padStart(2, "0");
      const dateStringToSend = `${year}-${month}-${day}`;

      try {
        await dispatch(
          update_cart_trip({
            userId: userInfo.id,
            cartId: tripId,
            travelersNumber: trip.travelersNumber,
            startingDate: dateStringToSend, // Format using UTC to prevent day shifts
            selectedCategory: category,
          }),
        );
        dispatch(get_cart_trips(userInfo.id));
      } catch (error) {
        // Revert on error...
      }
    }
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
            userId: userInfo.id,
            cartId: tripId,
            travelersNumber: trip.travelersNumber,
            startingDate: dateString,
            selectedCategory: newCategory,
          }),
        );

        // Refresh cart data after successful update
        dispatch(get_cart_trips(userInfo.id));
      } catch (error) {
        // Revert local state if backend update failed
        setSelectedCategories((prev) => ({
          ...prev,
          [tripId]: trip.selectedCategory || "standard",
        }));
      }
    }

    calculateTotalPrice();
  };

  const handleDelete = (trip) => {
    dispatch(delete_cart_trip(trip._id));
    dispatch(get_cart_trips(userInfo.id));
  };

  const handleTravelersChange = async (trip, newCount) => {
    if (newCount < 1 || newCount > 10) {return;}

    const tripDate = selectedDates[trip._id] || new Date();
    // Format date as YYYY-MM-DD to avoid timezone issues
    const dateString =
      tripDate instanceof Date ? format(tripDate, "yyyy-MM-dd") : tripDate;
    const category =
      selectedCategories[trip._id] || trip.selectedCategory || "standard";

    dispatch(
      update_cart_trip({
        userId: userInfo.id,
        cartId: trip._id,
        travelersNumber: newCount,
        startingDate: dateString,
        selectedCategory: category,
      }),
    );

    dispatch(get_cart_trips(userInfo.id));
  };

  useEffect(() => {
    if (errorMessage) {
      toast.error(errorMessage);
      dispatch(clearMessage());
    }
    if (successMessage) {
      toast.success(successMessage);
      dispatch(get_cart_trips(userInfo.id));
      dispatch(clearMessage());
    }
  }, [dispatch, successMessage, errorMessage, userInfo?.id]);

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

      // Update children counts and ages from cart trips (only if not already set)
      const updatedChildrenCounts = cart_trips.reduce((acc, trip) => {
        if (trip.childrenCount !== undefined) {
          acc[trip._id] = trip.childrenCount;
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
        if (trip.childrenAges && trip.childrenAges.length > 0) {
          acc[trip._id] = trip.childrenAges;
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
                            // Update local state immediately for responsive UI
                            setChildrenCounts((prev) => ({
                              ...prev,
                              [trip._id]: count,
                            }));
                            
                            // Reset ages if count decreases
                            let newAges = childrenAges[trip._id] || [];
                            if (count < newAges.length) {
                              newAges = newAges.slice(0, count);
                              setChildrenAges((prev) => ({
                                ...prev,
                                [trip._id]: newAges,
                              }));
                            }
                            
                            // Update backend
                            const tripDate = selectedDates[trip._id] || new Date();
                            const dateString =
                              tripDate instanceof Date ? format(tripDate, "yyyy-MM-dd") : tripDate;
                            const category =
                              selectedCategories[trip._id] || trip.selectedCategory || "standard";
                            
                            try {
                              await dispatch(
                                update_cart_trip({
                                  userId: userInfo.id,
                                  cartId: trip._id,
                                  travelersNumber: trip.travelersNumber,
                                  startingDate: dateString,
                                  selectedCategory: category,
                                  childrenCount: count,
                                  childrenAges: newAges,
                                }),
                              );
                              // Refresh cart to get updated data
                              await dispatch(get_cart_trips(userInfo.id));
                            } catch (error) {
                              console.error("Error updating children count:", error);
                              toast.error("Failed to update children count");
                              // Revert on error
                              setChildrenCounts((prev) => ({
                                ...prev,
                                [trip._id]: trip.childrenCount || 0,
                              }));
                            }
                            
                            // Recalculate price
                            setTimeout(() => calculateTotalPrice(), 100);
                          }}
                          onChildrenAgesChange={async (ages) => {
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
                                  userId: userInfo.id,
                                  cartId: trip._id,
                                  travelersNumber: trip.travelersNumber,
                                  startingDate: dateString,
                                  selectedCategory: category,
                                  childrenCount: childrenCounts[trip._id] || 0,
                                  childrenAges: ages,
                                }),
                              );
                              // Refresh cart to get updated data
                              await dispatch(get_cart_trips(userInfo.id));
                            } catch (error) {
                              console.error("Error updating children ages:", error);
                              toast.error("Failed to update children ages");
                              // Revert on error
                              setChildrenAges((prev) => ({
                                ...prev,
                                [trip._id]: trip.childrenAges || [],
                              }));
                            }
                            
                            // Recalculate price
                            setTimeout(() => calculateTotalPrice(), 100);
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
