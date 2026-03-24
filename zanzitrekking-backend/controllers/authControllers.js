const Admin = require('../models/admin')
const { responseReturn } = require('../utilities/response')
const bcrypt = require('bcryptjs')
const crypto = require('crypto')
const { createAccessToken, createRefreshToken, verifyRefreshToken } = require('../utilities/tokenCreate')
const fs = require('fs')
const path = require('path')
const emailQueue = require('../workers/emailQueue')
const redis = require('../redis')
const { publicUploadsRef } = require('../utilities/storedAssetPath')

// ---------------------------------------------------------------------------
// Cookie helpers — single source of truth for cookie config
// ---------------------------------------------------------------------------
const COOKIE_BASE = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Strict',
}

const setAuthCookies = (res, accessToken, refreshToken, rememberMe = false) => {
  res.cookie('adminAccessToken', accessToken, {
    ...COOKIE_BASE,
    maxAge: 15 * 60 * 1000, // 15 minutes
  })
  res.cookie('adminRefreshToken', refreshToken, {
    ...COOKIE_BASE,
    maxAge: rememberMe ? 7 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000,
  })
}

const clearAuthCookies = (res) => {
  res.clearCookie('adminAccessToken', COOKIE_BASE)
  res.clearCookie('adminRefreshToken', COOKIE_BASE)
}

class AuthControllers {
  // ---------------------------------------------------------------------------
  // POST /admin/admin-login
  // ---------------------------------------------------------------------------
  admin_login = async (req, res) => {
    const { email, password, rememberMe } = req.body

    try {
      // Fetch with password field only for comparison — strip before responding
      const adminWithPassword = await Admin.findOne({ email }).select('+password')
      if (!adminWithPassword) {
        return responseReturn(res, 404, { message: 'Email not found' })
      }

      const match = await bcrypt.compare(password, adminWithPassword.password)
      if (!match) {
        return responseReturn(res, 401, { message: 'Invalid credentials' })
      }

      const payload = { sub: adminWithPassword._id }
      const accessToken = createAccessToken(payload)
      const refreshToken = createRefreshToken(payload, rememberMe ? '7d' : '1d')

      setAuthCookies(res, accessToken, refreshToken, rememberMe)

      // Return clean userInfo — no tokens in the response body
      const userInfo = await Admin.findById(adminWithPassword._id)
        .select('-password -resetPasswordOTP -resetPasswordExpires')
        .lean()

      return responseReturn(res, 200, {
        message: 'Login successful',
        userInfo,
      })
    } catch (error) {
      console.error('admin_login error:', error)
      return responseReturn(res, 500, { message: 'Internal server error' })
    }
  }

  // ---------------------------------------------------------------------------
  // POST /admin/logout
  // ---------------------------------------------------------------------------
  admin_logout = async (req, res) => {
    clearAuthCookies(res)
    return responseReturn(res, 200, { message: 'Logged out successfully' })
  }

  // ---------------------------------------------------------------------------
  // POST /admin/refresh-token
  // Reads ONLY from the httpOnly cookie — no Authorization header fallback.
  // ---------------------------------------------------------------------------
  refresh_token = async (req, res) => {
    const token = req.cookies?.adminRefreshToken

    if (!token) {
      return responseReturn(res, 401, { message: 'No refresh token provided' })
    }

    try {
      const { success, data, error } = await verifyRefreshToken(token)

      if (!success || !data?.sub) {
        return responseReturn(res, 403, { message: error || 'Invalid refresh token' })
      }

      const admin = await Admin.findById(data.sub)
        .select('-password -resetPasswordOTP -resetPasswordExpires')
        .lean()

      if (!admin) {
        clearAuthCookies(res)
        return responseReturn(res, 401, { message: 'Admin not found' })
      }

      const newAccessToken = createAccessToken({ sub: data.sub })

      res.cookie('adminAccessToken', newAccessToken, {
        ...COOKIE_BASE,
        maxAge: 15 * 60 * 1000,
      })

      // No token in response body — cookie is sufficient
      return responseReturn(res, 200, { message: 'Token refreshed' })
    } catch (error) {
      console.error('refresh_token error:', error)
      return responseReturn(res, 401, { message: 'Invalid refresh token' })
    }
  }

