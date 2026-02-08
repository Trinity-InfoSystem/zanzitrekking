const mongoose = require("mongoose");
const { Schema } = mongoose;
const mongoosePaginate = require("mongoose-paginate-v2");

const newsletterSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      validate: {
        validator: function (v) {
          return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
        },
        message: (props) => `${props.value} is not a valid email address!`,
      },
    },
    isSubscribed: {
      type: Boolean,
      required: true,
      default: true,
    },
    subscribedAt: {
      type: Date,
      default: Date.now,
    },
    unsubscribedAt: {
      type: Date,
    },
    subscriptionSource: {
      type: String,
      enum: ["website", "mobile-app", "admin", "other"],
      default: "website",
    },
  },
  { timestamps: true }
);

// Index for faster querying
newsletterSchema.index({ isSubscribed: 1 });
newsletterSchema.plugin(mongoosePaginate);

module.exports = mongoose.model("Newsletter", newsletterSchema);
