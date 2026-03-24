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
  FaEye,
  FaEyeSlash,
} from "react-icons/fa";
import {
  clearMessage,
  delete_client,
  delete_clients,
  get_clients,
  toggle_client_status,
} from "../../store/Reducers/clientReducer";
import Search from "../components/Search";
import toast from "react-hot-toast";
import { PropagateLoader } from "react-spinners";
import { overrideStyle } from "../../utils/utilis";
import HeaderText from "./HeaderText";
import { resolveMediaUrl } from "../../utils/constants";
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

const Clients = () => {
  const dispatch = useDispatch();
  const [parPage, setParPage] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchValue, setSearchValue] = useState("");
  const [selectedIds, setSelectedIds] = useState([]);
  const [bulkConfirmOpen, setBulkConfirmOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [toDeleteId, setToDeleteId] = useState(null);
  const role = useSelector((state) => state.auth?.userInfo?.role);

  const { clients, errorMessage, loader, successMessage, totalClients } =
    useSelector((state) => state.client);

  // Checkbox handlers
  const isAllSelected =
    clients.length > 0 && selectedIds.length === clients.length;
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(clients.map((d) => d._id));
    } else {
      setSelectedIds([]);
    }
  };
  const handleSelectRow = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((sid) => sid !== id) : [...prev, id],
    );
  };
  const deleteClient = (clientId) => {
    setToDeleteId(clientId);
    setConfirmOpen(true);
  };

  useEffect(() => {
    dispatch(get_clients({ parPage, currentPage, searchValue }));
  }, [dispatch, parPage, currentPage, searchValue]);

  useEffect(() => {
    if (errorMessage) {
      toast.error(errorMessage);
      dispatch(clearMessage());
    }
    if (successMessage) {
      toast.success(successMessage);
      dispatch(get_clients({ parPage, currentPage, searchValue }));
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
    dispatch(delete_client(toDeleteId));
    setConfirmOpen(false);
    setToDeleteId(null);
  };

  const handleBulkDelete = () => {
    dispatch(delete_clients(selectedIds));
    setBulkConfirmOpen(false);
    setSelectedIds([]);
  };

  const handleToggleStatus = (clientId) => {
    dispatch(toggle_client_status(clientId));
  };

  const getLogoUrl = (client) => {
    if (client.logo) return resolveMediaUrl(client.logo);
    if (client.logoUrl) return resolveMediaUrl(client.logoUrl);
    return null;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-primary-50/30 px-2 py-5 lg:px-7">
      <div className="w-full rounded-2xl bg-white p-6 shadow-nature-medium ring-1 ring-primary-100">
        <HeaderText title="Clients" />
        <div className="mt-4 flex items-center justify-between">
          <Search
            setSearchValue={setSearchValue}
            searchValue={searchValue}
            placeholder="Search by client name..."
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
                to="/admin/dashboard/clients/add"
                className="shadow-coral-medium hover:shadow-coral-large flex items-center gap-2 rounded-xl bg-gradient-to-r from-secondary to-sunshine-400 px-4 py-2 font-semibold text-white transition-all hover:scale-105"
              >
                <FaPlus /> Add Client
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
                  Website
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
                    colSpan={isAdmin(role) || isEditor(role) ? 7 : 5}
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
              ) : clients.length > 0 ? (
                clients.map((client, index) => {
                  const logoUrl = getLogoUrl(client);
                  return (
                    <tr
                      key={client._id}
                      className="group border-b border-primary-100 transition-colors hover:bg-primary-50/50"
                    >
                      {(isAdmin(role) || isEditor(role)) && (
                        <td className="p-3">
                          <div className="flex items-center">
                            <input
                              id={`checkbox-${client._id}`}
                              type="checkbox"
                              checked={selectedIds.includes(client._id)}
                              onChange={() => handleSelectRow(client._id)}
                              className="h-4 w-4 rounded border-primary-300 bg-white text-secondary accent-secondary focus:ring-secondary"
                            />
                          </div>
                        </td>
                      )}
                      <td className="p-3">
                        <div className="h-12 w-12 overflow-hidden rounded-lg ring-2 ring-primary-200">
                          {logoUrl ? (
                            <img
                              src={logoUrl}
                              alt={client.name}
                              className="h-full w-full object-contain"
                              onError={(e) => {
                                e.target.style.display = "none";
                                e.target.nextSibling.style.display = "flex";
                              }}
                            />
                          ) : null}
                          <div
                            className="flex h-full w-full items-center justify-center bg-neutral-100"
                            style={{ display: logoUrl ? "none" : "flex" }}
                          >
                            <FaImage className="text-neutral-400" />
                          </div>
                        </div>
                      </td>
                      <td className="p-3">
                        <div>
                          <h5 className="font-semibold text-primary-800">
                            {client.name}
                          </h5>
                        </div>
                      </td>
                      <td className="p-3">
                        {client.website ? (
                          <a
                            href={client.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-secondary-600 hover:underline"
                          >
                            {client.website}
                          </a>
                        ) : (
                          <span className="text-sm text-text-light">N/A</span>
                        )}
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold ${
                              client.isActive
                                ? "bg-success-100 text-success-700"
                                : "bg-accent-100 text-accent-700"
                            }`}
                          >
                            {client.isActive ? "Active" : "Inactive"}
                          </span>
                          {(isAdmin(role) || isEditor(role)) && (
                            <button
                              onClick={() => handleToggleStatus(client._id)}
                              className="text-text-light transition-colors hover:text-secondary"
                              title={client.isActive ? "Deactivate" : "Activate"}
                            >
                              {client.isActive ? <FaEyeSlash /> : <FaEye />}
                            </button>
                          )}
                        </div>
                      </td>
                      <td className="p-3">
                        <span className="text-sm font-medium text-text-dark">
                          {client.order}
                        </span>
                      </td>
                      {(isAdmin(role) || isEditor(role)) && (
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <Link
                              to={`/admin/dashboard/clients/edit/${client._id}`}
                              className="shadow-sunshine-soft hover:shadow-sunshine-medium rounded-lg bg-gradient-to-r from-sunshine-400 to-sunshine-500 p-2 text-white transition-all hover:scale-110"
                              title="Edit"
                            >
                              <FaEdit />
                            </Link>
                            <button
                              onClick={() => deleteClient(client._id)}
                              className="rounded-lg bg-gradient-to-r from-accent to-accent-600 p-2 text-white shadow-sm transition-all hover:scale-110"
                              title="Delete"
                            >
                              <FaTrash />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan={isAdmin(role) || isEditor(role) ? 7 : 5}
                    className="p-8 text-center"
                  >
                    <div className="text-text-light">No clients found</div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {totalClients > parPage && (
          <div className="bottom-4 right-4 mt-4 flex w-full justify-end">
            <Pagination
              pageNumber={currentPage}
              setPageNumber={setCurrentPage}
              totalItem={totalClients}
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
        message="Are you sure you want to delete this client? This action cannot be undone."
      />

      <ConfirmModal
        open={bulkConfirmOpen}
        onConfirm={handleBulkDelete}
        onCancel={() => setBulkConfirmOpen(false)}
        message={`Are you sure you want to delete ${selectedIds.length} selected clients? This action cannot be undone.`}
      />
    </div>
  );
};

export default Clients;

