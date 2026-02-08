import axios from "axios";
import { safeRedirect } from "../utils/urlValidation";

const production = "https://api.zanzisafaris.com";
const local = "http://localhost:5000";

/**
 * Base URL for API requests.
 * Currently uses production URL. Uncomment the conditional to switch based on environment.
 */
const baseURL = `${local}/api`;


/**
 * Axios instance configured with base URL and credentials.
 * This instance is used for all API requests throughout the application.
 */
const api = axios.create({
  baseURL,
  withCredentials: true,
});

/**
 * Request interceptor to add Authorization header from localStorage as fallback.
 * This ensures authentication tokens are sent with every request, even if cookies aren't working.
 */
api.interceptors.request.use(
  (config) => {
    // Get token from localStorage
    const accessToken = localStorage.getItem("accessToken");

    // If token exists, add it to Authorization header
    // This serves as a fallback if cookies aren't being sent
    if (accessToken && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

/**
 * Response interceptor removed - token refresh is now handled in store/index.js
 * to avoid duplicate interceptors and ensure proper Redux state management.
 */

export default api;
