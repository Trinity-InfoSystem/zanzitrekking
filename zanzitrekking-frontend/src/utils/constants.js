/**
 * API origin (no trailing slash). Uses VITE_API_URL, then dev default, then production fallback.
 * Often includes `/api` — that is correct for axios REST calls.
 */
export function getApiBaseUrl() {
  const fromEnv = import.meta.env.VITE_API_URL;
  if (fromEnv) return String(fromEnv).replace(/\/$/, "");
  if (import.meta.env.DEV) return "http://localhost:5000";
  return "https://api.zanzisafaris.com";
}

/**
 * Server origin for static files (`/public/...`). Express serves these at the host root, not under `/api`.
 * When VITE_API_URL is `http://localhost:5000/api`, media URLs must use `http://localhost:5000`, not `.../api`.
 */
export function getApiOrigin() {
  const base = getApiBaseUrl().replace(/\/$/, "");
  if (base.endsWith("/api")) return base.slice(0, -4);
  return base;
}

/**
 * Base URL for files stored under public/uploads/ on the API (trailing slash).
 */
export const IMAGES_URL = `${getApiOrigin()}/public/uploads/`;

/**
 * Base URL for the API server (same origin as getApiBaseUrl).
 */
export const API_URL = getApiBaseUrl();
