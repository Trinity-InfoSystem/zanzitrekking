import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../../api/api";

export const get_whoWeAre = createAsyncThunk(
  "whoWeAre/get_whoWeAre",
  async (_, { fulfillWithValue, rejectWithValue }) => {
    try {
      const { data } = await api.get("/whoWeAre-get");

      return fulfillWithValue(data);
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      return rejectWithValue({ errorMessage });
    }
  },
);

export const whoWeAreReducer = createSlice({
  name: "whoWeAre",
  initialState: {
    successMessage: "",
    errorMessage: "",
    loader: false,

    whoWeAre: {},
  },
  reducers: {
    clearMessage(state) {
      state.errorMessage = "";
      state.successMessage = "";
    },
  },
  extraReducers: (builder) => {
    builder.addCase(get_whoWeAre.pending, (state, { payload }) => {
      state.loader = true;
    });
    builder.addCase(get_whoWeAre.fulfilled, (state, { payload }) => {
      state.loader = false;
      state.whoWeAre = payload.whoWeAre;
    });
    builder.addCase(get_whoWeAre.rejected, (state, { payload }) => {
      state.loader = false;
      state.errorMessage = payload.errorMessage;
    });
  },
});
export const { clearMessage } = whoWeAreReducer.actions;
export default whoWeAreReducer.reducer;
