"use client";

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import Pagination from "../Pagination";
import {
  FaEdit,
  FaTrash,
  FaPlus,
  FaImage,
  FaStar,
  FaEye,
  FaEyeSlash,
} from "react-icons/fa";
import {
  clearMessage,
  delete_partner,
  delete_partners,
  get_partners,
  toggle_partner_status,
} from "../../store/Reducers/partnerReducer";
import Search from "../components/Search";
import toast from "react-hot-toast";
import { PropagateLoader } from "react-spinners";
import { overrideStyle } from "../../utils/utilis";
import HeaderText from "./HeaderText";
import { IMAGES_URL } from "../../utils/constants";
import { isAdmin, isEditor } from "../../utils/roleVerification";

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

const Partners = () => {
  const dispatch = useDispatch();
  const [parPage, setParPage] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchValue, setSearchValue] = useState("");
  const [selectedIds, setSelectedIds] = useState([]);
  const [bulkConfirmOpen, setBulkConfirmOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [toDeleteId, setToDeleteId] = useState(null);
  const role = useSelector((state) => state.auth?.userInfo?.role);

  const { partners, errorMessage, loader, successMessage, totalPartners } =
    useSelector((state) => state.partner);

  // Checkbox handlers
  const isAllSelected =
    partners.length > 0 && selectedIds.length === partners.length;
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(partners.map((d) => d._id));
    } else {
      setSelectedIds([]);
    }
  };
  const handleSelectRow = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((sid) => sid !== id) : [...prev, id],
    );
  };
  const deletePartner = (partnerId) => {
    setToDeleteId(partnerId);
    setConfirmOpen(true);
  };

  useEffect(() => {
    dispatch(get_partners({ parPage, currentPage, searchValue }));
  }, [dispatch, parPage, currentPage, searchValue]);

  const startIndex = (currentPage - 1) * parPage;

  useEffect(() => {
    if (errorMessage) {
      toast.error(errorMessage);
      dispatch(clearMessage());
    }
    if (successMessage) {
      toast.success(successMessage);
      dispatch(get_partners({ parPage, currentPage, searchValue }));
    }
  }, [
    errorMessage,
    successMessage,
    dispatch,
    parPage,
    currentPage,
    searchValue,
  ]);

  const handleDelete = () => {
    dispatch(delete_partner(toDeleteId));
    setConfirmOpen(false);
    setToDeleteId(null);
  };

  const handleBulkDelete = () => {
    dispatch(delete_partners(selectedIds));
    setBulkConfirmOpen(false);
    setSelectedIds([]);
  };

  const handleToggleStatus = (partnerId) => {
    dispatch(toggle_partner_status(partnerId));
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <FaStar
        key={i}
        className={`h-3 w-3 ${
          i < Math.floor(rating) ? "text-yellow-400" : "text-gray-300"
        }`}
      />
    ));
  };

  const getBadgeColor = (color) => {
    const colorMap = {
      "from-red-500 to-pink-500": "bg-gradient-to-r from-red-500 to-pink-500",
      "from-blue-500 to-cyan-500": "bg-gradient-to-r from-blue-500 to-cyan-500",
      "from-green-500 to-emerald-500":
        "bg-gradient-to-r from-green-500 to-emerald-500",
      "from-purple-500 to-violet-500":
        "bg-gradient-to-r from-purple-500 to-violet-500",
      "from-orange-500 to-amber-500":
        "bg-gradient-to-r from-orange-500 to-amber-500",
      "from-teal-500 to-cyan-500": "bg-gradient-to-r from-teal-500 to-cyan-500",
    };
    return colorMap[color] || "bg-gradient-to-r from-gray-500 to-gray-600";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-primary-50/30 px-2 py-5 lg:px-7">
      <div className="w-full rounded-2xl bg-white p-6 shadow-nature-medium ring-1 ring-primary-100">
        <HeaderText title="Partners" />
        <div className="mt-4 flex items-center justify-between">
          <Search
            setSearchValue={setSearchValue}
            searchValue={searchValue}
            placeholder="Search by partner name..."
          />
          <div className="flex items-center gap-3">
            <select
              onChange={(e) => setParPage(Number(e.target.value))}
              className="rounded-xl border-2 border-primary-200 bg-white px-4 py-2 text-text-dark outline-none focus:border-secondary focus:ring-2 focus:ring-secondary-200"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
            </select>
            {(isAdmin(role) || isEditor(role)) && (
              <Link
                to="/admin/dashboard/partners/add"
                className="shadow-coral-medium hover:shadow-coral-large flex items-center gap-2 rounded-xl bg-gradient-to-r from-secondary to-sunshine-400 px-4 py-2 font-semibold text-white transition-all hover:scale-105"
              >
                <FaPlus /> Add Partner
              </Link>
            )}
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedIds.length > 0 && (isAdmin(role) || isEditor(role)) && (
          <div className="mt-4 flex items-center gap-3">
            <button
              onClick={() => setBulkConfirmOpen(true)}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-accent to-accent-600 px-4 py-2 font-semibold text-white shadow-sm transition-all hover:scale-105"
            >
              <FaTrash /> Delete Selected ({selectedIds.length})
            </button>
          </div>
        )}

        <div className="relative mt-5 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-primary-200 bg-gradient-to-r from-primary-50 to-secondary-50 text-xs uppercase">
              <tr>
                {(isAdmin(role) || isEditor(role)) && (
                  <th scope="col" className="p-3">
                    <div className="flex items-center">
                      <input
                        id="checkbox-all"
                        type="checkbox"
                        checked={isAllSelected}
                        onChange={handleSelectAll}
                        className="h-4 w-4 rounded border-primary-300 bg-white text-secondary accent-secondary focus:ring-secondary"
                      />
                    </div>
                  </th>
                )}
                <th scope="col" className="p-3 font-bold text-primary-700">
                  Logo
                </th>
                <th scope="col" className="p-3 font-bold text-primary-700">
                  Name
                </th>
                <th scope="col" className="p-3 font-bold text-primary-700">
                  Badge
                </th>
                <th scope="col" className="p-3 font-bold text-primary-700">
                  Rating
                </th>
                <th scope="col" className="p-3 font-bold text-primary-700">
                  Reviews
                </th>
                <th scope="col" className="p-3 font-bold text-primary-700">
                  Status
                </th>
                <th scope="col" className="p-3 font-bold text-primary-700">
                  Order
                </th>
                {(isAdmin(role) || isEditor(role)) && (
                  <th scope="col" className="p-3 font-bold text-primary-700">
                    Action
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {loader ? (
                <tr>
                  <td
                    colSpan={isAdmin(role) || isEditor(role) ? 9 : 7}
                    className="p-4"
                  >
                    <div className="flex items-center justify-center">
                      <PropagateLoader
                        color="#fff"
                        cssOverride={overrideStyle}
                      />
                    </div>
                  </td>
                </tr>
              ) : partners.length > 0 ? (
                partners.map((partner, index) => (
                  <tr
                    key={partner._id}
                    className="group border-b border-primary-100 transition-colors hover:bg-primary-50/50"
                  >
                    {(isAdmin(role) || isEditor(role)) && (
                      <td className="p-3">
                        <div className="flex items-center">
                          <input
                            id={`checkbox-${partner._id}`}
                            type="checkbox"
                            checked={selectedIds.includes(partner._id)}
                            onChange={() => handleSelectRow(partner._id)}
                            className="h-4 w-4 rounded border-primary-300 bg-white text-secondary accent-secondary focus:ring-secondary"
                          />
                        </div>
                      </td>
                    )}
                    <td className="p-3">
                      <div className="h-12 w-12 overflow-hidden rounded-lg ring-2 ring-primary-200">
                        {partner.logo ? (
                          <img
                            src={partner.logo}
                            alt={partner.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-neutral-100">
                            <FaImage className="text-neutral-400" />
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="p-3">
                      <div>
                        <h5 className="font-semibold text-primary-800">
                          {partner.name}
                        </h5>
                        {partner.website && (
                          <p className="text-xs text-text-light">
                            {partner.website}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="p-3">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold text-white shadow-soft ${getBadgeColor(
                          partner.color,
                        )}`}
                      >
                        {partner.badge}
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-1">
                        <div className="flex gap-0.5">
                          {renderStars(partner.rating)}
                        </div>
                        <span className="ml-1 text-sm font-bold text-sunshine-600">
                          {partner.rating}
                        </span>
                      </div>
                    </td>
                    <td className="p-3">
                      <span className="text-sm text-text">
                        {partner.reviews} reviews
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            partner.isActive
                              ? "bg-success-100 text-success-700"
                              : "bg-accent-100 text-accent-700"
                          }`}
                        >
                          {partner.isActive ? "Active" : "Inactive"}
                        </span>
                        {(isAdmin(role) || isEditor(role)) && (
                          <button
                            onClick={() => handleToggleStatus(partner._id)}
                            className="text-text-light transition-colors hover:text-secondary"
                            title={partner.isActive ? "Deactivate" : "Activate"}
                          >
                            {partner.isActive ? <FaEyeSlash /> : <FaEye />}
                          </button>
                        )}
                      </div>
                    </td>
                    <td className="p-3">
                      <span className="text-sm font-medium text-text-dark">
                        {partner.order}
                      </span>
                    </td>
                    {(isAdmin(role) || isEditor(role)) && (
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <Link
                            to={`/admin/dashboard/partners/edit/${partner._id}`}
                            className="shadow-sunshine-soft hover:shadow-sunshine-medium rounded-lg bg-gradient-to-r from-sunshine-400 to-sunshine-500 p-2 text-white transition-all hover:scale-110"
                            title="Edit"
                          >
                            <FaEdit />
                          </Link>
                          <button
                            onClick={() => deletePartner(partner._id)}
                            className="rounded-lg bg-gradient-to-r from-accent to-accent-600 p-2 text-white shadow-sm transition-all hover:scale-110"
                            title="Delete"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={isAdmin(role) || isEditor(role) ? 9 : 7}
                    className="p-8 text-center"
                  >
                    <div className="text-text-light">No partners found</div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {totalPartners > parPage && (
          <div className="bottom-4 right-4 mt-4 flex w-full justify-end">
            <Pagination
              pageNumber={currentPage}
              setPageNumber={setCurrentPage}
              totalItem={totalPartners}
              parPage={parPage}
              showItem={3}
            />
          </div>
        )}
      </div>

      {/* Confirmation Modals */}
      <ConfirmModal
        open={confirmOpen}
        onConfirm={handleDelete}
        onCancel={() => setConfirmOpen(false)}
        message="Are you sure you want to delete this partner? This action cannot be undone."
      />

      <ConfirmModal
        open={bulkConfirmOpen}
        onConfirm={handleBulkDelete}
        onCancel={() => setBulkConfirmOpen(false)}
        message={`Are you sure you want to delete ${selectedIds.length} selected partners? This action cannot be undone.`}
      />
    </div>
  );
};

export default Partners;
