import { FaCheck, FaClock } from "react-icons/fa";
import { IoDocumentText } from "react-icons/io5";

const PdfStatsOverview = ({ pdfs, PDF_TYPES }) => (
  <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
    <div className="rounded-2xl bg-gradient-to-br from-success via-success-500 to-success-600 p-6 shadow-nature-soft">
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white">
          <FaCheck className="h-6 w-6 text-success-600" />
        </div>
        <div>
          <p className="text-2xl font-bold text-white">{pdfs.length}</p>
          <p className="text-sm text-white/90">Uploaded Documents</p>
        </div>
      </div>
    </div>
    <div className="shadow-sunshine-soft rounded-2xl bg-gradient-to-br from-info via-info-500 to-info-600 p-6">
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white">
          <IoDocumentText className="h-6 w-6 text-info-600" />
        </div>
        <div>
          <p className="text-2xl font-bold text-white">
            {Object.keys(PDF_TYPES).length}
          </p>
          <p className="text-sm text-white/90">Document Types</p>
        </div>
      </div>
    </div>
    <div className="rounded-2xl bg-gradient-to-br from-sunshine via-sunshine-500 to-sunshine-600 p-6 shadow-sm">
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white">
          <FaClock className="h-6 w-6 text-sunshine-600" />
        </div>
        <div>
          <p className="text-2xl font-bold text-white">
            {Object.keys(PDF_TYPES).length - pdfs.length}
          </p>
          <p className="text-sm text-white/90">Pending Uploads</p>
        </div>
      </div>
    </div>
  </div>
);

export default PdfStatsOverview;