  // ---------------------------------------------------------------------------
  // GET /admin/get-user
  // Called on app load (get_user_info thunk) to rehydrate Redux from the cookie.
  // ---------------------------------------------------------------------------
  getUser = async (req, res) => {
    const { admin } = req

    if (!admin) {
      return responseReturn(res, 401, { message: 'Not authenticated' })
    }

    try {
      const userInfo = await Admin.findById(admin._id)
        .select('-password -resetPasswordOTP -resetPasswordExpires')
        .lean()

      if (!userInfo) {
        return responseReturn(res, 401, { message: 'Admin not found' })
      }

      return responseReturn(res, 200, { userInfo })
    } catch (error) {
      console.error('getUser error:', error)
      return responseReturn(res, 500, { error: error.message })
    }
  }

  // ---------------------------------------------------------------------------
  // GET /get-company-info  (public — no auth required)
  // ---------------------------------------------------------------------------
  getCompanyInfo = async (req, res) => {
    try {
      const source = req.admin
        ? await Admin.findById(req.admin._id)
            .select('companyAddress companyEmail companyPhoneNumber')
            .lean()
        : await Admin.findOne()
            .select('companyAddress companyEmail companyPhoneNumber')
            .lean()

      if (!source) {
        return responseReturn(res, 404, { error: 'Company information not found' })
      }

      return responseReturn(res, 200, {
        userInfo: {
          _id: source._id,
          companyAddress: source.companyAddress,
          companyEmail: source.companyEmail,
          companyPhoneNumber: source.companyPhoneNumber,
        },
      })
    } catch (error) {
      console.error('getCompanyInfo error:', error)
      return responseReturn(res, 500, { error: error.message })
    }
  }

  // ---------------------------------------------------------------------------
  // POST /admin/profile-image-upload
  // ---------------------------------------------------------------------------
  profile_image_upload = async (req, res) => {
    const { admin } = req
    const file = req.file

    if (!file) {
      return responseReturn(res, 400, { error: 'Image is required' })
    }

    try {
      if (admin.image) {
        const oldImagePath = path.resolve(
          __dirname, '..', 'public', 'uploads', path.basename(admin.image)
        )
        fs.unlink(oldImagePath, (err) => {
          if (err) console.warn('Could not delete old profile image:', err.message)
        })
      }

      const updatedImagePath = publicUploadsRef(file.filename)

      const updatedAdmin = await Admin.findByIdAndUpdate(
        admin._id,
        { image: updatedImagePath },
        { new: true }
      ).select('-password -resetPasswordOTP -resetPasswordExpires')

      await redis.set(
        `admin:${admin._id}`,
        JSON.stringify(updatedAdmin),
        'EX', 3600
      )

      return responseReturn(res, 200, {
        message: 'Profile image successfully updated',
        data: updatedAdmin,
      })
    } catch (error) {
      console.error('profile_image_upload error:', error)
      return responseReturn(res, 500, { error: 'Could not update profile image' })
    }
  }

  // ---------------------------------------------------------------------------
  // POST /admin/update-company-info
  // ---------------------------------------------------------------------------
  update_company_info = async (req, res) => {
    const { admin } = req
    const { email, address, phone } = req.body

    try {
      const userInfo = await Admin.findByIdAndUpdate(
        admin._id,
        { companyEmail: email, companyAddress: address, companyPhoneNumber: phone },
        { new: true }
      ).select('-password -resetPasswordOTP -resetPasswordExpires')

      if (!userInfo) {
        return responseReturn(res, 404, { error: 'Admin not found' })
      }

      await redis.set(`admin:${admin._id}`, JSON.stringify(userInfo), 'EX', 3600)

      return responseReturn(res, 200, {
        userInfo,
        message: 'Company info updated successfully',
      })
    } catch (error) {
      console.error('update_company_info error:', error)
      return responseReturn(res, 500, { error: error.message })
    }
  }

