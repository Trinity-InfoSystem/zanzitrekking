import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../../api/api";
import axios from "axios";

// ---------------------------------------------------------------------------
// Cross-tab logout sync via BroadcastChannel (replaces localStorage hack)
// ---------------------------------------------------------------------------

const getAuthChannel = () => {
  if (typeof window !== "undefined" && "BroadcastChannel" in window) {
    return new BroadcastChannel("admin_auth");
  }
  return null;
};

// ---------------------------------------------------------------------------
// Async Thunks
// ---------------------------------------------------------------------------

export const admin_login = createAsyncThunk(
  "auth/admin_login",
  async (info, { fulfillWithValue, rejectWithValue }) => {
    try {
      const { data } = await api.post("/admin-login", info, {
        withCredentials: true, // Cookie carries the token — nothing stored in JS
      });

      if (!data.userInfo) {
        return rejectWithValue({
          errorMessage: data.message || "Login failed. Invalid response from server.",
        });
      }

      // On successful login, tell other tabs to sync
      getAuthChannel()?.postMessage({ type: "login" });

      return fulfillWithValue(data);
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Login failed. Please try again.";
      return rejectWithValue({ errorMessage });
    }
  },
);

/**
 * admin_logout — always call this instead of dispatching the logout action
 * directly. It tells the backend to clear the httpOnly cookie, then broadcasts
 * to other tabs.
 */
export const admin_logout = createAsyncThunk(
  "auth/admin_logout",
  async (_, { fulfillWithValue, rejectWithValue }) => {
    try {
      await api.post("/logout", {}, { withCredentials: true });
      getAuthChannel()?.postMessage({ type: "logout" });
      return fulfillWithValue(null);
    } catch (error) {
      // Even if the server call fails, clear local state and broadcast
      getAuthChannel()?.postMessage({ type: "logout" });
      const errorMessage = error.response?.data?.message || error.message;
      return rejectWithValue({ errorMessage });
    }
  },
);

export const forgot_password = createAsyncThunk(
  "auth/forgot_password",
  async (emailData, { fulfillWithValue, rejectWithValue }) => {
    try {
      const { data } = await api.post("/forgot-password", emailData);
      return fulfillWithValue(data);
    } catch (error) {
      const errorMessage =
        error.response?.data?.error ||
        error.response?.data?.message ||
        error.message;
      return rejectWithValue({ errorMessage });
    }
  },
);

export const verify_otp = createAsyncThunk(
  "auth/verify_otp",
  async (otpData, { fulfillWithValue, rejectWithValue }) => {
    try {
      const { data } = await api.post("/verify-otp", otpData);
      return fulfillWithValue(data);
    } catch (error) {
      const errorMessage =
        error.response?.data?.error ||
        error.response?.data?.message ||
        error.message;
      return rejectWithValue({ errorMessage });
    }
  },
);

export const reset_password = createAsyncThunk(
  "auth/reset_password",
  async (passwordData, { fulfillWithValue, rejectWithValue }) => {
    try {
      const { data } = await api.post("/reset-password", passwordData);
      return fulfillWithValue(data);
    } catch (error) {
      const errorMessage =
        error.response?.data?.error ||
        error.response?.data?.message ||
        error.message;
      return rejectWithValue({ errorMessage });
    }
  },
);

/**
 * get_user_info — called on app load to verify the session cookie and
 * rehydrate Redux state. The backend reads the httpOnly cookie and returns
 * the user object if valid, or 401 if not.
 *
 * No localStorage involved — the cookie is the single source of truth.
 */
export const get_user_info = createAsyncThunk(
  "auth/get_user_info",
  async (_, { fulfillWithValue, rejectWithValue }) => {
    try {
      const { data } = await api.get("/get-user", {
        withCredentials: true,
      });
      return fulfillWithValue(data);
    } catch (error) {
      // 401 = not authenticated — clean, expected state
      if (error?.response?.status === 401) {
        return fulfillWithValue({ userInfo: null });
      }
      const errorMessage = error.response?.data?.message || error.message;
      return rejectWithValue({ errorMessage });
    }
  },
);

