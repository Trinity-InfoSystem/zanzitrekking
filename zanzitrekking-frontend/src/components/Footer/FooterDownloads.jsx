import { Download, FileDown } from "lucide-react";

const FooterDownloads = ({ pdfs }) => {
  const formatPdfName = (type) => {
    if (type === "Terms and Conditions Zanzi Trekking and Safaris") {
      return "Terms & Conditions";
    }
    return type;
  };

  return (
    <div className="lg:col-span-1">
      <div className="mb-6 flex items-center gap-2.5">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-accent-100 to-accent-200">
          <FileDown className="h-4.5 w-4.5 text-accent-600" />
        </div>
        <h3 className="text-base font-semibold text-text-dark">Resources</h3>
      </div>

      <div className="space-y-2.5">
        {pdfs && pdfs.length > 0 ? (
          pdfs.map((pdf) => (
            <a
              key={pdf._id}
              href={pdf.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center justify-between rounded-lg border border-neutral-200 bg-white p-3 transition-all duration-300 hover:border-accent-300 hover:shadow-md"
              title={`Download ${pdf.type}`}
            >
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-neutral-100 text-neutral-600 transition-all duration-300 group-hover:bg-accent-100 group-hover:text-accent-600">
                  <FileDown className="h-4 w-4" />
                </div>
                <span className="text-sm font-medium text-text-dark">
                  {formatPdfName(pdf.type)}
                </span>
              </div>
              <Download className="h-4 w-4 text-neutral-400 transition-all duration-300 group-hover:translate-y-0.5 group-hover:text-accent-600" />
            </a>
          ))
        ) : (
          <div className="rounded-xl bg-neutral-50 p-6 text-center">
            <FileDown className="mx-auto mb-2 h-8 w-8 text-neutral-400" />
            <p className="text-xs text-neutral-500">Resources coming soon</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FooterDownloads;
