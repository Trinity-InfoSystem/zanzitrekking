const secret = process.env.SECRET;
const jwt = require("jsonwebtoken");
const { responseReturn } = require("../utilities/response");
const Admin = require("../models/admin");
const Customer = require("../models/customer");

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
    // Support both 'sub' and 'id' for backward compatibility
    const userId = decodedToken.sub || decodedToken.id;
    
    if (!userId || !decodedToken.role) {
      return responseReturn(res, 401, {
        error: "Invalid token payload",
      });
    }

    // Fetch admin data from database (minimal query)
    const admin = await Admin.findById(userId).select('_id role accessRoutes');
    if (!admin) {
      return responseReturn(res, 401, {
        error: "Admin not found",
      });
    }

    req.id = admin._id;
    req.role = admin.role;
    req.accessRoutes = admin.accessRoutes;
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
    // Support both 'sub' and 'id' for backward compatibility
    const userId = decodedToken.sub || decodedToken.id;
    
    if (!userId) {
      return responseReturn(res, 401, {
        error: "Invalid token payload",
      });
    }

    // Fetch customer data from database
    const customer = await Customer.findById(userId).select('_id name email method assignedAdmin');
    if (!customer) {
      return responseReturn(res, 401, {
        error: "Customer not found",
      });
    }

    req.id = customer._id;
    req.name = customer.name;
    req.email = customer.email;
    req.method = customer.method;
    req.assignedAdmin = customer.assignedAdmin;
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
