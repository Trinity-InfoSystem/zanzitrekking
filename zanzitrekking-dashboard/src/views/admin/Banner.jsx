"use client";

import { useState, useEffect } from "react";
import { ImageIcon, Loader, X } from "lucide-react";
import { FaImages, FaEye, FaUpload, FaPlay, FaPause } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import {
  clearMessage,
  create_banner,
  fetch_banner,
  update_banner,
} from "../../store/Reducers/bannerReducer";
import toast from "react-hot-toast";
import HeaderText from "./HeaderText";
import { IMAGES_URL } from "../../utils/constants";
import { isViewer } from "../../utils/roleVerification";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { bannerSchema } from "../../utils/validationSchemas";

const Banner = () => {
  const dispatch = useDispatch();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [sharedVideoFile, setSharedVideoFile] = useState(null);
  const [sharedVideoUrl, setSharedVideoUrl] = useState("");
  const { errorMessage, successMessage, banner, loader } = useSelector(
    (state) => state.banner,
  );
  const role = useSelector((state) => state.auth?.userInfo?.role);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(bannerSchema),
    defaultValues: {
      banners: [
        {
          title: "",
          description: "",
          image: null,
        },
      ],
      title:"",
      description:"",
      sharedVideo: null,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "banners",
  });

  const banners = watch("banners");

  useEffect(() => {
    dispatch(fetch_banner());
  }, [dispatch]);

  useEffect(() => {
    if (banner && banner.banners.length > 0) {
      reset({
        banners: banner.banners.map((b) => ({
          title: b.title || "",
          description: b.description || "",
          image: b.image, // Keep as null, use imageUrl for preview
        })),
        sharedVideo: null,
        title:banner.title,
        description:banner.description
      });

      // Set shared video
      if (banner.sharedVideo) {
        setSharedVideoUrl(banner.sharedVideo);
      }
    }
  }, [banner, reset]);

  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      if (banners && banners.length > 0) {
        setCurrentImageIndex((prev) => (prev + 1) % banners.length);
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [banners, isPlaying]);

  useEffect(() => {
    if (errorMessage) {
      toast.error(errorMessage);
      dispatch(clearMessage());
    }
    if (successMessage) {
      toast.success(successMessage);
      dispatch(fetch_banner());
      dispatch(clearMessage());
    }
  }, [errorMessage, successMessage, dispatch]);

  const handleNumImagesChange = (e) => {
    const newCount = Math.max(1, Number.parseInt(e.target.value, 10) || 1);
    const currentCount = banners?.length || 0;
    if (newCount > currentCount) {
      // Add new banners
      for (let i = currentCount; i < newCount; i++) {
        append({
          title: "",
          description: "",
          image: null,
        });
      }
    } else if (newCount < currentCount) {
      // Remove excess banners
      for (let i = currentCount - 1; i >= newCount; i--) {
        remove(i);
      }
    }
  };

  const handleSharedVideoUpload = (file) => {
    if (file) {
      setSharedVideoFile(file);
      setSharedVideoUrl(URL.createObjectURL(file));
    }
  };

  const openVideoModal = (videoUrl) => {
    setSelectedVideo(videoUrl);
    setShowVideoModal(true);
  };

  const closeVideoModal = () => {
    setShowVideoModal(false);
    setSelectedVideo(null);
  };

  const onSubmit = (data) => {
    const formData = new FormData();

    // Add Title and description
    formData.append("title", data.title || "");
    formData.append("description", data.description || "");

    // Add shared video
    if (sharedVideoFile) {
      formData.append("sharedVideo", sharedVideoFile);
    } else if (data.sharedVideo) {
      formData.append("sharedVideo", data.sharedVideo);
    }

    data.banners.forEach((bannerItem, index) => {
      if (bannerItem.image instanceof File) {
        formData.append(`banners[${index}][image]`, bannerItem.image);
      }
      formData.append(`banners[${index}][title]`, bannerItem.title || "");
      formData.append(`banners[${index}][description]`, bannerItem.description || "");
    });
    console.log(formData);

    if (banner) {
      dispatch(update_banner(formData));
    } else {
      dispatch(create_banner(formData));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-primary-50/30 p-4 md:p-5">
      <div className="mx-auto max-w-7xl">
        <HeaderText title="Update Banner" />

        <div className="space-y-8">
          <div className="overflow-hidden rounded-2xl bg-white shadow-nature-medium ring-1 ring-primary-100">
            <div className="bg-gradient-to-r from-primary via-primary-600 to-primary-700 p-6">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center space-x-3">
                  <div className="rounded-lg bg-white p-2">
                    <FaUpload className="text-xl text-secondary" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">
                      Banner Management
                    </h2>
                    <p className="text-white/90">
                      Upload and configure your banner images
                    </p>
                  </div>
                </div>
                <div className="shadow-coral-soft flex items-center space-x-2 rounded-2xl bg-white px-4 py-2">
                  <FaImages className="text-secondary" />
                  <span className="text-sm font-medium text-primary-800">
                    Images:
                  </span>
                  <input
                    type="number"
                    value={banners?.length || 1}
                    onChange={handleNumImagesChange}
                    min="1"
                    className="w-16 rounded-lg bg-gradient-to-r from-secondary to-sunshine-400 p-2 text-center text-sm font-semibold text-white focus:outline-none"
                    disabled={isViewer(role)}
                  />
                </div>
              </div>
            </div>

            <div className="p-8">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                {/* Shared Video Section */}
                <div className="mb-8">
                  <h3 className="mb-4 text-lg font-bold text-primary-800">
                    Shared Video (Appears on all banners)
                  </h3>
                  <div className="relative">
                    <label className="group/shared-video relative mx-auto block aspect-video h-52 cursor-pointer overflow-hidden rounded-xl bg-gradient-to-br from-primary-50 to-secondary-50 ring-2 ring-primary-200 transition-all duration-300 hover:ring-secondary">
                      {sharedVideoFile || sharedVideoUrl ? (
                        <>
                          <video
                            src={
                              sharedVideoUrl
                                ? sharedVideoUrl.includes("blob:")
                                  ? sharedVideoUrl
                                  : IMAGES_URL + sharedVideoUrl.split("/").pop()
                                : ""
                            }
                            className="h-full w-full object-cover transition-all duration-300 group-hover/shared-video:scale-110"
                            muted
                          />
                          <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-all duration-300 group-hover/shared-video:bg-black/20">
                            <div
                              data-upload-trigger
                              className="d shadow-coral-soft cursor-pointer rounded-lg bg-white p-3 opacity-0 transition-opacity duration-300 group-hover/shared-video:opacity-100"
                              onClick={(e) => {
                                e.stopPropagation();
                                document
                                  .getElementById("shared-video-input")
                                  ?.click();
                              }}
                            >
                              <FaUpload className="text-xl text-secondary" />
                            </div>
                          </div>
                          {!isViewer(role) && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                openVideoModal(
                                  sharedVideoUrl.includes("blob:")
                                    ? sharedVideoUrl
                                    : IMAGES_URL +
                                        sharedVideoUrl.split("/").pop(),
                                );
                              }}
                              data-play-button
                              className="shadow-coral-soft absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-r from-secondary to-sunshine-400 text-white opacity-0 transition-all duration-300 hover:scale-110 group-hover/shared-video:opacity-100"
                            >
                              <FaPlay className="h-4 w-4" />
                            </button>
                          )}
                        </>
                      ) : (
                        <div className="flex h-52 flex-col items-center justify-center space-y-3">
                          <div className="shadow-coral-soft rounded-full bg-gradient-to-br from-secondary to-sunshine-400 p-4">
                            <FaPlay className="h-8 w-8 text-white" />
                          </div>
                          <div className="text-center">
                            <span className="text-sm font-semibold text-primary-800">
                              Click to upload shared video
                            </span>
                            <p className="mt-1 text-xs text-text-light">
                              MP4, MOV up to 50MB
                            </p>
                          </div>
                        </div>
                      )}
                      <input
                        id="shared-video-input"
                        type="file"
                        hidden
                        accept="video/*"
                        onChange={(e) =>
                          handleSharedVideoUpload(e.target.files[0])
                        }
                        disabled={isViewer(role)}
                      />
                    </label>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="mb-2 block text-sm font-bold text-primary-800">
                      Title *
                    </label>
                    <input
                      {...register(`title`)}
                      type="text"
                      placeholder="Enter compelling title"
                      className={`w-full rounded-xl border-2 bg-white px-4 py-3 text-text-dark placeholder:text-text-light focus:outline-none focus:ring-2 ${
                        
                          "border-primary-200 focus:border-secondary focus:ring-secondary-200"
                      }`}
                    />
                    {/* {titleError && (
                      <p className="mt-1 text-xs text-red-600">
                        {titleError.message}
                      </p>
                    )} */}
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-bold text-primary-800">
                      Description *
                    </label>
                    <textarea
                      {...register(`description`)}
                      placeholder="Write engaging description"
                      rows={5}
                      className="w-full resize-none rounded-xl border-2 border-primary-200 bg-white px-4 py-3 text-text-dark placeholder:text-text-light focus:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary-200"
                    />
                  </div>
                </div>

                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {fields.map((field, index) => {
                    const bannerItem = banners[index];
                    const imageError = errors.banners?.[index]?.image;
                    const titleError = errors.banners?.[index]?.title;
                    const bannerImageUrl = banner?.banners?.[index]?.image;
                    let imageName = bannerImageUrl
                      ? IMAGES_URL + bannerImageUrl.split("/").pop()
                      : null;
                    const previewUrl = bannerItem?.image instanceof File
                      ? URL.createObjectURL(bannerItem.image)
                      : imageName;

                    return (
                      <div
                        key={field.id}
                        className="group rounded-2xl border border-primary-200 bg-white p-5 shadow-nature-soft transition-all duration-300 hover:scale-[1.02] hover:shadow-nature-medium"
                      >
                        <div className="mb-4">
                          <div className="mb-3 flex items-center justify-between">
                            <span className="text-sm font-bold text-secondary">
                              Banner {index + 1}
                            </span>
                            <div className="shadow-coral-soft flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-r from-secondary to-sunshine-400">
                              <span className="text-xs font-bold text-white">
                                {index + 1}
                              </span>
                            </div>
                          </div>

                          <label className="group/upload relative block aspect-video w-full cursor-pointer overflow-hidden rounded-xl bg-gradient-to-br from-primary-50 to-secondary-50 ring-2 ring-primary-200 transition-all duration-300 hover:ring-secondary">
                            {previewUrl ? (
                              <>
                                <img
                                  src={previewUrl}
                                  alt={`Banner ${index + 1}`}
                                  className="h-full w-full object-cover transition-all duration-300 group-hover/upload:scale-110"
                                />
                                <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-all duration-300 group-hover/upload:bg-black/20">
                                  <div className="d shadow-coral-soft rounded-lg bg-white p-3 opacity-0 transition-opacity duration-300 group-hover/upload:opacity-100">
                                    <FaUpload className="text-xl text-secondary" />
                                  </div>
                                </div>
                              </>
                            ) : (
                              <div className="flex h-full flex-col items-center justify-center space-y-3">
                                <div className="shadow-coral-soft rounded-full bg-gradient-to-br from-secondary to-sunshine-400 p-4">
                                  <ImageIcon className="h-8 w-8 text-white" />
                                </div>
                                <div className="text-center">
                                  <span className="text-sm font-semibold text-primary-800">
                                    Click to upload
                                  </span>
                                  <p className="mt-1 text-xs text-text-light">
                                    PNG, JPG up to 10MB
                                  </p>
                                </div>
                              </div>
                            )}
                            <Controller
                              name={`banners.${index}.image`}
                              control={control}
                              render={({ field: { onChange, value, ...field } }) => (
                                <input
                                  {...field}
                                  type="file"
                                  hidden
                                  accept="image/*"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                      onChange(file);
                                    }
                                  }}
                                  disabled={isViewer(role)}
                                />
                              )}
                            />
                          </label>
                          {imageError && (
                            <p className="mt-1 text-xs text-red-600">
                              {imageError.message}
                            </p>
                          )}
                        </div>

                        <div className="space-y-4">
                          <div>
                            <label className="mb-2 block text-sm font-bold text-primary-800">
                              Banner Title *
                            </label>
                            <input
                              type="text"
                              {...register(`banners.${index}.title`)}
                              placeholder="Enter compelling title"
                              className={`w-full rounded-xl border-2 bg-white px-4 py-3 text-text-dark placeholder:text-text-light focus:outline-none focus:ring-2 ${
                                titleError
                                  ? "border-red-500 focus:border-red-500 focus:ring-red-200"
                                  : "border-primary-200 focus:border-secondary focus:ring-secondary-200"
                              }`}
                            />
                            {titleError && (
                              <p className="mt-1 text-xs text-red-600">
                                {titleError.message}
                              </p>
                            )}
                          </div>
                          <div>
                            <label className="mb-2 block text-sm font-bold text-primary-800">
                              Description
                            </label>
                            <textarea
                              {...register(`banners.${index}.description`)}
                              placeholder="Write engaging description"
                              rows={5}
                              className="w-full resize-none rounded-xl border-2 border-primary-200 bg-white px-4 py-3 text-text-dark placeholder:text-text-light focus:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary-200"
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                {errors.banners && typeof errors.banners === "object" && !Array.isArray(errors.banners) && (
                  <p className="mt-2 text-sm text-red-600">
                    {errors.banners.message}
                  </p>
                )}

                {!isViewer(role) && (
                  <div className="flex justify-center">
                    <button
                      type="submit"
                      disabled={loader}
                      className="shadow-coral-medium hover:shadow-coral-large min-w-[200px] rounded-2xl bg-gradient-to-r from-secondary to-sunshine-400 px-8 py-4 text-lg font-bold text-white transition-all duration-300 hover:scale-105 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
                    >
                      {loader ? (
                        <div className="flex items-center justify-center space-x-2">
                          <Loader className="h-5 w-5 animate-spin" />
                          <span>Saving...</span>
                        </div>
                      ) : (
                        "Save Banner"
                      )}
                    </button>
                  </div>
                )}
              </form>
            </div>
          </div>

          {/* Preview Section */}
          {banners && banners.length > 0 &&
            banners.some((bannerItem, idx) => {
              const bannerImageUrl = banner?.banners?.[idx]?.image;
              return bannerItem?.image instanceof File || bannerImageUrl;
            }) && (
              <div className="overflow-hidden rounded-2xl bg-white shadow-nature-medium ring-1 ring-primary-100">
                <div className="bg-gradient-to-r from-primary via-primary-600 to-primary-700 p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="rounded-lg bg-white p-2">
                        <FaEye className="text-xl text-secondary" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-white">
                          Live Preview
                        </h2>
                        <p className="text-white/90">
                          See how your banner will look
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setIsPlaying(!isPlaying)}
                      className="shadow-coral-soft flex items-center space-x-2 rounded-lg bg-white px-4 py-2 text-secondary transition-all hover:scale-105"
                    >
                      {isPlaying ? (
                        <FaPause className="text-sm" />
                      ) : (
                        <FaPlay className="text-sm" />
                      )}
                      <span className="text-sm font-medium">
                        {isPlaying ? "Pause" : "Play"}
                      </span>
                    </button>
                  </div>
                </div>

                <div className="p-8">
                  <div className="relative aspect-[21/9] w-full overflow-hidden rounded-2xl shadow-2xl">
                    {banners.map((bannerItem, index) => {
                      const bannerImageUrl = banner?.banners?.[index]?.image;
                      let imageName = bannerImageUrl
                        ? IMAGES_URL + bannerImageUrl.split("/").pop()
                        : null;
                      const previewUrl = bannerItem?.image instanceof File
                        ? URL.createObjectURL(bannerItem.image)
                        : imageName;
                      return (
                        <div
                          key={index}
                          className={`absolute inset-0 transition-all duration-1000 ${
                            index === currentImageIndex
                              ? "scale-100 opacity-100"
                              : "scale-105 opacity-0"
                          }`}
                        >
                          {previewUrl && (
                            <>
                              <img
                                src={previewUrl}
                                alt={`Preview ${index + 1}`}
                                className="h-full w-full object-cover"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent">
                                <div className="absolute bottom-0 w-full p-8">
                                  <div className="max-w-2xl">
                                    <h3 className="mb-4 font-bold leading-tight text-white lg:text-4xl">
                                      {bannerItem.title || `Banner ${index + 1}`}
                                    </h3>
                                    <p className="leading-relaxed text-white/90 lg:text-lg">
                                      {bannerItem.description ||
                                        "Add a description to make this banner more engaging"}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </>
                          )}
                        </div>
                      );
                    })}

                    {/* Carousel Indicators */}
                    <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 transform space-x-2">
                      {banners.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentImageIndex(index)}
                          className={`h-3 w-3 rounded-full transition-all duration-300 ${
                            index === currentImageIndex
                              ? "scale-125 bg-white"
                              : "bg-white/50 hover:bg-white/75"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
        </div>

        {/* Video Modal */}
        {showVideoModal && selectedVideo && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-primary-900/20 backdrop-blur-sm">
            <div className="relative mx-4 w-full max-w-4xl">
              <button
                onClick={closeVideoModal}
                className="shadow-coral-soft absolute -top-12 right-0 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-sm transition-all hover:scale-110 hover:bg-white/30"
              >
                <X className="h-6 w-6" />
              </button>
              <div className="aspect-video w-full overflow-hidden rounded-2xl bg-primary-900 shadow-2xl ring-2 ring-primary-200">
                <video
                  src={selectedVideo}
                  controls
                  autoPlay
                  className="h-full w-full object-contain"
                >
                  Your browser does not support the video tag.
                </video>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Banner;
