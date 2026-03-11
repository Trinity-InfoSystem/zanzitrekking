import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../../api/api";
import axios from "axios";
import { jwtDecode } from "jwt-decode";

// Helper function to decode token
const decodeToken = (token) => {
  if (token) {
    try {
      const userInfo = jwtDecode(token);
      return userInfo;
    } catch (error) {
      return "";
    }
  }
  return "";
};

// Async thunks
export const customer_register = createAsyncThunk(
  "auth/customer_register",
  async (info, { fulfillWithValue, rejectWithValue }) => {
    try {
      const { data } = await api.post("/customer/customer-register", info, {
        withCredentials: true,
      });
      localStorage.setItem("accessToken", data.accessToken);
      localStorage.setItem("refreshToken", data.refreshToken);
      return fulfillWithValue(data);
    } catch (error) {
      const errorMessage = error?.response?.data?.error || error.message;
      return rejectWithValue(errorMessage);
    }
  },
);

export const customer_login = createAsyncThunk(
  "auth/customer_login",
  async (info, { fulfillWithValue, rejectWithValue }) => {
    try {
      const { data } = await api.post("/customer/customer-login", info, {
        withCredentials: true,
      });
      localStorage.setItem("accessToken", data.accessToken);
      localStorage.setItem("refreshToken", data.refreshToken);
      return fulfillWithValue(data);
    } catch (error) {
      const errorMessage = error?.response?.data?.error || error.message;
      return rejectWithValue(errorMessage);
    }
  },
);

export const refresh_token = createAsyncThunk(
  "auth/refresh_token",
  async (_, { fulfillWithValue, rejectWithValue }) => {
    try {
      const refreshToken = localStorage.getItem("refreshToken");

      if (!refreshToken) {
        throw new Error("No refresh token available");
      }

      // Use a separate axios instance to avoid interceptor loop
      const refreshAxios = axios.create({
        baseURL: api.defaults.baseURL,
        withCredentials: true,
      });

      const { data } = await refreshAxios.post(
        "/customer/refresh-token",
        {},
        {
          headers: {
            Authorization: `Bearer ${refreshToken}`,
          },
        },
      );

      // Update tokens in localStorage
      if (data.accessToken) {
        localStorage.setItem("accessToken", data.accessToken);
      }

      // Update refresh token if a new one is provided (for token rotation)
      if (data.refreshToken) {
        localStorage.setItem("refreshToken", data.refreshToken);
      }

      return fulfillWithValue(data);
    } catch (error) {
      // Clear tokens on failure
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      const errorMessage = error?.response?.data?.error || error.message;
      return rejectWithValue(errorMessage);
    }
  },
);

export const google_login = createAsyncThunk(
  "auth/google_login",
  async (access_token, { fulfillWithValue, rejectWithValue }) => {
    try {
      const { data } = await api.post(
        "/customer/google-login",
        { access_token },
        { withCredentials: true },
      );
      localStorage.setItem("accessToken", data.accessToken);
      localStorage.setItem("refreshToken", data.refreshToken);
      return fulfillWithValue(data);
    } catch (error) {
      const errorMessage = error?.response?.data?.error || error.message;
      return rejectWithValue(errorMessage);
    }
  },
);

export const facebook_login = createAsyncThunk(
  "auth/facebook_login",
  async ({ accessToken, userID }, { fulfillWithValue, rejectWithValue }) => {
    try {
      const { data } = await api.post(
        "/customer/facebook-login",
        { accessToken, userID },
        { withCredentials: true },
      );
      localStorage.setItem("accessToken", data.accessToken);
      localStorage.setItem("refreshToken", data.refreshToken);
      return fulfillWithValue(data);
    } catch (error) {
      const errorMessage = error?.response?.data?.error || error.message;
      return rejectWithValue(errorMessage);
    }
  },
);

export const get_customer = createAsyncThunk(
  "auth/get_customer",
  async (customerId, { fulfillWithValue, rejectWithValue }) => {
    try {
      const { data } = await api.get(`/customer/${customerId}`);
      return fulfillWithValue(data.customer);
    } catch (error) {
      const errorMessage = error?.response?.data?.error || error.message;
      return rejectWithValue(errorMessage);
    }
  },
);

