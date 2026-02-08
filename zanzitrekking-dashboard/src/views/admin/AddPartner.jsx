"use client";

import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { partnerAdd, clearMessage } from "../../store/Reducers/partnerReducer";
import toast from "react-hot-toast";
import { PropagateLoader } from "react-spinners";
import { overrideStyle } from "../../utils/utilis";
import HeaderText from "./HeaderText";

const AddPartner = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { loader, successMessage, errorMessage } = useSelector(
    (state) => state.partner,
  );

  const [formData, setFormData] = useState({
    name: "",
    badge: "",
    color: "from-teal-500 to-cyan-500",
    rating: 5,
    reviews: 0,
    website: "",
    description: "",
    order: 0,
  });

  const [logo, setLogo] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);

  const colorOptions = [
    { value: "from-red-500 to-pink-500", label: "Red to Pink" },
    { value: "from-blue-500 to-cyan-500", label: "Blue to Cyan" },
    { value: "from-green-500 to-emerald-500", label: "Green to Emerald" },
    { value: "from-purple-500 to-violet-500", label: "Purple to Violet" },
    { value: "from-orange-500 to-amber-500", label: "Orange to Amber" },
    { value: "from-teal-500 to-cyan-500", label: "Teal to Cyan" },
  ];

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
      setLogo(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setLogoPreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle success and error messages
  useEffect(() => {
    if (errorMessage) {
      toast.error(errorMessage);
      dispatch(clearMessage());
    }
    if (successMessage) {
      toast.success(successMessage);
      // Navigate back to partners list after successful creation
      setTimeout(() => {
        dispatch(clearMessage());
        navigate("/admin/dashboard/partners");
      }, 1500);
    }
  }, [successMessage, errorMessage, dispatch, navigate]);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.name || !formData.badge || !logo) {
      toast.error("Please fill in all required fields and upload a logo");
      return;
    }

    const submitData = new FormData();
    submitData.append("name", formData.name);
    submitData.append("badge", formData.badge);
    submitData.append("color", formData.color);
    submitData.append("rating", formData.rating);
    submitData.append("reviews", formData.reviews);
    submitData.append("website", formData.website);
    submitData.append("description", formData.description);
    submitData.append("order", formData.order);
    submitData.append("logo", logo);

    dispatch(partnerAdd(submitData));
  };

  return (
    <div className="px-2 py-5 lg:px-7">
      <div className="w-full rounded-md bg-white p-4 shadow-nature-medium ring-1 ring-primary-100">
        <HeaderText title="Add Partner" />

        <div className="mt-4 flex items-center justify-between">
          <button
            onClick={() => navigate("/admin/dashboard/partners")}
            className="rounded-xl bg-neutral-200 px-4 py-2 font-medium text-text-dark transition-colors hover:bg-neutral-300"
          >
            Back to Partners
          </button>
        </div>

        <div className="w-full">
          <form onSubmit={handleSubmit} className="mt-5">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {/* Partner Name */}
              <div>
                <label className="mb-2 block text-sm font-medium text-primary-800">
                  Partner Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full rounded-xl border-2 border-primary-200 bg-white px-3 py-2 text-text-dark focus:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary-200"
                  placeholder="Enter partner name"
                  required
                />
              </div>

              {/* Badge */}
              <div>
                <label className="mb-2 block text-sm font-medium text-primary-800">
                  Badge *
                </label>
                <input
                  type="text"
                  name="badge"
                  value={formData.badge}
                  onChange={handleInputChange}
                  className="w-full rounded-xl border-2 border-primary-200 bg-white px-3 py-2 text-text-dark focus:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary-200"
                  placeholder="e.g., Premium Partner"
                  required
                />
              </div>

              {/* Color */}
              <div>
                <label className="mb-2 block text-sm font-medium text-primary-800">
                  Badge Color *
                </label>
                <select
                  name="color"
                  value={formData.color}
                  onChange={handleInputChange}
                  className="w-full rounded-xl border-2 border-primary-200 bg-white px-3 py-2 text-text-dark focus:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary-200"
                  required
                >
                  {colorOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Website */}
              {/* <div>
                <label className="mb-2 block text-sm font-medium text-gray-300">
                  Website
                </label>
                <input
                  type="url"
                  name="website"
                  value={formData.website}
                  onChange={handleInputChange}
                  className="w-full rounded-md border border-slate-500 bg-[#303A55] px-3 py-2 text-[#d0d2d6] outline-none focus:border-cyan-400"
                  placeholder="https://example.com"
                />
              </div> */}

              {/* Rating */}
              <div>
                <label className="mb-2 block text-sm font-medium text-primary-800">
                  Rating (0-5) *
                </label>
                <input
                  type="number"
                  name="rating"
                  value={formData.rating}
                  onChange={handleInputChange}
                  min="0"
                  max="5"
                  step="0.1"
                  className="w-full rounded-xl border-2 border-primary-200 bg-white px-3 py-2 text-text-dark focus:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary-200"
                  required
                />
              </div>

              {/* Reviews Count */}
              <div>
                <label className="mb-2 block text-sm font-medium text-primary-800">
                  Reviews Count *
                </label>
                <input
                  type="number"
                  name="reviews"
                  value={formData.reviews}
                  onChange={handleInputChange}
                  min="0"
                  className="w-full rounded-xl border-2 border-primary-200 bg-white px-3 py-2 text-text-dark focus:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary-200"
                  required
                />
              </div>

              {/* Order */}
              <div>
                <label className="mb-2 block text-sm font-medium text-primary-800">
                  Display Order
                </label>
                <input
                  type="number"
                  name="order"
                  value={formData.order}
                  onChange={handleInputChange}
                  min="0"
                  className="w-full rounded-xl border-2 border-primary-200 bg-white px-3 py-2 text-text-dark focus:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary-200"
                />
              </div>

              {/* Logo Upload */}
              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-medium text-primary-800">
                  Partner Logo *
                </label>
                <div className="flex items-center gap-4">
                  <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-lg border-2 border-dashed border-primary-300 bg-neutral-50">
                    {logoPreview ? (
                      <img
                        src={logoPreview}
                        alt="Logo preview"
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
                    className="w-full rounded-xl border-2 border-primary-200 bg-white px-3 py-2 text-text-dark focus:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary-200"
                    required
                  />
                </div>
              </div>

              {/* Description */}
              {/* <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-medium text-gray-300">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="3"
                  className="w-full rounded-md border border-slate-500 bg-[#303A55] px-3 py-2 text-[#d0d2d6] outline-none focus:border-cyan-400"
                  placeholder="Enter partner description"
                />
              </div> */}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="submit"
                disabled={loader}
                className="shadow-coral-medium hover:shadow-coral-large flex min-h-14 min-w-[200px] items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-secondary to-sunshine-400 px-6 py-2 text-center font-semibold text-white transition-all hover:scale-105 disabled:opacity-50"
              >
                {loader ? (
                  <PropagateLoader color="#fff" cssOverride={overrideStyle} />
                ) : (
                  "Add Partner"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddPartner;
