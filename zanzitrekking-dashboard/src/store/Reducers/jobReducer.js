import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../../api/api";

export const jobAdd = createAsyncThunk(
  "job/jobAdd",
  async (jobData, { fulfillWithValue, rejectWithValue }) => {
    try {
      const { data } = await api.post("/job-add", jobData, {
        withCredentials: true,
      });
      return fulfillWithValue(data);
    } catch (error) {
      const errorMessage = error?.response?.data?.error || error.message;
      return rejectWithValue({ errorMessage });
    }
  },
);

export const jobDelete = createAsyncThunk(
  "job/jobDelete",
  async (jobId, { fulfillWithValue, rejectWithValue }) => {
    try {
      const { data } = await api.delete(`/job-delete/${jobId}`, {
        withCredentials: true,
      });
      return fulfillWithValue(data);
    } catch (error) {
      const errorMessage = error?.response?.data?.error || error.message;
      return rejectWithValue({ errorMessage });
    }
  },
);

export const get_jobs = createAsyncThunk(
  "job/get_jobs",
  async (
    {
      parPage,
      currentPage,
      searchValue,
      allJobs = "false",
      sort = "newest-desc",
      isActive,
    },
    { fulfillWithValue, rejectWithValue },
  ) => {
    try {
      let url = `/job-get?page=${currentPage}&&searchValue=${searchValue}&&parPage=${parPage}&&allJobs=${allJobs}&&sort=${sort}`;
      if (isActive !== undefined) {
        url += `&&isActive=${isActive}`;
      }
      const { data } = await api.get(url, {
        withCredentials: true,
      });
      return fulfillWithValue(data);
    } catch (error) {
      const errorMessage = error?.response?.data?.error || error.message;
      return rejectWithValue({ errorMessage });
    }
  },
);

export const get_one_job = createAsyncThunk(
  "job/get_one_job",
  async (jobId, { fulfillWithValue, rejectWithValue }) => {
    if (!jobId || jobId === "undefined") {
      return rejectWithValue({ errorMessage: "Job ID is required" });
    }
    try {
      const { data } = await api.get(`/job-one-get/${jobId}`, {
        withCredentials: true,
      });
      return fulfillWithValue(data);
    } catch (error) {
      const errorMessage = error?.response?.data?.error || error.message;
      return rejectWithValue({ errorMessage });
    }
  },
);

export const update_job = createAsyncThunk(
  "job/update_job",
  async ({ jobData, jobId }, { fulfillWithValue, rejectWithValue }) => {
    try {
      const { data } = await api.post(`/job-update/${jobId}`, jobData, {
        withCredentials: true,
      });
      return fulfillWithValue(data);
    } catch (error) {
      const errorMessage = error?.response?.data?.error || error.message;
      return rejectWithValue({ errorMessage });
    }
  },
);

export const toggle_job_status = createAsyncThunk(
  "job/toggle_job_status",
  async (jobId, { fulfillWithValue, rejectWithValue }) => {
    try {
      const { data } = await api.post(`/job-toggle-status/${jobId}`, {}, {
        withCredentials: true,
      });
      return fulfillWithValue(data);
    } catch (error) {
      const errorMessage = error?.response?.data?.error || error.message;
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
    builder.addCase(get_one_job.fulfilled, (state, { payload }) => {
      state.job = payload.job;
    });
    builder.addCase(jobAdd.pending, (state) => {
      state.loader = true;
    });
    builder.addCase(jobAdd.fulfilled, (state, { payload }) => {
      state.loader = false;
      state.successMessage = payload.message || "Job added successfully";
      state.jobs = [...state.jobs, payload.job];
      state.job = payload.job;
    });
    builder.addCase(jobAdd.rejected, (state, { payload }) => {
      state.loader = false;
      state.errorMessage = payload.errorMessage;
    });
    builder.addCase(get_jobs.fulfilled, (state, { payload }) => {
      state.jobs = payload.jobs;
      state.totalJobs = payload.totalJobs;
    });
    builder.addCase(update_job.pending, (state) => {
      state.loader = true;
    });
    builder.addCase(update_job.fulfilled, (state, { payload }) => {
      state.loader = false;
      state.successMessage = payload.message;
      state.job = payload.job;
      // Update job in jobs array
      const index = state.jobs.findIndex(
        (job) => job._id === payload.job._id,
      );
      if (index !== -1) {
        state.jobs[index] = payload.job;
      }
    });
    builder.addCase(update_job.rejected, (state, { payload }) => {
      state.loader = false;
      state.errorMessage = payload.errorMessage;
    });
    builder.addCase(toggle_job_status.fulfilled, (state, { payload }) => {
      state.successMessage = payload.message;
      state.job = payload.job;
      // Update job in jobs array
      const index = state.jobs.findIndex(
        (job) => job._id === payload.job._id,
      );
      if (index !== -1) {
        state.jobs[index] = payload.job;
      }
    });
    builder.addCase(jobDelete.pending, (state) => {
      state.loader = true;
    });
    builder.addCase(jobDelete.fulfilled, (state, { payload }) => {
      state.loader = false;
      state.successMessage = payload.message;
      // Remove deleted job from state
      state.jobs = state.jobs.filter(
        (job) => job._id !== payload.deletedJob?._id,
      );
    });
    builder.addCase(jobDelete.rejected, (state, { payload }) => {
      state.loader = false;
      state.errorMessage = payload.errorMessage;
    });
  },
});

export const { clearMessage, clearJob } = jobReducer.actions;
export default jobReducer.reducer;

