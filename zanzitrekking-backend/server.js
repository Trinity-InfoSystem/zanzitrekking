// Core dependencies
require("dotenv").config();
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const fetch = require("node-fetch");
const path = require("path");
const fs = require("fs");

// Database
const { dbConnect } = require("./utilities/db");

// Cron jobs
const { setupCronJobs } = require("./utilities/cronJobs");

// Initialize Express app and server
const app = express();
const server = http.createServer(app);

// Trust proxy - This is essential for correct protocol detection when behind a reverse proxy (nginx, load balancer, etc.)
// This allows Express to read X-Forwarded-Proto header and correctly set req.protocol to 'https'
app.set('trust proxy', true);

// Security headers with Helmet.js
app.use(helmet({
  contentSecurityPolicy: false, // Adjust based on your needs
  crossOriginEmbedderPolicy: false
}));

// Home routes
const homeRouter = require("./routes/home/homeRoutes");
const customerRouter = require("./routes/home/customerRoutes");
const cartRouter = require("./routes/home/cartRoute");
const chatRoute = require("./routes/home/chatRoute");
const reviewRouter = require("./routes/home/reviewRoutes");
const jobRouter = require("./routes/home/jobRoutes");
const jobApplicationRouter = require("./routes/home/jobApplicationRoutes");
const urgentBookingRequestRouter = require("./routes/home/urgentBookingRequestRoutes"); // ADDED
const wetravelWebhookRouter = require("./routes/home/wetravelWebhookRoutes"); // ADDED

// Dashboard routes
const authRoute = require("./routes/authRoutes");
const blogPostRoute = require("./routes/dashboard/blogPostRoutes");
const categoryRoute = require("./routes/dashboard/categoryRoutes");
const productRoute = require("./routes/dashboard/productRoutes");
const tripRoute = require("./routes/dashboard/tripRoutes");
const inclusionRoute = require("./routes/dashboard/inclusionRoute");
const exclusionRoute = require("./routes/dashboard/exclusionRoute");
const accommodationRoute = require("./routes/dashboard/accommodationRoute");
const mealRoute = require("./routes/dashboard/mealRoute");
const bannerRoute = require("./routes/dashboard/bannerRoute");
const whoWeAreRoute = require("./routes/dashboard/whoWeAreRoute");
const pdfRoute = require("./routes/dashboard/pdfRoutes");
const newsletterRoutes = require("./routes/dashboard/newsletterRoutes");
const partnerRoute = require("./routes/dashboard/partnerRoutes");
const adminReviewRoute = require("./routes/dashboard/reviewRoutes");
const adminToAdminRoute = require("./routes/dashboard/adminToAdminRoute");
const dashboardRoute = require("./routes/dashboard/dashboardRoutes");
const jobRoute = require("./routes/dashboard/jobRoutes");
const jobApplicationRoute = require("./routes/dashboard/jobApplicationRoutes");
const achievementRoute = require("./routes/dashboard/achievementRoutes");
const impactStatRoute = require("./routes/dashboard/impactStatRoutes");
const clientRoute = require("./routes/dashboard/clientRoutes");
const adminUrgentBookingRequestRoute = require("./routes/dashboard/urgentBookingRequestRoutes"); // ADDED
const safariAnalyticsRoutes = require("./routes/dashboard/safariAnalyticsRoutes");
// Order routes
const orderRouter = require("./routes/home/orderRoutes");

// CORS configuration
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "http://localhost:5174",
  "https://booking.zanzisafaris.com",
  "https://www.booking.zanzisafaris.com", // Add www version
  "https://zanzisafaris.com", // Add main domain
  "https://www.zanzisafaris.com", // Add www version
  "https://admin.zanzisafaris.com",
  "https://www.admin.zanzisafaris.com",
  
];