  // ---------------------------------------------------------------------------
  // PUT /admin/update-password
  // ---------------------------------------------------------------------------
  password_update = async (req, res) => {
    const { o_password, n_password } = req.body
    const { admin } = req

    try {
      if (!admin) {
        return responseReturn(res, 404, { error: 'User not found' })
      }

      const adminWithPassword = await Admin.findById(admin._id).select('+password')
      const isMatch = await bcrypt.compare(o_password, adminWithPassword.password)
      if (!isMatch) {
        return responseReturn(res, 400, { error: 'Old password is incorrect' })
      }

      const hashedPassword = await bcrypt.hash(n_password, await bcrypt.genSalt(10))

      const updatedAdmin = await Admin.findByIdAndUpdate(
        admin._id,
        { password: hashedPassword },
        { new: true }
      ).select('-password -resetPasswordOTP -resetPasswordExpires')

      await redis.set(`admin:${admin._id}`, JSON.stringify(updatedAdmin), 'EX', 3600)

      // Rotate access token cookie after password change
      const newAccessToken = createAccessToken({ sub: admin._id })
      res.cookie('adminAccessToken', newAccessToken, {
        ...COOKIE_BASE,
        maxAge: 15 * 60 * 1000,
      })

      return responseReturn(res, 200, {
        userInfo: updatedAdmin,
        message: 'Password updated successfully',
      })
    } catch (error) {
      console.error('password_update error:', error)
      return responseReturn(res, 500, { error: error.message })
    }
  }

  // ---------------------------------------------------------------------------
  // POST /admin/forgot-password
  // ---------------------------------------------------------------------------
  forgot_password = async (req, res) => {
    const { email } = req.body

    try {
      const admin = await Admin.findOne({ email })

      // Always return the same message to prevent email enumeration
      if (!admin) {
        return responseReturn(res, 200, {
          message: 'If that email exists, an OTP has been sent',
          email,
        })
      }

      const otp = crypto.randomInt(100000, 999999).toString()
      const otpExpiry = Date.now() + 15 * 60 * 1000

      admin.resetPasswordOTP = otp
      admin.resetPasswordExpires = otpExpiry
      await admin.save()

      emailQueue.add({
        subject: 'Password Reset OTP',
        content: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #059473;">Password Reset Request</h2>
            <p>Use the OTP below to reset your password:</p>
            <div style="background-color: #f5f5f5; padding: 15px; text-align: center; margin: 20px 0;">
              <h1 style="color: #059473; margin: 0; font-size: 32px; letter-spacing: 5px;">${otp}</h1>
            </div>
            <p>This OTP expires in 15 minutes.</p>
            <p>If you didn't request this, please ignore this email.</p>
          </div>
        `,
        recipients: [email],
      })

      return responseReturn(res, 200, {
        message: 'If that email exists, an OTP has been sent',
        email,
      })
    } catch (error) {
      console.error('forgot_password error:', error)
      return responseReturn(res, 500, { error: 'Internal server error' })
    }
  }

  // ---------------------------------------------------------------------------
  // POST /admin/verify-otp
  // ---------------------------------------------------------------------------
  verify_otp = async (req, res) => {
    const { email, otp } = req.body

    try {
      const admin = await Admin.findOne({
        email,
        resetPasswordOTP: otp,
        resetPasswordExpires: { $gt: Date.now() },
      })

      if (!admin) {
        return responseReturn(res, 400, { error: 'Invalid or expired OTP' })
      }

      return responseReturn(res, 200, { message: 'OTP verified successfully', verified: true })
    } catch (error) {
      console.error('verify_otp error:', error)
      return responseReturn(res, 500, { error: 'Internal server error' })
    }
  }

  // ---------------------------------------------------------------------------
  // POST /admin/reset-password
  // ---------------------------------------------------------------------------
  reset_password = async (req, res) => {
    const { email, otp, newPassword } = req.body

    try {
      const admin = await Admin.findOne({
        email,
        resetPasswordOTP: otp,
        resetPasswordExpires: { $gt: Date.now() },
      })

      if (!admin) {
        return responseReturn(res, 400, { error: 'Invalid or expired OTP' })
      }

      admin.password = await bcrypt.hash(newPassword, await bcrypt.genSalt(10))
      admin.resetPasswordOTP = undefined
      admin.resetPasswordExpires = undefined
      await admin.save()

      // Clear active session cookies after password reset
      clearAuthCookies(res)

      return responseReturn(res, 200, { message: 'Password reset successfully' })
    } catch (error) {
      console.error('reset_password error:', error)
      return responseReturn(res, 500, { error: 'Internal server error' })
    }
  }

  // ---------------------------------------------------------------------------
  // GET /admin/get-all-admins
  // ---------------------------------------------------------------------------
  get_all_admins = async (req, res) => {
    try {
      const admins = await Admin.find()
        .select('-password -resetPasswordOTP -resetPasswordExpires')
      return responseReturn(res, 200, { admins })
    } catch (error) {
      console.error('get_all_admins error:', error)
      return responseReturn(res, 500, { error: 'Internal server error' })
    }
  }

  // ---------------------------------------------------------------------------
  // PUT /admin/update-admin-access-routes/:id
  // ---------------------------------------------------------------------------
  update_admin_access_routes = async (req, res) => {
    const { id } = req.params
    const { accessRoutes } = req.body

    try {
      const admin = await Admin.findByIdAndUpdate(
        id,
        { accessRoutes },
        { new: true }
      ).select('-password -resetPasswordOTP -resetPasswordExpires')

      if (!admin) {
        return responseReturn(res, 404, { error: 'Admin not found' })
      }

      return responseReturn(res, 200, { admin, message: 'Access routes updated' })
    } catch (error) {
      console.error('update_admin_access_routes error:', error)
      return responseReturn(res, 500, { error: 'Internal server error' })
    }
  }

  // ---------------------------------------------------------------------------
  // POST /admin/create-admin
  // ---------------------------------------------------------------------------
  create_admin = async (req, res) => {
    const { name, email, password, role, companyEmail, companyPhoneNumber, companyAddress } = req.body

    try {
      const existingAdmin = await Admin.findOne({ email })
      if (existingAdmin) {
        return responseReturn(res, 400, { message: 'Admin with this email already exists' })
      }

      const hashedPassword = await bcrypt.hash(password, await bcrypt.genSalt(10))

      const newAdmin = await new Admin({
        name,
        email,
        password: hashedPassword,
        role: role || 'editor',
        image: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`,
        companyEmail,
        companyPhoneNumber,
        companyAddress,
        accessRoutes: [],
      }).save()

      const { password: _, resetPasswordOTP: __, resetPasswordExpires: ___, ...adminSafe } =
        newAdmin.toObject()

      return responseReturn(res, 201, {
        message: 'Admin created successfully',
        admin: adminSafe,
      })
    } catch (error) {
      console.error('create_admin error:', error)
      return responseReturn(res, 500, { error: 'Internal server error' })
    }
  }

