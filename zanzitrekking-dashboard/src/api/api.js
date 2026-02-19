import axios from "axios";

const local = "http://localhost:5000";
const production = "https://api.zanzisafaris.com"; // Uncomment when deploying to production
const api = axios.create({
  baseURL: `${production}/api`,
  withCredentials: true,
});

/**
 * Request interceptor to add Authorization header from localStorage as fallback.
 * This ensures authentication tokens are sent with every request, even if cookies aren't working.
 */
api.interceptors.request.use(
  (config) => {
    // Get token from localStorage (if stored)
    const storedToken = localStorage.getItem("accessToken");
    let accessToken = null;

    // Handle both string and JSON stringified tokens
    if (storedToken) {
      try {
        accessToken = JSON.parse(storedToken);
      } catch {
        accessToken = storedToken;
      }
    }

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

// Response interceptor removed - token refresh is now handled in store/index.js
// to avoid duplicate interceptors and ensure proper Redux state management.

export default api;
