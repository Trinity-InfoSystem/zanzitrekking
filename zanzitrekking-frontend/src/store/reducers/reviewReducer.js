import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../../api/api";

// Create review
export const createReview = createAsyncThunk(
  "review/createReview",
  async (
    { customerId, tripId, orderId, rating, title, comment },
    { fulfillWithValue, rejectWithValue },
  ) => {
    try {
      const { data } = await api.post("/reviews/create", {
        customerId,
        tripId,
        rating,
        title,
        comment,
      });
      return fulfillWithValue(data);
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      return rejectWithValue({ errorMessage });
    }
  },
);

// Get reviewable trips
export const getReviewableTrips = createAsyncThunk(
  "review/getReviewableTrips",
  async (
    { customerId, page = 1, limit = 6 },
    { fulfillWithValue, rejectWithValue },
  ) => {
    try {
      const { data } = await api.get(
        `/reviews/reviewable-trips?customerId=${customerId}&page=${page}&limit=${limit}`,
      );
      return fulfillWithValue(data);
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      return rejectWithValue({ errorMessage });
    }
  },
);

export const reviewReducer = createSlice({
  name: "review",
  initialState: {
    successMessage: "",
    errorMessage: "",
    loader: false,

    // Reviewable trips
    reviewableTrips: [],
    pagination: {
      currentPage: 1,
      totalPages: 1,
      totalTrips: 0,
    },
    reviewableTripsLoader: false,

    // Create review
    createReviewLoader: false,
  },
  reducers: {
    clearMessage(state) {
      state.errorMessage = "";
      state.successMessage = "";
    },
  },
  extraReducers: (builder) => {
    // Create review
    builder.addCase(createReview.pending, (state) => {
      state.createReviewLoader = true;
      state.errorMessage = "";
      state.successMessage = "";
    });
    builder.addCase(createReview.fulfilled, (state, { payload }) => {
      state.createReviewLoader = false;
      state.successMessage =
        "Review submitted successfully! It's pending approval.";
    });
    builder.addCase(createReview.rejected, (state, { payload }) => {
      state.createReviewLoader = false;
      state.errorMessage = payload?.errorMessage || "Failed to submit review";
    });

    // Get reviewable trips
    builder.addCase(getReviewableTrips.pending, (state) => {
      state.reviewableTripsLoader = true;
      state.errorMessage = "";
    });
    builder.addCase(getReviewableTrips.fulfilled, (state, { payload }) => {
      state.reviewableTripsLoader = false;
      state.reviewableTrips = payload.reviewableTrips;
      state.pagination = payload.pagination;
    });
    builder.addCase(getReviewableTrips.rejected, (state, { payload }) => {
      state.reviewableTripsLoader = false;
      state.errorMessage =
        payload?.errorMessage || "Failed to load reviewable trips";
    });
  },
});

export const { clearMessage } = reviewReducer.actions;
export default reviewReducer.reducer;