export const get_conpany_info = createAsyncThunk(
  "auth/get_conpany_info",
  async (_, { fulfillWithValue, rejectWithValue }) => {
    try {
      const { data } = await api.get("/get-company-info", {
        withCredentials: true,
      });
      return fulfillWithValue(data.userInfo);
    } catch (error) {
      const errorMessage = error?.response?.data?.error || error.message;
      return rejectWithValue(errorMessage);
    }
  },
);

// Forgot Password Actions
export const forgot_password = createAsyncThunk(
  "auth/forgot_password",
  async (info, { fulfillWithValue, rejectWithValue }) => {
    try {
      const { data } = await api.post("/customer/forgot-password", info);
      return fulfillWithValue(data);
    } catch (error) {
      const errorMessage = error?.response?.data?.error || error.message;
      return rejectWithValue(errorMessage);
    }
  },
);

export const verify_otp = createAsyncThunk(
  "auth/verify_otp",
  async (info, { fulfillWithValue, rejectWithValue }) => {
    try {
      const { data } = await api.post("/customer/verify-otp", info);
      return fulfillWithValue(data);
    } catch (error) {
      const errorMessage = error?.response?.data?.error || error.message;
      return rejectWithValue(errorMessage);
    }
  },
);

export const reset_password = createAsyncThunk(
  "auth/reset_password",
  async (info, { fulfillWithValue, rejectWithValue }) => {
    try {
      const { data } = await api.post("/customer/reset-password", info);
      return fulfillWithValue(data);
    } catch (error) {
      const errorMessage = error?.response?.data?.error || error.message;
      return rejectWithValue(errorMessage);
    }
  },
);

export const resend_otp = createAsyncThunk(
  "auth/resend_otp",
  async (info, { fulfillWithValue, rejectWithValue }) => {
    try {
      const { data } = await api.post("/customer/resend-otp", info);
      return fulfillWithValue(data);
    } catch (error) {
      const errorMessage = error?.response?.data?.error || error.message;
      return rejectWithValue(errorMessage);
    }
  },
);

export const hydrateAuth = createAsyncThunk(
  "auth/hydrateAuth",
  async (_, { fulfillWithValue, rejectWithValue }) => {
    try {
      if (localStorage.getItem("accessToken")) {
        const decodedToken = decodeToken(localStorage.getItem("accessToken"));
        const { data } = await api.get(`/customer/${decodedToken.sub}`);
        return fulfillWithValue(data);
      }
    } catch (error) {
      const errorMessage = error?.response?.data?.error || error.message;
      return rejectWithValue(errorMessage);
    }
  },
);

// Initial state
const initialState = {
  loader: false,
  userInfo: decodeToken(localStorage.getItem("accessToken")) || null,
  companyInfo: null,
  customer: null,
  errorMessage: "",
  successMessage: "",
  accessToken: localStorage.getItem("accessToken") || null,
  refreshToken: localStorage.getItem("refreshToken") || null,
};

