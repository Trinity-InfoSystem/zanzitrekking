import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../../api/api";

// Async Thunks
export const getAllOrders = createAsyncThunk(
  "order/getAllOrders",
  async (
    { 
      parPage = 10, 
      currentPage = 1, 
      searchValue = "", 
      status = "", 
      paymentStatus = "",
      dateFrom = "",
      dateTo = "",
      sortBy = "createdAt",
      sortOrder = "desc"
    },
    { fulfillWithValue, rejectWithValue },
  ) => {
    try {
      const params = new URLSearchParams({
        page: currentPage,
        parPage,
        searchValue,
        status,
        paymentStatus,
        dateFrom,
        dateTo,
        sortBy,
        sortOrder
      });

      const { data } = await api.get(
        `/orders/admin/all?${params.toString()}`,
        { withCredentials: true },
      );
      return fulfillWithValue(data);
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.message;
      return rejectWithValue({ errorMessage });
    }
  },
);

export const getOrderById = createAsyncThunk(
  "order/getOrderById",
  async (orderId, { fulfillWithValue, rejectWithValue }) => {
    try {
      const { data } = await api.get(`/orders/${orderId}`, {
        withCredentials: true,
      });
      return fulfillWithValue(data);
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.message;
      return rejectWithValue({ errorMessage });
    }
  },
);

export const updateOrderStatus = createAsyncThunk(
  "order/updateOrderStatus",
  async ({ orderId, orderStatus, itemIndex, itemStatus }, { fulfillWithValue, rejectWithValue }) => {
    try {
      const { data } = await api.put(
        `/orders/${orderId}/status`,
        { orderStatus, itemIndex, itemStatus },
        { withCredentials: true },
      );
      return fulfillWithValue(data);
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.message;
      return rejectWithValue({ errorMessage });
    }
  },
);

export const updatePaymentStatus = createAsyncThunk(
  "order/updatePaymentStatus",
  async ({ orderId, paymentStatus, transactionId, cardLast4, cardBrand }, { fulfillWithValue, rejectWithValue }) => {
    try {
      const { data } = await api.put(
        `/orders/${orderId}/payment`,
        { paymentStatus, transactionId, cardLast4, cardBrand },
        { withCredentials: true },
      );
      return fulfillWithValue(data);
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.message;
      return rejectWithValue({ errorMessage });
    }
  },
);

export const cancelOrder = createAsyncThunk(
  "order/cancelOrder",
  async ({ orderId, cancellationReason, refundAmount }, { fulfillWithValue, rejectWithValue }) => {
    try {
      const { data } = await api.put(
        `/orders/${orderId}/cancel`,
        { cancellationReason, refundAmount },
        { withCredentials: true },
      );
      return fulfillWithValue(data);
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.message;
      return rejectWithValue({ errorMessage });
    }
  },
);

export const getOrderStatistics = createAsyncThunk(
  "order/getOrderStatistics",
  async (_, { fulfillWithValue, rejectWithValue }) => {
    try {
      const { data } = await api.get(`/orders/admin/statistics`, {
        withCredentials: true,
      });
      return fulfillWithValue(data);
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.message;
      return rejectWithValue({ errorMessage });
    }
  },
);

export const getCustomerOrderHistory = createAsyncThunk(
  "order/getCustomerOrderHistory",
  async ({ customerId, page = 1, parPage = 10, status = "" }, { fulfillWithValue, rejectWithValue }) => {
    try {
      const params = new URLSearchParams({
        page,
        parPage,
        status
      });

      const { data } = await api.get(
        `/orders/customer/${customerId}/history?${params.toString()}`,
        { withCredentials: true },
      );
      return fulfillWithValue(data);
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.message;
      return rejectWithValue({ errorMessage });
    }
  },
);

export const getCustomerOrderStatistics = createAsyncThunk(
  "order/getCustomerOrderStatistics",
  async (customerId, { fulfillWithValue, rejectWithValue }) => {
    try {
      const { data } = await api.get(`/orders/customer/${customerId}/statistics`, {
        withCredentials: true,
      });
      return fulfillWithValue(data);
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.message;
      return rejectWithValue({ errorMessage });
    }
  },
);

