const multer = require("multer");
const path = require("path");
const fs = require("fs");
const sharp = require("sharp");

const thumbnailGenerator = async (filePath, size = 300) => {
  const ext = path.extname(filePath);
  const base = filePath.replace(ext, "");

  const thumbPath = `${base}_thumb.webp`;

  try {
    await sharp(filePath)
      .resize({
        height: size,
        fit: "contain",
      })
      .toFormat("webp")
      .toFile(thumbPath);

    const segments = thumbPath.split("/");

    // Return only file name
    return segments.at(-1);
  } catch (e) {
    return null;
  }
};

const FILE_TYPE_MAP = {
  "image/png": "png",
  "image/jpeg": "jpeg",
  "image/jpg": "jpg",
  "image/gif": "gif",
  "image/webp": "webp",
  "image/svg+xml": "svg",
  "application/pdf": "pdf",
  "video/mp4": "mp4",
  "video/quicktime": "mov",
  "video/x-msvideo": "avi",
  "video/webm": "webm",
  "application/msword": "doc",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
    "docx",
};

// Create separate storage configurations for images and PDFs
const imageStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    if (file.mimetype === "application/pdf") {
      const uploadPath = path.join(__dirname, "../public/pdfs");
      cb(null, uploadPath);
    } else {
      const isValid = FILE_TYPE_MAP[file.mimetype];
      if (!isValid) {
        return cb(
          new Error(
            "Invalid file type. Allowed types: PNG, JPEG, JPG, GIF, WEBP, MP4, MOV, AVI, WEBM",
          ),
          null,
        );
      }
      const uploadPath = path.join(__dirname, "../public/uploads");
      cb(null, uploadPath);
    }
  },
  filename: function (req, file, cb) {
    const fileName = file.originalname.replace(/\s+/g, "-");
    const extension = FILE_TYPE_MAP[file.mimetype];
    const fileNameWithoutExtension = fileName.replace(/\.[^/.]+$/, "");
    const newFileName = `${fileNameWithoutExtension}-${Date.now()}.${extension}`;
    cb(null, newFileName);
  },
});

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/uploads/chat_files/");
  },
  filename: function (req, file, cb) {
    const originalName = file.originalname || "chat-file";
    const extension = path.extname(originalName);
    const baseName = originalName
      .replace(extension, "")
      .replace(/\s+/g, "-")
      .replace(/[^a-zA-Z0-9-_]/g, "")
      .toLowerCase();
    const timestamp = Date.now();
    const safeBaseName = baseName || "chat-file";
    cb(null, `${safeBaseName}-${timestamp}${extension}`);
  },
});

// Specific PDF storage configuration
const pdfStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    if (file.mimetype !== "application/pdf") {
      return cb(
        new Error("Invalid file type. Only PDF files are allowed."),
        null,
      );
    }
    const uploadPath = path.join(__dirname, "../public/pdfs");
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const fileName = file.originalname.replace(/\s+/g, "-");
    const fileNameWithoutExtension = fileName.replace(/\.[^/.]+$/, "");
    const newFileName = `${fileNameWithoutExtension}-${Date.now()}.pdf`;
    cb(null, newFileName);
  },
});

const fileFilter = (req, file, cb) => {
  if (FILE_TYPE_MAP[file.mimetype]) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Invalid file type. Allowed types: PNG, JPEG, JPG, GIF, WEBP, PDF, MP4, MOV, AVI, WEBM",
      ),
      false,
    );
  }
};

// PDF specific file filter
const pdfFileFilter = (req, file, cb) => {
  if (file.mimetype === "application/pdf") {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type. Only PDF files are allowed."), false);
  }
};

const newsletterStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/newsletter/");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname),
    );
  },
});

// CV file storage configuration
const cvStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, "../public/uploads/cv_files");
    // Ensure directory exists
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const originalName = file.originalname || "cv-file";
    const extension = path.extname(originalName);
    const baseName = originalName
      .replace(extension, "")
      .replace(/\s+/g, "-")
      .replace(/[^a-zA-Z0-9-_]/g, "")
      .toLowerCase();
    const timestamp = Date.now();
    const safeBaseName = baseName || "cv-file";
    cb(null, `${safeBaseName}-${timestamp}${extension}`);
  },
});

// CV file filter (PDF, DOC, DOCX)
const cvFileFilter = (req, file, cb) => {
  const allowedMimes = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ];
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type. Allowed types: PDF, DOC, DOCX"), false);
  }
};

// Export both configurations
module.exports = {
  // Genrate .webp thumbnails for images
  thumbnailGenerator,

  // For general uploads (images and PDFs)
  uploadOptions: multer({
    storage: imageStorage,
    fileFilter: fileFilter,
    limits: {
      fileSize: 50 * 1024 * 1024, // 50MB limit for videos
    },
  }),

  // PDF specific upload configuration
  pdfUpload: multer({
    storage: pdfStorage,
    fileFilter: pdfFileFilter,
    limits: {
      fileSize: 50 * 1024 * 1024, // 10MB limit for PDFs
    },
  }),

  chatFileUpload: multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
      fileSize: 50 * 1024 * 1024, // 10MB limit
    },
  }),
  newsletterUpload: multer({
    storage: newsletterStorage,
    fileFilter: (req, file, cb) => {
      // Allow PDF, images, and document files
      const allowedMimes = [
        "application/pdf",
        "image/png",
        "image/jpeg",
        "image/jpg",
        "image/gif",
        "image/webp",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
      ];
      if (allowedMimes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(
          new Error(
            "Invalid file type. Allowed types: PDF, JPG, JPEG, PNG, GIF, WEBP, DOC, DOCX",
          ),
          false,
        );
      }
    },
    limits: {
      fileSize: 50 * 1024 * 1024, // 50MB limit
    },
  }),
  cvFileUpload: multer({
    storage: cvStorage,
    fileFilter: cvFileFilter,
    limits: {
      fileSize: 50 * 1024 * 1024, // 5MB limit for CV files
    },
  }),
};
