const jwt = require("jsonwebtoken");
const secret = process.env.SECRET;
const refreshSecret = process.env.REFRESH_SECRET;

// Require environment variables - fail fast if not configured
if (!secret) {
  throw new Error('SECRET environment variable is required');
}
if (!refreshSecret) {
  throw new Error('REFRESH_SECRET environment variable is required');
}

const createAccessToken = (payload) => {
  return jwt.sign(payload, secret, { expiresIn: "15m" });
};

const createRefreshToken = (payload, expiresIn = "7d") => {
  return jwt.sign(payload, refreshSecret, { expiresIn });
};

module.exports = {
  createAccessToken,
  createRefreshToken,
  verifyRefreshToken: async (token) => {
    try {
      const decoded = await jwt.verify(token, refreshSecret);
      return { success: true, data: decoded };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },
};
