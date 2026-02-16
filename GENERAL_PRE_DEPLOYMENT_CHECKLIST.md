# General Pre-Deployment Checklist for MERN Stack Applications

A comprehensive checklist for deploying MongoDB, Express, React, and Node.js applications to production.

---

## 🔴 CRITICAL - Security & Configuration

### Environment Variables & Secrets

- [ ] **All sensitive data uses environment variables** - No hardcoded API keys, secrets, or credentials
- [ ] **`.env.example` file exists** - Documents all required environment variables (without actual values)
- [ ] **`.env` files are in `.gitignore`** - Never commit `.env` files to version control
- [ ] **Production environment variables are set** - All required vars configured in production environment
- [ ] **Different secrets for production** - Never reuse development secrets in production
- [ ] **Database connection string is production** - Not pointing to localhost or development database

### Authentication & Authorization

- [ ] **Passwords are hashed** - Using bcrypt, argon2, or similar (never store plain text)
- [ ] **JWT tokens stored securely** - Prefer httpOnly cookies over localStorage
- [ ] **Token expiration configured** - Access tokens expire (15min-1hr), refresh tokens longer
- [ ] **Refresh token rotation** - Implement refresh token rotation for security
- [ ] **Role-based access control (RBAC)** - Protected routes check user roles/permissions
- [ ] **Password reset tokens expire** - OTPs/reset tokens have expiration times
- [ ] **Secure password requirements** - Minimum length, complexity rules enforced

### API Security

- [ ] **Rate limiting implemented** - Prevent DDoS and brute force attacks
- [ ] **CORS configured correctly** - Only allow trusted origins, restrict in production
- [ ] **Input validation** - Validate and sanitize all user inputs (Joi, express-validator)
- [ ] **SQL/NoSQL injection prevention** - Sanitize database queries, use parameterized queries
- [ ] **XSS protection** - Sanitize user-generated content, use CSP headers
- [ ] **CSRF protection** - Implement CSRF tokens for state-changing operations
- [ ] **Security headers** - Use Helmet.js or similar for security headers
- [ ] **API routes protected** - Authentication middleware on protected endpoints
- [ ] **Error messages don't leak info** - Generic errors in production, detailed only in dev

### Error Handling

- [ ] **Global error handler** - Centralized error handling middleware
- [ ] **Error logging** - Log errors to file/service (not just console)
- [ ] **No stack traces in production** - Hide stack traces from end users
- [ ] **Graceful error responses** - Proper HTTP status codes and error messages
- [ ] **Unhandled promise rejections** - Catch and handle async errors
- [ ] **Process crash handling** - Use process.on('uncaughtException') appropriately

---

## 🟡 IMPORTANT - Performance & Reliability

### Backend (Node.js/Express)

- [ ] **Production start script** - `"start": "node server.js"` in package.json
- [ ] **NODE_ENV set to production** - Environment variable properly set
- [ ] **Process manager** - Use PM2, Forever, or similar for process management
- [ ] **Database connection pooling** - Configured for optimal performance
- [ ] **Database indexes** - Indexes on frequently queried fields
- [ ] **Request body size limits** - Set `express.json({ limit: '10mb' })` or appropriate
- [ ] **File upload limits** - Configure multer/file upload size limits
- [ ] **Logging configured** - Use proper logging library (Winston, Pino) instead of console.log
- [ ] **Remove debug code** - No console.logs, test endpoints, or debug code in production
- [ ] **Health check endpoint** - `/health` or `/api/health` endpoint for monitoring

### Frontend (React)

- [ ] **Production build works** - `npm run build` completes successfully
- [ ] **Environment variables** - Use `VITE_` prefix (Vite) or `REACT_APP_` (Create React App)
- [ ] **No hardcoded URLs** - API URLs use environment variables
- [ ] **Error boundaries** - React error boundaries catch component errors
- [ ] **Loading states** - Proper loading indicators for async operations
- [ ] **Error handling** - User-friendly error messages for failed API calls
- [ ] **No sensitive data in client** - No API keys, secrets exposed in client-side code
- [ ] **Code splitting** - Lazy loading for better performance
- [ ] **Asset optimization** - Images optimized, fonts loaded efficiently
- [ ] **404 handling** - Proper 404 page for unknown routes

### Database (MongoDB)

