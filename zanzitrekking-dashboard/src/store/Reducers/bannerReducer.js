import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../../api/api";

// Create async thunk for creating a banner
export const create_banner = createAsyncThunk(
  "banner/create_banner",
  async (banner, { rejectWithValue }) => {
    try {
      const response = await api.post("/create-banner", banner, {
        withCredentials: true,
      });
      return response.data; // Return the data directly
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      return rejectWithValue(errorMessage); // Return the error message
    }
  },
);
export const update_banner = createAsyncThunk(
  "banner/update_banner",
  async (banner, { rejectWithValue }) => {
    try {
      const response = await api.post("/update-banner", banner, {
        withCredentials: true,
      });
      return response.data; // Return the data directly
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      return rejectWithValue(errorMessage); // Return the error message
    }
  },
);
export const fetch_banner = createAsyncThunk(
  "banner/fetch_banner",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/banner-get", { withCredentials: true });
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      return rejectWithValue(errorMessage);
    }
  },
);
// Create the banner slice
export const bannerSlice = createSlice({
  name: "banner",
  initialState: {
    banner: null,
    successMessage: "",
    errorMessage: "",
    loader: false,
  },
  reducers: {
    clearMessage: (state) => {
      return { ...state, successMessage: "", errorMessage: "" };
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(create_banner.pending, (state) => {
        state.loader = true; // Set loader to true when pending
      })
      .addCase(create_banner.fulfilled, (state, { payload }) => {
        state.loader = false; // Set loader to false on success
        state.banner = payload.banner; // Assuming payload is the new banner data
        state.successMessage = payload.message;
      })
      .addCase(create_banner.rejected, (state, { payload }) => {
        state.loader = false; // Set loader to false on error
        state.errorMessage = payload.errorMessage; // Set the error message
      })
      .addCase(update_banner.pending, (state) => {
        state.loader = true; // Set loader to true when pending
      })
      .addCase(update_banner.fulfilled, (state, { payload }) => {
        state.loader = false; // Set loader to false on success
        state.banner = payload.banner; // Assuming payload is the new banner data
        state.successMessage = payload.message;
      })
      .addCase(update_banner.rejected, (state, { payload }) => {
        state.loader = false; // Set loader to false on error
        state.errorMessage = payload.errorMessage; // Set the error message
      })
      .addCase(fetch_banner.fulfilled, (state, { payload }) => {
        state.banner = payload.banner;
      })
      .addCase(fetch_banner.rejected, (state, { payload }) => {
        state.errorMessage = payload.errorMessage;
      });
  },
});

// Export actions and reducer
export const { clearMessage } = bannerSlice.actions;
export default bannerSlice.reducer;
