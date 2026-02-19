"use client";

import { useState, useEffect } from "react";
import {
  Upload,
  X,
  FileText,
  Camera,
  Save,
  Eye,
  Users,
  Star,
  Zap,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import {
  add_whoWeAre,
  clearMessage,
  get_whoWeAre,
} from "../../store/Reducers/whoWeAreReducer";
import toast from "react-hot-toast";
import HeaderText from "./HeaderText";
import { IMAGES_URL } from "../../utils/constants";
import { isViewer } from "../../utils/roleVerification";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { whoWeAreSchema } from "../../utils/validationSchemas";

const WhoWeAre = () => {
  const dispatch = useDispatch();
  const { errorMessage, successMessage, whoWeAre } = useSelector(
    (state) => state.whoWeAre,
  );
  const role = useSelector((state) => state.auth?.userInfo?.role);

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(whoWeAreSchema),
    defaultValues: {
      mainTitle: "",
      paragraph: "",
      image1: null,
      image2: null,
      image3: null,
    },
  });

  const [previewUrls, setPreviewUrls] = useState({
    image1: "",
    image2: "",
    image3: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const [draggedOver, setDraggedOver] = useState(null);
  const [autoSaving, setAutoSaving] = useState(false);

  const handleImageUpload = async (field, file) => {
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size should be less than 5MB");
        return;
      }

      const validTypes = ["image/jpeg", "image/png", "image/webp"];
      if (!validTypes.includes(file.type)) {
        toast.error("Please upload a valid image file (JPEG, PNG, or WebP)");
        return;
      }

      // Update form with new image
      setValue(field, file, { shouldValidate: true });
      setPreviewUrls((prev) => ({
        ...prev,
        [field]: URL.createObjectURL(file),
      }));

      // Auto-save when image is uploaded
      await autoSave(field, file);
    }
  };

  const autoSave = async (field, file) => {
    try {
      setAutoSaving(true);
      const formValues = watch();
      const submitData = new FormData();
      submitData.append("mainTitle", (formValues.mainTitle || "").trim());
      submitData.append("paragraph", (formValues.paragraph || "").trim());

      // Include all existing images
      ["image1", "image2", "image3"].forEach((imgField) => {
        if (imgField === field) {
          if (file) {
            submitData.append(imgField, file);
          }
        } else if (formValues[imgField]) {
          submitData.append(imgField, formValues[imgField]);
        }
      });

      await dispatch(add_whoWeAre(submitData));
      toast.success("Image auto-saved successfully!");
    } catch (error) {
      console.error("Auto-save failed:", error);
      toast.error("Failed to auto-save image. Please try again.");
    } finally {
      setAutoSaving(false);
    }
  };

  const removeImage = async (field) => {
    setValue(field, null, { shouldValidate: true });
    setPreviewUrls((prev) => ({
      ...prev,
      [field]: "",
    }));

    // Auto-save when image is removed
    await autoSave(field, null);
  };

  const onSubmit = async (data) => {
    setIsSubmitting(true);

    try {
      const submitData = new FormData();
      submitData.append("mainTitle", data.mainTitle.trim());
      submitData.append("paragraph", data.paragraph.trim());
      ["image1", "image2", "image3"].forEach((field) => {
        if (data[field]) {
          submitData.append(field, data[field]);
        }
      });

      await dispatch(add_whoWeAre(submitData));
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    dispatch(get_whoWeAre());
  }, [dispatch]);

  useEffect(() => {
    if (whoWeAre) {
      reset({
        mainTitle: whoWeAre.mainTitle || "",
        paragraph: whoWeAre.paragraph || "",
        image1: null,
        image2: null,
        image3: null,
      });
      setPreviewUrls({
        image1: whoWeAre.image1 || "",
        image2: whoWeAre.image2 || "",
        image3: whoWeAre.image3 || "",
      });
    }
  }, [whoWeAre, reset]);

  useEffect(() => {
    if (errorMessage) {
      toast.error(errorMessage);
      dispatch(clearMessage());
    }
    if (successMessage) {
      toast.success(successMessage);
      dispatch(clearMessage());
    }
  }, [errorMessage, successMessage, dispatch]);

  const imageLabels = [
    { title: "Hero Image", subtitle: "Main showcase image", icon: Star },
    { title: "Team Image", subtitle: "Your amazing team", icon: Users },
    { title: "Culture Image", subtitle: "Company culture", icon: Zap },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-primary-50/30 p-4 md:p-5">
      <div className="mx-auto max-w-7xl">
        <div className="flex items-center justify-between">
          <HeaderText title="Who We Are" />
          {autoSaving && (
            <div className="flex items-center gap-2 rounded-lg bg-success-100 px-4 py-2 text-success-700">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-success-600 border-t-transparent" />
              <span className="text-sm font-semibold">Auto-saving...</span>
            </div>
          )}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Form Section */}
          <div className="lg:col-span-2">
            <div className="overflow-hidden rounded-3xl bg-white shadow-nature-medium ring-1 ring-primary-100">
              <form onSubmit={handleSubmit(onSubmit)} className="p-7">
                <div className="space-y-10">
                  {/* Title Section */}
                  <div className="group">
                    <div className="mb-6 flex items-center gap-4">
                      <div className="shadow-coral-soft flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-r from-secondary to-sunshine-400">
                        <FileText className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <label className="text-xl font-bold text-primary-800">
                          Main Title *
                        </label>
                        <p className="text-sm text-text">
                          Create a compelling headline
                        </p>
                      </div>
                    </div>
                    <div className="relative">
                      <input
                        type="text"
                        {...register("mainTitle")}
                        onFocus={() => setFocusedField("title")}
                        onBlur={() => setFocusedField(null)}
                        placeholder="e.g., 'Innovating the Future, One Solution at a Time'"
                        className={`w-full rounded-2xl border-2 px-6 py-5 text-lg font-medium text-text-dark placeholder-text-light transition-all focus:outline-none ${
                          errors.mainTitle
                            ? "border-red-500 bg-red-50 ring-2 ring-red-200"
                            : focusedField === "title"
                              ? "border-secondary bg-secondary-50 ring-2 ring-secondary-200"
                              : "border-primary-200 bg-white"
                        }`}
                      />
                      {errors.mainTitle && (
                        <p className="mt-2 text-sm text-red-600">
                          {errors.mainTitle.message}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Content Section */}
                  <div className="group">
                    <div className="mb-6 flex items-center gap-4">
                      <div className="shadow-coral-soft flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-r from-secondary to-sunshine-400">
                        <Eye className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <label className="text-xl font-bold text-primary-800">
                          Story & Vision *
                        </label>
                        <p className="text-sm text-text">
                          Share your companys journey
                        </p>
                      </div>
                    </div>
                    <div className="relative">
                      <textarea
                        {...register("paragraph")}
                        onFocus={() => setFocusedField("content")}
                        onBlur={() => setFocusedField(null)}
                        rows={8}
                        placeholder="Tell your story... What drives your company? What makes you unique? Share your mission, values, and the passion behind what you do. This is where you connect with your audience on a deeper level."
                        className={`w-full resize-none rounded-2xl border-2 px-6 py-5 text-text-dark placeholder-text-light transition-all focus:outline-none ${
                          errors.paragraph
                            ? "border-red-500 bg-red-50 ring-2 ring-red-200"
                            : focusedField === "content"
                              ? "border-secondary bg-secondary-50 ring-2 ring-secondary-200"
                              : "border-primary-200 bg-white"
                        }`}
                      />
                      {errors.paragraph && (
                        <p className="mt-2 text-sm text-red-600">
                          {errors.paragraph.message}
                        </p>
                      )}
                    </div>
                  </div>
                  {!isViewer(role) && (
                    <div className="pt-6">
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="shadow-coral-medium hover:shadow-coral-large group relative w-full overflow-hidden rounded-2xl bg-gradient-to-r from-secondary to-sunshine-400 px-8 py-6 text-lg font-bold text-white transition-all duration-500 hover:scale-[1.02] focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
                      >
                        <div className="relative flex items-center justify-center gap-3">
                          {isSubmitting ? (
                            <>
                              <div className="h-6 w-6 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                              <span>Saving Your Story...</span>
                            </>
                          ) : (
                            <>
                              <Save className="h-6 w-6 transition-transform group-hover:rotate-12 group-hover:scale-110" />
                              <span>Save & Publish</span>
                            </>
                          )}
                        </div>
                      </button>
                    </div>
                  )}
                </div>
              </form>
            </div>
          </div>

          {/* Images Section */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <div className="overflow-hidden rounded-3xl bg-white shadow-nature-medium ring-1 ring-primary-100">
                <div className="bg-gradient-to-r from-primary via-primary-600 to-primary-700 p-6">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white shadow-lg">
                      <Camera className="h-6 w-6 text-secondary" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">
                        Visual Gallery
                      </h3>
                      <p className="text-sm text-white/90">
                        Upload up to 3 images
                      </p>
                    </div>
                  </div>
                </div>
                <div className="p-8">

                  <div className="space-y-6">
                    {["image1", "image2", "image3"].map((field, index) => {
                      const ImageIconComponent = imageLabels[index].icon;
                      let imageName = previewUrls[field]
                        ? IMAGES_URL +
                          previewUrls[field].split("/").pop()
                        : "/placeholder.svg";

                      return (
                        <div key={field} className="group">
                          <div className="mb-3 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <ImageIconComponent className="h-4 w-4 text-secondary" />
                              <span className="text-sm font-semibold text-primary-800">
                                {imageLabels[index].title}
                              </span>
                            </div>
                            {previewUrls[field] && (
                              <span className="inline-flex items-center gap-1 rounded-full bg-success-100 px-2 py-1 text-xs font-semibold text-success-700">
                                <div className="h-2 w-2 animate-pulse rounded-full bg-success-600" />
                                {autoSaving ? "Saving..." : "Uploaded"}
                              </span>
                            )}
                          </div>

                          <div className="relative">
                            <label
                              htmlFor={field}
                              className={`relative block aspect-[4/3] cursor-pointer overflow-hidden rounded-2xl border-2 border-dashed transition-all duration-500 group-hover:scale-[1.02] ${
                                previewUrls[field]
                                  ? "border-transparent shadow-nature-medium ring-2 ring-primary-200"
                                  : draggedOver === field
                                    ? "border-secondary bg-secondary-50 shadow-lg"
                                    : "border-primary-200 bg-primary-50/30 hover:border-secondary hover:bg-secondary-50 hover:shadow-lg"
                              }`}
                              onDragOver={(e) => {
                                e.preventDefault();
                                setDraggedOver(field);
                              }}
                              onDragLeave={() => setDraggedOver(null)}
                              onDrop={(e) => {
                                e.preventDefault();
                                setDraggedOver(null);
                                const file = e.dataTransfer.files[0];
                                if (file) handleImageUpload(field, file);
                              }}
                            >
                              {previewUrls[field] ? (
                                <>
                                  <img
                                    src={imageName || "/placeholder.svg"}
                                    alt={`Preview ${index + 1}`}
                                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                                  />
                                  <div className="absolute inset-0 bg-gradient-to-t from-primary-900/60 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                                  {!isViewer(role) && (
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.preventDefault();
                                        removeImage(field);
                                      }}
                                      className="absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full bg-accent text-white opacity-0 backdrop-blur-sm transition-all duration-300 hover:scale-110 hover:bg-accent-600 group-hover:opacity-100"
                                    >
                                      <X className="h-5 w-5" />
                                    </button>
                                  )}
                                </>
                              ) : (
                                <div className="flex h-full flex-col items-center justify-center space-y-4 bg-gradient-to-br from-primary-50 via-white to-secondary-50">
                                  <div className="relative">
                                    <div className="shadow-coral-soft flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-r from-secondary to-sunshine-400">
                                      <Upload className="h-8 w-8 text-white" />
                                    </div>
                                    <div className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-primary-700">
                                      <span className="text-xs font-bold text-white">
                                        {index + 1}
                                      </span>
                                    </div>
                                  </div>
                                  <div className="text-center">
                                    <span className="block text-sm font-semibold text-primary-800">
                                      {imageLabels[index].title}
                                    </span>
                                    <span className="text-xs text-text">
                                      {imageLabels[index].subtitle}
                                    </span>
                                    <span className="mt-2 block text-xs text-text-light">
                                      PNG, JPG, WebP • Max 5MB
                                    </span>
                                  </div>
                                </div>
                              )}
                            </label>
                            <Controller
                              name={field}
                              control={control}
                              render={({ field: { onChange, value, ...fieldProps } }) => (
                                <input
                                  {...fieldProps}
                                  id={field}
                                  type="file"
                                  className="hidden"
                                  accept="image/jpeg,image/png,image/webp"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                      handleImageUpload(field, file);
                                    }
                                  }}
                                  disabled={isViewer(role)}
                                />
                              )}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Info */}
        <div className="mt-8 text-center">
          <div className="inline-flex items-center gap-2 rounded-2xl bg-white px-6 py-3 shadow-nature-soft ring-1 ring-primary-100">
            <div className="h-2 w-2 animate-pulse rounded-full bg-success-500" />
            <p className="text-sm font-medium text-primary-800">
              Changes will be reflected on your website immediately after saving
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WhoWeAre;
