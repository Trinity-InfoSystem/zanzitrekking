// models/Message.js
const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    conversationId: {
      type: String,
      index: true,
    },
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        refPath: "participantModels",
      },
    ],
    participantModels: [
      {
        type: String,
        enum: ["Admin", "Customer"],
      },
    ],
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: "senderModel",
    },
    senderModel: {
      type: String,
      required: true,
      enum: ["Admin", "Customer"],
    },
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: "receiverModel",
    },
    receiverModel: {
      type: String,
      required: true,
      enum: ["Admin", "Customer"],
    },
    content: {
      type: String,
      required: true,
    },
    read: {
      type: Boolean,
      default: false,
    },
    attachment: {
      type: String,
    },
    attachmentOriginalName: {
      type: String,
    },
    attachmentType: {
      type: String,
      enum: ["image", "document", "audio", "video", null],
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for better performance
messageSchema.index({ sender: 1, receiver: 1 });
messageSchema.index({ createdAt: -1 });
messageSchema.index({ read: 1 });
messageSchema.index({ senderModel: 1, receiverModel: 1 });
messageSchema.index({ sender: 1, senderModel: 1, receiverModel: 1 });
messageSchema.index({ receiver: 1, receiverModel: 1, senderModel: 1 });

module.exports = mongoose.model("Message", messageSchema);
