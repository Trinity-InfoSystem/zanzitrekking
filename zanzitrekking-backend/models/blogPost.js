const { Schema, model, default: mongoose } = require("mongoose");
const moment = require("moment"); // Install moment.js for date formatting

// Define the schema for BlogPost
const blogPostSchema = new Schema(
  {
    mainTitle: {
      type: String,
      required: true,
    },
    creatorName: {
      type: String,
      required: true,
    },
    creationDate: {
      type: Date,
      default: Date.now,
      get: (date) => moment(date).format("YYYY.MM.DD"), //
    },
    mainImage: {
      type: String,
    },
    // Content type flag: 'structured' or 'html'
    contentType: {
      type: String,
      enum: ["structured", "html"],
      default: "structured",
    },
    // HTML content (used when contentType is 'html')
    htmlContent: {
      type: String,
    },
    // Structured content fields (used when contentType is 'structured')
    mainParagraph: {
      type: String,
    },
    secondParagraph: {
      type: String,
    },
    thirdParagraph: {
      type: String,
    },
    secondTitle: {
      type: String,
    },
    fourthParagraph: {
      type: String,
    },
    proverb: {
      type: String,
    },
    proverbWriter: {
      type: String,
    },
    relatedImages: {
      title: {
        type: String,
      },
      image1: {
        type: String,
      },
      image2: {
        type: String,
      },
      paragraph: {
        type: String,
      },
    },
    comments: [
      {
        customerId: {
          type: Schema.Types.ObjectId, // Refers to Customer ID in the database
          ref: "Customer",
          required: true,
        },
        customerName: {
          type: String,
          required: true,
        },
        commentDate: {
          type: Date,
          default: Date.now,
        },
        commentText: {
          type: String,
          required: true,
        },
      },
    ],
    creatorImage: {
      type: String,
    },
    creatorBio: {
      type: String, // Renamed for clarity
    },
    creatorSocialLinks: {
      facebook: {
        type: String,
      },
      instagram: {
        type: String,
      },
      twitter: {
        type: String,
      },
    },
    // Optional category field for blog posts
    category: {
      type: String,
      default: null, // Optional field
    },
  },
  {
    timestamps: true,
    toJSON: { getters: true }, // Enable getters for JSON responses
    toObject: { getters: true }, // Automatically adds createdAt and updatedAt fields
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
  }
);

blogPostSchema.index({
  mainTitle: "text",
});

// Export the model
module.exports = mongoose.model("BlogPost", blogPostSchema);
