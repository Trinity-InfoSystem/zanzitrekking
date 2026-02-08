import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../../api/api";

// Async Thunks
export const subscribeNewsletter = createAsyncThunk(
  "newsletter/subscribe",
  async (subscriberData, { fulfillWithValue, rejectWithValue }) => {
    try {
      const { data } = await api.post("/newsletter/subscribe", subscriberData, {
        withCredentials: true,
      });
      return fulfillWithValue(data);
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      return rejectWithValue({ errorMessage });
    }
  },
);

export const unsubscribeNewsletter = createAsyncThunk(
  "newsletter/unsubscribe",
  async (email, { fulfillWithValue, rejectWithValue }) => {
    try {
      const { data } = await api.post(
        "/newsletter/unsubscribe",
        { email },
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

export const getSubscribers = createAsyncThunk(
  "newsletter/getSubscribers",
  async (
    { page = 1, limit = 10, status = "subscribed", search = "", sort = "newest-desc" },
    { fulfillWithValue, rejectWithValue },
  ) => {
    try {
      const { data } = await api.get(
        `/newsletter/subscribers?page=${page}&limit=${limit}&status=${status}&search=${search}&sort=${sort}`,
        { withCredentials: true },
      );
      return fulfillWithValue(data);
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      return rejectWithValue({ errorMessage });
    }
  },
);

export const getAllSubscribers = createAsyncThunk(
  "newsletter/getAllSubscribers",
  async (_, { fulfillWithValue, rejectWithValue }) => {
    try {
      const { data } = await api.get(`/newsletter/subscribers/all`, {
        withCredentials: true,
      });
      return fulfillWithValue(data);
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      return rejectWithValue({ errorMessage });
    }
  },
);

export const getSubscriber = createAsyncThunk(
  "newsletter/getSubscriber",
  async (email, { fulfillWithValue, rejectWithValue }) => {
    try {
      const { data } = await api.get(`/newsletter/subscriber/${email}`, {
        withCredentials: true,
      });
      return fulfillWithValue(data);
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      return rejectWithValue({ errorMessage });
    }
  },
);

export const updateSubscriber = createAsyncThunk(
  "newsletter/updateSubscriber",
  async ({ email, updateData }, { fulfillWithValue, rejectWithValue }) => {
    try {
      const { data } = await api.put(
        `/newsletter/subscriber/${email}`,
        updateData,
        { withCredentials: true },
      );
      return fulfillWithValue(data);
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      return rejectWithValue({ errorMessage });
    }
  },
);

export const deleteSubscriber = createAsyncThunk(
  "newsletter/deleteSubscriber",
  async (email, { fulfillWithValue, rejectWithValue }) => {
    try {
      const { data } = await api.delete(`/newsletter/subscriber/${email}`, {
        withCredentials: true,
      });
      return fulfillWithValue(data);
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      return rejectWithValue({ errorMessage });
    }
  },
);

// Add these new async thunks to your existing ones
export const sendNewsletter = createAsyncThunk(
  "newsletter/sendNewsletter",
  async (formData, { fulfillWithValue, rejectWithValue }) => {
    try {
      const { data } = await api.post("/newsletter/send", formData, {
        withCredentials: true,
      });
      return fulfillWithValue(data);
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      return rejectWithValue({ errorMessage });
    }
  },
);

export const exportSubscribers = createAsyncThunk(
  "newsletter/exportSubscribers",
  async (_, { fulfillWithValue, rejectWithValue }) => {
    try {
      const response = await api.get("/newsletter/export", {
        withCredentials: true,
        responseType: "blob", // Important for file downloads
      });
      return fulfillWithValue(response.data);
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      return rejectWithValue({ errorMessage });
    }
  },
);

// Slice
export const newsletterReducer = createSlice({
  name: "newsletter",
  initialState: {
    successMessage: "",
    errorMessage: "",
    loader: false,
    subscribers: [],
    allSubscribers: [],
    totalSubscribers: 0,
    currentSubscriber: null,
    pagination: {
      page: 1,
      limit: 10,
      totalPages: 1,
    },
    isSending: false,
    isExporting: false,
    lastSent: null,
    exportError: null,
    sendError: null,
  },
  reducers: {
    clearNewsletterMessage: (state) => {
      state.errorMessage = "";
      state.successMessage = "";
    },
    setNewsletterPagination: (state, action) => {
      state.pagination = {
        ...state.pagination,
        ...action.payload,
      };
    },
  },
  extraReducers: (builder) => {
    // Subscribe
    builder.addCase(subscribeNewsletter.pending, (state) => {
      state.loader = true;
    });
    builder.addCase(subscribeNewsletter.fulfilled, (state, { payload }) => {
      state.loader = false;
      state.successMessage = payload.message;
      state.subscribers.unshift(payload.subscription);
      state.totalSubscribers += 1;
      // Reset pagination to first page when adding new subscriber
      state.pagination.page = 1;
    });
    builder.addCase(subscribeNewsletter.rejected, (state, { payload }) => {
      state.loader = false;
      state.errorMessage = payload.errorMessage;
    });

    // Unsubscribe
    builder.addCase(unsubscribeNewsletter.pending, (state) => {
      state.loader = true;
    });
    builder.addCase(unsubscribeNewsletter.fulfilled, (state, { payload }) => {
      state.loader = false;
      state.successMessage = payload.message;
      state.subscribers = state.subscribers.map((sub) =>
        sub.email === payload.subscription.email ? payload.subscription : sub,
      );
    });
    builder.addCase(unsubscribeNewsletter.rejected, (state, { payload }) => {
      state.loader = false;
      state.errorMessage = payload.errorMessage;
    });

    // Get Subscribers
    builder.addCase(getSubscribers.pending, (state) => {
      state.loader = true;
    });
    builder.addCase(getSubscribers.fulfilled, (state, { payload }) => {
      state.loader = false;
      state.subscribers = payload.docs;
      state.totalSubscribers = payload.totalDocs;
      state.pagination = {
        page: payload.page,
        limit: payload.limit,
        totalPages: payload.totalPages,
      };
    });
    builder.addCase(getSubscribers.rejected, (state, { payload }) => {
      state.loader = false;
      state.errorMessage = payload.errorMessage;
    });

    // Get All Subscribers
    builder.addCase(getAllSubscribers.pending, (state) => {
      state.loader = true;
    });
    builder.addCase(getAllSubscribers.fulfilled, (state, { payload }) => {
      state.loader = false;
      state.allSubscribers = payload;
    });
    builder.addCase(getAllSubscribers.rejected, (state, { payload }) => {
      state.loader = false;
      state.errorMessage = payload.errorMessage;
    });

    // Get Single Subscriber
    builder.addCase(getSubscriber.pending, (state) => {
      state.loader = true;
    });
    builder.addCase(getSubscriber.fulfilled, (state, { payload }) => {
      state.loader = false;
      state.currentSubscriber = payload.subscription;
    });
    builder.addCase(getSubscriber.rejected, (state, { payload }) => {
      state.loader = false;
      state.errorMessage = payload.errorMessage;
      state.currentSubscriber = null;
    });

    // Update Subscriber
    builder.addCase(updateSubscriber.pending, (state) => {
      state.loader = true;
    });
    builder.addCase(updateSubscriber.fulfilled, (state, { payload }) => {
      state.loader = false;
      state.successMessage = payload.message;
      state.subscribers = state.subscribers.map((sub) =>
        sub.email === payload.subscription.email ? payload.subscription : sub,
      );
      if (state.currentSubscriber?.email === payload.subscription.email) {
        state.currentSubscriber = payload.subscription;
      }
    });
    builder.addCase(updateSubscriber.rejected, (state, { payload }) => {
      state.loader = false;
      state.errorMessage = payload.errorMessage;
    });

    // Delete Subscriber
    builder.addCase(deleteSubscriber.pending, (state) => {
      state.loader = true;
    });
    builder.addCase(deleteSubscriber.fulfilled, (state, { payload }) => {
      state.loader = false;
      state.successMessage = payload.message;
      state.subscribers = state.subscribers.filter(
        (sub) => sub.email !== payload.email,
      );
      state.totalSubscribers = Math.max(0, state.totalSubscribers - 1);
      if (state.currentSubscriber?.email === payload.email) {
        state.currentSubscriber = null;
      }
      // Reset to first page if last item on current page was deleted
      if (state.subscribers.length === 0 && state.totalSubscribers > 0) {
        state.pagination.page = 1;
        dispatch(
          getSubscribers({
            page: 1,
            limit: state.pagination.limit,
            search: searchValue,
          }),
        );
      }
    });
    builder.addCase(deleteSubscriber.rejected, (state, { payload }) => {
      state.loader = false;
      state.errorMessage = payload.errorMessage;
    });
    builder.addCase(sendNewsletter.pending, (state) => {
      state.isSending = true;
      state.sendError = null;
    });
    builder.addCase(sendNewsletter.fulfilled, (state, { payload }) => {
      state.isSending = false;
      state.successMessage = payload.message;
      state.lastSent = new Date().toISOString();
    });
    builder.addCase(sendNewsletter.rejected, (state, { payload }) => {
      state.isSending = false;
      state.sendError = payload.errorMessage;
      state.errorMessage = payload.errorMessage;
    });

    // Export Subscribers
    builder.addCase(exportSubscribers.pending, (state) => {
      state.isExporting = true;
      state.exportError = null;
    });
    builder.addCase(exportSubscribers.fulfilled, (state) => {
      state.isExporting = false;
      state.successMessage = "Subscribers exported successfully";
    });
    builder.addCase(exportSubscribers.rejected, (state, { payload }) => {
      state.isExporting = false;
      state.exportError = payload.errorMessage;
      state.errorMessage = payload.errorMessage;
    });
  },
});

export const {
  clearNewsletterMessage,
  setNewsletterPagination,
  resetSendStatus,
} = newsletterReducer.actions;
export default newsletterReducer.reducer;
