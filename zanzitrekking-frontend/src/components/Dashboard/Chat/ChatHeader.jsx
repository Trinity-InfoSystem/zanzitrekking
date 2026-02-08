const ChatHeader = ({ unreadCount, conversationId, assignedAdmin }) => {
  return (
    <div className="border-b border-primary/10 bg-gradient-to-r from-primary/5 via-white to-secondary/5 px-5 py-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="shadow-small inline-flex items-center rounded-2xl border border-secondary/30 bg-white/70 px-3 py-1 text-xs font-semibold text-primary backdrop-blur">
            SUPPORT CHAT
          </div>
          <h2 className="mt-2 text-xl font-black text-primary">
            Customer Support
          </h2>
          <p className="text-xs text-text-light">
            Conversation ID:{" "}
            <span className="font-medium text-primary-500">
              {conversationId || "Generating..."}
            </span>
          </p>
          {assignedAdmin && (
            <p className="text-xs text-text-light">
              Assigned admin:{" "}
              <span className="font-medium text-primary-500 capitalize">
                {assignedAdmin}
              </span>
            </p>
          )}
        </div>
        {unreadCount > 0 && (
          <span className="rounded-full bg-gradient-to-r from-primary to-primary-600 px-3 py-1 text-sm font-semibold text-white shadow-nature-soft">
            {unreadCount} unread
          </span>
        )}
      </div>
    </div>
  );
};

export default ChatHeader;
