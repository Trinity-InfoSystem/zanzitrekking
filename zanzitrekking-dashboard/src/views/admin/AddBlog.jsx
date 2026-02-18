"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import {
  blogPostAdd,
  update_blogPost,
  update_blogPost_category,
  get_blogPost,
  clearMessage,
  clearBlogPost,
  get_blog_categories,
} from "../../store/Reducers/blogPostReducer";
import toast from "react-hot-toast";
import { IoMdImage } from "react-icons/io";
import {
  FaPen,
  FaUser,
  FaImage,
  FaQuoteLeft,
  FaEdit,
  FaFacebook,
  FaInstagram,
  FaTwitter,
  FaCode,
  FaFileAlt,
  FaTags,
} from "react-icons/fa";
import { overrideStyle } from "../../utils/utilis";
import { PropagateLoader } from "react-spinners";
import HeaderText from "./HeaderText";
import { IMAGES_URL } from "../../utils/constants";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import "./quill-custom.css";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { blogPostSchema } from "../../utils/validationSchemas";

const BlogPostForm = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { blogPostId } = useParams();
  const { blogPost, successMessage, errorMessage, loader, blogCategories } = useSelector(
    (state) => state.blog,
  );
  
  // Category update loading state
  const [categoryUpdating, setCategoryUpdating] = useState(false);
  
  // Content type state
  const [showHtmlCode, setShowHtmlCode] = useState(false);
  
  // Category state
  const [selectedCategory, setSelectedCategory] = useState("");
  const [newCategory, setNewCategory] = useState("");
  const [showNewCategoryInput, setShowNewCategoryInput] = useState(false);

  // Preview State
  const [previews, setPreviews] = useState({
    creatorImage: "",
    mainImage: "",
    relatedImage1: "",
    relatedImage2: "",
  });

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(blogPostSchema),
    defaultValues: {
      mainTitle: "",
      creatorName: "",
      creatorBio: "",
      contentType: "structured",
      htmlContent: "",
      mainParagraph: "",
      secondParagraph: "",
      thirdParagraph: "",
      secondTitle: "",
      fourthParagraph: "",
      proverb: "",
      proverbWriter: "",
      title: "",
      paragraph: "",
      creatorSocialLinks: {
        facebook: "",
        instagram: "",
        twitter: "",
      },
      creatorImage: null,
      mainImage: null,
      relatedImage1: null,
      relatedImage2: null,
      category: "",
    },
  });

  const contentType = watch("contentType");
  const htmlContent = watch("htmlContent");

  // Quill modules configuration
  const quillModules = useMemo(
    () => ({
      toolbar: [
        [{ header: [1, 2, 3, 4, 5, 6, false] }],
        ["bold", "italic", "underline", "strike"],
        [{ list: "ordered" }, { list: "bullet" }],
        [{ color: [] }, { background: [] }],
        [{ align: [] }],
        ["link", "image", "video"],
        ["blockquote", "code-block"],
        ["clean"],
      ],
    }),
    [],
  );

  // Handle image changes
  const handleImageChange = useCallback((e, imageType) => {
    const file = e.target.files?.[0];
    if (file) {
      setValue(imageType, file);
      setPreviews((prev) => ({
        ...prev,
        [imageType]: URL.createObjectURL(file),
      }));
    }
  }, [setValue]);

  const handleSocialLinkChange = useCallback((platform, value) => {
    setValue(`creatorSocialLinks.${platform}`, value);
  }, [setValue]);

  // Handle category update (only when editing)
  const handleCategoryUpdate = useCallback(async (categoryValue) => {
    if (!blogPostId) return;
    
    setCategoryUpdating(true);
    try {
      await dispatch(
        update_blogPost_category({ blogPostId, category: categoryValue })
      ).unwrap();
      
      // Update local state
      setSelectedCategory(categoryValue);
      setNewCategory("");
      setShowNewCategoryInput(false);
      
      // Refresh categories list
      dispatch(get_blog_categories());
      
      toast.success("Category updated successfully!");
    } catch (error) {
      toast.error(error?.errorMessage || "Failed to update category");
    } finally {
      setCategoryUpdating(false);
    }
  }, [blogPostId, dispatch]);

  // Handle form submission
  const onSubmit = useCallback(
    (data) => {
      const formData = new FormData();

      // Mandatory fields
      formData.append("mainTitle", data.mainTitle);
      formData.append("creatorName", data.creatorName);
      formData.append("creatorBio", data.creatorBio);
      formData.append("contentType", data.contentType);
      
      // Category field - only append if it has a value
      const categoryToUse = selectedCategory || (newCategory.trim() ? newCategory.trim() : null);
      if (categoryToUse) {
        formData.append("category", categoryToUse);
      }

      // Append content based on type
      if (data.contentType === "html") {
        formData.append("htmlContent", data.htmlContent || "");
      } else {
        // Structured content
        formData.append("mainParagraph", data.mainParagraph || "");
        formData.append("secondParagraph", data.secondParagraph || "");
        formData.append("thirdParagraph", data.thirdParagraph || "");
        formData.append("secondTitle", data.secondTitle || "");
        formData.append("fourthParagraph", data.fourthParagraph || "");
        formData.append("proverb", data.proverb || "");
        formData.append("proverbWriter", data.proverbWriter || "");

        // Special handling for related images
        formData.append("relatedImages[title]", data.title || "");
        formData.append("relatedImages[paragraph]", data.paragraph || "");
        if (data.relatedImage1) {
          formData.append("relatedImages[image1]", data.relatedImage1);
        }
        if (data.relatedImage2) {
          formData.append("relatedImages[image2]", data.relatedImage2);
        }
      }

      // Append creator image
      if (data.creatorImage) {
        formData.append("creatorImage", data.creatorImage);
      }

      // Append main image (optional)
      if (data.mainImage) {
        formData.append("mainImage", data.mainImage);
      }

      // Social links
      formData.append(
        "creatorSocialLinks[facebook]",
        data.creatorSocialLinks?.facebook || "",
      );
      formData.append(
        "creatorSocialLinks[instagram]",
        data.creatorSocialLinks?.instagram || "",
      );
      formData.append(
        "creatorSocialLinks[twitter]",
        data.creatorSocialLinks?.twitter || "",
      );

      if (blogPostId) {
        dispatch(update_blogPost({ blogPostId, formData }));
      } else {
        dispatch(blogPostAdd(formData));
      }
    },
    [blogPostId, dispatch, selectedCategory, newCategory],
  );

  // UI Components
  const FormSection = useCallback(
    ({ title, icon: Icon, children }) => (
      <div className="mb-8 overflow-hidden rounded-2xl bg-white shadow-nature-medium ring-1 ring-primary-100">
        <div className="bg-gradient-to-r from-primary via-primary-600 to-primary-700 p-6">
          <div className="flex items-center space-x-3">
            <div className="rounded-lg bg-white p-2 shadow-sm">
              <Icon className="text-xl text-secondary" />
            </div>
            <h2 className="text-2xl font-bold text-white">{title}</h2>
          </div>
        </div>
        <div className="p-8">{children}</div>
      </div>
    ),
    [],
  );

  const InputField = useCallback(
    ({ label, name, placeholder, type = "text", rows = 4, required = false }) => {
      const fieldName = name;
      const error = errors[fieldName];
      return (
        <div className="mb-6">
          <label className="mb-3 block text-sm font-bold text-primary-800">
            {label} {required && <span className="text-red-500">*</span>}
          </label>
          {type === "textarea" ? (
            <>
              <textarea
                {...register(fieldName)}
                placeholder={placeholder}
                rows={rows}
                className={`w-full resize-none rounded-xl border-2 bg-white px-4 py-3.5 text-text-dark placeholder:text-text-light focus:outline-none focus:ring-2 ${
                  error
                    ? "border-red-500 focus:border-red-500 focus:ring-red-200"
                    : "border-primary-200 focus:border-secondary focus:ring-secondary-200"
                }`}
              />
              {error && (
                <p className="mt-1 text-xs text-red-600">{error.message}</p>
              )}
            </>
          ) : (
            <>
              <input
                type={type}
                {...register(fieldName)}
                placeholder={placeholder}
                className={`w-full rounded-xl border-2 bg-white px-4 py-3.5 text-text-dark placeholder:text-text-light focus:outline-none focus:ring-2 ${
                  error
                    ? "border-red-500 focus:border-red-500 focus:ring-red-200"
                    : "border-primary-200 focus:border-secondary focus:ring-secondary-200"
                }`}
              />
              {error && (
                <p className="mt-1 text-xs text-red-600">{error.message}</p>
              )}
            </>
          )}
        </div>
      );
    },
    [register, errors],
  );

  const ImageUpload = useCallback(
    ({ id, label, imageKey, aspectRatio = "aspect-video" }) => (
      <div className="mb-6">
        <label className="mb-3 block text-sm font-bold text-primary-800">
          {label}
        </label>
        <label
          htmlFor={id}
          className={`group relative flex ${aspectRatio} w-full cursor-pointer flex-col items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-primary-300 bg-white transition-all duration-300`}
        >
          {previews[imageKey] ? (
            <div className="absolute inset-0">
              <img
                src={
                  previews[imageKey].startsWith("blob:")
                    ? previews[imageKey]
                    : IMAGES_URL + previews[imageKey].split("/").pop()
                }
                alt={`${label} Preview`}
                className="h-full w-full object-cover transition-all duration-300 group-hover:scale-110"
              />
              <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100">
                <div className="rounded-xl bg-secondary p-4">
                  <IoMdImage className="text-2xl text-white" />
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center space-y-4 text-text-light">
              <div className="rounded-xl bg-secondary p-4">
                <IoMdImage className="h-8 w-8 text-white" />
              </div>
              <div className="text-center">
                <span className="text-sm font-semibold text-text-dark">
                  Click to upload {label}
                </span>
                <p className="mt-1 text-xs text-text-light">
                  PNG, JPG up to 10MB
                </p>
              </div>
            </div>
          )}
        </label>
        <input
          hidden
          id={id}
          type="file"
          onChange={(e) => handleImageChange(e, imageKey)}
          accept="image/*"
        />
      </div>
    ),
    [previews, handleImageChange],
  );

  // Effects
  useEffect(() => {
    // Fetch blog categories on mount
    dispatch(get_blog_categories());
    
    if (blogPostId) {
      dispatch(get_blogPost(blogPostId));
    }
    return () => {
      dispatch(clearBlogPost());
    };
  }, [dispatch, blogPostId]);

  useEffect(() => {
    if (blogPost && blogPost._id) {
      const contentTypeValue = blogPost.contentType || "structured";
      setValue("contentType", contentTypeValue);

      if (contentTypeValue === "html") {
        setValue("htmlContent", blogPost.htmlContent || "");
      }

      reset({
        mainTitle: blogPost.mainTitle || "",
        creatorName: blogPost.creatorName || "",
        creatorBio: blogPost.creatorBio || "",
        contentType: contentTypeValue,
        htmlContent: contentTypeValue === "html" ? (blogPost.htmlContent || "") : "",
        mainParagraph: blogPost.mainParagraph || "",
        secondParagraph: blogPost.secondParagraph || "",
        thirdParagraph: blogPost.thirdParagraph || "",
        secondTitle: blogPost.secondTitle || "",
        fourthParagraph: blogPost.fourthParagraph || "",
        proverb: blogPost.proverb || "",
        proverbWriter: blogPost.proverbWriter || "",
        title: blogPost.relatedImages?.title || "",
        paragraph: blogPost.relatedImages?.paragraph || "",
        creatorSocialLinks: {
          facebook: blogPost.creatorSocialLinks?.facebook || "",
          instagram: blogPost.creatorSocialLinks?.instagram || "",
          twitter: blogPost.creatorSocialLinks?.twitter || "",
        },
        category: blogPost.category || "",
      });
      
      // Set category
      if (blogPost.category) {
        setSelectedCategory(blogPost.category);
        setNewCategory("");
        setShowNewCategoryInput(false);
      }

      setPreviews({
        creatorImage: blogPost.creatorImage || "",
        mainImage: blogPost.mainImage || "",
        relatedImage1: blogPost.relatedImages?.image1 || "",
        relatedImage2: blogPost.relatedImages?.image2 || "",
      });
    }
  }, [blogPost?._id, setValue, reset]);

  useEffect(() => {
    if (successMessage) {
      toast.success(successMessage);
      
      // Navigate to blog posts list after successful creation (not when editing)
      if (!blogPostId && successMessage.includes("successfully created")) {
        // Small delay to show the success message before navigating
        const timer = setTimeout(() => {
          navigate("/admin/dashboard/blogPosts");
        }, 1500);
        dispatch(clearMessage());
        return () => clearTimeout(timer);
      }
      
      dispatch(clearMessage());
    }
    if (errorMessage) {
      toast.error(errorMessage);
      dispatch(clearMessage());
    }
  }, [successMessage, errorMessage, dispatch, blogPostId, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-primary-50/30 p-4 md:p-5">
      <div className="mx-auto max-w-7xl">
        <HeaderText title="Blog Post" />

        {/* Content Type Toggle */}
        <div className="mb-8 overflow-hidden rounded-2xl bg-white shadow-nature-medium ring-1 ring-primary-100">
          <div className="bg-gradient-to-r from-primary-50 to-secondary-50 p-6">
            <h3 className="mb-4 text-lg font-bold text-primary-800">
              Content Type
            </h3>
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setValue("contentType", "structured")}
                className={`flex items-center gap-2 rounded-xl px-6 py-3 font-semibold transition-all ${
                  contentType === "structured"
                    ? "shadow-coral-medium bg-gradient-to-r from-secondary to-sunshine-400 text-white"
                    : "border-2 border-primary-200 bg-white text-text-dark hover:border-secondary"
                }`}
              >
                <FaFileAlt />
                Structured Content
              </button>
              <button
                type="button"
                onClick={() => setValue("contentType", "html")}
                className={`flex items-center gap-2 rounded-xl px-6 py-3 font-semibold transition-all ${
                  contentType === "html"
                    ? "shadow-coral-medium bg-gradient-to-r from-secondary to-sunshine-400 text-white"
                    : "border-2 border-primary-200 bg-white text-text-dark hover:border-secondary"
                }`}
              >
                <FaCode />
                HTML Editor
              </button>
            </div>
          </div>
        </div>

        <form
          key={blogPostId || "new"}
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-8"
        >
          {/* Author Information - Always Mandatory */}
          <FormSection title="Author Information" icon={FaUser}>
            <div className="grid gap-8 lg:grid-cols-2">
              <div>
                <InputField
                  label="Creator's Name"
                  name="creatorName"
                  placeholder="Enter the author's name"
                  required
                />
                <InputField
                  label="Creator's Bio"
                  name="creatorBio"
                  placeholder="Tell us about the author..."
                  type="textarea"
                  rows={6}
                  required
                />
                <div className="mt-6 rounded-xl bg-white p-6 ring-1 ring-primary-100">
                  <h3 className="mb-4 text-lg font-bold text-primary-800">
                    Social Media Links
                  </h3>
                  {/* Facebook */}
                  <div className="mb-4">
                    <label className="mb-2 flex items-center text-sm font-bold text-primary-800">
                      <FaFacebook className="mr-2 text-lg" />
                      Facebook URL (Optional)
                    </label>
                    <input
                      type="text"
                      {...register("creatorSocialLinks.facebook")}
                      placeholder="https://facebook.com/username"
                      className={`w-full rounded-xl border-2 bg-white px-4 py-3.5 text-text-dark placeholder:text-text-light focus:outline-none focus:ring-2 ${
                        errors.creatorSocialLinks?.facebook
                          ? "border-red-500 focus:border-red-500 focus:ring-red-200"
                          : "border-primary-200 focus:border-secondary focus:ring-secondary-200"
                      }`}
                    />
                    {errors.creatorSocialLinks?.facebook && (
                      <p className="mt-1 text-xs text-red-600">
                        {errors.creatorSocialLinks.facebook.message}
                      </p>
                    )}
                  </div>
                  {/* Instagram */}
                  <div className="mb-4">
                    <label className="mb-2 flex items-center text-sm font-bold text-primary-800">
                      <FaInstagram className="mr-2 text-lg" />
                      Instagram URL (Optional)
                    </label>
                    <input
                      type="text"
                      {...register("creatorSocialLinks.instagram")}
                      placeholder="https://instagram.com/username"
                      className={`w-full rounded-xl border-2 bg-white px-4 py-3.5 text-text-dark placeholder:text-text-light focus:outline-none focus:ring-2 ${
                        errors.creatorSocialLinks?.instagram
                          ? "border-red-500 focus:border-red-500 focus:ring-red-200"
                          : "border-primary-200 focus:border-secondary focus:ring-secondary-200"
                      }`}
                    />
                    {errors.creatorSocialLinks?.instagram && (
                      <p className="mt-1 text-xs text-red-600">
                        {errors.creatorSocialLinks.instagram.message}
                      </p>
                    )}
                  </div>
                  {/* Twitter */}
                  <div className="mb-4">
                    <label className="mb-2 flex items-center text-sm font-bold text-primary-800">
                      <FaTwitter className="mr-2 text-lg" />
                      Twitter URL (Optional)
                    </label>
                    <input
                      type="text"
                      {...register("creatorSocialLinks.twitter")}
                      placeholder="https://twitter.com/username"
                      className={`w-full rounded-xl border-2 bg-white px-4 py-3.5 text-text-dark placeholder:text-text-light focus:outline-none focus:ring-2 ${
                        errors.creatorSocialLinks?.twitter
                          ? "border-red-500 focus:border-red-500 focus:ring-red-200"
                          : "border-primary-200 focus:border-secondary focus:ring-secondary-200"
                      }`}
                    />
                    {errors.creatorSocialLinks?.twitter && (
                      <p className="mt-1 text-xs text-red-600">
                        {errors.creatorSocialLinks.twitter.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>
              <div>
                <ImageUpload
                  id="creator-image"
                  label="Author's Profile Picture *"
                  imageKey="creatorImage"
                  aspectRatio="aspect-square"
                />
              </div>
            </div>
          </FormSection>

          {/* Main Title - Always Required */}
          <FormSection title="Blog Post Title" icon={FaPen}>
            <InputField
              label="Main Title"
              name="mainTitle"
              placeholder="Enter a compelling title for your blog post"
              required
            />
            <ImageUpload
              id="main-image"
              label="Featured Image (Optional)"
              imageKey="mainImage"
            />
          </FormSection>

          {/* Category Section */}
          <FormSection title="Blog Category" icon={FaTags}>
            <div className="mb-6">
              <label className="mb-3 block text-sm font-bold text-primary-800">
                Category (Optional)
              </label>
              <div className="flex flex-col gap-4">
                <div className="flex gap-4">
                  <select
                    value={selectedCategory}
                    onChange={async (e) => {
                      const newValue = e.target.value;
                      setSelectedCategory(newValue);
                      if (newValue) {
                        setShowNewCategoryInput(false);
                        setNewCategory("");
                        // If editing, update category immediately
                        if (blogPostId) {
                          await handleCategoryUpdate(newValue);
                        }
                      }
                    }}
                    className="flex-1 rounded-xl border-2 border-primary-200 bg-white px-4 py-3.5 text-text-dark focus:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary-200"
                  >
                    <option value="">Select a category</option>
                    {blogCategories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => {
                      setShowNewCategoryInput(!showNewCategoryInput);
                      if (!showNewCategoryInput) {
                        setSelectedCategory("");
                        setNewCategory("");
                      }
                    }}
                    className="rounded-xl border-2 border-primary-200 bg-white px-6 py-3.5 font-semibold text-primary-800 transition-all hover:border-secondary hover:bg-primary-50"
                  >
                    {showNewCategoryInput ? "Use Existing" : "Add New"}
                  </button>
                </div>
                {showNewCategoryInput && (
                  <div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newCategory}
                        onChange={(e) => setNewCategory(e.target.value)}
                        onKeyDown={async (e) => {
                          if (e.key === "Enter" && newCategory.trim() && blogPostId) {
                            e.preventDefault();
                            await handleCategoryUpdate(newCategory.trim());
                          }
                        }}
                        placeholder="Enter new category name"
                        className="flex-1 rounded-xl border-2 border-primary-200 bg-white px-4 py-3.5 text-text-dark placeholder:text-text-light focus:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary-200"
                      />
                      <button
                        type="button"
                        onClick={async () => {
                          if (newCategory.trim()) {
                            if (blogPostId) {
                              // Update category immediately if editing
                              await handleCategoryUpdate(newCategory.trim());
                            } else {
                              // Just show feedback if creating new
                              toast.success(`Category &quot;${newCategory.trim()}&quot; will be saved with this blog post`);
                            }
                          }
                        }}
                        disabled={!newCategory.trim() || categoryUpdating}
                        className="rounded-xl border-2 border-secondary bg-gradient-to-r from-secondary to-sunshine-400 px-6 py-3.5 font-semibold text-white transition-all hover:shadow-soft disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:shadow-none"
                      >
                        {categoryUpdating ? "Updating..." : blogPostId ? "Update Now" : "Confirm"}
                      </button>
                    </div>
                    {newCategory.trim() && !blogPostId && (
                      <p className="mt-2 text-sm font-medium text-secondary">
                        ✓ Category &quot;{newCategory.trim()}&quot; will be saved with this blog post
                      </p>
                    )}
                    {blogPostId && (
                      <p className="mt-2 text-sm text-text-light">
                        Click &quot;Update Now&quot; to save the category immediately, or submit the form to save all changes.
                      </p>
                    )}
                    {!blogPostId && (
                      <p className="mt-2 text-sm text-text-light">
                        Category will be saved when you submit the form.
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </FormSection>

          {/* Content Section - Based on Content Type */}
          {contentType === "html" ? (
            <FormSection title="HTML Content" icon={FaCode}>
              <div className="mb-6">
                <div className="mb-3 flex items-center justify-between">
                  <label className="block text-sm font-bold text-primary-800">
                    Blog Content (HTML) *
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowHtmlCode(!showHtmlCode)}
                    className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-info to-info-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:scale-105"
                  >
                    <FaCode className="text-xs" />
                    {showHtmlCode ? "Visual Editor" : "HTML Code"}
                  </button>
                </div>

                {showHtmlCode ? (
                  /* HTML Code Editor */
                  <div>
                    <Controller
                      name="htmlContent"
                      control={control}
                      render={({ field }) => (
                        <textarea
                          {...field}
                          placeholder="Enter your HTML code here..."
                          rows={20}
                          className={`w-full resize-none rounded-xl border-2 bg-neutral-900 px-4 py-3.5 font-mono text-sm text-green-400 placeholder:text-neutral-500 focus:outline-none focus:ring-2 ${
                            errors.htmlContent
                              ? "border-red-500 focus:border-red-500 focus:ring-red-200"
                              : "border-primary-200 focus:border-secondary focus:ring-secondary-200"
                          }`}
                          style={{
                            fontFamily: "'Courier New', monospace",
                            lineHeight: "1.5",
                          }}
                        />
                      )}
                    />
                    {errors.htmlContent && (
                      <p className="mt-1 text-xs text-red-600">
                        {errors.htmlContent.message}
                      </p>
                    )}
                    <p className="mt-2 text-sm text-text-light">
                      Direct HTML code editor. Make sure your HTML is valid.
                    </p>
                  </div>
                ) : (
                  /* WYSIWYG Editor */
                  <div>
                    <div className="rounded-xl border-2 border-primary-200 bg-white">
                      <Controller
                        name="htmlContent"
                        control={control}
                        render={({ field }) => (
                          <ReactQuill
                            theme="snow"
                            value={field.value || ""}
                            onChange={field.onChange}
                            modules={quillModules}
                            placeholder="Start writing your blog content..."
                            className="min-h-[400px]"
                          />
                        )}
                      />
                    </div>
                    {errors.htmlContent && (
                      <p className="mt-1 text-xs text-red-600">
                        {errors.htmlContent.message}
                      </p>
                    )}
                    <p className="mt-2 text-sm text-text-light">
                      Use the rich text editor to format your content. You can
                      add images, videos, and links. Switch to HTML Code to edit
                      raw HTML.
                    </p>
                  </div>
                )}
              </div>
            </FormSection>
          ) : (
            <>
              <FormSection title="Main Content" icon={FaPen}>
                <InputField
                  label="Opening Paragraph"
                  name="mainParagraph"
                  placeholder="Start with an engaging opening paragraph..."
                  type="textarea"
                  rows={5}
                />
                <InputField
                  label="Second Paragraph"
                  name="secondParagraph"
                  placeholder="Continue your story..."
                  type="textarea"
                  rows={5}
                />
                <InputField
                  label="Third Paragraph"
                  name="thirdParagraph"
                  placeholder="Develop your ideas further..."
                  type="textarea"
                  rows={5}
                />
              </FormSection>

              <FormSection title="Additional Content" icon={FaEdit}>
                <InputField
                  label="Secondary Title"
                  name="secondTitle"
                  placeholder="Add a subtitle or section header"
                />
                <InputField
                  label="Fourth Paragraph"
                  name="fourthParagraph"
                  placeholder="Conclude your main content..."
                  type="textarea"
                  rows={5}
                />
              </FormSection>

              <FormSection title="Inspirational Quote" icon={FaQuoteLeft}>
                <InputField
                  label="Quote or Proverb"
                  name="proverb"
                  placeholder="Share an inspiring quote or proverb..."
                  type="textarea"
                  rows={3}
                />
                <InputField
                  label="Quote Author"
                  name="proverbWriter"
                  placeholder="Who said this quote?"
                />
              </FormSection>

              <FormSection title="Related Images" icon={FaImage}>
                <InputField
                  label="Related Images Title"
                  name="title"
                  placeholder="Title for your image gallery"
                />
                <div className="grid gap-8 lg:grid-cols-2">
                  <ImageUpload
                    id="related-image-1"
                    label="First Related Image"
                    imageKey="relatedImage1"
                  />
                  <ImageUpload
                    id="related-image-2"
                    label="Second Related Image"
                    imageKey="relatedImage2"
                  />
                </div>
                <InputField
                  label="Images Description"
                  name="paragraph"
                  placeholder="Describe the significance of these images..."
                  type="textarea"
                  rows={4}
                />
              </FormSection>
            </>
          )}

          <div className="flex justify-center">
            <button
              type="submit"
              disabled={loader}
              className="hover:shadow-coral-large shadow-coral-medium min-w-[250px] rounded-2xl bg-gradient-to-r from-secondary to-sunshine-400 px-8 py-4 text-lg font-bold text-white transition-all duration-300 hover:scale-105 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
            >
              {loader ? (
                <div className="flex items-center justify-center space-x-2">
                  <PropagateLoader
                    cssOverride={overrideStyle}
                    color="#ffffff"
                    size={8}
                  />
                  <span>Publishing...</span>
                </div>
              ) : (
                <span>
                  {blogPostId ? "Update Blog Post" : "Publish Blog Post"}
                </span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BlogPostForm;
