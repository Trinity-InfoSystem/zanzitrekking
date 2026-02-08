import { configureStore } from "@reduxjs/toolkit";
import rootReducer from "./rootReducer";
import api from "../api/api";
import { refresh_token, logout } from "./Reducers/authReducer";

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
      "/admin-login",
      "/admin/refresh-token",
      "/refresh-token",
      "/forgot-password",
      "/verify-otp",
      "/reset-password",
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
            if (token) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
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
          const newToken = result.payload?.accessToken;
          let tokenToUse = newToken;

          // If no token in response, try to get from localStorage
          if (!tokenToUse) {
            const storedToken = localStorage.getItem("accessToken");
            if (storedToken) {
              try {
                tokenToUse = JSON.parse(storedToken);
              } catch {
                tokenToUse = storedToken;
              }
            }
          }

          // Process queued requests
          processQueue(null, tokenToUse);

          // Retry original request with new token
          if (tokenToUse) {
            originalRequest.headers.Authorization = `Bearer ${tokenToUse}`;
          }
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
        localStorage.removeItem("accessToken");

        // Redirect to login if not already there
        if (window.location.pathname !== "/admin/login") {
          window.location.href = "/admin/login";
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