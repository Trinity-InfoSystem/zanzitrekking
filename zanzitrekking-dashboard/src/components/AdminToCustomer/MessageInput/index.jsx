import { useState, useRef, useEffect } from "react";
import {
  FaRegSmile,
  FaPaperclip,
  FaMicrophone,
  FaPaperPlane,
} from "react-icons/fa";
import EmojiPicker from "emoji-picker-react";

const MessageInput = ({
  message,
  handleInputChange,
  handleSubmit,
  handleFileUpload,
}) => {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [filePreview, setFilePreview] = useState(null);
  const emojiPickerRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        emojiPickerRef.current &&
        !emojiPickerRef.current.contains(event.target)
      ) {
        setShowEmojiPicker(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const onEmojiClick = (emojiData) => {
    handleInputChange({
      target: {
        value: message + emojiData.emoji,
      },
    });
  };

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
    <div className="relative border-t border-gray-100 p-4 dark:border-gray-700">
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
            <span className="ml-2 text-sm">{filePreview.name}</span>
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
        className="flex items-end space-x-2"
      >
        <div className="relative" ref={emojiPickerRef}>
          <button
            type="button"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="rounded-full p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
          >
            <FaRegSmile className="h-5 w-5" />
          </button>

          {showEmojiPicker && (
            <div className="absolute bottom-12 left-0 z-10">
              <EmojiPicker
                onEmojiClick={onEmojiClick}
                width={300}
                height={350}
                previewConfig={{ showPreview: false }}
                skinTonesDisabled
                searchDisabled
              />
            </div>
          )}
        </div>

        <div className="relative">
          <button
            type="button"
            onClick={() => fileInputRef.current.click()}
            className="rounded-full p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
          >
            <FaPaperclip className="h-5 w-5" />
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"
          />
        </div>

        <div className="relative flex-1">
          <input
            type="text"
            value={message}
            onChange={handleInputChange}
            placeholder="Type your message..."
            className="w-full rounded-full border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:ring-violet-900/30"
          />
        </div>

        <button
          type="submit"
          disabled={!message.trim() && !filePreview}
          className="rounded-full bg-violet-500 p-3 text-white transition-all hover:bg-violet-600 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-violet-600 dark:hover:bg-violet-700 dark:focus:ring-offset-gray-900"
        >
          <FaPaperPlane className="h-5 w-5" />
        </button>
      </form>
    </div>
  );
};

export default MessageInput;
