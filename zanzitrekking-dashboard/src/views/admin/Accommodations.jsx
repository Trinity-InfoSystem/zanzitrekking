"use client";

import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Pagination from "../Pagination";
import { FaEdit, FaTrash, FaPlus, FaBed } from "react-icons/fa";
import { IoCloseCircle } from "react-icons/io5";
import { PropagateLoader } from "react-spinners";
import { overrideStyle } from "../../utils/utilis";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import Search from "../components/Search";
import {
  clearMessage,
  get_accommodation,
  get_accommodations,
  accommodation_update,
  accommodationAdd,
  clearAccommodation,
  delete_accommodation,
  delete_accommodations,
} from "../../store/Reducers/accommodationReducer";
import HeaderText from "./HeaderText";
import { useRef } from "react";
import debounce from "lodash.debounce";
import { isViewer } from "../../utils/roleVerification";
import SortSelect from "../components/SortSelect";

// ConfirmModal component (updated with safari theme)
const ConfirmModal = ({ open, onConfirm, onCancel, message }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-primary-900/20 backdrop-blur-sm">
      <div className="w-full max-w-sm animate-scale-in rounded-2xl bg-white p-6 shadow-2xl ring-1 ring-primary-100">
        <h2 className="mb-4 text-lg font-bold text-accent">Confirm Delete</h2>
        <p className="mb-6 text-text-dark">{message}</p>
        <div className="flex justify-end gap-3">
          <button
            className="rounded-xl bg-neutral-200 px-5 py-2.5 font-medium text-text-dark transition-all hover:bg-neutral-300"
            onClick={onCancel}
          >
            Cancel
          </button>
          <button
            className="rounded-xl bg-gradient-to-r from-accent to-accent-600 px-5 py-2.5 font-semibold text-white shadow-medium transition-all hover:scale-105 hover:shadow-lg"
            onClick={onConfirm}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

const Accommodations = () => {
  const dispatch = useDispatch();
  const { accommodationId } = useParams();
  const {
    loader,
    successMessage,
    errorMessage,
    accommodations,
    accommodation,
  } = useSelector((state) => state.accommodation);
  const role = useSelector((state) => state.auth.userInfo?.role);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchValue, setSearchValue] = useState("");
  const [show, setShow] = useState(false);
  const [parPage, setParPage] = useState(5);
  const [sort, setSort] = useState("newest-desc");
  const [isDragActive, setIsDragActive] = useState(false);

  const [form, setForm] = useState({
    name: "",
    description: "",
    type: "",
    images: [], // new images
    prevImages: [], // previously saved images
    deletedImages: [], // images to delete
    price: "",
    category: "",
    location: "",
    contact: { phone: "", email: "", website: "" },
    isActive: true,
  });
  const [errors, setErrors] = useState({});
  const imageInputRef = useRef();
  const [locationSearchResults, setLocationSearchResults] = useState([]);
  const [locationLoading, setLocationLoading] = useState(false);
  const locationInputRef = useRef();
  const debouncedLocationSearch = useRef(
    debounce(async (query) => {
      if (!query || query.length < 3) {
        setLocationSearchResults([]);
        return;
      }
      setLocationLoading(true);
      try {
        const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`;
        const res = await fetch(url);
        const results = await res.json();
        setLocationSearchResults(results);
      } finally {
        setLocationLoading(false);
      }
    }, 400),
  ).current;
  const [selectedIds, setSelectedIds] = useState([]);
  const [bulkConfirmOpen, setBulkConfirmOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [toDeleteId, setToDeleteId] = useState(null);

  function validateForm() {
    let valid = true;
    const errors = {};

    // Only name, category, and images are required
    if (!form.name) {
      errors.name = "Accommodation name is required.";
      valid = false;
    }
    if (!form.category) {
      errors.category = "Category is required.";
      valid = false;
    }
    if (form.images.length === 0 && form.prevImages.length === 0) {
      errors.images = "At least one image is required.";
      valid = false;
    }

    setErrors(errors);
    return valid;
  }

  function handleInputChange(e) {
    const { name, value, type, checked } = e.target;
    if (name.startsWith("contact.")) {
      const contactField = name.split(".")[1];
      setForm((prev) => ({
        ...prev,
        contact: { ...prev.contact, [contactField]: value },
      }));
    } else if (type === "checkbox") {
      setForm((prev) => ({ ...prev, [name]: checked }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  }

  function handleImageChange(e) {
    const newFiles = Array.from(e.target.files);
    setForm((prev) => ({
      ...prev,
      images: [...prev.images, ...newFiles],
    }));
  }

  // Update handleImageChange to append files
  function handleImageChange(e) {
    const newFiles = Array.from(e.target.files);
    setForm((prev) => ({
      ...prev,
      images: [...prev.images, ...newFiles],
    }));
  }

  // New handler for drop event
  function handleDrop(e) {
    e.preventDefault();
    setIsDragActive(false);
    const newFiles = Array.from(e.dataTransfer.files);
    setForm((prev) => ({
      ...prev,
      images: [...prev.images, ...newFiles],
    }));
  }

  // New handler for drag over
  function handleDragOver(e) {
    e.preventDefault();
    setIsDragActive(true);
  }

  // New handler for drag leave
  function handleDragLeave(e) {
    e.preventDefault();
    setIsDragActive(false);
  }

  function handleRemoveNewImage(idx) {
    setForm((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== idx),
    }));
  }

  function handleDeletePrevImage(imgUrl) {
    setForm((prev) => ({
      ...prev,
      prevImages: prev.prevImages.filter((img) => img !== imgUrl),
      deletedImages: [...prev.deletedImages, imgUrl],
    }));
  }

  function add_accommodation(e) {
    e.preventDefault();
    if (!validateForm()) return;
    const formData = new FormData();
    formData.append("name", form.name);
    formData.append("description", form.description);
    formData.append("type", form.type);
    formData.append("price", form.price);
    formData.append("category", form.category);
    formData.append("location", form.location);
    formData.append("isActive", form.isActive);
    formData.append("contact", JSON.stringify(form.contact));
    form.images.forEach((img) => formData.append("images", img));
    if (accommodationId) {
      formData.append("deletedImages", JSON.stringify(form.deletedImages));
      dispatch(accommodation_update({ formData, accommodationId }));
    } else {
      dispatch(accommodationAdd(formData));
    }
    setShow(false);
  }

  useEffect(() => {
    if (errorMessage) {
      toast.error(errorMessage);
      dispatch(clearMessage());
    }
    if (successMessage) {
      toast.success(successMessage);
      dispatch(get_accommodations({ parPage, currentPage, searchValue }));
      if (accommodationId) {
        dispatch(get_accommodation(accommodationId));
      }
      dispatch(clearMessage());
    }
  }, [successMessage, errorMessage, dispatch]);

  useEffect(() => {
    const obj = {
      parPage: +parPage,
      currentPage: +currentPage,
      searchValue,
      sort,
    };
    dispatch(get_accommodations(obj));
  }, [searchValue, currentPage, parPage, sort, dispatch]);

  useEffect(() => {
    if (accommodationId) {
      dispatch(get_accommodation(accommodationId));
    }
  }, [accommodationId, dispatch]);

  useEffect(() => {
    if (accommodation && accommodation.name) {
      setForm({
        name: accommodation.name || "",
        description: accommodation.description || "",
        type: accommodation.type || "",
        images: [],
        prevImages: accommodation.images || [],
        deletedImages: [],
        price: accommodation.price || "",
        category: accommodation.category || "",
        location: accommodation.location || "",
        contact: accommodation.contact || { phone: "", email: "", website: "" },
        isActive:
          accommodation.isActive !== undefined ? accommodation.isActive : true,
      });
    }
  }, [accommodation]);

  useEffect(() => {
    return () => {
      dispatch(clearAccommodation());
    };
  }, [dispatch]);

  // Checkbox handlers
  const isAllSelected =
    accommodations.length > 0 && selectedIds.length === accommodations.length;
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(accommodations.map((d) => d._id));
    } else {
      setSelectedIds([]);
    }
  };
  const handleSelectRow = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((sid) => sid !== id) : [...prev, id],
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-primary-50/30 p-4 md:p-5">
      {/* Confirm Delete Modal (single) */}
      <ConfirmModal
        open={confirmOpen}
        message="Are you sure you want to delete this accommodation?"
        onCancel={() => {
          setConfirmOpen(false);
          setToDeleteId(null);
        }}
        onConfirm={() => {
          if (toDeleteId) {
            dispatch(delete_accommodation(toDeleteId));
            setConfirmOpen(false);
            setToDeleteId(null);
          }
        }}
      />
      {/* Bulk Confirm Delete Modal */}
      <ConfirmModal
        open={bulkConfirmOpen}
        message={`Are you sure you want to delete ${selectedIds.length} accommodations?`}
        onCancel={() => setBulkConfirmOpen(false)}
        onConfirm={() => {
          if (selectedIds.length > 0) {
            dispatch(delete_accommodations(selectedIds)).then(() => {
              setBulkConfirmOpen(false);
              setSelectedIds([]);
            });
          }
        }}
      />
      <div className="mx-auto max-w-7xl">
        <HeaderText title="Accommodations Management" />
        {/* Mobile Header */}
        <div className="mb-6 flex items-center justify-end lg:hidden">
          <button
            onClick={() => setShow((prev) => !prev)}
            className="shadow-coral-medium hover:shadow-coral-large flex items-center space-x-2 rounded-xl bg-gradient-to-r from-secondary to-sunshine-400 px-6 py-3 text-sm font-semibold text-white transition-all duration-300 hover:scale-105"
          >
            <FaPlus className="text-xs" />
            <span>{accommodationId ? "Edit" : "Add New"}</span>
          </button>
        </div>

        <div className="flex flex-col gap-5 lg:flex-row">
          {/* Table Section */}
          <div className="flex-1">
            <div className="overflow-hidden rounded-2xl bg-white shadow-nature-medium ring-1 ring-primary-100">
              {/* Search Section */}
              <div className="border-b border-primary-200 bg-gradient-to-r from-primary-50 to-secondary-50 p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <Search
                    setParPage={setParPage}
                    setSearchValue={setSearchValue}
                    searchValue={searchValue}
                  />
                  <SortSelect sort={sort} setSort={setSort} />
                </div>
                {/* Bulk Delete Button */}
                {selectedIds.length > 0 && (
                  <div className="mt-4 flex justify-end">
                    <button
                      className="rounded-xl bg-gradient-to-r from-accent to-accent-600 px-6 py-2.5 font-semibold text-white shadow-medium transition-all hover:scale-105 hover:shadow-lg disabled:opacity-50"
                      onClick={() => setBulkConfirmOpen(true)}
                      disabled={loader}
                    >
                      {loader
                        ? "Deleting..."
                        : `Delete Selected (${selectedIds.length})`}
                    </button>
                  </div>
                )}
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-primary-200 bg-gradient-to-r from-primary-50 to-secondary-50">
                      <th className="px-4 py-4">
                        <input
                          type="checkbox"
                          checked={isAllSelected}
                          onChange={handleSelectAll}
                          className="h-4 w-4 rounded border-primary-300 text-secondary accent-secondary focus:ring-2 focus:ring-secondary-200"
                        />
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wider text-primary-700">
                        No
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wider text-primary-700">
                        Accommodation Name
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wider text-primary-700">
                        Type
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wider text-primary-700">
                        Category
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wider text-primary-700">
                        Location
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wider text-primary-700">
                        Active
                      </th>
                      {!isViewer(role) && (
                        <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wider text-primary-700">
                          Actions
                        </th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-primary-100">
                    {accommodations.map((d, i) => (
                      <tr
                        key={i}
                        className="group bg-white transition-colors hover:bg-primary-50/50"
                      >
                        <td className="px-4 py-4">
                          <input
                            type="checkbox"
                            checked={selectedIds.includes(d._id)}
                            onChange={() => handleSelectRow(d._id)}
                            className="h-4 w-4 rounded border-primary-300 text-secondary accent-secondary focus:ring-2 focus:ring-secondary-200"
                          />
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-text">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-r from-primary-50 to-secondary-50 font-bold text-primary-700 ring-1 ring-primary-200 transition-all group-hover:scale-110 group-hover:from-secondary group-hover:to-sunshine-400 group-hover:text-white">
                            {i + 1}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-semibold text-text-dark transition-colors duration-300 group-hover:text-secondary">
                            {d.name}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-medium text-text transition-colors duration-300 group-hover:text-primary-700">
                            {d.type}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-medium text-text transition-colors duration-300 group-hover:text-primary-700">
                            {d.category}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-medium text-text transition-colors duration-300 group-hover:text-primary-700">
                            {d.location}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${d.isActive ? "bg-success-100 text-success-700" : "bg-neutral-200 text-text-light"}`}
                          >
                            {d.isActive ? "Active" : "Inactive"}
                          </span>
                        </td>
                        {!isViewer(role) && (
                          <td className="px-6 py-4">
                            <div className="flex gap-2">
                              <Link
                                to={`/admin/dashboard/edit-accommodation/${d._id}`}
                                className="shadow-sunshine-soft hover:shadow-sunshine-medium flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-r from-sunshine-400 to-sunshine-500 text-white transition-all hover:scale-110"
                              >
                                <FaEdit className="h-4 w-4" />
                              </Link>
                              <button
                                onClick={() => {
                                  setToDeleteId(d._id);
                                  setConfirmOpen(true);
                                }}
                                className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-r from-accent to-accent-600 text-white shadow-sm transition-all hover:scale-110 hover:shadow-medium"
                              >
                                <FaTrash className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="border-t border-primary-200 bg-neutral-50 p-6">
                <div className="flex justify-end">
                  <Pagination
                    pageNumber={currentPage}
                    setPageNumber={setCurrentPage}
                    totalItem={50}
                    parPage={parPage}
                    showItem={3}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Form Section */}
          {!isViewer(role) && (
            <div
              className={`fixed inset-y-0 right-0 z-50 w-full max-w-md transform bg-white shadow-2xl backdrop-blur-xl transition-transform duration-500 ease-out lg:relative lg:z-0 lg:translate-x-0 lg:rounded-2xl lg:bg-white lg:ring-1 lg:ring-primary-100 ${
                show ? "translate-x-0" : "translate-x-full"
              }`}
            >
              {/* Form Header */}
              <div className="flex h-full flex-col">
                <div className="bg-gradient-to-r from-primary via-primary-600 to-primary-700 p-6 lg:rounded-t-2xl">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="rounded-lg bg-white p-2 shadow-sm">
                        <FaBed className="text-lg text-secondary" />
                      </div>
                      <h2 className="text-xl font-bold text-white">
                        {accommodationId
                          ? "Edit Accommodation"
                          : "Add New Accommodation"}
                      </h2>
                    </div>
                    <button
                      className="rounded-full p-2 text-white/80 transition-all duration-300 hover:bg-white/20 hover:text-white lg:hidden"
                      onClick={() => setShow(false)}
                    >
                      <IoCloseCircle className="h-6 w-6" />
                    </button>
                  </div>
                </div>

                {/* Form Content */}
                <div className="flex-1 p-6">
                  <form
                    onSubmit={add_accommodation}
                    className="flex h-full flex-1 flex-col"
                  >
                    {/* Name */}
                    <label
                      htmlFor="name"
                      className="mb-3 block text-sm font-bold text-primary-800"
                    >
                      Accommodation Name <span className="text-accent">*</span>
                    </label>
                    <input
                      value={form.name}
                      onChange={handleInputChange}
                      type="text"
                      name="name"
                      id="name"
                      className="w-full rounded-xl border-2 border-primary-200 bg-white px-4 py-3.5 text-text-dark transition-all focus:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary-200"
                    />
                    {errors.name && (
                      <div className="text-sm text-accent">{errors.name}</div>
                    )}

                    {/* Description */}
                    <label
                      htmlFor="description"
                      className="mb-3 mt-4 block text-sm font-bold text-primary-800"
                    >
                      Description
                    </label>
                    <textarea
                      value={form.description}
                      onChange={handleInputChange}
                      name="description"
                      id="description"
                      rows="4"
                      className="w-full rounded-xl border-2 border-primary-200 bg-white px-4 py-3.5 text-text-dark transition-all focus:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary-200"
                    />
                    {errors.description && (
                      <div className="text-sm text-accent">
                        {errors.description}
                      </div>
                    )}

                    {/* Type */}
                    <label
                      htmlFor="type"
                      className="mb-3 mt-4 block text-sm font-bold text-primary-800"
                    >
                      Type
                    </label>
                    <select
                      value={form.type}
                      onChange={handleInputChange}
                      name="type"
                      id="type"
                      className="w-full rounded-xl border-2 border-primary-200 bg-white px-4 py-3.5 text-text-dark transition-all focus:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary-200"
                    >
                      <option value="">Select Type</option>
                      <option value="hotel">Hotel</option>
                      <option value="lodge">Lodge</option>
                      <option value="resort">Resort</option>
                      <option value="camp">Camp</option>
                    </select>

                    {/* Images */}
                    <label
                      htmlFor="images"
                      className="mb-3 mt-4 block text-sm font-bold text-primary-800"
                    >
                      Images <span className="text-accent">*</span>
                    </label>
                    <div
                      className={`mb-4 flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-4 py-8 transition-all duration-200 ${
                        isDragActive
                          ? "shadow-coral-soft border-secondary bg-secondary-50"
                          : "border-primary-300 bg-primary-50/30 hover:border-secondary hover:bg-secondary-50/30"
                      }`}
                      onClick={() => imageInputRef.current.click()}
                      onDrop={handleDrop}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                    >
                      <p className="mb-2 text-text-light">
                        Drag & drop images here, or{" "}
                        <span className="font-semibold text-secondary underline">
                          click to select
                        </span>
                      </p>
                      <input
                        ref={imageInputRef}
                        onChange={handleImageChange}
                        type="file"
                        name="images"
                        id="images"
                        multiple
                        className="hidden"
                        accept="image/*"
                      />
                    </div>

                    <div className="mb-2 flex flex-wrap gap-2">
                      {/* Preview previously saved images */}
                      {form.prevImages &&
                        form.prevImages.map((img, idx) => (
                          <div key={idx} className="group relative">
                            <img
                              src={img}
                              alt="prev"
                              className="shadow-coral-soft h-16 w-16 rounded-lg border-2 border-secondary object-cover transition-all hover:scale-105"
                            />
                            <button
                              type="button"
                              onClick={() => handleDeletePrevImage(img)}
                              className="absolute -right-2 -top-2 rounded-full bg-gradient-to-r from-accent to-accent-600 p-1 text-xs text-white opacity-90 shadow-sm transition-all hover:scale-110 hover:opacity-100"
                              title="Delete image"
                            >
                              &times;
                            </button>
                          </div>
                        ))}
                      {/* Preview new images */}
                      {form.images &&
                        form.images.map((img, idx) => (
                          <div key={idx} className="group relative">
                            <img
                              src={URL.createObjectURL(img)}
                              alt="new"
                              className="h-16 w-16 rounded-lg border-2 border-success object-cover shadow-sm transition-all hover:scale-105"
                            />
                            <button
                              type="button"
                              onClick={() => handleRemoveNewImage(idx)}
                              className="absolute -right-2 -top-2 rounded-full bg-gradient-to-r from-accent to-accent-600 p-1 text-xs text-white opacity-90 shadow-sm transition-all hover:scale-110 hover:opacity-100"
                              title="Remove image"
                            >
                              &times;
                            </button>
                          </div>
                        ))}
                    </div>
                    {errors.images && (
                      <div className="text-sm text-accent">{errors.images}</div>
                    )}
                    {/* Price */}
                    <label
                      htmlFor="price"
                      className="mb-3 mt-4 block text-sm font-bold text-primary-800"
                    >
                      Price
                    </label>
                    <input
                      value={form.price}
                      onChange={handleInputChange}
                      type="number"
                      name="price"
                      id="price"
                      className="w-full rounded-xl border-2 border-primary-200 bg-white px-4 py-3.5 text-text-dark transition-all focus:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary-200"
                      placeholder="Enter price"
                    />

                    {/* Category */}
                    <label
                      htmlFor="category"
                      className="mb-3 mt-4 block text-sm font-bold text-primary-800"
                    >
                      Category <span className="text-accent">*</span>
                    </label>
                    <select
                      value={form.category}
                      onChange={handleInputChange}
                      name="category"
                      id="category"
                      className="w-full rounded-xl border-2 border-primary-200 bg-white px-4 py-3.5 text-text-dark transition-all focus:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary-200"
                    >
                      <option value="">Select Category</option>
                      <option value="Budget">Budget</option>
                      <option value="Mid-range">Mid-range</option>
                      <option value="Luxury">Luxury</option>
                      <option value="Ultra Luxury">Ultra Luxury</option>
                    </select>
                    {errors.category && (
                      <div className="text-sm text-accent">
                        {errors.category}
                      </div>
                    )}

                    {/* Location */}
                    <label
                      htmlFor="location"
                      className="mb-3 mt-4 block text-sm font-bold text-primary-800"
                    >
                      Location
                    </label>
                    <div className="relative">
                      <input
                        ref={locationInputRef}
                        value={form.location}
                        onChange={(e) => {
                          handleInputChange(e);
                          debouncedLocationSearch(e.target.value);
                        }}
                        type="text"
                        name="location"
                        id="location"
                        className="w-full rounded-xl border-2 border-primary-200 bg-white px-4 py-3.5 text-text-dark transition-all focus:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary-200"
                        autoComplete="off"
                        placeholder="Search for a location"
                      />
                      {locationLoading && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-text-light">
                          Loading...
                        </div>
                      )}
                      {locationSearchResults.length > 0 && (
                        <ul className="absolute z-10 mt-1 max-h-56 w-full overflow-auto rounded-xl border border-primary-200 bg-white shadow-lg">
                          {locationSearchResults.map((result, idx) => (
                            <li
                              key={result.place_id}
                              className="cursor-pointer px-4 py-2 text-text-dark transition-colors hover:bg-primary-50 hover:text-secondary"
                              onClick={() => {
                                setForm((prev) => ({
                                  ...prev,
                                  location: result.display_name,
                                }));
                                setLocationSearchResults([]);
                              }}
                            >
                              {result.display_name}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>

                    {/* Contact */}
                    <label className="mb-3 mt-4 block text-sm font-bold text-primary-800">
                      Contact
                    </label>
                    <div className="flex flex-col gap-2">
                      <input
                        value={form.contact.phone}
                        onChange={handleInputChange}
                        type="text"
                        name="contact.phone"
                        placeholder="Phone"
                        className="w-full rounded-xl border-2 border-primary-200 bg-white px-4 py-3.5 text-text-dark transition-all focus:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary-200"
                      />
                      <input
                        value={form.contact.email}
                        onChange={handleInputChange}
                        type="email"
                        name="contact.email"
                        placeholder="Email"
                        className="w-full rounded-xl border-2 border-primary-200 bg-white px-4 py-3.5 text-text-dark transition-all focus:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary-200"
                      />
                      <input
                        value={form.contact.website}
                        onChange={handleInputChange}
                        type="text"
                        name="contact.website"
                        placeholder="Website"
                        className="w-full rounded-xl border-2 border-primary-200 bg-white px-4 py-3.5 text-text-dark transition-all focus:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary-200"
                      />
                    </div>

                    {/* isActive */}
                    <label
                      htmlFor="isActive"
                      className="mb-3 mt-4 flex items-center gap-2 text-sm font-bold text-primary-800"
                    >
                      <input
                        type="checkbox"
                        name="isActive"
                        id="isActive"
                        checked={form.isActive}
                        onChange={handleInputChange}
                        className="h-5 w-5 rounded border-primary-300 text-success accent-success focus:ring-2 focus:ring-success-200"
                      />
                      <span>Active Status</span>
                    </label>

                    <div className="mt-auto pt-6">
                      <button
                        disabled={loader}
                        className="shadow-coral-medium hover:shadow-coral-large min-h-14 w-full rounded-xl bg-gradient-to-r from-secondary to-sunshine-400 px-6 py-4 text-lg font-semibold text-white transition-all hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
                      >
                        {loader ? (
                          <PropagateLoader
                            cssOverride={overrideStyle}
                            color="#ffffff"
                            size={12}
                          />
                        ) : accommodationId ? (
                          "Update Accommodation"
                        ) : (
                          "Add Accommodation"
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Overlay for mobile */}
        {show && (
          <div
            className="ffixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity duration-300 lg:hidden"
            onClick={() => setShow(false)}
          ></div>
        )}
      </div>
    </div>
  );
};

export default Accommodations;
