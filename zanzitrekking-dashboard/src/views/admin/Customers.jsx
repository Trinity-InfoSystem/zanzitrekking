"use client";

import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  FaSearch,
  FaChevronDown,
  FaEye,
  FaTimes,
  FaComment,
} from "react-icons/fa";
import { FixedSizeList as List } from "react-window";
import HeaderText from "./HeaderText";
import Pagination from "../Pagination";
import {
  getCustomers,
  getCustomer,
} from "../../store/Reducers/customerReducer";
import { Link, useNavigate } from "react-router-dom";
import { get_active_customers_with_new_customer } from "../../store/Reducers/chatReducer";
import CustomerModal from "./CustomerModal";
import CustomerSearchBar from "./CustomerSearchBar";
import CustomerTable from "./CustomerTable";
import { isAdmin, isEditor } from "../../utils/roleVerification";
import SortSelect from "../components/SortSelect";

const Customers = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [parPage, setParPage] = useState(5);
  const [searchValue, setSearchValue] = useState("");
  const [sort, setSort] = useState("newest-desc");
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const { customers, totalCustomers, loading, currentCustomer } = useSelector(
    (state) => state.customer,
  );

  const role = useSelector((state) => state.auth?.userInfo?.role);

  useEffect(() => {
    dispatch(getCustomers({ parPage, currentPage, searchValue, sort }));
  }, [dispatch, currentPage, parPage, searchValue, sort]);

  const handleViewCustomer = (customerId) => {
    dispatch(getCustomer(customerId)).then(() => {
      setSelectedCustomer(currentCustomer);
      setShowModal(true);
    });
  };

  const handleStartChat = (customerId) => {
    dispatch(get_active_customers_with_new_customer(customerId)).then(() => {
      navigate(`/admin/dashboard/chat-customer?customerId=${customerId}`);
    });
  };

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
        <HeaderText title="Customers Management" />
        <CustomerModal
          showModal={showModal}
          selectedCustomer={selectedCustomer}
          onClose={() => setShowModal(false)}
        />
        <div className="overflow-hidden rounded-2xl bg-white shadow-nature-medium ring-1 ring-primary-100">
          {/* Search and Filter Section */}
          <div className="border-b border-primary-200 bg-gradient-to-r from-primary-50 to-secondary-50 p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <CustomerSearchBar
                parPage={parPage}
                setParPage={setParPage}
                setCurrentPage={setCurrentPage}
                searchValue={searchValue}
                setSearchValue={setSearchValue}
              />
              <SortSelect sort={sort} setSort={setSort} />
            </div>
          </div>
          {/* Table Header */}
          <div className="hidden border-b border-primary-200 bg-gradient-to-r from-primary-50 to-secondary-50 px-4 py-3 md:block">
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-1 text-sm font-bold text-primary-700">
                #
              </div>
              <div className="col-span-3 text-sm font-bold text-primary-700">
                Customer
              </div>
              <div className="col-span-3 text-sm font-bold text-primary-700">
                Email
              </div>
              <div className="col-span-2 text-sm font-bold text-primary-700">
                Assigned Admin
              </div>
              {isAdmin(role) === "admin" && (
                <div className="col-span-2 text-sm font-bold text-primary-700">
                  Actions
                </div>
              )}
            </div>
          </div>
          {/* Table/List Section */}
          <CustomerTable
            customers={customers}
            currentPage={currentPage}
            parPage={parPage}
            handleViewCustomer={handleViewCustomer}
            handleStartChat={handleStartChat}
            showActions={isAdmin(role)}
          />
          {/* Pagination */}
          {customers.length > 0 && (
            <div className="border-t border-primary-200 bg-neutral-50 p-4">
              <div className="flex items-center justify-between">
                <div className="text-sm text-text-dark">
                  Showing{" "}
                  <span className="font-medium text-secondary">
                    {(currentPage - 1) * parPage + 1}
                  </span>{" "}
                  to{" "}
                  <span className="font-medium text-secondary">
                    {Math.min(currentPage * parPage, totalCustomers)}
                  </span>{" "}
                  of{" "}
                  <span className="font-medium text-secondary">
                    {totalCustomers}
                  </span>{" "}
                  customers
                </div>
                <Pagination
                  pageNumber={currentPage}
                  setPageNumber={setCurrentPage}
                  totalItem={totalCustomers}
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

export default Customers;
