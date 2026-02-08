"use client";

import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import {
  update_achievement,
  get_achievement,
  clearMessage,
} from "../../store/Reducers/achievementReducer";
import toast from "react-hot-toast";
import { PropagateLoader } from "react-spinners";
import { overrideStyle } from "../../utils/utilis";
import HeaderText from "./HeaderText";
import { IMAGES_URL } from "../../utils/constants";

const EditAchievement = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { achievementId } = useParams();
  const { loader, achievement, successMessage, errorMessage } = useSelector(
    (state) => state.achievement,
  );

  const [formData, setFormData] = useState({
    name: "",
    fullName: "",
    status: "",
    imageUrl: "",
    icon: "",
    color: "bg-primary-50",
    iconColor: "text-primary-600",
    type: "certification",
    order: 0,
  });

  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const iconOptions = [
    { value: "", label: "None" },
    { value: "Award", label: "Award" },
    { value: "Shield", label: "Shield" },
    { value: "Star", label: "Star" },
    { value: "Users", label: "Users" },
    { value: "TreePine", label: "Tree Pine" },
    { value: "CheckCircle", label: "Check Circle" },
    { value: "Heart", label: "Heart" },
    { value: "DollarSign", label: "Dollar Sign" },
    { value: "Briefcase", label: "Briefcase" },
    { value: "Building", label: "Building" },
    { value: "Target", label: "Target" },
    { value: "Compass", label: "Compass" },
  ];

  const colorOptions = [
    { value: "bg-primary-50", label: "Primary Light" },
    { value: "bg-secondary-50", label: "Secondary Light" },
    { value: "bg-success-50", label: "Success Light" },
    { value: "bg-accent-50", label: "Accent Light" },
    { value: "bg-sunshine-50", label: "Sunshine Light" },
  ];

  const iconColorOptions = [
    { value: "text-primary-600", label: "Primary" },
    { value: "text-secondary-600", label: "Secondary" },
    { value: "text-success-600", label: "Success" },
    { value: "text-accent-600", label: "Accent" },
    { value: "text-sunshine-600", label: "Sunshine" },
  ];

  useEffect(() => {
    if (achievementId) {
      dispatch(get_achievement(achievementId));
    }
  }, [dispatch, achievementId]);

  useEffect(() => {
    if (achievement && achievement._id) {
      setFormData({
        name: achievement.name || "",
        fullName: achievement.fullName || "",
        status: achievement.status || "",
        imageUrl: achievement.imageUrl || "",
        icon: achievement.icon || "",
        color: achievement.color || "bg-primary-50",
        iconColor: achievement.iconColor || "text-primary-600",
        type: achievement.type || "certification",
        order: achievement.order || 0,
      });
      if (achievement.image) {
        const imageUrl = achievement.image.startsWith("http")
          ? achievement.image
          : `${IMAGES_URL}${achievement.image.split("/").pop()}`;
        setImagePreview(imageUrl);
      } else if (achievement.imageUrl) {
        setImagePreview(achievement.imageUrl);
      }
    }
  }, [achievement]);

  useEffect(() => {
    if (errorMessage) {
      toast.error(errorMessage);
      dispatch(clearMessage());
    }
    if (successMessage) {
      toast.success(successMessage);
      setTimeout(() => {
        dispatch(clearMessage());
        navigate("/admin/dashboard/achievements");
      }, 1500);
    }
  }, [successMessage, errorMessage, dispatch, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.name || !formData.fullName || !formData.status) {
      toast.error("Please fill in all required fields");
      return;
    }

    const submitData = new FormData();
    submitData.append("name", formData.name);
    submitData.append("fullName", formData.fullName);
    submitData.append("status", formData.status);
    submitData.append("type", formData.type);
    submitData.append("order", formData.order);
    submitData.append("icon", formData.icon);
    submitData.append("color", formData.color);
    submitData.append("iconColor", formData.iconColor);
    
    if (formData.imageUrl) {
      submitData.append("imageUrl", formData.imageUrl);
    }
    
    if (image) {
      submitData.append("image", image);
    }

    dispatch(update_achievement({ achievementId, formData: submitData }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-primary-50/30 px-2 py-5 lg:px-7">
      <div className="w-full rounded-2xl bg-white p-6 shadow-nature-medium ring-1 ring-primary-100">
        <HeaderText title="Edit Achievement" />

        <div className="mt-4 flex items-center justify-between">
          <button
            onClick={() => navigate("/admin/dashboard/achievements")}
            className="rounded-xl bg-neutral-200 px-4 py-2 font-medium text-text-dark transition-colors hover:bg-neutral-300"
          >
            Back to Achievements
          </button>
        </div>

        <div className="w-full">
          <form onSubmit={handleSubmit} className="mt-5">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {/* Name */}
              <div>
                <label className="mb-2 block text-sm font-bold text-primary-800">
                  Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full rounded-xl border-2 border-primary-200 bg-white px-4 py-3 text-text-dark outline-none placeholder:text-text-light focus:border-secondary focus:ring-2 focus:ring-secondary-200"
                  placeholder="e.g., TATO"
                  required
                />
              </div>

              {/* Full Name */}
              <div>
                <label className="mb-2 block text-sm font-bold text-primary-800">
                  Full Name *
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  className="w-full rounded-xl border-2 border-primary-200 bg-white px-4 py-3 text-text-dark outline-none placeholder:text-text-light focus:border-secondary focus:ring-2 focus:ring-secondary-200"
                  placeholder="e.g., Tanzania Association of Tour Operators"
                  required
                />
              </div>

              {/* Status */}
              <div>
                <label className="mb-2 block text-sm font-bold text-primary-800">
                  Status *
                </label>
                <input
                  type="text"
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full rounded-xl border-2 border-primary-200 bg-white px-4 py-3 text-text-dark outline-none placeholder:text-text-light focus:border-secondary focus:ring-2 focus:ring-secondary-200"
                  placeholder="e.g., Certified Member"
                  required
                />
              </div>

              {/* Type */}
              <div>
                <label className="mb-2 block text-sm font-bold text-primary-800">
                  Type *
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  className="w-full rounded-xl border-2 border-primary-200 bg-white px-4 py-3 text-text-dark outline-none focus:border-secondary focus:ring-2 focus:ring-secondary-200"
                  required
                >
                  <option value="certification">Certification</option>
                  <option value="award">Award</option>
                </select>
              </div>

              {/* Icon */}
              <div>
                <label className="mb-2 block text-sm font-bold text-primary-800">
                  Icon
                </label>
                <select
                  name="icon"
                  value={formData.icon}
                  onChange={handleInputChange}
                  className="w-full rounded-xl border-2 border-primary-200 bg-white px-4 py-3 text-text-dark outline-none focus:border-secondary focus:ring-2 focus:ring-secondary-200"
                >
                  {iconOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Color */}
              <div>
                <label className="mb-2 block text-sm font-bold text-primary-800">
                  Background Color
                </label>
                <select
                  name="color"
                  value={formData.color}
                  onChange={handleInputChange}
                  className="w-full rounded-xl border-2 border-primary-200 bg-white px-4 py-3 text-text-dark outline-none focus:border-secondary focus:ring-2 focus:ring-secondary-200"
                >
                  {colorOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Icon Color */}
              <div>
                <label className="mb-2 block text-sm font-bold text-primary-800">
                  Icon Color
                </label>
                <select
                  name="iconColor"
                  value={formData.iconColor}
                  onChange={handleInputChange}
                  className="w-full rounded-xl border-2 border-primary-200 bg-white px-4 py-3 text-text-dark outline-none focus:border-secondary focus:ring-2 focus:ring-secondary-200"
                >
                  {iconColorOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Order */}
              <div>
                <label className="mb-2 block text-sm font-bold text-primary-800">
                  Display Order
                </label>
                <input
                  type="number"
                  name="order"
                  value={formData.order}
                  onChange={handleInputChange}
                  min="0"
                  className="w-full rounded-xl border-2 border-primary-200 bg-white px-4 py-3 text-text-dark outline-none placeholder:text-text-light focus:border-secondary focus:ring-2 focus:ring-secondary-200"
                />
              </div>

              {/* Image URL */}
              <div>
                <label className="mb-2 block text-sm font-bold text-primary-800">
                  Image URL
                </label>
                <input
                  type="url"
                  name="imageUrl"
                  value={formData.imageUrl}
                  onChange={handleInputChange}
                  className="w-full rounded-xl border-2 border-primary-200 bg-white px-4 py-3 text-text-dark outline-none placeholder:text-text-light focus:border-secondary focus:ring-2 focus:ring-secondary-200"
                  placeholder="https://example.com/image.png"
                />
                <p className="mt-1 text-xs text-text-light">
                  Optional: Provide an image URL instead of uploading
                </p>
              </div>

              {/* Image Upload */}
              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-bold text-primary-800">
                  Upload Image
                </label>
                <div className="flex items-center gap-4">
                  <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-lg border-2 border-dashed border-primary-300 bg-primary-50/30">
                    {imagePreview ? (
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="text-sm text-text-light">No image</span>
                    )}
                  </div>
                  <input
                    type="file"
                    accept="image/*,.svg"
                    onChange={handleImageChange}
                    className="w-full rounded-xl border-2 border-primary-200 bg-white px-4 py-3 text-text-dark outline-none file:mr-4 file:rounded-lg file:border-0 file:bg-gradient-to-r file:from-secondary file:to-sunshine-400 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:scale-105 focus:border-secondary focus:ring-2 focus:ring-secondary-200"
                  />
                </div>
                <p className="mt-1 text-xs text-text-light">
                  Leave empty to keep current image
                </p>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="submit"
                disabled={loader}
                className="shadow-coral-medium hover:shadow-coral-large flex min-h-14 min-w-[200px] items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-secondary to-sunshine-400 px-6 py-3 text-center font-semibold text-white transition-all hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
              >
                {loader ? (
                  <PropagateLoader color="#fff" cssOverride={overrideStyle} />
                ) : (
                  "Update Achievement"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditAchievement;

