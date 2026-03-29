const Customer = require("../../models/customer");
const logger = require("./../../utilities/logger");
const Admin = require("../../models/admin");
const { responseReturn } = require("../../utilities/response");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const {
  createAccessToken,
  createRefreshToken,
  verifyRefreshToken,
} = require("../../utilities/tokenCreate");
const { OAuth2Client } = require("google-auth-library");
const axios = require("axios");
const emailQueue = require("../../workers/emailQueue");

// ---------------------------------------------------------------------------
// Cookie helpers — single source of truth for cookie config
// ---------------------------------------------------------------------------
const COOKIE_BASE = {
  path: "/",
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "None" : "Strict",
};

const setAuthCookies = (res, accessToken, refreshToken) => {
  res.cookie("customerAccessToken", accessToken, {
    ...COOKIE_BASE,
    maxAge: 15 * 60 * 1000, // 15 minutes
  });
  res.cookie("customerRefreshToken", refreshToken, {
    ...COOKIE_BASE,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
};

const clearAuthCookies = (res) => {
  res.clearCookie("customerAccessToken", COOKIE_BASE);
  res.clearCookie("customerRefreshToken", COOKIE_BASE);
};

// ---------------------------------------------------------------------------
// Strip sensitive fields before returning customer to client
// ---------------------------------------------------------------------------
const safeCustomer = (customer) => {
  const obj = customer.toObject ? customer.toObject() : { ...customer };
  delete obj.password;
  delete obj.refreshToken;
  delete obj.resetPasswordOTP;
  delete obj.resetPasswordExpires;
  return obj;
};

class CustomerController {
  // ---------------------------------------------------------------------------
  // POST /customer/customer-register
  // ---------------------------------------------------------------------------
  register_customer = async (req, res) => {
    const { name, email, password } = req.body;

    try {
      const existingCustomer = await Customer.findOne({ email });
      if (existingCustomer) {
        return responseReturn(res, 409, { error: "Email Already Exists" });
      }

      const admin = await Admin.findOne().sort({ activeChatSessions: 1 });
      if (!admin) {
        return responseReturn(res, 500, { error: "No admin available for support" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const customer = await Customer.create({
        name: name.trim(),
        email: email.trim(),
        password: hashedPassword,
        method: "manual",
        assignedAdmin: admin._id,
      });

      const tokenData = { sub: customer.id };
      const accessToken = createAccessToken(tokenData);
      const refreshToken = createRefreshToken(tokenData);

      customer.refreshToken = refreshToken;
      await customer.save();

      setAuthCookies(res, accessToken, refreshToken);

      // Return customer info directly — frontend no longer decodes tokens
      return responseReturn(res, 201, {
        message: "Register Success",
        customer: safeCustomer(customer),
      });
    } catch (error) {
      logger.error("register_customer error:", error);
      return responseReturn(res, 500, { error: error.message });
    }
  };

  // ---------------------------------------------------------------------------
  // POST /customer/customer-login
  // ---------------------------------------------------------------------------
  login_customer = async (req, res) => {
    const { email, password } = req.body;

    try {
      const customer = await Customer.findOne({ email }).select(
        "+password +refreshToken"
      );
      if (!customer) {
        return responseReturn(res, 404, { error: "Email doesn't exist" });
      }

      if (customer.method !== "manual") {
        return responseReturn(res, 400, {
          error: `Please login using ${customer.method} authentication`,
        });
      }

      const isPasswordCorrect = await bcrypt.compare(password, customer.password);
      if (!isPasswordCorrect) {
        return responseReturn(res, 400, { error: "Incorrect Password" });
      }

      const tokenData = { sub: customer.id };
      const accessToken = createAccessToken(tokenData);
      const refreshToken = createRefreshToken(tokenData);

      customer.refreshToken = refreshToken;
      await customer.save();

      setAuthCookies(res, accessToken, refreshToken);

      // Fetch clean customer object (without sensitive fields) for response
      const customerData = await Customer.findById(customer.id)
        .select("-password -refreshToken -resetPasswordOTP -resetPasswordExpires")
        .populate({ path: "assignedAdmin", select: "name email image role" })
        .lean();

      return responseReturn(res, 200, {
        message: "Login successful",
        customer: customerData,
      });
    } catch (error) {
      logger.error("login_customer error:", error);
      return responseReturn(res, 500, { error: error.message });
    }
  };

  // ---------------------------------------------------------------------------
  // POST /customer/logout
  // ---------------------------------------------------------------------------
  logout_customer = async (req, res) => {
    try {
      // Invalidate refresh token in DB if customer is identified
      const token = req.cookies?.customerRefreshToken;
      if (token) {
        try {
          const { success, data } = await verifyRefreshToken(token);
          if (success && data?.sub) {
            await Customer.findByIdAndUpdate(data.sub, { refreshToken: null });
          }
        } catch (_) {
          // Token may already be invalid — that's fine, still clear cookies
        }
      }

      clearAuthCookies(res);
      return responseReturn(res, 200, { message: "Logged out successfully" });
    } catch (error) {
      logger.error("logout_customer error:", error);
      // Still clear cookies even if DB update fails
      clearAuthCookies(res);
      return responseReturn(res, 200, { message: "Logged out successfully" });
    }
  };

  // ---------------------------------------------------------------------------
  // GET /customer/me
  // Called by hydrateAuth on app load — verifies the httpOnly cookie and
  // returns the current customer so Redux state can be restored.
  // ---------------------------------------------------------------------------
  get_me = async (req, res) => {
    try {
      const token = req.cookies?.customerAccessToken;
      if (!token) {
        return responseReturn(res, 401, { error: "Not authenticated" });
      }

      // Must use the same secret as utilities/tokenCreate.js (createAccessToken).
      // customerJwtMiddleware uses SECRET — JWT_SECRET is a different value and would always fail here.
      const jwt = require("jsonwebtoken");
      let decoded;
      try {
        decoded = jwt.verify(token, process.env.SECRET);
      } catch (_) {
        return responseReturn(res, 401, { error: "Not authenticated" });
      }

      const customer = await Customer.findById(decoded.sub)
        .select("-password -refreshToken -resetPasswordOTP -resetPasswordExpires")
        .populate({ path: "assignedAdmin", select: "name email image role" })
        .lean();

      if (!customer) {
        return responseReturn(res, 401, { error: "Customer not found" });
      }

      return responseReturn(res, 200, { customer });
    } catch (error) {
      logger.error("get_me error:", error);
      return responseReturn(res, 500, { error: "Internal server error" });
    }
  };

  // ---------------------------------------------------------------------------
  // POST /customer/refresh-token
  // Reads ONLY from the httpOnly cookie — no Authorization header fallback.
  // ---------------------------------------------------------------------------
  refresh_token = async (req, res) => {
    const token = req.cookies?.customerRefreshToken;

    if (!token) {
      return responseReturn(res, 401, { error: "Refresh token missing" });
    }

    try {
      const { success, data, error } = await verifyRefreshToken(token);

      if (!success || !data?.sub) {
        return responseReturn(res, 403, { error: error || "Invalid refresh token" });
      }

      const customer = await Customer.findById(data.sub).select("+refreshToken");
      if (!customer || customer.refreshToken !== token) {
        // Token reuse detected or customer deleted
        clearAuthCookies(res);
        return responseReturn(res, 403, { error: "Invalid refresh token" });
      }

      const tokenData = { sub: customer.id };
      const newAccessToken = createAccessToken(tokenData);
      // Rotate refresh token on every use (prevents token reuse attacks)
      const newRefreshToken = createRefreshToken(tokenData);

      customer.refreshToken = newRefreshToken;
      await customer.save();

      setAuthCookies(res, newAccessToken, newRefreshToken);

      // No tokens in response body — cookies are the only delivery mechanism
      return responseReturn(res, 200, { message: "Token refreshed" });
    } catch (error) {
      logger.error("refresh_token error:", error);
      return responseReturn(res, 500, { error: error.message });
    }
  };

  // ---------------------------------------------------------------------------
  // POST /customer/google-login
  // ---------------------------------------------------------------------------
  google_login = async (req, res) => {
    try {
      const { tokenId, access_token } = req.body;
      let payload;
      const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

      if (tokenId) {
        const ticket = await client.verifyIdToken({
          idToken: tokenId,
          audience: process.env.GOOGLE_CLIENT_ID,
        });
        payload = ticket.getPayload();
      } else if (access_token) {
        const { data: userInfo } = await axios.get(
          "https://www.googleapis.com/oauth2/v3/userinfo",
          { headers: { Authorization: `Bearer ${access_token}` } }
        );
        payload = { email: userInfo.email, name: userInfo.name, sub: userInfo.sub };
      } else {
        return responseReturn(res, 400, {
          error: "Either tokenId or access_token must be provided",
        });
      }

      const { email, name, sub: googleId } = payload;

      const admin = await Admin.findOne().sort({ activeChatSessions: 1 });
      if (!admin) {
        return responseReturn(res, 500, { error: "No admin available for support" });
      }

      let customer = await Customer.findOne({ email });

      if (!customer) {
        customer = await Customer.create({
          name,
          email,
          method: "google",
          socialId: googleId,
          assignedAdmin: admin._id,
        });
      } else if (customer.method !== "google") {
        return responseReturn(res, 400, {
          error: `Email already registered with ${customer.method} authentication`,
          method: customer.method,
        });
      }

      const tokenData = { sub: customer.id };
      const accessToken = createAccessToken(tokenData);
      const refreshToken = createRefreshToken(tokenData);

      customer.refreshToken = refreshToken;
      await customer.save();

      setAuthCookies(res, accessToken, refreshToken);

      const customerData = await Customer.findById(customer.id)
        .select("-password -refreshToken -resetPasswordOTP -resetPasswordExpires")
        .populate({ path: "assignedAdmin", select: "name email image role" })
        .lean();

      return responseReturn(res, 200, {
        message: "Google login successful",
        customer: customerData,
      });
    } catch (error) {
      logger.error("google_login error:", error);
      if (error.response?.status === 401) {
        return responseReturn(res, 401, { error: "Invalid Google token" });
      }
      return responseReturn(res, 500, {
        error: "Internal server error",
        details: process.env.NODE_ENV === "development" ? error.message : undefined,
      });
    }
  };

  // ---------------------------------------------------------------------------
  // POST /customer/facebook-login
  // ---------------------------------------------------------------------------
  facebook_login = async (req, res) => {
    try {
      const { accessToken, userID } = req.body;

      const { data } = await axios.get(
        `https://graph.facebook.com/v12.0/${userID}`,
        { params: { fields: "id,name,email", access_token: accessToken } }
      );

      const { email, name, id: facebookId } = data;

      const admin = await Admin.findOne().sort({ activeChatSessions: 1 });
      if (!admin) {
        return responseReturn(res, 500, { error: "No admin available for support" });
      }

      let customer = await Customer.findOne({ email });

      if (!customer) {
        customer = await Customer.create({
          name,
          email,
          method: "facebook",
          socialId: facebookId,
          assignedAdmin: admin._id,
        });
      } else if (customer.method !== "facebook") {
        return responseReturn(res, 400, {
          error: `Email already registered with ${customer.method} authentication`,
        });
      }

      const tokenData = { sub: customer.id };
      const newAccessToken = createAccessToken(tokenData);
      const refreshToken = createRefreshToken(tokenData);

      customer.refreshToken = refreshToken;
      await customer.save();

      setAuthCookies(res, newAccessToken, refreshToken);

      const customerData = await Customer.findById(customer.id)
        .select("-password -refreshToken -resetPasswordOTP -resetPasswordExpires")
        .populate({ path: "assignedAdmin", select: "name email image role" })
        .lean();

      return responseReturn(res, 200, {
        message: "Facebook login successful",
        customer: customerData,
      });
    } catch (error) {
      logger.error("facebook_login error:", error);
      return responseReturn(res, 500, { error: error.message });
    }
  };

  // ---------------------------------------------------------------------------
  // GET /customer/:customerId
  // ---------------------------------------------------------------------------
  getCustomer = async (req, res) => {
    const { customerId } = req.params;

    try {
      const customer = await Customer.findById(customerId)
        .select("-password -refreshToken -resetPasswordOTP -resetPasswordExpires")
        .populate({ path: "assignedAdmin", select: "name email image role" })
        .lean();

      if (!customer) {
        return responseReturn(res, 404, { error: "Customer not found" });
      }

      return responseReturn(res, 200, { customer });
    } catch (error) {
      logger.error("getCustomer error:", error);
      return responseReturn(res, 500, { error: "Internal Server Error" });
    }
  };

  // ---------------------------------------------------------------------------
  // GET /customer/all
  // ---------------------------------------------------------------------------
  getAllCustomers = async (req, res) => {
    try {
      const customers = await Customer.find({})
        .select("-password -refreshToken -resetPasswordOTP -resetPasswordExpires")
        .populate({ path: "assignedAdmin", select: "name email image role" })
        .lean();

      return responseReturn(res, 200, { customers });
    } catch (error) {
      logger.error("getAllCustomers error:", error);
      return responseReturn(res, 500, { error: "Internal Server Error" });
    }
  };

  // ---------------------------------------------------------------------------
  // GET /customer   (paginated)
  // ---------------------------------------------------------------------------
  getCustomers = async (req, res) => {
    try {
      const {
        page = 1,
        parPage = 10,
        searchValue = "",
        sort = "newest-desc",
      } = req.query;

      let sortOptions = {};
      let collation = null;

      if (sort === "name-asc") {
        sortOptions = { name: 1 };
        collation = { locale: "en", strength: 2 };
      } else if (sort === "name-desc") {
        sortOptions = { name: -1 };
        collation = { locale: "en", strength: 2 };
      } else if (sort === "newest-asc") {
        sortOptions = { createdAt: 1 };
      } else {
        sortOptions = { createdAt: -1 };
      }

      const query = {};
      if (searchValue) {
        query.$or = [
          { name: { $regex: searchValue, $options: "i" } },
          { email: { $regex: searchValue, $options: "i" } },
        ];
      }

      const options = {
        page: parseInt(page),
        limit: parseInt(parPage),
        sort: sortOptions,
        select: "-password -refreshToken -resetPasswordOTP -resetPasswordExpires",
        populate: { path: "assignedAdmin", select: "name email image role" },
        lean: true,
        ...(collation && { collation }),
      };

      const result = await Customer.paginate(query, options);

      return responseReturn(res, 200, {
        customers: result.docs,
        pagination: {
          totalDocs: result.totalDocs,
          limit: result.limit,
          totalPages: result.totalPages,
          page: result.page,
          pagingCounter: result.pagingCounter,
          hasPrevPage: result.hasPrevPage,
          hasNextPage: result.hasNextPage,
          prevPage: result.prevPage,
          nextPage: result.nextPage,
        },
      });
    } catch (error) {
      logger.error("getCustomers error:", error);
      return responseReturn(res, 500, { error: "Internal Server Error" });
    }
  };

  // ---------------------------------------------------------------------------
  // POST /customer/forgot-password
  // ---------------------------------------------------------------------------
  forgot_password = async (req, res) => {
    const { email } = req.body;

    try {
      const customer = await Customer.findOne({ email });

      // Always return the same response to prevent email enumeration
      if (!customer || customer.method !== "manual") {
        return responseReturn(res, 200, {
          message: "If that email exists, an OTP has been sent",
          email,
        });
      }

      // Use crypto for a cryptographically secure OTP
      const otp = crypto.randomInt(100000, 999999).toString();
      const otpExpiry = Date.now() + 15 * 60 * 1000;

      customer.resetPasswordOTP = await bcrypt.hash(otp, 10);
      customer.resetPasswordExpires = otpExpiry;
      await customer.save();

      emailQueue.add({
        subject: "Password Reset OTP - Zanzi Trekking & Safaris",
        content: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #1B4332;">Password Reset Request</h2>
            <p>Use the OTP below to reset your password:</p>
            <div style="background-color: #f0f9f4; padding: 25px; text-align: center; border-radius: 10px; border: 2px solid #1B4332;">
              <h1 style="color: #1B4332; margin: 0; font-size: 36px; letter-spacing: 8px;">${otp}</h1>
            </div>
            <p><strong>This OTP expires in 15 minutes.</strong></p>
            <p>If you didn't request this, please ignore this email.</p>
          </div>
        `,
        recipients: [email],
      });

      return responseReturn(res, 200, {
        message: "If that email exists, an OTP has been sent",
        email,
      });
    } catch (error) {
      logger.error("forgot_password error:", error);
      return responseReturn(res, 500, { error: "Internal server error" });
    }
  };

  // ---------------------------------------------------------------------------
  // POST /customer/verify-otp
  // ---------------------------------------------------------------------------
  verify_otp = async (req, res) => {
    const { email, otp } = req.body;

    try {
      const customer = await Customer.findOne({
        email,
        resetPasswordExpires: { $gt: Date.now() },
      }).select("+resetPasswordOTP");

      if (!customer?.resetPasswordOTP) {
        return responseReturn(res, 400, { error: "Invalid or expired OTP" });
      }

      const isOtpValid = await bcrypt.compare(otp, customer.resetPasswordOTP);
      if (!isOtpValid) {
        return responseReturn(res, 400, { error: "Invalid or expired OTP" });
      }

      return responseReturn(res, 200, {
        message: "OTP verified successfully",
        verified: true,
      });
    } catch (error) {
      logger.error("verify_otp error:", error);
      return responseReturn(res, 500, { error: "Internal server error" });
    }
  };

  // ---------------------------------------------------------------------------
  // POST /customer/resend-otp
  // ---------------------------------------------------------------------------
  resend_otp = async (req, res) => {
    const { email } = req.body;

    try {
      const customer = await Customer.findOne({ email });

      // Same response regardless — prevent enumeration
      if (!customer || customer.method !== "manual") {
        return responseReturn(res, 200, {
          message: "If that email exists, a new OTP has been sent",
        });
      }

      const otp = crypto.randomInt(100000, 999999).toString();

      customer.resetPasswordOTP = await bcrypt.hash(otp, 10);
      customer.resetPasswordExpires = Date.now() + 15 * 60 * 1000;
      await customer.save();

      emailQueue.add({
        subject: "New Verification Code - Zanzi Trekking & Safaris",
        content: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #1B4332;">New Verification Code</h2>
            <p>Hi ${customer.name}, here is your new OTP:</p>
            <div style="background-color: #f0f9f4; padding: 25px; text-align: center; border-radius: 10px; border: 2px solid #1B4332;">
              <h1 style="color: #1B4332; margin: 0; font-size: 36px; letter-spacing: 8px;">${otp}</h1>
            </div>
            <p><strong>This OTP expires in 15 minutes.</strong></p>
          </div>
        `,
        recipients: [email],
      });

      return responseReturn(res, 200, {
        message: "If that email exists, a new OTP has been sent",
      });
    } catch (error) {
      logger.error("resend_otp error:", error);
      return responseReturn(res, 500, { error: "Internal server error" });
    }
  };

  // ---------------------------------------------------------------------------
  // POST /customer/reset-password
  // ---------------------------------------------------------------------------
  reset_password = async (req, res) => {
    const { email, otp, newPassword } = req.body;

    try {
      const customer = await Customer.findOne({
        email,
        resetPasswordExpires: { $gt: Date.now() },
      }).select("+resetPasswordOTP");

      if (!customer?.resetPasswordOTP) {
        return responseReturn(res, 400, { error: "Invalid or expired OTP" });
      }

      const isOtpValid = await bcrypt.compare(otp, customer.resetPasswordOTP);
      if (!isOtpValid) {
        return responseReturn(res, 400, { error: "Invalid or expired OTP" });
      }

      customer.password = await bcrypt.hash(newPassword, 10);
      customer.resetPasswordOTP = undefined;
      customer.resetPasswordExpires = undefined;
      // Invalidate all existing sessions on password reset
      customer.refreshToken = null;
      await customer.save();

      clearAuthCookies(res);

      return responseReturn(res, 200, {
        message: "Password reset successfully. Please log in with your new password.",
      });
    } catch (error) {
      logger.error("reset_password error:", error);
      return responseReturn(res, 500, { error: "Internal server error" });
    }
  };
}

module.exports = new CustomerController();