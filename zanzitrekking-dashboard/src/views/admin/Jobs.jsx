"use client";

import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Pagination from "../Pagination";
import {
  FaEdit,
  FaTrash,
  FaSearch,
  FaPlus,
  FaToggleOn,
  FaToggleOff,
} from "react-icons/fa";
import { PropagateLoader } from "react-spinners";
import { overrideStyle } from "../../utils/utilis";
import { useDispatch, useSelector } from "react-redux";
import {
  jobDelete,
  clearMessage,
  get_jobs,
  toggle_job_status,
} from "../../store/Reducers/jobReducer";
import toast from "react-hot-toast";
import HeaderText from "./HeaderText";
import ConfirmModal from "./ConfirmModal";
import SortSelect from "../components/SortSelect";
import { isAdmin, isEditor } from "../../utils/roleVerification";

const Jobs = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const role = useSelector((state) => {
    return state.auth?.userInfo?.role;
  });
  const { loader, successMessage, errorMessage, jobs, job, totalJobs } =
    useSelector((state) => state.job);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchValue, setSearchValue] = useState("");
  const [parPage, setParPage] = useState(5);
  const [sort, setSort] = useState("newest-desc");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [toDeleteId, setToDeleteId] = useState(null);

  const deleteJob = (id) => {
    dispatch(jobDelete(id));
  };

  useEffect(() => {
    if (errorMessage) {
      toast.error(errorMessage);
      dispatch(clearMessage());
    }
    if (successMessage) {
      toast.success(successMessage);
      dispatch(
        get_jobs({
          parPage: +parPage,
          currentPage: +currentPage,
          searchValue,
          sort,
        }),
      );
      dispatch(clearMessage());
    }
  }, [
    successMessage,
    errorMessage,
    dispatch,
    parPage,
    currentPage,
    searchValue,
    sort,
  ]);

  useEffect(() => {
    const obj = {
      parPage: +parPage,
      currentPage: +currentPage,
      searchValue,
      sort,
    };
    dispatch(get_jobs(obj));
  }, [searchValue, currentPage, parPage, sort, dispatch]);

  const handleToggleStatus = (jobId) => {
    dispatch(toggle_job_status(jobId));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-primary-50/30 p-4 md:p-5">
      <ConfirmModal
        open={confirmOpen}
        message="Are you sure you want to delete this job?"
        onCancel={() => {
          setConfirmOpen(false);
          setToDeleteId(null);
        }}
        onConfirm={() => {
          if (toDeleteId) {
            dispatch(jobDelete(toDeleteId));
            setConfirmOpen(false);
            setToDeleteId(null);
          }
        }}
      />
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex items-center justify-between">
          <HeaderText title={"Job Management"} />
          {(isAdmin(role) || isEditor(role)) && (
            <Link
              to="/admin/dashboard/add-job"
              className="shadow-coral-medium hover:shadow-coral-large flex items-center gap-2 rounded-xl bg-gradient-to-r from-secondary to-sunshine-400 px-6 py-3 font-semibold text-white transition-all hover:scale-105"
            >
              <FaPlus className="h-5 w-5" />
              Add New Job
            </Link>
          )}
        </div>
        <div className="overflow-hidden rounded-2xl bg-white shadow-nature-medium ring-1 ring-primary-100">
          <div className="border-b border-primary-200 bg-gradient-to-r from-primary-50 to-secondary-50 p-5">
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                <FaSearch className="h-4 w-4 text-primary-700" />
              </div>
              <input
                type="text"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                placeholder="Search jobs..."
                className="w-full rounded-full border-2 border-primary-200 bg-white py-2.5 pl-11 pr-4 text-sm text-text-dark outline-none transition-all placeholder:text-text-light focus:border-secondary focus:ring-2 focus:ring-secondary-200"
              />
            </div>
            <div className="mt-3 flex items-center justify-between">
              <div className="text-sm text-text-dark">
                Showing{" "}
                <span className="font-medium text-secondary">
                  {jobs.length}
                </span>{" "}
                of {totalJobs} jobs
              </div>
              <div className="flex items-center gap-2">
                <SortSelect sort={sort} setSort={setSort} />
                <label className="text-sm font-medium text-primary-800">
                  Show:
                </label>
                <select
                  value={parPage}
                  onChange={(e) => setParPage(e.target.value)}
                  className="rounded-lg border-2 border-primary-200 bg-white px-3 py-2 text-sm text-text-dark focus:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary-200"
                >
                  <option value="5">5</option>
                  <option value="10">10</option>
                  <option value="15">15</option>
                </select>
              </div>
            </div>
          </div>

          {loader ? (
            <div className="flex h-64 items-center justify-center">
              <PropagateLoader
                cssOverride={overrideStyle}
                color="#36d7b7"
                size={15}
              />
            </div>
          ) : jobs.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full table-auto">
                <thead>
                  <tr className="border-b border-primary-200 bg-gradient-to-r from-primary-50 to-secondary-50 text-left text-xs font-semibold uppercase tracking-wider text-primary-700">
                    <th className="px-4 py-3">No</th>
                    <th className="px-4 py-3">Title</th>
                    <th className="px-4 py-3">Location</th>
                    <th className="px-4 py-3">Type</th>
                    <th className="px-4 py-3">Status</th>
                    {(isAdmin(role) || isEditor(role)) && (
                      <th className="px-4 py-3">Actions</th>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-primary-100">
                  {jobs.map((d, i) => (
                    <tr
                      key={i}
                      className="group transition-colors hover:bg-primary-50/50"
                    >
                      <td className="px-4 py-3 text-sm text-text-dark">
                        {(currentPage - 1) * parPage + i + 1}
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm font-semibold text-primary-800">
                          {d.title}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-text-dark">
                        {d.location || "Not specified"}
                      </td>
                      <td className="px-4 py-3 text-sm text-text-dark">
                        <span className="rounded-full bg-primary-100 px-2 py-1 text-xs font-medium text-primary-700">
                          {d.employmentType}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleToggleStatus(d._id)}
                          className="text-2xl transition-colors hover:opacity-80"
                          title={d.isActive ? "Deactivate" : "Activate"}
                        >
                          {d.isActive ? (
                            <FaToggleOn className="text-secondary" />
                          ) : (
                            <FaToggleOff className="text-gray-400" />
                          )}
                        </button>
                      </td>
                      {(isAdmin(role) || isEditor(role)) && (
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <Link
                              to={`/admin/dashboard/edit-job/${d._id}`}
                              className="rounded-lg bg-primary-100 p-2 text-primary-700 transition-colors hover:bg-primary-200"
                              title="Edit"
                            >
                              <FaEdit className="h-4 w-4" />
                            </Link>
                            <button
                              onClick={() => {
                                setToDeleteId(d._id);
                                setConfirmOpen(true);
                              }}
                              className="rounded-lg bg-red-100 p-2 text-red-700 transition-colors hover:bg-red-200"
                              title="Delete"
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
          ) : (
            <div className="p-8 text-center text-text-light">No jobs found</div>
          )}

          {jobs.length > 0 && (
            <div className="border-t border-primary-200 bg-neutral-50 p-5">
              <div className="flex justify-end">
                <Pagination
                  pageNumber={currentPage}
                  setPageNumber={setCurrentPage}
                  totalItem={totalJobs}
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

export default Jobs;
