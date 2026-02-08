import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../../api/api";
export const inclusionAdd = createAsyncThunk(
  "inclusion/inclusionAdd",
  async (name, { fulfillWithValue, rejectWithValue }) => {
    try {
      const { data } = await api.post("/inclusion-add", name, {
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
export const get_inclusions = createAsyncThunk(
  "inclusion/get_inclusions",
  async (
    {
      parPage = 10,
      currentPage = 1,
      searchValue = "",
      allInclusions = "false",
      sort = "newest-desc",
    },
    { fulfillWithValue, rejectWithValue },
  ) => {
    try {
      const { data } = await api.get(
        `/inclusions-get?page=${currentPage}&&searchValue=${searchValue}&&parPage=${parPage}&&allInclusions=${allInclusions}&&sort=${sort}`,
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
export const get_inclusion = createAsyncThunk(
  "inclusion/get_inclusion",
  async (inclusionId, { fulfillWithValue, rejectWithValue }) => {
    try {
      const { data } = await api.get(`/inclusion-get/${inclusionId}`, {
        withCredentials: true,
      });
      return fulfillWithValue(data);
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      return rejectWithValue({ errorMessage });
    }
  },
);
export const inclusion_update = createAsyncThunk(
  "inclusion/inclusion_update",
  async ({ name, inclusionId }, { fulfillWithValue, rejectWithValue }) => {
    try {
      const { data } = await api.post(
        `/inclusion-update/${inclusionId}`,
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
export const delete_inclusion = createAsyncThunk(
  "inclusion/delete_inclusion",
  async (inclusionId, { fulfillWithValue, rejectWithValue }) => {
    try {
      const { data } = await api.delete(
        `/inclusion-delete/${inclusionId}`,

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
// Bulk delete inclusions
export const delete_inclusions = createAsyncThunk(
  "inclusion/delete_inclusions",
  async (ids, { fulfillWithValue, rejectWithValue }) => {
    try {
      const { data } = await api.post(
        "/inclusion-delete-multiple",
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
export const inclusionReducer = createSlice({
  name: "inclusion",
  initialState: {
    successMessage: "",
    errorMessage: "",
    loader: false,
    inclusions: [],
    totalInclusions: 0,
    inclusion: {},
  },
  reducers: {
    clearMessage: (state) => {
      return {
        ...state,
        errorMessage: "",
        successMessage: "",
      };
    },
    clearInclusion: (state) => {
      return {
        ...state,
        inclusion: {},
      };
    },
  },
  extraReducers: (builder) => {
    builder.addCase(inclusionAdd.pending, (state, { payload }) => {
      state.loader = true;
    });
    builder.addCase(inclusionAdd.fulfilled, (state, { payload }) => {
      state.loader = false;
      state.successMessage = payload.message;
      state.inclusions = [...state.inclusions, payload.inclusion];
    });
    builder.addCase(inclusionAdd.rejected, (state, { payload }) => {
      state.loader = false;
      state.errorMessage = payload.errorMessage;
    });
    builder.addCase(get_inclusions.fulfilled, (state, { payload }) => {
      state.inclusions = payload.inclusions;
      state.totalInclusions = payload.totalInclusions;
    });
    builder.addCase(get_inclusion.fulfilled, (state, { payload }) => {
      state.inclusion = payload.inclusion;
    });
    builder.addCase(inclusion_update.pending, (state, { payload }) => {
      state.loader = true;
    });
    builder.addCase(inclusion_update.fulfilled, (state, { payload }) => {
      state.inclusion = payload.inclusion;
      state.successMessage = payload.message;
      state.loader = false;
    });
    builder.addCase(inclusion_update.rejected, (state, { payload }) => {
      state.loader = false;
      state.errorMessage = payload.errorMessage;
    });
    builder.addCase(delete_inclusion.pending, (state, { payload }) => {
      state.loader = true;
    });
    builder.addCase(delete_inclusion.fulfilled, (state, { payload }) => {
      state.successMessage = payload.message;
      state.loader = false;
    });
    builder.addCase(delete_inclusion.rejected, (state, { payload }) => {
      state.loader = false;
      state.errorMessage = payload.errorMessage;
    });
    builder.addCase(delete_inclusions.pending, (state) => {
      state.loader = true;
    });
    builder.addCase(delete_inclusions.fulfilled, (state, { payload }) => {
      state.successMessage = payload.message;
      state.loader = false;
      // Remove deleted inclusions from state
      state.inclusions = state.inclusions.filter(
        (inc) => !payload.deletedIds.includes(inc._id),
      );
    });
    builder.addCase(delete_inclusions.rejected, (state, { payload }) => {
      state.loader = false;
      state.errorMessage = payload.errorMessage;
    });
  },
});
export const { clearMessage, clearInclusion } = inclusionReducer.actions;
export default inclusionReducer.reducer;
