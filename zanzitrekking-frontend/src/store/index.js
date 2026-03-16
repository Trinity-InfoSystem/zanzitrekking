import { configureStore } from "@reduxjs/toolkit";
import { rootReducer } from "./rootReducer";
import api from "../api/api";
import { logout, refresh_token } from "./reducers/authReducer";

/**
 * Redux store configuration.
 * Configures the store with root reducer and custom middleware.
 * Sets up Axios response interceptor for automatic token refresh on 401 errors.
 */
const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) => {
    return getDefaultMiddleware({
      serializableCheck: false,
    });
  },
  devTools: true,
});

/**
 * Axios response interceptor for handling authentication errors.
 * Automatically attempts to refresh the token when a 401 error is received.
 * Includes race condition protection to prevent multiple simultaneous refresh attempts.
 * Prevents infinite loops by checking for auth endpoints and retry count.
 */

// Track if a refresh is currently in progress to prevent race conditions
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // List of endpoints that should not trigger token refresh
    const authEndpoints = [
      "/customer/customer-login",
      "/customer/customer-register",
      "/customer/refresh-token",
      "/customer/forgot-password",
      "/customer/verify-otp",
      "/customer/reset-password",
      "/customer/google-login",
      "/customer/facebook-login",
    ];

    const isAuthEndpoint = authEndpoints.some((endpoint) =>
      originalRequest.url?.includes(endpoint)
    );

    // Only handle 401 errors for non-auth endpoints
    if (
      error.response &&
      error.response.status === 401 &&
      !isAuthEndpoint &&
      !originalRequest._retry
    ) {
      // If refresh is already in progress, queue this request
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const result = await store.dispatch(refresh_token());
        
        if (refresh_token.fulfilled.match(result)) {
          // Backend sets new httpOnly cookies - don't use localStorage
          // Cookies are sent automatically with withCredentials: true
          // No need to manually add Authorization header - cookies handle it
          
          // Process queued requests (no token needed - cookies handle auth)
          processQueue(null, null);
          
          // Retry original request - cookies will be sent automatically
          return api(originalRequest);
        } else {
          // Refresh failed
          throw new Error("Token refresh failed");
        }
      } catch (refreshError) {
        // Process queued requests with error
        processQueue(refreshError, null);
        
        // Clear tokens and logout
        store.dispatch(logout());
        
        // Redirect to login if not already there
        if (window.location.pathname !== "/login") {
          window.location.href = "/login";
        }
        
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

export default store;