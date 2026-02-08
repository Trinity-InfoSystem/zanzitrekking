import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../../api/api";

// Action to get all PDFs
export const getPdfs = createAsyncThunk(
  "pdf/getPdfs",
  async (_, { fulfillWithValue, rejectWithValue }) => {
    try {
      const { data } = await api.get("/pdfs-get", {
        withCredentials: true,
      });
      return fulfillWithValue(data);
    } catch (error) {
      const errorMessage = error?.response?.data?.error || error.message;
      return rejectWithValue({ errorMessage });
    }
  },
);

// PDF Reducer
export const pdfReducer = createSlice({
  name: "pdf",
  initialState: {
    successMessage: "",
    errorMessage: "",
    loader: false,
    pdfs: [],
  },
  reducers: {
    clearMessage: (state) => {
      state.errorMessage = "";
      state.successMessage = "";
    },
  },
  extraReducers: (builder) => {
    // Upload PDF

    // Get PDFs
    builder
      .addCase(getPdfs.pending, (state) => {
        state.loader = true;
      })
      .addCase(getPdfs.fulfilled, (state, { payload }) => {
        state.loader = false;
        state.pdfs = payload.pdfs;
      })
      .addCase(getPdfs.rejected, (state, { payload }) => {
        state.loader = false;
        state.errorMessage = payload.errorMessage;
      });
  },
});

export const { clearMessage } = pdfReducer.actions;
export default pdfReducer.reducer;