// Auth slice
export const authReducer = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearMessage: (state) => {
      state.errorMessage = "";
      state.successMessage = "";
    },
    logout: (state) => {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      state.userInfo = null;
      state.customer = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.successMessage = "";
      state.errorMessage = "";
    },
  },
  extraReducers: (builder) => {
    builder
      // Hydrate when token is present but user info is absent
      .addCase(hydrateAuth.pending, (state) => {
        state.loader = true;
      })
      .addCase(hydrateAuth.fulfilled, (state, { payload }) => {
        state.loader = false;
        state.userInfo = payload.customer;
      })
      .addCase(hydrateAuth.rejected, (state, { payload }) => {
        state.loader = false;
      })

      // Register
      .addCase(customer_register.pending, (state) => {
        state.loader = true;
      })
      .addCase(customer_register.fulfilled, (state, { payload }) => {
        state.loader = false;
        state.successMessage = payload.message;
        state.userInfo = payload.user;
        state.accessToken = payload.accessToken;
        state.refreshToken = payload.refreshToken;
      })
      .addCase(customer_register.rejected, (state, { payload }) => {
        state.loader = false;
        state.errorMessage = payload;
      })

      // Login
      .addCase(customer_login.pending, (state) => {
        state.loader = true;
      })
      .addCase(customer_login.fulfilled, (state, { payload }) => {
        state.loader = false;
        state.successMessage = payload.message;
        state.userInfo = payload.user;
        state.accessToken = payload.accessToken;
        state.refreshToken = payload.refreshToken;
      })
      .addCase(customer_login.rejected, (state, { payload }) => {
        state.loader = false;
        state.errorMessage = payload;
      })

      // Refresh Token
      .addCase(refresh_token.pending, (state) => {
        state.loader = true;
      })
      .addCase(refresh_token.fulfilled, (state, { payload }) => {
        state.loader = false;
        state.accessToken = payload.accessToken;
        state.userInfo = payload.user;
        // Update refresh token if a new one is provided (for token rotation)
        if (payload.refreshToken) {
          state.refreshToken = payload.refreshToken;
        }
      })
      .addCase(refresh_token.rejected, (state, { payload }) => {
        state.loader = false;
        state.errorMessage = payload;
        state.userInfo = null;
        state.accessToken = null;
        state.refreshToken = null;
      })

      // Google Login
      .addCase(google_login.pending, (state) => {
        state.loader = true;
      })
      .addCase(google_login.fulfilled, (state, { payload }) => {
        state.loader = false;
        state.successMessage = payload.message;
        state.userInfo = payload.user;
        state.accessToken = payload.accessToken;
        state.refreshToken = payload.refreshToken;
      })
      .addCase(google_login.rejected, (state, { payload }) => {
        state.loader = false;
        state.errorMessage = payload;
      })

      // Facebook Login
      .addCase(facebook_login.pending, (state) => {
        state.loader = true;
      })
      .addCase(facebook_login.fulfilled, (state, { payload }) => {
        state.loader = false;
        state.successMessage = payload.message;
        state.userInfo = payload.user;
        state.accessToken = payload.accessToken;
        state.refreshToken = payload.refreshToken;
      })
      .addCase(facebook_login.rejected, (state, { payload }) => {
        state.loader = false;
        state.errorMessage = payload;
      })

      // Get Customer
      .addCase(get_customer.pending, (state) => {
        state.loader = true;
      })
      .addCase(get_customer.fulfilled, (state, { payload }) => {
        state.loader = false;
        state.customer = payload;
      })
      .addCase(get_customer.rejected, (state, { payload }) => {
        state.loader = false;
        state.errorMessage = payload;
      })

      .addCase(get_conpany_info.pending, (state) => {
        state.loader = true;
      })
      .addCase(get_conpany_info.fulfilled, (state, { payload }) => {
        state.loader = false;
        state.companyInfo = payload;
      })
      .addCase(get_conpany_info.rejected, (state, { payload }) => {
        state.loader = false;
        state.errorMessage = payload;
      })

      // Forgot Password
      .addCase(forgot_password.pending, (state) => {
        state.loader = true;
      })
      .addCase(forgot_password.fulfilled, (state, { payload }) => {
        state.loader = false;
        state.successMessage = payload.message;
      })
      .addCase(forgot_password.rejected, (state, { payload }) => {
        state.loader = false;
        state.errorMessage = payload;
      })

      // Verify OTP
      .addCase(verify_otp.pending, (state) => {
        state.loader = true;
      })
      .addCase(verify_otp.fulfilled, (state, { payload }) => {
        state.loader = false;
        state.successMessage = payload.message;
      })
      .addCase(verify_otp.rejected, (state, { payload }) => {
        state.loader = false;
        state.errorMessage = payload;
      })

      // Reset Password
      .addCase(reset_password.pending, (state) => {
        state.loader = true;
      })
      .addCase(reset_password.fulfilled, (state, { payload }) => {
        state.loader = false;
        state.successMessage = payload.message;
      })
      .addCase(reset_password.rejected, (state, { payload }) => {
        state.loader = false;
        state.errorMessage = payload;
      })
      .addCase(resend_otp.pending, (state) => {
        state.loader = true;
      })
      .addCase(resend_otp.fulfilled, (state, { payload }) => {
        state.loader = false;
        state.successMessage = payload.message;
      })
      .addCase(resend_otp.rejected, (state, { payload }) => {
        state.loader = false;
        state.errorMessage = payload;
      });
  },
});

// Export actions
export const { clearMessage, logout } = authReducer.actions;
export default authReducer.reducer;
