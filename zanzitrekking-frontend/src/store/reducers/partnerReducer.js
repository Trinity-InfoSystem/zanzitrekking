import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../../api/api";

export const get_partners = createAsyncThunk(
  "partner/get_partners",
  async (_, { fulfillWithValue, rejectWithValue }) => {
    try {
      const { data } = await api.get("/partners-active");
      return fulfillWithValue(data);
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      return rejectWithValue({ errorMessage });
    }
  },
);

const partnerSlice = createSlice({
  name: "partner",
  initialState: {
    partners: [],
    loader: false,
    errorMessage: "",
  },
  reducers: {
    clearMessage: (state) => {
      state.errorMessage = "";
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(get_partners.pending, (state) => {
        state.loader = true;
      })
      .addCase(get_partners.fulfilled, (state, { payload }) => {
        state.loader = false;

        // Handle different API response structures
        if (Array.isArray(payload)) {
          // If API returns array directly
          state.partners = payload;
        } else if (payload.partners && Array.isArray(payload.partners)) {
          // If API returns {partners: [...]}
          state.partners = payload.partners;
        } else if (payload.data && Array.isArray(payload.data)) {
          // If API returns {data: [...]}
          state.partners = payload.data;
        } else {
          state.partners = [];
        }
      })
      .addCase(get_partners.rejected, (state, { payload }) => {
        state.loader = false;
        state.errorMessage = payload?.errorMessage || "Failed to load partners";
      });
  },
});

export const { clearMessage } = partnerSlice.actions;
export default partnerSlice.reducer;