const corsOptions = {
  origin: (origin, callback) => {
    // In production, reject requests with no origin
    if (!origin && process.env.NODE_ENV === 'production') {
      return callback(new Error("Not allowed by CORS"));
    }
    // Only allow requests with no origin in development
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization"],
  exposedHeaders: ["Content-Type"],
  maxAge: 86400, // 24 hours
};

// Socket.IO configuration
const io = new Server(server, {
  cors: {
    ...corsOptions,
    allowedHeaders: ["Content-Type", "Authorization"],
    exposedHeaders: ["Content-Type"],
    maxAge: 3600,
  },
  pingTimeout: 60000,
  pingInterval: 25000,
  transports: ["websocket", "polling"],
});

// Socket.IO event handlers
io.engine.on("connection_error", (err) => {
  // Connection error handled
});

io.on("connection", (socket) => {
  socket.on("join", (userId) => {
    socket.join(userId);
    socket.emit("joined", { status: "success", room: userId });
  });

  socket.on("join_conversation", ({ conversationId }) => {
    if (!conversationId) return;
    socket.join(conversationId);
  });

  socket.on("leave_conversation", ({ conversationId }) => {
    if (!conversationId) return;
    socket.leave(conversationId);
  });

  socket.on("error", (error) => {
    console.error("Socket error:", error);
  });

  socket.on("send_message", (messageData) => {
    // Add createdAt timestamp
    const messageWithTimestamp = {
      ...messageData,
      createdAt: new Date().toISOString(),
    };

    const targets = new Set();

    if (messageData.receiver) {
      targets.add(messageData.receiver);
    }

    if (messageData.conversationId) {
      targets.add(messageData.conversationId);
    }

    targets.forEach((roomId) => {
      io.to(roomId).emit("receive_message", messageWithTimestamp);
    });
  });

  // Admin-to-Admin messaging
  socket.on("send_admin_message", (messageData) => {
    // Add createdAt timestamp
    const messageWithTimestamp = {
      ...messageData,
      createdAt: new Date().toISOString(),
    };

    const targets = new Set();

    if (messageData.receiver) {
      targets.add(messageData.receiver);
    }

    if (messageData.conversationId) {
      targets.add(messageData.conversationId);
    }

    targets.forEach((roomId) => {
      io.to(roomId).emit("receive_admin_message", messageWithTimestamp);
    });
  });

  // Admin typing indicators
  socket.on("admin_typing", (data) => {
    const { userId, receiverId, isTyping } = data;

    // Send typing indicator to the receiver
    io.to(receiverId).emit("admin_typing", {
      userId,
      isTyping,
    });
  });

  // Admin message read status
  socket.on("admin_message_read", (data) => {
    const { messageId, readBy, receiverId } = data;

    // Notify the sender that their message was read
    io.to(receiverId).emit("admin_message_read", {
      messageId,
      readBy,
    });
  });

  socket.on("disconnect", (reason) => {
    // Socket disconnected
  });
});

// Middleware
app.use(morgan("tiny"));
app.options("*", cors(corsOptions));
app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());

// Input sanitization - prevent NoSQL injection attacks
app.use(mongoSanitize());

// Rate limiting - protect against DDoS and brute force attacks
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api', limiter);

app.use("/public", express.static(path.join(__dirname, "public")));

// Also add this for better static file serving:
app.use(
  "/public/uploads",
  express.static(path.join(__dirname, "public", "uploads"), {
    maxAge: "1d", // Cache for 1 day
    etag: true,
    lastModified: true,
  })
);

// ============ SAFARI ANALYTICS ROUTES (BEFORE PROXY) ============
// Register analytics routes BEFORE the Safari proxy to ensure they're matched first
app.use("/api", safariAnalyticsRoutes);

// ============ SAFARI API PROXY ============
// This proxy handles requests to the external Safari Office API
// and adds authentication headers server-side to avoid CORS issues
app.use("/api/safari", async (req, res) => {
  const apiPath = req.originalUrl.replace("/api/safari", "");
  const url = `https://api.safarioffice.com${apiPath}`;

  try {
    const response = await fetch(url, {
      method: req.method,
      headers: {
        Authorization: `Bearer ${process.env.SAFARI_TOKEN}`,
        "Content-Type": "application/json",
      },
      body:
        req.method !== "GET" && req.method !== "HEAD"
          ? JSON.stringify(req.body)
          : undefined,
    });

    const data = await response.json();
    res.status(response.status).json(data);
  } catch (error) {
    console.error("Safari API proxy error:", error);
    res.status(500).json({ error: "Proxy error", details: error.message });
  }
});

