import { IoCloseCircle, IoCloudUpload } from "react-icons/io5";
import { FaFilePdf, FaUpload } from "react-icons/fa";
import { PropagateLoader } from "react-spinners";

const PdfUploadModal = ({
  show,
  setShow,
  selectedFile,
  setSelectedFile,
  selectedPdfType,
  setSelectedPdfType,
  errors,
  setErrors,
  isUpdating,
  loader,
  PDF_TYPES,
  handleFileSelect,
  handleDrop,
  handleSubmit,
  formatFileSize,
  draggedOver,
  setDraggedOver,
}) => {
  if (!show) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-primary-900/20 backdrop-blur-sm">
      <div className="relative mx-4 w-full max-w-lg">
        <div className="overflow-hidden rounded-3xl bg-white shadow-nature-large ring-1 ring-primary-200">
          {/* Modal Header */}
          <div className="relative bg-gradient-to-r from-primary via-primary-600 to-primary-700 p-8 pb-6">
            <div className="mb-2 flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white shadow-lg">
                <IoCloudUpload className="h-6 w-6 text-secondary" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">
                  {isUpdating ? "Update Document" : "Upload New Document"}
                </h2>
                <p className="text-sm text-white/90">
                  {isUpdating
                    ? `Updating: ${selectedPdfType}`
                    : "Add a new PDF document"}
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                setShow(false);
                setSelectedFile(null);
                setSelectedPdfType("");
                setErrors("");
              }}
              className="absolute right-6 top-6 flex h-10 w-10 items-center justify-center rounded-full text-white/80 transition-all hover:scale-110 hover:text-white"
            >
              <IoCloseCircle className="h-6 w-6" />
            </button>
          </div>
          {/* Modal Content */}
          <form onSubmit={handleSubmit} className="space-y-6 px-8 pb-8 pt-6">
            {!selectedPdfType && (
              <div>
                <label className="mb-3 block text-sm font-semibold text-primary-800">
                  Document Type
                </label>
                <select
                  value={selectedPdfType}
                  onChange={(e) => setSelectedPdfType(e.target.value)}
                  className="w-full rounded-xl border-2 border-primary-200 bg-white px-4 py-3 text-text-dark transition-all focus:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary-200"
                >
                  <option value="">Select document type</option>
                  {Object.values(PDF_TYPES).map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>
            )}
            {/* File Upload Area */}
            <div>
              <label className="mb-3 block text-sm font-semibold text-primary-800">
                PDF Document
              </label>
              <label
                htmlFor="pdf"
                className={`group relative flex h-40 cursor-pointer items-center justify-center rounded-2xl border-2 border-dashed transition-all duration-300 ${
                  draggedOver
                    ? "border-info-500 bg-info-50"
                    : selectedFile
                      ? "border-success-500 bg-success-50"
                      : "border-primary-200 bg-primary-50/30 hover:border-secondary hover:bg-secondary-50"
                }`}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDraggedOver(true);
                }}
                onDragLeave={() => setDraggedOver(false)}
                onDrop={handleDrop}
              >
                <div className="text-center">
                  {selectedFile ? (
                    <>
                      <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-success-100">
                        <FaFilePdf className="h-8 w-8 text-success-600" />
                      </div>
                      <p className="text-lg font-semibold text-success-700">
                        {selectedFile.name}
                      </p>
                      <p className="text-sm text-text">
                        {formatFileSize(selectedFile.size)}
                      </p>
                    </>
                  ) : (
                    <>
                      <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-100">
                        <FaUpload className="h-8 w-8 text-primary-600" />
                      </div>
                      <p className="text-lg font-semibold text-primary-800">
                        Drop your PDF here
                      </p>
                      <p className="text-sm text-text-light">
                        or click to browse files
                      </p>
                    </>
                  )}
                </div>
              </label>
              <input
                type="file"
                id="pdf"
                onChange={handleFileSelect}
                className="hidden"
                accept=".pdf,application/pdf"
              />
            </div>
            {errors && (
              <div className="rounded-xl border-2 border-accent-200 bg-accent-50 p-4">
                <p className="text-sm font-semibold text-accent-700">
                  {errors}
                </p>
              </div>
            )}
            <button
              type="submit"
              disabled={loader}
              className="shadow-coral-medium hover:shadow-coral-large group relative min-h-14 w-full overflow-hidden rounded-2xl bg-gradient-to-r from-secondary to-sunshine-400 px-6 py-4 text-lg font-semibold text-white transition-all duration-300 hover:scale-[1.02] focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
            >
              <div className="relative flex items-center justify-center gap-3">
                {loader ? (
                  <PropagateLoader color="#ffffff" size={12} />
                ) : (
                  <>
                    <FaUpload className="transition-transform group-hover:scale-110" />
                    <span>
                      {isUpdating ? "Update Document" : "Upload Document"}
                    </span>
                  </>
                )}
              </div>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PdfUploadModal;
