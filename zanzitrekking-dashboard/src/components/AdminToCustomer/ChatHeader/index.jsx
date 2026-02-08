import { FaCircle } from "react-icons/fa";

const ChatHeader = ({ customer, conversationId, messageCount }) => {
  return (
    <div className="border-b border-primary-100 bg-gradient-to-r from-primary-50 via-white to-secondary-50 px-6 py-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="relative">
            {customer.image ? (
              <img
                src={customer.image}
                alt={customer.name}
                className="h-12 w-12 rounded-full object-cover shadow-nature-soft ring-2 ring-secondary/70"
              />
            ) : (
              <div className="shadow-coral-soft flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-secondary to-sunshine-400 text-lg font-bold text-white">
                {customer.name.charAt(0).toUpperCase()}
              </div>
            )}
            {customer.online && (
              <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-success ring-2 ring-white"></span>
            )}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-primary-900">
              {customer.name}
            </h3>
            <div className="flex items-center gap-2 text-xs text-text-light">
              {customer.online ? (
                <>
                  <FaCircle className="h-2 w-2 text-success" />
                  Online
                </>
              ) : customer.lastMessageAt ? (
                <span>
                  Last active:{" "}
                  {new Date(customer.lastMessageAt).toLocaleString()}
                </span>
              ) : (
                <span>Awaiting first reply</span>
              )}
            </div>
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

export default ChatHeader;