  // ---------------------------------------------------------------------------
  // DELETE /admin/delete-admin/:id
  // ---------------------------------------------------------------------------
  delete_admin = async (req, res) => {
    const { id } = req.params
    const { currentAdminId } = req.body

    try {
      if (id === currentAdminId) {
        return responseReturn(res, 400, { message: 'You cannot delete your own account' })
      }

      const admin = await Admin.findById(id)
      if (!admin) {
        return responseReturn(res, 404, { message: 'Admin not found' })
      }

      const adminCount = await Admin.countDocuments()
      if (adminCount <= 1) {
        return responseReturn(res, 400, { message: 'Cannot delete the last admin account' })
      }

      const Message = require('../models/chat/chat')
      const Customer = require('../models/customer')
      const Order = require('../models/order')
      const CustomerOrder = require('../models/customerOrder')

      await Promise.all([
        Message.deleteMany({
          $or: [
            { sender: id, senderModel: 'Admin' },
            { receiver: id, receiverModel: 'Admin' },
          ],
        }),
        Customer.updateMany({ assignedAdmin: id }, { $unset: { assignedAdmin: 1 } }),
        Order.updateMany(
          { adminNotes: { $exists: true, $ne: null } },
          { $unset: { adminNotes: 1 } }
        ),
        CustomerOrder.updateMany({ assignedAdmin: id }, { $unset: { assignedAdmin: 1 } }),
        Admin.findByIdAndDelete(id),
        redis.del(`admin:${id}`),
      ])

      return responseReturn(res, 200, {
        message: 'Admin deleted successfully',
        deletedAdmin: { id: admin._id, name: admin.name, email: admin.email, role: admin.role },
      })
    } catch (error) {
      console.error('delete_admin error:', error)
      return responseReturn(res, 500, { error: 'Internal server error' })
    }
  }
}

module.exports = new AuthControllers()