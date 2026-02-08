"use client";

import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Pagination from "../Pagination";
import { FaEdit, FaTrash, FaPlus, FaList } from "react-icons/fa";
import { IoCloseCircle } from "react-icons/io5";
import { PropagateLoader } from "react-spinners";
import { overrideStyle } from "../../utils/utilis";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import Search from "../components/Search";
import {
  clearMessage,
  get_exclusion,
  get_exclusions,
  exclusion_update,
  exclusionAdd,
  clearExclusion,
  delete_exclusion,
  delete_exclusions,
} from "../../store/Reducers/exclusionReducer";
import HeaderText from "./HeaderText";
import { isViewer } from "../../utils/roleVerification";
import SortSelect from "../components/SortSelect";

// ConfirmModal component (copied from Inclusions.jsx with your new styling)
const ConfirmModal = ({ open, onConfirm, onCancel, message }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-primary-900/20 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl ring-1 ring-primary-100">
        <h2 className="mb-4 text-lg font-bold text-accent">Confirm Delete</h2>
        <p className="mb-6 text-text-dark">{message}</p>
        <div className="flex justify-end gap-2">
          <button
            className="rounded-xl bg-neutral-200 px-5 py-2.5 font-medium text-text-dark transition-colors hover:bg-neutral-300"
            onClick={onCancel}
          >
            Cancel
          </button>
          <button
            className="rounded-xl bg-gradient-to-r from-accent to-accent-600 px-5 py-2.5 font-semibold text-white shadow-medium transition-all hover:scale-105"
            onClick={onConfirm}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

const Exclusions = () => {
  const dispatch = useDispatch();
  const { exclusionId } = useParams();
  const {
    loader,
    successMessage,
    errorMessage,
    exclusions,
    exclusion,
    totalExclusions,
  } = useSelector((state) => state.exclusion);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchValue, setSearchValue] = useState("");
  const [show, setShow] = useState(false);
  const [parPage, setParPage] = useState(5);
  const [sort, setSort] = useState("newest-desc");
  const [name, setName] = useState("");
  const [errors, setErrors] = useState({ name: "" });
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [toDeleteId, setToDeleteId] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);
  const [bulkConfirmOpen, setBulkConfirmOpen] = useState(false);

  const role = useSelector((state) => state.auth?.userInfo?.role);

  const navigate = useNavigate();

  function validateForm() {
    let valid = true;
    const errors = { name: "" };

    if (!name) {
      errors.name = "Exclusion name is required.";
      valid = false;
    }

    setErrors(errors);
    return valid;
  }

  function add_exclusion(e) {
    e.preventDefault();
    if (!validateForm()) return;

    if (exclusionId) {
      dispatch(exclusion_update({ name, exclusionId }));
    } else {
      dispatch(exclusionAdd({ name }));
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
      dispatch(get_exclusions({ parPage, currentPage, searchValue }));

      navigate("/admin/dashboard/exclusions");
      if (exclusionId) {
        dispatch(get_exclusion(exclusionId));
      }
      setName("");
      dispatch(clearMessage());
    }
  }, [
    successMessage,
    errorMessage,
    dispatch,
    exclusionId,
    searchValue,
    currentPage,
    parPage,
  ]);

  useEffect(() => {
    const obj = {
      parPage: +parPage,
      currentPage: +currentPage,
      searchValue,
      sort,
    };
    dispatch(get_exclusions(obj));
  }, [searchValue, currentPage, parPage, sort, dispatch]);

  useEffect(() => {
    if (exclusionId) {
      dispatch(get_exclusion(exclusionId));
    }
  }, [exclusionId, dispatch]);

  useEffect(() => {
    if (exclusion && exclusion.name) {
      setName(exclusion.name);
    }
  }, [exclusion]);

  useEffect(() => {
    return () => {
      dispatch(clearExclusion());
    };
  }, [dispatch]);

  // Checkbox handlers
  const isAllSelected =
    exclusions.length > 0 && selectedIds.length === exclusions.length;
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(exclusions.map((d) => d._id));
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
      {/* Confirm Delete Modal */}
      <ConfirmModal
        open={confirmOpen}
        message="Are you sure you want to delete this exclusion?"
        onCancel={() => {
          setConfirmOpen(false);
          setToDeleteId(null);
        }}
        onConfirm={() => {
          if (toDeleteId) {
            dispatch(delete_exclusion(toDeleteId));
            setConfirmOpen(false);
            setToDeleteId(null);
          }
        }}
      />
      {/* Bulk Confirm Delete Modal */}
      <ConfirmModal
        open={bulkConfirmOpen}
        message={`Are you sure you want to delete ${selectedIds.length} exclusions?`}
        onCancel={() => setBulkConfirmOpen(false)}
        onConfirm={() => {
          if (selectedIds.length > 0) {
            dispatch(delete_exclusions(selectedIds)).then(() => {
              setBulkConfirmOpen(false);
              setSelectedIds([]);
            });
          }
        }}
      />
      <div className="mx-auto max-w-7xl">
        {/* Header Section */}
        <HeaderText title="Exclusions Management" />
        {/* Mobile Header */}
        <div className="mb-6 flex items-center justify-between rounded-xl border border-primary-200 bg-white p-6 shadow-nature-soft ring-1 ring-primary-100 lg:hidden">
          <div className="flex items-center space-x-3">
            <div className="shadow-coral-soft rounded-lg bg-gradient-to-r from-secondary to-sunshine-400 p-2">
              <FaList className="text-white" />
            </div>
            <h1 className="text-xl font-bold text-primary-800">
              {exclusionId ? "Edit Exclusion" : "Exclusions"}
            </h1>
          </div>
          <button
            onClick={() => setShow(true)}
            className="shadow-coral-medium hover:shadow-coral-large flex items-center space-x-2 rounded-xl bg-gradient-to-r from-secondary to-sunshine-400 px-4 py-2 text-sm font-semibold text-white transition-all duration-300 hover:scale-105"
          >
            <FaPlus className="text-xs" />
            <span>{exclusionId ? "Edit" : "Add New"}</span>
          </button>
        </div>

        <div className="flex flex-col gap-5 lg:flex-row">
          {/* Main Content */}
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
                      className="rounded-xl bg-gradient-to-r from-accent to-accent-600 px-6 py-2.5 font-semibold text-white shadow-medium transition-all hover:scale-105"
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

              {/* Table Section */}
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
                        Exclusion Name
                      </th>
                      {!isViewer(role) && (
                        <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wider text-primary-700">
                          Actions
                        </th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-primary-100">
                    {exclusions.map((d, i) => (
                      <tr
                        key={i}
                        className="group bg-white transition-colors hover:bg-primary-50/50"
                      >
                        <td className="flex justify-center px-4 py-4">
                          <input
                            type="checkbox"
                            checked={selectedIds.includes(d._id)}
                            onChange={() => handleSelectRow(d._id)}
                            className="h-4 w-4 rounded border-primary-300 text-secondary accent-secondary focus:ring-2 focus:ring-secondary-200"
                          />
                        </td>
                        <td className="px-6 py-4 text-sm font-medium">
                          <div className="shadow-coral-soft flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-r from-secondary to-sunshine-400 font-bold text-white transition-all duration-300 group-hover:scale-110">
                            {i + 1}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-semibold text-primary-800 transition-colors duration-300">
                            {d.name}
                          </span>
                        </td>
                        {!isViewer(role) && (
                          <td className="px-6 py-4">
                            <div className="flex gap-3">
                              <Link
                                to={`/admin/dashboard/edit-exclusion/${d._id}`}
                                className="group/btn shadow-sunshine-soft hover:shadow-sunshine-medium relative overflow-hidden rounded-lg bg-gradient-to-r from-sunshine-400 to-sunshine-500 p-3 text-white transition-all duration-300 hover:scale-110"
                              >
                                <FaEdit className="relative z-10 transition-transform duration-300 group-hover/btn:scale-110" />
                              </Link>
                              <button
                                onClick={() => {
                                  setToDeleteId(d._id);
                                  setConfirmOpen(true);
                                }}
                                className="group/btn relative overflow-hidden rounded-lg bg-gradient-to-r from-accent to-accent-600 p-3 text-white shadow-sm transition-all duration-300 hover:scale-110 hover:shadow-medium"
                              >
                                <FaTrash className="relative z-10 transition-transform duration-300 group-hover/btn:scale-110" />
                              </button>
                            </div>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination Section */}
              <div className="border-t border-primary-200 bg-neutral-50 p-6">
                <div className="flex justify-end">
                  <Pagination
                    pageNumber={currentPage}
                    setPageNumber={setCurrentPage}
                    totalItem={totalExclusions}
                    parPage={parPage}
                    showItem={3}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar Form */}
          {!isViewer(role) && (
            <div
              className={`fixed inset-y-0 right-0 z-50 max-h-max w-full max-w-md transform bg-white shadow-2xl backdrop-blur-xl transition-transform duration-500 ease-out lg:relative lg:z-0 lg:translate-x-0 lg:rounded-2xl lg:bg-white lg:ring-1 lg:ring-primary-100 ${
                show ? "translate-x-0" : "translate-x-full"
              }`}
            >
              <div className="flex flex-col">
                {/* Form Header */}
                <div className="bg-gradient-to-r from-primary via-primary-600 to-primary-700 p-6 lg:rounded-t-2xl">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="rounded-lg bg-white p-2">
                        <FaPlus className="text-lg text-secondary" />
                      </div>
                      <h2 className="text-xl font-bold text-white">
                        {exclusionId ? "Edit Exclusion" : "Add New Exclusion"}
                      </h2>
                    </div>
                    <button
                      onClick={() => setShow(false)}
                      className="rounded-full p-2 text-white/80 transition-all duration-300 hover:bg-white/20 hover:text-white lg:hidden"
                    >
                      <IoCloseCircle className="h-6 w-6" />
                    </button>
                  </div>
                </div>

                {/* Form Content */}
                <div className="flex-1 p-6">
                  <form
                    onSubmit={add_exclusion}
                    className="flex h-full flex-1 flex-col"
                  >
                    <div className="mb-6">
                      <label className="mb-3 block text-sm font-bold text-primary-800">
                        Exclusion Name
                      </label>
                      <div className="relative">
                        <input
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          type="text"
                          className={`w-full rounded-xl border-2 ${
                            errors.name
                              ? "border-accent bg-accent-50 focus:border-accent focus:ring-accent-200"
                              : "border-primary-200 bg-white focus:border-secondary focus:ring-secondary-200"
                          } px-4 py-3.5 text-text-dark transition-all duration-300 placeholder:text-text-light focus:outline-none focus:ring-2`}
                          placeholder="Enter exclusion name (e.g., Airfare, Personal expenses)"
                        />
                        {errors.name && (
                          <div className="absolute -bottom-6 left-0 flex items-center space-x-1 text-accent">
                            <div className="h-1 w-1 rounded-full bg-accent"></div>
                            <p className="text-sm font-medium">{errors.name}</p>
                          </div>
                        )}
                      </div>
                    </div>

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
                        ) : exclusionId ? (
                          "Update Exclusion"
                        ) : (
                          "Add Exclusion"
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}

          {/* Overlay for mobile */}
          {show && (
            <div
              className="fixed inset-0 z-40 bg-primary-900/20 backdrop-blur-sm transition-opacity duration-300 lg:hidden"
              onClick={() => setShow(false)}
            ></div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Exclusions;
