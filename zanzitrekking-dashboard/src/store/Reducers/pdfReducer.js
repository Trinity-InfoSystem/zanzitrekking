import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../../api/api";

// Action to upload PDF
export const uploadPdfs = createAsyncThunk(
  "pdf/uploadPdfs",
  async (formData, { fulfillWithValue, rejectWithValue }) => {
    try {
      const { data } = await api.post("/pdf-add", formData, {
        withCredentials: true,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return fulfillWithValue(data);
    } catch (error) {
      const errorMessage = error?.response?.data?.error || error.message;
      return rejectWithValue({ errorMessage });
    }
  },
);

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

// Action to delete PDF
export const deletePdfs = createAsyncThunk(
  "pdf/deletePdfs",
  async (pdfId, { fulfillWithValue, rejectWithValue }) => {
    try {
      const { data } = await api.delete(`/pdf-delete/${pdfId}`, {
        withCredentials: true,
      });
      return fulfillWithValue({ ...data, deletedPdfId: pdfId });
    } catch (error) {
      const errorMessage = error?.response?.data?.error || error.message;
      return rejectWithValue({ errorMessage });
    }
  },
);

// Action to update PDF
export const updatePdfs = createAsyncThunk(
  "pdf/updatePdfs",
  async ({ formData, pdfId }, { fulfillWithValue, rejectWithValue }) => {
    try {
      const { data } = await api.put(`/pdf-update/${pdfId}`, formData, {
        withCredentials: true,
        headers: {
          "Content-Type": "multipart/form-data",
        },
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
    builder
      .addCase(uploadPdfs.pending, (state) => {
        state.loader = true;
      })
      .addCase(uploadPdfs.fulfilled, (state, { payload }) => {
        state.loader = false;
        state.successMessage = "Document uploaded successfully";
        const existingIndex = state.pdfs.findIndex(
          (pdf) => pdf.type === payload.pdf.type,
        );
        if (existingIndex !== -1) {
          state.pdfs[existingIndex] = payload.pdf;
        } else {
          state.pdfs.push(payload.pdf);
        }
      })
      .addCase(uploadPdfs.rejected, (state, { payload }) => {
        state.loader = false;
        state.errorMessage = payload.errorMessage;
      });

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

    // Delete PDF
    builder
      .addCase(deletePdfs.pending, (state) => {
        state.loader = true;
      })
      .addCase(deletePdfs.fulfilled, (state, { payload }) => {
        state.loader = false;
        state.successMessage = "Document deleted successfully";
        state.pdfs = state.pdfs.filter(
          (pdf) => pdf._id !== payload.deletedPdfId,
        );
      })
      .addCase(deletePdfs.rejected, (state, { payload }) => {
        state.loader = false;
        state.errorMessage = payload.errorMessage;
      });

    // Update PDF
    builder
      .addCase(updatePdfs.pending, (state) => {
        state.loader = true;
      })
      .addCase(updatePdfs.fulfilled, (state, { payload }) => {
        state.loader = false;
        state.successMessage = "Document updated successfully";
        const index = state.pdfs.findIndex(
          (pdf) => pdf._id === payload.pdf._id,
        );
        if (index !== -1) {
          state.pdfs[index] = payload.pdf;
        }
      })
      .addCase(updatePdfs.rejected, (state, { payload }) => {
        state.loader = false;
        state.errorMessage = payload.errorMessage;
      });
  },
});

export const { clearMessage } = pdfReducer.actions;
export default pdfReducer.reducer;
