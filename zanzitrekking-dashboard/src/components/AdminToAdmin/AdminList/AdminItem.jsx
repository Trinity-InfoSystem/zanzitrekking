const AdminItem = ({ admin, isActive, onClick }) => {
  return (
    <div
      onClick={onClick}
      className={`cursor-pointer rounded-lg p-3 transition-all ${
        isActive
          ? "shadow-coral-soft bg-gradient-to-r from-secondary to-sunshine-400 text-white"
          : "text-text-dark hover:bg-primary-50/50"
      }`}
    >
      <div className="flex items-center">
        <div className="relative">
          {admin.image ? (
            <img
              src={admin.image}
              alt={admin.name}
              className={`h-10 w-10 rounded-full object-cover ${isActive ? "ring-2 ring-white" : "ring-2 ring-primary-200"}`}
            />
          ) : (
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-full font-bold ${isActive ? "bg-white text-secondary" : "shadow-coral-soft bg-gradient-to-br from-secondary to-sunshine-400 text-white"}`}
            >
              {admin.name.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
        <div className="ml-3 flex-1">
          <div className="flex items-center justify-between">
            <h3
              className={`text-sm font-medium ${isActive ? "text-white" : "text-primary-800"}`}
            >
              Send to {admin.name}
            </h3>
            {admin.lastMessageAt && (
              <span
                className={`text-xs ${isActive ? "text-white/80" : "text-text-light"}`}
              >
                {new Date(admin.lastMessageAt).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            )}
          </div>
          <div className="flex items-center justify-between">
            <p
              className={`truncate text-xs ${isActive ? "text-white/80" : "text-text-light"}`}
            >
              {admin.lastMessage || "No messages yet"}
            </p>
            {admin.unreadCount > 0 && (
              <span
                className={`ml-2 rounded-full px-2 py-1 text-xs font-semibold ${isActive ? "bg-white text-secondary" : "bg-gradient-to-r from-accent to-accent-600 text-white"}`}
              >
                {admin.unreadCount}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminItem;
