"use client";

const DeleteConfirmationModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  isLoading, 
}) => {
  if (!isOpen) {return null;}

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-lg border border-neutral-200 bg-white p-6 shadow-xl">
        <h3 className="mb-4 text-lg font-semibold text-neutral-900">
          Confirm Deletion
        </h3>
        <p className="mb-6 text-sm text-neutral-600">
          Are you sure you want to delete this comment? This action cannot be undone.
        </p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="rounded-lg border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50 hover:border-neutral-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isLoading ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmationModal;