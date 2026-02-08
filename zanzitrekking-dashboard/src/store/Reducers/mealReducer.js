import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../../api/api";
export const mealAdd = createAsyncThunk(
  "meal/mealAdd",
  async (name, { fulfillWithValue, rejectWithValue }) => {
    try {
      const { data } = await api.post("/meal-add", name, {
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
export const get_meals = createAsyncThunk(
  "meal/get_meals",
  async (
    { parPage = 10, currentPage = 1, searchValue = "", allMeals = "false", sort = "newest-desc" },
    { fulfillWithValue, rejectWithValue },
  ) => {
    try {
      const { data } = await api.get(
        `/meals-get?page=${currentPage}&&searchValue=${searchValue}&&parPage=${parPage}&&allMeals=${allMeals}&&sort=${sort}`,
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
export const get_meal = createAsyncThunk(
  "meal/get_meal",
  async (mealId, { fulfillWithValue, rejectWithValue }) => {
    try {
      const { data } = await api.get(`/meal-get/${mealId}`, {
        withCredentials: true,
      });
      return fulfillWithValue(data);
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      return rejectWithValue({ errorMessage });
    }
  },
);
export const meal_update = createAsyncThunk(
  "meal/meal_update",
  async ({ name, mealId }, { fulfillWithValue, rejectWithValue }) => {
    try {
      const { data } = await api.post(
        `/meal-update/${mealId}`,
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
export const delete_meal = createAsyncThunk(
  "meal/delete_meal",
  async (mealId, { fulfillWithValue, rejectWithValue }) => {
    try {
      const { data } = await api.delete(
        `/meal-delete/${mealId}`,

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
// Bulk delete meals
export const delete_meals = createAsyncThunk(
  "meal/delete_meals",
  async (ids, { fulfillWithValue, rejectWithValue }) => {
    try {
      const { data } = await api.post(
        "/meal-delete-multiple",
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

export const mealReducer = createSlice({
  name: "meal",
  initialState: {
    successMessage: "",
    errorMessage: "",
    loader: false,
    meals: [],
    totalMeals: 0,
    meal: {},
  },
  reducers: {
    clearMessage(state) {
      state.errorMessage = "";
      state.successMessage = "";
    },
  },
  extraReducers: (builder) => {
    builder.addCase(mealAdd.pending, (state, { payload }) => {
      state.loader = true;
    });
    builder.addCase(mealAdd.fulfilled, (state, { payload }) => {
      state.loader = false;
      state.successMessage = payload.message;
      state.meals = [...state.meals, payload.meal];
    });
    builder.addCase(mealAdd.rejected, (state, { payload }) => {
      state.loader = false;
      state.errorMessage = payload.errorMessage;
    });
    builder.addCase(get_meals.fulfilled, (state, { payload }) => {
      state.meals = payload.meals;
      state.totalMeals = payload.totalMeals;
    });
    builder.addCase(get_meal.fulfilled, (state, { payload }) => {
      state.meal = payload.meal;
    });
    builder.addCase(meal_update.pending, (state, { payload }) => {
      state.loader = true;
    });
    builder.addCase(meal_update.fulfilled, (state, { payload }) => {
      state.meal = payload.meal;
      state.successMessage = payload.message;
      state.loader = false;
    });
    builder.addCase(meal_update.rejected, (state, { payload }) => {
      state.loader = false;
      state.errorMessage = payload.errorMessage;
    });
    builder.addCase(delete_meal.pending, (state, { payload }) => {
      state.loader = true;
    });
    builder.addCase(delete_meal.fulfilled, (state, { payload }) => {
      state.successMessage = payload.message;
      state.loader = false;
    });
    builder.addCase(delete_meal.rejected, (state, { payload }) => {
      state.loader = false;
      state.errorMessage = payload.errorMessage;
    });
    builder.addCase(delete_meals.pending, (state, { payload }) => {
      state.loader = true;
    });
    builder.addCase(delete_meals.fulfilled, (state, { payload }) => {
      state.successMessage = payload.message;
      state.loader = false;
      // Remove deleted meals from state
      state.meals = state.meals.filter(
        (meal) => !payload.deletedIds.includes(meal._id),
      );
    });
    builder.addCase(delete_meals.rejected, (state, { payload }) => {
      state.loader = false;
      state.errorMessage = payload.errorMessage;
    });
  },
});
export const { clearMessage } = mealReducer.actions;
export default mealReducer.reducer;
