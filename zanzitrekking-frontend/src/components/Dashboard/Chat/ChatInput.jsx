import { useRef, useState } from "react";
import EmojiPicker from "emoji-picker-react";
import { File, Paperclip, Send, Smile, X } from "lucide-react";

const ChatInput = ({
  message,
  setMessage,
  handleSubmit,
  socketConnected,
  onFileSelect,
  selectedFile,
  setSelectedFile,
  onInputChange,
}) => {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const fileInputRef = useRef(null);
  const emojiPickerRef = useRef(null);

  const handleEmojiClick = (emojiData) => {
    const newMessage = message + emojiData.emoji;
    setMessage(newMessage);
    setShowEmojiPicker(false);

    if (onInputChange) {
      onInputChange({ target: { value: newMessage } });
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) {return;}

    if (file.size > 50 * 1024 * 1024) {
      alert("File size should be less than 50MB");
      return;
    }

    setSelectedFile(file);
    onFileSelect(file);
  };

  const removeFilePreview = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="border-t border-neutral-200 bg-background-muted p-4">
      {/* File preview */}
      {selectedFile && (
        <div className="mb-3 flex items-center justify-between rounded-lg border border-neutral-200 bg-white p-3 shadow-soft">
          <div className="flex items-center gap-3">
            {selectedFile.type.startsWith("image/") ? (
              <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg border border-neutral-200">
                <img
                  src={URL.createObjectURL(selectedFile)}
                  alt="Preview"
                  className="h-full w-full object-cover"
                />
              </div>
            ) : (
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-primary-50">
                <File className="h-5 w-5 text-primary-600" />
              </div>
            )}
            <span className="max-w-xs truncate text-sm font-medium text-primary-800">
              {selectedFile.name}
            </span>
          </div>
          <button
            onClick={removeFilePreview}
            className="ml-2 rounded-lg p-1.5 text-text-light transition-colors hover:bg-neutral-100 hover:text-error-600"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex items-end gap-2">
        {/* Emoji Picker */}
        <div className="relative" ref={emojiPickerRef}>
          <button
            type="button"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="flex h-10 w-10 items-center justify-center rounded-lg text-text-light transition-colors hover:bg-white hover:text-primary-600"
            title="Add emoji"
          >
            <Smile className="h-5 w-5" />
          </button>

          {showEmojiPicker && (
            <div className="absolute bottom-12 left-0 z-10 overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-soft-lg">
              <EmojiPicker
                onEmojiClick={handleEmojiClick}
                width={300}
                height={350}
                previewConfig={{ showPreview: false }}
              />
            </div>
          )}
        </div>

        {/* File Upload */}
        <div>
          <button
            type="button"
            onClick={() => fileInputRef.current.click()}
            className="flex h-10 w-10 items-center justify-center rounded-lg text-text-light transition-colors hover:bg-white hover:text-primary-600"
            title="Attach file"
          >
            <Paperclip className="h-5 w-5" />
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"
          />
        </div>

        {/* Message Input */}
        <div className="relative flex-1">
          <input
            type="text"
            value={message}
            onChange={(e) => {
              setMessage(e.target.value);
              if (onInputChange) {
                onInputChange(e);
              }
            }}
            placeholder="Type your message..."
            className="w-full rounded-lg border border-neutral-300 bg-white px-4 py-2.5 text-sm text-primary-800 placeholder-text-lighter transition-colors focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
          />
        </div>

        {/* Send Button */}
        <button
          type="submit"
          disabled={(!message.trim() && !selectedFile) || !socketConnected}
          className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-600 text-white shadow-soft transition-all hover:bg-primary-700 hover:shadow-soft-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          title="Send message"
        >
          <Send className="h-5 w-5" />
        </button>
      </form>
    </div>
  );
};

export default ChatInput;
