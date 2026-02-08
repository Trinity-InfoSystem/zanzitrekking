import { useState, useRef, useEffect } from "react";
import { FaPaperclip, FaPaperPlane } from "react-icons/fa";

const MessageInput = ({
  message,
  handleInputChange,
  handleSubmit,
  handleFileUpload,
}) => {
  const [filePreview, setFilePreview] = useState(null);
  const fileInputRef = useRef(null);

  const removeFilePreview = () => {
    setFilePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check file size (max 10MB)
    if (file.size > 50 * 1024 * 1024) {
      alert("File size should be less than 50MB");
      return;
    }

    // Handle image preview
    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = () => {
        setFilePreview({
          url: reader.result,
          name: file.name,
          type: "image",
        });
      };
      reader.readAsDataURL(file);
    } else {
      setFilePreview({
        url: null,
        name: file.name,
        type: "file",
      });
    }
    // Pass file to parent component
    handleFileUpload(file);
  };

  return (
    <div className="border-t border-gray-700 p-4">
      {/* File preview */}
      {filePreview && (
        <div className="mb-2 flex items-center justify-between rounded-lg bg-gray-100 p-2 dark:bg-gray-700">
          <div className="flex items-center">
            {filePreview.type === "image" ? (
              <img
                src={filePreview.url}
                alt="Preview"
                className="h-12 w-12 rounded object-cover"
              />
            ) : (
              <div className="flex h-12 w-12 items-center justify-center rounded bg-gray-200 dark:bg-gray-600">
                <FaPaperclip className="text-gray-500" />
              </div>
            )}
            <span className="ml-2 text-sm text-gray-800 dark:text-gray-200">
              {filePreview.name}
            </span>
          </div>
          <button
            onClick={removeFilePreview}
            className="ml-2 rounded-full p-1 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-600"
          >
            &times;
          </button>
        </div>
      )}

      <form
        onSubmit={(e) => {
          handleSubmit(e);
          setFilePreview(null);
        }}
        className="flex items-center space-x-2"
      >
        <div className="flex-1">
          <input
            type="text"
            value={message}
            onChange={handleInputChange}
            placeholder="Type a message..."
            className="w-full rounded-lg border border-gray-600 bg-gray-700 px-4 py-2 text-white placeholder-gray-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </div>
        <label className="cursor-pointer rounded-lg bg-gray-700 p-2 text-gray-400 hover:bg-gray-600 hover:text-white">
          <FaPaperclip className="h-5 w-5" />
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileChange}
            className="hidden"
            accept="image/*,application/pdf,.doc,.docx,.txt"
          />
        </label>
        <button
          type="submit"
          className="rounded-lg bg-emerald-600 p-2 text-white hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
        >
          <FaPaperPlane className="h-5 w-5" />
        </button>
      </form>
    </div>
  );
};

export default MessageInput;
