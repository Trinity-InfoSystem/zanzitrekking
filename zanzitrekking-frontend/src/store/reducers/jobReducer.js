import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../../api/api";

export const get_jobs = createAsyncThunk(
  "job/get_jobs",
  async (
    { parPage = 20, currentPage = 1, searchValue = "", sort = "newest-desc" },
    { fulfillWithValue, rejectWithValue },
  ) => {
    try {
      const { data } = await api.get(
        `/jobs?page=${currentPage}&&searchValue=${searchValue}&&parPage=${parPage}&&sort=${sort}`,
      );
      return fulfillWithValue(data);
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.message;
      return rejectWithValue({ errorMessage });
    }
  },
);

export const get_job = createAsyncThunk(
  "job/get_job",
  async (jobId, { fulfillWithValue, rejectWithValue }) => {
    try {
      const { data } = await api.get(`/job/${jobId}`);
      return fulfillWithValue(data);
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.message;
      return rejectWithValue({ errorMessage });
    }
  },
);

export const jobReducer = createSlice({
  name: "job",
  initialState: {
    successMessage: "",
    errorMessage: "",
    loader: false,
    jobs: [],
    totalJobs: 0,
    job: {},
  },
  reducers: {
    clearMessage(state) {
      state.errorMessage = "";
      state.successMessage = "";
    },
    clearJob(state) {
      state.job = {};
    },
  },
  extraReducers: (builder) => {
    builder.addCase(get_jobs.pending, (state) => {
      state.loader = true;
    });
    builder.addCase(get_jobs.fulfilled, (state, { payload }) => {
      state.loader = false;
      state.jobs = payload.jobs;
      state.totalJobs = payload.totalJobs;
    });
    builder.addCase(get_jobs.rejected, (state, { payload }) => {
      state.loader = false;
      state.errorMessage = payload.errorMessage;
    });
    builder.addCase(get_job.pending, (state) => {
      state.loader = true;
    });
    builder.addCase(get_job.fulfilled, (state, { payload }) => {
      state.loader = false;
      state.job = payload.job;
    });
    builder.addCase(get_job.rejected, (state, { payload }) => {
      state.loader = false;
      state.errorMessage = payload.errorMessage;
    });
  },
});

export const { clearMessage, clearJob } = jobReducer.actions;
export default jobReducer.reducer;

