export function getApiBaseUrl() {
  const fromEnv = import.meta.env.VITE_API_BASE_URL;
  if (fromEnv) return String(fromEnv).replace(/\/$/, "");
  if (import.meta.env.DEV) return "http://localhost:5000";
  return "";
}

/** Static files are served at host root, not under `/api`. */
export function getApiOrigin() {
  const base = getApiBaseUrl().replace(/\/$/, "");
  if (base.endsWith("/api")) return base.slice(0, -4);
  return base;
}

export const IMAGES_URL = `${getApiOrigin()}/public/uploads/`;
export const LIVE_IMAGE_DOWNLOAD_URL = `${getApiBaseUrl()}/api`;
export const DOWNLOAD_URL = `${getApiBaseUrl()}/api`;

/**
 * DB value → absolute URL (legacy full URL, /public/... path, or bare filename).
 */
export function resolveMediaUrl(stored) {
  if (stored == null || String(stored).trim() === "") return "";
  const s = String(stored).trim();
  if (/^https?:\/\//i.test(s)) return s;
  const origin = getApiOrigin();
  if (s.startsWith("/public/")) {
    return origin ? `${origin}${s}` : s;
  }
  const file = s.split("/").pop().split("?")[0];
  return file ? `${IMAGES_URL}${file}` : "";
}
