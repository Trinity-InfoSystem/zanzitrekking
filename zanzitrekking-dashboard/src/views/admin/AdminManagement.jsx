"use client";

import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
// Icons are used in child components
import HeaderText from "./HeaderText";
import Pagination from "../Pagination";
import {
  get_all_admins,
  update_admin_access_routes,
  create_admin,
  delete_admin,
  clearMessage,
} from "../../store/Reducers/authReducer";
import AdminModal from "./AdminModal";
import AdminSearchBar from "./AdminSearchBar";
import AdminTable from "./AdminTable";
import RoleSelectionModal from "./RoleSelectionModal";
import AddAdminModal from "./AddAdminModal";
import { canAdmin, canWrite } from "../../utils/routeAccess";
import { useNavigate } from "react-router-dom";

const AdminManagement = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [parPage, setParPage] = useState(5);
  const [searchValue, setSearchValue] = useState("");
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [adminToUpdate, setAdminToUpdate] = useState(null);
  const [adminToDelete, setAdminToDelete] = useState(null);

  const { allAdmins, loading, successMessage, errorMessage, userInfo } =
    useSelector((state) => state.auth);
  const role = useSelector((state) => state.auth?.userInfo?.role);

  // Filter admins based on search
  const filteredAdmins = allAdmins?.filter(
    (admin) =>
      admin.name.toLowerCase().includes(searchValue.toLowerCase()) ||
      admin.email.toLowerCase().includes(searchValue.toLowerCase()) ||
      admin.role.toLowerCase().includes(searchValue.toLowerCase()),
  );

  // Pagination
  const totalAdmins = filteredAdmins?.length;
  const startIndex = (currentPage - 1) * parPage;
  const endIndex = startIndex + parPage;
  const paginatedAdmins = filteredAdmins?.slice(startIndex, endIndex);

  useEffect(() => {
    if (!allAdmins) {
      dispatch(get_all_admins());
    }
  }, [dispatch, allAdmins]);

  const handleViewAdmin = (admin) => {
    setSelectedAdmin(admin);
    setShowModal(true);
  };

  const handleEditAdmin = (admin) => {
    setAdminToUpdate(admin);
    setShowRoleModal(true);
  };

  const handleUpdateRole = (accessRoutes) => {
    if (adminToUpdate) {
      dispatch(
        update_admin_access_routes({
          id: adminToUpdate._id,
          accessRoutes,
        }),
      ).then(() => {
        setShowRoleModal(false);
        setAdminToUpdate(null);
        // Refresh admin list
        dispatch(get_all_admins());
      });
    }
  };

  const handleCreateAdmin = (adminData) => {
    dispatch(create_admin(adminData)).then(() => {
      setShowAddModal(false);
      // Refresh admin list
      dispatch(get_all_admins());
    });
  };

  const handleDeleteAdmin = (admin) => {
    setAdminToDelete(admin);
    setShowDeleteModal(true);
  };

  const confirmDeleteAdmin = () => {
    if (adminToDelete) {
      dispatch(
        delete_admin({
          adminId: adminToDelete._id,
          currentAdminId: userInfo?._id,
        }),
      ).then(() => {
        setShowDeleteModal(false);
        setAdminToDelete(null);
        // Refresh admin list
        dispatch(get_all_admins());
      });
    }
  };

  const cancelDeleteAdmin = () => {
    setShowDeleteModal(false);
    setAdminToDelete(null);
  };

  const handleChatAdmin = (admin) => {
    // Navigate to admin chat with the selected admin
    navigate(`/admin/dashboard/chat-admin?adminId=${admin._id}`);
  };

  // Clear messages after 3 seconds
  useEffect(() => {
    if (successMessage || errorMessage) {
      const timer = setTimeout(() => {
        dispatch(clearMessage());
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage, errorMessage, dispatch]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-neutral-50 via-white to-primary-50/30">
        <div className="shadow-coral-soft h-12 w-12 animate-spin rounded-full border-4 border-secondary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-primary-50/30 p-4 md:p-5">
      <div className="max-w-8xl mx-auto">
        {/* Success/Error Messages */}
        {successMessage && (
          <div className="mb-4 rounded-xl bg-success-50 p-4 ring-1 ring-success-200">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-success"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-success-700">
                  {successMessage}
                </p>
              </div>
            </div>
          </div>
        )}

        {errorMessage && (
          <div className="mb-4 rounded-xl bg-accent-50 p-4 ring-1 ring-accent-200">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-accent"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-accent-700">
                  {errorMessage}
                </p>
              </div>
            </div>
          </div>
        )}

        <AdminModal
          showModal={showModal}
          selectedAdmin={selectedAdmin}
          onClose={() => setShowModal(false)}
        />

        <RoleSelectionModal
          showModal={showRoleModal}
          adminToUpdate={adminToUpdate}
          onClose={() => {
            setShowRoleModal(false);
            setAdminToUpdate(null);
          }}
          onUpdate={handleUpdateRole}
        />

        <AddAdminModal
          showModal={showAddModal}
          onClose={() => setShowAddModal(false)}
          onSubmit={handleCreateAdmin}
          loading={loading}
        />

        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-screen items-center justify-center px-4 pb-20 pt-4 text-center sm:block sm:p-0">
              <div className="fixed inset-0 bg-primary-900/20 backdrop-blur-sm transition-opacity"></div>
              <span className="hidden sm:inline-block sm:h-screen sm:align-middle">
                &#8203;
              </span>
              <div className="inline-block transform overflow-hidden rounded-2xl bg-white text-left align-bottom shadow-2xl ring-1 ring-primary-100 transition-all sm:my-8 sm:w-full sm:max-w-lg sm:align-middle">
                <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                  <div className="sm:flex sm:items-start">
                    <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-accent-50 sm:mx-0 sm:h-10 sm:w-10">
                      <svg
                        className="h-6 w-6 text-accent"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth="1.5"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                        />
                      </svg>
                    </div>
                    <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                      <h3 className="text-lg font-bold leading-6 text-primary-800">
                        Delete Admin
                      </h3>
                      <div className="mt-2">
                        <p className="text-sm text-text-dark">
                          Are you sure you want to delete{" "}
                          <strong className="text-accent">
                            {adminToDelete?.name}
                          </strong>
                          ? This action will permanently delete the admin
                          account and all associated data including:
                        </p>
                        <ul className="mt-2 list-inside list-disc text-sm text-text-light">
                          <li>All chat messages</li>
                          <li>Admin notes in orders</li>
                          <li>All other related data</li>
                        </ul>
                        <p className="mt-2 text-sm font-medium text-accent">
                          This action cannot be undone.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-neutral-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                  <button
                    type="button"
                    className="inline-flex w-full justify-center rounded-xl bg-gradient-to-r from-accent to-accent-600 px-4 py-2 text-base font-semibold text-white shadow-medium transition-all hover:scale-105 focus:outline-none focus:ring-2 focus:ring-accent-200 sm:ml-3 sm:w-auto sm:text-sm"
                    onClick={confirmDeleteAdmin}
                  >
                    Delete Admin
                  </button>
                  <button
                    type="button"
                    className="mt-3 inline-flex w-full justify-center rounded-xl bg-neutral-200 px-4 py-2 text-base font-medium text-text-dark shadow-sm transition-colors hover:bg-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary-200 sm:ml-3 sm:mt-0 sm:w-auto sm:text-sm"
                    onClick={cancelDeleteAdmin}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Role Test Component - Remove this after testing */}
        {/* <RoleTestComponent /> */}

        <div className="overflow-hidden rounded-2xl bg-white shadow-nature-medium ring-1 ring-primary-100">
          <div className="bg-gradient-to-r from-primary via-primary-600 to-primary-700 px-6 py-5">
            <div className="flex items-center justify-between">
              <h4 className="text-2xl font-bold text-white">
                Admin Management
              </h4>
              {canAdmin(role) && (
                <button
                  onClick={() => setShowAddModal(true)}
                  className="shadow-coral-medium hover:shadow-coral-large inline-flex items-center rounded-xl bg-gradient-to-r from-secondary to-sunshine-400 px-4 py-2.5 text-sm font-semibold text-white transition-all hover:scale-105 focus:outline-none focus:ring-2 focus:ring-secondary-200"
                >
                  <svg
                    className="mr-2 h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                  Add Admin
                </button>
              )}
            </div>
          </div>

          {/* Search and Filter Section */}
          <AdminSearchBar
            parPage={parPage}
            setParPage={setParPage}
            setCurrentPage={setCurrentPage}
            searchValue={searchValue}
            setSearchValue={setSearchValue}
          />

          {/* Table Container with Single Scrollbar */}
          <div className="overflow-x-auto">
            <div className="min-w-[1000px]">
              {/* Table Header */}
              <div className="border-b border-primary-200 bg-gradient-to-r from-primary-50 to-secondary-50 px-4 py-3">
                <div className="grid grid-cols-12 gap-4">
                  <div className="col-span-1 text-sm font-bold text-primary-700">
                    #
                  </div>
                  <div className="col-span-2 text-sm font-bold text-primary-700">
                    Admin
                  </div>
                  <div className="col-span-3 text-sm font-bold text-primary-700">
                    Email
                  </div>
                  <div className="col-span-2 text-sm font-bold text-primary-700">
                    Role
                  </div>
                  <div className="col-span-2 text-sm font-bold text-primary-700">
                    Access Routes
                  </div>
                  {canWrite(role) && (
                    <div className="col-span-2 text-sm font-bold text-primary-700">
                      Actions
                    </div>
                  )}
                </div>
              </div>

              {/* Table/List Section */}
              <AdminTable
                admins={paginatedAdmins}
                currentPage={currentPage}
                parPage={parPage}
                handleViewAdmin={handleViewAdmin}
                handleEditAdmin={handleEditAdmin}
                handleDeleteAdmin={handleDeleteAdmin}
                handleChatAdmin={handleChatAdmin}
                showActions={canWrite(role)}
                userRole={role}
                currentAdminId={userInfo?._id}
              />
            </div>
          </div>

          {/* Pagination */}
          {paginatedAdmins?.length > 0 && (
            <div className="border-t border-primary-200 bg-neutral-50 p-4">
              <div className="flex items-center justify-between">
                <div className="text-sm text-text-dark">
                  Showing{" "}
                  <span className="font-medium text-secondary">
                    {startIndex + 1}
                  </span>{" "}
                  to{" "}
                  <span className="font-medium text-secondary">
                    {Math.min(endIndex, totalAdmins)}
                  </span>{" "}
                  of{" "}
                  <span className="font-medium text-secondary">
                    {totalAdmins}
                  </span>{" "}
                  admins
                </div>
                <Pagination
                  pageNumber={currentPage}
                  setPageNumber={setCurrentPage}
                  totalItem={totalAdmins}
                  parPage={parPage}
                  showItem={3}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminManagement;
