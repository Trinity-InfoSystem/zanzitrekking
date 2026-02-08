import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../../api/api";

// Async Thunks
export const getAllUrgentBookingRequests = createAsyncThunk(
  "urgentBookingRequest/getAllRequests",
  async (
    {
      page = 1,
      limit = 10,
      status = "",
      tripId = "",
      searchValue = "",
      dateFrom = "",
      dateTo = "",
      sortBy = "createdAt",
      sortOrder = "desc",
    },
    { fulfillWithValue, rejectWithValue }
  ) => {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        searchValue,
        sortBy,
        sortOrder,
      });
      if (status) params.append("status", status);
      if (tripId) params.append("tripId", tripId);
      if (dateFrom) params.append("dateFrom", dateFrom);
      if (dateTo) params.append("dateTo", dateTo);

      const { data } = await api.get(`/admin/urgent-booking-requests?${params.toString()}`);
      return fulfillWithValue(data);
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      return rejectWithValue({ errorMessage });
    }
  }
);

export const getRequestById = createAsyncThunk(
  "urgentBookingRequest/getRequestById",
  async (requestId, { fulfillWithValue, rejectWithValue }) => {
    try {
      const { data } = await api.get(`/admin/urgent-booking-requests/${requestId}`);
      return fulfillWithValue(data);
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      return rejectWithValue({ errorMessage });
    }
  }
);

export const updateRequestStatus = createAsyncThunk(
  "urgentBookingRequest/updateRequestStatus",
  async ({ requestId, status, adminNotes, rejectedReason }, { fulfillWithValue, rejectWithValue }) => {
    try {
      const payload = { status };
      if (adminNotes) payload.adminNotes = adminNotes;
      if (rejectedReason) payload.rejectedReason = rejectedReason;

      const { data } = await api.put(`/admin/urgent-booking-requests/${requestId}/status`, payload);
      return fulfillWithValue(data);
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      return rejectWithValue({ errorMessage });
    }
  }
);

export const bulkUpdateRequestStatus = createAsyncThunk(
  "urgentBookingRequest/bulkUpdateStatus",
  async ({ requestIds, status, adminNotes, rejectedReason }, { fulfillWithValue, rejectWithValue }) => {
    try {
      const payload = {
        requestIds,
        status,
      };
      if (adminNotes) payload.adminNotes = adminNotes;
      if (rejectedReason) payload.rejectedReason = rejectedReason;

      const { data } = await api.post("/admin/urgent-booking-requests/bulk-update", payload);
      return fulfillWithValue(data);
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      return rejectWithValue({ errorMessage });
    }
  }
);

export const getRequestStats = createAsyncThunk(
  "urgentBookingRequest/getRequestStats",
  async (_, { fulfillWithValue, rejectWithValue }) => {
    try {
      const { data } = await api.get("/admin/urgent-booking-requests/stats");
      return fulfillWithValue(data);
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      return rejectWithValue({ errorMessage });
    }
  }
);

export const urgentBookingRequestReducer = createSlice({
  name: "urgentBookingRequest",
  initialState: {
    successMessage: "",
    errorMessage: "",
    loader: false,
    requests: [],
    request: null,
    stats: {
      total: 0,
      pending: 0,
      approved: 0,
      rejected: 0,
      urgent: 0,
    },
    pagination: {
      currentPage: 1,
      totalPages: 1,
      totalRequests: 0,
      hasNext: false,
      hasPrev: false,
    },
  },
  reducers: {
    clearMessage(state) {
      state.errorMessage = "";
      state.successMessage = "";
    },
    clearRequest(state) {
      state.request = null;
    },
  },
  extraReducers: (builder) => {
    // Get All Requests
    builder.addCase(getAllUrgentBookingRequests.pending, (state) => {
      state.loader = true;
    });
    builder.addCase(getAllUrgentBookingRequests.fulfilled, (state, { payload }) => {
      state.loader = false;
      state.requests = payload.requests || [];
      state.stats = payload.stats || state.stats;
      state.pagination = payload.pagination || state.pagination;
      state.errorMessage = "";
    });
    builder.addCase(getAllUrgentBookingRequests.rejected, (state, { payload }) => {
      state.loader = false;
      state.errorMessage = payload?.errorMessage || "Failed to fetch requests";
    });

    // Get Request By ID
    builder.addCase(getRequestById.pending, (state) => {
      state.loader = true;
    });
    builder.addCase(getRequestById.fulfilled, (state, { payload }) => {
      state.loader = false;
      state.request = payload.request;
      state.errorMessage = "";
    });
    builder.addCase(getRequestById.rejected, (state, { payload }) => {
      state.loader = false;
      state.errorMessage = payload?.errorMessage || "Failed to fetch request";
    });

    // Update Request Status
    builder.addCase(updateRequestStatus.pending, (state) => {
      state.loader = true;
      state.errorMessage = "";
      state.successMessage = "";
    });
    builder.addCase(updateRequestStatus.fulfilled, (state, { payload }) => {
      state.loader = false;
      state.successMessage = payload.message || "Request updated successfully";
      state.errorMessage = "";
      // Update the request in the list if it exists
      const index = state.requests.findIndex((r) => r._id === payload.request?._id);
      if (index !== -1) {
        state.requests[index] = payload.request;
      }
    });
    builder.addCase(updateRequestStatus.rejected, (state, { payload }) => {
      state.loader = false;
      state.errorMessage = payload?.errorMessage || "Failed to update request";
      state.successMessage = "";
    });

    // Bulk Update Request Status
    builder.addCase(bulkUpdateRequestStatus.pending, (state) => {
      state.loader = true;
      state.errorMessage = "";
      state.successMessage = "";
    });
    builder.addCase(bulkUpdateRequestStatus.fulfilled, (state, { payload }) => {
      state.loader = false;
      state.successMessage = payload.message || "Requests updated successfully";
      state.errorMessage = "";
    });
    builder.addCase(bulkUpdateRequestStatus.rejected, (state, { payload }) => {
      state.loader = false;
      state.errorMessage = payload?.errorMessage || "Failed to update requests";
      state.successMessage = "";
    });

    // Get Request Stats
    builder.addCase(getRequestStats.pending, (state) => {
      state.loader = true;
    });
    builder.addCase(getRequestStats.fulfilled, (state, { payload }) => {
      state.loader = false;
      state.stats = payload.stats || state.stats;
      state.errorMessage = "";
    });
    builder.addCase(getRequestStats.rejected, (state, { payload }) => {
      state.loader = false;
      state.errorMessage = payload?.errorMessage || "Failed to fetch stats";
    });
  },
});

export const { clearMessage, clearRequest } = urgentBookingRequestReducer.actions;
export default urgentBookingRequestReducer.reducer;

