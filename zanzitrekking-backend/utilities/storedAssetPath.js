const path = require("path");

/**
 * Value persisted in MongoDB for a file under public/uploads (images, videos, etc.).
 * No protocol or host — clients prepend API origin. Matches express static `/public/uploads/...`.
 *
 * @param {string|null|undefined} filename - Multer filename or any string; only basename is kept
 * @returns {string|null}
 */
function publicUploadsRef(filename) {
  if (filename == null || filename === "") return null;
  const base = path.basename(String(filename));
  if (!base || base === "." || base === "..") return null;
  return `/public/uploads/${base}`;
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
  return `/public/uploads/cv_files/${base}`;
}

module.exports = { publicUploadsRef, publicCvFileRef };
