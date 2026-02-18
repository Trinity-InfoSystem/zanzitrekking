"use client";

import { FaImage, FaLock, FaBuilding } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { PropagateLoader } from "react-spinners";
import {
  clearMessage,
  get_user_info,
  update_company_info,
  update_password,
  upload_profile_image,
} from "../../store/Reducers/authReducer";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import HeaderText from "./HeaderText";
import { IMAGES_URL } from "../../utils/constants";
import { isViewer } from "../../utils/roleVerification";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

const companyInfoSchema = yup.object({
  email: yup
    .string()
    .email("Please provide a valid email address")
    .optional(),
  address: yup
    .string()
    .trim()
    .max(500, "Address must not exceed 500 characters")
    .optional(),
  phone: yup
    .string()
    .matches(/^[\d\s\-\+\(\)]+$/, "Phone number contains invalid characters")
    .min(5, "Phone number is too short")
    .max(20, "Phone number is too long")
    .optional(),
});

const profilePasswordSchema = yup.object({
  email: yup
    .string()
    .email("Please provide a valid email address")
    .required("Email is required"),
  o_password: yup.string().required("Current password is required"),
  n_password: yup
    .string()
    .min(6, "Password must be at least 6 characters long")
    .required("New password is required"),
});

const Profile = () => {
  const dispatch = useDispatch();
  const { userInfo, loader, successMessage, errorMessage } = useSelector(
    (state) => state.auth,
  );

  const role = useSelector((state) => state.auth?.userInfo?.role);

  const {
    register: registerCompany,
    handleSubmit: handleSubmitCompany,
    reset: resetCompany,
    formState: { errors: errorsCompany },
  } = useForm({
    resolver: yupResolver(companyInfoSchema),
    defaultValues: {
      email: "",
      address: "",
      phone: "",
    },
  });

  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    reset: resetPassword,
    formState: { errors: errorsPassword },
  } = useForm({
    resolver: yupResolver(profilePasswordSchema),
    defaultValues: {
      email: "",
      o_password: "",
      n_password: "",
    },
  });

  const [previewImage, setPreviewImage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!userInfo) {
      dispatch(get_user_info());
    } else {
      resetCompany({
        email: userInfo.companyEmail || "",
        address: userInfo.companyAddress || "",
        phone: userInfo.companyPhoneNumber || "",
      });
    }
  }, [dispatch, userInfo, resetCompany]);

  const add_image = async (e) => {
    if (e.target.files.length > 0) {
      const file = e.target.files[0];
      if (file.size > 1024 * 1024 * 2) {
        toast.error("Image size should be less than 2MB");
        return;
      }
      setPreviewImage(URL.createObjectURL(file));
      const formData = new FormData();
      formData.append("image", file);
      dispatch(upload_profile_image(formData));
    }
  };

  const submitCompanyInfo = async (data) => {
    setIsSubmitting(true);
    try {
      await dispatch(update_company_info(data));
    } finally {
      setIsSubmitting(false);
    }
  };

  const submitPasswordChange = async (data) => {
    setIsSubmitting(true);
    try {
      await dispatch(update_password(data));
      resetPassword({ email: "", o_password: "", n_password: "" });
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (successMessage) {
      toast.success(successMessage);
      dispatch(clearMessage());
      dispatch(get_user_info());
    }
    if (errorMessage) {
      toast.error(errorMessage);
      dispatch(clearMessage());
    }
  }, [successMessage, errorMessage, dispatch]);

  let imageName = userInfo?.image
    ? IMAGES_URL + userInfo?.image.split("/").pop()
    : "/images/admin.png";

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-primary-50/30 p-4 md:p-5">
      {/* Header */}
      <HeaderText title="Profile Settings" />
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Profile Image Card */}
        <div className="lg:col-span-1">
          <div className="rounded-2xl bg-white p-8 shadow-nature-medium ring-1 ring-primary-100">
            <div className="text-center">
              <div className="relative mb-6 inline-block">
                <input
                  onChange={add_image}
                  type="file"
                  id="image"
                  className="hidden"
                  accept="image/*"
                  disabled={isViewer(role)}
                />
                {previewImage || userInfo?.image ? (
                  <label htmlFor="image" className="group cursor-pointer">
                    <div className="relative">
                      <img
                        src={previewImage || imageName}
                        alt="Profile"
                        className="h-40 w-40 rounded-full border-4 border-primary-200 object-cover shadow-nature-medium transition-all duration-300 group-hover:scale-105 group-hover:shadow-nature-large"
                      />
                      <div className="absolute inset-0 flex items-center justify-center rounded-full bg-primary-900/20 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                        <FaImage className="text-2xl text-white" />
                      </div>
                    </div>
                  </label>
                ) : (
                  <label
                    htmlFor="image"
                    className="group flex h-40 w-40 cursor-pointer flex-col items-center justify-center rounded-full border-4 border-dashed border-primary-200 transition-all duration-300 hover:border-secondary hover:bg-secondary-50"
                  >
                    <FaImage
                      className="mb-3 text-primary-400 transition-colors duration-300 group-hover:text-secondary"
                      size={32}
                    />
                    <span className="text-sm font-medium text-text group-hover:text-secondary">
                      Upload Photo
                    </span>
                  </label>
                )}
              </div>
              <h3 className="mb-2 text-xl font-semibold text-primary-800">
                {userInfo?.name || "Company Profile"}
              </h3>
              <p className="text-text">
                Click on the image to update your profile photo
              </p>
            </div>
          </div>
        </div>

        {/* Forms Section */}
        <div className="space-y-8 lg:col-span-2">
          {/* Company Information Card */}
          <div className="overflow-hidden rounded-2xl bg-white shadow-nature-medium ring-1 ring-primary-100">
            <div className="bg-gradient-to-r from-primary via-primary-600 to-primary-700 px-8 py-6">
              <div className="flex items-center space-x-3">
                <div className="rounded-lg bg-white p-2">
                  <FaBuilding className="text-xl text-secondary" />
                </div>
                <h2 className="text-2xl font-bold text-white">
                  Company Information
                </h2>
              </div>
            </div>

            <div className="p-8">
              <form onSubmit={handleSubmitCompany(submitCompanyInfo)} className="space-y-6">
                <div className="space-y-2">
                  <label
                    htmlFor="companyEmail"
                    className="mb-2 block text-sm font-semibold text-primary-800"
                  >
                    Company Email
                  </label>
                  <div className="relative">
                    <input
                      {...registerCompany("email")}
                      type="email"
                      id="companyEmail"
                      className={`w-full rounded-xl border-2 bg-white px-4 py-3.5 text-text-dark placeholder:text-text-light focus:outline-none focus:ring-2 ${
                        errorsCompany.email
                          ? "border-red-500 focus:border-red-500 focus:ring-red-200"
                          : "border-primary-200 focus:border-secondary focus:ring-secondary-200"
                      }`}
                      placeholder="Enter company email"
                    />
                    {errorsCompany.email && (
                      <p className="mt-1 text-sm text-red-600">
                        {errorsCompany.email.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="address"
                    className="mb-2 block text-sm font-semibold text-primary-800"
                  >
                    Company Address
                  </label>
                  <input
                    {...registerCompany("address")}
                    type="text"
                    id="address"
                    className={`w-full rounded-xl border-2 bg-white px-4 py-3.5 text-text-dark placeholder:text-text-light focus:outline-none focus:ring-2 ${
                      errorsCompany.address
                        ? "border-red-500 focus:border-red-500 focus:ring-red-200"
                        : "border-primary-200 focus:border-secondary focus:ring-secondary-200"
                    }`}
                    placeholder="Enter company address"
                  />
                  {errorsCompany.address && (
                    <p className="mt-1 text-sm text-red-600">
                      {errorsCompany.address.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="phone"
                    className="mb-2 block text-sm font-semibold text-primary-800"
                  >
                    Company Phone
                  </label>
                  <input
                    {...registerCompany("phone")}
                    type="tel"
                    id="phone"
                    className={`w-full rounded-xl border-2 bg-white px-4 py-3.5 text-text-dark placeholder:text-text-light focus:outline-none focus:ring-2 ${
                      errorsCompany.phone
                        ? "border-red-500 focus:border-red-500 focus:ring-red-200"
                        : "border-primary-200 focus:border-secondary focus:ring-secondary-200"
                    }`}
                    placeholder="Enter company phone"
                  />
                  {errorsCompany.phone && (
                    <p className="mt-1 text-sm text-red-600">
                      {errorsCompany.phone.message}
                    </p>
                  )}
                </div>

                {!isViewer(role) && (
                  <button
                    disabled={isSubmitting || loader}
                    className="shadow-coral-medium hover:shadow-coral-large flex min-h-14 w-full items-center justify-center rounded-xl bg-gradient-to-r from-secondary to-sunshine-400 px-4 py-3 font-semibold text-white transition-all hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
                  >
                    {isSubmitting || loader ? (
                      <PropagateLoader color="#ffffff" size={12} />
                    ) : (
                      "Update Company Info"
                    )}
                  </button>
                )}
              </form>
            </div>
          </div>

          {/* Password Change Card */}
          <div className="overflow-hidden rounded-2xl bg-white shadow-nature-medium ring-1 ring-primary-100">
            <div className="bg-gradient-to-r from-primary via-primary-600 to-primary-700 px-8 py-6">
              <div className="flex items-center space-x-3">
                <div className="rounded-lg bg-white p-2">
                  <FaLock className="text-xl text-secondary" />
                </div>
                <h3 className="text-2xl font-bold text-white">
                  Security Settings
                </h3>
              </div>
            </div>

            <div className="p-8">
              <form onSubmit={handleSubmitPassword(submitPasswordChange)} className="space-y-6">
                <div className="space-y-2">
                  <label
                    htmlFor="email"
                    className="mb-2 block text-sm font-semibold text-primary-800"
                  >
                    Email Confirmation *
                  </label>
                  <input
                    {...registerPassword("email")}
                    type="email"
                    id="email"
                    className={`w-full rounded-xl border-2 bg-white px-4 py-3.5 text-text-dark placeholder:text-text-light focus:outline-none focus:ring-2 ${
                      errorsPassword.email
                        ? "border-red-500 focus:border-red-500 focus:ring-red-200"
                        : "border-primary-200 focus:border-secondary focus:ring-secondary-200"
                    }`}
                    placeholder="Confirm your email"
                  />
                  {errorsPassword.email && (
                    <p className="mt-1 text-sm text-red-600">
                      {errorsPassword.email.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="o_password"
                    className="mb-2 block text-sm font-semibold text-primary-800"
                  >
                    Current Password *
                  </label>
                  <input
                    {...registerPassword("o_password")}
                    type="password"
                    id="o_password"
                    className={`w-full rounded-xl border-2 bg-white px-4 py-3.5 text-text-dark placeholder:text-text-light focus:outline-none focus:ring-2 ${
                      errorsPassword.o_password
                        ? "border-red-500 focus:border-red-500 focus:ring-red-200"
                        : "border-primary-200 focus:border-secondary focus:ring-secondary-200"
                    }`}
                    placeholder="Enter current password"
                    autoComplete="current-password"
                  />
                  {errorsPassword.o_password && (
                    <p className="mt-1 text-sm text-red-600">
                      {errorsPassword.o_password.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="n_password"
                    className="mb-2 block text-sm font-semibold text-primary-800"
                  >
                    New Password *
                  </label>
                  <input
                    {...registerPassword("n_password")}
                    type="password"
                    id="n_password"
                    className={`w-full rounded-xl border-2 bg-white px-4 py-3.5 text-text-dark placeholder:text-text-light focus:outline-none focus:ring-2 ${
                      errorsPassword.n_password
                        ? "border-red-500 focus:border-red-500 focus:ring-red-200"
                        : "border-primary-200 focus:border-secondary focus:ring-secondary-200"
                    }`}
                    placeholder="Enter new password (min. 6 characters)"
                    autoComplete="new-password"
                  />
                  {errorsPassword.n_password && (
                    <p className="mt-1 text-sm text-red-600">
                      {errorsPassword.n_password.message}
                    </p>
                  )}
                </div>

                {!isViewer(role) && (
                  <button
                    disabled={isSubmitting || loader}
                    className="shadow-coral-medium hover:shadow-coral-large flex min-h-14 w-full items-center justify-center rounded-xl bg-gradient-to-r from-secondary to-sunshine-400 px-4 py-3 font-semibold text-white transition-all hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
                  >
                    {isSubmitting || loader ? (
                      <PropagateLoader color="#ffffff" size={12} />
                    ) : (
                      "Update Password"
                    )}
                  </button>
                )}
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
