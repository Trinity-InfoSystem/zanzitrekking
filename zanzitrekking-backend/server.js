// Core dependencies
require("dotenv").config();
const express = require("express");
const http = require("http");
const cors = require("cors");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const fetch = require("node-fetch");
const path = require("path");
const logger = require("./utilities/logger");

// Socket.IO and file handling modules
const { initializeSocketIO } = require("./socket/socketHandler");
const { handleFileDownload } = require("./middlewares/fileHandler");

// Database
const { dbConnect } = require("./utilities/db");

// Cron jobs
const { setupCronJobs } = require("./utilities/cronJobs");

// Initialize Express app and server
const app = express();
const server = http.createServer(app);

// Trust proxy - This is essential for correct protocol detection when behind a reverse proxy (nginx, load balancer, etc.)
// This allows Express to read X-Forwarded-Proto header and correctly set req.protocol to 'https'
// Trust only the first proxy hop to prevent IP-based rate limiting bypass
// Set to 1 to trust only the first proxy (nginx/reverse proxy)
app.set('trust proxy', 1);

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
// Parse allowed origins from environment variable (comma-separated)
// CORS_ORIGINS is required - no fallback to prevent hardcoded origins
const corsOriginsEnv = process.env.CORS_ORIGINS;
if (!corsOriginsEnv) {
  logger.error('CORS_ORIGINS environment variable is required but not set');
  throw new Error('CORS_ORIGINS environment variable is required. Please set it in your .env file.');
}
const allowedOrigins = corsOriginsEnv
  .split(',')
  .map(origin => origin.trim())
  .filter(Boolean);

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile appToo many requests, please try again later.s or curl requests) in development
    if (!origin) {
      if (process.env.NODE_ENV === 'production') {
        // In production, log but allow (some legitimate requests may not have origin)
        logger.warn('CORS: Request with no origin in production');
        return callback(null, true);
      }
      return callback(null, true);
    }

    // Normalize origin by removing trailing slash
    const normalizedOrigin = origin.replace(/\/$/, '');
    
    // Check if origin matches any allowed origin
    const isAllowed = allowedOrigins.some(allowed => {
      const normalizedAllowed = allowed.replace(/\/$/, '');
      return normalizedOrigin === normalizedAllowed;
    });

    if (isAllowed) {
      callback(null, true);
    } else {
      // Log the rejected origin for debugging
      logger.warn(`CORS: Rejected origin: ${origin}`);
      logger.debug(`CORS: Allowed origins:`, { allowedOrigins });
      callback(new Error(`Not allowed by CORS. Origin: ${origin}`));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization"],
  exposedHeaders: ["Content-Type"],
  maxAge: 86400, // 24 hours
};

// Initialize Socket.IO
const io = initializeSocketIO(server, corsOptions);

// Middleware
app.use(morgan("tiny"));
app.options("*", cors(corsOptions));
app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());

// Input sanitization - prevent NoSQL injection attacks
app.use(mongoSanitize());

// Rate limiting - protect against DDoS and brute force attacks
// Configure rate limiter to work with trust proxy setting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  // Use a custom key generator that respects trust proxy
  keyGenerator: (req) => {
    // When trust proxy is enabled, use X-Forwarded-For header if available
    // Otherwise fall back to req.ip or req.connection.remoteAddress
    return req.ip || req.connection.remoteAddress || 'unknown';
  },
  // Skip rate limiting for successful requests (optional)
  skipSuccessfulRequests: false,
  // Skip rate limiting for failed requests (optional)
  skipFailedRequests: false,
  // Standard headers for rate limit info
  standardHeaders: true,
  legacyHeaders: false,
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
    logger.error("Safari API proxy error:", error);
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
app.get("/api/download-file/:filename", handleFileDownload);

// Global error handling middleware - must be after all routes
app.use((err, req, res, next) => {
  logger.error('Error:', err);
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
    logger.info("✓ Database connected and cron jobs initialized");
  })
  .catch((err) => {
    logger.error("Database connection failed:", err);
  });

// Modified server startup for Passenger compatibility
const PORT = process.env.PORT || 5000;

// Only start the server if not running under Passenger
if (typeof PhusionPassenger === "undefined") {
  server.listen(PORT, () => {
    logger.info(`Server is up and running on http://localhost:${PORT}/`);
    // Also log to console for visibility
    console.log(`✓ Server is up and running on http://localhost:${PORT}/`);
  });
}

// Export for Passenger
module.exports = app;