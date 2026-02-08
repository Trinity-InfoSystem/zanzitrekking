"use client";

import { useEffect, useState, useRef } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Pagination from "../Pagination";
import {
  FaEdit,
  FaTrash,
  FaPlus,
  FaEnvelope,
  FaFileExport,
  FaPaperPlane,
} from "react-icons/fa";
import { IoCloseCircle } from "react-icons/io5";
import { PropagateLoader } from "react-spinners";
import { overrideStyle } from "../../utils/utilis";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import Search from "../components/Search";
import {
  clearNewsletterMessage,
  deleteSubscriber,
  getSubscriber,
  getSubscribers,
  updateSubscriber,
  subscribeNewsletter,
  sendNewsletter,
  exportSubscribers,
  getAllSubscribers,
} from "../../store/Reducers/newsletterReducer";
import HeaderText from "./HeaderText";
import { isViewer } from "../../utils/roleVerification";
import SortSelect from "../components/SortSelect";
import {
  Autocomplete,
  TextField,
  Checkbox,
  Chip,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Box,
} from "@mui/material";
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import CheckBoxIcon from "@mui/icons-material/CheckBox";

const Newsletter = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { email } = useParams();
  const {
    loader,
    successMessage,
    errorMessage,
    subscribers,
    allSubscribers,
    currentSubscriber,
    totalSubscribers,
  } = useSelector((state) => state.newsletter);

  const role = useSelector((state) => state.auth?.userInfo?.role);

  const [isSending, setIsSending] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [newsletterForm, setNewsletterForm] = useState({
    subject: "",
    content: "",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [searchValue, setSearchValue] = useState("");
  const [sort, setSort] = useState("newest-desc");
  const [show, setShow] = useState(false);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [parPage, setParPage] = useState(5);
  const [formData, setFormData] = useState({
    email: "",
    subscriptionSource: "website",
  });
  const [errors, setErrors] = useState({ email: "" });

  const [selectedRecipients, setSelectedRecipients] = useState([]);
  const [sendOption, setSendOption] = useState("all"); // 'all' or 'selected'
  const [file, setFile] = useState(null);
  const fileInputRef = useRef(null);

  const recipientOptions = allSubscribers.map((subscriber) => ({
    email: subscriber.email,
    isSubscribed: subscriber.isSubscribed,
  }));

  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSendNewsletter = async (e) => {
    e.preventDefault();

    if (!newsletterForm.subject || !newsletterForm.content) {
      toast.error("Subject and content are required");
      return;
    }

    setIsSending(true);

    try {
      const formData = new FormData();
      formData.append("subject", newsletterForm.subject);
      formData.append("content", newsletterForm.content);

      if (sendOption === "selected" && selectedRecipients.length > 0) {
        formData.append(
          "emails",
          JSON.stringify(selectedRecipients.map((r) => r.email)),
        );
      }

      if (file) {
        formData.append("attachment", file);
      }

      await dispatch(sendNewsletter(formData)).unwrap();
      // Reset form after successful send
      setNewsletterForm({ subject: "", content: "" });
      setSelectedRecipients([]);
      setSendOption("all");
      setFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      toast.error("Failed to send newsletter");
    } finally {
      setIsSending(false);
    }
  };

  function validateForm() {
    let valid = true;
    const errors = { email: "" };

    if (!formData.email) {
      errors.email = "Email is required.";
      valid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = "Please enter a valid email address.";
      valid = false;
    }

    setErrors(errors);
    return valid;
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!validateForm()) return;

    setFormSubmitting(true);

    const submissionData = {
      ...formData,
      ...(email && { isSubscribed: formData.isSubscribed }),
    };

    const action = email
      ? dispatch(updateSubscriber({ email, updateData: submissionData }))
      : dispatch(subscribeNewsletter(submissionData));

    action.finally(() => {
      setFormSubmitting(false);
      setShow(false);
      navigate("/admin/dashboard/newsletters");
    });
  }

  useEffect(() => {
    if (errorMessage) {
      toast.error(errorMessage);
      dispatch(clearNewsletterMessage());
    }
    if (successMessage) {
      toast.success(successMessage);
      const params = {
        page: currentPage,
        limit: parPage,
        search: searchValue,
        sort,
      };
      dispatch(getSubscribers(params));

      // Only reset form if not in edit mode
      if (!email) {
        setFormData({
          email: "",
          subscriptionSource: "website",
          isSubscribed: true,
        });
      }

      dispatch(clearNewsletterMessage());
    }
  }, [
    successMessage,
    errorMessage,
    dispatch,
    currentPage,
    parPage,
    searchValue,
    email,
  ]);

  useEffect(() => {
    return () => {
      dispatch(clearNewsletterMessage());
    };
  }, [dispatch]);

  useEffect(() => {
    const params = {
      page: currentPage,
      limit: parPage,
      search: searchValue,
      sort,
    };
    dispatch(getSubscribers(params));
    dispatch(getAllSubscribers());
  }, [searchValue, currentPage, parPage, sort, dispatch]);

  useEffect(() => {
    if (email) {
      dispatch(getSubscriber(email));
    }
  }, [email, dispatch]);

  useEffect(() => {
    if (currentSubscriber) {
      setFormData({
        email: currentSubscriber.email,
        subscriptionSource: currentSubscriber.subscriptionSource || "website",
        isSubscribed: currentSubscriber.isSubscribed, // Add this line
      });
    } else {
      setFormData({
        email: "",
        subscriptionSource: "website",
        isSubscribed: true, // Default to subscribed for new entries
      });
    }
  }, [currentSubscriber]);

  const handleExportSubscribers = async () => {
    setIsExporting(true);
    try {
      const result = await dispatch(exportSubscribers());
      if (exportSubscribers.fulfilled.match(result)) {
        // Create download link
        const url = window.URL.createObjectURL(new Blob([result.payload]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", "subscribers.csv");
        document.body.appendChild(link);
        link.click();
        link.remove();
      }
    } catch (error) {
      toast.error("Failed to export subscribers");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-primary-50/30 p-4 md:p-5">
      <div className="mx-auto max-w-7xl">
        <HeaderText title="Newsletter Subscribers" />

        {/* Mobile Header */}
        <div className="mb-6 flex items-center justify-end lg:hidden">
          <button
            onClick={() => setShow(true)}
            className="shadow-coral-medium hover:shadow-coral-large flex items-center space-x-2 rounded-xl bg-gradient-to-r from-secondary to-sunshine-400 px-6 py-3 text-sm font-semibold text-white transition-all duration-300 hover:scale-105"
          >
            <FaPlus className="text-xs" />
            <span>{email ? "Edit" : "Add New"}</span>
          </button>
        </div>

        <div className="flex flex-col gap-5 lg:flex-row">
          {/* Main Content */}
          <div className="flex-1">
            <div className="overflow-hidden rounded-2xl bg-white shadow-nature-medium ring-1 ring-primary-100">
              {/* Search Section */}
              <div className="flex justify-end gap-3 px-6 pt-6">
                <button
                  onClick={handleExportSubscribers}
                  disabled={isExporting}
                  className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-info to-info-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all duration-300 hover:scale-105 disabled:opacity-70"
                >
                  {isExporting ? (
                    <PropagateLoader color="#ffffff" size={8} />
                  ) : (
                    <>
                      <FaFileExport />
                      <span>Export</span>
                    </>
                  )}
                </button>
              </div>
              <div className="border-b border-primary-200 bg-gradient-to-r from-primary-50 to-secondary-50 p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <Search
                    setParPage={setParPage}
                    setSearchValue={setSearchValue}
                    searchValue={searchValue}
                    placeholder="Search subscribers..."
                  />
                  <SortSelect sort={sort} setSort={setSort} />
                </div>
              </div>

              {/* Table Section */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-primary-200 bg-gradient-to-r from-primary-50 to-secondary-50">
                      <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wider text-primary-700">
                        No
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wider text-primary-700">
                        Email
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wider text-primary-700">
                        Status
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wider text-primary-700">
                        Source
                      </th>
                      {!isViewer(role) && (
                        <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wider text-primary-700">
                          Actions
                        </th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-primary-100">
                    {subscribers?.map((subscriber, i) => (
                      <tr
                        key={i}
                        className="group bg-white transition-colors hover:bg-primary-50/50"
                      >
                        <td className="px-6 py-4 text-sm font-medium">
                          <div className="shadow-coral-soft flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-r from-secondary to-sunshine-400 font-bold text-white transition-all duration-300 group-hover:scale-110">
                            {i + 1}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-text-dark">
                          {subscriber.email}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                              subscriber.isSubscribed
                                ? "bg-success-100 text-success-700"
                                : "bg-accent-100 text-accent-700"
                            }`}
                          >
                            {subscriber.isSubscribed
                              ? "Subscribed"
                              : "Unsubscribed"}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm capitalize text-text-dark">
                          {subscriber.subscriptionSource}
                        </td>
                        {!isViewer(role) && (
                          <td className="px-6 py-4">
                            <div className="flex gap-3">
                              <Link
                                to={`/admin/dashboard/newsletter/edit/${subscriber.email}`}
                                className="group/btn shadow-sunshine-soft hover:shadow-sunshine-medium relative overflow-hidden rounded-lg bg-gradient-to-r from-sunshine-400 to-sunshine-500 p-3 text-white transition-all duration-300 hover:scale-110"
                              >
                                <FaEdit className="relative z-10 transition-transform duration-300 group-hover/btn:scale-110" />
                              </Link>
                              <button
                                onClick={() =>
                                  dispatch(deleteSubscriber(subscriber.email))
                                }
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
                <div className="flex items-center justify-between">
                  <div className="text-sm text-text-dark">
                    Showing{" "}
                    <span className="font-medium text-secondary">
                      {subscribers?.length}
                    </span>{" "}
                    of{" "}
                    <span className="font-medium text-secondary">
                      {totalSubscribers}
                    </span>{" "}
                    subscribers
                  </div>
                  <Pagination
                    pageNumber={currentPage}
                    setPageNumber={setCurrentPage}
                    totalItem={totalSubscribers}
                    parPage={parPage}
                    showItem={3}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar Form */}
          <div
            className={`fixed inset-y-0 right-0 z-50 w-full max-w-md transform bg-white shadow-2xl backdrop-blur-xl transition-transform duration-500 ease-out lg:relative lg:z-0 lg:translate-x-0 lg:rounded-2xl lg:bg-white lg:ring-1 lg:ring-primary-100 ${
              show ? "translate-x-0" : "translate-x-full"
            }`}
          >
            <div className="flex h-full flex-col">
              {/* Form Header */}
              <div className="bg-gradient-to-r from-primary via-primary-600 to-primary-700 p-6 lg:rounded-t-2xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="rounded-lg bg-white p-2">
                      <FaEnvelope className="text-lg text-secondary" />
                    </div>
                    <h2 className="text-xl font-bold text-white">
                      {email ? "Edit Subscriber" : "Add New Subscriber"}
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
                  onSubmit={handleSubmit}
                  className="flex h-full flex-1 flex-col"
                >
                  <div className="mb-6">
                    <label className="mb-3 block text-sm font-bold text-primary-800">
                      Email Address
                    </label>
                    <div className="relative">
                      <input
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            email: e.target.value,
                          })
                        }
                        type="email"
                        className={`w-full rounded-xl border-2 ${
                          errors.email
                            ? "border-accent bg-accent-50 focus:border-accent focus:ring-accent-200"
                            : "border-primary-200 bg-white focus:border-secondary focus:ring-secondary-200"
                        } px-4 py-3.5 text-text-dark transition-all duration-300 placeholder:text-text-light focus:outline-none focus:ring-2`}
                        placeholder="Enter email address"
                        disabled={!!email}
                      />
                      {errors.email && (
                        <div className="absolute -bottom-6 left-0 flex items-center space-x-1 text-accent">
                          <div className="h-1 w-1 rounded-full bg-accent"></div>
                          <p className="text-sm font-medium">{errors.email}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mb-6">
                    <label className="mb-3 block text-sm font-bold text-primary-800">
                      Subscription Source
                    </label>
                    <select
                      value={formData.subscriptionSource}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          subscriptionSource: e.target.value,
                        })
                      }
                      className="w-full rounded-xl border-2 border-primary-200 bg-white px-4 py-3.5 text-text-dark transition-all duration-300 focus:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary-200"
                    >
                      <option value="website">Website</option>
                      <option value="mobile-app">Mobile App</option>
                      <option value="admin">Admin</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  {email && (
                    <div className="mb-6">
                      <label className="mb-3 block text-sm font-bold text-primary-800">
                        Subscription Status
                      </label>
                      <div className="flex items-center space-x-4">
                        <label className="inline-flex items-center">
                          <input
                            type="radio"
                            checked={formData.isSubscribed === true}
                            onChange={() =>
                              setFormData({
                                ...formData,
                                isSubscribed: true,
                              })
                            }
                            className="h-4 w-4 text-secondary accent-secondary"
                          />
                          <span className="ml-2 text-text-dark">
                            Subscribed
                          </span>
                        </label>
                        <label className="inline-flex items-center">
                          <input
                            type="radio"
                            checked={formData.isSubscribed === false}
                            onChange={() =>
                              setFormData({
                                ...formData,
                                isSubscribed: false,
                              })
                            }
                            className="h-4 w-4 text-secondary accent-secondary"
                          />
                          <span className="ml-2 text-text-dark">
                            Unsubscribed
                          </span>
                        </label>
                      </div>
                    </div>
                  )}

                  <div className="mt-auto pt-6">
                    <button
                      disabled={loader || formSubmitting}
                      className="shadow-coral-medium hover:shadow-coral-large min-h-14 w-full rounded-xl bg-gradient-to-r from-secondary to-sunshine-400 px-6 py-4 text-lg font-semibold text-white transition-all hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
                    >
                      {loader || formSubmitting ? (
                        <PropagateLoader
                          cssOverride={overrideStyle}
                          color="#ffffff"
                          size={12}
                        />
                      ) : email ? (
                        "Update Subscriber"
                      ) : (
                        "Add Subscriber"
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>

          {/* Overlay for mobile */}
          {show && (
            <div
              className="fixed inset-0 z-40 bg-primary-900/20 backdrop-blur-sm transition-opacity duration-300 lg:hidden"
              onClick={() => setShow(false)}
            ></div>
          )}
        </div>
        <div className="mt-8 rounded-2xl bg-white p-6 shadow-nature-medium ring-1 ring-primary-100">
          <h2 className="mb-4 text-xl font-bold text-primary-800">
            Send Newsletter
          </h2>
          <form onSubmit={handleSendNewsletter}>
            <div className="mb-4">
              <label className="mb-2 block text-sm font-bold text-primary-800">
                Subject
              </label>
              <input
                type="text"
                value={newsletterForm.subject}
                onChange={(e) =>
                  setNewsletterForm({
                    ...newsletterForm,
                    subject: e.target.value,
                  })
                }
                className="w-full rounded-xl border-2 border-primary-200 bg-white px-4 py-3 text-text-dark placeholder:text-text-light focus:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary-200"
                required
              />
            </div>

            <div className="mb-4">
              <label className="mb-2 block text-sm font-bold text-primary-800">
                Content
              </label>
              <textarea
                value={newsletterForm.content}
                onChange={(e) =>
                  setNewsletterForm({
                    ...newsletterForm,
                    content: e.target.value,
                  })
                }
                className="h-40 w-full rounded-xl border-2 border-primary-200 bg-white px-4 py-3 text-text-dark placeholder:text-text-light focus:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary-200"
                required
              />
            </div>

            <div className="mb-4">
              <div className="mb-4">
                <FormControl fullWidth>
                  <InputLabel
                    sx={{
                      color: "#1B4332",
                      "&.Mui-focused": {
                        color: "#E76F51",
                      },
                    }}
                  >
                    Send To
                  </InputLabel>
                  <Select
                    value={sendOption}
                    onChange={(e) => setSendOption(e.target.value)}
                    label="Send To"
                    sx={{
                      color: "#2D3748",
                      "& .MuiOutlinedInput-notchedOutline": {
                        borderColor: "#95C5A0",
                        borderWidth: "2px",
                      },
                      "&:hover .MuiOutlinedInput-notchedOutline": {
                        borderColor: "#E76F51",
                        borderWidth: "2px",
                      },
                      "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                        borderColor: "#E76F51",
                        borderWidth: "2px",
                      },
                      "& .MuiSvgIcon-root": {
                        color: "#1B4332",
                      },
                    }}
                    MenuProps={{
                      PaperProps: {
                        sx: {
                          bgcolor: "white",
                          color: "#2D3748",
                          "& .MuiMenuItem-root": {
                            "&:hover": {
                              bgcolor: "#F0F7F4",
                            },
                          },
                        },
                      },
                    }}
                  >
                    <MenuItem value="all" sx={{ color: "#2D3748" }}>
                      All Subscribed Users
                    </MenuItem>
                    <MenuItem value="selected" sx={{ color: "#2D3748" }}>
                      Select Specific Users
                    </MenuItem>
                  </Select>
                </FormControl>
              </div>

              {sendOption === "selected" && (
                <Autocomplete
                  multiple
                  options={recipientOptions}
                  disableCloseOnSelect
                  getOptionLabel={(option) => option.email}
                  renderOption={(props, option, { selected }) => (
                    <li {...props}>
                      <Checkbox
                        icon={<CheckBoxOutlineBlankIcon fontSize="small" />}
                        checkedIcon={<CheckBoxIcon fontSize="small" />}
                        style={{ marginRight: 8 }}
                        checked={selected}
                      />
                      {option.email}
                    </li>
                  )}
                  renderTags={(value, getTagProps) =>
                    value.map((option, index) => (
                      <Chip
                        {...getTagProps({ index })}
                        key={option.email}
                        label={option.email}
                      />
                    ))
                  }
                  value={selectedRecipients}
                  onChange={(event, newValue) => {
                    setSelectedRecipients(newValue);
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Select Recipients"
                      placeholder="Search emails..."
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          borderRadius: "12px",
                          color: "#2D3748",
                          "& fieldset": {
                            borderColor: "#95C5A0",
                            borderWidth: "2px",
                          },
                          "&:hover fieldset": {
                            borderColor: "#E76F51",
                            borderWidth: "2px",
                          },
                          "&.Mui-focused fieldset": {
                            borderColor: "#E76F51",
                            borderWidth: "2px",
                          },
                        },
                        "& .MuiInputLabel-root": {
                          color: "#1B4332",
                        },
                        "& .MuiInputLabel-root.Mui-focused": {
                          color: "#E76F51",
                        },
                        "& .MuiAutocomplete-input": {
                          color: "#2D3748",
                        },
                        "& .MuiChip-root": {
                          color: "white",
                          borderColor: "#E76F51",
                          background:
                            "linear-gradient(to right, #E76F51, #F4A261)",
                        },
                        "& .MuiChip-deleteIcon": {
                          color: "white",
                        },
                        "& .MuiAutocomplete-popupIndicator": {
                          color: "#1B4332",
                        },
                        "& .MuiSvgIcon-root": {
                          color: "#1B4332",
                        },
                      }}
                    />
                  )}
                />
              )}
            </div>

            <div className="mb-6">
              <label className="mb-2 block text-sm font-bold text-primary-800">
                Attachment (optional)
              </label>
              <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileChange}
                className="w-full rounded-xl border-2 border-primary-200 bg-white px-4 py-3 text-text-dark file:mr-4 file:rounded-lg file:border-0 file:bg-gradient-to-r file:from-secondary file:to-sunshine-400 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:scale-105 focus:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary-200"
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
              />
              {file && (
                <div className="mt-2 text-sm text-text-dark">
                  Selected: {file.name} ({(file.size / 1024 / 1024).toFixed(2)}{" "}
                  MB)
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={
                isSending ||
                (sendOption === "selected" && selectedRecipients.length === 0)
              }
              className="shadow-coral-medium hover:shadow-coral-large w-full rounded-xl bg-gradient-to-r from-secondary to-sunshine-400 px-6 py-4 text-lg font-semibold text-white transition-all hover:scale-105 disabled:opacity-70 disabled:hover:scale-100"
            >
              {isSending ? (
                <div className="flex items-center justify-center space-x-2">
                  <PropagateLoader
                    cssOverride={overrideStyle}
                    color="#ffffff"
                    size={8}
                  />
                  <span>Sending...</span>
                </div>
              ) : (
                <>
                  <FaPaperPlane className="mr-2 inline" />
                  Send Newsletter
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Newsletter;
