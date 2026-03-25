const path = require("path");

/**
 * Value persisted in MongoDB for a file under public/uploads (on disk).
 * URL path is /uploads/... — Express serves it via app.use("/uploads", static(.../public/uploads)).
 *
 * @param {string|null|undefined} filename - Multer filename or any string; only basename is kept
 * @returns {string|null}
 */
function publicUploadsRef(filename) {
  if (filename == null || filename === "") return null;
  const base = path.basename(String(filename));
  if (!base || base === "." || base === "..") return null;
  return `/uploads/${base}`;
}

/**
 * CV files live in public/uploads/cv_files (see multer cvFileUpload).
 *
 * @param {string|null|undefined} filename
 * @returns {string|null}
 */
function publicCvFileRef(filename) {
  if (filename == null || filename === "") return null;
  const base = path.basename(String(filename));
  if (!base || base === "." || base === "..") return null;
  return `/uploads/cv_files/${base}`;
}

/** True if ref looks like our self-hosted upload path (new or legacy). */
function isStoredUploadRef(ref) {
  if (!ref || typeof ref !== "string") return false;
  const s = ref.trim();
  return s.includes("/public/uploads/") || s.startsWith("/uploads/");
}

/**
 * Absolute disk path for deleting a file. Supports /uploads/... and legacy /public/uploads/...
 *
 * @param {string|null|undefined} storedRef
 * @returns {string|null}
 */
function diskPathFromStoredUploadRef(storedRef) {
  if (!storedRef || typeof storedRef !== "string") return null;
  let rel = storedRef.trim();
  if (rel.startsWith("/public/uploads/")) {
    rel = rel.slice("/public/uploads/".length);
  } else if (rel.startsWith("/uploads/")) {
    rel = rel.slice("/uploads/".length);
  } else {
    return null;
  }
  if (!rel || rel.includes("..")) return null;
  const segments = rel.split("/").filter(Boolean);
  return path.join(__dirname, "..", "public", "uploads", ...segments);
}

module.exports = {
  publicUploadsRef,
  publicCvFileRef,
  isStoredUploadRef,
  diskPathFromStoredUploadRef,
};
