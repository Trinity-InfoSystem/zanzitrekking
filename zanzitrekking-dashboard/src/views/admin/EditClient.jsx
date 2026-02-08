"use client";

import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import {
  update_client,
  get_client,
  clearMessage,
} from "../../store/Reducers/clientReducer";
import toast from "react-hot-toast";
import { PropagateLoader } from "react-spinners";
import { overrideStyle } from "../../utils/utilis";
import HeaderText from "./HeaderText";
import { IMAGES_URL } from "../../utils/constants";

const EditClient = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { clientId } = useParams();
  const { loader, client, successMessage, errorMessage } = useSelector(
    (state) => state.client,
  );

  const [formData, setFormData] = useState({
    name: "",
    website: "",
    logoUrl: "",
    order: 0,
  });

  const [logo, setLogo] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);

  useEffect(() => {
    if (clientId) {
      dispatch(get_client(clientId));
    }
  }, [dispatch, clientId]);

  useEffect(() => {
    if (client && client._id) {
      setFormData({
        name: client.name || "",
        website: client.website || "",
        logoUrl: client.logoUrl || "",
        order: client.order || 0,
      });
      if (client.logo) {
        const logoUrl = client.logo.startsWith("http")
          ? client.logo
          : `${IMAGES_URL}${client.logo.split("/").pop()}`;
        setLogoPreview(logoUrl);
      } else if (client.logoUrl) {
        setLogoPreview(client.logoUrl);
      }
    }
  }, [client]);

  useEffect(() => {
    if (errorMessage) {
      toast.error(errorMessage);
      dispatch(clearMessage());
    }
    if (successMessage) {
      toast.success(successMessage);
      setTimeout(() => {
        dispatch(clearMessage());
        navigate("/admin/dashboard/clients");
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
      setLogo(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setLogoPreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.name) {
      toast.error("Please fill in all required fields");
      return;
    }

    const submitData = new FormData();
    submitData.append("name", formData.name);
    submitData.append("website", formData.website);
    submitData.append("order", formData.order);
    
    if (formData.logoUrl) {
      submitData.append("logoUrl", formData.logoUrl);
    }
    
    if (logo) {
      submitData.append("logo", logo);
    }

    dispatch(update_client({ clientId, formData: submitData }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-primary-50/30 px-2 py-5 lg:px-7">
      <div className="w-full rounded-2xl bg-white p-6 shadow-nature-medium ring-1 ring-primary-100">
        <HeaderText title="Edit Client" />

        <div className="mt-4 flex items-center justify-between">
          <button
            onClick={() => navigate("/admin/dashboard/clients")}
            className="rounded-xl bg-neutral-200 px-4 py-2 font-medium text-text-dark transition-colors hover:bg-neutral-300"
          >
            Back to Clients
          </button>
        </div>

        <div className="w-full">
          <form onSubmit={handleSubmit} className="mt-5">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {/* Name */}
              <div>
                <label className="mb-2 block text-sm font-bold text-primary-800">
                  Client Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full rounded-xl border-2 border-primary-200 bg-white px-4 py-3 text-text-dark outline-none placeholder:text-text-light focus:border-secondary focus:ring-2 focus:ring-secondary-200"
                  placeholder="e.g., Google"
                  required
                />
              </div>

              {/* Website */}
              <div>
                <label className="mb-2 block text-sm font-bold text-primary-800">
                  Website
                </label>
                <input
                  type="url"
                  name="website"
                  value={formData.website}
                  onChange={handleInputChange}
                  className="w-full rounded-xl border-2 border-primary-200 bg-white px-4 py-3 text-text-dark outline-none placeholder:text-text-light focus:border-secondary focus:ring-2 focus:ring-secondary-200"
                  placeholder="https://example.com"
                />
              </div>

              {/* Logo URL */}
              <div>
                <label className="mb-2 block text-sm font-bold text-primary-800">
                  Logo URL
                </label>
                <input
                  type="url"
                  name="logoUrl"
                  value={formData.logoUrl}
                  onChange={handleInputChange}
                  className="w-full rounded-xl border-2 border-primary-200 bg-white px-4 py-3 text-text-dark outline-none placeholder:text-text-light focus:border-secondary focus:ring-2 focus:ring-secondary-200"
                  placeholder="https://example.com/logo.png"
                />
                <p className="mt-1 text-xs text-text-light">
                  Optional: Provide a logo URL instead of uploading
                </p>
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

              {/* Logo Upload */}
              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-bold text-primary-800">
                  Upload Logo
                </label>
                <div className="flex items-center gap-4">
                  <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-lg border-2 border-dashed border-primary-300 bg-primary-50/30">
                    {logoPreview ? (
                      <img
                        src={logoPreview}
                        alt="Logo preview"
                        className="h-full w-full object-contain"
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
                  Leave empty to keep current logo
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
                  "Update Client"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditClient;

