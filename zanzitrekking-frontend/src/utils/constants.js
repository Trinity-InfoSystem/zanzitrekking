/**
 * API origin (no trailing slash). Often includes `/api` for axios REST calls.
 *
 * - Production: set `VITE_API_URL` in `.env.production` — Vite inlines it at `vite build`.
 * - Development: set `VITE_API_URL` in `.env.development`, or omit it to fall back to localhost.
 */
export function getApiBaseUrl() {
  const fromEnv = import.meta.env.VITE_API_URL;
  if (fromEnv) {
    return String(fromEnv).replace(/\/$/, "");
  }
  if (import.meta.env.DEV) {
    return "http://localhost:5000";
  }
  return "";
}

/**
 * Server origin for static files (`/uploads/...` or legacy `/public/...`). Not under `/api`.
 */
export function getApiOrigin() {
  const base = getApiBaseUrl().replace(/\/$/, "");
  if (base.endsWith("/api")) {
    return base.slice(0, -4);
  }
  return base;
}

/**
 * Base URL for bare filenames resolved under uploads (trailing slash).
 */
export const IMAGES_URL = `${getApiOrigin()}/uploads/`;

/**
 * Base URL for the API server (same origin as getApiBaseUrl).
 */
export const API_URL = getApiBaseUrl();
