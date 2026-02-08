import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../../api/api";
export const tripAdd = createAsyncThunk(
  "trip/tripAdd",
  async (formData, { fulfillWithValue, rejectWithValue }) => {
    try {
      const { data } = await api.post("/trip-add", formData, {
        withCredentials: true,
      });
      return fulfillWithValue(data);
    } catch (error) {
      const errorMessage = error?.response?.data?.error || error.message;
      return rejectWithValue({ errorMessage });
    }
  },
);
export const get_trips = createAsyncThunk(
  "trip/get_trips",
  async (
    { parPage = 10, currentPage = 1, searchValue = "", sort = "newest-desc" },
    { fulfillWithValue, rejectWithValue },
  ) => {
    try {
      const { data } = await api.get(
        `/trips-get?page=${currentPage}&searchValue=${searchValue}&parPage=${parPage}&sort=${sort}`,
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
export const get_trip = createAsyncThunk(
  "trip/get_trip",
  async (tripId, { fulfillWithValue, rejectWithValue }) => {
    try {
      const { data } = await api.get(`/trip-get/${tripId}`, {
        withCredentials: true,
      });

      return fulfillWithValue(data);
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      return rejectWithValue({ errorMessage });
    }
  },
);
export const update_trip = createAsyncThunk(
  "trip/update_trip",
  async ({ tripId, formData }, { fulfillWithValue, rejectWithValue }) => {
    try {
      const { data } = await api.put(`/trip-update/${tripId}`, formData, {
        withCredentials: true,
      });

      return fulfillWithValue(data);
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      return rejectWithValue({ errorMessage });
    }
  },
);
export const delete_trip = createAsyncThunk(
  "trip/delete_trip",
  async (tripId, { fulfillWithValue, rejectWithValue }) => {
    try {
      const { data } = await api.delete(`/trip-delete/${tripId}`, {
        withCredentials: true,
      });

      return fulfillWithValue(data);
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      return rejectWithValue({ errorMessage });
    }
  },
);
// Bulk delete trips
export const delete_trips = createAsyncThunk(
  "trip/delete_trips",
  async (ids, { fulfillWithValue, rejectWithValue }) => {
    try {
      const { data } = await api.post(
        "/trip-delete-multiple",
        { ids },
        { withCredentials: true }
      );
      return fulfillWithValue({ ...data, deletedIds: ids });
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
    totalTrips: 0,
    trip: {},
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
  },
  extraReducers: (builder) => {
    builder.addCase(tripAdd.fulfilled, (state, { payload }) => {
      state.trip = payload.trip;
      state.successMessage = payload.message;
      state.trips = [...state.trips, payload.trip];
      state.loader = false;
    });
    builder.addCase(tripAdd.pending, (state, { payload }) => {
      state.loader = true;
    });
    builder.addCase(tripAdd.rejected, (state, { payload }) => {
      state.loader = false;
      state.errorMessage = payload.errorMessage;
    });
    builder.addCase(get_trips.fulfilled, (state, { payload }) => {
      state.trips = payload.trips;
      state.successMessage = payload.message;
      state.totalTrips = payload.totalTrips;
      state.loader = false;
    });
    builder.addCase(get_trips.pending, (state, { payload }) => {
      state.loader = true;
    });
    builder.addCase(get_trips.rejected, (state, { payload }) => {
      state.loader = false;
      state.errorMessage = payload.errorMessage;
    });
    builder.addCase(get_trip.fulfilled, (state, { payload }) => {
      state.trip = payload.trip;

      state.loader = false;
    });
    builder.addCase(get_trip.pending, (state, { payload }) => {
      state.loader = true;
    });
    builder.addCase(get_trip.rejected, (state, { payload }) => {
      state.loader = false;
      state.errorMessage = payload.errorMessage;
    });
    builder.addCase(update_trip.fulfilled, (state, { payload }) => {
      state.trip = payload.trip;
      state.successMessage = payload.message;
      state.loader = false;
    });
    builder.addCase(update_trip.pending, (state, { payload }) => {
      state.loader = true;
    });
    builder.addCase(update_trip.rejected, (state, { payload }) => {
      state.loader = false;
      state.errorMessage = payload.errorMessage;
    });
    builder.addCase(delete_trip.fulfilled, (state, { payload }) => {
      state.successMessage = payload.message;
      state.loader = false;
    });
    builder.addCase(delete_trip.pending, (state, { payload }) => {
      state.loader = true;
    });
    builder.addCase(delete_trip.rejected, (state, { payload }) => {
      state.loader = false;
      state.errorMessage = payload.errorMessage;
    });
    builder.addCase(delete_trips.pending, (state, { payload }) => {
      state.loader = true;
    });
    builder.addCase(delete_trips.fulfilled, (state, { payload }) => {
      state.successMessage = payload.message;
      state.loader = false;
      // Remove deleted trips from state
      state.trips = state.trips.filter(
        (trip) => !payload.deletedIds.includes(trip._id)
      );
    });
    builder.addCase(delete_trips.rejected, (state, { payload }) => {
      state.loader = false;
      state.errorMessage = payload.errorMessage;
    });
  },
});
export const { clearMessage, clearTrip } = tripReducer.actions;
export default tripReducer.reducer;
