import { useState } from "react";
import { FaFile, FaDownload, FaPaperclip, FaTrash } from "react-icons/fa";
import { LIVE_IMAGE_DOWNLOAD_URL } from "../../../utils/constants";

const MessageBubble = ({ message, isCurrentUser, onDelete }) => {
  const [isDownloading, setIsDownloading] = useState(false);

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const isImage = message.attachmentType === "image";
  const isFile = message.attachmentType && !isImage;

  const storedFileName = message.attachment
    ? message.attachment.split(/[\\/]/).pop()
    : null;
  const displayFileName =
    message.attachmentOriginalName || storedFileName || "attachment";

  const handleDownload = async () => {
    if (isDownloading || !storedFileName) return;

    setIsDownloading(true);

    try {
      const downloadUrl = `${LIVE_IMAGE_DOWNLOAD_URL}/api/download-file/${encodeURIComponent(
        storedFileName,
      )}?original=${encodeURIComponent(displayFileName)}`;

      const response = await fetch(downloadUrl, {
        method: "GET",
        mode: "cors",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = displayFileName;
      link.style.display = "none";

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      const fallbackUrl = `${LIVE_IMAGE_DOWNLOAD_URL}/api/download-file/${encodeURIComponent(
        storedFileName,
      )}?original=${encodeURIComponent(displayFileName)}`;
      window.open(fallbackUrl, "_blank");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className={`flex ${isCurrentUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-xs rounded-lg px-4 py-2 ${
          isCurrentUser
            ? "bg-emerald-600 text-white"
            : "bg-gray-700 text-gray-100"
        }`}
      >
        {message.content && <p className="text-sm">{message.content}</p>}

        {isImage && message.attachment && (
          <div className="mt-2">
            <img
              src={import.meta.env.VITE_API_BASE_URL + "/public" + message.attachment}
              alt="Attachment"
              className="max-h-48 rounded object-cover"
            />
            <button
              onClick={handleDownload}
              disabled={isDownloading}
              className="mt-1 flex items-center text-sm text-white hover:underline disabled:opacity-50"
            >
              <FaDownload className="mr-1" />
              {isDownloading ? "Downloading..." : `Download ${displayFileName}`}
            </button>
          </div>
        )}

        {isFile && message.attachment && (
          <div className="mt-2 flex items-center space-x-2">
            <FaPaperclip className="h-4 w-4" />
            <div className="flex-1 truncate text-xs">
              {displayFileName}
            </div>
            <button
              onClick={handleDownload}
              disabled={isDownloading}
              className="text-emerald-300 hover:text-emerald-200 disabled:opacity-50"
              title="Download file"
            >
              <FaDownload className="h-3 w-3" />
            </button>
          </div>
        )}

        <div className="mt-3 flex justify-between">
          <p
            className={`mt-1 text-xs ${
              isCurrentUser ? "text-emerald-200" : "text-gray-400"
            }`}
          >
            {formatTime(message.createdAt)}
          </p>

          {isCurrentUser && (
            <button
              onClick={onDelete}
              className="ml-2 text-red-500 hover:text-red-400"
            >
              <FaTrash className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
