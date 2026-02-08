import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../../api/api";

// Async Thunks
export const createUrgentBookingRequest = createAsyncThunk(
  "urgentBookingRequest/createRequest",
  async (requestData, { fulfillWithValue, rejectWithValue }) => {
    try {
      const { data } = await api.post("/urgent-booking-requests", requestData);
      return fulfillWithValue(data);
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      return rejectWithValue({ errorMessage });
    }
  },
);

export const checkBookingEligibility = createAsyncThunk(
  "urgentBookingRequest/checkEligibility",
  async ({ tripId, requestedDate, selectedCategory, customerId }, { fulfillWithValue, rejectWithValue }) => {
    try {
      const params = new URLSearchParams({
        tripId,
        requestedDate,
        selectedCategory,
        customerId,
      });
      const { data } = await api.get(`/urgent-booking-requests/check-eligibility?${params.toString()}`);
      return fulfillWithValue(data);
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      return rejectWithValue({ errorMessage });
    }
  },
);

export const getMyRequests = createAsyncThunk(
  "urgentBookingRequest/getMyRequests",
  async (customerId, { fulfillWithValue, rejectWithValue }) => {
    try {
      const { data } = await api.get(`/urgent-booking-requests/my-requests?customerId=${customerId}`);
      return fulfillWithValue(data);
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      return rejectWithValue({ errorMessage });
    }
  },
);

export const getRequestStatus = createAsyncThunk(
  "urgentBookingRequest/getRequestStatus",
  async (requestId, { fulfillWithValue, rejectWithValue }) => {
    try {
      const { data } = await api.get(`/urgent-booking-requests/${requestId}`);
      return fulfillWithValue(data);
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      return rejectWithValue({ errorMessage });
    }
  },
);

export const deleteRequest = createAsyncThunk(
  "urgentBookingRequest/deleteRequest",
  async ({ requestId, customerId }, { fulfillWithValue, rejectWithValue }) => {
    try {
      const { data } = await api.delete(`/urgent-booking-requests/${requestId}?customerId=${customerId}`);
      return fulfillWithValue({ ...data, requestId });
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      return rejectWithValue({ errorMessage });
    }
  },
);

export const urgentBookingRequestReducer = createSlice({
  name: "urgentBookingRequest",
  initialState: {
    successMessage: "",
    errorMessage: "",
    loader: false,
    request: null,
    requests: [],
    eligibility: null,
  },
  reducers: {
    clearMessage(state) {
      state.errorMessage = "";
      state.successMessage = "";
    },
    clearRequest(state) {
      state.request = null;
    },
    clearEligibility(state) {
      state.eligibility = null;
    },
  },
  extraReducers: (builder) => {
    // Create Request
    builder.addCase(createUrgentBookingRequest.pending, (state) => {
      state.loader = true;
      state.errorMessage = "";
      state.successMessage = "";
    });
    builder.addCase(createUrgentBookingRequest.fulfilled, (state, { payload }) => {
      state.loader = false;
      state.request = payload.request;
      state.successMessage = payload.message || "Request submitted successfully";
      state.errorMessage = "";
    });
    builder.addCase(createUrgentBookingRequest.rejected, (state, { payload }) => {
      state.loader = false;
      state.errorMessage = payload?.errorMessage || "Failed to submit request";
      state.successMessage = "";
    });

    // Check Eligibility
    builder.addCase(checkBookingEligibility.pending, (state) => {
      state.loader = true;
    });
    builder.addCase(checkBookingEligibility.fulfilled, (state, { payload }) => {
      state.loader = false;
      state.eligibility = payload;
    });
    builder.addCase(checkBookingEligibility.rejected, (state, { payload }) => {
      state.loader = false;
      state.errorMessage = payload?.errorMessage || "Failed to check eligibility";
    });

    // Get My Requests
    builder.addCase(getMyRequests.pending, (state) => {
      state.loader = true;
    });
    builder.addCase(getMyRequests.fulfilled, (state, { payload }) => {
      state.loader = false;
      state.requests = payload.requests || [];
    });
    builder.addCase(getMyRequests.rejected, (state, { payload }) => {
      state.loader = false;
      state.errorMessage = payload?.errorMessage || "Failed to fetch requests";
    });

    // Get Request Status
    builder.addCase(getRequestStatus.pending, (state) => {
      state.loader = true;
    });
    builder.addCase(getRequestStatus.fulfilled, (state, { payload }) => {
      state.loader = false;
      state.request = payload.request;
    });
    builder.addCase(getRequestStatus.rejected, (state, { payload }) => {
      state.loader = false;
      state.errorMessage = payload?.errorMessage || "Failed to fetch request status";
    });

    // Delete Request
    builder.addCase(deleteRequest.pending, (state) => {
      state.loader = true;
      state.errorMessage = "";
      state.successMessage = "";
    });
    builder.addCase(deleteRequest.fulfilled, (state, { payload }) => {
      state.loader = false;
      state.successMessage = payload.message || "Request deleted successfully";
      state.errorMessage = "";
      // Remove the deleted request from the list
      state.requests = state.requests.filter((r) => r._id !== payload.requestId);
    });
    builder.addCase(deleteRequest.rejected, (state, { payload }) => {
      state.loader = false;
      state.errorMessage = payload?.errorMessage || "Failed to delete request";
      state.successMessage = "";
    });
  },
});

export const { clearMessage, clearRequest, clearEligibility } = urgentBookingRequestReducer.actions;
export default urgentBookingRequestReducer.reducer;

