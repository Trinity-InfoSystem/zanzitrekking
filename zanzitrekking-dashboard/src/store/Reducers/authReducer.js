import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../../api/api";
import axios from "axios";
import { jwtDecode } from "jwt-decode";

// Login Action
export const admin_login = createAsyncThunk(
  "auth/admin_login",
  async (info, { fulfillWithValue, rejectWithValue }) => {
    try {
      // Clear logout timestamp at the start of login attempt
      // This ensures a fresh login attempt isn't blocked by previous logout
      localStorage.removeItem("logoutTimestamp");

      const { data } = await api.post("admin-login", info, {
        withCredentials: true,
      });

      // Store accessToken if provided in response (backend now returns it)
      // This serves as a fallback if cookies aren't working
      if (data.accessToken) {
        localStorage.setItem("accessToken", data.accessToken);
      } else if (data.token) {
        // Backward compatibility
        localStorage.setItem("accessToken", typeof data.token === 'string' ? data.token : JSON.stringify(data.token));
      }

      // Validate that we have userInfo before fulfilling
      if (!data.userInfo) {
        const errorMessage =
          data.message || "Login failed. Invalid response from server.";
        return rejectWithValue({ errorMessage });
      }

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

// Forgot Password Action
export const forgot_password = createAsyncThunk(
  "auth/forgot_password",
  async (emailData, { fulfillWithValue, rejectWithValue }) => {
    try {
      const { data } = await api.post("forgot-password", emailData);
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

// Verify OTP Action
export const verify_otp = createAsyncThunk(
  "auth/verify_otp",
  async (otpData, { fulfillWithValue, rejectWithValue }) => {
    try {
      const { data } = await api.post("verify-otp", otpData);
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

// Reset Password Action
export const reset_password = createAsyncThunk(
  "auth/reset_password",
  async (passwordData, { fulfillWithValue, rejectWithValue }) => {
    try {
      const { data } = await api.post("reset-password", passwordData);
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

// Fetch User Info Action
export const get_user_info = createAsyncThunk(
  "auth/get_user_info",
  async (_, { fulfillWithValue, rejectWithValue, getState }) => {
    try {
      const state = getState();
      const logoutTimestamp = localStorage.getItem("logoutTimestamp");
      
      // Check if logout was triggered (cross-tab sync)
      // Only check if we don't have userInfo AND we're not in the middle of a login
      // If we have userInfo, we're already logged in, so ignore logoutTimestamp
      if (logoutTimestamp && !state.auth.userInfo) {
        // Logout was triggered and we don't have userInfo, don't proceed with auth check
        localStorage.removeItem("accessToken");
        return rejectWithValue({ errorMessage: "Logged out" });
      }

      // If we have userInfo, clear logoutTimestamp (user is logged in)
      if (state.auth.userInfo && logoutTimestamp) {
        localStorage.removeItem("logoutTimestamp");
      }

      const { data } = await api.get("get-user", { withCredentials: true });
      
      // If auth check succeeds, clear any logout timestamp (user is still logged in)
      localStorage.removeItem("logoutTimestamp");
      
      return fulfillWithValue(data);
    } catch (error) {
      // Only clear tokens on error if we don't have userInfo
      // This prevents clearing during an active session
      const state = getState();
      if (!state.auth.userInfo) {
        localStorage.removeItem("accessToken");
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

// Update Profile Info
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

export const refresh_token = createAsyncThunk(
  "auth/refresh_token",
  async (_, { fulfillWithValue, rejectWithValue }) => {
    try {
      // Get refresh token from localStorage if available (fallback)
      const storedToken = localStorage.getItem("accessToken");
      let refreshToken = null;

      // Try to get refresh token from cookie first (preferred)
      // If not available, we'll rely on cookies being sent automatically
      
      // Use a separate axios instance to avoid interceptor loop
      const refreshAxios = axios.create({
        baseURL: api.defaults.baseURL,
        withCredentials: true,
      });

      // Add Authorization header if we have a stored token (fallback)
      const headers = {};
      if (storedToken) {
        try {
          const parsedToken = JSON.parse(storedToken);
          headers.Authorization = `Bearer ${parsedToken}`;
        } catch {
          headers.Authorization = `Bearer ${storedToken}`;
        }
      }

      const { data } = await refreshAxios.post(
        "/refresh-token",
        {},
        { 
          withCredentials: true,
          headers,
        },
      );

      // Update accessToken in localStorage if provided
      if (data.accessToken) {
        localStorage.setItem("accessToken", data.accessToken);
      }

      return fulfillWithValue(data);
    } catch (error) {
      // Clear tokens on failure
      localStorage.removeItem("accessToken");
      const errorMessage = error.response?.data?.message || error.message;
      return rejectWithValue({ errorMessage });
    }
  },
);

// Get All Admins Action

export const get_all_admins = createAsyncThunk(
  "auth/get_all_admins",
  async (_, { fulfillWithValue, rejectWithValue }) => {
    try {
      const { data } = await api.get("get-all-admins", {
        withCredentials: true,
      });

      return fulfillWithValue(data);
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      return rejectWithValue({ errorMessage });
    }
  },
);

// Update Admin Access Routes Action

export const update_admin_access_routes = createAsyncThunk(
  "auth/update_admin_access_routes",
  async ({ id, accessRoutes }, { fulfillWithValue, rejectWithValue }) => {
    try {
      const { data } = await api.put(
        `update-admin-access-routes/${id}`,
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

// Create Admin Action

export const create_admin = createAsyncThunk(
  "auth/create_admin",
  async (adminData, { fulfillWithValue, rejectWithValue }) => {
    try {
      const { data } = await api.post("create-admin", adminData, {
        withCredentials: true,
      });

      return fulfillWithValue(data);
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      return rejectWithValue({ errorMessage });
    }
  },
);

// Delete Admin Action

export const delete_admin = createAsyncThunk(
  "auth/delete_admin",
  async (
    { adminId, currentAdminId },
    { fulfillWithValue, rejectWithValue },
  ) => {
    try {
      const { data } = await api.delete(`delete-admin/${adminId}`, {
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

// Auth Slice
const authReducer = createSlice({
  name: "auth",
  initialState: {
    successMessage: "",
    errorMessage: "",
    loader: false,
    userInfo: null,
    role: "",
    token: null,
    forgotPasswordEmail: "", // Store email for OTP verification
    otpVerified: false, // Track if OTP was successfully verified
    allAdmins: null,
    isInitialized: false, // Track if we've attempted to verify user on app load
  },
  reducers: {
    clearMessage: (state) => {
      return {
        ...state,
        errorMessage: "",
        successMessage: "",
      };
    },
    logout(state) {
      state.userInfo = null;
      state.token = null;
      state.role = "";
      state.isInitialized = true; // Set to true so components know auth state (logged out)
      // Clear localStorage
      localStorage.removeItem("accessToken");
      // Set logout timestamp to sync across tabs
      // Keep this timestamp so other tabs can detect logout on refresh
      localStorage.setItem("logoutTimestamp", Date.now().toString());
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
      // Admin Login
      .addCase(admin_login.pending, (state) => {
        state.loader = true;
      })
      .addCase(admin_login.fulfilled, (state, { payload }) => {
        state.loader = false;
        // Only set success if userInfo actually exists
        if (payload && payload.userInfo) {
          state.successMessage = payload.message || "Login successful";
          state.userInfo = payload.userInfo;
          // Store accessToken if provided (prefer accessToken over token)
          state.token = payload.accessToken || payload.token;
          state.role = payload.userInfo.role || payload.role;
          state.errorMessage = "";
          state.isInitialized = true; // Mark as initialized after successful login
          // Clear logout timestamp on successful login (critical - must happen immediately)
          // This prevents get_user_info from seeing it and logging the user out
          localStorage.removeItem("logoutTimestamp");
          sessionStorage.removeItem("logoutTimestamp");
        } else {
          // If no userInfo, treat as error
          state.errorMessage =
            payload?.message || "Login failed. Please try again.";
          state.successMessage = "";
          state.userInfo = null;
          state.token = null;
          state.role = null;
        }
      })
      .addCase(admin_login.rejected, (state, { payload }) => {
        state.loader = false;
        state.errorMessage =
          payload?.errorMessage ||
          "Login failed. Please check your credentials.";
        state.successMessage = "";
        state.userInfo = null;
        state.token = null;
        state.role = null;
      })

      // Forgot Password
      .addCase(forgot_password.pending, (state) => {
        state.loader = true;
      })
      .addCase(forgot_password.fulfilled, (state, { payload }) => {
        state.loader = false;
        state.successMessage = payload.message;
        state.forgotPasswordEmail = payload.email; // Store email for next steps
        state.errorMessage = "";
      })
      .addCase(forgot_password.rejected, (state, { payload }) => {
        state.loader = false;
        state.errorMessage = payload.errorMessage;
      })

      // Verify OTP
      .addCase(verify_otp.pending, (state) => {
        state.loader = true;
      })
      .addCase(verify_otp.fulfilled, (state, { payload }) => {
        state.loader = false;
        state.successMessage = payload.message;
        state.otpVerified = payload.verified;
        state.errorMessage = "";
      })
      .addCase(verify_otp.rejected, (state, { payload }) => {
        state.loader = false;
        state.errorMessage = payload.errorMessage;
        state.otpVerified = false;
      })

      // Reset Password
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
        state.errorMessage = payload.errorMessage;
      })

      // Get User Info
      .addCase(get_user_info.pending, (state) => {
        state.loader = true;
      })
      .addCase(get_user_info.fulfilled, (state, { payload }) => {
        state.loader = false;
        state.userInfo = payload.userInfo;
        state.successMessage = payload.message;
        state.isInitialized = true; // Mark as initialized after verification attempt
        // Clear logout timestamp on successful auth check
        localStorage.removeItem("logoutTimestamp");
      })
      .addCase(get_user_info.rejected, (state, { payload }) => {
        state.loader = false;
        // Only clear userInfo if the error is specifically "Logged out" AND we don't have userInfo
        // If we have userInfo, it means we just logged in successfully, so don't clear it
        // This prevents immediate logout after successful login
        if (payload?.errorMessage === "Logged out" && !state.userInfo) {
          state.userInfo = null;
          state.token = null;
          state.role = null;
        }
        // Don't set errorMessage if we have userInfo (user is logged in, just verification failed)
        if (!state.userInfo) {
          state.errorMessage = payload?.errorMessage;
        }
        state.isInitialized = true; // Mark as initialized even if verification failed
      })

      // Upload Profile Image
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
        state.errorMessage = payload.errorMessage;
        state.userInfo = null;
      })

      // Update Company Info
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
        state.errorMessage = payload.errorMessage;
        state.userInfo = null;
      })

      // Update Password
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
        state.errorMessage = payload;
        state.userInfo = null;
      })

      // Refresh Token
      .addCase(refresh_token.fulfilled, (state, { payload }) => {
        // Don't set successMessage for token refresh - it's automatic and shouldn't show toasts
        // Update accessToken if provided
        if (payload?.accessToken) {
          state.token = payload.accessToken;
        }
        // Only update userInfo if provided
        if (payload?.userInfo) {
          state.userInfo = payload.userInfo;
        }
      })
      .addCase(refresh_token.rejected, (state) => {
        // Token refresh failed - clear auth state
        state.userInfo = null;
        state.token = null;
        state.role = null;
      })

      // Get All Admins
      .addCase(get_all_admins.pending, (state) => {
        state.loader = true;
      })
      .addCase(get_all_admins.fulfilled, (state, { payload }) => {
        state.loader = false;
        state.allAdmins = payload.admins;
      })
      .addCase(get_all_admins.rejected, (state, { payload }) => {
        state.loader = false;
        state.errorMessage = payload.errorMessage;
        state.allAdmins = null;
      })

      // Update Admin Access Routes
      .addCase(update_admin_access_routes.pending, (state) => {
        state.loader = true;
      })
      .addCase(update_admin_access_routes.fulfilled, (state, { payload }) => {
        state.loader = false;
        state.successMessage = payload.message;
      })
      .addCase(update_admin_access_routes.rejected, (state, { payload }) => {
        state.successMessage = "";
        state.loader = false;
        state.errorMessage = payload.errorMessage;
      })

      // Create Admin
      .addCase(create_admin.pending, (state) => {
        state.loader = true;
      })
      .addCase(create_admin.fulfilled, (state, { payload }) => {
        state.loader = false;
        state.successMessage = payload.message;
        // Add new admin to the list
        if (state.allAdmins) {
          state.allAdmins.push(payload.admin);
        }
      })
      .addCase(create_admin.rejected, (state, { payload }) => {
        state.loader = false;
        state.errorMessage = payload.errorMessage;
      })

      // Delete Admin
      .addCase(delete_admin.pending, (state) => {
        state.loader = true;
      })
      .addCase(delete_admin.fulfilled, (state, { payload }) => {
        state.loader = false;
        state.successMessage = payload.message;
        // Remove deleted admin from the list
        if (state.allAdmins) {
          state.allAdmins = state.allAdmins.filter(
            (admin) => admin._id !== payload.deletedAdmin.id,
          );
        }
      })
      .addCase(delete_admin.rejected, (state, { payload }) => {
        state.loader = false;
        state.errorMessage = payload.errorMessage;
      });
  },
});

export const { clearMessage, logout, resetForgotPasswordState } =
  authReducer.actions;
export default authReducer.reducer;
