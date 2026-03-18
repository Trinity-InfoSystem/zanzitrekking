import { configureStore } from "@reduxjs/toolkit";
import rootReducer from "./rootReducer";
import api from "../api/api";
import { refresh_token, admin_logout } from "./Reducers/authReducer";

const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) => {
    return getDefaultMiddleware({
      serializableCheck: false,
    });
  },
  devTools: true,
});

// ---------------------------------------------------------------------------
// Axios response interceptor — cookie-based auth, no localStorage involved
// ---------------------------------------------------------------------------

// Track if a refresh is currently in progress to prevent race conditions
let isRefreshing = false;
let failedQueue = [];

/**
 * Resolve or reject all queued requests that arrived while a token refresh
 * was in progress. No token is passed — the browser sends the refreshed
 * httpOnly cookie automatically on each retry.
 */
const processQueue = (error) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(); // Cookie handles auth — nothing to inject
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Endpoints that must never trigger a refresh attempt
    const authEndpoints = [
      "/admin-login",
      "/admin/refresh-token",
      "/refresh-token",
      "/forgot-password",
      "/verify-otp",
      "/reset-password",
    ];

    const isAuthEndpoint = authEndpoints.some((endpoint) =>
      originalRequest.url?.includes(endpoint),
    );

    // Only intercept 401s on non-auth endpoints, and only once per request
    if (
      error.response?.status === 401 &&
      !isAuthEndpoint &&
      !originalRequest._retry
    ) {
      // If a refresh is already running, queue this request until it resolves
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => api(originalRequest)) // Cookie auto-sent — no header injection
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const result = await store.dispatch(refresh_token());

        if (refresh_token.fulfilled.match(result)) {
          // Backend has set a fresh httpOnly access-token cookie.
          // No token to extract or inject — the browser handles it.
          processQueue(null);
          return api(originalRequest);
        }

        throw new Error("Token refresh failed");
      } catch (refreshError) {
        processQueue(refreshError);

        // Tell the backend to clear its cookies, then reset local auth state
        await store.dispatch(admin_logout());

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