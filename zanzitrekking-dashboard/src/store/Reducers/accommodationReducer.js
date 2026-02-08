import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../../api/api";
export const accommodationAdd = createAsyncThunk(
  "accommodation/accommodationAdd",
  async (name, { fulfillWithValue, rejectWithValue }) => {
    try {
      const { data } = await api.post("/accommodation-add", name, {
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
export const get_accommodations = createAsyncThunk(
  "accommodation/get_accommodations",
  async (
    { parPage = 10, currentPage = 1, searchValue = "", allAccommodations = "false", sort = "newest-desc" },
    { fulfillWithValue, rejectWithValue },
  ) => {
    try {
      const { data } = await api.get(
        `/accommodations-get?page=${currentPage}&&searchValue=${searchValue}&&parPage=${parPage}&&allAccommodations=${allAccommodations}&&sort=${sort}`,
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
export const get_accommodation = createAsyncThunk(
  "accommodation/get_accommodation",
  async (accommodationId, { fulfillWithValue, rejectWithValue }) => {
    try {
      const { data } = await api.get(`/accommodation-get/${accommodationId}`, {
        withCredentials: true,
      });
      return fulfillWithValue(data);
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      return rejectWithValue({ errorMessage });
    }
  },
);
export const accommodation_update = createAsyncThunk(
  "accommodation/accommodation_update",
  async ({ formData, accommodationId }, { fulfillWithValue, rejectWithValue }) => {
    try {
      const { data } = await api.post(
        `/accommodation-update/${accommodationId}`,
        formData,
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
export const delete_accommodation = createAsyncThunk(
  "accommodation/delete_accommodation",
  async (accommodationId, { fulfillWithValue, rejectWithValue }) => {
    try {
      const { data } = await api.delete(
        `/accommodation-delete/${accommodationId}`,

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
// Bulk delete accommodations

export const delete_accommodations = createAsyncThunk(
  "accommodation/delete_accommodations",
  async (ids, { fulfillWithValue, rejectWithValue }) => {
    try {
      const { data } = await api.post(
        "/accommodation-delete-multiple",
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

export const accommodationReducer = createSlice({
  name: "accommodation",
  initialState: {
    successMessage: "",
    errorMessage: "",
    loader: false,
    accommodations: [],
    totalaccommodation: 0,
    accommodation: {},
  },
  reducers: {
    clearMessage: (state) => {
      return {
        ...state,
        errorMessage: "",
        successMessage: "",
      };
    },
    clearAccommodation: (state) => {
      return {
        ...state,
        accommodation: {},
      };
    },
  },
  extraReducers: (builder) => {
    builder.addCase(accommodationAdd.pending, (state, { payload }) => {
      state.loader = true;
    });
    builder.addCase(accommodationAdd.fulfilled, (state, { payload }) => {
      state.loader = false;
      state.successMessage = payload.message;
      state.accommodations = [...state.accommodations, payload.accommodation];
    });
    builder.addCase(accommodationAdd.rejected, (state, { payload }) => {
      state.loader = false;
      state.errorMessage = payload.errorMessage;
    });
    builder.addCase(get_accommodations.fulfilled, (state, { payload }) => {
      state.accommodations = payload.accommodations;
      state.totalaccommodation = payload.totalaccommodation;
    });
    builder.addCase(get_accommodation.fulfilled, (state, { payload }) => {
      state.accommodation = payload.accommodation;
    });
    builder.addCase(accommodation_update.pending, (state, { payload }) => {
      state.loader = true;
    });
    builder.addCase(accommodation_update.fulfilled, (state, { payload }) => {
      state.accommodation = payload.accommodation;
      state.successMessage = payload.message;
      state.loader = false;
    });
    builder.addCase(accommodation_update.rejected, (state, { payload }) => {
      state.loader = false;
      state.errorMessage = payload.errorMessage;
    });
    builder.addCase(delete_accommodation.pending, (state, { payload }) => {
      state.loader = true;
    });
    builder.addCase(delete_accommodation.fulfilled, (state, { payload }) => {
      state.successMessage = payload.message;
      state.loader = false;
    });
    builder.addCase(delete_accommodation.rejected, (state, { payload }) => {
      state.loader = false;
      state.errorMessage = payload.errorMessage;
    });
    builder.addCase(delete_accommodations.pending, (state) => {
      state.loader = true;
    });
    builder.addCase(delete_accommodations.fulfilled, (state, { payload }) => {
      state.successMessage = payload.message;
      state.loader = false;
      // Remove deleted accommodations from state
      state.accommodations = state.accommodations.filter(
        (acc) => !payload.deletedIds.includes(acc._id),
      );
    });
    builder.addCase(delete_accommodations.rejected, (state, { payload }) => {
      state.loader = false;
      state.errorMessage = payload.errorMessage;
    });
  },
});
export const { clearMessage, clearAccommodation } =
  accommodationReducer.actions;
export default accommodationReducer.reducer;