- [ ] **Production database** - Using production MongoDB instance (not localhost)
- [ ] **Connection string secure** - Uses authentication, not open to public
- [ ] **Indexes created** - Frequently queried fields have indexes
- [ ] **Unique constraints** - Email, username, etc. have unique indexes
- [ ] **Data validation** - Mongoose schemas have proper validation
- [ ] **Backups configured** - Automated backups set up
- [ ] **Connection error handling** - Graceful handling of database connection failures

---

## 🟢 RECOMMENDED - Best Practices

### Code Quality

- [ ] **No unused dependencies** - Remove unused npm packages
- [ ] **Dependencies up to date** - Check for security vulnerabilities (`npm audit`)
- [ ] **Code linting** - ESLint configured and passing
- [ ] **Code formatting** - Prettier or similar formatter configured
- [ ] **Type checking** - TypeScript or PropTypes for type safety
- [ ] **Test coverage** - Unit tests, integration tests (if applicable)

### DevOps & Infrastructure

- [ ] **CI/CD pipeline** - Automated testing and deployment
- [ ] **Version control** - Code committed to Git, proper branching strategy
- [ ] **Environment separation** - Dev, staging, production environments
- [ ] **SSL/TLS certificates** - HTTPS configured (Let's Encrypt, etc.)
- [ ] **Domain configuration** - DNS records properly configured
- [ ] **Server monitoring** - Uptime monitoring, error tracking (Sentry, etc.)
- [ ] **Log aggregation** - Centralized logging (if applicable)
- [ ] **Backup strategy** - Database and file backups automated

### Documentation

- [ ] **README updated** - Installation and setup instructions
- [ ] **API documentation** - Endpoints documented (Swagger, Postman, etc.)
- [ ] **Environment variables documented** - `.env.example` with descriptions
- [ ] **Deployment guide** - Steps to deploy documented
- [ ] **Changelog** - Recent changes documented

### Testing

- [ ] **Manual testing** - Critical user flows tested
- [ ] **Cross-browser testing** - Works in Chrome, Firefox, Safari, Edge
- [ ] **Mobile responsive** - Works on mobile devices
- [ ] **Load testing** - API can handle expected load
- [ ] **Security testing** - Basic security checks performed

---

## 📋 Pre-Deployment Verification

### Final Checks

- [ ] **All critical issues resolved** - No security vulnerabilities
- [ ] **Environment variables verified** - All required vars set in production
- [ ] **Database migrations run** - Schema changes applied
- [ ] **Static assets deployed** - Images, fonts, etc. uploaded
- [ ] **Third-party services configured** - Email, payment, etc. configured
- [ ] **Monitoring set up** - Error tracking and uptime monitoring active
- [ ] **Rollback plan** - Know how to rollback if issues occur

### Post-Deployment

- [ ] **Smoke tests** - Basic functionality works after deployment
- [ ] **Monitor logs** - Check for errors in first few hours
- [ ] **Performance monitoring** - Response times acceptable
- [ ] **User acceptance** - Key stakeholders verify functionality

---

## 🔧 Common Commands

### Backend
```bash
# Install dependencies
npm install

# Run security audit
npm audit

# Start production server
NODE_ENV=production npm start

# Check for vulnerabilities
npm audit fix
```

### Frontend
```bash
# Install dependencies
npm install

# Build for production
npm run build

# Preview production build locally
npm run preview
```

### Database
```bash
# Create indexes (if needed)
# Run in MongoDB shell or migration script

# Backup database
mongodump --uri="your_connection_string"

# Restore database
mongorestore --uri="your_connection_string"
```

---

## 🚨 Red Flags - Do NOT Deploy If:

- ❌ Any hardcoded secrets or API keys
- ❌ Database pointing to localhost
- ❌ No error handling middleware
- ❌ No rate limiting
- ❌ CORS allows all origins (`*`)
- ❌ Passwords stored in plain text
- ❌ No authentication on protected routes
- ❌ Stack traces exposed to users
- ❌ Test/debug endpoints exposed
- ❌ No `.env.example` file
- ❌ `.env` file committed to Git

---

## 📚 Additional Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/) - Common security vulnerabilities
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [Express Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)
- [React Security Best Practices](https://reactjs.org/docs/dom-elements.html#security)

---

**Remember:** Security and reliability should be prioritized over features. It's better to delay deployment than to deploy with critical vulnerabilities.
