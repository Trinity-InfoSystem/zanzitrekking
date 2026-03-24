import { Link, useNavigate } from "react-router-dom";
import { ArrowUpRight, Loader2 } from "lucide-react";
import { resolveMediaUrl } from "../../utils/constants";

const MessagesSection = ({ messages, isLoading = false }) => {
  const navigate = useNavigate();

  // Format time display
  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));

    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 48) return "Yesterday";
    return date.toLocaleDateString();
  };

  // Truncate message content
  const truncateMessage = (message, maxLength = 80) => {
    if (message.length <= maxLength) return message;
    return message.substring(0, maxLength) + "...";
  };

  // Handle message click to navigate to chat
  const handleMessageClick = (message) => {
    if (message.sender?._id) {
      navigate(
        `/admin/dashboard/chat-customer?customerId=${message.sender._id}`,
      );
    }
  };

  return (
    <div className="overflow-hidden rounded-2xl bg-white shadow-nature-medium ring-1 ring-primary-100 transition-all duration-300 hover:shadow-nature-large">
      <div className="border-b border-primary-200 bg-gradient-to-r from-primary-50 to-secondary-50 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-primary-800">
              Recent Messages
            </h2>
            <p className="mt-1 text-sm text-text">Latest customer inquiries</p>
          </div>
          <Link
            to="/admin/dashboard/chat-customer"
            className="shadow-coral-soft flex items-center rounded-full bg-gradient-to-r from-secondary to-sunshine-400 px-3 py-1 text-sm font-semibold text-white transition-all hover:scale-105"
          >
            View All
            <ArrowUpRight className="ml-1 h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
      <div className="p-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-secondary" />
            <span className="ml-2 text-text">Loading messages...</span>
          </div>
        ) : messages && messages.length > 0 ? (
          <div className="space-y-6">
            {messages.map((msg, i) => (
              <div
                key={msg._id || i}
                className="group relative -m-2 flex cursor-pointer items-start space-x-4 rounded-lg p-2 transition-all duration-200 hover:bg-primary-50"
                onClick={() => handleMessageClick(msg)}
                title="Click to open chat"
              >
                <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-full ring-2 ring-primary-200">
                  {msg.avatar ? (
                    <img
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                      src={resolveMediaUrl(msg.avatar)}
                      alt={`${msg.name} avatar`}
                      onError={(e) => {
                        e.target.style.display = "none";
                        e.target.nextSibling.style.display = "flex";
                      }}
                    />
                  ) : null}
                  <div
                    className="flex h-full w-full items-center justify-center bg-gradient-to-br from-secondary to-sunshine-400 text-sm font-bold text-white transition-transform duration-300 group-hover:scale-110"
                    style={{ display: msg.avatar ? "none" : "flex" }}
                  >
                    {msg.name ? msg.name.charAt(0).toUpperCase() : "U"}
                  </div>
                  <span
                    className={`absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white ${
                      msg.status === "online"
                        ? "bg-success-500"
                        : msg.status === "away"
                          ? "bg-sunshine-500"
                          : "bg-neutral-400"
                    }`}
                  ></span>
                  {!msg.read && (
                    <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full border-2 border-white bg-secondary"></span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-primary-800">
                      {msg.name}
                    </p>
                    <p className="text-xs text-text-light">{msg.time}</p>
                  </div>
                  <div className="relative mt-2 rounded-xl bg-primary-50 p-3 text-sm text-text-dark transition-colors group-hover:bg-secondary-50">
                    {truncateMessage(msg.message)}
                    <div className="absolute right-2 top-2 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                      <ArrowUpRight className="h-3 w-3 text-secondary" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="mb-4 rounded-full bg-primary-50 p-4 ring-2 ring-primary-200">
              <svg
                className="h-8 w-8 text-primary-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
            </div>
            <h3 className="mb-2 text-lg font-semibold text-primary-800">
              No messages yet
            </h3>
            <p className="text-sm text-text">
              Customer messages will appear here
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessagesSection;
