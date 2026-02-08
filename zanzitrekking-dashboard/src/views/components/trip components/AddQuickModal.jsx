import React, { useState } from "react";

// Prevent background scroll when modal is open
import { useEffect } from "react";

const AddQuickModal = ({
  open,
  onClose,
  onSubmit,
  title,
  fields,
  loading,
  error,
  size = "sm",
}) => {
  const [form, setForm] = useState(() =>
    Object.fromEntries(
      fields.map((f) => [f.name, f.type === "file" ? null : ""]),
    ),
  );
  const [localError, setLocalError] = useState("");
  const [isDragActive, setIsDragActive] = useState(false);
  const [imagePreviews, setImagePreviews] = useState([]);
  const fileInputRef = React.useRef();

  // Prevent background scroll when modal is open
  useEffect(() => {
    if (open) {
      document.body.classList.add("overflow-hidden");
    } else {
      document.body.classList.remove("overflow-hidden");
    }
    return () => {
      document.body.classList.remove("overflow-hidden");
    };
  }, [open]);

  React.useEffect(() => {
    setForm(
      Object.fromEntries(
        fields.map((f) => [f.name, f.type === "file" ? null : ""]),
      ),
    );
    setLocalError("");
  }, [open, fields]);

  if (!open) return null;

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    if (type === "file" && e.target.multiple) {
      const newFiles = Array.from(files);
      setForm((prev) => ({
        ...prev,
        [name]: [...(prev[name] || []), ...newFiles],
      }));
      setImagePreviews((prev) => [
        ...prev,
        ...newFiles.map((file) => URL.createObjectURL(file)),
      ]);
    } else if (type === "file") {
      setForm((prev) => ({ ...prev, [name]: files[0] }));
      setImagePreviews([URL.createObjectURL(files[0])]);
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simple required check
    for (const field of fields) {
      if (
        field.required &&
        (!form[field.name] || (field.type === "file" && !form[field.name]))
      ) {
        setLocalError(`${field.label} is required`);
        return;
      }
    }
    setLocalError("");
    onSubmit(form);
  };

  function handleDrop(e, fieldName) {
    e.preventDefault();
    setIsDragActive(false);
    const newFiles = Array.from(e.dataTransfer.files);
    setForm((prev) => ({
      ...prev,
      [fieldName]: [...(prev[fieldName] || []), ...newFiles],
    }));
    setImagePreviews((prev) => [
      ...prev,
      ...newFiles.map((file) => URL.createObjectURL(file)),
    ]);
  }
  function handleDragOver(e) {
    e.preventDefault();
    setIsDragActive(true);
  }
  function handleDragLeave(e) {
    e.preventDefault();
    setIsDragActive(false);
  }
  function handleRemoveImage(idx, fieldName) {
    setForm((prev) => ({
      ...prev,
      [fieldName]: prev[fieldName].filter((_, i) => i !== idx),
    }));
    setImagePreviews((prev) => prev.filter((_, i) => i !== idx));
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-primary-900/20 backdrop-blur-sm">
      <div
        className={`max-h-[80vh] w-full max-w-${size} overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl ring-1 ring-primary-100`}
      >
        <h2 className="mb-4 text-lg font-bold text-primary-800">{title}</h2>
        <form onSubmit={handleSubmit}>
          {fields.map((field) => (
            <div key={field.name} className="mb-3">
              <label className="mb-1 block text-sm font-medium text-primary-800">
                {field.label}
              </label>
              {field.type === "file" && field.multiple ? (
                <div
                  className={`mb-2 flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-4 py-8 transition-all duration-200 ${
                    isDragActive
                      ? "shadow-coral-soft border-secondary bg-secondary-50"
                      : "border-primary-300 bg-primary-50/30 hover:border-secondary hover:bg-secondary-50/30"
                  }`}
                  onClick={() => fileInputRef.current.click()}
                  onDrop={(e) => handleDrop(e, field.name)}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                >
                  <p className="mb-2 text-text-light">
                    Drag & drop images here, or{" "}
                    <span className="font-semibold text-secondary underline">
                      click to select
                    </span>
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    name={field.name}
                    accept={field.accept || undefined}
                    onChange={handleChange}
                    className="hidden"
                    multiple
                  />
                  {/* Preview selected images */}
                  <div className="mt-2 flex flex-wrap gap-2">
                    {Array.isArray(form[field.name]) &&
                      form[field.name].map((img, idx) => (
                        <div key={idx} className="relative">
                          <img
                            src={URL.createObjectURL(img)}
                            alt="preview"
                            className="h-16 w-16 rounded-lg border-2 border-success object-cover shadow-sm transition-all hover:scale-105"
                          />
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveImage(idx, field.name);
                            }}
                            className="absolute -right-2 -top-2 rounded-full bg-gradient-to-r from-accent to-accent-600 p-1 text-xs text-white opacity-90 shadow-sm transition-all hover:scale-110 hover:opacity-100"
                            title="Remove image"
                          >
                            &times;
                          </button>
                        </div>
                      ))}
                  </div>
                </div>
              ) : field.type === "file" ? (
                <input
                  type="file"
                  name={field.name}
                  accept={field.accept || undefined}
                  onChange={handleChange}
                  className="w-full rounded-xl border-2 border-primary-200 bg-white px-3 py-2 text-text-dark focus:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary-200"
                />
              ) : field.type === "select" ? (
                <select
                  name={field.name}
                  value={form[field.name] || ""}
                  onChange={handleChange}
                  className="w-full rounded-xl border-2 border-primary-200 bg-white px-3 py-2 text-text-dark focus:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary-200"
                >
                  <option value="">Select {field.label}</option>
                  {Array.isArray(field.options) &&
                    field.options.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                </select>
              ) : (
                <input
                  type={field.type}
                  name={field.name}
                  value={form[field.name] || ""}
                  onChange={handleChange}
                  className="w-full rounded-xl border-2 border-primary-200 bg-white px-3 py-2 text-text-dark focus:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary-200"
                  placeholder={field.placeholder || ""}
                />
              )}
            </div>
          ))}
          {(localError || error) && (
            <div className="mb-2 text-accent">{localError || error}</div>
          )}
          <div className="mt-4 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl bg-neutral-200 px-4 py-2 font-medium text-text-dark transition-colors hover:bg-neutral-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="shadow-coral-medium hover:shadow-coral-large rounded-xl bg-gradient-to-r from-secondary to-sunshine-400 px-4 py-2 font-semibold text-white transition-all hover:scale-105 disabled:opacity-50"
              disabled={loading}
            >
              {loading ? "Adding..." : "Add"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddQuickModal;
