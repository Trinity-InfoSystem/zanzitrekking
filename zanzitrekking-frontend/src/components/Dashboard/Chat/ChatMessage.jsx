import { useState } from "react";
import { FaDownload, FaTrash } from "react-icons/fa";
import { API_URL, getApiOrigin } from "../../../utils/constants";
import { useDispatch } from "react-redux";
import { delete_message } from "../../../store/reducers/chatReducer";
import toast from "react-hot-toast";

const ChatMessage = ({ message, isCurrentUser }) => {
  const dispatch = useDispatch();
  const [isDownloading, setIsDownloading] = useState(false);
  const isImage = message.attachmentType === "image";
  const isFile = message.attachmentType && !isImage;

  // Function to get initials from name
  const getInitials = (name) => {
    if (!name) {return "U";} // Default if no name
    const names = name.split(" ");
    let initials = names[0].substring(0, 1).toUpperCase();
    if (names.length > 1) {
      initials += names[names.length - 1].substring(0, 1).toUpperCase();
    }
    return initials;
  };

  // Get sender's name (assuming message.sender has name property)
  const senderName = message.sender?.name || "User";
  const initials = getInitials(senderName);

  const storedFileName = message.attachment
    ? message.attachment.split(/[\\/]/).pop()
    : null;
  const displayFileName =
    message.attachmentOriginalName || storedFileName || "attachment";

  const handleDownload = async () => {
    if (!storedFileName || isDownloading) {return;}
    setIsDownloading(true);

    const downloadUrl = `${API_URL}/api/download-file/${encodeURIComponent(
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

  const handleDelete = () => {
    dispatch(delete_message(message._id));
    toast.success("Message deleted successfully");
  };

  return (
    <div
      className={`flex ${isCurrentUser ? "flex-row-reverse" : "flex-row"} items-end gap-3`}
    >
      {/* Profile circle with initials */}
      <div
        className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full font-semibold text-white ${isCurrentUser ? "bg-gradient-to-r from-primary to-primary-600" : "bg-secondary"}`}
      >
        {initials}
      </div>

      {/* Message content */}
      <div
        className={`shadow-nature-soft max-w-[70%] rounded-2xl px-4 py-2 ${
          isCurrentUser
            ? "bg-primary text-white"
            : "border border-primary/10 bg-white/80 text-text-dark"
        }`}
      >
        {message.content && !isFile && <p>{message.content}</p>}

        {isImage && message.attachment && (
          <div className="mt-2">
            <img
              src={`${getApiOrigin()}/public${message.attachment}`}
              alt="Attachment"
              className="max-h-48 rounded object-cover"
            />
            <button
              onClick={handleDownload}
              className="mt-1 flex items-center text-sm hover:underline"
            >
              <FaDownload className="mr-1" />
              {isDownloading ? "Downloading..." : `Download ${displayFileName}`}
            </button>
          </div>
        )}

        {isFile && message.attachment && (
          <div className="mt-2 flex items-center rounded-2xl bg-black/10 p-2">
            <div className="flex-1 truncate">
              {message.content || displayFileName}
            </div>
            <button
              onClick={handleDownload}
              className="ml-2 rounded-xl bg-white/60 px-2 py-1 text-sm shadow-sm backdrop-blur hover:opacity-80"
            >
              {isDownloading ? "…" : <FaDownload />}
            </button>
          </div>
        )}

        <div className="mt-3 flex justify-between">
          <span
            className={`mt-1 block text-xs ${isCurrentUser ? "text-white" : "text-text-light"}`}
          >
            {new Date(message.createdAt).toLocaleTimeString()}
          </span>
          {isCurrentUser && (
            <button
              onClick={handleDelete}
              className="ml-2 text-red-500 hover:opacity-80"
            >
              <FaTrash className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
