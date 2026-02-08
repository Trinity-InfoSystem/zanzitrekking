// wishlistReducer.js
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../../api/api";

export const add_to_cart = createAsyncThunk(
  "wishlist/add_to_cart",
  async (info, { fulfillWithValue, rejectWithValue }) => {
    try {
      const { data } = await api.post("/home/trip/add-to-cart", info, {
        withCredentials: true,
      });
      return fulfillWithValue(data);
    } catch (error) {
      return rejectWithValue({
        errorMessage: error?.response?.data?.error || error.message,
      });
    }
  },
);

export const get_cart_trips = createAsyncThunk(
  "wishlist/get_cart_trips",
  async (userId, { fulfillWithValue, rejectWithValue }) => {
    try {
      const { data } = await api.get(`/home/trip/get-cart-trips/${userId}`, {
        withCredentials: true,
      });
      return fulfillWithValue(data);
    } catch (error) {
      return rejectWithValue({
        errorMessage: error?.response?.data?.error || error.message,
      });
    }
  },
);

export const delete_cart_trip = createAsyncThunk(
  "wishlist/delete_cart_trip",
  async (tripId, { fulfillWithValue, rejectWithValue }) => {
    try {
      const { data } = await api.delete(
        `/home/trip/delete-cart-trip/${tripId}`,
        {
          withCredentials: true,
        },
      );
      return fulfillWithValue(data);
    } catch (error) {
      return rejectWithValue({
        errorMessage: error?.response?.data?.error || error.message,
      });
    }
  },
);

export const add_to_wishlist = createAsyncThunk(
  "wishlist/add_to_wishlist",
  async (info, { fulfillWithValue, rejectWithValue }) => {
    try {
      const { data } = await api.post("/home/trip/add-to-wishlist", info, {
        withCredentials: true,
      });
      return fulfillWithValue(data);
    } catch (error) {
      return rejectWithValue({
        errorMessage: error?.response?.data?.error || error.message,
      });
    }
  },
);

export const get_wishlist_trips = createAsyncThunk(
  "wishlist/get_wishlist_trips",
  async (userId, { fulfillWithValue, rejectWithValue }) => {
    try {
      const { data } = await api.get(
        `/home/trip/get-wishlist-trips/${userId}`,
        {
          withCredentials: true,
        },
      );
      return fulfillWithValue(data);
    } catch (error) {
      return rejectWithValue({
        errorMessage: error?.response?.data?.error || error.message,
      });
    }
  },
);

export const remove_wishlist_trip = createAsyncThunk(
  "wishlist/remove_wishlist_trip",
  async (wishlistId, { fulfillWithValue, rejectWithValue }) => {
    try {
      const { data } = await api.delete(
        `/home/trip/remove-wishlist-trip/${wishlistId}`,
        {
          withCredentials: true,
        },
      );
      return fulfillWithValue(data);
    } catch (error) {
      return rejectWithValue({
        errorMessage: error?.response?.data?.error || error.message,
      });
    }
  },
);

export const add_wishlist_to_cart = createAsyncThunk(
  "wishlist/add_wishlist_to_cart",
  async (
    { wishlistId, startingDate, travelersNumber },
    { fulfillWithValue, rejectWithValue },
  ) => {
    try {
      const { data } = await api.post(
        `/home/trip/add-wishlist-to-cart/${wishlistId}`,
        {
          startingDate,
          travelersNumber,
        },
        {
          withCredentials: true,
        },
      );
      return fulfillWithValue(data);
    } catch (error) {
      return rejectWithValue({
        errorMessage: error?.response?.data?.error || error.message,
      });
    }
  },
);
export const update_cart_trip = createAsyncThunk(
  "wishlist/update_cart_trip",
  async (info, { fulfillWithValue, rejectWithValue }) => {
    try {
      const { data } = await api.put("/home/trip/update-cart-trip", info, {
        withCredentials: true,
      });
      return fulfillWithValue(data);
    } catch (error) {
      return rejectWithValue({
        errorMessage: error?.response?.data?.error || error.message,
      });
    }
  },
);

