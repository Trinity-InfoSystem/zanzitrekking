import axios from "axios";

/**
 * Base URL for API requests.
 * Loaded from environment variables:
 * - Development: .env.development (VITE_API_URL)
 * - Production: .env.production (VITE_API_URL)
 *
 * Vite automatically loads the appropriate .env file based on the mode.
 */
// Get base URL from environment variable
// In development, fallback to localhost:5000 if not set
const baseURL = import.meta.env.VITE_API_URL ||
  (import.meta.env.DEV ? "http://localhost:5000" : null);

if (!baseURL) {
  console.error(
    "⚠️ VITE_API_URL is not defined. Please create a .env.development or .env.production file with VITE_API_URL set.",
  );
  // Don't throw - allow app to load and show error message
  // The app will show connection errors which is better than crashing
}

/**
 * Axios instance configured with base URL and credentials.
 * This instance is used for all API requests throughout the application.
 * Authentication is handled via httpOnly cookies (automatically sent with withCredentials: true).
 * No localStorage fallback - relying solely on secure httpOnly cookies prevents XSS attacks.
 */
const api = axios.create({
  baseURL: baseURL || "", // Use empty string if not set - requests will fail gracefully
  withCredentials: true,
});

/**
 * Response interceptor removed - token refresh is now handled in store/index.js
 * to avoid duplicate interceptors and ensure proper Redux state management.
 */

export default api;
