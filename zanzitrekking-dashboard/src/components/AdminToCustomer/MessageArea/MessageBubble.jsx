import { useState } from "react";
import { FaDownload, FaTrash, FaPaperclip } from "react-icons/fa";
import { API_URL, LIVE_IMAGE_DOWNLOAD_URL } from "../../../utils/constants";

const MessageBubble = ({ message, isCurrentUser, onDelete }) => {
  const [isDownloading, setIsDownloading] = useState(false);
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
    const downloadUrl = `${LIVE_IMAGE_DOWNLOAD_URL}/api/download-file/${encodeURIComponent(
      storedFileName,
    )}?original=${encodeURIComponent(displayFileName)}`;

    try {
      const response = await fetch(downloadUrl, {
        method: "GET",
        mode: "cors",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = displayFileName;
      link.style.display = "none";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error("Download failed:", error);
      window.open(downloadUrl, "_blank");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className={`flex ${isCurrentUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-xs rounded-lg px-4 py-2 ${isCurrentUser ? "bg-violet-500 text-white" : "bg-gray-200 text-gray-800"}`}
      >
        {message.content && <p>{message.content}</p>}

        {isImage && message.attachment && (
          <div className="mt-2">
            <img
              src={API_URL + "/public" + message.attachment}
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
              className="text-violet-300 hover:text-violet-200 disabled:opacity-50"
              title="Download file"
            >
              <FaDownload className="h-3 w-3" />
            </button>
          </div>
        )}

        <div className="mt-3 flex justify-between">
          <p
            className={`mt-1 text-xs ${isCurrentUser ? "text-violet-200" : "text-gray-500"}`}
          >
            {new Date(message.createdAt).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>

          {isCurrentUser && (
            <button onClick={onDelete} className="ml-2 text-red-500">
              <FaTrash className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
