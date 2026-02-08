import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../../api/api";

export const get_dashboard_index_data = createAsyncThunk(
  "dashboard/get_dashboard_index_data",
  async (userId, { fulfillWithValue, rejectWithValue }) => {
    try {
      const { data } = await api.get(
        `/home/customer/get-dashboard-data/${userId}`,
      );
      return fulfillWithValue(data);
    } catch (error) {
      const errorMessage = error?.response?.data?.error || error.message;
      return rejectWithValue({ errorMessage });
    }
  },
);

export const get_customer_order_statistics = createAsyncThunk(
  "dashboard/get_customer_order_statistics",
  async (customerId, { fulfillWithValue, rejectWithValue }) => {
    try {
      const { data } = await api.get(
        `/orders/customer/${customerId}/statistics`,
        { withCredentials: true },
      );
      return fulfillWithValue(data);
    } catch (error) {
      const errorMessage = error?.response?.data?.error || error.message;
      return rejectWithValue({ errorMessage });
    }
  },
);

export const dashboardReducer = createSlice({
  name: "dashboard",
  initialState: {
    recentOrders: [],
    errorMessage: "",
    successMessage: "",
    totalOrders: 0,
    cancelledOrders: 0,
    pendingOrders: 0,
    orderStatistics: null,
    statisticsLoader: false,
  },
  reducers: {
    clearMessage(state) {
      state.errorMessage = "";
      state.successMessage = "";
    },
  },
  extraReducers: (builder) => {
    builder.addCase(get_dashboard_index_data.rejected, (state, { payload }) => {
      state.errorMessage = payload.errorMessage;
    });
    builder.addCase(
      get_dashboard_index_data.fulfilled,
      (state, { payload }) => {
        state.recentOrders = payload.recentOrders;
        state.totalOrders = payload.totalOrders;
        state.cancelledOrders = payload.cancelledOrders;
        state.pendingOrders = payload.pendingOrders;
      },
    );
  },
});
export const { clearMessage } = dashboardReducer.actions;
export default dashboardReducer.reducer;
