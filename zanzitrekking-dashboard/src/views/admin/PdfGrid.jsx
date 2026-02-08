import { FaCheck, FaEdit, FaTrash, FaUpload, FaEye } from "react-icons/fa";
import { isViewer } from "../../utils/roleVerification";
import { LIVE_IMAGE_DOWNLOAD_URL } from "../../utils/constants";

const PdfGrid = ({
  pdfs,
  PDF_TYPES,
  PDF_ICONS,
  formatFileSize,
  openModal,
  handleDelete,
  role,
}) => (
  <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
    {Object.values(PDF_TYPES).map((type) => {
      const pdf = pdfs.find((p) => p.type === type);
      const icon = PDF_ICONS[type] || "📄";
      let url = pdf?.url?.split("/");
      let mainUrl = null;
      if (url) {
        mainUrl = url[url.length - 2] + "/" + url[url.length - 1];
      }

      return (
        <div
          key={type}
          className="group overflow-hidden rounded-2xl bg-white shadow-nature-medium ring-1 ring-primary-100 transition-all duration-300 hover:scale-[1.02] hover:shadow-nature-large"
        >
          {/* Card Header */}
          <div className="relative bg-gradient-to-br from-primary-50 to-secondary-50 p-6 pb-4">
            <div className="flex items-start gap-4">
              <div className="shadow-coral-soft flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-r from-secondary to-sunshine-400 text-2xl">
                {icon}
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-lg font-bold leading-tight text-primary-800">
                  {type}
                </h3>
                {pdf && (
                  <div className="mt-2 space-y-1">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 animate-pulse rounded-full bg-success-500" />
                      <p className="text-sm text-text">
                        Updated {new Date(pdf.updatedAt).toLocaleDateString()}
                      </p>
                    </div>
                    {pdf.size && (
                      <p className="text-xs text-text-light">
                        Size: {formatFileSize(pdf.size)}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
            {pdf && (
              <div className="absolute right-4 top-4">
                <span className="inline-flex items-center gap-1 rounded-full bg-success-100 px-2 py-1 text-xs font-semibold text-success-700">
                  <FaCheck className="h-3 w-3" /> Active
                </span>
              </div>
            )}
          </div>
          {/* Card Actions */}
          <div className="border-t border-primary-100 bg-white px-6 pb-6 pt-4">
            {pdf ? (
              <div className="flex gap-2">
                <a
                  href={`${LIVE_IMAGE_DOWNLOAD_URL}/${mainUrl}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group/btn inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-primary via-primary-600 to-primary-700 px-4 py-3 text-sm font-semibold text-white shadow-nature-soft transition-all duration-200 hover:scale-105 hover:shadow-nature-medium"
                >
                  <FaEye className="transition-transform group-hover/btn:scale-110" />{" "}
                  View
                </a>
                {!isViewer(role) && (
                  <>
                    <button
                      onClick={() => openModal(type, true)}
                      className="shadow-sunshine-soft hover:shadow-sunshine-medium group/btn relative overflow-hidden rounded-lg bg-gradient-to-r from-sunshine-400 to-sunshine-500 px-4 py-3 text-white transition-all duration-300 hover:scale-110"
                    >
                      <FaEdit className="transition-transform group-hover/btn:scale-110" />
                    </button>
                    <button
                      onClick={() => handleDelete(pdf._id, type)}
                      className="group/btn relative overflow-hidden rounded-lg bg-gradient-to-r from-accent to-accent-600 px-4 py-3 text-white shadow-sm transition-all duration-300 hover:scale-110"
                    >
                      <FaTrash className="transition-transform group-hover/btn:scale-110" />
                    </button>
                  </>
                )}
              </div>
            ) : (
              <button
                onClick={() => openModal(type)}
                className="shadow-coral-soft hover:shadow-coral-medium group/btn inline-flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-secondary to-sunshine-400 px-4 py-3 text-sm font-semibold text-white transition-all duration-200 hover:scale-105"
              >
                <FaUpload className="transition-transform group-hover/btn:scale-110" />{" "}
                Upload Document
              </button>
            )}
          </div>
        </div>
      );
    })}
  </div>
);

export default PdfGrid;