const orderSlice = createSlice({
  name: "order",
  initialState: {
    successMessage: "",
    errorMessage: "",
    loader: false,
    orders: [],
    totalOrders: 0,
    currentPage: 1,
    totalPages: 1,
    currentOrder: null,
    orderStatistics: null,
    customerOrderHistory: [],
    customerOrderStatistics: null,
    summary: {
      totalOrders: 0,
      totalRevenue: 0,
      pendingOrders: 0,
      completedOrders: 0,
    },
  },
  reducers: {
    clearOrderMessages: (state) => {
      state.successMessage = "";
      state.errorMessage = "";
    },
    clearCurrentOrder: (state) => {
      state.currentOrder = null;
    },
    clearCustomerOrderData: (state) => {
      state.customerOrderHistory = [];
      state.customerOrderStatistics = null;
    },
  },
  extraReducers: (builder) => {
    // Get All Orders
    builder.addCase(getAllOrders.pending, (state) => {
      state.loader = true;
    });
    builder.addCase(getAllOrders.fulfilled, (state, { payload }) => {
      state.loader = false;
      state.orders = payload.orders;
      state.totalOrders = payload.pagination.totalDocs;
      state.currentPage = payload.pagination.page;
      state.totalPages = payload.pagination.totalPages;
      state.summary = payload.summary;
    });
    builder.addCase(getAllOrders.rejected, (state, { payload }) => {
      state.loader = false;
      state.errorMessage = payload?.errorMessage || "Failed to fetch orders";
    });

    // Get Single Order
    builder.addCase(getOrderById.pending, (state) => {
      state.loader = true;
    });
    builder.addCase(getOrderById.fulfilled, (state, { payload }) => {
      state.loader = false;
      state.currentOrder = payload.order;
    });
    builder.addCase(getOrderById.rejected, (state, { payload }) => {
      state.loader = false;
      state.errorMessage = payload?.errorMessage || "Failed to fetch order";
    });

    // Update Order Status
    builder.addCase(updateOrderStatus.pending, (state) => {
      state.loader = true;
    });
    builder.addCase(updateOrderStatus.fulfilled, (state, { payload }) => {
      state.loader = false;
      state.successMessage = payload.message;
      state.currentOrder = payload.order;
      // Update the order in the orders list if it exists
      const orderIndex = state.orders.findIndex(order => order._id === payload.order._id);
      if (orderIndex !== -1) {
        state.orders[orderIndex] = payload.order;
      }
    });
    builder.addCase(updateOrderStatus.rejected, (state, { payload }) => {
      state.loader = false;
      state.errorMessage = payload?.errorMessage || "Failed to update order status";
    });

    // Update Payment Status
    builder.addCase(updatePaymentStatus.pending, (state) => {
      state.loader = true;
    });
    builder.addCase(updatePaymentStatus.fulfilled, (state, { payload }) => {
      state.loader = false;
      state.successMessage = payload.message;
      state.currentOrder = payload.order;
      // Update the order in the orders list if it exists
      const orderIndex = state.orders.findIndex(order => order._id === payload.order._id);
      if (orderIndex !== -1) {
        state.orders[orderIndex] = payload.order;
      }
    });
    builder.addCase(updatePaymentStatus.rejected, (state, { payload }) => {
      state.loader = false;
      state.errorMessage = payload?.errorMessage || "Failed to update payment status";
    });

    // Cancel Order
    builder.addCase(cancelOrder.pending, (state) => {
      state.loader = true;
    });
    builder.addCase(cancelOrder.fulfilled, (state, { payload }) => {
      state.loader = false;
      state.successMessage = payload.message;
      state.currentOrder = payload.order;
      // Update the order in the orders list if it exists
      const orderIndex = state.orders.findIndex(order => order._id === payload.order._id);
      if (orderIndex !== -1) {
        state.orders[orderIndex] = payload.order;
      }
    });
    builder.addCase(cancelOrder.rejected, (state, { payload }) => {
      state.loader = false;
      state.errorMessage = payload?.errorMessage || "Failed to cancel order";
    });

    // Get Order Statistics
    builder.addCase(getOrderStatistics.pending, (state) => {
      state.loader = true;
    });
    builder.addCase(getOrderStatistics.fulfilled, (state, { payload }) => {
      state.loader = false;
      state.orderStatistics = payload.statistics;
    });
    builder.addCase(getOrderStatistics.rejected, (state, { payload }) => {
      state.loader = false;
      state.errorMessage = payload?.errorMessage || "Failed to fetch order statistics";
    });

    // Get Customer Order History
    builder.addCase(getCustomerOrderHistory.pending, (state) => {
      state.loader = true;
    });
    builder.addCase(getCustomerOrderHistory.fulfilled, (state, { payload }) => {
      state.loader = false;
      state.customerOrderHistory = payload.orders;
      state.totalOrders = payload.pagination.totalDocs;
      state.currentPage = payload.pagination.page;
      state.totalPages = payload.pagination.totalPages;
    });
    builder.addCase(getCustomerOrderHistory.rejected, (state, { payload }) => {
      state.loader = false;
      state.errorMessage = payload?.errorMessage || "Failed to fetch customer order history";
    });

    // Get Customer Order Statistics
    builder.addCase(getCustomerOrderStatistics.pending, (state) => {
      state.loader = true;
    });
    builder.addCase(getCustomerOrderStatistics.fulfilled, (state, { payload }) => {
      state.loader = false;
      state.customerOrderStatistics = payload;
    });
    builder.addCase(getCustomerOrderStatistics.rejected, (state, { payload }) => {
      state.loader = false;
      state.errorMessage = payload?.errorMessage || "Failed to fetch customer order statistics";
    });
  },
});

export const { clearOrderMessages, clearCurrentOrder, clearCustomerOrderData } =
  orderSlice.actions;
export default orderSlice.reducer; 