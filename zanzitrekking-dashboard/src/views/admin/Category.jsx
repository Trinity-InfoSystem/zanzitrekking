"use client";

import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import Pagination from "../Pagination";
import { FaEdit, FaTrash, FaImage, FaSearch, FaTimes } from "react-icons/fa";
import { PropagateLoader } from "react-spinners";
import { overrideStyle } from "../../utils/utilis";
import { useDispatch, useSelector } from "react-redux";
import {
  category_image_update,
  categoryAdd,
  categoryDelete,
  clearMessage,
  get_category,
  get_one_category,
  update_category,
  delete_categories,
} from "../../store/Reducers/categoryReducer";
import toast from "react-hot-toast";
import HeaderText from "./HeaderText";
import ConfirmModal from "./ConfirmModal";
import CategoryTable from "./CategoryTable";
import CategoryForm from "./CategoryForm";
import { isAdmin, isEditor } from "../../utils/roleVerification";
import SortSelect from "../components/SortSelect";

const Category = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const role = useSelector((state) => {
    return state.auth?.userInfo?.role;
  });
  const { loader, successMessage, errorMessage, categories, category } =
    useSelector((state) => state.category);
  const { categoryId } = useParams();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchValue, setSearchValue] = useState("");
  const [show, setShow] = useState(false);
  const [parPage, setParPage] = useState(5);
  const [sort, setSort] = useState("newest-desc");
  const [imageShow, setImage] = useState("");
  const [state, setState] = useState({ name: "", image: "" });
  const [errors, setErrors] = useState({ name: "", image: "" });
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [toDeleteId, setToDeleteId] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);
  const [bulkConfirmOpen, setBulkConfirmOpen] = useState(false);

  function handleImage(e) {
    const files = e.target.files;
    if (files.length > 0) {
      setImage(URL.createObjectURL(files[0]));
      setState((prevState) => ({
        ...prevState,
        image: files[0],
      }));
      if (categoryId) {
        dispatch(category_image_update({ image: files[0], categoryId }));
        dispatch(get_one_category(categoryId));
      }
    }
  }

  function validateForm() {
    let valid = true;
    const errors = { name: "", image: "" };

    if (!state.name) {
      errors.name = "Category name is required.";
      valid = false;
    }
    // Only require image for new category (not update)
    if (!categoryId && !state.image) {
      errors.image = "Category image is required.";
      valid = false;
    }
    setErrors(errors);
    return valid;
  }

  function add_category(e) {
    e.preventDefault();
    if (!validateForm()) return;
    if (categoryId) {
      dispatch(update_category({ ...state, categoryId })).then(() => {
        dispatch(get_one_category(categoryId));
        navigate("/admin/dashboard/categories");
      });
    } else {
      dispatch(categoryAdd(state));
      setState({ name: "", image: "" });
    }
    setShow(false);
  }

  const deleteCategory = (id) => {
    dispatch(categoryDelete(id));
  };

  // Checkbox handlers
  const isAllSelected =
    categories.length > 0 && selectedIds.length === categories.length;
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(categories.map((d) => d._id));
    } else {
      setSelectedIds([]);
    }
  };
  const handleSelectRow = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((sid) => sid !== id) : [...prev, id],
    );
  };

  useEffect(() => {
    if (errorMessage) {
      toast.error(errorMessage);
      dispatch(clearMessage());
    }
    if (successMessage) {
      toast.success(successMessage);
      dispatch(
        get_category({
          parPage: +parPage,
          currentPage: +currentPage,
          searchValue,
        }),
      );
      dispatch(get_one_category(categoryId));
      if (categoryId) {
        setState({
          name: category?.name || "",
          image: category?.image || "",
        });
        setImage(category?.image || "");
      }
      setImage("");
      dispatch(clearMessage());
    }
  }, [
    categoryId,
    category?.name,
    category?.image,
    successMessage,
    errorMessage,
    dispatch,
    parPage,
    currentPage,
    searchValue,
  ]);

  useEffect(() => {
    const obj = {
      parPage: +parPage,
      currentPage: +currentPage,
      searchValue,
      sort,
    };
    dispatch(get_category(obj));
  }, [searchValue, currentPage, parPage, sort, dispatch]);

  useEffect(() => {
    if (categoryId) {
      dispatch(get_one_category(categoryId));
    }
  }, [dispatch, categoryId]);

  useEffect(() => {
    if (category && categoryId) {
      setState({
        name: category?.name || "",
        image: category?.image || "",
      });
      setImage(category?.image || "");
    }
  }, [category, categoryId]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-primary-50/30 p-4 md:p-5">
      {/* Confirm Delete Modal */}
      <ConfirmModal
        open={confirmOpen}
        message="Are you sure you want to delete this category?"
        onCancel={() => {
          setConfirmOpen(false);
          setToDeleteId(null);
        }}
        onConfirm={() => {
          if (toDeleteId) {
            dispatch(categoryDelete(toDeleteId));
            setConfirmOpen(false);
            setToDeleteId(null);
          }
        }}
      />
      {/* Bulk Confirm Delete Modal */}
      <ConfirmModal
        open={bulkConfirmOpen}
        message={`Are you sure you want to delete ${selectedIds.length} categories?`}
        onCancel={() => setBulkConfirmOpen(false)}
        onConfirm={() => {
          if (selectedIds.length > 0) {
            dispatch(delete_categories(selectedIds)).then(() => {
              setBulkConfirmOpen(false);
              setSelectedIds([]);
            });
          }
        }}
      />
      <div className="mx-auto max-w-7xl">
        <HeaderText title={"Category Management"} />
        {/* Page Header */}
        <div
          className={`grid grid-cols-1 gap-5 ${isAdmin(role) || isEditor(role) ? `md:grid-cols-12` : ``} `}
        >
          {/* Main Content */}
          <div
            className={`overflow-hidden rounded-2xl bg-white shadow-nature-medium ring-1 ring-primary-100 ${isAdmin(role) || isEditor(role) ? `md:col-span-8` : ``}`}
          >
            {/* Search Bar */}
            <div className="border-b border-primary-200 bg-gradient-to-r from-primary-50 to-secondary-50 p-5">
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                  <FaSearch className="h-4 w-4 text-primary-700" />
                </div>
                <input
                  type="text"
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  placeholder="Search categories..."
                  className="w-full rounded-full border-2 border-primary-200 bg-white py-2.5 pl-11 pr-4 text-sm text-text-dark outline-none transition-all placeholder:text-text-light focus:border-secondary focus:ring-2 focus:ring-secondary-200"
                />
              </div>
              <div className="mt-3 flex items-center justify-between">
                <div className="text-sm text-text-dark">
                  Showing{" "}
                  <span className="font-medium text-secondary">
                    {categories.length}
                  </span>{" "}
                  results
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
            {/* Table */}
            <CategoryTable
              categories={categories}
              selectedIds={selectedIds}
              isAllSelected={isAllSelected}
              handleSelectAll={handleSelectAll}
              handleSelectRow={handleSelectRow}
              setToDeleteId={setToDeleteId}
              setConfirmOpen={setConfirmOpen}
              currentPage={currentPage}
              parPage={parPage}
              loader={loader}
              setBulkConfirmOpen={setBulkConfirmOpen}
              role={role}
            />
            {/* Pagination */}
            {categories.length > 0 && (
              <div className="border-t border-primary-200 bg-neutral-50 p-5">
                <div className="flex justify-end">
                  <Pagination
                    pageNumber={currentPage}
                    setPageNumber={setCurrentPage}
                    totalItem={categories.length}
                    parPage={parPage}
                    showItem={3}
                  />
                </div>
              </div>
            )}
          </div>
          {/* Sidebar Form */}
          {(isAdmin(role) || isEditor(role)) && (
            <div
              className={`overflow-y-auto rounded-2xl bg-white p-0 shadow-nature-medium ring-1 ring-primary-100 transition-all duration-300 ease-in-out md:col-span-4 lg:relative lg:translate-x-0 ${show ? "" : ""}`}
            >
              <div className="flex h-full flex-col">
                {/* Form Header */}
                <div className="border-b border-primary-200 bg-gradient-to-r from-primary via-primary-600 to-primary-700 px-6 py-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-white">
                      {categoryId ? "Edit Category" : "Add New Category"}
                    </h2>
                  </div>
                </div>
                {/* Form Content */}
                <CategoryForm
                  state={state}
                  setState={setState}
                  errors={errors}
                  loader={loader}
                  imageShow={imageShow}
                  handleImage={handleImage}
                  add_category={add_category}
                  categoryId={categoryId}
                  onClose={() => setShow(false)}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Category;
