const { Schema, model, mongo, default: mongoose } = require('mongoose')

const adminSchema = new Schema(
  {
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true
    },
    password: {
      type: String,
      required: true
    },
    image: {
      type: String,
      required: true
    },
    role: {
      type: String,
      default: 'admin'
    },
    accessRoutes: {
      type: [String],
      default: []
    },
    companyEmail: {
      type: String
    },
    companyAddress: {
      type: String
    },
    companyPhoneNumber: {
      type: String
    },
    resetPasswordOTP: {
      type: String
    },
    resetPasswordExpires: {
      type: Date
    }
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
)

// Add unique index on email field
adminSchema.index({ email: 1 }, { unique: true })

adminSchema.virtual('chatRoom').get(function () {
  return this._id?.toString()
})
module.exports = mongoose.model('Admin', adminSchema)
