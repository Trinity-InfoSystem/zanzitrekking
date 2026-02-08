import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../../api/api";
export const exclusionAdd = createAsyncThunk(
  "exclusion/exclusionAdd",
  async (name, { fulfillWithValue, rejectWithValue }) => {
    try {
      const { data } = await api.post("/exclusion-add", name, {
        withCredentials: true,
      });

      return fulfillWithValue(data);
    } catch (error) {
      // Handle both 'error' and 'message' fields from backend
      const errorMessage = error.response?.data?.error || error.response?.data?.message || error.message;
      return rejectWithValue({ errorMessage });
    }
  },
);
export const get_exclusions = createAsyncThunk(
  "exclusion/get_exclusions",
  async (
    { parPage = 10, currentPage = 1, searchValue = "", allExclusions = "false", sort = "newest-desc" },
    { fulfillWithValue, rejectWithValue },
  ) => {
    try {
      const { data } = await api.get(
        `/exclusions-get?page=${currentPage}&&searchValue=${searchValue}&&parPage=${parPage}&&allExclusions=${allExclusions}&&sort=${sort}`,
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
export const get_exclusion = createAsyncThunk(
  "exclusion/get_exclusion",
  async (exclusionId, { fulfillWithValue, rejectWithValue }) => {
    try {
      const { data } = await api.get(`/exclusion-get/${exclusionId}`, {
        withCredentials: true,
      });
      return fulfillWithValue(data);
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      return rejectWithValue({ errorMessage });
    }
  },
);
export const exclusion_update = createAsyncThunk(
  "exclusion/exclusion_update",
  async ({ name, exclusionId }, { fulfillWithValue, rejectWithValue }) => {
    try {
      const { data } = await api.post(
        `/exclusion-update/${exclusionId}`,
        { name },
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
export const delete_exclusion = createAsyncThunk(
  "exclusion/delete_exclusion",
  async (exclusionId, { fulfillWithValue, rejectWithValue }) => {
    try {
      const { data } = await api.delete(
        `/exclusion-delete/${exclusionId}`,

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
// Bulk delete exclusions
export const delete_exclusions = createAsyncThunk(
  "exclusion/delete_exclusions",
  async (ids, { fulfillWithValue, rejectWithValue }) => {
    try {
      const { data } = await api.post(
        "/exclusion-delete-multiple",
        { ids },
        { withCredentials: true },
      );
      return fulfillWithValue({ ...data, deletedIds: ids });
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      return rejectWithValue({ errorMessage });
    }
  },
);

export const exclusionReducer = createSlice({
  name: "exclusion",
  initialState: {
    successMessage: "",
    errorMessage: "",
    loader: false,
    exclusions: [],
    totalExclusions: 0,
    exclusion: {},
  },
  reducers: {
    clearMessage: (state) => {
      return {
        ...state,
        errorMessage: "",
        successMessage: "",
      };
    },
    clearExclusion: (state) => {
      return {
        ...state,
        exclusion: {},
      };
    },
  },
  extraReducers: (builder) => {
    builder.addCase(exclusionAdd.pending, (state, { payload }) => {
      state.loader = true;
    });
    builder.addCase(exclusionAdd.fulfilled, (state, { payload }) => {
      state.loader = false;
      state.successMessage = payload.message;
      state.exclusions = [...state.exclusions, payload.exclusion];
    });
    builder.addCase(exclusionAdd.rejected, (state, { payload }) => {
      state.loader = false;
      state.errorMessage = payload.errorMessage;
    });
    builder.addCase(get_exclusions.fulfilled, (state, { payload }) => {
      state.exclusions = payload.exclusions;
      state.totalExclusions = payload.totalExclusions;
    });
    builder.addCase(get_exclusion.fulfilled, (state, { payload }) => {
      state.exclusion = payload.exclusion;
    });
    builder.addCase(exclusion_update.pending, (state, { payload }) => {
      state.loader = true;
    });
    builder.addCase(exclusion_update.fulfilled, (state, { payload }) => {
      state.exclusion = payload.exclusion;
      state.successMessage = payload.message;
      state.loader = false;
    });
    builder.addCase(exclusion_update.rejected, (state, { payload }) => {
      state.loader = false;
      state.errorMessage = payload.errorMessage;
    });
    builder.addCase(delete_exclusion.pending, (state, { payload }) => {
      state.loader = true;
    });
    builder.addCase(delete_exclusion.fulfilled, (state, { payload }) => {
      state.successMessage = payload.message;
      state.loader = false;
    });
    builder.addCase(delete_exclusion.rejected, (state, { payload }) => {
      state.loader = false;
      state.errorMessage = payload.errorMessage;
    });
    builder.addCase(delete_exclusions.pending, (state) => {
      state.loader = true;
    });
    builder.addCase(delete_exclusions.fulfilled, (state, { payload }) => {
      state.successMessage = payload.message;
      state.loader = false;
      // Remove deleted exclusions from state
      state.exclusions = state.exclusions.filter(
        (exc) => !payload.deletedIds.includes(exc._id)
      );
    });
    builder.addCase(delete_exclusions.rejected, (state, { payload }) => {
      state.loader = false;
      state.errorMessage = payload.errorMessage;
    });
  },
});
export const { clearMessage, clearExclusion } = exclusionReducer.actions;
export default exclusionReducer.reducer;