// Home routes
app.use("/api/home", homeRouter);
app.use("/api/customer", customerRouter);
app.use("/api", cartRouter);
app.use("/api/orders", orderRouter);
app.use("/api", chatRoute);
app.use("/api/reviews", reviewRouter);
app.use("/api", jobRouter);
app.use("/api", jobApplicationRouter);
app.use("/api", urgentBookingRequestRouter); // ADDED
app.use("/api/webhooks", wetravelWebhookRouter); // ADDED - WeTravel webhook endpoint

// Dashboard routes
app.use("/api", authRoute);
app.use("/api", blogPostRoute);
app.use("/api", categoryRoute);
app.use("/api", productRoute);
app.use("/api", tripRoute);
app.use("/api", inclusionRoute);
app.use("/api", exclusionRoute);
app.use("/api", accommodationRoute);
app.use("/api", mealRoute);
app.use("/api", bannerRoute);
app.use("/api", whoWeAreRoute);
app.use("/api", pdfRoute);
app.use("/api", newsletterRoutes);
app.use("/api", partnerRoute);
app.use("/api", adminReviewRoute);
app.use("/api", adminToAdminRoute);
app.use("/api/dashboard", dashboardRoute);
app.use("/api", jobRoute);
app.use("/api", jobApplicationRoute);
app.use("/api", achievementRoute);
app.use("/api", impactStatRoute);
app.use("/api", clientRoute);
app.use("/api", adminUrgentBookingRequestRoute); // ADDED
// Note: safariAnalyticsRoutes is registered earlier, before the Safari API proxy
// File download endpoint with enhanced security and multiple location support
app.get("/api/download-file/:filename", (req, res) => {
  try {
    const filename = req.params.filename;
    const requestedDownloadName = req.query.original;

    if (!filename) {
      return res.status(400).json({ error: "Filename is required" });
    }

    // Security: Prevent directory traversal
    if (
      filename.includes("..") ||
      filename.includes("/") ||
      filename.includes("\\")
    ) {
      return res.status(400).json({ error: "Invalid filename" });
    }

    // Multiple possible file locations (chat files and CV files)
    const possiblePaths = [
      path.join(__dirname, "public", "uploads", "cv_files", filename),
      path.join(__dirname, "public", "uploads", "chat_files", filename),
      path.join(__dirname, "uploads", "cv_files", filename),
      path.join(__dirname, "uploads", "chat_files", filename),
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
      // Log directory contents for debugging
      const cvDir = path.join(__dirname, "public", "uploads", "cv_files");
      if (fs.existsSync(cvDir)) {
        try {
          fs.readdirSync(cvDir);
        } catch (err) {
          // Error reading directory
        }
      }

      // Get actual directory listing for debugging
      const debugInfo = {
        filename: filename,
        __dirname: __dirname,
        processCwd: process.cwd(),
        checkedPaths: possiblePaths.map((p) => ({
          path: p.replace(__dirname, ""),
          exists: fs.existsSync(p),
        })),
      };

      // Check cv_files directory specifically
      const cvDirPaths = [
        path.join(__dirname, "public", "uploads", "cv_files"),
        path.join(__dirname, "uploads", "cv_files"),
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

    // Set headers
    res.setHeader("Content-Type", contentType);
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${downloadName}"`
    );
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Content-Length", fs.statSync(filePath).size);

    // Stream the file
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);

    fileStream.on("error", (error) => {
      console.error("File stream error:", error);
      res.status(500).json({ error: "Error streaming file" });
    });
  } catch (error) {
    console.error("Download error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Global error handling middleware - must be after all routes
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: process.env.NODE_ENV === 'production' 
      ? 'Internal server error' 
      : err.message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Initialize database connection and setup cron jobs
dbConnect()
  .then(() => {
    setupCronJobs();
    console.log("✓ Database connected and cron jobs initialized");
  })
  .catch((err) => {
    console.error("Database connection failed:", err);
  });

// Modified server startup for Passenger compatibility
const PORT = process.env.PORT || 5000;

// Only start the server if not running under Passenger
if (typeof PhusionPassenger === "undefined") {
  server.listen(PORT, () => {
    console.log(`Server is up and running on http://localhost:${PORT}/`);
  });
}

// Export for Passenger
module.exports = app;