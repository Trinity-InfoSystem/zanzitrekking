/**
 * File Handler Middleware
 * 
 * This module handles file download operations with security checks.
 * Extracted from server.js for better code organization.
 */

const path = require("path");
const fs = require("fs");
const logger = require("../utilities/logger");

/**
 * File download endpoint handler
 * Handles secure file downloads from multiple possible locations
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
function handleFileDownload(req, res) {
  try {
    const filename = req.params.filename;
    const requestedDownloadName = req.query.original;

    if (!filename) {
      return res.status(400).json({ error: "Filename is required" });
    }

    // Security: Prevent directory traversal attacks
    if (
      filename.includes("..") ||
      filename.includes("/") ||
      filename.includes("\\")
    ) {
      logger.warn(`File download attempt with invalid filename: ${filename}`);
      return res.status(400).json({ error: "Invalid filename" });
    }

    // Multiple possible file locations (chat files and CV files)
    const possiblePaths = [
      path.join(__dirname, "..", "public", "uploads", "cv_files", filename),
      path.join(__dirname, "..", "public", "uploads", "chat_files", filename),
      path.join(__dirname, "..", "uploads", "cv_files", filename),
      path.join(__dirname, "..", "uploads", "chat_files", filename),
      path.join(process.cwd(), "public", "uploads", "cv_files", filename),
      path.join(process.cwd(), "public", "uploads", "chat_files", filename),
      path.join(process.cwd(), "uploads", "cv_files", filename),
      path.join(process.cwd(), "uploads", "chat_files", filename),
    ];

    let filePath = null;
    for (const possiblePath of possiblePaths) {
      if (fs.existsSync(possiblePath)) {
        filePath = possiblePath;
        break;
      }
    }

    if (!filePath) {
      // Log directory contents for debugging in development
      const debugInfo = {
        filename: filename,
        __dirname: __dirname,
        processCwd: process.cwd(),
        checkedPaths: possiblePaths.map((p) => ({
          path: p.replace(__dirname, ""),
          exists: fs.existsSync(p),
        })),
      };

      // Check cv_files directory specifically for debugging
      const cvDirPaths = [
        path.join(__dirname, "..", "public", "uploads", "cv_files"),
        path.join(__dirname, "..", "uploads", "cv_files"),
        path.join(process.cwd(), "public", "uploads", "cv_files"),
        path.join(process.cwd(), "uploads", "cv_files"),
      ];

      for (const cvDir of cvDirPaths) {
        if (fs.existsSync(cvDir)) {
          try {
            const files = fs.readdirSync(cvDir);
            debugInfo.cvFilesDirectory = {
              path: cvDir.replace(__dirname, ""),
              files: files,
              fileExists: files.includes(filename),
            };
            break;
          } catch (err) {
            debugInfo.cvFilesDirectoryError = err.message;
          }
        }
      }

      logger.warn(`File not found: ${filename}`, debugInfo);
      return res.status(404).json({
        error: "File not found",
        ...(process.env.NODE_ENV === 'development' && { debug: debugInfo })
      });
    }

    // Set CORS headers
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET");
    res.header("Access-Control-Allow-Headers", "Content-Type");

    // Get file extension for content type
    const ext = path.extname(filename).toLowerCase();

    const contentTypes = {
      ".jpg": "image/jpeg",
      ".jpeg": "image/jpeg",
      ".png": "image/png",
      ".gif": "image/gif",
      ".webp": "image/webp",
      ".pdf": "application/pdf",
      ".txt": "text/plain",
      ".doc": "application/msword",
      ".docx":
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ".zip": "application/zip",
      ".mp4": "video/mp4",
      ".mp3": "audio/mpeg",
    };

    const contentType = contentTypes[ext] || "application/octet-stream";

    // Sanitize download name
    let downloadName = filename;
    if (requestedDownloadName && typeof requestedDownloadName === "string") {
      const sanitized = requestedDownloadName
        .replace(/[\r\n]/g, "")
        .replace(/[\\/]/g, "")
        .trim();
      if (sanitized) {
        downloadName = sanitized;
      }
    }

    // Get file stats
    let fileStats;
    try {
      fileStats = fs.statSync(filePath);
    } catch (err) {
      logger.error(`Error getting file stats for ${filePath}:`, err);
      return res.status(500).json({ error: "Error accessing file" });
    }

    // Set response headers
    res.setHeader("Content-Type", contentType);
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${downloadName}"`
    );
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Content-Length", fileStats.size);

    // Stream the file
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);

    fileStream.on("error", (error) => {
      logger.error("File stream error:", error);
      if (!res.headersSent) {
        res.status(500).json({ error: "Error streaming file" });
      }
    });

    logger.debug(`File downloaded: ${filename} (${fileStats.size} bytes)`);
  } catch (error) {
    logger.error("File download error:", error);
    if (!res.headersSent) {
      res.status(500).json({ error: "Internal server error" });
    }
  }
}

module.exports = { handleFileDownload };
