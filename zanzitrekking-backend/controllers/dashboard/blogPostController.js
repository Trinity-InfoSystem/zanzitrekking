const blogPostModel = require("../../models/blogPost");
const Customer = require("../../models/customer");

const { responseReturn } = require("../../utilities/response");
const fs = require("fs");
const path = require("path");
class blogPostController {
  add_blogPost = async (req, res) => {
    try {
      const basePath = `${req.protocol}://${req.get("host")}/public/uploads/`;
      const contentType = req.body.contentType || "structured";

      // Find files in the array by their fieldname
      const mainImage = req.files?.find(
        (file) => file.fieldname === "mainImage"
      );
      const creatorImage = req.files?.find(
        (file) => file.fieldname === "creatorImage"
      );
      const relatedImage1 = req.files?.find(
        (file) => file.fieldname === "relatedImages[image1]"
      );
      const relatedImage2 = req.files?.find(
        (file) => file.fieldname === "relatedImages[image2]"
      );

      // Prepare social links from request body
      const socialLinks = {
        facebook: req.body.creatorSocialLinks?.facebook || null,
        instagram: req.body.creatorSocialLinks?.instagram || null,
        twitter: req.body.creatorSocialLinks?.twitter || null,
      };

      // Base blog post data (author info is mandatory)
      // Handle category - convert empty string to null
      let categoryValue = req.body.category;
      if (categoryValue && typeof categoryValue === 'string') {
        categoryValue = categoryValue.trim();
        if (categoryValue === '') {
          categoryValue = null;
        }
      } else {
        categoryValue = null;
      }

      const blogPostData = {
        mainTitle: req.body.mainTitle,
        creatorName: req.body.creatorName,
        creatorBio: req.body.creatorBio,
        contentType: contentType,
        creatorImage: creatorImage
          ? `${basePath}${creatorImage.filename}`
          : null,
        mainImage: mainImage ? `${basePath}${mainImage.filename}` : null,
        creatorSocialLinks: socialLinks,
        category: categoryValue, // Optional category field
      };

      // Add content based on content type
      if (contentType === "html") {
        blogPostData.htmlContent = req.body.htmlContent;
      } else {
        // Structured content
        const relatedImagesPaths = [
          relatedImage1 ? `${basePath}${relatedImage1.filename}` : null,
          relatedImage2 ? `${basePath}${relatedImage2.filename}` : null,
        ];

        blogPostData.mainParagraph = req.body.mainParagraph;
        blogPostData.secondParagraph = req.body.secondParagraph || null;
        blogPostData.thirdParagraph = req.body.thirdParagraph || null;
        blogPostData.secondTitle = req.body.secondTitle || null;
        blogPostData.fourthParagraph = req.body.fourthParagraph || null;
        blogPostData.proverb = req.body.proverb || null;
        blogPostData.proverbWriter = req.body.proverbWriter || null;
        blogPostData.relatedImages = {
          title: req.body.relatedImages?.title || null,
          paragraph: req.body.relatedImages?.paragraph || null,
          image1: relatedImagesPaths[0],
          image2: relatedImagesPaths[1],
        };
      }

      // Create a new BlogPost document
      const blogPost = await blogPostModel.create(blogPostData);

      return res.status(201).json({
        message: "Blog post successfully created",
        blogPost,
      });
    } catch (error) {
      console.error("Error creating blog post:", error);
      return res.status(500).json({
        error: "Internal server error",
        details:
          process.env.NODE_ENV === "development" ? error.message : undefined,
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      });
    }
  };
  get_blogPosts = async (req, res) => {
    const { page, searchValue, parPage, sort, sortBy, startDate, endDate, category } =
      req.query;

    try {
      let skipPage = "";
      if (parPage && page) {
        skipPage = +parPage * (+page - 1);
      }

      // Build the base match query
      const matchQuery = {};

      if (searchValue) {
        matchQuery.mainTitle = { $regex: searchValue, $options: "i" };
      }

      // Add date range filter if provided
      if (startDate && endDate) {
        matchQuery.createdAt = {
          $gte: new Date(startDate),
          $lte: new Date(endDate),
        };
      } else if (startDate) {
        matchQuery.createdAt = { $gte: new Date(startDate) };
      } else if (endDate) {
        matchQuery.createdAt = { $lte: new Date(endDate) };
      }

      // Add category filter if provided
      if (category && category !== "all") {
        matchQuery.category = category;
      }

      // Map frontend sortBy values to backend sort values
      // Frontend sends: "newest", "oldest", "mostRated"
      // Backend expects: "newest-desc", "newest-asc", or custom handling
      let sortValue = sort || sortBy || "newest-desc";
      
      // Convert frontend values to backend format
      if (sortBy === "newest") {
        sortValue = "newest-desc";
      } else if (sortBy === "oldest") {
        sortValue = "newest-asc";
      } else if (sortBy === "mostRated") {
        sortValue = "mostRated-desc";
      }

      // Define sort options
      let sortOption = { createdAt: -1 }; // Default: newest first
      let collation = null;
      let sortByComments = false;
      
      if (sortValue === "name-asc") {
        sortOption = { mainTitle: 1 }; // A-Z
        collation = { locale: "en", strength: 2 }; // Case-insensitive collation
      } else if (sortValue === "name-desc") {
        sortOption = { mainTitle: -1 }; // Z-A
        collation = { locale: "en", strength: 2 }; // Case-insensitive collation
      } else if (sortValue === "newest-asc") {
        sortOption = { createdAt: 1 }; // Oldest first
      } else if (sortValue === "mostRated-desc") {
        // Sort by comments count (most comments first)
        sortByComments = true;
      } else {
        sortOption = { createdAt: -1 }; // Newest first (default)
      }

      const aggregationPipeline = [
        { $match: matchQuery },
        {
          $addFields: {
            commentsCount: { $size: "$comments" },
          },
        },
      ];

      // Add sorting to aggregation pipeline before pagination
      if (sortByComments) {
        // Sort by comments count (most comments first)
        aggregationPipeline.push({ $sort: { commentsCount: -1 } });
      } else if (sortValue === "name-asc") {
        aggregationPipeline.push({ $sort: { mainTitle: 1 } });
      } else if (sortValue === "name-desc") {
        aggregationPipeline.push({ $sort: { mainTitle: -1 } });
      } else if (sortValue === "newest-asc") {
        aggregationPipeline.push({ $sort: { createdAt: 1 } });
      } else {
        // Default: newest first
        aggregationPipeline.push({ $sort: { createdAt: -1 } });
      }

      // Add pagination after sorting
      if (page && parPage) {
        aggregationPipeline.push({ $skip: skipPage }, { $limit: +parPage });
      }

      let blogPosts = await blogPostModel.aggregate(aggregationPipeline);

      const totalblogPosts = await blogPostModel.countDocuments(matchQuery);

      responseReturn(res, 200, {
        totalblogPosts,
        blogPosts,
      });
    } catch (error) {
      console.error(error);
      responseReturn(res, 500, { error: "internal server error" });
    }
  };
  
