import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../../api/api";

export const achievementAdd = createAsyncThunk(
  "achievement/achievementAdd",
  async (formData, { fulfillWithValue, rejectWithValue }) => {
    try {
      const { data } = await api.post("/achievement-add", formData, {
        withCredentials: true,
      });
      return fulfillWithValue(data);
    } catch (error) {
      const errorMessage = error?.response?.data?.error || error.message;
      return rejectWithValue({ errorMessage });
    }
  },
);

export const get_achievements = createAsyncThunk(
  "achievement/get_achievements",
  async (
    { parPage = 10, currentPage = 1, searchValue = "" },
    { fulfillWithValue, rejectWithValue },
  ) => {
    try {
      const { data } = await api.get(
        `/achievements-get?page=${currentPage}&searchValue=${searchValue}&parPage=${parPage}`,
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

export const get_achievement = createAsyncThunk(
  "achievement/get_achievement",
  async (achievementId, { fulfillWithValue, rejectWithValue }) => {
    try {
      const { data } = await api.get(`/achievement-get/${achievementId}`, {
        withCredentials: true,
      });
      return fulfillWithValue(data);
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      return rejectWithValue({ errorMessage });
    }
  },
);

export const update_achievement = createAsyncThunk(
  "achievement/update_achievement",
  async ({ achievementId, formData }, { fulfillWithValue, rejectWithValue }) => {
    try {
      const { data } = await api.put(
        `/achievement-update/${achievementId}`,
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

export const delete_achievement = createAsyncThunk(
  "achievement/delete_achievement",
  async (achievementId, { fulfillWithValue, rejectWithValue }) => {
    try {
      const { data } = await api.delete(`/achievement-delete/${achievementId}`, {
        withCredentials: true,
      });
      return fulfillWithValue(data);
    } catch (error) {
      const errorMessage = error?.response?.data?.error || error.message;
      return rejectWithValue({ errorMessage });
    }
  },
);

export const delete_achievements = createAsyncThunk(
  "achievement/delete_achievements",
  async (ids, { fulfillWithValue, rejectWithValue }) => {
    try {
      const { data } = await api.post(
        "/achievement-delete-multiple",
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

export const toggle_achievement_status = createAsyncThunk(
  "achievement/toggle_achievement_status",
  async (achievementId, { fulfillWithValue, rejectWithValue }) => {
    try {
      const { data } = await api.put(
        `/achievement-toggle-status/${achievementId}`,
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

const achievementSlice = createSlice({
  name: "achievement",
  initialState: {
    successMessage: "",
    errorMessage: "",
    loader: false,
    achievements: [],
    achievement: {},
    totalAchievements: 0,
  },
  reducers: {
    clearMessage: (state) => {
      state.errorMessage = "";
      state.successMessage = "";
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(achievementAdd.pending, (state) => {
        state.loader = true;
      })
      .addCase(achievementAdd.fulfilled, (state, { payload }) => {
        state.loader = false;
        state.successMessage = payload.message;
        state.achievements = [...state.achievements, payload.achievement];
      })
      .addCase(achievementAdd.rejected, (state, { payload }) => {
        state.loader = false;
        state.errorMessage = payload.errorMessage;
      })
      .addCase(get_achievements.pending, (state) => {
        state.loader = true;
      })
      .addCase(get_achievements.fulfilled, (state, { payload }) => {
        state.loader = false;
        state.achievements = payload.achievements;
        state.totalAchievements = payload.totalAchievements;
      })
      .addCase(get_achievements.rejected, (state, { payload }) => {
        state.loader = false;
        state.errorMessage = payload.errorMessage;
      })
      .addCase(get_achievement.pending, (state) => {
        state.loader = true;
      })
      .addCase(get_achievement.fulfilled, (state, { payload }) => {
        state.loader = false;
        state.achievement = payload.achievement;
      })
      .addCase(get_achievement.rejected, (state, { payload }) => {
        state.loader = false;
        state.errorMessage = payload.errorMessage;
      })
      .addCase(update_achievement.pending, (state) => {
        state.loader = true;
      })
      .addCase(update_achievement.fulfilled, (state, { payload }) => {
        state.loader = false;
        state.successMessage = payload.message;
        state.achievements = state.achievements.map((achievement) =>
          achievement._id === payload.achievement._id
            ? payload.achievement
            : achievement,
        );
      })
      .addCase(update_achievement.rejected, (state, { payload }) => {
        state.loader = false;
        state.errorMessage = payload.errorMessage;
      })
      .addCase(delete_achievement.pending, (state) => {
        state.loader = true;
      })
      .addCase(delete_achievement.fulfilled, (state, { payload }) => {
        state.loader = false;
        state.successMessage = payload.message;
        state.achievements = state.achievements.filter(
          (achievement) => achievement._id !== payload.achievementId,
        );
      })
      .addCase(delete_achievement.rejected, (state, { payload }) => {
        state.loader = false;
        state.errorMessage = payload.errorMessage;
      })
      .addCase(delete_achievements.pending, (state) => {
        state.loader = true;
      })
      .addCase(delete_achievements.fulfilled, (state, { payload }) => {
        state.loader = false;
        state.successMessage = payload.message;
        state.achievements = state.achievements.filter(
          (achievement) => !payload.ids.includes(achievement._id),
        );
      })
      .addCase(delete_achievements.rejected, (state, { payload }) => {
        state.loader = false;
        state.errorMessage = payload.errorMessage;
      })
      .addCase(toggle_achievement_status.pending, (state) => {
        state.loader = true;
      })
      .addCase(toggle_achievement_status.fulfilled, (state, { payload }) => {
        state.loader = false;
        state.successMessage = payload.message;
        state.achievements = state.achievements.map((achievement) =>
          achievement._id === payload.achievement._id
            ? payload.achievement
            : achievement,
        );
      })
      .addCase(toggle_achievement_status.rejected, (state, { payload }) => {
        state.loader = false;
        state.errorMessage = payload.errorMessage;
      });
  },
});

export const { clearMessage } = achievementSlice.actions;
export default achievementSlice.reducer;

