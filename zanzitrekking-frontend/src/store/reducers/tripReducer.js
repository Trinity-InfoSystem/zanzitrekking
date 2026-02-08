import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../../api/api";

export const get_trips = createAsyncThunk(
  "trip/get_trips",
  async (
    { parPage = 40, currentPage = 1, searchValue = "" },
    { fulfillWithValue, rejectWithValue },
  ) => {
    try {
      const { data } = await api.get(
        `/trips-get?page=${currentPage}&&searchValue=${searchValue}&&parPage=${parPage}`,
        {
          withCredentials: true,
        },
      );

      return fulfillWithValue(data);
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      return rejectWithValue({ errorMessage });
    }
  },
);
export const get_special_trips = createAsyncThunk(
  "trip/get_special_trips",
  async (_, { fulfillWithValue, rejectWithValue }) => {
    try {
      const { data } = await api.get("/special-trips-get");
      return fulfillWithValue(data);
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      return rejectWithValue({ errorMessage });
    }
  },
);
export const get_trip = createAsyncThunk(
  "trip/get_trip",
  async (tripId, { fulfillWithValue, rejectWithValue }) => {
    try {
      const { data } = await api.get(`/trip-get/${tripId}`);

      return fulfillWithValue(data);
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      return rejectWithValue({ errorMessage });
    }
  },
);
export const price_range_trips = createAsyncThunk(
  "trip/price_range_trips",
  async (_, { fulfillWithValue, rejectWithValue }) => {
    try {
      const { data } = await api.get("/trip/price-range");
      return fulfillWithValue(data);
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      return rejectWithValue({ errorMessage });
    }
  },
);
export const query_trips = createAsyncThunk(
  "trip/query_trips",
  async (
    { low, high, category, rating, sort, pageNumber, search, perPage }, // 👈 added perPage
    { fulfillWithValue, rejectWithValue },
  ) => {
    try {
      // Build query string - only include price if both low and high are provided
      let queryString = `?pageNumber=${pageNumber}`;
      
      // Only add price parameters if both low and high are provided
      if (low !== undefined && high !== undefined && low !== null && high !== null) {
        queryString += `&low=${low}&high=${high}`;
      }
      
      if (category) {queryString += `&category=${category}`;}
      if (rating) {queryString += `&rating=${rating}`;}
      if (sort !== "sort-by") {queryString += `&sort=${sort}`;}
      if (perPage) {queryString += `&perPage=${perPage}`;}
      if (search) {queryString += `&search=${encodeURIComponent(search)}`;}
      
      const { data } = await api.get(`/trip/query-trips${queryString}`);
      return fulfillWithValue(data);
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      return rejectWithValue({ errorMessage });
    }
  },
);
export const tripReducer = createSlice({
  name: "trip",
  initialState: {
    successMessage: "",
    errorMessage: "",
    loader: false,
    trips: [],
    parpage: 6,
    latest_trips: [],
    most_booked_trips: [],
    discount_trips: [],
    totalTrips: 0,
    trip: {},
    priceRange: {
      low: 0,
      high: 0,
    },
    overallTrips: 0,
  },
  reducers: {
    clearMessage: (state) => {
      return {
        ...state,
        errorMessage: "",
        successMessage: "",
      };
    },
    clearTrip: (state) => {
      return {
        ...state,
        trip: {},
      };
    },
    clearTrips: (state) => {
      return {
        ...state,
        trips: [],
        totalTrips: 0,
        loader: true, // Set loader to true so skeleton shows
      };
    },
  },
  extraReducers: (builder) => {
    // Get Trips Cases
    builder.addCase(get_trips.fulfilled, (state, { payload }) => {
      state.trips = payload.trips;
      state.successMessage = payload.message;
      state.totalTrips = payload.totalTrips;
      state.loader = false;
    });
    builder.addCase(get_trips.pending, (state) => {
      state.loader = true;
    });
    builder.addCase(get_trips.rejected, (state, { payload }) => {
      state.loader = false;
      state.errorMessage = payload.errorMessage;
    });

    // Get Single Trip Cases
    builder.addCase(get_trip.fulfilled, (state, { payload }) => {
      state.trip = payload.trip;
      state.loader = false;
    });
    builder.addCase(get_trip.rejected, (state, { payload }) => {
      state.loader = false;
      state.errorMessage = payload.errorMessage;
    });

    // Get Special Trips Cases
    builder.addCase(get_special_trips.fulfilled, (state, { payload }) => {
      state.trips = payload.trips || [];
      state.latest_trips = payload.latest_trips || [];
      state.discount_trips = payload.discount_trips || [];
      state.most_booked_trips = payload.most_booked_trips || [];
      state.totalTrips = payload.totalTrips;
      state.loader = false;
    });
    builder.addCase(get_special_trips.rejected, (state, { payload }) => {
      state.loader = false;
      state.errorMessage = payload.errorMessage;
    });

    // Price Range Cases
    builder.addCase(price_range_trips.pending, (state) => {
      state.loader = true;
    });
    builder.addCase(price_range_trips.fulfilled, (state, { payload }) => {
      state.priceRange = payload.priceRange;
      state.successMessage = payload.message;
      state.loader = false;
    });
    builder.addCase(price_range_trips.rejected, (state, { payload }) => {
      state.loader = false;
      state.errorMessage = payload.errorMessage;
    });

    // Query Trips Cases
    builder.addCase(query_trips.pending, (state) => {
      state.loader = true;
    });
    builder.addCase(query_trips.fulfilled, (state, { payload }) => {
      state.trips = payload.trips;
      state.totalTrips = payload.totalTrips ?? payload.filteredTrips ?? 0;
      state.overallTrips = payload.overallTrips ?? payload.totalTrips ?? state.overallTrips;
      state.successMessage = payload.message;
      state.loader = false;
    });
    builder.addCase(query_trips.rejected, (state, { payload }) => {
      state.loader = false;
      state.errorMessage = payload.errorMessage;
    });
  },
});
export const { clearMessage, clearTrip, clearTrips } = tripReducer.actions;
export default tripReducer.reducer;
