import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../../api/api";

export const get_applications = createAsyncThunk(
  "jobApplication/get_applications",
  async (
    {
      parPage,
      currentPage,
      searchValue,
      jobId,
      status,
      sort = "newest-desc",
    },
    { fulfillWithValue, rejectWithValue },
  ) => {
    try {
      let url = `/job-applications?page=${currentPage}&&searchValue=${searchValue}&&parPage=${parPage}&&sort=${sort}`;
      if (jobId) {
        url += `&&jobId=${jobId}`;
      }
      if (status) {
        url += `&&status=${status}`;
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

export const get_application = createAsyncThunk(
  "jobApplication/get_application",
  async (applicationId, { fulfillWithValue, rejectWithValue }) => {
    try {
      const { data } = await api.get(`/job-application/${applicationId}`, {
        withCredentials: true,
      });
      return fulfillWithValue(data);
    } catch (error) {
      const errorMessage = error?.response?.data?.error || error.message;
      return rejectWithValue({ errorMessage });
    }
  },
);

export const update_application_status = createAsyncThunk(
  "jobApplication/update_application_status",
  async (
    { applicationId, status, adminNotes, rejectedReason },
    { fulfillWithValue, rejectWithValue },
  ) => {
    try {
      const payload = { status };
      if (adminNotes) {
        payload.adminNotes = adminNotes;
      }
      if (rejectedReason) {
        payload.rejectedReason = rejectedReason;
      }
      const { data } = await api.post(
        `/job-application-update-status/${applicationId}`,
        payload,
        {
          withCredentials: true,
        },
      );
      return fulfillWithValue(data);
    } catch (error) {
      const errorMessage = error?.response?.data?.error || error.message;
      return rejectWithValue({ errorMessage });
    }
  },
);
export const send_email_to_applicant = createAsyncThunk(
  "jobApplication/send_email_to_applicant",
  async ({ applicationId, subject, message }, { fulfillWithValue, rejectWithValue }) => {
    try {
      const { data } = await api.post(
        `/send-email-to-applicant/${applicationId}`,
        { subject, message },
        {
          withCredentials: true,
        },
      );
      return fulfillWithValue(data);
    } catch (error) {
      const errorMessage = error?.response?.data?.error || error.message;
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
    applications: [],
    totalApplications: 0,
    application: {},
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
    builder.addCase(get_application.fulfilled, (state, { payload }) => {
      state.application = payload.application;
    });
    builder.addCase(get_applications.fulfilled, (state, { payload }) => {
      state.applications = payload.applications;
      state.totalApplications = payload.totalApplications;
    });
    builder.addCase(update_application_status.pending, (state) => {
      state.loader = true;
    });
    builder.addCase(
      update_application_status.fulfilled,
      (state, { payload }) => {
        state.loader = false;
        state.successMessage = payload.message;
        state.application = payload.application;
        // Update application in applications array
        const index = state.applications.findIndex(
          (app) => app._id === payload.application._id,
        );
        if (index !== -1) {
          state.applications[index] = payload.application;
        }
      },
    );
    builder.addCase(
      update_application_status.rejected,
      (state, { payload }) => {
        state.loader = false;
        state.errorMessage = payload.errorMessage;
      },
    );
    builder.addCase(send_email_to_applicant.pending, (state) => {
      state.loader = true;
    });
    builder.addCase(send_email_to_applicant.fulfilled, (state, { payload }) => {
      state.loader = false;
      state.successMessage = payload.message;
    });
    builder.addCase(send_email_to_applicant.rejected, (state, { payload }) => {
      state.loader = false;
      state.errorMessage = payload.errorMessage;
    });
  },
});

export const { clearMessage, clearApplication } =
  jobApplicationReducer.actions;
export default jobApplicationReducer.reducer;

