import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../../api/api";
export const sellerAdd = createAsyncThunk(
  "seller/sellerAdd",
  async ({ name, image }, { fulfillWithValue, rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("image", image);
      const { data } = await api.post("/seller-add", formData, {
        withCredentials: true,
      });

      return fulfillWithValue(data);
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      return rejectWithValue(errorMessage);
    }
  },
);
export const get_seller_request = createAsyncThunk(
  "seller/get_seller_request",
  async (
    { parPage, page, searchValue },
    { fulfillWithValue, rejectWithValue },
  ) => {
    try {
      const { data } = await api.get(
        `/request-seller-get?page=${page}&&searchValue=${searchValue}&&parPage=${parPage}`,
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
export const get_seller = createAsyncThunk(
  "seller/get_seller",
  async (sellerId, { fulfillWithValue, rejectWithValue }) => {
    try {
      const { data } = await api.get(`/get-seller/${sellerId}`, {
        withCredentials: true,
      });

      return fulfillWithValue(data);
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      return rejectWithValue(errorMessage);
    }
  },
);
export const seller_status_update = createAsyncThunk(
  "seller/seller_status_update",
  async (info, { fulfillWithValue, rejectWithValue }) => {
    try {
      const { data } = await api.post(`/seller-status-update`, info, {
        withCredentials: true,
      });

      return fulfillWithValue(data);
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      return rejectWithValue(errorMessage);
    }
  },
);
export const sellerReducer = createSlice({
  name: "seller",
  initialState: {
    successMessage: "",
    errorMessage: "",
    loader: false,
    sellers: [],
    totalSeller: 0,
    seller: {},
  },
  reducers: {
    clearMessage(state) {
      state.errorMessage = "";
      state.successMessage = "";
    },
  },
  extraReducers: (builder) => {
    builder.addCase(sellerAdd.pending, (state, { payload }) => {
      state.loader = true;
    });
    builder.addCase(sellerAdd.fulfilled, (state, { payload }) => {
      state.loader = false;
      state.successMessage = "Seller added successfully";
      state.sellers = [...state.sellers, payload.seller];
    });
    builder.addCase(sellerAdd.rejected, (state, { payload }) => {
      state.loader = false;
      state.errorMessage = payload.error;
    });

    builder.addCase(get_seller_request.fulfilled, (state, { payload }) => {
      state.sellers = payload.sellers;
      state.totalSeller = payload.totalSeller;
    });
    builder.addCase(get_seller_request.rejected, (state, { payload }) => {
      state.loader = false;
      state.errorMessage = payload.error;
    });
    builder.addCase(get_seller.fulfilled, (state, { payload }) => {
      state.seller = payload.seller;
    });
    builder.addCase(get_seller.rejected, (state, { payload }) => {
      state.loader = false;
      state.errorMessage = payload.error;
    });
    builder.addCase(seller_status_update.fulfilled, (state, { payload }) => {
      state.seller = payload.seller;
      state.successMessage = payload.message;
    });
    builder.addCase(seller_status_update.rejected, (state, { payload }) => {
      state.loader = false;
      state.errorMessage = payload.error;
    });
  },
});
export const { clearMessage } = sellerReducer.actions;
export default sellerReducer.reducer;
