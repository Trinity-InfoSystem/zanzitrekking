const secret = process.env.SECRET
const jwt = require('jsonwebtoken')
const { responseReturn } = require('../utilities/response')
const redis = require('../redis')
const Admin = require('../models/admin')

// Admin JWT Middleware - checks for adminAccessToken
module.exports.jwtMiddleware = async (req, res, next) => {
  const { adminAccessToken } = req.cookies
  if (!adminAccessToken) {
    return responseReturn(res, 401, {
      error: 'Admin access token missing or expired'
    })
  }
  try {
    const decodedToken = jwt.verify(adminAccessToken, secret)

    const cached = await redis.get(`admin:${decodedToken.sub}`)
    if (cached) {
      req.admin = JSON.parse(cached)
    } else {
      const admin = await Admin.findById(decodedToken.sub)

      if (!admin) {
        return responseReturn(res, 401, {
          error: 'Admin not found'
        })
      }
      await redis.set(`admin:${decodedToken.sub}`, JSON.stringify(admin), 'EX', 3600)
      req.admin = admin
    }

    next()
  } catch (error) {
    return responseReturn(res, 401, {
      error: 'Admin access token invalid or expired'
    })
  }
}

// Customer JWT Middleware - checks for customerAccessToken OR regular accessToken
// Also supports Authorization header as fallback for production environments
module.exports.customerJwtMiddleware = async (req, res, next) => {
  // First try to get token from cookies (preferred method)
  const { customerAccessToken, accessToken } = req.cookies
  let token = customerAccessToken || accessToken // Backward compatibility

  // If no cookie token, try Authorization header (fallback for production)
  if (!token) {
    const authHeader = req.headers.authorization
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7) // Remove "Bearer " prefix
    }
  }

  if (!token) {
    return responseReturn(res, 401, {
      error: 'Customer access token missing or expired'
    })
  }
  try {
    const decodedToken = jwt.verify(token, secret)

    const cached = await redis.get(`customer:${decodedToken.sub}`)
    if (cached) {
      req.customer = JSON.parse(cached)
    } else {
      const Customer = require('../models/customer')
      const customer = await Customer.findById(decodedToken.sub)

      if (!customer) {
        return responseReturn(res, 401, {
          error: 'Customer not found'
        })
      }
      await redis.set(`customer:${decodedToken.sub}`, JSON.stringify(customer), 'EX', 3600)
      req.customer = customer
    }

    next()
  } catch (error) {
    return responseReturn(res, 401, {
      error: 'Customer access token invalid or expired'
    })
  }
}

module.exports.roleMiddleware = (requiredRole) => {
  return (req, res, next) => {
    if (!req.admin?.role) {
      return responseReturn(res, 403, { error: 'Role not found in token' })
    }

    if (req.admin.role !== requiredRole) {
      return responseReturn(res, 403, { error: 'Access Denied' })
    }
    next()
  }
}
