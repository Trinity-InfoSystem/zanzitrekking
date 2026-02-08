import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../../api/api";

export const fetch_banner = createAsyncThunk(
  "banner/fetch_banner",
  async (_, { fulfillWithValue, rejectWithValue }) => {
    try {
      const { data } = await api.get("/banner-get", { withCredentials: true });
      return fulfillWithValue(data);
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
