import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../../api/api";

export const apply_to_job = createAsyncThunk(
  "jobApplication/apply_to_job",
  async ({ jobId, formData }, { fulfillWithValue, rejectWithValue }) => {
    try {
      const { data } = await api.post(`/job-apply/${jobId}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        withCredentials: true,
      });
      return fulfillWithValue(data);
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.message;
      return rejectWithValue({ errorMessage });
    }
  },
);

export const get_user_applications = createAsyncThunk(
  "jobApplication/get_user_applications",
  async ({ page, parPage, customerId }, { fulfillWithValue, rejectWithValue }) => {
    try {
      const params = new URLSearchParams();
      if (page) {params.append("page", page);}
      if (parPage) {params.append("parPage", parPage);}
      if (customerId) {params.append("customerId", customerId);}
      const { data } = await api.get(
        `/user-applications?${params.toString()}`,
        {
          withCredentials: true,
        },
      );
      return fulfillWithValue(data);
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.message;
      return rejectWithValue({ errorMessage });
    }
  },
);

export const jobApplicationReducer = createSlice({
  name: "jobApplication",
  initialState: {
    successMessage: "",
    errorMessage: "",
    loader: false,
    application: {},
    applications: [],
    totalApplications: 0,
  },
  reducers: {
    clearMessage(state) {
      state.errorMessage = "";
      state.successMessage = "";
    },
    clearApplication(state) {
      state.application = {};
    },
  },
  extraReducers: (builder) => {
    builder.addCase(apply_to_job.pending, (state) => {
      state.loader = true;
    });
    builder.addCase(apply_to_job.fulfilled, (state, { payload }) => {
      state.loader = false;
      state.successMessage = payload.message;
      state.application = payload.application;
    });
    builder.addCase(apply_to_job.rejected, (state, { payload }) => {
      state.loader = false;
      state.errorMessage = payload.errorMessage;
    });
    builder.addCase(get_user_applications.pending, (state) => {
      state.loader = true;
      state.errorMessage = "";
    });
    builder.addCase(get_user_applications.fulfilled, (state, { payload }) => {
      state.loader = false;
      state.applications = payload.applications || [];
      state.totalApplications = payload.totalApplications || 0;
      state.errorMessage = "";
    });
    builder.addCase(get_user_applications.rejected, (state, { payload }) => {
      state.loader = false;
      state.errorMessage = payload?.errorMessage || "Failed to load applications";
      state.applications = [];
      state.totalApplications = 0;
    });
  },
});

export const { clearMessage, clearApplication } =
  jobApplicationReducer.actions;
export default jobApplicationReducer.reducer;