export const upload_profile_image = createAsyncThunk(
  "auth/upload_profile_image",
  async (formData, { fulfillWithValue, rejectWithValue }) => {
    try {
      const { data } = await api.post("/profile-image-upload", formData, {
        withCredentials: true,
      });
      return fulfillWithValue(data);
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      return rejectWithValue({ errorMessage });
    }
  },
);

export const update_company_info = createAsyncThunk(
  "auth/update_company_info",
  async (userData, { fulfillWithValue, rejectWithValue }) => {
    try {
      const { data } = await api.post("/update-company-info", userData, {
        withCredentials: true,
      });
      return fulfillWithValue(data);
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      return rejectWithValue({ errorMessage });
    }
  },
);

export const update_password = createAsyncThunk(
  "auth/update_password",
  async (passwordState, { fulfillWithValue, rejectWithValue }) => {
    try {
      const { data } = await api.put("/update-password", passwordState, {
        withCredentials: true,
      });
      return fulfillWithValue(data);
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      return rejectWithValue({ errorMessage });
    }
  },
);

/**
 * refresh_token — uses a dedicated axios instance (no interceptors) to avoid
 * infinite retry loops. The httpOnly refresh-token cookie is sent automatically
 * by the browser — no JS reads or writes any token.
 */
export const refresh_token = createAsyncThunk(
  "auth/refresh_token",
  async (_, { fulfillWithValue, rejectWithValue }) => {
    try {
      const refreshAxios = axios.create({
        baseURL: api.defaults.baseURL,
        withCredentials: true, // Cookie carries the refresh token
      });

      const { data } = await refreshAxios.post(
        "/refresh-token",
        {},
        { withCredentials: true },
      );

      // Backend sets a new httpOnly access-token cookie — nothing to store in JS
      return fulfillWithValue(data);
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      return rejectWithValue({ errorMessage });
    }
  },
);

export const get_all_admins = createAsyncThunk(
  "auth/get_all_admins",
  async (_, { fulfillWithValue, rejectWithValue }) => {
    try {
      const { data } = await api.get("/get-all-admins", {
        withCredentials: true,
      });
      return fulfillWithValue(data);
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      return rejectWithValue({ errorMessage });
    }
  },
);

export const update_admin_access_routes = createAsyncThunk(
  "auth/update_admin_access_routes",
  async ({ id, accessRoutes }, { fulfillWithValue, rejectWithValue }) => {
    try {
      const { data } = await api.put(
        `/update-admin-access-routes/${id}`,
        { accessRoutes },
        { withCredentials: true },
      );
      return fulfillWithValue(data);
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      return rejectWithValue({ errorMessage });
    }
  },
);

export const create_admin = createAsyncThunk(
  "auth/create_admin",
  async (adminData, { fulfillWithValue, rejectWithValue }) => {
    try {
      const { data } = await api.post("/create-admin", adminData, {
        withCredentials: true,
      });
      return fulfillWithValue(data);
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      return rejectWithValue({ errorMessage });
    }
  },
);

export const delete_admin = createAsyncThunk(
  "auth/delete_admin",
  async ({ adminId, currentAdminId }, { fulfillWithValue, rejectWithValue }) => {
    try {
      const { data } = await api.delete(`/delete-admin/${adminId}`, {
        withCredentials: true,
        data: { currentAdminId },
      });
      return fulfillWithValue(data);
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      return rejectWithValue({ errorMessage });
    }
  },
);

// ---------------------------------------------------------------------------
// Slice
// ---------------------------------------------------------------------------

const initialState = {
  successMessage: "",
  errorMessage: "",
  loader: false,
  userInfo: null,
  // Role is always derived from userInfo on the server — never trusted from
  // local state alone. Use a selector: selectRole = state => state.auth.userInfo?.role
  forgotPasswordEmail: "",
  otpVerified: false,
  allAdmins: null,
  isInitialized: false, // true once get_user_info has settled on app load
  // No token field — tokens live exclusively in httpOnly cookies
};

