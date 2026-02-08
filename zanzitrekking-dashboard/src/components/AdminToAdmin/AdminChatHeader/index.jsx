const AdminChatHeader = ({ admin, conversationId, messageCount }) => {
  return (
    <div className="border-b border-primary-100 bg-gradient-to-r from-primary-50 via-white to-secondary-50 px-6 py-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div>
            {admin.image ? (
              <img
                src={admin.image}
                alt={admin.name}
                className="h-12 w-12 rounded-full object-cover shadow-nature-soft ring-2 ring-primary/60"
              />
            ) : (
              <div className="shadow-coral-soft flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary-600 text-lg font-semibold text-white">
                {admin.name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-primary-900">
              {admin.name}
            </h3>
            <p className="text-xs uppercase tracking-wide text-text-light">
              {admin.role || "Administrator"}
            </p>
            {admin.email && (
              <p className="mt-1 text-xs text-primary-600">{admin.email}</p>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="rounded-xl border border-primary-100 bg-white/70 px-4 py-2 text-xs text-primary-700 shadow-nature-soft">
            <span className="font-semibold text-primary-900">Conversation</span>{" "}
            <span className="text-primary-500">{conversationId}</span>
          </div>
          <div className="rounded-xl border border-primary-100 bg-white/70 px-4 py-2 text-xs text-primary-700 shadow-nature-soft">
            <span className="font-semibold text-primary-900">Messages</span>{" "}
            <span className="text-primary-500">{messageCount}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminChatHeader;
