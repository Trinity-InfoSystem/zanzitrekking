import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../../api/api";

// Newsletter subscription thunk
export const subscribe_newsletter = createAsyncThunk(
  "newsletter/subscribe",
  async (
    { email, subscriptionSource = "website" },
    { fulfillWithValue, rejectWithValue },
  ) => {
    try {
      const { data } = await api.post(
        "/newsletter/subscribe",
        { email, subscriptionSource },
        { withCredentials: true },
      );
      return fulfillWithValue(data);
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      return rejectWithValue({ errorMessage });
    }
  },
);

const newsletterReducer = createSlice({
  name: "newsletter",
  initialState: {
    successMessage: "",
    errorMessage: "",
    loader: false,
    subscription: null,
  },
  reducers: {
    clearNewsletterMessage: (state) => {
      state.successMessage = "";
      state.errorMessage = "";
    },
    resetSubscription: (state) => {
      state.subscription = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(subscribe_newsletter.pending, (state) => {
        state.loader = true;
      })
      .addCase(subscribe_newsletter.fulfilled, (state, { payload }) => {
        state.loader = false;
        state.successMessage = payload.message;
        state.subscription = payload.subscription;
      })
      .addCase(subscribe_newsletter.rejected, (state, { payload }) => {
        state.loader = false;
        state.errorMessage = payload.errorMessage;
      });
  },
});

export const { clearNewsletterMessage, resetSubscription } = newsletterReducer.actions;
export default newsletterReducer.reducer;