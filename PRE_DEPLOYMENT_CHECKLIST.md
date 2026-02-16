# Pre-Deployment Checklist for Zanzitrekking MERN Stack Application

**Generated:** $(date)  
**Reviewer:** Senior Developer  
**Status:** ⚠️ **CRITICAL ISSUES FOUND - DO NOT DEPLOY YET**

---

## 🔴 CRITICAL (Must Fix Before Deploy)

### Backend Security & Configuration

1. **❌ Missing Error Handling Middleware**
   - **Location:** `zanzitrekking-backend/server.js`
   - **Issue:** No global error handler middleware. Unhandled errors will crash the server or expose stack traces.
   - **Fix:** Add error handling middleware at the end of `server.js`:
   ```javascript
   // After all routes, before server.listen
   app.use((err, req, res, next) => {
     console.error('Error:', err);
     res.status(err.status || 500).json({
       error: process.env.NODE_ENV === 'production' 
         ? 'Internal server error' 
         : err.message,
       ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
     });
   });
   ```

2. **❌ No Rate Limiting**
   - **Location:** `zanzitrekking-backend/server.js`
   - **Issue:** No rate limiting middleware. Vulnerable to DDoS attacks and brute force attempts.
   - **Fix:** Install `express-rate-limit` and add:
   ```javascript
   const rateLimit = require('express-rate-limit');
   const limiter = rateLimit({
     windowMs: 15 * 60 * 1000, // 15 minutes
     max: 100 // limit each IP to 100 requests per windowMs
   });
   app.use('/api', limiter);
   ```

3. **❌ Missing Security Headers (Helmet.js)**
   - **Location:** `zanzitrekking-backend/server.js`
   - **Issue:** No security headers configured. Missing XSS protection, content security policy, etc.
   - **Fix:** Install `helmet` and add:
   ```javascript
   const helmet = require('helmet');
   app.use(helmet({
     contentSecurityPolicy: false, // Adjust based on your needs
     crossOriginEmbedderPolicy: false
   }));
   ```

4. **❌ CORS Allows Requests with No Origin**
   - **Location:** `zanzitrekking-backend/server.js:81-83`
   - **Issue:** Line 83 allows requests with no origin, which is a security risk in production.
   - **Fix:** Remove or restrict the no-origin allowance:
   ```javascript
   origin: (origin, callback) => {
     // In production, reject requests with no origin
     if (!origin && process.env.NODE_ENV === 'production') {
       return callback(new Error("Not allowed by CORS"));
     }
     if (!origin) return callback(null, true); // Only allow in development
     if (allowedOrigins.includes(origin)) {
       callback(null, true);
     } else {
       callback(new Error("Not allowed by CORS"));
     }
   }
   ```

5. **❌ Debug Logging Endpoint Exposed**
   - **Location:** `zanzitrekking-backend/utilities/wetravelService.js:242, 643`
   - **Issue:** Hardcoded fetch to `http://127.0.0.1:7242` - debug endpoint that should be removed.
   - **Fix:** Remove these lines or wrap in `if (process.env.NODE_ENV === 'development')`

6. **❌ No Production Start Script**
   - **Location:** `zanzitrekking-backend/package.json`
   - **Issue:** Only has `"server": "nodemon server.js"` - no production start script.
   - **Fix:** Add:
   ```json
   "scripts": {
     "start": "node server.js",
     "server": "nodemon server.js"
   }
   ```

7. **❌ Missing .env.example File**
   - **Location:** `zanzitrekking-backend/` (missing)
   - **Issue:** New developers won't know what environment variables are required.
   - **Fix:** Create `.env.example` with all required variables (without actual values):
   ```
   DB_URL=mongodb://localhost:27017/zanzitrekking
   SECRET=your_jwt_secret_here
   REFRESH_SECRET=your_refresh_secret_here
   PORT=5000
   NODE_ENV=production
   WETRAVEL_API_KEY=your_wetravel_api_key
   WETRAVEL_WEBHOOK_SECRET=your_webhook_secret
   SAFARI_TOKEN=your_safari_token
   EMAIL_HOST=smtp.example.com
   EMAIL_PORT=587
   EMAIL_SECURE=false
   EMAIL_USER=your_email
   EMAIL_PASSWORD=your_password
   EMAIL_FROM=noreply@example.com
   FRONTEND_URL=https://booking.zanzisafaris.com
   GOOGLE_CLIENT_ID=your_google_client_id
   CONTACT_RECEIVER_EMAIL=contact@example.com
   ```

