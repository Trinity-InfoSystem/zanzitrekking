const Admin = require("../models/admin");
const { responseReturn } = require("../utilities/response");
const bcrypt = require("bcryptjs");
const {
  createAccessToken,
  createRefreshToken,
  verifyRefreshToken,
} = require("../utilities/tokenCreate");
const jwt = require("jsonwebtoken");
const fs = require("fs");
const path = require("path");
const emailQueue = require("../workers/emailQueue");

class AuthControllers {
  admin_login = async (req, res) => {
    const { email, password, rememberMe } = req.body;

    try {
      const admin = await Admin.findOne({ email });
      if (!admin) {
        return responseReturn(res, 404, { message: "Email not found" });
      }

      const match = await bcrypt.compare(password, admin.password);
      if (!match) {
        return responseReturn(res, 401, { message: "Invalid credentials" });
      }

      // Create tokens
      const payload = { id: admin._id, role: admin.role };
      const accessToken = createAccessToken(payload);
      const refreshToken = createRefreshToken(
        payload,
        rememberMe ? "7d" : "1d"
      );

      // Set cookies with ADMIN-specific names
      res.cookie("adminAccessToken", accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "None" : "strict",
        maxAge: 15 * 60 * 1000, // 15 minutes
      });
      res.cookie("adminRefreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "None" : "strict",
        maxAge: rememberMe ? 7 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000, // 7 days or 1 day
      });

