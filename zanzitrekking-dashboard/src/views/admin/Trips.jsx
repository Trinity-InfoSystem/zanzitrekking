"use client";

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import Pagination from "../Pagination";
import {
  FaEdit,
  FaTrash,
  FaPlus,
  FaMapMarkerAlt,
  FaClock,
  FaImage,
} from "react-icons/fa";
import {
  clearMessage,
  delete_trip,
  delete_trips,
  get_trips,
} from "../../store/Reducers/tripReducer";
import Search from "../components/Search";
import toast from "react-hot-toast";
import { PropagateLoader } from "react-spinners";
import { overrideStyle } from "../../utils/utilis";
import HeaderText from "./HeaderText";
import { resolveMediaUrl } from "../../utils/constants";
import { isAdmin, isEditor } from "../../utils/roleVerification";
import SortSelect from "../components/SortSelect";

// ConfirmModal component
const ConfirmModal = ({ open, onConfirm, onCancel, message }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-primary-900/20 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-nature-large ring-1 ring-primary-200">
        <h2 className="mb-4 text-lg font-bold text-accent">Confirm Delete</h2>
        <p className="mb-6 text-text-dark">{message}</p>
        <div className="flex justify-end gap-3">
          <button
            className="rounded-xl bg-neutral-200 px-4 py-2 font-medium text-text-dark transition-all hover:bg-neutral-300"
            onClick={onCancel}
          >
            Cancel
          </button>
          <button
            className="rounded-xl bg-gradient-to-r from-accent to-accent-600 px-4 py-2 font-semibold text-white shadow-sm transition-all hover:scale-105"
            onClick={onConfirm}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

const Trips = () => {
  const dispatch = useDispatch();
  const [parPage, setParPage] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchValue, setSearchValue] = useState("");
  const [sort, setSort] = useState("newest-desc");
  const [selectedIds, setSelectedIds] = useState([]);
  const [bulkConfirmOpen, setBulkConfirmOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [toDeleteId, setToDeleteId] = useState(null);
  const role = useSelector((state) => state.auth?.userInfo?.role);

  const { trips, errorMessage, loader, successMessage, totalTrips } =
    useSelector((state) => state.trip);

  // Checkbox handlers
  const isAllSelected = trips.length > 0 && selectedIds.length === trips.length;
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(trips.map((d) => d._id));
    } else {
      setSelectedIds([]);
    }
  };
  const handleSelectRow = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((sid) => sid !== id) : [...prev, id],
    );
  };
  const deleteTrip = (tripId) => {
    setToDeleteId(tripId);
    setConfirmOpen(true);
  };

  useEffect(() => {
    dispatch(get_trips({ parPage, currentPage, searchValue, sort }));
  }, [dispatch, parPage, currentPage, searchValue, sort]);

  const startIndex = (currentPage - 1) * parPage;

  useEffect(() => {
    if (errorMessage) {
      toast.error(errorMessage);
      dispatch(clearMessage());
    }
    if (successMessage) {
      toast.success(successMessage);
      dispatch(get_trips({ parPage, currentPage, searchValue }));
      dispatch(clearMessage());
    }
  }, [
    errorMessage,
    successMessage,
    dispatch,
    parPage,
    currentPage,
    searchValue,
  ]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-primary-50/30 p-4 md:p-5">
      {/* Confirm Delete Modal */}
      <ConfirmModal
        open={confirmOpen}
        message="Are you sure you want to delete this trip?"
        onCancel={() => {
          setConfirmOpen(false);
          setToDeleteId(null);
        }}
        onConfirm={() => {
          if (toDeleteId) {
            dispatch(delete_trip(toDeleteId));
            setConfirmOpen(false);
            setToDeleteId(null);
          }
        }}
      />
      {/* Bulk Confirm Delete Modal */}
      <ConfirmModal
        open={bulkConfirmOpen}
        message={`Are you sure you want to delete ${selectedIds.length} trips?`}
        onCancel={() => setBulkConfirmOpen(false)}
        onConfirm={() => {
          if (selectedIds.length > 0) {
            dispatch(delete_trips(selectedIds)).then(() => {
              setBulkConfirmOpen(false);
              setSelectedIds([]);
            });
          }
        }}
      />
      <div className="mx-auto max-w-7xl">
        <HeaderText title="Trips Management" />
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center justify-end">
            <Link
              to="/admin/dashboard/add-trip"
              className="shadow-coral-medium hover:shadow-coral-large flex items-center space-x-2 rounded-xl bg-gradient-to-r from-secondary to-sunshine-400 px-6 py-3 font-semibold text-white transition-all duration-300 hover:scale-105"
            >
              <FaPlus className="text-sm" />
              <span>Add New Trip</span>
            </Link>
          </div>
        </div>

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
                  className="rounded-xl bg-gradient-to-r from-accent to-accent-600 px-4 py-2 font-semibold text-white shadow-sm transition-all hover:scale-105"
                  onClick={() => setBulkConfirmOpen(true)}
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
            {loader ? (
              <div className="flex h-64 items-center justify-center">
                <div className="text-center">
                  <div className="mb-4">
                    <PropagateLoader
                      cssOverride={overrideStyle}
                      color="#E76F51"
                      size={15}
                    />
                  </div>
                  <p className="font-medium text-text">Loading trips...</p>
                </div>
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-primary-200 bg-gradient-to-r from-primary-50 to-secondary-50">
                    <th className="px-4 py-4">
                      <input
                        type="checkbox"
                        checked={isAllSelected}
                        onChange={handleSelectAll}
                        className="h-4 w-4 rounded border-primary-300 text-secondary accent-secondary focus:ring-secondary"
                      />
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wider text-primary-700">
                      No
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wider text-primary-700">
                      Image
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wider text-primary-700">
                      Trip Details
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wider text-primary-700">
                      Duration
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wider text-primary-700">
                      Category
                    </th>
                    {isAdmin(role) ||
                      (isEditor(role) && (
                        <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wider text-primary-700">
                          Actions
                        </th>
                      ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-primary-100">
                  {trips.map((trip, i) => {
                    let imageName = trip.mainImage
                      ? resolveMediaUrl(trip.mainImage)
                      : "/placeholder.svg";
                    return (
                      <tr
                        key={trip._id}
                        className="group bg-white transition-colors hover:bg-primary-50/50"
                      >
                        <td className="px-4 py-4">
                          <input
                            type="checkbox"
                            checked={selectedIds.includes(trip._id)}
                            onChange={() => handleSelectRow(trip._id)}
                            className="h-4 w-4 rounded border-primary-300 text-secondary accent-secondary focus:ring-secondary"
                          />
                        </td>
                        <td className="px-6 py-4 text-sm font-medium">
                          <div className="shadow-coral-soft flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-r from-secondary to-sunshine-400 font-bold text-white transition-all duration-300 group-hover:scale-110">
                            {startIndex + i + 1}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="relative">
                            {trip.mainImage ? (
                              <img
                                src={imageName}
                                alt={trip.mainTitle}
                                className="h-16 min-w-16 rounded-xl object-cover shadow-sm ring-2 ring-primary-200 transition-transform duration-300 group-hover:scale-110"
                              />
                            ) : (
                              <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-br from-neutral-100 to-neutral-200 shadow-sm ring-2 ring-primary-200">
                                <FaImage className="text-xl text-neutral-400" />
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="min-w-80 px-6 py-4">
                          <div className="space-y-1">
                            <h3 className="text-lg font-bold text-primary-800 transition-colors duration-300">
                              {trip.mainTitle}
                            </h3>
                            {trip.mainDestination && (
                              <div className="flex items-center space-x-1 text-text">
                                <FaMapMarkerAlt className="text-xs text-secondary" />
                                <span className="text-sm">
                                  {trip.mainDestination?.name}
                                </span>
                              </div>
                            )}
                            <div className="mt-2 flex flex-wrap gap-2">
                              <span className="rounded-full bg-info-100 px-2 py-1 text-xs font-semibold text-info-700">
                                Budget
                              </span>
                              <span className="rounded-full bg-success-100 px-2 py-1 text-xs font-semibold text-success-700">
                                Mid-Range
                              </span>
                              <span className="rounded-full bg-secondary-100 px-2 py-1 text-xs font-semibold text-secondary-700">
                                Luxury
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            <div className="shadow-coral-soft rounded-lg bg-gradient-to-r from-secondary to-sunshine-400 p-2">
                              <FaClock className="text-sm text-white" />
                            </div>
                            <div>
                              <span className="font-semibold text-primary-800">
                                {trip.days.length === 1
                                  ? "1 day"
                                  : `${trip.days.length} days`}
                              </span>
                              <p className="text-xs text-text-light">
                                {trip.days.length === 1
                                  ? "Single day trip"
                                  : "Multi-day adventure"}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-block whitespace-nowrap rounded-full bg-info-100 px-2 py-1 text-xs font-semibold text-info-700">
                            {trip.category?.name || "N/A"}
                          </span>
                        </td>
                        {isAdmin(role) || isEditor(role) ? (
                          <td className="px-6 py-4">
                            <div className="flex gap-3">
                              <Link
                                to={`/admin/dashboard/edit-trip/${trip._id}`}
                                className="shadow-sunshine-soft hover:shadow-sunshine-medium group/btn relative overflow-hidden rounded-lg bg-gradient-to-r from-sunshine-400 to-sunshine-500 p-3 text-white transition-all duration-300 hover:scale-110"
                              >
                                <FaEdit className="relative z-10 transition-transform duration-300 group-hover/btn:scale-110" />
                              </Link>
                              <button
                                onClick={() => deleteTrip(trip._id)}
                                className="group/btn relative overflow-hidden rounded-lg bg-gradient-to-r from-accent to-accent-600 p-3 text-white shadow-sm transition-all duration-300 hover:scale-110"
                              >
                                <FaTrash className="relative z-10 transition-transform duration-300 group-hover/btn:scale-110" />
                              </button>
                            </div>
                          </td>
                        ) : null}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          {/* Pagination Section */}
          <div className="border-t border-primary-200 bg-neutral-50 p-6">
            <div className="flex justify-end">
              <Pagination
                pageNumber={currentPage}
                setPageNumber={setCurrentPage}
                totalItem={totalTrips}
                parPage={parPage}
                showItem={3}
              />
            </div>
          </div>
        </div>

        {/* Empty State */}
        {!loader && trips.length === 0 && (
          <div className="mt-8 text-center">
            <div className="rounded-2xl bg-white p-12 shadow-nature-medium ring-1 ring-primary-100">
              <div className="shadow-coral-soft mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-r from-secondary to-sunshine-400">
                <FaMapMarkerAlt className="text-3xl text-white" />
              </div>
              <h3 className="mb-2 text-2xl font-bold text-primary-800">
                No trips found
              </h3>
              <p className="mx-auto mb-6 max-w-md text-text">
                {searchValue
                  ? `No trips match your search for "${searchValue}"`
                  : "Start creating amazing travel experiences for your customers"}
              </p>
              <Link
                to="/admin/dashboard/add-trip"
                className="shadow-coral-medium hover:shadow-coral-large inline-flex items-center space-x-2 rounded-xl bg-gradient-to-r from-secondary to-sunshine-400 px-6 py-3 font-semibold text-white transition-all duration-300 hover:scale-105 focus:outline-none"
              >
                <FaPlus className="text-sm" />
                <span>Create Your First Trip</span>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Trips;