8. **❌ Insecure OTP Generation**
   - **Location:** `zanzitrekking-backend/controllers/authControllers.js:298-305`
   - **Issue:** Uses `Math.random()` which is cryptographically insecure.
   - **Fix:** Use `crypto.randomInt()`:
   ```javascript
   const crypto = require('crypto');
   function generateOtp() {
     return crypto.randomInt(100000, 999999).toString();
   }
   ```

9. **❌ Console.log Statements May Expose Sensitive Data**
   - **Location:** Multiple files (see grep results)
   - **Issue:** Many `console.log` statements throughout codebase. In production, these could expose sensitive data or clutter logs.
   - **Fix:** 
     - Remove debug console.logs or wrap in `if (process.env.NODE_ENV === 'development')`
     - Use a proper logging library (winston, pino) instead
     - Critical files to review:
       - `utilities/wetravelService.js` (lines 187, 249, 629, 648, 1190, 1317, 1323, 1403, 1404)
       - `controllers/home/testWeTravelController.js` (entire file - should be removed or gated)

### Frontend Security & Configuration

10. **❌ Hardcoded API URL**
    - **Location:** `zanzitrekking-frontend/src/api/api.js:11`
    - **Issue:** API URL is hardcoded instead of using environment variable.
    - **Fix:** Use Vite environment variables:
    ```javascript
    const baseURL = import.meta.env.VITE_API_URL || 
      (import.meta.env.PROD 
        ? "https://api.zanzisafaris.com/api" 
        : "http://localhost:5000/api");
    ```

11. **❌ Missing Frontend .env.example**
    - **Location:** `zanzitrekking-frontend/` (missing)
    - **Issue:** No documentation of required environment variables.
    - **Fix:** Create `.env.example`:
    ```
    VITE_API_URL=https://api.zanzisafaris.com/api
    VITE_GOOGLE_CLIENT_ID=your_google_client_id
    VITE_FACEBOOK_APP_ID=your_facebook_app_id
    ```

12. **❌ JWT Token Fallback in localStorage**
    - **Location:** `zanzitrekking-frontend/src/api/api.js:30`
    - **Issue:** JWT tokens stored in localStorage as fallback. localStorage is vulnerable to XSS attacks.
    - **Fix:** Remove localStorage fallback. Rely solely on httpOnly cookies. If cookies aren't working, fix the cookie configuration instead.

### Database

13. **❌ Missing Database Indexes**
    - **Location:** `zanzitrekking-backend/models/customer.js`
    - **Issue:** Customer model has no indexes on frequently queried fields (email, assignedAdmin).
    - **Fix:** Add indexes:
    ```javascript
    customerSchema.index({ email: 1 }, { unique: true });
    customerSchema.index({ assignedAdmin: 1 });
    customerSchema.index({ createdAt: -1 });
    ```

14. **❌ Default Refresh Secret Fallback**
    - **Location:** `zanzitrekking-backend/utilities/tokenCreate.js:3`
    - **Issue:** Falls back to hardcoded secret if `REFRESH_SECRET` is not set.
    - **Fix:** Remove fallback and require environment variable:
    ```javascript
    const refreshSecret = process.env.REFRESH_SECRET;
    if (!refreshSecret) {
      throw new Error('REFRESH_SECRET environment variable is required');
    }
    ```

---

## 🟡 IMPORTANT (Should Fix Soon)

### Backend

1. **⚠️ Test Controllers Should Be Removed or Gated**
   - **Location:** `zanzitrekking-backend/controllers/home/testEmailController.js`, `testPaymentController.js`, `testWeTravelController.js`
   - **Issue:** Test endpoints exposed in production.
   - **Fix:** Remove or protect with admin authentication + development-only check.

2. **⚠️ Error Messages May Expose Stack Traces**
   - **Location:** Multiple controllers
   - **Issue:** Some error handlers return full error messages. Ensure production mode hides details.
   - **Fix:** Verify `process.env.NODE_ENV === 'production'` checks are in place.

3. **⚠️ No Input Sanitization Middleware**
   - **Location:** `zanzitrekking-backend/server.js`
   - **Issue:** While Joi validation exists, no general input sanitization (e.g., express-validator, express-mongo-sanitize).
   - **Fix:** Add `express-mongo-sanitize` to prevent NoSQL injection:
   ```javascript
   const mongoSanitize = require('express-mongo-sanitize');
   app.use(mongoSanitize());
   ```

