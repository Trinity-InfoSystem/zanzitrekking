import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { dashboardAPI } from "../../api/dashboardAPI";

// Async thunks
export const fetchDashboardStats = createAsyncThunk(
  "dashboard/fetchStats",
  async (_, { rejectWithValue }) => {
    try {
      const response = await dashboardAPI.getDashboardStats();
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch dashboard statistics",
      );
    }
  },
);

export const fetchRecentOrders = createAsyncThunk(
  "dashboard/fetchRecentOrders",
  async (_, { rejectWithValue }) => {
    try {
      const response = await dashboardAPI.getRecentOrders();
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch recent orders",
      );
    }
  },
);

const dashboardSlice = createSlice({
  name: "dashboard",
  initialState: {
    stats: {
      totalRevenue: {
        value: 0,
        formatted: "$0",
        change: "0% from last month",
        changeType: "neutral",
      },
      activeTrips: {
        value: 0,
        formatted: "0",
        change: "Live count",
        changeType: "neutral",
      },
      totalCustomers: {
        value: 0,
        formatted: "0",
        change: "Total registered",
        changeType: "neutral",
      },
      totalPayments: {
        value: 0,
        formatted: "0",
        change: "0 pending",
        changeType: "neutral",
      },
      chartData: {
        months: [
          "Jan",
          "Feb",
          "Mar",
          "Apr",
          "May",
          "Jun",
          "Jul",
          "Aug",
          "Sep",
          "Oct",
          "Nov",
          "Dec",
        ],
        revenue: [],
        orders: [],
        customers: [],
      },
      summary: {
        totalOrders: 0,
        pendingPayments: 0,
        completedPayments: 0,
        currentMonthRevenue: 0,
        lastMonthRevenue: 0,
      },
    },
    recentOrders: [],
    loading: {
      stats: false,
      orders: false,
    },
    error: {
      stats: null,
      orders: null,
    },
  },
  reducers: {
    clearDashboardError: (state, action) => {
      const { type } = action.payload;
      state.error[type] = null;
    },
    resetDashboard: (state) => {
      state.stats = {
        totalRevenue: {
          value: 0,
          formatted: "$0",
          change: "0% from last month",
          changeType: "neutral",
        },
        activeTrips: {
          value: 0,
          formatted: "0",
          change: "Live count",
          changeType: "neutral",
        },
        totalCustomers: {
          value: 0,
          formatted: "0",
          change: "Total registered",
          changeType: "neutral",
        },
        totalPayments: {
          value: 0,
          formatted: "0",
          change: "0 pending",
          changeType: "neutral",
        },
        chartData: {
          months: [
            "Jan",
            "Feb",
            "Mar",
            "Apr",
            "May",
            "Jun",
            "Jul",
            "Aug",
            "Sep",
            "Oct",
            "Nov",
            "Dec",
          ],
          revenue: [],
          orders: [],
          customers: [],
        },
        summary: {
          totalOrders: 0,
          pendingPayments: 0,
          completedPayments: 0,
          currentMonthRevenue: 0,
          lastMonthRevenue: 0,
        },
      };
      state.recentOrders = [];
      state.loading = { stats: false, orders: false };
      state.error = { stats: null, orders: null };
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Dashboard Stats
      .addCase(fetchDashboardStats.pending, (state) => {
        state.loading.stats = true;
        state.error.stats = null;
      })
      .addCase(fetchDashboardStats.fulfilled, (state, action) => {
        state.loading.stats = false;
        state.stats = action.payload;
        state.error.stats = null;
      })
      .addCase(fetchDashboardStats.rejected, (state, action) => {
        state.loading.stats = false;
        state.error.stats = action.payload;
      })
      // Fetch Recent Orders
      .addCase(fetchRecentOrders.pending, (state) => {
        state.loading.orders = true;
        state.error.orders = null;
      })
      .addCase(fetchRecentOrders.fulfilled, (state, action) => {
        state.loading.orders = false;
        state.recentOrders = action.payload;
        state.error.orders = null;
      })
      .addCase(fetchRecentOrders.rejected, (state, action) => {
        state.loading.orders = false;
        state.error.orders = action.payload;
      });
  },
});

export const { clearDashboardError, resetDashboard } = dashboardSlice.actions;
export default dashboardSlice.reducer;
