import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../../api/api";

// Async Thunks
export const createOrder = createAsyncThunk(
  "order/createOrder",
  async (orderData, { fulfillWithValue, rejectWithValue }) => {
    try {
      const { data } = await api.post(
        "/orders/create",
        orderData,
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

export const getCustomerOrderHistory = createAsyncThunk(
  "order/getCustomerOrderHistory",
  async ({ customerId, page = 1, parPage = 10, status = "" }, { fulfillWithValue, rejectWithValue }) => {
    try {
      const params = new URLSearchParams({
        page,
        parPage,
        status,
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

const orderSlice = createSlice({
  name: "order",
  initialState: {
    successMessage: "",
    errorMessage: "",
    loader: false,
    currentOrder: null,
    orderHistory: [],
    orderStatistics: null,
    totalOrders: 0,
    currentPage: 1,
    totalPages: 1,
    orderCreationStatus: "idle", // idle, loading, success, failed
  },
  reducers: {
    clearOrderMessages: (state) => {
      state.successMessage = "";
      state.errorMessage = "";
    },
    clearCurrentOrder: (state) => {
      state.currentOrder = null;
    },
    clearOrderHistory: (state) => {
      state.orderHistory = [];
      state.orderStatistics = null;
    },
    resetOrderCreationStatus: (state) => {
      state.orderCreationStatus = "idle";
    },
  },
  extraReducers: (builder) => {
    // Create Order
    builder.addCase(createOrder.pending, (state) => {
      state.loader = true;
      state.orderCreationStatus = "loading";
    });
    builder.addCase(createOrder.fulfilled, (state, { payload }) => {
      state.loader = false;
      state.successMessage = payload.message;
      state.currentOrder = payload.order;
      state.orderCreationStatus = "success";
    });
    builder.addCase(createOrder.rejected, (state, { payload }) => {
      state.loader = false;
      state.errorMessage = payload?.errorMessage || "Failed to create order";
      state.orderCreationStatus = "failed";
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

    // Get Customer Order History
    builder.addCase(getCustomerOrderHistory.pending, (state) => {
      state.loader = true;
    });
    builder.addCase(getCustomerOrderHistory.fulfilled, (state, { payload }) => {
      state.loader = false;
      state.orderHistory = payload.orders;
      state.totalOrders = payload.pagination.totalDocs;
      state.currentPage = payload.pagination.page;
      state.totalPages = payload.pagination.totalPages;
    });
    builder.addCase(getCustomerOrderHistory.rejected, (state, { payload }) => {
      state.loader = false;
      state.errorMessage = payload?.errorMessage || "Failed to fetch order history";
    });

    // Get Customer Order Statistics
    builder.addCase(getCustomerOrderStatistics.pending, (state) => {
      state.loader = true;
    });
    builder.addCase(getCustomerOrderStatistics.fulfilled, (state, { payload }) => {
      state.loader = false;
      state.orderStatistics = payload;
    });
    builder.addCase(getCustomerOrderStatistics.rejected, (state, { payload }) => {
      state.loader = false;
      state.errorMessage = payload?.errorMessage || "Failed to fetch order statistics";
    });

    // Update Order Status
    builder.addCase(updateOrderStatus.pending, (state) => {
      state.loader = true;
    });
    builder.addCase(updateOrderStatus.fulfilled, (state, { payload }) => {
      state.loader = false;
      state.successMessage = payload.message;
      state.currentOrder = payload.order;
      // Update the order in the history list if it exists
      const orderIndex = state.orderHistory.findIndex(order => order._id === payload.order._id);
      if (orderIndex !== -1) {
        state.orderHistory[orderIndex] = payload.order;
      }
    });
    builder.addCase(updateOrderStatus.rejected, (state, { payload }) => {
      state.loader = false;
      state.errorMessage = payload?.errorMessage || "Failed to update order status";
    });

    // Cancel Order
    builder.addCase(cancelOrder.pending, (state) => {
      state.loader = true;
    });
    builder.addCase(cancelOrder.fulfilled, (state, { payload }) => {
      state.loader = false;
      state.successMessage = payload.message;
      state.currentOrder = payload.order;
      // Update the order in the history list if it exists
      const orderIndex = state.orderHistory.findIndex(order => order._id === payload.order._id);
      if (orderIndex !== -1) {
        state.orderHistory[orderIndex] = payload.order;
      }
    });
    builder.addCase(cancelOrder.rejected, (state, { payload }) => {
      state.loader = false;
      state.errorMessage = payload?.errorMessage || "Failed to cancel order";
    });
  },
});

export const { 
  clearOrderMessages, 
  clearCurrentOrder, 
  clearOrderHistory, 
  resetOrderCreationStatus, 
} = orderSlice.actions;

export default orderSlice.reducer;
