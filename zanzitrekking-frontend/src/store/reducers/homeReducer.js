import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../../api/api";

// Thunk for getting categories
export const get_category = createAsyncThunk(
  "home/get_category",
  async (_, { fulfillWithValue, rejectWithValue }) => {
    try {
      const { data } = await api.get("/home/get-categories");

      return fulfillWithValue(data);
    } catch (error) {
      const errorMessage = error?.response?.data.message || error.message;
      return rejectWithValue({ errorMessage });
    }
  },
);
export const get_products = createAsyncThunk(
  "home/get_products",
  async (_, { fulfillWithValue, rejectWithValue }) => {
    try {
      const { data } = await api.get("/home/get-products");

      return fulfillWithValue(data);
    } catch (error) {
      const errorMessage = error?.response?.data.message || error.message;
      return rejectWithValue(errorMessage);
    }
  },
);

export const price_range_products = createAsyncThunk(
  "home/price_range_products",
  async (_, { fulfillWithValue, rejectWithValue }) => {
    try {
      const { data } = await api.get("/home/price-range-latest-product");

      return fulfillWithValue(data);
    } catch (error) {
      const errorMessage = error?.response?.data.message || error.message;
      return rejectWithValue(errorMessage);
    }
  },
);

export const get_statistic_data = createAsyncThunk(
  "home/get_statistic_data",
  async (_, { fulfillWithValue, rejectWithValue }) => {
    try {
      const { data } = await api.get("/home/get-statistic-data");

      return fulfillWithValue(data);
    } catch (error) {
      const errorMessage = error?.response?.data.message || error.message;
      return rejectWithValue(errorMessage);
    }
  },
);
export const query_products = createAsyncThunk(
  "home/query_products",
  async (query, { fulfillWithValue, rejectWithValue }) => {
    try {
      const { data } = await api.get(
        `/home/query-products?category=${query.category}&&rating=${query.rating}&&lowPrice=${query.low}&&highPrice=${query.high}&&sort=${query.sort}&&pageNumber=${query.pageNumber}&&searchValue=${query.searchValue ? query.searchValue : ""}`,
      );

      return fulfillWithValue(data);
    } catch (error) {
      const errorMessage = error?.response?.data.message || error.message;
      return rejectWithValue(errorMessage);
    }
  },
);
export const product_details = createAsyncThunk(
  "home/product_details",
  async (productId, { fulfillWithValue, rejectWithValue }) => {
    try {
      const { data } = await api.get(`/home/product-details/${productId}`);

      return fulfillWithValue(data);
    } catch (error) {
      const errorMessage = error?.response?.data.message || error.message;
      return rejectWithValue(errorMessage);
    }
  },
);

// Thunk for getting achievements
export const get_achievements = createAsyncThunk(
  "home/get_achievements",
  async (type, { fulfillWithValue, rejectWithValue }) => {
    try {
      const url = type ? `/achievements-active?type=${type}` : "/achievements-active";
      const { data } = await api.get(url);
      return fulfillWithValue(data);
    } catch (error) {
      const errorMessage = error?.response?.data?.error || error.message;
      return rejectWithValue({ errorMessage });
    }
  },
);

// Thunk for getting impact stats
export const get_impact_stats = createAsyncThunk(
  "home/get_impact_stats",
  async (_, { fulfillWithValue, rejectWithValue }) => {
    try {
      const { data } = await api.get("/impact-stats-active");
      return fulfillWithValue(data);
    } catch (error) {
      const errorMessage = error?.response?.data?.error || error.message;
      return rejectWithValue({ errorMessage });
    }
  },
);