export const clear_cart = createAsyncThunk(
  "wishlist/clear_cart",
  async (userId, { fulfillWithValue, rejectWithValue }) => {
    try {
      const { data } = await api.delete(`/home/trip/clear-cart/${userId}`, {
        withCredentials: true,
      });
      return fulfillWithValue(data);
    } catch (error) {
      return rejectWithValue({
        errorMessage: error?.response?.data?.error || error.message,
      });
    }
  },
);
export const wishlistReducer = createSlice({
  name: "wishlist",
  initialState: {
    cart_trips: [],
    cart_trip_count: 0,
    wishlist: [],
    wishlist_count: 0,
    total_price: 0,
    errorMessage: "",
    successMessage: "",
    loading: false,
  },
  reducers: {
    clearMessage: (state) => {
      state.errorMessage = "";
      state.successMessage = "";
    },
    clearCart: (state) => {
      state.cart_trips = [];
      state.cart_trip_count = 0;
      state.total_price = 0;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(add_to_cart.pending, (state) => {
        state.loading = true;
      })
      .addCase(add_to_cart.fulfilled, (state, { payload }) => {
        state.successMessage = payload.message;
        state.cart_trip_count += 1;
        state.loading = false;
      })
      .addCase(add_to_cart.rejected, (state, { payload }) => {
        state.errorMessage = payload.errorMessage;
        state.loading = false;
      })
      .addCase(update_cart_trip.pending, (state) => {
        state.loading = true;
      })
      .addCase(update_cart_trip.fulfilled, (state, { payload }) => {
        state.successMessage = payload.message;
        state.loading = false;
      })
      .addCase(update_cart_trip.rejected, (state, { payload }) => {
        state.errorMessage = payload.errorMessage;
        state.loading = false;
      })
      .addCase(get_cart_trips.pending, (state) => {
        state.loading = true;
      })
      .addCase(get_cart_trips.fulfilled, (state, { payload }) => {
        state.cart_trips = payload.cart_trips;
        state.cart_trip_count = payload.cart_trip_count;
        state.total_price = payload.total_price;
        state.loading = false;
      })
      .addCase(get_cart_trips.rejected, (state, { payload }) => {
        state.loading = false;
      })

      .addCase(delete_cart_trip.fulfilled, (state, { payload }) => {
        state.successMessage = payload.message;
        state.cart_trip_count -= 1;
      })
      .addCase(delete_cart_trip.rejected, (state, { payload }) => {
        state.errorMessage = payload.errorMessage;
      })

      .addCase(add_to_wishlist.pending, (state) => {
        state.loading = true;
      })
      .addCase(add_to_wishlist.fulfilled, (state, { payload }) => {
        state.successMessage = payload.message;
        state.wishlist = payload.data.wishlist;
        state.wishlist_count = payload.data.wishlist_count;
        state.loading = false;
      })
      .addCase(add_to_wishlist.rejected, (state, { payload }) => {
        state.errorMessage = payload.errorMessage;
        state.loading = false;
      })

      .addCase(get_wishlist_trips.pending, (state) => {
        state.loading = true;
      })
      .addCase(get_wishlist_trips.fulfilled, (state, { payload }) => {
        state.wishlist = payload.wishlist;
        state.wishlist_count = payload.wishlist_count;
        state.loading = false;
      })
      .addCase(get_wishlist_trips.rejected, (state, { payload }) => {
        state.loading = false;
      })

      .addCase(remove_wishlist_trip.fulfilled, (state, { payload }) => {
        state.successMessage = payload.message;
        state.wishlist = payload.data.wishlist;
        state.wishlist_count = payload.data.wishlist_count;
      })
      .addCase(remove_wishlist_trip.rejected, (state, { payload }) => {
        state.errorMessage = payload.errorMessage;
      })

      .addCase(add_wishlist_to_cart.fulfilled, (state, { payload }) => {
        state.successMessage = payload.message;
      })
      .addCase(clear_cart.pending, (state) => {
        state.loading = true;
      })
      .addCase(clear_cart.fulfilled, (state, { payload }) => {
        state.cart_trips = [];
        state.cart_trip_count = 0;
        state.total_price = 0;
        state.loading = false;
      })
      .addCase(clear_cart.rejected, (state, { payload }) => {
        state.errorMessage = payload.errorMessage;
        state.loading = false;
      })
      .addCase(add_wishlist_to_cart.rejected, (state, { payload }) => {
        state.errorMessage = payload.errorMessage;
      });
  },
});

export const { clearMessage } = wishlistReducer.actions;
export default wishlistReducer.reducer;
