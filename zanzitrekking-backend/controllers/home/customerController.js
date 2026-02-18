const Customer = require("../../models/customer");
const logger = require('./../../utilities/logger');
const Admin = require("../../models/admin");
const { responseReturn } = require("../../utilities/response");
const bcrypt = require("bcryptjs");
const {
  createAccessToken,
  createRefreshToken,
  verifyRefreshToken,
} = require("../../utilities/tokenCreate");
const { OAuth2Client } = require("google-auth-library");
const axios = require("axios");
const emailQueue = require("../../workers/emailQueue");

class CustomerController {
  register_customer = async (req, res) => {
    const { name, email, password } = req.body;

    try {
      const existingCustomer = await Customer.findOne({ email });
      if (existingCustomer) {
        return responseReturn(res, 409, { error: "Email Already Exists" });
      }

      const admin = await Admin.findOne().sort({ activeChatSessions: 1 });
      if (!admin) {
        return responseReturn(res, 500, {
          error: "No admin available for support",
        });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const customer = await Customer.create({
        name: name.trim(),
        email: email.trim(),
        password: hashedPassword,
        method: "manual",
        assignedAdmin: admin._id,
      });

      // Generate both tokens with minimal payload (only user ID)
      const tokenData = {
        sub: customer.id, // Use 'sub' (subject) standard JWT claim
      };

      const accessToken = await createAccessToken(tokenData);
      const refreshToken = await createRefreshToken(tokenData);

      // Save refresh token to DB
      customer.refreshToken = refreshToken;
      await customer.save();

      // Set both cookies with CUSTOMER-specific names
      res.cookie("customerAccessToken", accessToken, {
        expires: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "None" : "strict",
      });

      res.cookie("customerRefreshToken", refreshToken, {
        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "None" : "strict",
      });

      return responseReturn(res, 201, {
        message: "Register Success",
        accessToken,
        refreshToken,
      });
    } catch (error) {
      return responseReturn(res, 500, { error: error.message });
    }
  };
  login_customer = async (req, res) => {
    const { email, password } = req.body;

    try {
      const admin = await Admin.findOne().sort({ activeChatSessions: 1 });
      if (!admin) {
        return responseReturn(res, 500, {
          error: "No admin available for support",
        });
      }

      const customer = await Customer.findOne({ email }).select(
        "+password +refreshToken"
      );
      if (!customer) {
        return responseReturn(res, 404, { error: "Email doesn't exist" });
      }

      // For social login users who try to login manually
      if (customer.method !== "manual") {
        return responseReturn(res, 400, {
          error: `Please login using ${customer.method} authentication`,
        });
      }

      const isPasswordCorrect = await bcrypt.compare(
        password,
        customer.password
      );
      if (!isPasswordCorrect) {
        return responseReturn(res, 400, { error: "Incorrect Password" });
      }

      // Generate tokens with minimal payload (only user ID)
      const tokenData = {
        sub: customer.id, // Use 'sub' (subject) standard JWT claim
      };

      const accessToken = await createAccessToken(tokenData);
      const refreshToken = await createRefreshToken(tokenData);

      // Update refresh token in DB
      customer.refreshToken = refreshToken;
      await customer.save();

      res.cookie("customerAccessToken", accessToken, {
        expires: new Date(Date.now() + 15 * 60 * 1000),
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "None" : "strict",
      });

      res.cookie("customerRefreshToken", refreshToken, {
        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "None" : "strict",
      });

      return responseReturn(res, 200, {
        accessToken,
        refreshToken,
        message: "Login successful",
      });
    } catch (error) {
      return responseReturn(res, 500, { error: error.message });
    }
  };
  refresh_token = async (req, res) => {
    // First try to get token from cookies (preferred method)
    const { customerRefreshToken, refreshToken } = req.cookies;
    let token = customerRefreshToken || refreshToken; // Backward compatibility

    // If no cookie token, try Authorization header (fallback for production)
    if (!token) {
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith("Bearer ")) {
        token = authHeader.substring(7); // Remove "Bearer " prefix
      }
    }

    if (!token) {
      return responseReturn(res, 409, { error: "Refresh token missing" });
    }

    try {
      const { success, data, error } = await verifyRefreshToken(token);

      if (!success) {
        return responseReturn(res, 403, { error });
      }

      // Support both 'sub' and 'id' for backward compatibility
      const userId = data.sub || data.id;
      if (!userId) {
        return responseReturn(res, 403, { error: "Invalid refresh token payload" });
      }

      // Check if token exists in DB
      const customer = await Customer.findById(userId).select("+refreshToken");
      if (!customer || customer.refreshToken !== token) {
        return responseReturn(res, 403, { error: "Invalid refresh token" });
      }

      // Generate new access token with minimal payload
      const tokenData = {
        sub: customer.id,
      };

      const newAccessToken = await createAccessToken(tokenData);

      // Rotate refresh token for better security (prevents token reuse attacks)
      const newRefreshToken = await createRefreshToken(tokenData);
      customer.refreshToken = newRefreshToken;
      await customer.save();

      res.cookie("customerAccessToken", newAccessToken, {
        expires: new Date(Date.now() + 15 * 60 * 1000),
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "None" : "strict",
      });

      res.cookie("customerRefreshToken", newRefreshToken, {
        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "None" : "strict",
      });

      return responseReturn(res, 200, {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken, // Return new refresh token for frontend
      });
    } catch (error) {
      return responseReturn(res, 500, { error: error.message });
    }
  };
  google_login = async (req, res) => {
    try {
      const { tokenId, access_token } = req.body;

      let payload;
      const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

      // Method 1: Verify JWT ID Token (existing flow)
      if (tokenId) {
        const ticket = await client.verifyIdToken({
          idToken: tokenId,
          audience: process.env.GOOGLE_CLIENT_ID,
        });
        payload = ticket.getPayload();
      }
      // Method 2: Verify Access Token (new flow)
      else if (access_token) {
        const userInfo = await axios.get(
          "https://www.googleapis.com/oauth2/v3/userinfo",
          {
            headers: { Authorization: `Bearer ${access_token}` },
          }
        );
        payload = {
          email: userInfo.data.email,
          name: userInfo.data.name,
          sub: userInfo.data.sub,
        };
      } else {
        return responseReturn(res, 400, {
          error: "Either tokenId or accessToken must be provided",
        });
      }

      const { email, name, sub: googleId } = payload;

      // Find available admin (existing logic)
      const admin = await Admin.findOne().sort({ activeChatSessions: 1 });
      if (!admin) {
        return responseReturn(res, 500, {
          error: "No admin available for support",
        });
      }

      // Check if user exists (existing logic with improved error handling)
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
          method: customer.method, // Return the existing method
        });
      }

      // Token generation with minimal payload
      const tokenData = {
        sub: customer.id,
      };

      const accessToken = await createAccessToken(tokenData);
      const refreshToken = await createRefreshToken(tokenData);

      // Update customer (existing logic)
      customer.refreshToken = refreshToken;
      await customer.save();

      // Cookie setting with customer-specific names
      res.cookie("customerAccessToken", accessToken, {
        expires: new Date(Date.now() + 15 * 60 * 1000),
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "None" : "strict",
      });

      res.cookie("customerRefreshToken", refreshToken, {
        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "None" : "strict",
      });

      return responseReturn(res, 200, {
        accessToken,
        refreshToken,
        message: "Google login successful",
      });
    } catch (error) {
      logger.error("Google login error:", error);

      // Improved error handling
      if (error.response?.status === 401) {
        return responseReturn(res, 401, { error: "Invalid Google token" });
      }

      return responseReturn(res, 500, {
        error: "Internal server error",
        details:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      });
    }
  };
  facebook_login = async (req, res) => {
    try {
      const { accessToken, userID } = req.body;

      // Verify Facebook token
      const response = await axios.get(
        `https://graph.facebook.com/v12.0/${userID}?fields=id,name,email&access_token=${accessToken}`
      );

      const { email, name, id: facebookId } = response.data;

      const admin = await Admin.findOne().sort({ activeChatSessions: 1 });
      if (!admin) {
        return responseReturn(res, 500, {
          error: "No admin available for support",
        });
      }

      // Check if user exists
      let customer = await Customer.findOne({ email });

      if (!customer) {
        // Create new customer
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

      // Generate tokens with minimal payload
      const tokenData = {
        sub: customer.id,
      };

      const newAccessToken = await createAccessToken(tokenData);
      const refreshToken = await createRefreshToken(tokenData);

      customer.refreshToken = refreshToken;
      await customer.save();

      res.cookie("customerAccessToken", newAccessToken, {
        expires: new Date(Date.now() + 15 * 60 * 1000),
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
      });

      res.cookie("customerRefreshToken", refreshToken, {
        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
      });

      return responseReturn(res, 200, {
        newAccessToken,
        refreshToken,
        message: "Facebook login successful",
      });
    } catch (error) {
      return responseReturn(res, 500, { error: error.message });
    }
  };
  getCustomer = async (req, res) => {
    const { customerId } = req.params;

    try {
      const customer = await Customer.findById(customerId)
        .populate({
          path: "assignedAdmin",
          select: "name email image role", // Only get these fields from admin
        })
        .lean();

      if (!customer) {
        return responseReturn(res, 404, { error: "Customer not found" });
      }

      // Remove password if it somehow comes through (though schema has select: false)
      delete customer.password;

      return responseReturn(res, 200, { customer });
    } catch (error) {
      logger.error(error);
      return responseReturn(res, 500, { error: "Internal Server Error" });
    }
  };
  getAllCustomers = async (req, res) => {
    try {
      const customers = await Customer.find({})
        .select("-password -refreshToken")
        .populate({
          path: "assignedAdmin",
          select: "name email image role",
        })
        .lean();

      if (!customers) {
        return responseReturn(res, 404, { error: "Customers not found" });
      }

      return responseReturn(res, 200, { customers });
    } catch (error) {
      logger.error(error);
      return responseReturn(res, 500, { error: "Internal Server Error" });
    }
  };
  getCustomers = async (req, res) => {
    try {
      const { page = 1, parPage = 10, searchValue = "", sort = "newest-desc" } = req.query;

      // Determine sort order
      let sortOptions = {};
      let collation = null;
      if (sort === "name-asc") {
        sortOptions = { name: 1 }; // A-Z
        collation = { locale: "en", strength: 2 }; // Case-insensitive collation
      } else if (sort === "name-desc") {
        sortOptions = { name: -1 }; // Z-A
        collation = { locale: "en", strength: 2 }; // Case-insensitive collation
      } else if (sort === "newest-asc") {
        sortOptions = { createdAt: 1 }; // Oldest first
      } else {
        sortOptions = { createdAt: -1 }; // Newest first (default)
      }

      const options = {
        page: parseInt(page),
        limit: parseInt(parPage),
        sort: sortOptions,
        populate: {
          path: "assignedAdmin",
          select: "name email image role",
        },
        ...(collation && { collation }),
      };

      const query = {};
      if (searchValue) {
        query.$or = [
          { name: { $regex: searchValue, $options: "i" } },
          { email: { $regex: searchValue, $options: "i" } },
        ];
      }

      const customers = await Customer.paginate(query, options);

      return responseReturn(res, 200, {
        customers: customers.docs,
        pagination: {
          totalDocs: customers.totalDocs,
          limit: customers.limit,
          totalPages: customers.totalPages,
          page: customers.page,
          pagingCounter: customers.pagingCounter,
          hasPrevPage: customers.hasPrevPage,
          hasNextPage: customers.hasNextPage,
          prevPage: customers.prevPage,
          nextPage: customers.nextPage,
        },
      });
    } catch (error) {
      logger.error(error);
      return responseReturn(res, 500, { error: "Internal Server Error" });
    }
  };

  // Forgot Password - Send OTP
  forgot_password = async (req, res) => {
    const { email } = req.body;

    try {
      // Check if customer exists
      const customer = await Customer.findOne({ email });
      if (!customer) {
        return responseReturn(res, 404, { error: "Email not found" });
      }

      // For social login users, don't allow password reset
      if (customer.method !== "manual") {
        return responseReturn(res, 400, {
          error: `This email is registered with ${customer.method} authentication. Please use ${customer.method} login instead.`,
        });
      }

      function generateOtpInsecure() {
        // returns 000000 - 999999
        const num = Math.floor(Math.random() * 1_000_000);
        return String(num).padStart(6, "0");
      }

      // Generate OTP (6-digit code)
      const otp = generateOtpInsecure();
      const otpExpiry = Date.now() + 15 * 60 * 1000; // 15 minutes expiry

      // Hash OTP before storing in database
      const hashedOtp = await bcrypt.hash(otp, 10);

      // Save hashed OTP and expiry to customer document
      customer.resetPasswordOTP = hashedOtp;
      customer.resetPasswordExpires = otpExpiry;
      await customer.save();

      // Prepare email content
      const emailContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #1B4332; margin: 0;">Zanzi Trekking & Safaris</h1>
          <p style="color: #E76F51; margin: 5px 0;">Your Adventure Awaits</p>
        </div>
        
        <div style="background: linear-gradient(135deg, #1B4332, #E76F51); padding: 30px; border-radius: 15px; color: white; text-align: center; margin-bottom: 30px;">
          <h2 style="margin: 0 0 15px 0; font-size: 24px;">Password Reset Request</h2>
          <p style="margin: 0; opacity: 0.9;">You requested to reset your password. Use the OTP below to proceed:</p>
        </div>
        
        <div style="background-color: #f0f9f4; padding: 25px; text-align: center; margin: 20px 0; border-radius: 10px; border: 2px solid #1B4332;">
          <h1 style="color: #1B4332; margin: 0; font-size: 36px; letter-spacing: 8px; font-weight: bold;">${otp}</h1>
        </div>
        
        <div style="background-color: #fff7ed; padding: 20px; border-radius: 10px; border-left: 4px solid #F4A261; margin: 20px 0;">
          <p style="margin: 0; color: #92400e;"><strong>Important:</strong> This OTP will expire in 15 minutes.</p>
          <p style="margin: 5px 0 0 0; color: #92400e;">If you didn't request this reset, please ignore this email.</p>
        </div>
        
        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e5e5;">
          <p style="color: #78716c; font-size: 14px; margin: 0;">This is an automated message from Zanzi Trekking & Safaris</p>
          <p style="color: #78716c; font-size: 12px; margin: 5px 0 0 0;">Please do not reply to this email</p>
        </div>
      </div>
    `;

      // Add to email queue
      emailQueue.add({
        subject: "Password Reset OTP - Zanzi Trekking & Safaris",
        content: emailContent,
        recipients: [email],
      });

      return responseReturn(res, 200, {
        message: "OTP sent to your email",
        email: email, // Return email for frontend state
      });
    } catch (error) {
      logger.error("Forgot password error:", error);
      return responseReturn(res, 500, { error: "Internal server error" });
    }
  };

  // Verify OTP
  verify_otp = async (req, res) => {
    const { email, otp } = req.body;

    try {
      // Find customer with matching email and valid expiry
      const customer = await Customer.findOne({
        email,
        resetPasswordExpires: { $gt: Date.now() },
      }).select('+resetPasswordOTP');

      if (!customer || !customer.resetPasswordOTP) {
        return responseReturn(res, 400, { error: "Invalid or expired OTP" });
      }

      // Compare provided OTP with hashed OTP
      const isOtpValid = await bcrypt.compare(otp, customer.resetPasswordOTP);
      if (!isOtpValid) {
        return responseReturn(res, 400, { error: "Invalid or expired OTP" });
      }

      // OTP is valid
      return responseReturn(res, 200, {
        message: "OTP verified successfully",
        verified: true,
      });
    } catch (error) {
      logger.error("Verify OTP error:", error);
      return responseReturn(res, 500, { error: "Internal server error" });
    }
  };

  // Resend OTP
  resend_otp = async (req, res) => {
    const { email } = req.body;

    try {
      // Find customer by email
      const customer = await Customer.findOne({ email });

      if (!customer) {
        return responseReturn(res, 404, { error: "Customer not found" });
      }

      // Check if customer used social login
      if (!customer.password) {
        return responseReturn(res, 400, {
          error: "Password reset not available for social login accounts",
        });
      }

      // Generate new OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();

      // Hash OTP before storing
      const hashedOtp = await bcrypt.hash(otp, 10);

      // Set hashed OTP and expiry (15 minutes)
      customer.resetPasswordOTP = hashedOtp;
      customer.resetPasswordExpires = new Date(Date.now() + 15 * 60 * 1000);

      await customer.save();

      // Send OTP email
      const emailData = {
        to: email,
        subject: "New Verification Code - Zanzi Trekking",
        template: "otp",
        data: {
          name: customer.name,
          otp: otp,
        },
      };

      await emailQueue.add("send-email", emailData);

      return responseReturn(res, 200, {
        message: "New verification code sent to your email",
      });
    } catch (error) {
      logger.error("Resend OTP error:", error);
      return responseReturn(res, 500, { error: "Internal server error" });
    }
  };

  // Reset Password
  reset_password = async (req, res) => {
    const { email, otp, newPassword } = req.body;

    try {
      // Find customer with matching email and valid expiry
      const customer = await Customer.findOne({
        email,
        resetPasswordExpires: { $gt: Date.now() },
      }).select('+resetPasswordOTP');

      if (!customer || !customer.resetPasswordOTP) {
        return responseReturn(res, 400, { error: "Invalid or expired OTP" });
      }

      // Compare provided OTP with hashed OTP
      const isOtpValid = await bcrypt.compare(otp, customer.resetPasswordOTP);
      if (!isOtpValid) {
        return responseReturn(res, 400, { error: "Invalid or expired OTP" });
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      // Update password and clear OTP fields
      customer.password = hashedPassword;
      customer.resetPasswordOTP = undefined;
      customer.resetPasswordExpires = undefined;
      await customer.save();

      return responseReturn(res, 200, {
        message:
          "Password reset successfully. You can now login with your new password.",
      });
    } catch (error) {
      logger.error("Reset password error:", error);
      return responseReturn(res, 500, { error: "Internal server error" });
    }
  };
}
module.exports = new CustomerController();
