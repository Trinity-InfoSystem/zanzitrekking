import { useEffect, useRef } from "react";
import MessageDateSeparator from "./MessageDateSeparator";
import MessageBubble from "./MessageBubble";
import TypingIndicator from "./TypingIndicator";
import EmptyState from "../EmptyState/index";
import { useDispatch } from "react-redux";
import { delete_admin_message } from "../../../store/Reducers/adminToAdminReducer";
import toast from "react-hot-toast";

const MessageArea = ({ groupedMessages, currentAdmin, userInfo, isTyping }) => {
  const dispatch = useDispatch();
  const messagesEndRef = useRef(null);
  const containerRef = useRef(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current && containerRef.current) {
      containerRef.current.scrollTo({
        top: messagesEndRef.current.offsetTop,
        behavior: "smooth",
      });
    }
  }, [groupedMessages, isTyping]);

  // handle delete message
  const deleteMessage = (messageId) => {
    // Dispatch delete message action
    dispatch(delete_admin_message(messageId));
    // Show success toast
    toast.success("Message deleted successfully");
  };

  return (
    <div ref={containerRef} className="flex-1 overflow-y-auto p-4">
      {Object.keys(groupedMessages).length > 0 ? (
        <>
          {Object.entries(groupedMessages).map(([date, dateMessages]) => (
            <div key={date} className="mb-6">
              <MessageDateSeparator date={date} />

              <div className="space-y-3">
                {dateMessages.map((message, idx) => (
                  <MessageBubble
                    key={idx}
                    message={message}
                    isCurrentUser={message.sender._id === userInfo._id}
                    userInfo={userInfo}
                    admin={currentAdmin}
                    onDelete={() => deleteMessage(message._id)}
                  />
                ))}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </>
      ) : (
        <EmptyState
          icon={(props) => (
            <svg
              {...props}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
          )}
          title="No messages yet"
          description="Start the conversation by sending a message"
        />
      )}
      {isTyping && <TypingIndicator />}
    </div>
  );
};

export default MessageArea;
