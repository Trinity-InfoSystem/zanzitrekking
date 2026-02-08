import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../../api/api";

export const impactStatAdd = createAsyncThunk(
  "impactStat/impactStatAdd",
  async (formData, { fulfillWithValue, rejectWithValue }) => {
    try {
      const { data } = await api.post("/impact-stat-add", formData, {
        withCredentials: true,
      });
      return fulfillWithValue(data);
    } catch (error) {
      const errorMessage = error?.response?.data?.error || error.message;
      return rejectWithValue({ errorMessage });
    }
  },
);

export const get_impact_stats = createAsyncThunk(
  "impactStat/get_impact_stats",
  async (
    { parPage = 10, currentPage = 1, searchValue = "" },
    { fulfillWithValue, rejectWithValue },
  ) => {
    try {
      const { data } = await api.get(
        `/impact-stats-get?page=${currentPage}&searchValue=${searchValue}&parPage=${parPage}`,
        {
          withCredentials: true,
        },
      );
      return fulfillWithValue(data);
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      return rejectWithValue({ errorMessage });
    }
  },
);

export const get_impact_stat = createAsyncThunk(
  "impactStat/get_impact_stat",
  async (impactStatId, { fulfillWithValue, rejectWithValue }) => {
    try {
      const { data } = await api.get(`/impact-stat-get/${impactStatId}`, {
        withCredentials: true,
      });
      return fulfillWithValue(data);
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      return rejectWithValue({ errorMessage });
    }
  },
);

export const update_impact_stat = createAsyncThunk(
  "impactStat/update_impact_stat",
  async ({ impactStatId, formData }, { fulfillWithValue, rejectWithValue }) => {
    try {
      const { data } = await api.put(
        `/impact-stat-update/${impactStatId}`,
        formData,
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

export const delete_impact_stat = createAsyncThunk(
  "impactStat/delete_impact_stat",
  async (impactStatId, { fulfillWithValue, rejectWithValue }) => {
    try {
      const { data } = await api.delete(
        `/impact-stat-delete/${impactStatId}`,
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

export const delete_impact_stats = createAsyncThunk(
  "impactStat/delete_impact_stats",
  async (ids, { fulfillWithValue, rejectWithValue }) => {
    try {
      const { data } = await api.post(
        "/impact-stat-delete-multiple",
        { ids },
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

export const toggle_impact_stat_status = createAsyncThunk(
  "impactStat/toggle_impact_stat_status",
  async (impactStatId, { fulfillWithValue, rejectWithValue }) => {
    try {
      const { data } = await api.put(
        `/impact-stat-toggle-status/${impactStatId}`,
        {},
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

const impactStatSlice = createSlice({
  name: "impactStat",
  initialState: {
    successMessage: "",
    errorMessage: "",
    loader: false,
    impactStats: [],
    impactStat: {},
    totalImpactStats: 0,
  },
  reducers: {
    clearMessage: (state) => {
      state.errorMessage = "";
      state.successMessage = "";
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(impactStatAdd.pending, (state) => {
        state.loader = true;
      })
      .addCase(impactStatAdd.fulfilled, (state, { payload }) => {
        state.loader = false;
        state.successMessage = payload.message;
        state.impactStats = [...state.impactStats, payload.impactStat];
      })
      .addCase(impactStatAdd.rejected, (state, { payload }) => {
        state.loader = false;
        state.errorMessage = payload.errorMessage;
      })
      .addCase(get_impact_stats.pending, (state) => {
        state.loader = true;
      })
      .addCase(get_impact_stats.fulfilled, (state, { payload }) => {
        state.loader = false;
        state.impactStats = payload.impactStats;
        state.totalImpactStats = payload.totalImpactStats;
      })
      .addCase(get_impact_stats.rejected, (state, { payload }) => {
        state.loader = false;
        state.errorMessage = payload.errorMessage;
      })
      .addCase(get_impact_stat.pending, (state) => {
        state.loader = true;
      })
      .addCase(get_impact_stat.fulfilled, (state, { payload }) => {
        state.loader = false;
        state.impactStat = payload.impactStat;
      })
      .addCase(get_impact_stat.rejected, (state, { payload }) => {
        state.loader = false;
        state.errorMessage = payload.errorMessage;
      })
      .addCase(update_impact_stat.pending, (state) => {
        state.loader = true;
      })
      .addCase(update_impact_stat.fulfilled, (state, { payload }) => {
        state.loader = false;
        state.successMessage = payload.message;
        state.impactStats = state.impactStats.map((impactStat) =>
          impactStat._id === payload.impactStat._id
            ? payload.impactStat
            : impactStat,
        );
      })
      .addCase(update_impact_stat.rejected, (state, { payload }) => {
        state.loader = false;
        state.errorMessage = payload.errorMessage;
      })
      .addCase(delete_impact_stat.pending, (state) => {
        state.loader = true;
      })
      .addCase(delete_impact_stat.fulfilled, (state, { payload }) => {
        state.loader = false;
        state.successMessage = payload.message;
        state.impactStats = state.impactStats.filter(
          (impactStat) => impactStat._id !== payload.impactStatId,
        );
      })
      .addCase(delete_impact_stat.rejected, (state, { payload }) => {
        state.loader = false;
        state.errorMessage = payload.errorMessage;
      })
      .addCase(delete_impact_stats.pending, (state) => {
        state.loader = true;
      })
      .addCase(delete_impact_stats.fulfilled, (state, { payload }) => {
        state.loader = false;
        state.successMessage = payload.message;
        state.impactStats = state.impactStats.filter(
          (impactStat) => !payload.ids.includes(impactStat._id),
        );
      })
      .addCase(delete_impact_stats.rejected, (state, { payload }) => {
        state.loader = false;
        state.errorMessage = payload.errorMessage;
      })
      .addCase(toggle_impact_stat_status.pending, (state) => {
        state.loader = true;
      })
      .addCase(toggle_impact_stat_status.fulfilled, (state, { payload }) => {
        state.loader = false;
        state.successMessage = payload.message;
        state.impactStats = state.impactStats.map((impactStat) =>
          impactStat._id === payload.impactStat._id
            ? payload.impactStat
            : impactStat,
        );
      })
      .addCase(toggle_impact_stat_status.rejected, (state, { payload }) => {
        state.loader = false;
        state.errorMessage = payload.errorMessage;
      });
  },
});

export const { clearMessage } = impactStatSlice.actions;
export default impactStatSlice.reducer;

