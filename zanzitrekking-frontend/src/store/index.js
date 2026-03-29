import { configureStore } from "@reduxjs/toolkit";
import { rootReducer } from "./rootReducer";
import api from "../api/api";
import { customer_logout, refresh_token } from "./reducers/authReducer";

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

    // Endpoints that must NOT trigger refresh on 401 (login/register flows, refresh itself).
    // Note: /customer/me is NOT listed — if the access cookie expired but refresh is valid,
    // we need refresh + retry so hydrateAuth can restore the session.
    const authEndpoints = [
      "/customer/customer-login",
      "/customer/customer-register",
      "/customer/refresh-token",
      "/customer/forgot-password",
      "/customer/verify-otp",
      "/customer/reset-password",
      "/customer/google-login",
      "/customer/facebook-login",
      "/customer/logout",
    ];

    const isAuthEndpoint = authEndpoints.some((endpoint) =>
      originalRequest.url?.includes(endpoint),
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
            // Cookie-based auth: token is often null; never send "Bearer null"
            if (token) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            } else if (originalRequest.headers?.Authorization) {
              delete originalRequest.headers.Authorization;
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

        // GET /customer/me is the session probe (hydrateAuth). For visitors with no cookies,
        // /customer/me returns 401, refresh fails — that is "not logged in", not "must redirect".
        // Forcing /login here breaks every first visit to the public site.
        const isSessionProbe =
          originalRequest.url?.includes("/customer/me") ?? false;

        if (isSessionProbe) {
          return Promise.reject(error);
        }

        // Authenticated flows: refresh failed — clear session and send user to login
        await store.dispatch(customer_logout());

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
