import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../../api/api";
export const categoryAdd = createAsyncThunk(
  "category/categoryAdd",
  async ({ name, image }, { fulfillWithValue, rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("image", image);
      const { data } = await api.post("/category-add", formData, {
        withCredentials: true,
      });
      return fulfillWithValue(data);
    } catch (error) {
      const errorMessage = error?.response?.data?.error || error.message;
      return rejectWithValue({ errorMessage });
    }
  },
);
export const categoryDelete = createAsyncThunk(
  "category/categoryDelete",
  async (categoryId, { fulfillWithValue, rejectWithValue }) => {
    try {
      const { data } = await api.delete(`/category-delete/${categoryId}`, {
        withCredentials: true,
      });
      return fulfillWithValue(data);
    } catch (error) {
      const errorMessage = error?.response?.data?.error || error.message;
      return rejectWithValue({ errorMessage });
    }
  },
);

export const get_category = createAsyncThunk(
  "category/get_category",
  async (
    { parPage, currentPage, searchValue, allCategories = "false", sort = "newest-desc" },
    { fulfillWithValue, rejectWithValue },
  ) => {
    try {
      const { data } = await api.get(
        `/category-get?page=${currentPage}&&searchValue=${searchValue}&&parPage=${parPage}&&allCategories=${allCategories}&&sort=${sort}`,
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
export const get_one_category = createAsyncThunk(
  "category/get_one_category",
  async (categoryId, { fulfillWithValue, rejectWithValue }) => {
    try {
      const { data } = await api.get(`/category-one-get/${categoryId}`, {
        withCredentials: true,
      });

      return fulfillWithValue(data);
    } catch (error) {
      const errorMessage = error?.response?.data?.error || error.message;

      return rejectWithValue({ errorMessage });
    }
  },
);
export const update_category = createAsyncThunk(
  "category/update_category",
  async (
    { name, image, categoryId },
    { fulfillWithValue, rejectWithValue },
  ) => {
    try {
      const formData = new FormData();
      formData.append("name", name);
      if (image) formData.append("image", image);
      const { data } = await api.post(
        `/category-update/${categoryId}`,
        formData,
        {
          withCredentials: true,
        },
      );
      return fulfillWithValue(data);
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      return rejectWithValue(errorMessage);
    }
  },
);
export const category_image_update = createAsyncThunk(
  "category/category_image_update",
  async ({ image, categoryId }, { fulfillWithValue, rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append("newImage", image);
      const { data } = await api.post(
        `/category-image-update/${categoryId}`,
        formData,
        {
          withCredentials: true,
        },
      );

      return fulfillWithValue(data);
    } catch (error) {
      const errorMessage = error.response?.data.message || error.message;
      rejectWithValue(errorMessage);
    }
  },
);
// Bulk delete categories
export const delete_categories = createAsyncThunk(
  "category/delete_categories",
  async (ids, { fulfillWithValue, rejectWithValue }) => {
    try {
      const { data } = await api.post(
        "/category-delete-multiple",
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

export const categoryReducer = createSlice({
  name: "category",
  initialState: {
    successMessage: "",
    errorMessage: "",
    loader: false,
    categories: [],
    totalCategory: 0,
    category: {},
  },
  reducers: {
    clearMessage(state) {
      state.errorMessage = "";
      state.successMessage = "";
    },
  },
  extraReducers: (builder) => {
    builder.addCase(get_one_category.fulfilled, (state, { payload }) => {
      state.category = payload.category;
    });
    builder.addCase(categoryAdd.pending, (state, { payload }) => {
      state.loader = true;
    });
    builder.addCase(categoryAdd.fulfilled, (state, { payload }) => {
      state.loader = false;
      state.successMessage = "Category added successfully";
      state.categories = [...state.categories, payload.category];
      state.category = payload.category;
    });
    builder.addCase(categoryAdd.rejected, (state, { payload }) => {
      state.loader = false;
      state.errorMessage = payload.errorMessage;
    });
    builder.addCase(get_category.fulfilled, (state, { payload }) => {
      state.categories = payload.categories;
      state.totalCategory = payload.totalCategory;
    });
    builder.addCase(update_category.pending, (state) => {
      state.loader = true;
    });
    builder.addCase(update_category.fulfilled, (state, { payload }) => {
      state.loader = false;
      state.successMessage = payload.message;
      state.category = payload.category;
    });
    builder.addCase(update_category.rejected, (state, { payload }) => {
      state.loader = false;
      state.errorMessage = payload.errorMessage;
    });

    // Update category image
    builder.addCase(category_image_update.pending, (state) => {
      state.loader = true;
    });
    builder.addCase(category_image_update.fulfilled, (state, { payload }) => {
      state.loader = false;
      state.successMessage = payload.message;
    });
    builder.addCase(category_image_update.rejected, (state, { payload }) => {
      state.loader = false;
      state.errorMessage = payload.errorMessage;
    });
    builder.addCase(categoryDelete.pending, (state) => {
      state.loader = true;
    });
    builder.addCase(categoryDelete.fulfilled, (state, { payload }) => {
      state.loader = false;
      state.successMessage = payload.message;
    });
    builder.addCase(categoryDelete.rejected, (state, { payload }) => {
      state.loader = false;
      state.errorMessage = payload.errorMessage;
    });
    builder.addCase(delete_categories.pending, (state) => {
      state.loader = true;
    });
    builder.addCase(delete_categories.fulfilled, (state, { payload }) => {
      state.successMessage = payload.message;
      state.loader = false;
      // Remove deleted categories from state
      state.categories = state.categories.filter(
        (cat) => !payload.deletedIds.includes(cat._id),
      );
    });
    builder.addCase(delete_categories.rejected, (state, { payload }) => {
      state.loader = false;
      state.errorMessage = payload.errorMessage;
    });
  },
});
export const { clearMessage } = categoryReducer.actions;
export default categoryReducer.reducer;
