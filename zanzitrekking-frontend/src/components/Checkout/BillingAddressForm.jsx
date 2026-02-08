// components/checkout/BillingAddressForm.jsx
"use client";

import { Building, Globe, Landmark, MapPin } from "lucide-react";

const BillingAddressForm = ({ formData, errors, handleChange }) => {
  return (
    <>
      <h2 className="mb-6 mt-8 flex items-center gap-2 text-xl font-semibold text-gray-900">
        <MapPin className="h-5 w-5 text-emerald-600" />
        Billing Address
      </h2>

      <div className="grid grid-cols-1 gap-6">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">
            Street Address
          </label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <MapPin className="h-5 w-5 text-emerald-400" />
            </div>
            <input
              type="text"
              className={`w-full rounded-full border ${
                errors.billingAddress?.street ? "border-red-500" : "border-emerald-100"
              } bg-white px-4 py-3 pl-10 text-gray-700 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200 transition-all`}
              value={formData.billingAddress.street}
              onChange={(e) =>
                handleChange("billingAddress", "street", e.target.value)
              }
            />
          </div>
          {errors.billingAddress?.street && (
            <p className="mt-1 text-sm text-red-500">
              {errors.billingAddress.street}
            </p>
          )}
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              City
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Building className="h-5 w-5 text-emerald-400" />
              </div>
              <input
                type="text"
                className={`w-full rounded-full border ${
                  errors.billingAddress?.city ? "border-red-500" : "border-emerald-100"
                } bg-white px-4 py-3 pl-10 text-gray-700 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200 transition-all`}
                value={formData.billingAddress.city}
                onChange={(e) =>
                  handleChange("billingAddress", "city", e.target.value)
                }
              />
            </div>
            {errors.billingAddress?.city && (
              <p className="mt-1 text-sm text-red-500">
                {errors.billingAddress.city}
              </p>
            )}
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              State/Province
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Landmark className="h-5 w-5 text-emerald-400" />
              </div>
              <input
                type="text"
                className={`w-full rounded-full border ${
                  errors.billingAddress?.state
                    ? "border-red-500"
                    : "border-emerald-100"
                } bg-white px-4 py-3 pl-10 text-gray-700 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200 transition-all`}
                value={formData.billingAddress.state}
                onChange={(e) =>
                  handleChange("billingAddress", "state", e.target.value)
                }
              />
            </div>
            {errors.billingAddress?.state && (
              <p className="mt-1 text-sm text-red-500">
                {errors.billingAddress.state}
              </p>
            )}
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              ZIP/Postal Code
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Landmark className="h-5 w-5 text-emerald-400" />
              </div>
              <input
                type="text"
                className={`w-full rounded-full border ${
                  errors.billingAddress?.zip ? "border-red-500" : "border-emerald-100"
                } bg-white px-4 py-3 pl-10 text-gray-700 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200 transition-all`}
                value={formData.billingAddress.zip}
                onChange={(e) =>
                  handleChange("billingAddress", "zip", e.target.value)
                }
              />
            </div>
            {errors.billingAddress?.zip && (
              <p className="mt-1 text-sm text-red-500">
                {errors.billingAddress.zip}
              </p>
            )}
          </div>
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">
            Country
          </label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Globe className="h-5 w-5 text-emerald-400" />
            </div>
            <select
              className={`w-full rounded-full border ${
                errors.billingAddress?.country
                  ? "border-red-500"
                  : "border-emerald-100"
              } bg-white px-4 py-3 pl-10 text-gray-700 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200 transition-all`}
              value={formData.billingAddress.country}
              onChange={(e) =>
                handleChange("billingAddress", "country", e.target.value)
              }
            >
              <option>United States</option>
              <option>Canada</option>
              <option>United Kingdom</option>
              <option>Australia</option>
            </select>
          </div>
          {errors.billingAddress?.country && (
            <p className="mt-1 text-sm text-red-500">
              {errors.billingAddress.country}
            </p>
          )}
        </div>
      </div>
    </>
  );
};

export default BillingAddressForm;