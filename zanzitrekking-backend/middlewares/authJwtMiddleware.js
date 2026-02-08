const secret = process.env.SECRET;
const jwt = require("jsonwebtoken");
const { responseReturn } = require("../utilities/response");

// Admin JWT Middleware - checks for adminAccessToken
module.exports.jwtMiddleware = async (req, res, next) => {
  const { adminAccessToken } = req.cookies;
  if (!adminAccessToken) {
    return responseReturn(res, 401, {
      error: "Admin access token missing or expired",
    });
  }
  try {
    const decodedToken = jwt.verify(adminAccessToken, secret);
    req.role = decodedToken.role;
    req.id = decodedToken.id;
    next();
  } catch (error) {
    return responseReturn(res, 401, {
      error: "Admin access token invalid or expired",
    });
  }
};

// Customer JWT Middleware - checks for customerAccessToken OR regular accessToken
// Also supports Authorization header as fallback for production environments
module.exports.customerJwtMiddleware = async (req, res, next) => {
  // First try to get token from cookies (preferred method)
  const { customerAccessToken, accessToken } = req.cookies;
  let token = customerAccessToken || accessToken; // Backward compatibility

  // If no cookie token, try Authorization header (fallback for production)
  if (!token) {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.substring(7); // Remove "Bearer " prefix
    }
  }

  if (!token) {
    return responseReturn(res, 401, {
      error: "Customer access token missing or expired",
    });
  }
  try {
    const decodedToken = jwt.verify(token, secret);
    req.id = decodedToken.id;
    req.name = decodedToken.name;
    req.email = decodedToken.email;
    req.method = decodedToken.method;
    req.assignedAdmin = decodedToken.assignedAdmin;
    next();
  } catch (error) {
    return responseReturn(res, 401, {
      error: "Customer access token invalid or expired",
    });
  }
};

module.exports.roleMiddleware = (requiredRole) => {
  return (req, res, next) => {
    if (!req.role) {
      return responseReturn(res, 403, { error: "Role not found in token" });
    }
    if (req.role !== requiredRole) {
      return responseReturn(res, 403, { error: "Access Denied" });
    }
    next();
  };
};
