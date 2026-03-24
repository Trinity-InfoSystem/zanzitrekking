import { getApiOrigin, IMAGES_URL } from "./constants";

/**
 * Turn a DB-stored media reference into a browser-usable absolute URL.
 * Supports: legacy full http(s) URLs, paths like /public/uploads/file.jpg, or bare filenames.
 *
 * @param {string|null|undefined} stored
 * @returns {string}
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

/**
 * @param {string|null|undefined} image
 * @returns {string}
 */
export const refectorImage = (image) =>
  image ? resolveMediaUrl(image) : "/placeholder.svg";