  get_blog_categories = async (req, res) => {
    try {
      // Get all distinct categories from blog posts (excluding null/undefined)
      const categories = await blogPostModel.distinct("category", {
        category: { $ne: null, $exists: true },
      });
      
      // Sort categories alphabetically
      const sortedCategories = categories.sort();
      
      responseReturn(res, 200, {
        categories: sortedCategories,
        message: "Blog categories fetched successfully",
      });
    } catch (error) {
      console.error("Error fetching blog categories:", error);
      responseReturn(res, 500, { error: "internal server error" });
    }
  };
  
  get_blogPost = async (req, res) => {
    const { blogPostId } = req.params;

    try {
      const blogPost = await blogPostModel.findById(blogPostId);
      if (!blogPost) {
        return responseReturn(res, 404, { error: "No blogPost Found" });
      }

      return responseReturn(res, 202, { blogPost });
    } catch (error) {
      return responseReturn(res, 500, { error: "Internal server error" });
    }
  };
  
  update_blogPost_category = async (req, res) => {
    const { blogPostId } = req.params;

    try {
      const blogPost = await blogPostModel.findById(blogPostId);
      if (!blogPost) {
        return responseReturn(res, 404, { error: "Blog post not found" });
      }

      // Handle category - convert empty string to null
      let categoryValue = req.body.category;
      if (categoryValue && typeof categoryValue === 'string') {
        categoryValue = categoryValue.trim();
        if (categoryValue === '') {
          categoryValue = null;
        }
      } else {
        categoryValue = null;
      }

      // Update only the category field
      const updatedBlogPost = await blogPostModel.findByIdAndUpdate(
        blogPostId,
        { category: categoryValue },
        { new: true }
      );

      if (!updatedBlogPost) {
        return responseReturn(res, 500, { error: "Category update failed." });
      }

      return responseReturn(res, 200, {
        message: "Category updated successfully",
        blogPost: updatedBlogPost,
      });
    } catch (error) {
      console.error("Error updating category:", error);
      return responseReturn(res, 500, { error: "Internal server error" });
    }
  };
  update_blogPost = async (req, res) => {
    const { blogPostId } = req.params;

    try {
      const blogPost = await blogPostModel.findById(blogPostId);
      if (!blogPost) {
        return responseReturn(res, 404, { error: "Blog post not found" });
      }

      const updatedData = { ...req.body };
      const contentType =
        req.body.contentType || blogPost.contentType || "structured";
      updatedData.contentType = contentType;
      
      // Handle category update (optional field)
      if (req.body.category !== undefined) {
        let categoryValue = req.body.category;
        if (categoryValue && typeof categoryValue === 'string') {
          categoryValue = categoryValue.trim();
          if (categoryValue === '') {
            categoryValue = null;
          }
        } else {
          categoryValue = null;
        }
        updatedData.category = categoryValue;
      }

      // Handle social links update
      if (req.body.creatorSocialLinks) {
        updatedData.creatorSocialLinks = {
          facebook:
            req.body.creatorSocialLinks.facebook ||
            blogPost.creatorSocialLinks?.facebook ||
            null,
          instagram:
            req.body.creatorSocialLinks.instagram ||
            blogPost.creatorSocialLinks?.instagram ||
            null,
          twitter:
            req.body.creatorSocialLinks.twitter ||
            blogPost.creatorSocialLinks?.twitter ||
            null,
        };
      }

      const imagePathsToDelete = [];
      const basePath = `${req.protocol}://${req.get("host")}/public/uploads/`;

      if (req.files) {
        const imageFields = {
          creatorImage: { single: true },
          mainImage: { single: true },
          "relatedImages[image1]": {
            field: "relatedImages.image1",
            single: true,
          },
          "relatedImages[image2]": {
            field: "relatedImages.image2",
            single: true,
          },
        };

        for (const file of req.files) {
          const fieldConfig = imageFields[file.fieldname];
          if (!fieldConfig) {
            continue;
          }

          const fieldName = fieldConfig.field || file.fieldname;
          const newImagePath = `${basePath}${file.filename}`;

          let existingPath;
          if (fieldName.includes(".")) {
            const [parent, child] = fieldName.split(".");
            existingPath = blogPost[parent]?.[child];
          } else {
            existingPath = blogPost[fieldName];
          }

          if (existingPath) {
            const oldPath = path.resolve(
              __dirname,
              "..",
              "..",
              "public",
              "uploads",
              path.basename(existingPath)
            );
            imagePathsToDelete.push(oldPath);
          }

          if (fieldName.includes(".")) {
            const [parent, child] = fieldName.split(".");
            if (!updatedData[parent]) {
              updatedData[parent] = { ...blogPost[parent] };
            }
            updatedData[parent][child] = newImagePath;
          } else {
            updatedData[fieldName] = newImagePath;
          }
        }
      }

      const updatedBlogPost = await blogPostModel.findByIdAndUpdate(
        blogPostId,
        updatedData,
        { new: true }
      );

      if (!updatedBlogPost) {
        return responseReturn(res, 500, { error: "Blog post update failed." });
      }

      imagePathsToDelete.forEach((oldImagePath) => {
        fs.unlink(oldImagePath, (err) => {
          if (err) {
            // Error deleting old image
          }
        });
      });

      responseReturn(res, 200, {
        message: "Blog post updated successfully",
        updatedBlogPost,
      });
    } catch (error) {
      console.error("Update error:", error);
      responseReturn(res, 500, { error: "Internal server error" });
    }
  };
  delete_blogPost = async (req, res) => {
    const { blogPostId } = req.params;

    try {
      const blogPost = await blogPostModel.findById(blogPostId);
      if (!blogPost) responseReturn(res, 404, { error: "Blog post not found" });

      const imagePaths = [];

      // Add main image
      if (blogPost.mainImage) {
        imagePaths.push(
          path.resolve(
            __dirname,
            "..",
            "..",
            "public",
            "uploads",
            path.basename(blogPost.mainImage)
          )
        );
      }

      // Add related images
      if (blogPost.relatedImages) {
        if (blogPost.relatedImages.image1) {
          imagePaths.push(
            path.resolve(
              __dirname,
              "..",
              "..",
              "public",
              "uploads",
              path.basename(blogPost.relatedImages.image1)
            )
          );
        }
        if (blogPost.relatedImages.image2) {
          imagePaths.push(
            path.resolve(
              __dirname,
              "..",
              "..",
              "public",
              "uploads",
              path.basename(blogPost.relatedImages.image2)
            )
          );
        }
      }

      // Add creator image
      if (blogPost.creatorImage) {
        imagePaths.push(
          path.resolve(
            __dirname,
            "..",
            "..",
            "public",
            "uploads",
            path.basename(blogPost.creatorImage)
          )
        );
      }

      // Delete all collected images
      imagePaths.forEach((filePath) => {
        fs.unlink(filePath, (err) => {
          if (err) {
            // Error deleting file
          }
        });
      });

      // Delete the blog post from the database
      await blogPostModel.findByIdAndDelete(blogPostId);

      // Return success response
      responseReturn(res, 200, {
        message: "Blog post and all associated images deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting blogPost:", error);
      responseReturn(res, 500, { error: "Internal server error" });
    }
  };
  add_comment = async (req, res) => {
    const { blogPostId } = req.params;
    const { name, email, comment } = req.body;

    try {
      // First find if customer exists by email
      const customer = await Customer.findOne({ email });

      if (!customer) {
        return responseReturn(res, 404, { error: "Customer not found" });
      }

      const commentObject = {
        customerId: customer._id,
        customerName: name,
        commentDate: new Date(),
        commentText: comment,
      };

      const updatedBlogPost = await blogPostModel.findByIdAndUpdate(
        blogPostId,
        { $push: { comments: commentObject } },
        { new: true }
      );

      if (!updatedBlogPost) {
        return responseReturn(res, 404, { error: "Blog Post not found" });
      }

      return responseReturn(res, 200, {
        message: "Comment added successfully",
        blogPost: updatedBlogPost,
      });
    } catch (error) {
      console.error(error);
      return responseReturn(res, 500, { error: "Internal server error" });
    }
  };
  updateComment = async (req, res) => {
    const { blogPostId } = req.params;
    const { email, comment: newCommentText, commentId } = req.body;

    try {
      // 1. Find the customer by email
      const customer = await Customer.findOne({ email });
      if (!customer) {
        return responseReturn(res, 404, { error: "Customer not found" });
      }

      // 2. Find the blog post
      const blogPost = await blogPostModel.findById(blogPostId);
      if (!blogPost) {
        return responseReturn(res, 404, { error: "Blog post not found" });
      }

      // 3. Find the comment in the blog post's comments array
      const commentToUpdate = blogPost.comments.find((comment) => {
        return (
          comment._id.toString() === commentId &&
          comment.customerId.toString() === customer._id.toString()
        );
      });

      if (!commentToUpdate) {
        return responseReturn(res, 403, {
          error: "Comment not found or unauthorized",
        });
      }

      // 4. Update the comment text
      commentToUpdate.commentText = newCommentText;
      commentToUpdate.commentDate = new Date(); // Update timestamp

      await blogPost.save();

      return responseReturn(res, 200, {
        message: "Comment updated successfully",
        updatedBlogPost: blogPost,
      });
    } catch (error) {
      console.error(error);
      return responseReturn(res, 500, { error: "Internal server error" });
    }
  };
  // Get all comments for a blog post (for admin)
  get_comments = async (req, res) => {
    const { blogPostId } = req.params;

    try {
      const blogPost = await blogPostModel
        .findById(blogPostId)
        .populate("comments.customerId", "name email image")
        .select("comments mainTitle");

      if (!blogPost) {
        return responseReturn(res, 404, { error: "Blog post not found" });
      }

      return responseReturn(res, 200, {
        message: "Comments fetched successfully",
        comments: blogPost.comments || [],
        blogPostTitle: blogPost.mainTitle,
      });
    } catch (error) {
      console.error(error);
      return responseReturn(res, 500, { error: "Internal server error" });
    }
  };

  deleteComment = async (req, res) => {
    const { blogPostId } = req.params;
    const { email, commentId } = req.body;
    const isAdmin = req.role === "admin" || req.role === "editor"; // Check if user is admin or editor

    try {
      // 2. Find the blog post
      const blogPost = await blogPostModel.findById(blogPostId);
      if (!blogPost) {
        return responseReturn(res, 404, { error: "Blog post not found" });
      }

      // 3. Find the comment
      const commentIndex = blogPost.comments.findIndex(
        (comment) => comment._id.toString() === commentId
      );

      if (commentIndex === -1) {
        return responseReturn(res, 404, {
          error: "Comment not found",
        });
      }

      // 4. If admin or editor, allow deletion without customer check
      // If not admin/editor, verify the comment belongs to the customer
      if (!isAdmin) {
        if (!email) {
          return responseReturn(res, 400, { error: "Email is required" });
        }
        const customer = await Customer.findOne({ email });
        if (!customer) {
          return responseReturn(res, 404, { error: "Customer not found" });
        }
      }

      // 5. Remove the comment
      blogPost.comments.splice(commentIndex, 1);
      await blogPost.save();

      return responseReturn(res, 200, {
        message: "Comment deleted successfully",
        updatedBlogPost: blogPost,
      });
    } catch (error) {
      console.error(error);
      return responseReturn(res, 500, { error: "Internal server error" });
    }
  };
}

module.exports = new blogPostController();
