"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  FaEdit,
  FaTrash,
  FaFilePdf,
  FaUpload,
  FaEye,
  FaPlus,
  FaClock,
  FaCheck,
} from "react-icons/fa";
import { IoCloseCircle, IoDocumentText, IoCloudUpload } from "react-icons/io5";
import { PropagateLoader } from "react-spinners";
import {
  uploadPdfs,
  deletePdfs,
  updatePdfs,
  getPdfs,
  clearMessage,
} from "../../store/Reducers/pdfReducer";
import toast from "react-hot-toast";
import HeaderText from "./HeaderText";
import PdfStatsOverview from "./PdfStatsOverview";
import PdfGrid from "./PdfGrid";
import PdfUploadModal from "./PdfUploadModal";
const PDF_TYPES = {
  PRICE_LIST_MOUNTAIN: "Price List Mountain Climbing",
  PRICE_LIST_SHORT_SAFARIS: "Price List Short Safaris",
  PRICE_LIST_LODGE: "Price List Lodge Safaris",
  PRICE_LIST_CAMPING: "Price List Camping Safaris",
  TERMS_CONDITIONS: "Terms and Conditions Zanzi Trekking and Safaris",
  PICTURES_PRICE: "Pictures Price Categories",
};

const PDF_ICONS = {
  "Price List Mountain Climbing": "🏔️",
  "Price List Short Safaris": "🦁",
  "Price List Lodge Safaris": "🏨",
  "Price List Camping Safaris": "⛺",
  "Terms and Conditions Zanzi Trekking and Safaris": "📋",
  "Pictures Price Categories": "📸",
};

const PdfManager = () => {
  const dispatch = useDispatch();
  const { loader, successMessage, errorMessage, pdfs } = useSelector(
    (state) => state.pdf,
  );
  const role = useSelector((state) => state.auth?.userInfo?.role);

  const [show, setShow] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedPdfType, setSelectedPdfType] = useState("");
  const [errors, setErrors] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [draggedOver, setDraggedOver] = useState(false);

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      setErrors("Please select a PDF file");
      return;
    }

    setSelectedFile(file);
    setErrors("");
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDraggedOver(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type === "application/pdf") {
      setSelectedFile(file);
      setErrors("");
    } else {
      setErrors("Please select a PDF file");
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedFile || !selectedPdfType) {
      setErrors("Please select both a PDF file and its type");
      return;
    }

    const formData = new FormData();
    formData.append("pdf", selectedFile);
    formData.append("type", selectedPdfType);

    const existingPdf = pdfs.find((pdf) => pdf.type === selectedPdfType);

    if (isUpdating && existingPdf) {
      dispatch(updatePdfs({ formData, pdfId: existingPdf._id }));
    } else {
      dispatch(uploadPdfs(formData));
    }

    // Reset form
    setShow(false);
    setSelectedFile(null);
    setSelectedPdfType("");
    setIsUpdating(false);
  };

  const handleDelete = (pdfId, pdfType) => {
    if (window.confirm(`Are you sure you want to delete ${pdfType}?`)) {
      dispatch(deletePdfs(pdfId));
    }
  };

  const openModal = (type = "", forUpdate = false) => {
    setSelectedPdfType(type);
    setIsUpdating(forUpdate);
    setSelectedFile(null);
    setErrors("");
    setShow(true);
  };

  useEffect(() => {
    dispatch(getPdfs());
  }, [dispatch]);

  useEffect(() => {
    if (errorMessage) {
      toast.error(errorMessage);
      dispatch(clearMessage());
    }
    if (successMessage) {
      toast.success(successMessage);
      dispatch(getPdfs());
      dispatch(clearMessage());
    }
  }, [successMessage, errorMessage, dispatch]);

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return (
      Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-primary-50/30 p-4 md:p-5">
      <div className="mx-auto max-w-7xl">
        <HeaderText title="PDF Document Manager" />
        <div className="mb-6">
          <div className="flex items-center justify-end gap-6">
            <button
              onClick={() => openModal()}
              className="shadow-coral-medium hover:shadow-coral-large group inline-flex items-center gap-3 rounded-2xl bg-gradient-to-r from-secondary to-sunshine-400 px-6 py-3 text-lg font-semibold text-white transition-all duration-300 hover:scale-105 focus:outline-none"
            >
              <FaPlus className="transition-transform group-hover:rotate-90" />
              Upload Document
            </button>
          </div>
        </div>
        {/* Stats Overview */}
        <PdfStatsOverview pdfs={pdfs} PDF_TYPES={PDF_TYPES} />
        {/* Document Grid */}
        <PdfGrid
          pdfs={pdfs?.pdfs || pdfs}
          PDF_TYPES={PDF_TYPES}
          PDF_ICONS={PDF_ICONS}
          formatFileSize={formatFileSize}
          openModal={openModal}
          handleDelete={handleDelete}
          role={role}
        />
        {/* Upload/Update Modal */}
        <PdfUploadModal
          show={show}
          setShow={setShow}
          selectedFile={selectedFile}
          setSelectedFile={setSelectedFile}
          selectedPdfType={selectedPdfType}
          setSelectedPdfType={setSelectedPdfType}
          errors={errors}
          setErrors={setErrors}
          isUpdating={isUpdating}
          loader={loader}
          PDF_TYPES={PDF_TYPES}
          handleFileSelect={handleFileSelect}
          handleDrop={handleDrop}
          handleSubmit={handleSubmit}
          formatFileSize={formatFileSize}
          draggedOver={draggedOver}
          setDraggedOver={setDraggedOver}
        />
      </div>
    </div>
  );
};

export default PdfManager;
