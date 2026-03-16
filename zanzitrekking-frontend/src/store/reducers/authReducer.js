import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../../api/api";
import axios from "axios";

// ---------------------------------------------------------------------------
// Async Thunks
// ---------------------------------------------------------------------------

export const customer_register = createAsyncThunk(
  "auth/customer_register",
  async (info, { fulfillWithValue, rejectWithValue }) => {
    try {
      const { data } = await api.post("/customer/customer-register", info, {
        withCredentials: true,
      });
      // Backend sets httpOnly cookies — no tokens stored in JS
      // Backend should return customer info directly (not require a second fetch)
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
      // Backend sets httpOnly cookies — no tokens stored in JS
      // Backend should return customer info directly in the response
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
      // Separate axios instance to avoid request interceptor loop
      const refreshAxios = axios.create({
        baseURL: api.defaults.baseURL,
        withCredentials: true, // Cookie carries the refresh token — no JS access needed
      });

      const { data } = await refreshAxios.post("/customer/refresh-token", {});
      // Backend sets new httpOnly access + refresh cookies
      return fulfillWithValue(data);
    } catch (error) {
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
      const { data } = await api.get(`/customer/${customerId}`, {
        withCredentials: true,
      });
      return fulfillWithValue(data.customer);
    } catch (error) {
      const errorMessage = error?.response?.data?.error || error.message;
      return rejectWithValue(errorMessage);
    }
  },
);

