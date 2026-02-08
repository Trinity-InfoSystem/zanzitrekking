"use client";

import { useState, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  jobAdd,
  update_job,
  get_one_job,
  clearMessage,
  clearJob,
} from "../../store/Reducers/jobReducer";
import toast from "react-hot-toast";
import { PropagateLoader } from "react-spinners";
import { overrideStyle } from "../../utils/utilis";
import HeaderText from "./HeaderText";
import { FaCode, FaFileAlt } from "react-icons/fa";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import "../admin/quill-custom.css";

const AddJob = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { jobId } = useParams();
  const { job, successMessage, errorMessage, loader } = useSelector(
    (state) => state.job,
  );

  const [contentType, setContentType] = useState("structured");
  const [htmlContent, setHtmlContent] = useState("");
  const [showHtmlCode, setShowHtmlCode] = useState(false);
  // Store original HTML with style/script tags preserved
  const [originalHtmlContent, setOriginalHtmlContent] = useState("");
  // Store extracted style and script tags separately
  const [preservedStyleScript, setPreservedStyleScript] = useState({
    styles: [],
    scripts: [],
  });
  const [state, setState] = useState({
    title: "",
    description: "",
    requirements: "",
    location: "",
    employmentType: "full-time",
    salaryRange: "",
    applicationDeadline: "",
    isActive: true,
  });

  const [errors, setErrors] = useState({});

  // Helper function to extract style and script tags from HTML
  const extractStyleAndScript = (html) => {
    if (!html) return { styles: [], scripts: [], bodyContent: html };

    const styles = [];
    const scripts = [];
    let bodyContent = html;

    // Extract <style> tags
    const styleRegex = /<style[^>]*>([\s\S]*?)<\/style>/gi;
    let styleMatch;
    while ((styleMatch = styleRegex.exec(html)) !== null) {
      styles.push(styleMatch[0]); // Include the full tag
      bodyContent = bodyContent.replace(styleMatch[0], "");
    }

    // Extract <script> tags
    const scriptRegex = /<script[^>]*>([\s\S]*?)<\/script>/gi;
    let scriptMatch;
    while ((scriptMatch = scriptRegex.exec(html)) !== null) {
      scripts.push(scriptMatch[0]); // Include the full tag
      bodyContent = bodyContent.replace(scriptMatch[0], "");
    }

    return { styles, scripts, bodyContent: bodyContent.trim() };
  };

  // Helper function to merge style/script tags back with content
  const mergeStyleAndScript = (content, styles, scripts) => {
    let merged = content;
    if (styles.length > 0) {
      merged = styles.join("\n") + "\n" + merged;
    }
    if (scripts.length > 0) {
      merged = merged + "\n" + scripts.join("\n");
    }
    return merged;
  };

  // Quill modules configuration
  const quillModules = useMemo(
    () => ({
      toolbar: [
        [{ header: [1, 2, 3, 4, 5, 6, false] }],
        ["bold", "italic", "underline", "strike"],
        [{ list: "ordered" }, { list: "bullet" }],
        [{ color: [] }, { background: [] }],
        [{ align: [] }],
        ["link", "image", "video"],
        ["blockquote", "code-block"],
        ["clean"],
      ],
    }),
    [],
  );

  function validateForm() {
    let valid = true;
    const newErrors = {};

    if (!state.title) {
      newErrors.title = "Job title is required.";
      valid = false;
    }

    // Validate content based on contentType
    if (contentType === "html") {
      if (!htmlContent || htmlContent.trim() === "") {
        newErrors.htmlContent = "HTML content is required.";
        valid = false;
      }
    } else {
      if (!state.description || state.description.trim() === "") {
        newErrors.description = "Job description is required.";
        valid = false;
      }
      if (!state.employmentType) {
        newErrors.employmentType = "Employment type is required.";
        valid = false;
      }
    }

    setErrors(newErrors);
    return valid;
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    // Ensure contentType is explicitly set
    const finalContentType = contentType || "structured";

    // For HTML content, merge preserved style/script tags if in visual editor mode
    let finalHtmlContent = htmlContent;
    if (finalContentType === "html") {
      if (
        !showHtmlCode &&
        (preservedStyleScript.styles.length > 0 ||
          preservedStyleScript.scripts.length > 0)
      ) {
        // User is in visual editor mode, merge preserved style/script tags
        finalHtmlContent = mergeStyleAndScript(
          htmlContent,
          preservedStyleScript.styles,
          preservedStyleScript.scripts,
        );
      } else if (showHtmlCode) {
        // User is in HTML code mode, use the raw HTML directly
        finalHtmlContent = htmlContent;
      }
    }

    const jobData = {
      title: state.title,
      contentType: finalContentType,
      htmlContent: finalContentType === "html" ? finalHtmlContent : "",
      description: finalContentType === "html" ? "" : state.description || "",
      // Include structured fields for both content types
      // For HTML content, requirements are not used, but other fields are available
      requirements:
        finalContentType === "structured" && state.requirements
          ? state.requirements.split(",").map((r) => r.trim())
          : [],
      location: state.location || "",
      employmentType: state.employmentType || "full-time",
      salaryRange: state.salaryRange || "",
      applicationDeadline: state.applicationDeadline || null,
      isActive: state.isActive === true || state.isActive === "true",
    };

    // Submit job data
    });

    if (jobId) {
      dispatch(update_job({ jobData, jobId })).then(() => {
        navigate("/admin/dashboard/jobs");
      });
    } else {
      dispatch(jobAdd(jobData)).then(() => {
        navigate("/admin/dashboard/jobs");
      });
    }
  };

  useEffect(() => {
    if (jobId) {
      dispatch(get_one_job(jobId));
    } else {
      // Clear job data when adding new job
      dispatch(clearJob());
      setState({
        title: "",
        description: "",
        requirements: "",
        location: "",
        employmentType: "full-time",
        salaryRange: "",
        applicationDeadline: "",
        isActive: true,
      });
      setContentType("structured");
      setHtmlContent("");
    }
    return () => {
      if (!jobId) {
        dispatch(clearJob());
      }
    };
  }, [dispatch, jobId]);

  useEffect(() => {
    if (job && job._id && jobId) {
      const contentTypeValue = job?.contentType || "structured";
      setContentType(contentTypeValue);

      // Store original HTML content
      const originalHtml = job?.htmlContent || "";
      setOriginalHtmlContent(originalHtml);

      if (contentTypeValue === "html" && originalHtml) {
        // Extract style and script tags
        const extracted = extractStyleAndScript(originalHtml);
        setPreservedStyleScript({
          styles: extracted.styles,
          scripts: extracted.scripts,
        });

        // If there are style/script tags, start in HTML code view to preserve them
        // Otherwise, start in visual editor
        const hasStyleOrScript =
          extracted.styles.length > 0 || extracted.scripts.length > 0;
        if (hasStyleOrScript) {
          setHtmlContent(originalHtml);
          setShowHtmlCode(true); // Start in HTML code view to preserve everything
        } else {
          setHtmlContent(extracted.bodyContent || originalHtml);
          setShowHtmlCode(false); // Start in visual editor
        }
      } else {
        setHtmlContent("");
        setPreservedStyleScript({ styles: [], scripts: [] });
      }

      setState({
        title: job?.title || "",
        description: job?.description || "",
        requirements: job?.requirements?.join(", ") || "",
        location: job?.location || "",
        employmentType: job?.employmentType || "full-time",
        salaryRange: job?.salaryRange || "",
        applicationDeadline: job?.applicationDeadline
          ? new Date(job.applicationDeadline).toISOString().split("T")[0]
          : "",
        isActive: job?.isActive !== undefined ? job.isActive : true,
      });
    }
  }, [job, jobId]);

  useEffect(() => {
    if (successMessage) {
      toast.success(successMessage);
      dispatch(clearMessage());
    }
    if (errorMessage) {
      toast.error(errorMessage);
      dispatch(clearMessage());
    }
  }, [successMessage, errorMessage, dispatch]);

  // Show loader while fetching job data for edit
  if (jobId && loader && !job?._id) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <PropagateLoader
          cssOverride={overrideStyle}
          color="#10b981"
          size={15}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-primary-50/30 p-4 md:p-5">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6 flex items-center justify-between">
          <HeaderText title={jobId ? "Edit Job" : "Add New Job"} />
          <Link
            to="/admin/dashboard/jobs"
            className="rounded-lg border-2 border-primary-200 bg-white px-4 py-2 text-sm font-semibold text-primary-700 transition-colors hover:bg-primary-50"
          >
            Back to Jobs
          </Link>
        </div>

        <div className="overflow-hidden rounded-2xl bg-white shadow-nature-medium ring-1 ring-primary-100">
          <div className="border-b border-primary-200 bg-gradient-to-r from-primary via-primary-600 to-primary-700 px-6 py-4">
            <h2 className="text-xl font-bold text-white">
              {jobId ? "Edit Job Posting" : "Create New Job Posting"}
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="p-6">
            <div className="space-y-6">
              <div>
                <label className="mb-2 block text-sm font-semibold text-primary-800">
                  Job Title *
                </label>
                <input
                  type="text"
                  value={state.title}
                  onChange={(e) =>
                    setState({ ...state, title: e.target.value })
                  }
                  className="w-full rounded-lg border-2 border-primary-200 bg-white px-4 py-2.5 text-sm text-text-dark focus:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary-200"
                  placeholder="Enter job title"
                />
                {errors.title && (
                  <p className="mt-1 text-xs text-red-600">{errors.title}</p>
                )}
              </div>

              {/* Content Type Toggle */}
              <div className="rounded-xl border-2 border-primary-200 bg-gradient-to-r from-primary-50 to-secondary-50 p-4">
                <h3 className="mb-3 text-sm font-bold text-primary-800">
                  Content Type
                </h3>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setContentType("structured")}
                    className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold transition-all ${
                      contentType === "structured"
                        ? "shadow-coral-medium bg-gradient-to-r from-secondary to-sunshine-400 text-white"
                        : "border-2 border-primary-200 bg-white text-text-dark hover:border-secondary"
                    }`}
                  >
                    <FaFileAlt />
                    Structured Content
                  </button>
                  <button
                    type="button"
                    onClick={() => setContentType("html")}
                    className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold transition-all ${
                      contentType === "html"
                        ? "shadow-coral-medium bg-gradient-to-r from-secondary to-sunshine-400 text-white"
                        : "border-2 border-primary-200 bg-white text-text-dark hover:border-secondary"
                    }`}
                  >
                    <FaCode />
                    HTML Editor
                  </button>
                </div>
              </div>

              {/* Content Section - Based on Content Type */}
              {contentType === "html" ? (
                <>
                  <div>
                    <div className="mb-3 flex items-center justify-between">
                      <label className="block text-sm font-semibold text-primary-800">
                        Job Description (HTML) *
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          if (showHtmlCode) {
                            // Switching from HTML code to Visual editor
                            // Extract style/script tags and store them
                            const extracted =
                              extractStyleAndScript(htmlContent);
                            setPreservedStyleScript({
                              styles: extracted.styles,
                              scripts: extracted.scripts,
                            });
                            // Set only body content for ReactQuill
                            setHtmlContent(extracted.bodyContent);
                          } else {
                            // Switching from Visual editor to HTML code
                            // Merge preserved style/script tags back
                            const merged = mergeStyleAndScript(
                              htmlContent,
                              preservedStyleScript.styles,
                              preservedStyleScript.scripts,
                            );
                            setHtmlContent(merged);
                          }
                          setShowHtmlCode(!showHtmlCode);
                        }}
                        className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-info to-info-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition-all hover:scale-105"
                      >
                        <FaCode className="text-xs" />
                        {showHtmlCode ? "Visual Editor" : "HTML Code"}
                      </button>
                    </div>

                    {showHtmlCode ? (
                      /* HTML Code Editor */
                      <div>
                        <textarea
                          value={htmlContent}
                          onChange={(e) => setHtmlContent(e.target.value)}
                          placeholder="Enter your HTML code here..."
                          rows={15}
                          className="w-full resize-none rounded-lg border-2 border-primary-200 bg-neutral-900 px-4 py-3 font-mono text-xs text-green-400 placeholder:text-neutral-500 focus:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary-200"
                          style={{
                            fontFamily: "'Courier New', monospace",
                            lineHeight: "1.5",
                          }}
                        />
                        <p className="mt-2 text-xs text-text-light">
                          Direct HTML code editor. Make sure your HTML is valid.
                          <span className="ml-2 font-semibold text-secondary">
                            Note: Style and script tags are preserved when
                            switching to Visual Editor.
                          </span>
                        </p>
                      </div>
                    ) : (
                      /* WYSIWYG Editor */
                      <div>
                        {(preservedStyleScript.styles.length > 0 ||
                          preservedStyleScript.scripts.length > 0) && (
                          <div className="mb-3 rounded-lg border-2 border-secondary-200 bg-secondary-50 p-3">
                            <p className="text-xs font-semibold text-secondary-800">
                              ⚠️ Note: This job contains style/script tags that
                              are preserved separately. Switch to HTML Code view
                              to edit them.
                            </p>
                          </div>
                        )}
                        <div className="rounded-lg border-2 border-primary-200 bg-white">
                          <ReactQuill
                            theme="snow"
                            value={htmlContent}
                            onChange={setHtmlContent}
                            modules={quillModules}
                            placeholder="Start writing your job description..."
                            className="min-h-[300px]"
                          />
                        </div>
                        <p className="mt-2 text-xs text-text-light">
                          Use the rich text editor to format your content. You
                          can add images, videos, and links. Switch to HTML Code
                          to edit raw HTML including style and script tags.
                        </p>
                      </div>
                    )}
                    {errors.htmlContent && (
                      <p className="mt-1 text-xs text-red-600">
                        {errors.htmlContent}
                      </p>
                    )}
                  </div>

                  {/* Additional Fields for HTML Content */}
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-primary-800">
                        Location
                      </label>
                      <input
                        type="text"
                        value={state.location}
                        onChange={(e) =>
                          setState({ ...state, location: e.target.value })
                        }
                        className="w-full rounded-lg border-2 border-primary-200 bg-white px-4 py-2.5 text-sm text-text-dark focus:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary-200"
                        placeholder="Enter location (optional)"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-semibold text-primary-800">
                        Employment Type
                      </label>
                      <select
                        value={state.employmentType}
                        onChange={(e) =>
                          setState({ ...state, employmentType: e.target.value })
                        }
                        className="w-full rounded-lg border-2 border-primary-200 bg-white px-4 py-2.5 text-sm text-text-dark focus:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary-200"
                      >
                        <option value="full-time">Full-time</option>
                        <option value="part-time">Part-time</option>
                        <option value="contract">Contract</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-primary-800">
                        Salary Range
                      </label>
                      <input
                        type="text"
                        value={state.salaryRange}
                        onChange={(e) =>
                          setState({ ...state, salaryRange: e.target.value })
                        }
                        className="w-full rounded-lg border-2 border-primary-200 bg-white px-4 py-2.5 text-sm text-text-dark focus:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary-200"
                        placeholder="e.g., $50,000 - $70,000"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-semibold text-primary-800">
                        Application Deadline
                      </label>
                      <input
                        type="date"
                        value={state.applicationDeadline}
                        onChange={(e) =>
                          setState({
                            ...state,
                            applicationDeadline: e.target.value,
                          })
                        }
                        className="w-full rounded-lg border-2 border-primary-200 bg-white px-4 py-2.5 text-sm text-text-dark focus:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary-200"
                      />
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-primary-800">
                      Description *
                    </label>
                    <textarea
                      value={state.description}
                      onChange={(e) =>
                        setState({ ...state, description: e.target.value })
                      }
                      rows={6}
                      className="w-full rounded-lg border-2 border-primary-200 bg-white px-4 py-2.5 text-sm text-text-dark focus:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary-200"
                      placeholder="Enter job description"
                    />
                    {errors.description && (
                      <p className="mt-1 text-xs text-red-600">
                        {errors.description}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-primary-800">
                      Requirements (comma-separated)
                    </label>
                    <textarea
                      value={state.requirements}
                      onChange={(e) =>
                        setState({ ...state, requirements: e.target.value })
                      }
                      rows={4}
                      className="w-full rounded-lg border-2 border-primary-200 bg-white px-4 py-2.5 text-sm text-text-dark focus:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary-200"
                      placeholder="Requirement 1, Requirement 2, Requirement 3..."
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-primary-800">
                        Location
                      </label>
                      <input
                        type="text"
                        value={state.location}
                        onChange={(e) =>
                          setState({ ...state, location: e.target.value })
                        }
                        className="w-full rounded-lg border-2 border-primary-200 bg-white px-4 py-2.5 text-sm text-text-dark focus:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary-200"
                        placeholder="Enter location (optional)"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-semibold text-primary-800">
                        Employment Type *
                      </label>
                      <select
                        value={state.employmentType}
                        onChange={(e) =>
                          setState({ ...state, employmentType: e.target.value })
                        }
                        className="w-full rounded-lg border-2 border-primary-200 bg-white px-4 py-2.5 text-sm text-text-dark focus:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary-200"
                      >
                        <option value="full-time">Full-time</option>
                        <option value="part-time">Part-time</option>
                        <option value="contract">Contract</option>
                      </select>
                      {errors.employmentType && (
                        <p className="mt-1 text-xs text-red-600">
                          {errors.employmentType}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-primary-800">
                        Salary Range
                      </label>
                      <input
                        type="text"
                        value={state.salaryRange}
                        onChange={(e) =>
                          setState({ ...state, salaryRange: e.target.value })
                        }
                        className="w-full rounded-lg border-2 border-primary-200 bg-white px-4 py-2.5 text-sm text-text-dark focus:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary-200"
                        placeholder="e.g., $50,000 - $70,000"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-semibold text-primary-800">
                        Application Deadline
                      </label>
                      <input
                        type="date"
                        value={state.applicationDeadline}
                        onChange={(e) =>
                          setState({
                            ...state,
                            applicationDeadline: e.target.value,
                          })
                        }
                        className="w-full rounded-lg border-2 border-primary-200 bg-white px-4 py-2.5 text-sm text-text-dark focus:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary-200"
                      />
                    </div>
                  </div>
                </>
              )}

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={state.isActive}
                  onChange={(e) =>
                    setState({ ...state, isActive: e.target.checked })
                  }
                  className="h-4 w-4 rounded border-primary-300 text-secondary accent-secondary focus:ring-2 focus:ring-secondary-200"
                />
                <label className="text-sm font-semibold text-primary-800">
                  Active (Job is currently accepting applications)
                </label>
              </div>
            </div>

            <div className="mt-8 flex gap-3">
              <button
                type="button"
                onClick={() => navigate("/admin/dashboard/jobs")}
                className="rounded-lg border-2 border-primary-200 bg-white px-6 py-2.5 font-semibold text-primary-700 transition-colors hover:bg-primary-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loader}
                className="flex-1 rounded-lg bg-gradient-to-r from-secondary to-sunshine-400 px-6 py-2.5 font-semibold text-white transition-all hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loader ? (
                  <PropagateLoader
                    cssOverride={overrideStyle}
                    color="#ffffff"
                    size={8}
                  />
                ) : jobId ? (
                  "Update Job"
                ) : (
                  "Create Job"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddJob;
