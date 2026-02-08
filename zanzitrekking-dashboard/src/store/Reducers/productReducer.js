import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../../api/api";
export const productAdd = createAsyncThunk(
  "product/productAdd",
  async (product, { fulfillWithValue, rejectWithValue }) => {
    try {
      const { data } = await api.post("/product-add", product, {
        withCredentials: true,
      });

      return fulfillWithValue(data);
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      return rejectWithValue(errorMessage);
    }
  },
);
export const get_products = createAsyncThunk(
  "product/get_products",
  async (
    { parPage, currentPage, searchValue },
    { fulfillWithValue, rejectWithValue },
  ) => {
    try {
      const { data } = await api.get(
        `/products-get?page=${currentPage}&&searchValue=${searchValue}&&parPage=${parPage}`,
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
export const get_product = createAsyncThunk(
  "product/get_product",
  async (productId, { fulfillWithValue, rejectWithValue }) => {
    try {
      const { data } = await api.get(`/product-get/${productId}`, {
        withCredentials: true,
      });

      return fulfillWithValue(data);
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      return rejectWithValue(errorMessage);
    }
  },
);
export const update_product = createAsyncThunk(
  "product/update_product",
  async (product, { fulfillWithValue, rejectWithValue }) => {
    try {
      const { data } = await api.post("/product-update", product, {
        withCredentials: true,
      });

      return fulfillWithValue(data);
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      return rejectWithValue(errorMessage);
    }
  },
);
export const product_image_update = createAsyncThunk(
  "product/product_image_update",
  async (
    { oldImage, newImage, productId },
    { fulfillWithValue, rejectWithValue },
  ) => {
    try {
      const formData = new FormData();
      formData.append("oldImage", oldImage);
      formData.append("newImage", newImage);
      formData.append("productId", productId);
      const { data } = await api.post("/product-image-update", formData, {
        withCredentials: true,
      });
      return fulfillWithValue(data);
    } catch (error) {
      const errorMessage = error.response?.data.message || error.message;
      rejectWithValue(errorMessage);
    }
  },
);
export const productReducer = createSlice({
  name: "product",
  initialState: {
    successMessage: "",
    errorMessage: "",
    loader: false,
    products: [],
    totalProduct: 0,
    product: {},
  },
  reducers: {
    clearMessage(state) {
      state.errorMessage = "";
      state.successMessage = "";
    },
  },
  extraReducers: (builder) => {
    builder.addCase(productAdd.pending, (state, { payload }) => {
      state.loader = true;
    });
    builder.addCase(productAdd.fulfilled, (state, { payload }) => {
      state.loader = false;
      state.successMessage = payload.message;
    });
    builder.addCase(productAdd.rejected, (state, { payload }) => {
      state.loader = false;
      state.errorMessage = payload.error;
    });
    builder.addCase(get_products.fulfilled, (state, { payload }) => {
      state.products = payload.products;
      state.totalProduct = payload.totalProduct;
      state.successMessage = payload.successMessage;
    });
    builder.addCase(get_product.pending, (state, { payload }) => {
      state.loader = true;
    });
    builder.addCase(get_product.fulfilled, (state, { payload }) => {
      state.product = payload.product;
      state.successMessage = payload.successMessage;
      state.loader = false;
    });
    builder.addCase(get_product.rejected, (state, { payload }) => {
      state.loader = false;
      state.errorMessage = payload.error;
    });
    builder.addCase(update_product.pending, (state, { payload }) => {
      state.loader = true;
    });
    builder.addCase(update_product.fulfilled, (state, { payload }) => {
      state.product = payload.product;
      state.successMessage = payload.message;
      state.loader = false;
    });
    builder.addCase(update_product.rejected, (state, { payload }) => {
      state.loader = false;
      state.errorMessage = payload.error;
    });
    builder.addCase(product_image_update.pending, (state, { payload }) => {
      state.loader = true;
    });
    builder.addCase(product_image_update.fulfilled, (state, { payload }) => {
      state.product = payload.product;
      state.successMessage = payload.message;
      state.loader = false;
    });
    builder.addCase(product_image_update.rejected, (state, { payload }) => {
      state.loader = false;
      state.errorMessage = payload.error;
    });
  },
});
export const { clearMessage } = productReducer.actions;
export default productReducer.reducer;