// Thunk for getting clients
export const get_clients = createAsyncThunk(
  "home/get_clients",
  async (_, { fulfillWithValue, rejectWithValue }) => {
    try {
      const { data } = await api.get("/clients-active");
      return fulfillWithValue(data);
    } catch (error) {
      const errorMessage = error?.response?.data?.error || error.message;
      return rejectWithValue({ errorMessage });
    }
  },
);
// Slice for home management
export const homeReducer = createSlice({
  name: "home",
  initialState: {
    categories: [],
    totalTrips: 0,
    products: [],
    latest_product: [],
    top_rated_product: [],
    discount_product: [],
    totalProducts: 0,
    parpage: 3,
    errorMessage: "",
    successMessage: "",
    loading: false,
    priceRange: {
      low: 0,
      high: 0,
    },
    product: {},
    statisticData: {},
    achievements: [],
    impactStats: [],
    clients: [],
  },
  reducers: {
    clearMessage(state) {
      state.errorMessage = "";
      state.successMessage = "";
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(get_category.fulfilled, (state, { payload }) => {
        // Sort categories alphabetically by name
        const sortedCategories = [...payload.categories].sort((a, b) => {
          const nameA = (a.name || "").toLowerCase();
          const nameB = (b.name || "").toLowerCase();
          if (nameA < nameB) {return -1;}
          if (nameA > nameB) {return 1;}
          return 0;
        });
        state.categories = sortedCategories;
        state.totalCategory = payload.totalCategory;
        // Store total trips count from backend
        state.totalTrips = payload.totalTrips || 0;
      })
      .addCase(get_category.rejected, (state, { payload }) => {
        state.errorMessage = payload.error;
      });
    builder
      .addCase(get_products.fulfilled, (state, { payload }) => {
        state.products = payload.products;
        state.totalProducts = payload.totalProducts;
        state.top_rated_product = payload.top_rated_product;
        state.discount_product = payload.discount_product;
        state.latest_product = payload.latest_product;
      })
      .addCase(get_products.rejected, (state, { payload }) => {
        state.errorMessage = payload.errorMessage;
      });
    builder
      .addCase(price_range_products.fulfilled, (state, { payload }) => {
        state.latest_product = payload.latest_product;
        state.priceRange = payload.priceRange;
      })
      .addCase(price_range_products.rejected, (state, { payload }) => {
        state.errorMessage = payload.errorMessage;
      });
    builder
      .addCase(query_products.fulfilled, (state, { payload }) => {
        state.totalProducts = payload.totalProducts;
        state.products = payload.result;
        state.parpage = payload.parPage;
      })
      .addCase(query_products.rejected, (state, { payload }) => {
        state.errorMessage = payload.errorMessage;
      });
    builder
      .addCase(product_details.fulfilled, (state, { payload }) => {
        state.product = payload.product;
      })
      .addCase(product_details.rejected, (state, { payload }) => {
        state.errorMessage = payload.errorMessage;
      });
    builder
      .addCase(get_statistic_data.fulfilled, (state, { payload }) => {
        state.statisticData = payload.statisticData;
      })
      .addCase(get_statistic_data.rejected, (state, { payload }) => {
        state.errorMessage = payload.errorMessage;
      });
    builder
      .addCase(get_achievements.fulfilled, (state, { payload }) => {
        state.achievements = payload.achievements || [];
      })
      .addCase(get_achievements.rejected, (state, { payload }) => {
        state.errorMessage = payload?.errorMessage || "Failed to load achievements";
      });
    builder
      .addCase(get_impact_stats.fulfilled, (state, { payload }) => {
        state.impactStats = payload.impactStats || [];
      })
      .addCase(get_impact_stats.rejected, (state, { payload }) => {
        state.errorMessage = payload?.errorMessage || "Failed to load impact stats";
      });
    builder
      .addCase(get_clients.fulfilled, (state, { payload }) => {
        state.clients = payload.clients || [];
      })
      .addCase(get_clients.rejected, (state, { payload }) => {
        state.errorMessage = payload?.errorMessage || "Failed to load clients";
      });
  },
});

export default homeReducer.reducer;
export const { clearMessage } = homeReducer.actions;
