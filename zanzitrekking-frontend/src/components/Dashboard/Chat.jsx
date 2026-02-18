import { useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { io } from "socket.io-client";
import {
  add_new_message,
  get_messages,
  mark_messages_read,
  send_file,
  send_message,
  set_sent_message,
} from "../../store/reducers/chatReducer";
import { API_URL } from "../../utils/constants";
import ChatHeader from "./Chat/ChatHeader";
import ChatMessage from "./Chat/ChatMessage";
import ChatInput from "./Chat/ChatInput";
import toast from "react-hot-toast";

const Chat = () => {
  const dispatch = useDispatch();
  const [message, setMessage] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [socketConnected, setSocketConnected] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [isAdminTyping, setIsAdminTyping] = useState(false);
  const [typingTimeout, setTypingTimeout] = useState(null);
  const socket = useRef(null);
  const messagesEndRef = useRef();
  const messagesContainerRef = useRef(); // Add this ref for the container
  const activeConversationRef = useRef(null);

  const {
    messages,
    loading,
    unreadCount,
    conversationId: storedConversationId,
  } = useSelector((state) => state.chat);
  const { userInfo } = useSelector((state) => state.auth);

  const conversationId =
    storedConversationId || (userInfo?.id ? `customer-${userInfo.id}` : null);

  const activeAdminId = useMemo(() => {
    if (userInfo?.assignedAdmin) {return userInfo.assignedAdmin;}
    if (userInfo?.adminId) {return userInfo.adminId;}
    for (let i = messages.length - 1; i >= 0; i -= 1) {
      const msg = messages[i];
      if (msg.senderModel === "Admin") {
        return msg.sender?._id || msg.sender || null;
      }
      if (msg.receiverModel === "Admin") {
        return msg.receiver?._id || msg.receiver || null;
      }
    }
    return null;
  }, [messages, userInfo?.assignedAdmin, userInfo?.adminId]);

  // Get active admin info (name and id) from messages
  const activeAdminInfo = useMemo(() => {
    if (!activeAdminId) {return null;}
    for (let i = messages.length - 1; i >= 0; i -= 1) {
      const msg = messages[i];
      if (
        msg.senderModel === "Admin" &&
        (msg.sender?._id === activeAdminId || msg.sender === activeAdminId)
      ) {
        return {
          _id: msg.sender?._id || msg.sender,
          name: msg.sender?.name || "Admin",
        };
      }
      if (
        msg.receiverModel === "Admin" &&
        (msg.receiver?._id === activeAdminId || msg.receiver === activeAdminId)
      ) {
        return {
          _id: msg.receiver?._id || msg.receiver,
          name: msg.receiver?.name || "Admin",
        };
      }
    }
    return { _id: activeAdminId, name: "Admin" };
  }, [messages, activeAdminId]);

  useEffect(() => {
    if (userInfo?.id) {
      try {
        socket.current = io(API_URL, {
          transports: ["websocket", "polling"],
          withCredentials: true,
          cors: {
            origin: ["http://localhost:5173", "http://localhost:5174"],
            credentials: true,
          },
        });

        socket.current.on("connect", () => {
          setSocketConnected(true);
          socket.current.emit("join", userInfo.id);
        });

        socket.current.on("receive_message", (newMessage) => {
          const activeConversation = activeConversationRef.current;
          const incomingConversationId =
            newMessage.conversationId ||
            (newMessage.senderModel === "Customer" && newMessage.sender
              ? `customer-${newMessage.sender}`
              : newMessage.receiverModel === "Customer" && newMessage.receiver
                ? `customer-${newMessage.receiver}`
                : null);

          if (
            activeConversation &&
            incomingConversationId === activeConversation
          ) {
            dispatch(add_new_message(newMessage));

            if (
              newMessage.sender !== userInfo.id &&
              activeAdminId &&
              (newMessage.sender?._id === activeAdminId ||
                newMessage.sender === activeAdminId)
            ) {
              dispatch(
                mark_messages_read({
                  senderId: newMessage.sender?._id || newMessage.sender,
                  receiverId: userInfo.id,
                }),
              );
            }

            setTimeout(() => {
              if (messagesContainerRef.current && messagesEndRef.current) {
                messagesContainerRef.current.scrollTo({
                  top: messagesEndRef.current.offsetTop,
                  behavior: "smooth",
                });
              }
            }, 0);
          }
        });

        // Handle typing indicators
        socket.current.on("typing", ({ userId, isTyping: userIsTyping }) => {
          if (userId === activeAdminId) {
            setIsAdminTyping(userIsTyping);
            if (userIsTyping) {
              // Clear existing timeout
              if (typingTimeout) {
                clearTimeout(typingTimeout);
              }
              // Set new timeout to stop typing indicator
              const timeout = setTimeout(() => {
                setIsAdminTyping(false);
              }, 3000);
              setTypingTimeout(timeout);
            }
          }
        });

        // Handle message read status
        socket.current.on("message_read", () => {
          // You can dispatch an action to update the message in the store
        });

        socket.current.on("connect_error", (error) => {
          console.error("Socket connection error:", error);
          setSocketConnected(false);
        });

        socket.current.on("disconnect", () => {
          setSocketConnected(false);
        });

        return () => {
          if (socket.current) {
            if (activeConversationRef.current) {
              socket.current.emit("leave_conversation", {
                conversationId: activeConversationRef.current,
              });
              activeConversationRef.current = null;
            }
            socket.current.disconnect();
            socket.current = null;
          }
        };
      } catch (error) {
        console.error("Socket initialization error:", error);
        setSocketConnected(false);
      }
    }
  }, [userInfo?.id, dispatch, activeAdminId]);

  useEffect(() => {
    if (!socket.current || !conversationId) {return;}

    if (
      activeConversationRef.current &&
      activeConversationRef.current !== conversationId
    ) {
      socket.current.emit("leave_conversation", {
        conversationId: activeConversationRef.current,
      });
    }

    socket.current.emit("join_conversation", { conversationId });
    activeConversationRef.current = conversationId;

    return () => {
      if (socket.current && activeConversationRef.current) {
        socket.current.emit("leave_conversation", {
          conversationId: activeConversationRef.current,
        });
        activeConversationRef.current = null;
      }
    };
  }, [conversationId]);

  useEffect(() => {
    if (userInfo?.id) {
      dispatch(
        get_messages({
          customerId: userInfo.id,
          adminId: activeAdminId || "shared",
        }),
      );
    }
  }, [dispatch, userInfo?.id, activeAdminId]);

  // Track which admins/editors have sent their first message
  const firstAdminMessages = useMemo(() => {
    const seenAdminIds = new Set();
    const firstMessages = new Map(); // Map of adminId -> message index

    messages.forEach((msg, idx) => {
      if (msg.senderModel === "Admin") {
        const adminId = msg.sender?._id || msg.sender;
        if (adminId && !seenAdminIds.has(adminId)) {
          seenAdminIds.add(adminId);
          firstMessages.set(adminId, idx);
        }
      }
    });

    return firstMessages;
  }, [messages]);

  useEffect(() => {
    if (messagesContainerRef.current && messagesEndRef.current) {
      // Scroll to bottom smoothly
      messagesContainerRef.current.scrollTo({
        top: messagesEndRef.current.offsetTop,
        behavior: "smooth",
      });
    }
  }, [messages]);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!message.trim() && !selectedFile) {return;}
    if (!activeAdminId) {
      toast.error(
        "No support agent is currently available. Please try again shortly.",
      );
      return;
    }
    const formData = new FormData();

    if (selectedFile) {
      formData.append("attachment", selectedFile);
    }

    // Sender is now derived from JWT token on backend - removed for security
    formData.append("senderModel", "Customer");
    formData.append("receiver", activeAdminId);
    formData.append("receiverModel", "Admin");
    formData.append("content", selectedFile ? "File shared" : message);
    if (conversationId) {
      formData.append("conversationId", conversationId);
    }

    if (selectedFile) {
      dispatch(send_file(formData))
        .unwrap()
        .then(({ message: serverResponse }) => {
          const messageToSend = {
            ...serverResponse,
            sender:
              serverResponse.sender &&
              typeof serverResponse.sender === "object" &&
              serverResponse.sender.name
                ? serverResponse.sender
                : {
                    _id: userInfo.id,
                    name: userInfo.name || userInfo.email || "Customer",
                  },
            senderModel: "Customer",
            receiver:
              serverResponse.receiver &&
              typeof serverResponse.receiver === "object" &&
              serverResponse.receiver.name
                ? serverResponse.receiver
                : activeAdminInfo
                  ? {
                      _id: activeAdminInfo._id,
                      name: activeAdminInfo.name,
                    }
                  : activeAdminId,
            receiverModel: "Admin",
            conversationId,
          };

          socket.current.emit("send_message", messageToSend);
          dispatch(set_sent_message(null));
        })
        .catch(() => {
          // Error surfaced via toast
        });
      setSelectedFile(null);
    } else {
      // Sender is now derived from JWT token on backend - removed for security
      const baseMessage = {
        senderModel: "Customer",
        receiver: activeAdminId, // Backend expects just the ID string
        receiverModel: "Admin",
        content: message,
        conversationId,
      };

      dispatch(send_message(baseMessage))
        .unwrap()
        .then(({ message: savedMessage }) => {
          // Backend returns populated message with sender/receiver objects, use that for socket
          socket.current.emit("send_message", savedMessage);
          dispatch(set_sent_message(null));
        })
        .catch(() => {
          // Error already handled by thunk
        });
    }

    setMessage("");
    setSelectedFile(null);

    // Stop typing indicator when message is sent
    if (activeAdminId) {
      socket.current.emit("typing", {
        userId: userInfo.id,
        receiverId: activeAdminId,
        isTyping: false,
      });
    }
  };

  if (loading && !messages.length) {
    return (
      <div className="from-background-nature via-background-sunset flex h-[86vh] items-center justify-center rounded-3xl bg-gradient-to-br to-background-paper">
        <div className="text-lg font-semibold text-primary">
          Loading messages...
        </div>
      </div>
    );
  }

  if (!socketConnected) {
    return (
      <div className="from-background-nature via-background-sunset flex h-[86vh] items-center justify-center rounded-xl bg-gradient-to-br to-background-paper">
        <div className="text-lg font-semibold text-primary">
          Connecting to chat server...
        </div>
      </div>
    );
  }

  return (
    <div className="to-background-nature/20 shadow-nature-large flex h-[86vh] flex-col rounded-xl border border-primary/10 bg-gradient-to-br from-white via-background-paper backdrop-blur-xl">
      <ChatHeader
        unreadCount={unreadCount}
        conversationId={conversationId}
        assignedAdmin={activeAdminInfo?.name || activeAdminId || "All admins"}
      />

      <div className="border-b border-primary/10 bg-white/80 px-5 py-3 text-xs text-text-light">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <div className="shadow-nature-soft rounded-xl border border-primary/10 bg-white px-4 py-2">
            <p className="font-semibold text-primary">Your Email</p>
            <p className="truncate text-text-dark">{userInfo?.email}</p>
          </div>
          <div className="shadow-nature-soft rounded-xl border border-primary/10 bg-white px-4 py-2">
            <p className="font-semibold text-primary">Conversation Status</p>
            <p className="text-text-dark">
              {messages.length ? "Active thread" : "Awaiting first reply"}
            </p>
          </div>
          <div className="shadow-nature-soft rounded-xl border border-primary/10 bg-white px-4 py-2">
            <p className="font-semibold text-primary">Total Messages</p>
            <p className="text-text-dark">{messages.length}</p>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-6">
        <div className="space-y-4">
          {messages.map((msg, idx) => {
            // Check if this is the first message from an admin/editor
            const adminId =
              msg.senderModel === "Admin"
                ? msg.sender?._id || msg.sender
                : null;
            const isFirstAdminMessage =
              adminId && firstAdminMessages.get(adminId) === idx;
            const adminName =
              msg.senderModel === "Admin" ? msg.sender?.name || "Admin" : null;

            return (
              <div key={idx}>
                {/* Show "joined the chat" notification for first admin/editor message */}
                {isFirstAdminMessage && adminName && (
                  <div className="flex items-center justify-center py-2">
                    <div className="flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-xs text-primary-600">
                      <span className="h-1 w-1 rounded-full bg-primary-400"></span>
                      <span className="font-medium">{adminName}</span>
                      <span>joined the chat</span>
                      <span className="h-1 w-1 rounded-full bg-primary-400"></span>
                    </div>
                  </div>
                )}
                <ChatMessage
                  message={msg}
                  isCurrentUser={
                    (msg.sender?._id || msg.sender) === userInfo.id
                  }
                />
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Typing Indicator */}
      {isAdminTyping && (
        <div className="px-6 py-2">
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <div className="flex space-x-1">
              <div className="h-2 w-2 animate-bounce rounded-full bg-gray-400"></div>
              <div
                className="h-2 w-2 animate-bounce rounded-full bg-gray-400"
                style={{ animationDelay: "0.1s" }}
              ></div>
              <div
                className="h-2 w-2 animate-bounce rounded-full bg-gray-400"
                style={{ animationDelay: "0.2s" }}
              ></div>
            </div>
            <span>Admin is typing...</span>
          </div>
        </div>
      )}

      <ChatInput
        message={message}
        setMessage={setMessage}
        handleSubmit={handleSubmit}
        socketConnected={socketConnected}
        onInputChange={(e) => {
          setMessage(e.target.value);

          // Handle typing indicator with debouncing
          if (activeAdminId) {
            // Emit typing start
            socket.current.emit("typing", {
              userId: userInfo.id,
              receiverId: activeAdminId,
              isTyping: true,
            });

            // Clear existing timeout
            if (typingTimeout) {
              clearTimeout(typingTimeout);
            }

            // Set timeout to stop typing indicator
            const timeout = setTimeout(() => {
              socket.current.emit("typing", {
                userId: userInfo.id,
                receiverId: activeAdminId,
                isTyping: false,
              });
            }, 1000);

            setTypingTimeout(timeout);
          }
        }}
        onFileSelect={(file) => {
          // Prepare message for socket in case of file upload
          dispatch(
            set_sent_message({
              sender: userInfo.id,
              senderModel: "Customer",
              receiver: activeAdminId,
              receiverModel: "Admin",
              content: "File shared",
              attachment: URL.createObjectURL(file),
              attachmentType: file.type.startsWith("image/") ? "image" : "file",
            }),
          );
        }}
        selectedFile={selectedFile}
        setSelectedFile={setSelectedFile}
      />
    </div>
  );
};

export default Chat;
