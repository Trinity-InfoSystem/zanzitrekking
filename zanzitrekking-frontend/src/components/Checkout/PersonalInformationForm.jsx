// components/checkout/PersonalInformationForm.jsx
"use client";

import { Mail, Phone, User } from "lucide-react";

const PersonalInformationForm = ({ formData, errors, handleChange }) => {
  return (
    <>
      <h2 className="mb-6 flex items-center gap-2 text-xl font-semibold text-gray-900">
        <User className="h-5 w-5 text-emerald-600" />
        Personal Information
      </h2>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">
            First Name
          </label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <User className="h-5 w-5 text-emerald-400" />
            </div>
            <input
              type="text"
              className={`w-full rounded-full border ${
                errors.personalInfo?.firstName
                  ? "border-red-500"
                  : "border-emerald-100"
              } bg-white px-4 py-3 pl-10 text-gray-700 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200 transition-all`}
              value={formData.personalInfo.firstName}
              onChange={(e) =>
                handleChange("personalInfo", "firstName", e.target.value)
              }
            />
          </div>
          {errors.personalInfo?.firstName && (
            <p className="mt-1 text-sm text-red-500">
              {errors.personalInfo.firstName}
            </p>
          )}
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">
            Last Name
          </label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <User className="h-5 w-5 text-emerald-400" />
            </div>
            <input
              type="text"
              className={`w-full rounded-full border ${
                errors.personalInfo?.lastName
                  ? "border-red-500"
                  : "border-emerald-100"
              } bg-white px-4 py-3 pl-10 text-gray-700 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200 transition-all`}
              value={formData.personalInfo.lastName}
              onChange={(e) =>
                handleChange("personalInfo", "lastName", e.target.value)
              }
            />
          </div>
          {errors.personalInfo?.lastName && (
            <p className="mt-1 text-sm text-red-500">
              {errors.personalInfo.lastName}
            </p>
          )}
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">
            Email Address
          </label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Mail className="h-5 w-5 text-emerald-400" />
            </div>
            <input
              type="email"
              className={`w-full rounded-full border ${
                errors.personalInfo?.email ? "border-red-500" : "border-emerald-100"
              } bg-white px-4 py-3 pl-10 text-gray-700 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200 transition-all`}
              value={formData.personalInfo.email}
              onChange={(e) =>
                handleChange("personalInfo", "email", e.target.value)
              }
            />
          </div>
          {errors.personalInfo?.email && (
            <p className="mt-1 text-sm text-red-500">
              {errors.personalInfo.email}
            </p>
          )}
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">
            Phone Number
          </label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Phone className="h-5 w-5 text-emerald-400" />
            </div>
            <input
              type="tel"
              className={`w-full rounded-full border ${
                errors.personalInfo?.phone ? "border-red-500" : "border-emerald-100"
              } bg-white px-4 py-3 pl-10 text-gray-700 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200 transition-all`}
              value={formData.personalInfo.phone}
              onChange={(e) =>
                handleChange("personalInfo", "phone", e.target.value)
              }
            />
          </div>
          {errors.personalInfo?.phone && (
            <p className="mt-1 text-sm text-red-500">
              {errors.personalInfo.phone}
            </p>
          )}
        </div>
      </div>
    </>
  );
};

export default PersonalInformationForm;