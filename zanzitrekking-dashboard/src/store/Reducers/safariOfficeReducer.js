import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_BASE_URL = import.meta.env.DEV
  ? "/api/safari" // Use Vite proxy in development
  : "https://zanzitrekking-backend.onrender.com/api/safari"; // Use YOUR backend proxy in production

// Remove the hardcoded API_TOKEN completely - it will be handled by your backend
const safariAPI = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: false,
});

// ============ CLIENT ASYNC THUNKS ============

export const fetchClients = createAsyncThunk(
  "safariOffice/fetchClients",
  async ({ page = 1, limit = 20, search = "" } = {}, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams();
      if (page) params.append("page", page);
      if (limit) params.append("limit", limit);
      if (search) params.append("search", search);

      const response = await safariAPI.get(`/v1/clients?${params.toString()}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  },
);

export const fetchClientById = createAsyncThunk(
  "safariOffice/fetchClientById",
  async (clientId, { rejectWithValue }) => {
    try {
      const response = await safariAPI.get(`/v1/clients/${clientId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  },
);

export const createClient = createAsyncThunk(
  "safariOffice/createClient",
  async (clientData, { rejectWithValue }) => {
    try {
      const response = await safariAPI.post("/v1/clients", clientData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  },
);

export const updateClient = createAsyncThunk(
  "safariOffice/updateClient",
  async ({ clientId, clientData }, { rejectWithValue }) => {
    try {
      const response = await safariAPI.put(
        `/v1/clients/${clientId}`,
        clientData,
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  },
);

export const deleteClient = createAsyncThunk(
  "safariOffice/deleteClient",
  async (clientId, { rejectWithValue }) => {
    try {
      const response = await safariAPI.delete(`/v1/clients/${clientId}`);
      return { ...response.data, clientId };
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  },
);

// ============ REQUEST ASYNC THUNKS ============

export const fetchRequests = createAsyncThunk(
  "safariOffice/fetchRequests",
  async (
    { status = "", clientId = "", search = "", page = 1, limit = 20 } = {},
    { rejectWithValue },
  ) => {
    try {
      const params = new URLSearchParams();
      if (status) params.append("status", status);
      if (clientId) params.append("client_id", clientId);
      if (search) params.append("search", search);
      if (page) params.append("page", page);
      if (limit) params.append("limit", limit);

      const response = await safariAPI.get(`/v1/requests?${params.toString()}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  },
);

export const fetchRequestById = createAsyncThunk(
  "safariOffice/fetchRequestById",
  async (requestId, { rejectWithValue }) => {
    try {
      const response = await safariAPI.get(`/v1/requests/${requestId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  },
);

export const updateRequest = createAsyncThunk(
  "safariOffice/updateRequest",
  async ({ requestId, requestData }, { rejectWithValue }) => {
    try {
      const response = await safariAPI.put(
        `/v1/requests/${requestId}`,
        requestData,
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  },
);

export const bookRequest = createAsyncThunk(
  "safariOffice/bookRequest",
  async ({ requestId, bookingData }, { rejectWithValue }) => {
    try {
      const response = await safariAPI.post(
        `/v1/requests/${requestId}/booked`,
        bookingData,
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  },
);

export const markRequestNotBooked = createAsyncThunk(
  "safariOffice/markRequestNotBooked",
  async ({ requestId, reason = "" }, { rejectWithValue }) => {
    try {
      const response = await safariAPI.post(
        `/v1/requests/${requestId}/notbooked`,
        { reason },
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  },
);

export const deleteRequest = createAsyncThunk(
  "safariOffice/deleteRequest",
  async (requestId, { rejectWithValue }) => {
    try {
      const response = await safariAPI.delete(`/v1/requests/${requestId}`);
      return { ...response.data, requestId };
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  },
);

// ============ QUOTE ASYNC THUNKS ============

export const fetchQuotes = createAsyncThunk(
  "safariOffice/fetchQuotes",
  async (
    { status = "", requestId = "", page = 1, limit = 20 } = {},
    { rejectWithValue },
  ) => {
    try {
      const params = new URLSearchParams();
      if (status) params.append("status", status);
      if (requestId) params.append("request_id", requestId);
      if (page) params.append("page", page);
      if (limit) params.append("limit", limit);

      const response = await safariAPI.get(`/v1/quotes?${params.toString()}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  },
);

export const fetchQuoteById = createAsyncThunk(
  "safariOffice/fetchQuoteById",
  async (quoteId, { rejectWithValue }) => {
    try {
      const response = await safariAPI.get(`/v1/quotes/${quoteId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  },
);

export const fetchQuotesForRequest = createAsyncThunk(
  "safariOffice/fetchQuotesForRequest",
  async (requestId, { rejectWithValue }) => {
    try {
      const response = await safariAPI.get(
        `/v1/quotes/for-request/${requestId}`,
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  },
);

export const deleteQuote = createAsyncThunk(
  "safariOffice/deleteQuote",
  async (quoteId, { rejectWithValue }) => {
    try {
      const response = await safariAPI.delete(`/v1/quotes/${quoteId}`);
      return { ...response.data, quoteId };
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  },
);

// ============ ANALYTICS ASYNC THUNKS ============

export const fetchAnalytics = createAsyncThunk(
  "safariOffice/fetchAnalytics",
  async (_, { rejectWithValue }) => {
    try {
      const [usageResponse, rateLimitResponse] = await Promise.all([
        safariAPI.get("/v1/analytics/usage"),
        safariAPI.get("/v1/analytics/rate-limit"),
      ]);

      // Handle nested structure: {success: true, result: {data: {...}}}
      const usageData =
        usageResponse.data.result?.data ||
        usageResponse.data.result ||
        usageResponse.data;
      const rateLimitData =
        rateLimitResponse.data.result?.data ||
        rateLimitResponse.data.result ||
        rateLimitResponse.data;

      return {
        usage: usageData,
        rateLimit: rateLimitData,
      };
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  },
);

// ============ INITIAL STATE ============

const initialState = {
  // Clients
  clients: [],
  selectedClient: null,
  clientsLoading: false,
  clientsError: null,
  clientsPagination: { page: 1, limit: 20, total: 0 },
  clientDetailsLoading: false, // Separate loading for viewing details

  // Requests
  requests: [],
  selectedRequest: null,
  requestsLoading: false,
  requestsError: null,
  requestsPagination: { page: 1, limit: 20, total: 0 },
  requestDetailsLoading: false, // Separate loading for viewing details

  // Quotes
  quotes: [],
  selectedQuote: null,
  quotesLoading: false,
  quotesError: null,
  quotesPagination: { page: 1, limit: 20, total: 0 },
  quoteDetailsLoading: false, // Separate loading for viewing details

  // Analytics
  analytics: null,
  analyticsLoading: false,
  analyticsError: null,

  // UI State
  filters: {
    clientSearch: "",
    requestStatus: "",
    requestSearch: "",
    quoteStatus: "",
  },
};

// ============ SLICE ============

const safariOfficeSlice = createSlice({
  name: "safariOffice",
  initialState,
  reducers: {
    setClientSearch: (state, action) => {
      state.filters.clientSearch = action.payload;
    },
    setRequestStatus: (state, action) => {
      state.filters.requestStatus = action.payload;
    },
    setRequestSearch: (state, action) => {
      state.filters.requestSearch = action.payload;
    },
    setQuoteStatus: (state, action) => {
      state.filters.quoteStatus = action.payload;
    },
    clearSelectedClient: (state) => {
      state.selectedClient = null;
    },
    clearSelectedRequest: (state) => {
      state.selectedRequest = null;
    },
    clearSelectedQuote: (state) => {
      state.selectedQuote = null;
    },
    resetFilters: (state) => {
      state.filters = initialState.filters;
    },
  },
  extraReducers: (builder) => {
    // ============ CLIENTS ============
    builder
      .addCase(fetchClients.pending, (state) => {
        state.clientsLoading = true;
        state.clientsError = null;
      })
      .addCase(fetchClients.fulfilled, (state, action) => {
        state.clientsLoading = false;
        // Handle nested structure: {success: true, result: {data: [...], meta: {...}}}
        const result = action.payload.result || action.payload;
        state.clients = result.data || [];
        const meta = result.meta || {};
        state.clientsPagination = {
          page: meta.current_page || 1,
          limit: meta.per_page || 20,
          total: meta.total || 0,
        };
      })
      .addCase(fetchClients.rejected, (state, action) => {
        state.clientsLoading = false;
        state.clientsError = action.payload;
      })

      .addCase(fetchClientById.pending, (state) => {
        // Use separate loading state for details
        state.clientDetailsLoading = true;
        state.clientsError = null;
      })
      .addCase(fetchClientById.fulfilled, (state, action) => {
        state.clientDetailsLoading = false;
        // Handle nested structure: {success: true, result: {data: {...}}}
        const result = action.payload.result || action.payload;
        state.selectedClient = result.data || result;
      })
      .addCase(fetchClientById.rejected, (state, action) => {
        state.clientDetailsLoading = false;
        state.clientsError = action.payload;
      })

      .addCase(createClient.fulfilled, (state, action) => {
        // Handle nested structure
        const result = action.payload.result || action.payload;
        const newClient = result.data || result;
        state.clients.unshift(newClient);
      })

      .addCase(updateClient.fulfilled, (state, action) => {
        // Handle nested structure
        const result = action.payload.result || action.payload;
        const updatedClient = result.data || result;
        const index = state.clients.findIndex(
          (c) => c.client_id === updatedClient.client_id,
        );
        if (index !== -1) {
          state.clients[index] = updatedClient;
        }
        if (state.selectedClient?.client_id === updatedClient.client_id) {
          state.selectedClient = updatedClient;
        }
      })

      .addCase(deleteClient.fulfilled, (state, action) => {
        state.clients = state.clients.filter(
          (c) => c.client_id !== action.payload.clientId,
        );
        if (state.selectedClient?.client_id === action.payload.clientId) {
          state.selectedClient = null;
        }
      })

      // ============ REQUESTS ============
      .addCase(fetchRequests.pending, (state) => {
        state.requestsLoading = true;
        state.requestsError = null;
      })
      .addCase(fetchRequests.fulfilled, (state, action) => {
        state.requestsLoading = false;
        // Handle nested structure: {success: true, result: {data: [...], meta: {...}}}
        const result = action.payload.result || action.payload;
        state.requests = result.data || [];
        const meta = result.meta || {};
        state.requestsPagination = {
          page: meta.current_page || 1,
          limit: meta.per_page || 20,
          total: meta.total || 0,
        };
      })
      .addCase(fetchRequests.rejected, (state, action) => {
        state.requestsLoading = false;
        state.requestsError = action.payload;
      })

      .addCase(fetchRequestById.pending, (state) => {
        // Use separate loading state for details
        state.requestDetailsLoading = true;
        state.requestsError = null;
      })
      .addCase(fetchRequestById.fulfilled, (state, action) => {
        state.requestDetailsLoading = false;
        // Handle nested structure: {success: true, result: {data: {...}}}
        const result = action.payload.result || action.payload;
        state.selectedRequest = result.data || result;
      })
      .addCase(fetchRequestById.rejected, (state, action) => {
        state.requestDetailsLoading = false;
        state.requestsError = action.payload;
      })

      .addCase(updateRequest.fulfilled, (state, action) => {
        // Handle nested structure
        const result = action.payload.result || action.payload;
        const updatedRequest = result.data || result;
        const index = state.requests.findIndex(
          (r) => r.request_id === updatedRequest.request_id,
        );
        if (index !== -1) {
          state.requests[index] = updatedRequest;
        }
        if (state.selectedRequest?.request_id === updatedRequest.request_id) {
          state.selectedRequest = updatedRequest;
        }
      })

      .addCase(bookRequest.fulfilled, (state, action) => {
        // Handle nested structure
        const result = action.payload.result || action.payload;
        const bookedRequest = result.data || result;
        const index = state.requests.findIndex(
          (r) => r.request_id === bookedRequest.request_id,
        );
        if (index !== -1) {
          state.requests[index] = bookedRequest;
        }
        if (state.selectedRequest?.request_id === bookedRequest.request_id) {
          state.selectedRequest = bookedRequest;
        }
      })

      .addCase(markRequestNotBooked.fulfilled, (state, action) => {
        // Handle nested structure
        const result = action.payload.result || action.payload;
        const notBookedRequest = result.data || result;
        const index = state.requests.findIndex(
          (r) => r.request_id === notBookedRequest.request_id,
        );
        if (index !== -1) {
          state.requests[index] = notBookedRequest;
        }
        if (state.selectedRequest?.request_id === notBookedRequest.request_id) {
          state.selectedRequest = notBookedRequest;
        }
      })

      .addCase(deleteRequest.fulfilled, (state, action) => {
        state.requests = state.requests.filter(
          (r) => r.request_id !== action.payload.requestId,
        );
        if (state.selectedRequest?.request_id === action.payload.requestId) {
          state.selectedRequest = null;
        }
      })

      // ============ QUOTES ============
      .addCase(fetchQuotes.pending, (state) => {
        state.quotesLoading = true;
        state.quotesError = null;
      })
      .addCase(fetchQuotes.fulfilled, (state, action) => {
        state.quotesLoading = false;
        // Handle nested structure: {success: true, result: {data: [...], meta: {...}}}
        const result = action.payload.result || action.payload;
        state.quotes = result.data || [];
        const meta = result.meta || {};
        state.quotesPagination = {
          page: meta.current_page || 1,
          limit: meta.per_page || 20,
          total: meta.total || 0,
        };
      })
      .addCase(fetchQuotes.rejected, (state, action) => {
        state.quotesLoading = false;
        state.quotesError = action.payload;
      })

      .addCase(fetchQuoteById.pending, (state) => {
        // Use separate loading state for details
        state.quoteDetailsLoading = true;
        state.quotesError = null;
      })
      .addCase(fetchQuoteById.fulfilled, (state, action) => {
        state.quoteDetailsLoading = false;
        // Handle nested structure: {success: true, result: {data: {...}}}
        const result = action.payload.result || action.payload;
        state.selectedQuote = result.data || result;
      })
      .addCase(fetchQuoteById.rejected, (state, action) => {
        state.quoteDetailsLoading = false;
        state.quotesError = action.payload;
      })

      .addCase(fetchQuotesForRequest.fulfilled, (state, action) => {
        // Handle nested structure
        const result = action.payload.result || action.payload;
        state.quotes = result.data || result;
      })

      .addCase(deleteQuote.fulfilled, (state, action) => {
        state.quotes = state.quotes.filter(
          (q) => q.quote_id !== action.payload.quoteId,
        );
        if (state.selectedQuote?.quote_id === action.payload.quoteId) {
          state.selectedQuote = null;
        }
      })

      // ============ ANALYTICS ============
      .addCase(fetchAnalytics.pending, (state) => {
        state.analyticsLoading = true;
        state.analyticsError = null;
      })
      .addCase(fetchAnalytics.fulfilled, (state, action) => {
        state.analyticsLoading = false;
        state.analytics = action.payload;
      })
      .addCase(fetchAnalytics.rejected, (state, action) => {
        state.analyticsLoading = false;
        state.analyticsError = action.payload;
      });
  },
});

export const {
  setClientSearch,
  setRequestStatus,
  setRequestSearch,
  setQuoteStatus,
  clearSelectedClient,
  clearSelectedRequest,
  clearSelectedQuote,
  resetFilters,
} = safariOfficeSlice.actions;

export default safariOfficeSlice.reducer;