4. **⚠️ Morgan Logger in Production**
   - **Location:** `zanzitrekking-backend/server.js:209`
   - **Issue:** Using `morgan('tiny')` in production may log sensitive data.
   - **Fix:** Use conditional logging:
   ```javascript
   if (process.env.NODE_ENV !== 'production') {
     app.use(morgan('dev'));
   } else {
     app.use(morgan('combined')); // Or use a more secure format
   }
   ```

5. **⚠️ File Download Endpoint Debug Info**
   - **Location:** `zanzitrekking-backend/server.js:380-383`
   - **Issue:** Returns debug info in 404 responses which could expose file structure.
   - **Fix:** Remove debug info in production:
   ```javascript
   return res.status(404).json({
     error: "File not found",
     ...(process.env.NODE_ENV === 'development' && { debug: debugInfo })
   });
   ```

### Frontend

6. **⚠️ Duplicate Component Reference**
   - **Location:** `zanzitrekking-frontend/src/pages/Home.jsx:91`
   - **Issue:** Both `GoogleReviewsWidget` (lazy) and `GoogleReviewsWidgets` (non-lazy) are rendered.
   - **Fix:** Remove duplicate or consolidate.

7. **⚠️ No Error Boundary**
   - **Location:** `zanzitrekking-frontend/src/`
   - **Issue:** No React error boundary to catch and handle component errors gracefully.
   - **Fix:** Add error boundary component.

### Database

8. **⚠️ Missing Email Index**
   - **Location:** `zanzitrekking-backend/models/admin.js`
   - **Issue:** Admin model email field should have unique index.
   - **Fix:** Add:
   ```javascript
   adminSchema.index({ email: 1 }, { unique: true });
   ```

---

## 🟢 GOOD (Already Handled Well)

1. ✅ **Passwords Properly Hashed**
   - Using `bcryptjs` with salt rounds (10) in `authControllers.js`

2. ✅ **JWT Tokens in httpOnly Cookies**
   - Primary authentication method uses secure httpOnly cookies
   - Secure flag set based on `NODE_ENV`

3. ✅ **Environment Variables Used Correctly**
   - All sensitive data uses `process.env` (no hardcoded secrets found)

4. ✅ **CORS Configured**
   - Proper origin whitelist (though needs improvement per critical issue #4)

5. ✅ **Mongoose Models Have Validation**
   - Required fields, enums, and data types properly defined

6. ✅ **Some Indexes Defined**
   - `urgentBookingRequest` model has good indexes

7. ✅ **.gitignore Properly Configured**
   - Excludes `.env`, `node_modules`, build artifacts

8. ✅ **Trust Proxy Configured**
   - `app.set('trust proxy', true)` set correctly for reverse proxy

9. ✅ **Frontend Build Configured**
   - Vite build script exists and configured
   - Console.logs removed in production build (terser config)

10. ✅ **Input Validation Middleware Exists**
    - Joi validation middleware present (`validationMiddleware.js`)

11. ✅ **Database Connection Error Handling**
    - Database connection has try-catch block

12. ✅ **File Upload Security**
    - Directory traversal prevention in file download endpoint

---

## 📋 Deployment Steps After Fixes

1. **Backend:**
   ```bash
   cd zanzitrekking-backend
   npm install express-rate-limit helmet express-mongo-sanitize
   npm run build  # If you have a build step
   NODE_ENV=production npm start
   ```

2. **Frontend:**
   ```bash
   cd zanzitrekking-frontend
   npm run build
   # Deploy dist/ folder
   ```

3. **Environment Variables:**
   - Set all required variables in production environment
   - Verify `NODE_ENV=production` is set
   - Verify `DB_URL` points to production MongoDB (not localhost)

4. **Database:**
   - Ensure production MongoDB has proper indexes
   - Run migrations if needed
   - Verify connection string uses production credentials

5. **Security:**
   - Remove test endpoints or protect them
   - Verify SSL/TLS certificates
   - Set up monitoring and logging

---

## 🔍 Additional Recommendations

1. **Set up monitoring** (e.g., Sentry, LogRocket)
2. **Set up CI/CD** (already have GitHub Actions, verify it's working)
3. **Database backups** - Ensure automated backups are configured
4. **Load testing** - Test API endpoints under load
5. **Security audit** - Consider using tools like `npm audit` or Snyk
6. **Documentation** - Document API endpoints and environment variables

---

**⚠️ DO NOT DEPLOY until all 🔴 CRITICAL issues are resolved.**
