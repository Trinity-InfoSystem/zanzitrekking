import { resolveMediaUrl } from "../../../utils/constants";

const CustomerItem = ({ customer, isActive, onClick }) => {
  // Format time dynamically
  const formatTime = (dateString) => {
    if (!dateString) return "No activity";

    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));

    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return date.toLocaleDateString();
  };

  // Get status color based on online status and last activity
  const getStatusColor = () => {
    if (customer.online) return "bg-success";
    if (customer.lastMessageAt) {
      const lastActivity = new Date(customer.lastMessageAt);
      const now = new Date();
      const diffInHours = (now - lastActivity) / (1000 * 60 * 60);

      if (diffInHours < 1) return "bg-sunshine-400";
      if (diffInHours < 24) return "bg-secondary";
      return "bg-neutral-400";
    }
    return "bg-neutral-400";
  };

  return (
    <button
      onClick={onClick}
      className={`group flex w-full items-center space-x-3 rounded-lg p-3 transition-all duration-200 hover:scale-[1.02] ${
        isActive
          ? "shadow-coral-soft border border-secondary bg-gradient-to-r from-secondary to-sunshine-400 text-white"
          : "border border-transparent text-text-dark hover:border-primary-200 hover:bg-primary-50/50"
      }`}
    >
      {/* Customer avatar and online status */}
      <div className="relative">
        {customer.image ? (
          <img
            src={resolveMediaUrl(customer.image)}
            alt={customer.name}
            className={`h-12 w-12 rounded-full object-cover ring-2 transition-all duration-200 ${isActive ? "ring-white" : "ring-primary-200 group-hover:ring-secondary"}`}
            onError={(e) => {
              e.target.style.display = "none";
              e.target.nextSibling.style.display = "flex";
            }}
          />
        ) : null}
        <div
          className={`flex h-12 w-12 items-center justify-center rounded-full text-lg font-bold text-white ring-2 transition-all duration-200 ${
            isActive
              ? "bg-white text-secondary ring-white"
              : "shadow-coral-soft bg-gradient-to-br from-secondary to-sunshine-400 ring-primary-200 group-hover:ring-secondary"
          } ${customer.image ? "hidden" : "flex"}`}
        >
          {customer.name ? customer.name.charAt(0).toUpperCase() : "U"}
        </div>

        {/* Dynamic status indicator */}
        <span
          className={`absolute -bottom-1 -right-1 h-4 w-4 rounded-full ring-2 ${isActive ? "ring-white" : "ring-white"} ${getStatusColor()} transition-all duration-200`}
        >
          {customer.online && (
            <span className="absolute inset-0 animate-ping rounded-full bg-success opacity-75"></span>
          )}
        </span>
      </div>

      {/* Customer details */}
      <div className="min-w-0 flex-1 text-left">
        <div className="mb-1 flex items-center justify-between">
          <p
            className={`truncate font-semibold ${isActive ? "text-white" : "text-primary-800 group-hover:text-secondary"}`}
          >
            {customer.name || "Unknown Customer"}
          </p>
          <span
            className={`ml-2 flex-shrink-0 text-xs ${isActive ? "text-white/80" : "text-text-light"}`}
          >
            {formatTime(customer.lastMessageAt)}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <p
            className={`max-w-[200px] truncate text-sm ${isActive ? "text-white/80" : "text-text-light group-hover:text-text-dark"}`}
          >
            {customer.lastMessage
              ? customer.lastMessage.length > 30
                ? `${customer.lastMessage.substring(0, 30)}...`
                : customer.lastMessage
              : "No messages yet"}
          </p>

          {/* Unread message count */}
          {customer.unreadCount > 0 && (
            <span
              className={`flex h-5 w-5 animate-pulse items-center justify-center rounded-full text-xs font-bold ${isActive ? "bg-white text-secondary" : "bg-gradient-to-r from-accent to-accent-600 text-white"}`}
            >
              {customer.unreadCount > 9 ? "9+" : customer.unreadCount}
            </span>
          )}
        </div>

        {/* Customer status text */}
        <div className="mt-1">
          <span
            className={`text-xs ${isActive ? "text-white/70" : "text-text-light"}`}
          >
            {customer.online
              ? "Online now"
              : customer.lastMessageAt
                ? "Recently active"
                : "Offline"}
          </span>
        </div>
      </div>
    </button>
  );
};

export default CustomerItem;