const authReducer = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearMessage(state) {
      state.errorMessage = "";
      state.successMessage = "";
    },
    /**
     * Use this only as a local state reset.
     * Always dispatch admin_logout (thunk) first so the backend clears the cookie.
     */
    logout(state) {
      state.userInfo = null;
      state.forgotPasswordEmail = "";
      state.otpVerified = false;
      state.isInitialized = true;
      state.successMessage = "";
      state.errorMessage = "";
    },
    resetForgotPasswordState(state) {
      state.forgotPasswordEmail = "";
      state.otpVerified = false;
    },
    setAllAdmins(state, { payload }) {
      state.allAdmins = payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // ── admin_login ──────────────────────────────────────────────────────
      .addCase(admin_login.pending, (state) => {
        state.loader = true;
        state.errorMessage = "";
      })
      .addCase(admin_login.fulfilled, (state, { payload }) => {
        state.loader = false;
        state.successMessage = payload.message || "Login successful";
        // Role is read from the server-returned userInfo, not stored separately.
        // Use state.auth.userInfo?.role in selectors — never trust a standalone
        // role field that could be tampered with via Redux DevTools.
        state.userInfo = payload.userInfo;
        state.isInitialized = true;
        state.errorMessage = "";
      })
      .addCase(admin_login.rejected, (state, { payload }) => {
        state.loader = false;
        state.errorMessage =
          payload?.errorMessage || "Login failed. Please check your credentials.";
        state.successMessage = "";
        state.userInfo = null;
      })

      // ── admin_logout ─────────────────────────────────────────────────────
      .addCase(admin_logout.fulfilled, (state) => {
        state.userInfo = null;
        state.isInitialized = true;
        state.successMessage = "";
        state.errorMessage = "";
      })
      .addCase(admin_logout.rejected, (state) => {
        // Server call failed, but still clear local state
        state.userInfo = null;
        state.isInitialized = true;
      })

      // ── get_user_info ────────────────────────────────────────────────────
      .addCase(get_user_info.pending, (state) => {
        state.loader = true;
      })
      .addCase(get_user_info.fulfilled, (state, { payload }) => {
        state.loader = false;
        state.isInitialized = true;
        state.userInfo = payload.userInfo ?? null;
        // Only set successMessage for explicit user-triggered actions,
        // not for silent session-rehydration calls
      })
      .addCase(get_user_info.rejected, (state, { payload }) => {
        state.loader = false;
        state.isInitialized = true;
        state.userInfo = null;
        state.errorMessage = payload?.errorMessage ?? "";
      })

      // ── forgot_password ──────────────────────────────────────────────────
      .addCase(forgot_password.pending, (state) => {
        state.loader = true;
      })
      .addCase(forgot_password.fulfilled, (state, { payload }) => {
        state.loader = false;
        state.successMessage = payload.message;
        state.forgotPasswordEmail = payload.email ?? "";
        state.errorMessage = "";
      })
      .addCase(forgot_password.rejected, (state, { payload }) => {
        state.loader = false;
        state.errorMessage = payload?.errorMessage ?? "";
      })

      // ── verify_otp ───────────────────────────────────────────────────────
      .addCase(verify_otp.pending, (state) => {
        state.loader = true;
      })
      .addCase(verify_otp.fulfilled, (state, { payload }) => {
        state.loader = false;
        state.successMessage = payload.message;
        state.otpVerified = payload.verified ?? false;
        state.errorMessage = "";
      })
      .addCase(verify_otp.rejected, (state, { payload }) => {
        state.loader = false;
        state.errorMessage = payload?.errorMessage ?? "";
        state.otpVerified = false;
      })

      // ── reset_password ───────────────────────────────────────────────────
      .addCase(reset_password.pending, (state) => {
        state.loader = true;
      })
      .addCase(reset_password.fulfilled, (state, { payload }) => {
        state.loader = false;
        state.successMessage = payload.message;
        state.forgotPasswordEmail = "";
        state.otpVerified = false;
        state.errorMessage = "";
      })
      .addCase(reset_password.rejected, (state, { payload }) => {
        state.loader = false;
        state.errorMessage = payload?.errorMessage ?? "";
      })

      // ── upload_profile_image ─────────────────────────────────────────────
      .addCase(upload_profile_image.pending, (state) => {
        state.loader = true;
      })
      .addCase(upload_profile_image.fulfilled, (state, { payload }) => {
        state.loader = false;
        state.userInfo = payload.data;
        state.successMessage = payload.message;
      })
      .addCase(upload_profile_image.rejected, (state, { payload }) => {
        state.loader = false;
        state.errorMessage = payload?.errorMessage ?? "";
      })

      // ── update_company_info ──────────────────────────────────────────────
      .addCase(update_company_info.pending, (state) => {
        state.loader = true;
      })
      .addCase(update_company_info.fulfilled, (state, { payload }) => {
        state.loader = false;
        state.userInfo = payload.userInfo;
        state.successMessage = payload.message;
      })
      .addCase(update_company_info.rejected, (state, { payload }) => {
        state.loader = false;
        state.errorMessage = payload?.errorMessage ?? "";
      })

      // ── update_password ──────────────────────────────────────────────────
      .addCase(update_password.pending, (state) => {
        state.loader = true;
      })
      .addCase(update_password.fulfilled, (state, { payload }) => {
        state.loader = false;
        state.userInfo = payload.userInfo;
        state.successMessage = payload.message;
      })
      .addCase(update_password.rejected, (state, { payload }) => {
        state.loader = false;
        state.errorMessage = payload?.errorMessage ?? "";
      })

      // ── refresh_token ────────────────────────────────────────────────────
      .addCase(refresh_token.fulfilled, (state, { payload }) => {
        // Cookies updated by backend — no token fields to update in state
        if (payload?.userInfo) {
          state.userInfo = payload.userInfo;
        }
      })
      .addCase(refresh_token.rejected, (state) => {
        // Refresh failed — session is over
        state.userInfo = null;
      })

      // ── get_all_admins ───────────────────────────────────────────────────
      .addCase(get_all_admins.pending, (state) => {
        state.loader = true;
      })
      .addCase(get_all_admins.fulfilled, (state, { payload }) => {
        state.loader = false;
        state.allAdmins = payload.admins;
      })
      .addCase(get_all_admins.rejected, (state, { payload }) => {
        state.loader = false;
        state.errorMessage = payload?.errorMessage ?? "";
      })

      // ── update_admin_access_routes ───────────────────────────────────────
      .addCase(update_admin_access_routes.pending, (state) => {
        state.loader = true;
      })
      .addCase(update_admin_access_routes.fulfilled, (state, { payload }) => {
        state.loader = false;
        state.successMessage = payload.message;
      })
      .addCase(update_admin_access_routes.rejected, (state, { payload }) => {
        state.loader = false;
        state.errorMessage = payload?.errorMessage ?? "";
      })

      // ── create_admin ─────────────────────────────────────────────────────
      .addCase(create_admin.pending, (state) => {
        state.loader = true;
      })
      .addCase(create_admin.fulfilled, (state, { payload }) => {
        state.loader = false;
        state.successMessage = payload.message;
        if (state.allAdmins && payload.admin) {
          state.allAdmins.push(payload.admin);
        }
      })
      .addCase(create_admin.rejected, (state, { payload }) => {
        state.loader = false;
        state.errorMessage = payload?.errorMessage ?? "";
      })

      // ── delete_admin ─────────────────────────────────────────────────────
      .addCase(delete_admin.pending, (state) => {
        state.loader = true;
      })
      .addCase(delete_admin.fulfilled, (state, { payload }) => {
        state.loader = false;
        state.successMessage = payload.message;
        if (state.allAdmins && payload.deletedAdmin?.id) {
          state.allAdmins = state.allAdmins.filter(
            (admin) => admin._id !== payload.deletedAdmin.id,
          );
        }
      })
      .addCase(delete_admin.rejected, (state, { payload }) => {
        state.loader = false;
        state.errorMessage = payload?.errorMessage ?? "";
      });
  },
});

export const { clearMessage, logout, resetForgotPasswordState, setAllAdmins } =
  authReducer.actions;
export default authReducer.reducer;