      return responseReturn(res, 200, {
        message: "Login successful",
        userInfo: admin,
        accessToken: accessToken, // Return accessToken for frontend to store as fallback
      });
    } catch (error) {
      console.error(error);
      return responseReturn(res, 500, { message: "Internal server error" });
    }
  };

  refresh_token = async (req, res) => {
    // First try to get token from cookies (preferred method)
    const { adminRefreshToken, refreshToken } = req.cookies;
    let token = adminRefreshToken || refreshToken; // Backward compatibility

    // If no cookie token, try Authorization header (fallback for production)
    if (!token) {
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith("Bearer ")) {
        token = authHeader.substring(7); // Remove "Bearer " prefix
      }
    }

    if (!token) {
      return responseReturn(res, 409, { message: "No refresh token provided" });
    }

    try {
      // Use verifyRefreshToken utility for consistency
      const { success, data, error } = await verifyRefreshToken(token);

      if (!success) {
        return responseReturn(res, 403, { message: error || "Invalid refresh token" });
      }

      // Verify token payload has required fields
      if (!data.id || !data.role) {
        return responseReturn(res, 401, { message: "Invalid refresh token payload" });
      }

      // Verify admin still exists
      const admin = await Admin.findById(data.id);
      if (!admin) {
        return responseReturn(res, 401, { message: "Admin not found" });
      }

      // Generate new access token
      const payload = { id: data.id, role: data.role };
      const newAccessToken = createAccessToken(payload);

      // Set cookie
      res.cookie("adminAccessToken", newAccessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "None" : "strict",
        maxAge: 15 * 60 * 1000, // 15 minutes
      });

      // Return accessToken in response body for frontend to use
      return responseReturn(res, 200, {
        message: "Token refreshed",
        accessToken: newAccessToken,
      });
    } catch (error) {
      console.error("Refresh token error:", error);
      return responseReturn(res, 401, { message: "Invalid refresh token" });
    }
  };

  getUser = async (req, res) => {
    const { id, role } = req;

    if (!id || !role) {
      return responseReturn(res, 401, { message: "User not found" });
    }

    try {
      let user = await Admin.findById(id);
      return responseReturn(res, 200, { userInfo: user });
    } catch (error) {
      return responseReturn(res, 500, { error: error.message });
    }
  };

  getCompanyInfo = async (req, res) => {
    try {
      let user = await Admin.findOne().select(
        "companyAddress companyEmail companyPhoneNumber"
      );
      return responseReturn(res, 200, { userInfo: user });
    } catch (error) {
      return responseReturn(res, 500, { error: error.message });
    }
  };

  profile_image_upload = async (req, res) => {
    const { id } = req;
    const file = req.file;

    // Validate input
    if (!file) {
      return responseReturn(res, 400, { error: "Image is required" });
    }

    try {
      // Fetch the admin by ID
      const admin = await Admin.findById(id);
      if (!admin) {
        return responseReturn(res, 404, { error: "Admin not found" });
      }

      // If admin already has an image, delete the old one
      if (admin.image) {
        const oldImageFileName = path.basename(admin.image);
        const oldImagePath = path.resolve(
          __dirname,
          "..",
          "public",
          "uploads",
          oldImageFileName
        );

        // Try to delete the old image file asynchronously
        fs.unlink(oldImagePath, (err) => {
          if (err) {
            // Error deleting old image
          }
        });
      }

      // Update the admin's image with the new file path
      const fileName = file.filename;
      const basePath = `${req.protocol}://${req.get("host")}/public/uploads/`;
      const updatedImagePath = `${basePath}${fileName}`;

      admin.image = updatedImagePath; // Update admin image
      await admin.save(); // Save updated admin

      // Respond with success
      return responseReturn(res, 200, {
        message: "Profile image successfully updated",
        data: { image: updatedImagePath },
      });
    } catch (error) {
      console.error(`Error updating profile image: ${error.message}`);
      return responseReturn(res, 500, {
        error: "Server error, could not update profile image",
      });
    }
  };

  update_company_info = async (req, res) => {
    const { id } = req;
    const { email, address, phone } = req.body;

    try {
      const userInfo = await Admin.findByIdAndUpdate(id, {
        companyEmail: email,
        companyAddress: address,
        companyPhoneNumber: phone,
      });

      if (userInfo) {
        return responseReturn(res, 201, {
          userInfo,
          message: "Company Info successfully Updated",
        });
      } else {
        return responseReturn(res, 404, {
          error: "Company Info Upload Failed",
        });
      }
    } catch (error) {
      return responseReturn(res, 500, { error: error.message });
    }
  };
  password_update = async (req, res) => {
    const { email, o_password, n_password } = req.body;

    try {
      // Find the admin by email
      const admin = await Admin.findOne({ email });

      if (!admin) {
        return responseReturn(res, 404, { error: "User not found" });
      }

      // Compare the old password with the stored hashed password
      const isMatch = await bcrypt.compare(o_password, admin.password);

      if (!isMatch) {
        return responseReturn(res, 400, { error: "Old password is incorrect" });
      }

      // Hash the new password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(n_password, salt);

      // Update the user's password
      admin.password = hashedPassword;
      await admin.save();

      // Create a new token
      const token = await createAccessToken({
        id: admin._id, // Use _id instead of id for Mongoose models
        role: admin.role,
      });

      // Set the token in a secure cookie
      res.cookie("accessToken", token, {
        httpOnly: true, // Prevents client-side access to the cookie
        secure: process.env.NODE_ENV === "production", // Use secure cookies in production
        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week expiration
        sameSite: "Strict", // Helps prevent CSRF
      });

      // Return updated user info
      return responseReturn(res, 200, {
        userInfo: {
          id: admin._id,
          name: admin.name,
          email: admin.email, // Adjusted to use 'email'
          image: admin.image,
          role: admin.role,
          companyAddress: admin.companyAddress,
          companyPhoneNumber: admin.companyPhoneNumber,
          companyEmail: admin.companyEmail,
        },
        message: "Password updated successfully",
      });
    } catch (error) {
      return responseReturn(res, 500, { error: error.message });
    }
  };

  // Add to your AuthControllers class
  forgot_password = async (req, res) => {
    const { email } = req.body;

    try {
      // Check if admin exists
      const admin = await Admin.findOne({ email });
      if (!admin) {
        return responseReturn(res, 404, { error: "Email not found" });
      }

      function generateOtpInsecure() {
        // returns 000000 - 999999
        const num = Math.floor(Math.random() * 1_000_000);
        return String(num).padStart(6, "0");
      }

      // Generate OTP (6-digit code)
      const otp = generateOtpInsecure();
      const otpExpiry = Date.now() + 15 * 60 * 1000; // 15 minutes expiry

      // Save OTP and expiry to admin document
      admin.resetPasswordOTP = otp;
      admin.resetPasswordExpires = otpExpiry;
      await admin.save();

      // Prepare email content
      const emailContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #059473;">Password Reset Request</h2>
        <p>You requested to reset your password. Use the OTP below to proceed:</p>
        <div style="background-color: #f5f5f5; padding: 15px; text-align: center; margin: 20px 0;">
          <h1 style="color: #059473; margin: 0; font-size: 32px; letter-spacing: 5px;">${otp}</h1>
        </div>
        <p>This OTP will expire in 15 minutes.</p>
        <p>If you didn't request this reset, please ignore this email.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="color: #777; font-size: 12px;">This is an automated message, please do not reply.</p>
      </div>
    `;

      // Add to email queue
      emailQueue.add({
        subject: "Password Reset OTP",
        content: emailContent,
        recipients: [email],
      });

      return responseReturn(res, 200, {
        message: "OTP sent to your email",
        email: email, // Return email for frontend state
      });
    } catch (error) {
      console.error("Forgot password error:", error);
      return responseReturn(res, 500, { error: "Internal server error" });
    }
  };

  verify_otp = async (req, res) => {
    const { email, otp } = req.body;

    try {
      // Find admin with matching email and valid OTP
      const admin = await Admin.findOne({
        email,
        resetPasswordOTP: otp,
        resetPasswordExpires: { $gt: Date.now() },
      });

      if (!admin) {
        return responseReturn(res, 400, { error: "Invalid or expired OTP" });
      }

      // OTP is valid - you might want to create a temporary token here
      // for the reset password step, or just mark the OTP as verified

      return responseReturn(res, 200, {
        message: "OTP verified successfully",
        verified: true,
      });
    } catch (error) {
      console.error("Verify OTP error:", error);
      return responseReturn(res, 500, { error: "Internal server error" });
    }
  };

  reset_password = async (req, res) => {
    const { email, otp, newPassword } = req.body;

    try {
      // Find admin with matching email and valid OTP
      const admin = await Admin.findOne({
        email,
        resetPasswordOTP: otp,
        resetPasswordExpires: { $gt: Date.now() },
      });

      if (!admin) {
        return responseReturn(res, 400, { error: "Invalid or expired OTP" });
      }

      // Hash new password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);

      // Update password and clear OTP fields
      admin.password = hashedPassword;
      admin.resetPasswordOTP = undefined;
      admin.resetPasswordExpires = undefined;
      await admin.save();

      return responseReturn(res, 200, {
        message: "Password reset successfully",
      });
    } catch (error) {
      console.error("Reset password error:", error);
      return responseReturn(res, 500, { error: "Internal server error" });
    }
  };
  // get All admins

  get_all_admins = async (req, res) => {
    try {
      const admins = await Admin.find().select("-password");
      return responseReturn(res, 200, { admins });
    } catch (error) {
      return responseReturn(res, 500, { error: "Internal server error" });
    }
  };

  // update admin access routes
  update_admin_access_routes = async (req, res) => {
    const { id } = req.params;
    const { accessRoutes } = req.body;
    try {
      const admin = await Admin.findByIdAndUpdate(id, { accessRoutes });
      return responseReturn(res, 200, { admin });
    } catch (error) {
      return responseReturn(res, 500, { error: "Internal server error" });
    }
  };

  // create new admin
  create_admin = async (req, res) => {
    const {
      name,
      email,
      password,
      role,
      companyEmail,
      companyPhoneNumber,
      companyAddress,
    } = req.body;

    try {
      // Check if admin already exists
      const existingAdmin = await Admin.findOne({ email });
      if (existingAdmin) {
        return responseReturn(res, 400, {
          message: "Admin with this email already exists",
        });
      }

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Create new admin
      const newAdmin = new Admin({
        name,
        email,
        password: hashedPassword,
        role: role || "editor",
        image: `https://ui-avatars.com/api/?name=${encodeURIComponent(
          name
        )}&background=random`,
        companyEmail,
        companyPhoneNumber,
        companyAddress,
        accessRoutes: [], // Default empty access routes
      });

      await newAdmin.save();

      // Return admin without password
      const { password: _, ...adminWithoutPassword } = newAdmin.toObject();

      return responseReturn(res, 201, {
        message: "Admin created successfully",
        admin: adminWithoutPassword,
      });
    } catch (error) {
      console.error("Create admin error:", error);
      return responseReturn(res, 500, { error: "Internal server error" });
    }
  };

  // delete admin with cascade deletion
  delete_admin = async (req, res) => {
    const { id } = req.params;
    const { currentAdminId } = req.body; // To prevent self-deletion

    try {
      // Prevent self-deletion
      if (id === currentAdminId) {
        return responseReturn(res, 400, {
          message: "You cannot delete your own account",
        });
      }

      // Check if admin exists
      const admin = await Admin.findById(id);
      if (!admin) {
        return responseReturn(res, 404, {
          message: "Admin not found",
        });
      }

      // Prevent deletion of the last admin
      const adminCount = await Admin.countDocuments();
      if (adminCount <= 1) {
        return responseReturn(res, 400, {
          message: "Cannot delete the last admin account",
        });
      }

      // Import required models for cascade deletion
      const Message = require("../models/chat/chat");
      const Customer = require("../models/customer");
      const Order = require("../models/order");
      const CustomerOrder = require("../models/customerOrder");

      // Start cascade deletion
      const deletionResults = {
        messages: 0,
        customers: 0,
        orders: 0,
        customerOrders: 0,
      };

      // 1. Delete all messages where admin is sender or receiver
      const messageResult = await Message.deleteMany({
        $or: [
          { sender: id, senderModel: "Admin" },
          { receiver: id, receiverModel: "Admin" },
        ],
      });
      deletionResults.messages = messageResult.deletedCount;

      // 2. Update customers assigned to this admin (set assignedAdmin to null)
      const customerResult = await Customer.updateMany(
        { assignedAdmin: id },
        { $unset: { assignedAdmin: 1 } }
      );
      deletionResults.customers = customerResult.modifiedCount;

      // 3. Update orders that might have admin references (if any)
      // Note: Orders don't directly reference admin, but we'll check for any admin notes
      const orderResult = await Order.updateMany(
        { adminNotes: { $exists: true, $ne: null } },
        { $unset: { adminNotes: 1 } }
      );
      deletionResults.orders = orderResult.modifiedCount;

      // 4. Update customer orders (if they have admin references)
      const customerOrderResult = await CustomerOrder.updateMany(
        { assignedAdmin: id },
        { $unset: { assignedAdmin: 1 } }
      );
      deletionResults.customerOrders = customerOrderResult.modifiedCount;

      // 5. Finally, delete the admin
      await Admin.findByIdAndDelete(id);

      return responseReturn(res, 200, {
        message: "Admin deleted successfully with cascade cleanup",
        deletionResults,
        deletedAdmin: {
          id: admin._id,
          name: admin.name,
          email: admin.email,
          role: admin.role,
        },
      });
    } catch (error) {
      console.error("Delete admin error:", error);
      return responseReturn(res, 500, { error: "Internal server error" });
    }
  };
}
module.exports = new AuthControllers();
