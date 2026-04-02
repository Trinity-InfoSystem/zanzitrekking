const { Schema, model, mongo, default: mongoose } = require("mongoose");

const jobSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      default: "",
    },
    contentType: {
      type: String,
      enum: ["structured", "html"],
      default: "structured",
    },
    htmlContent: {
      type: String,
      default: "",
    },
    requirements: {
      type: [String],
      default: [],
    },
    location: {
      type: String,
    },
    employmentType: {
      type: String,
      enum: ["full-time", "part-time", "contract"],
      required: false, // Not required for HTML content type
    },
    salaryRange: {
      type: String,
    },
    applicationDeadline: {
      type: Date,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "Admin",
    },
    seo: {
      allowSearch: {
        type: String,
        enum: ["yes", "no"],
        default: "yes",
      },
      general: {
        title: { type: String, default: "" },
        description: { type: String, default: "" },
        image: { type: String, default: null },
      },
      openGraph: {
        title: { type: String, default: "" },
        description: { type: String, default: "" },
        image: { type: String, default: null },
      },
      twitter: {
        title: { type: String, default: "" },
        description: { type: String, default: "" },
        image: { type: String, default: null },
      },
    },
  },
  { timestamps: true }
);

jobSchema.index({
  title: "text",
  description: "text",
});

module.exports = mongoose.model("Job", jobSchema);
