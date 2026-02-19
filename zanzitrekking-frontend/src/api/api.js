import axios from "axios";

/**
 * Base URL for API requests.
 * Uses VITE_API_URL environment variable if set, otherwise:
 * - Production: https://api.zanzisafaris.com/api
 * - Development: http://localhost:5000/api
 */
const baseURL=import.meta.env.VITE_API_URL ||
(import.meta.env.PROD
  ? "https://api.zanzisafaris.com/api"
  : "http://localhost:5000/api");




/**
 * Axios instance configured with base URL and credentials.
 * This instance is used for all API requests throughout the application.
 * Authentication is handled via httpOnly cookies (automatically sent with withCredentials: true).
 * No localStorage fallback - relying solely on secure httpOnly cookies prevents XSS attacks.
 */
const api = axios.create({
  baseURL,
  withCredentials: true,
});

/**
 * Response interceptor removed - token refresh is now handled in store/index.js
 * to avoid duplicate interceptors and ensure proper Redux state management.
 */

export default api;