export const get_company_info = createAsyncThunk(
  "auth/get_company_info",
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

/**
 * hydrateAuth — called once on app load.
 *
 * Hits a real /customer/me endpoint that:
 *   1. Reads the httpOnly access-token cookie (invisible to JS)
 *   2. Returns the customer object if the token is valid
 *   3. Returns 401 if not authenticated (no cookie / expired)
 *
 * The axios request interceptor should NOT retry this call on 401
 * (mark it with a special config flag if needed).
 */
export const hydrateAuth = createAsyncThunk(
  "auth/hydrateAuth",
  async (_, { fulfillWithValue, rejectWithValue }) => {
    try {
      const { data } = await api.get("/customer/me", {
        withCredentials: true,
      });
      // Expected response shape: { customer: { ... } }
      return fulfillWithValue(data.customer ?? null);
    } catch (error) {
      // 401 is expected when the user is not logged in — treat as a clean state
      if (error?.response?.status === 401) {
        return fulfillWithValue(null);
      }
      const errorMessage = error?.response?.data?.error || error.message;
      return rejectWithValue(errorMessage);
    }
  },
);

/**
 * customer_logout — tells the backend to clear the httpOnly cookies.
 * Never rely on just clearing Redux state; the cookie must be invalidated
 * server-side as well.
 */
export const customer_logout = createAsyncThunk(
  "auth/customer_logout",
  async (_, { fulfillWithValue, rejectWithValue }) => {
    try {
      await api.post("/customer/logout", {}, { withCredentials: true });
      return fulfillWithValue(null);
    } catch (error) {
      // Even if the request fails, clear local state so the UI reflects logout
      const errorMessage = error?.response?.data?.error || error.message;
      return rejectWithValue(errorMessage);
    }
  },
);

// ---------------------------------------------------------------------------
// Slice
// ---------------------------------------------------------------------------

const initialState = {
  loader: false,
  isInitialized: false, // true once hydrateAuth has settled
  userInfo: null,       // populated after login / hydrateAuth
  companyInfo: null,
  customer: null,
  errorMessage: "",
  successMessage: "",
  // No tokens in state — they live exclusively in httpOnly cookies
};

export const authReducer = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearMessage(state) {
      state.errorMessage = "";
      state.successMessage = "";
    },
    // Use this only as a local state reset; always call customer_logout thunk
    // first so the backend clears the httpOnly cookie.
    logout(state) {
      state.userInfo = null;
      state.customer = null;
      state.successMessage = "";
      state.errorMessage = "";
    },
  },
  extraReducers: (builder) => {
    builder
      // ── hydrateAuth ──────────────────────────────────────────────────────
      .addCase(hydrateAuth.pending, (state) => {
        state.loader = true;
      })
      .addCase(hydrateAuth.fulfilled, (state, { payload }) => {
        state.loader = false;
        state.isInitialized = true;
        state.userInfo = payload ?? null; // null = not logged in (clean state)
      })
      .addCase(hydrateAuth.rejected, (state) => {
        state.loader = false;
        state.isInitialized = true;
        state.userInfo = null;
      })

      // ── customer_logout ──────────────────────────────────────────────────
      .addCase(customer_logout.fulfilled, (state) => {
        state.userInfo = null;
        state.customer = null;
      })
      .addCase(customer_logout.rejected, (state) => {
        // Backend call failed, but still clear local state
        state.userInfo = null;
        state.customer = null;
      })

      // ── customer_register ────────────────────────────────────────────────
      .addCase(customer_register.pending, (state) => {
        state.loader = true;
      })
      .addCase(customer_register.fulfilled, (state, { payload }) => {
        state.loader = false;
        state.successMessage = payload.message;
        // Backend should return customer info in the register response
        state.userInfo = payload.customer ?? null;
      })
      .addCase(customer_register.rejected, (state, { payload }) => {
        state.loader = false;
        state.errorMessage = payload;
      })

      // ── customer_login ───────────────────────────────────────────────────
      .addCase(customer_login.pending, (state) => {
        state.loader = true;
      })
      .addCase(customer_login.fulfilled, (state, { payload }) => {
        state.loader = false;
        state.successMessage = payload.message;
        // Backend should return customer info in the login response
        state.userInfo = payload.customer ?? null;
      })
      .addCase(customer_login.rejected, (state, { payload }) => {
        state.loader = false;
        state.errorMessage = payload;
      })

      // ── refresh_token ────────────────────────────────────────────────────
      .addCase(refresh_token.pending, (state) => {
        state.loader = true;
      })
      .addCase(refresh_token.fulfilled, (state) => {
        state.loader = false;
        // Cookies updated by backend — no state changes needed
      })
      .addCase(refresh_token.rejected, (state) => {
        state.loader = false;
        // Refresh failed → treat as logged out
        state.userInfo = null;
        state.customer = null;
      })

      // ── google_login ─────────────────────────────────────────────────────
      .addCase(google_login.pending, (state) => {
        state.loader = true;
      })
      .addCase(google_login.fulfilled, (state, { payload }) => {
        state.loader = false;
        state.successMessage = payload.message;
        state.userInfo = payload.customer ?? null;
      })
      .addCase(google_login.rejected, (state, { payload }) => {
        state.loader = false;
        state.errorMessage = payload;
      })

      // ── facebook_login ───────────────────────────────────────────────────
      .addCase(facebook_login.pending, (state) => {
        state.loader = true;
      })
      .addCase(facebook_login.fulfilled, (state, { payload }) => {
        state.loader = false;
        state.successMessage = payload.message;
        state.userInfo = payload.customer ?? null;
      })
      .addCase(facebook_login.rejected, (state, { payload }) => {
        state.loader = false;
        state.errorMessage = payload;
      })

      // ── get_customer ─────────────────────────────────────────────────────
      .addCase(get_customer.pending, (state) => {
        state.loader = true;
      })
      .addCase(get_customer.fulfilled, (state, { payload }) => {
        state.loader = false;
        state.customer = payload;
      })
      .addCase(get_customer.rejected, (state) => {
        state.loader = false;
      })

      // ── get_company_info ─────────────────────────────────────────────────
      .addCase(get_company_info.pending, (state) => {
        state.loader = true;
      })
      .addCase(get_company_info.fulfilled, (state, { payload }) => {
        state.loader = false;
        state.companyInfo = payload;
      })
      .addCase(get_company_info.rejected, (state, { payload }) => {
        state.loader = false;
        state.errorMessage = payload;
      })

      // ── forgot_password ──────────────────────────────────────────────────
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

      // ── verify_otp ───────────────────────────────────────────────────────
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

      // ── reset_password ───────────────────────────────────────────────────
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

      // ── resend_otp ───────────────────────────────────────────────────────
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

export const { clearMessage, logout } = authReducer.actions;
// Keep backward-compat alias
export const get_conpany_info = get_company_info;
export default authReducer.reducer;
