"use client";

import { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { io } from "socket.io-client";
import { FaList } from "react-icons/fa";
import {
  get_chat_stats,
  get_active_admins,
  get_active_admins_with_new_admin,
  get_admin_messages,
  send_admin_message,
  add_new_message,
  set_current_admin,
  send_admin_file,
  set_sent_message,
  mark_messages_read,
} from "../../store/Reducers/adminToAdminReducer";
import AllAdminsModal from "../../components/AdminToAdmin/AllAdminsModal/index";
import HeaderText from "./HeaderText";
import AdminChatStats from "../../components/AdminToAdmin/AdminChatStats/index";
import AdminList from "../../components/AdminToAdmin/AdminList/index";
import AdminChatHeader from "../../components/AdminToAdmin/AdminChatHeader/index";
import MessageArea from "../../components/AdminToAdmin/MessageArea/index";
import MessageInput from "../../components/AdminToAdmin/MessageInput/index";
import EmptyState from "../../components/AdminToAdmin/EmptyState/index";
import { useNavigate, useSearchParams } from "react-router-dom";
import Loader from "../../layout/Loader";

const AdminToAdmin = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [show, setShow] = useState(false);
  const [message, setMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isAdminTyping, setIsAdminTyping] = useState(false);
  const [typingTimeout, setTypingTimeout] = useState(null);
  const socket = useRef();
  const messageEndRef = useRef();
  const activeConversationRef = useRef(null);
  const currentAdminRef = useRef(null);
  const [searchParams] = useSearchParams();
  const [selectedFile, setSelectedFile] = useState(null);
  const [showAllAdminsModal, setShowAllAdminsModal] = useState(false);

  const adminId = searchParams.get("adminId");
  const {
    messages,
    loader,
    activeAdmins,
    currentAdmin,
    stats,
    sentMessage,
    conversationId: storedConversationId,
  } =
    useSelector((state) => state.adminToAdmin);
  const { userInfo } = useSelector((state) => state.auth);

  const adminConversationId =
    storedConversationId ||
    (currentAdmin?._id && userInfo?._id
      ? `admin-${[currentAdmin._id, userInfo._id].map(String).sort().join("-")}`
      : null);

  useEffect(() => {
    currentAdminRef.current = currentAdmin;
  }, [currentAdmin]);

  useEffect(() => {
    if (!socket.current || !adminConversationId) return;

    if (
      activeConversationRef.current &&
      activeConversationRef.current !== adminConversationId
    ) {
      socket.current.emit("leave_conversation", {
        conversationId: activeConversationRef.current,
      });
    }

    socket.current.emit("join_conversation", { conversationId: adminConversationId });
    activeConversationRef.current = adminConversationId;

    return () => {
      if (socket.current && activeConversationRef.current) {
        socket.current.emit("leave_conversation", {
          conversationId: activeConversationRef.current,
        });
        activeConversationRef.current = null;
      }
    };
  }, [adminConversationId]);
  useEffect(() => {
    if (adminId && activeAdmins.length > 0) {
      const adminToActivate = activeAdmins.find(
        (admin) => admin._id === adminId,
      );
      if (adminToActivate) {
        dispatch(set_current_admin(adminToActivate));
      }
    }
  }, [adminId, activeAdmins, dispatch]);

  useEffect(() => {
    socket.current = io(import.meta.env.VITE_API_BASE_URL, {
      transports: ["websocket", "polling"],
      withCredentials: true,
      cors: {
        origin: ["http://localhost:5173", "http://localhost:5174"],
        credentials: true,
      },
    });

    socket.current.emit("join", userInfo?._id);

    socket.current.on("receive_admin_message", (newMessage) => {
      const activeConversationId = activeConversationRef.current;
      const activeAdmin = currentAdminRef.current;
      const incomingConversationId =
        newMessage.conversationId ||
        (newMessage.senderModel === "Admin" &&
        newMessage.receiverModel === "Admin"
          ? `admin-${[newMessage.sender, newMessage.receiver]
              .map((id) =>
                id?._id ? id._id.toString() : id?.toString(),
              )
              .filter(Boolean)
              .sort()
              .join("-")}`
          : null);

      if (activeConversationId && incomingConversationId === activeConversationId) {
        dispatch(add_new_message(newMessage));
        messageEndRef.current?.scrollIntoView({ behavior: "smooth" });

        if (
          activeAdmin?._id &&
          (newMessage.sender?._id === activeAdmin._id ||
            newMessage.sender === activeAdmin._id)
        ) {
          dispatch(
            mark_messages_read({
              senderId: activeAdmin._id,
              receiverId: userInfo?._id,
            }),
          );
        }
      }
    });

    socket.current.on("admin_typing", ({ userId, isTyping: userIsTyping }) => {
      const activeAdmin = currentAdminRef.current;
      if (activeAdmin?._id === userId) {
        setIsTyping(userIsTyping);
        if (userIsTyping) {
          if (typingTimeout) {
            clearTimeout(typingTimeout);
          }
          const timeout = setTimeout(() => {
            setIsTyping(false);
          }, 3000);
          setTypingTimeout(timeout);
        }
      }
    });

    socket.current.on("admin_message_read", ({ messageId, readBy }) => {
      // Message read status updated
    });

    return () => {
      if (activeConversationRef.current) {
        socket.current.emit("leave_conversation", {
          conversationId: activeConversationRef.current,
        });
        activeConversationRef.current = null;
      }
      socket.current.disconnect();
    };
  }, [userInfo?._id, dispatch]);

  useEffect(() => {
    if (adminId) {
      dispatch(get_active_admins_with_new_admin(adminId));
    } else {
      dispatch(get_active_admins());
    }
    dispatch(get_chat_stats());

    const interval = setInterval(() => {
      if (adminId) {
        dispatch(get_active_admins_with_new_admin(adminId));
      } else {
        dispatch(get_active_admins());
      }
      dispatch(get_chat_stats());
    }, 30000);

    return () => clearInterval(interval);
  }, [dispatch, adminId]);

  useEffect(() => {
    if (currentAdmin) {
      dispatch(
        get_admin_messages({
          adminId: currentAdmin._id,
          currentAdminId: userInfo?._id,
        }),
      );
      setShow(false);

      // Mark messages as read when opening chat
      dispatch(
        mark_messages_read({
          senderId: currentAdmin._id,
          receiverId: userInfo?._id,
        }),
      );
    }
  }, [currentAdmin, dispatch, userInfo?._id]);

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleFileUpload = (file) => {
    setSelectedFile(file);
  };

  const handleAdminSelect = (admin) => {
    dispatch(set_current_admin(admin));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!message.trim() && !selectedFile) return;
    const formData = new FormData();

    if (selectedFile) {
      formData.append("attachment", selectedFile);
    }

    formData.append("sender", userInfo?._id);
    formData.append("senderModel", "Admin");
    formData.append("receiver", currentAdmin._id);
    formData.append("receiverModel", "Admin");
    formData.append("content", selectedFile ? "File shared" : message);
    if (adminConversationId) {
      formData.append("conversationId", adminConversationId);
    }

    if (selectedFile) {
      dispatch(send_admin_file(formData))
        .unwrap()
        .then(({ message: serverResponse }) => {
          const messageToSend = {
            ...serverResponse,
            sender: userInfo?._id,
            senderModel: "Admin",
            receiver: currentAdmin._id,
            receiverModel: "Admin",
            createdAt: new Date().toISOString(),
            conversationId: adminConversationId,
          };

          socket.current.emit("send_admin_message", messageToSend);
          dispatch(set_sent_message(null));
        })
        .catch(() => {
          // Error handled by thunk/toast
        });
      setSelectedFile(null);
    } else {
      const baseMessage = {
        sender: userInfo?._id,
        senderModel: "Admin",
        receiver: currentAdmin._id,
        receiverModel: "Admin",
        content: message,
        conversationId: adminConversationId,
      };

      dispatch(send_admin_message(baseMessage))
        .unwrap()
        .then(({ message: savedMessage }) => {
          socket.current.emit("send_admin_message", savedMessage);
          dispatch(set_sent_message(null));
        })
        .catch(() => {
          // Error already surfaced
        });
    }

    setMessage("");
    setSelectedFile(null);

    // Stop typing indicator when message is sent
    if (currentAdmin) {
      socket.current.emit("admin_typing", {
        userId: userInfo?._id,
        receiverId: currentAdmin._id,
        isTyping: false,
      });
    }
  };

  const groupedMessages = messages.reduce((groups, message) => {
    const date = new Date(message.createdAt).toLocaleDateString();
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(message);
    return groups;
  }, {});

  if (loader && !messages.length && !activeAdmins.length) {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-br from-neutral-50 via-white to-primary-50/30">
        <div className="flex flex-col items-center space-y-4">
          <div className="shadow-coral-soft h-12 w-12 animate-spin rounded-full border-4 border-secondary border-t-transparent"></div>
          <div className="text-lg font-medium text-primary-800">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-primary-50/30 p-4 md:p-5">
      <HeaderText title="Admin Chat" />

      <AdminChatStats stats={stats} activeAdmins={activeAdmins} />

      <div className="mx-auto max-w-7xl">
        <div className="overflow-hidden rounded-2xl bg-white shadow-nature-medium ring-1 ring-primary-100">
          <div className="relative flex h-[calc(100vh-240px)]">
            {/* Sidebar */}
            <div
              className={`fixed inset-y-0 left-0 z-50 w-80 transform overflow-hidden border-r border-primary-200 bg-white transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 ${
                show ? "translate-x-0" : "-translate-x-full"
              }`}
            >
              <AdminList
                admins={activeAdmins}
                currentAdmin={currentAdmin}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                setCurrentAdmin={(admin) => dispatch(set_current_admin(admin))}
              />
            </div>

            {/* Chat Area */}
            <div
              className={`flex-1 flex-col bg-neutral-50 transition-all duration-300 ${
                show ? "hidden" : "flex"
              } lg:flex`}
            >
              {loader ? (
                <Loader />
              ) : currentAdmin ? (
                <>
                  <AdminChatHeader
                    admin={currentAdmin}
                    conversationId={adminConversationId}
                    messageCount={messages.length}
                  />

                  <div className="border-b border-primary-100 bg-white/70 px-6 py-3">
                    <div className="grid grid-cols-1 gap-3 text-xs text-primary-700 md:grid-cols-3">
                      <div className="rounded-xl border border-primary-100 bg-white px-4 py-2 shadow-nature-soft">
                        <p className="font-semibold text-primary-900">
                          Email
                        </p>
                        <p className="truncate text-text-dark">
                          {currentAdmin.email || "Not provided"}
                        </p>
                      </div>
                      <div className="rounded-xl border border-primary-100 bg-white px-4 py-2 shadow-nature-soft">
                        <p className="font-semibold text-primary-900">
                          Role
                        </p>
                        <p className="text-text-dark">
                          {currentAdmin.role || "Admin"}
                        </p>
                      </div>
                      <div className="rounded-xl border border-primary-100 bg-white px-4 py-2 shadow-nature-soft">
                        <p className="font-semibold text-primary-900">
                          Last Message
                        </p>
                        <p className="text-text-dark">
                          {messages.length
                            ? new Date(
                                messages[messages.length - 1].createdAt,
                              ).toLocaleString()
                            : "No messages yet"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <MessageArea
                    groupedMessages={groupedMessages}
                    currentAdmin={currentAdmin}
                    userInfo={userInfo}
                    isTyping={isTyping}
                  />

                  <MessageInput
                    message={message}
                    handleInputChange={(e) => {
                      setMessage(e.target.value);

                      // Handle typing indicator with debouncing
                      if (currentAdmin) {
                        // Emit typing start
                        socket.current.emit("admin_typing", {
                          userId: userInfo?._id,
                          receiverId: currentAdmin._id,
                          isTyping: true,
                        });

                        // Clear existing timeout
                        if (typingTimeout) {
                          clearTimeout(typingTimeout);
                        }

                        // Set timeout to stop typing indicator
                        const timeout = setTimeout(() => {
                          socket.current.emit("admin_typing", {
                            userId: userInfo._id,
                            receiverId: currentAdmin._id,
                            isTyping: false,
                          });
                        }, 1000);

                        setTypingTimeout(timeout);
                      }
                    }}
                    handleSubmit={handleSubmit}
                    handleFileUpload={handleFileUpload}
                  />
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
                  title="Welcome to Admin Chat"
                  description="Select an admin from the sidebar to start chatting. You can search for specific admins using the search bar."
                  action={{
                    icon: FaList,
                    label: "View All Admins",
                    onClick: () => {
                      setShowAllAdminsModal(true);
                    },
                  }}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Toggle Button */}
      <button
        onClick={() => setShow(!show)}
        className="shadow-coral-medium hover:shadow-coral-large fixed bottom-4 right-4 z-50 rounded-full bg-gradient-to-r from-secondary to-sunshine-400 p-4 text-white transition-all hover:scale-110 focus:outline-none lg:hidden"
        aria-label="Toggle admin list"
      >
        <FaList className="h-6 w-6" />
      </button>

      {/* All Admins Modal */}
      <AllAdminsModal
        isOpen={showAllAdminsModal}
        onClose={() => setShowAllAdminsModal(false)}
        onSelectAdmin={handleAdminSelect}
      />
    </div>
  );
};

export default AdminToAdmin;
