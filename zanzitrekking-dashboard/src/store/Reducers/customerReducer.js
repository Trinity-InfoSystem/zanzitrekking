import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../../api/api";

// Async Thunks
export const getCustomers = createAsyncThunk(
  "customer/getCustomers",
  async (
    { parPage = 5, currentPage = 1, searchValue = "", sort = "newest-desc" },
    { fulfillWithValue, rejectWithValue },
  ) => {
    try {
      const { data } = await api.get(
        `/customer?page=${currentPage}&searchValue=${searchValue}&parPage=${parPage}&sort=${sort}`,
        { withCredentials: true },
      );
      return fulfillWithValue(data);
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.message;
      return rejectWithValue({ errorMessage });
    }
  },
);

export const getCustomer = createAsyncThunk(
  "customer/getCustomer",
  async (customerId, { fulfillWithValue, rejectWithValue }) => {
    try {
      const { data } = await api.get(`/customer/${customerId}`, {
        withCredentials: true,
      });
      return fulfillWithValue(data);
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.message;
      return rejectWithValue({ errorMessage });
    }
  },
);

export const getAllCustomers = createAsyncThunk(
  "customer/getAllCustomers",
  async ({ fulfillWithValue, rejectWithValue }) => {
    try {
      const { data } = await api.get(`/customer/all`, {
        withCredentials: true,
      });
      return fulfillWithValue(data);
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.message;
      return rejectWithValue({ errorMessage });
    }
  },
);

const customerSlice = createSlice({
  name: "customer",
  initialState: {
    successMessage: "",
    errorMessage: "",
    loader: false,
    customers: [],
    totalCustomers: 0,
    currentPage: 1,
    totalPages: 1,
    currentCustomer: null,
    allCustomers: [],
  },
  reducers: {
    clearCustomerMessages: (state) => {
      state.successMessage = "";
      state.errorMessage = "";
    },
    clearCurrentCustomer: (state) => {
      state.currentCustomer = null;
    },
  },
  extraReducers: (builder) => {
    // Get Customers
    builder.addCase(getCustomers.pending, (state) => {
      state.loader = true;
    });
    builder.addCase(getCustomers.fulfilled, (state, { payload }) => {
      state.loader = false;
      state.customers = payload.customers;
      state.totalCustomers = payload.pagination.totalDocs;
      state.currentPage = payload.pagination.page;
      state.totalPages = payload.pagination.totalPages;
    });
    builder.addCase(getCustomers.rejected, (state, { payload }) => {
      state.loader = false;
      state.errorMessage = payload?.errorMessage || "Failed to fetch customers";
    });

    // Get Single Customer
    builder.addCase(getCustomer.pending, (state) => {
      state.loader = true;
    });
    builder.addCase(getCustomer.fulfilled, (state, { payload }) => {
      state.loader = false;
      state.currentCustomer = payload.customer;
    });
    builder.addCase(getCustomer.rejected, (state, { payload }) => {
      state.loader = false;
      state.errorMessage = payload?.errorMessage || "Failed to fetch customer";
    });

    // Get Single Customer
    builder.addCase(getAllCustomers.pending, (state) => {
      state.loader = true;
    });
    builder.addCase(getAllCustomers.fulfilled, (state, { payload }) => {
      state.loader = false;
      state.allCustomers = payload.customers;
    });
    builder.addCase(getAllCustomers.rejected, (state, { payload }) => {
      state.loader = false;
      state.errorMessage = payload?.errorMessage || "Failed to fetch customer";
    });
  },
});

export const { clearCustomerMessages, clearCurrentCustomer } =
  customerSlice.actions;
export default customerSlice.reducer;
