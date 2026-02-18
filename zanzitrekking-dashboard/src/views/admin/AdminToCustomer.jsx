"use client";

import { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { io } from "socket.io-client";
import { FaList } from "react-icons/fa";
import {
  get_chat_stats,
  get_active_customers,
  get_active_customers_with_new_customer,
  get_messages,
  send_message,
  add_new_message,
  set_current_customer,
  send_file,
  set_sent_message,
  mark_messages_read,
} from "../../store/Reducers/chatReducer";
import HeaderText from "./HeaderText";
import ChatStats from "../../components/AdminToCustomer/ChatStats/index";
import CustomerList from "../../components/AdminToCustomer/CustomerList/index";
import ChatHeader from "../../components/AdminToCustomer/ChatHeader/index";
import MessageArea from "../../components/AdminToCustomer/MessageArea/index";
import MessageInput from "../../components/AdminToCustomer/MessageInput/index";
import EmptyState from "../../components/AdminToCustomer/EmptyState/index";
import { API_URL } from "../../utils/constants";
import { useNavigate, useSearchParams } from "react-router-dom";
import Loader from "../../layout/Loader";

const AdminToCustomer = () => {
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
  const currentCustomerRef = useRef(null);
  const [searchParams] = useSearchParams();
  const [selectedFile, setSelectedFile] = useState(null);

  const customerId = searchParams.get("customerId");
  const {
    messages,
    loader,
    activeCustomers,
    currentCustomer,
    stats,
    sentMessage,
    conversationId: storedConversationId,
  } = useSelector((state) => state.chat);
  const { userInfo } = useSelector((state) => state.auth);

  useEffect(() => {
    if (customerId && activeCustomers.length > 0) {
      const customerToActivate = activeCustomers.find(
        (customer) => customer._id === customerId,
      );
      if (customerToActivate) {
        dispatch(set_current_customer(customerToActivate));
      }
    }
  }, [customerId, activeCustomers, dispatch]);

  useEffect(() => {
    socket.current = io(API_URL, {
      transports: ["websocket", "polling"],
      withCredentials: true,
      cors: {
        origin: ["http://localhost:5173", "http://localhost:5174"],
        credentials: true,
      },
    });
    socket.current.emit("join", userInfo?._id);

    socket.current.on("receive_message", (newMessage) => {
      const activeConversationId = activeConversationRef.current;
      const activeCustomer = currentCustomerRef.current;
      const incomingConversationId =
        newMessage.conversationId ||
        (newMessage.senderModel === "Customer" && newMessage.sender
          ? `customer-${newMessage.sender}`
          : newMessage.receiverModel === "Customer" && newMessage.receiver
            ? `customer-${newMessage.receiver}`
            : null);

      if (
        activeConversationId &&
        incomingConversationId === activeConversationId
      ) {
        dispatch(add_new_message(newMessage));
        messageEndRef.current?.scrollIntoView({ behavior: "smooth" });

        if (
          activeCustomer?._id &&
          (newMessage.sender?._id === activeCustomer._id ||
            newMessage.sender === activeCustomer._id)
        ) {
          dispatch(
            mark_messages_read({
              senderId: activeCustomer._id,
              receiverId: userInfo?._id,
            }),
          );
        }
      }
    });

    socket.current.on("typing", ({ userId, isTyping: userIsTyping }) => {
      const activeCustomer = currentCustomerRef.current;
      if (activeCustomer?._id === userId) {
        setIsTyping(userIsTyping);
        if (userIsTyping) {
          // Clear existing timeout
          if (typingTimeout) {
            clearTimeout(typingTimeout);
          }
          // Set new timeout to stop typing indicator
          const timeout = setTimeout(() => {
            setIsTyping(false);
          }, 3000);
          setTypingTimeout(timeout);
        }
      }
    });

    socket.current.on("message_read", ({ messageId, readBy }) => {
      // Update message read status in real-time
      // You can dispatch an action to update the message in the store
    });

    return () => {
      if (activeConversationRef.current) {
        socket.current.emit("leave_conversation", {
          conversationId: activeConversationRef.current,
        });
      }
      socket.current.disconnect();
    };
  }, [userInfo?._id, dispatch]);

  const conversationId =
    storedConversationId ||
    (currentCustomer ? `customer-${currentCustomer._id}` : null);

  useEffect(() => {
    currentCustomerRef.current = currentCustomer;
  }, [currentCustomer]);

  useEffect(() => {
    if (!socket.current) return;

    if (
      activeConversationRef.current &&
      activeConversationRef.current !== conversationId
    ) {
      socket.current.emit("leave_conversation", {
        conversationId: activeConversationRef.current,
      });
      activeConversationRef.current = null;
    }

    if (conversationId) {
      socket.current.emit("join_conversation", { conversationId });
      activeConversationRef.current = conversationId;
    }
  }, [conversationId]);

  useEffect(() => {
    if (customerId) {
      dispatch(get_active_customers_with_new_customer(customerId));
    } else {
      dispatch(get_active_customers());
    }
    dispatch(get_chat_stats());

    const interval = setInterval(() => {
      if (customerId) {
        dispatch(get_active_customers_with_new_customer(customerId));
      } else {
        dispatch(get_active_customers());
      }
      dispatch(get_chat_stats());
    }, 30000);

    return () => clearInterval(interval);
  }, [dispatch, customerId]);

  useEffect(() => {
    if (currentCustomer) {
      dispatch(
        get_messages({
          customerId: currentCustomer._id,
          adminId: userInfo?._id,
        }),
      );
      setShow(false);

      // Mark messages as read when opening chat
      dispatch(
        mark_messages_read({
          senderId: currentCustomer._id,
          receiverId: userInfo?._id,
        }),
      );
    }
  }, [currentCustomer, dispatch, userInfo?._id]);

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleFileUpload = (file) => {
    setSelectedFile(file);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!message.trim() && !selectedFile) return;
    const formData = new FormData();

    if (selectedFile) {
      formData.append("attachment", selectedFile);
    }

    // Sender is now derived from JWT token on backend - removed for security
    formData.append("senderModel", "Admin");
    formData.append("receiver", currentCustomer._id);
    formData.append("receiverModel", "Customer");
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
            // Ensure these fields are included with names
            sender:
              serverResponse.sender &&
              typeof serverResponse.sender === "object" &&
              serverResponse.sender.name
                ? serverResponse.sender
                : {
                    _id: userInfo?._id,
                    name: userInfo?.name || userInfo?.email || "Admin",
                  },
            senderModel: "Admin",
            receiver:
              serverResponse.receiver &&
              typeof serverResponse.receiver === "object" &&
              serverResponse.receiver.name
                ? serverResponse.receiver
                : {
                    _id: currentCustomer._id,
                    name:
                      currentCustomer.name ||
                      currentCustomer.email ||
                      "Customer",
                  },
            receiverModel: "Customer",
            createdAt: new Date().toISOString(),
            conversationId,
          };

          socket.current.emit("send_message", messageToSend);
          dispatch(set_sent_message(null));
        })
        .catch(() => {
          // Error is handled by thunk; no-op here
        });
      setSelectedFile(null);
    } else {
      // Send just IDs to backend API, not objects
      const baseMessage = {
        // Sender is now derived from JWT token on backend - removed for security
        senderModel: "Admin",
        receiver: currentCustomer._id, // Backend expects just the ID string
        receiverModel: "Customer",
        content: message,
        conversationId,
      };

      dispatch(send_message(baseMessage))
        .unwrap()
        .then(({ message: savedMessage }) => {
          socket.current.emit("send_message", savedMessage);
          dispatch(set_sent_message(null));
        })
        .catch(() => {
          // Error already surfaced via toast from thunk
        });
    }

    setMessage("");
    setSelectedFile(null);

    // Stop typing indicator when message is sent
    if (currentCustomer) {
      socket.current.emit("typing", {
        userId: userInfo?._id,
        receiverId: currentCustomer._id,
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

  if (loader && !messages.length && !activeCustomers.length) {
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
      <HeaderText title="Customer Chat" />

      <ChatStats stats={stats} activeCustomers={activeCustomers} />

      <div className="mx-auto max-w-7xl">
        <div className="overflow-hidden rounded-2xl bg-white shadow-nature-medium ring-1 ring-primary-100">
          <div className="relative flex h-[calc(100vh-240px)]">
            {/* Sidebar */}
            <div
              className={`fixed inset-y-0 left-0 z-50 w-80 transform overflow-hidden border-r border-primary-200 bg-white transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 ${
                show ? "translate-x-0" : "-translate-x-full"
              }`}
            >
              <CustomerList
                customers={activeCustomers}
                currentCustomer={currentCustomer}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                setCurrentCustomer={(customer) =>
                  dispatch(set_current_customer(customer))
                }
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
              ) : currentCustomer ? (
                <>
                  <ChatHeader
                    customer={currentCustomer}
                    conversationId={conversationId}
                    messageCount={messages.length}
                  />

                  <div className="border-b border-primary-100 bg-white/70 px-6 py-3">
                    <div className="grid grid-cols-1 gap-3 text-xs text-primary-700 md:grid-cols-3">
                      <div className="rounded-xl border border-primary-100 bg-white px-4 py-2 shadow-nature-soft">
                        <p className="font-semibold text-primary-900">Email</p>
                        <p className="truncate text-text-dark">
                          {currentCustomer.email}
                        </p>
                      </div>
                      <div className="rounded-xl border border-primary-100 bg-white px-4 py-2 shadow-nature-soft">
                        <p className="font-semibold text-primary-900">
                          Unread Messages
                        </p>
                        <p className="text-text-dark">
                          {currentCustomer.unreadCount || 0}
                        </p>
                      </div>
                      <div className="rounded-xl border border-primary-100 bg-white px-4 py-2 shadow-nature-soft">
                        <p className="font-semibold text-primary-900">
                          Last Message
                        </p>
                        <p className="text-text-dark">
                          {currentCustomer.lastMessageAt
                            ? new Date(
                                currentCustomer.lastMessageAt,
                              ).toLocaleString()
                            : "No messages yet"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <MessageArea
                    groupedMessages={groupedMessages}
                    currentCustomer={currentCustomer}
                    userInfo={userInfo}
                    isTyping={isTyping}
                  />

                  <MessageInput
                    message={message}
                    handleInputChange={(e) => {
                      setMessage(e.target.value);

                      // Handle typing indicator with debouncing
                      if (currentCustomer) {
                        // Emit typing start
                        socket.current.emit("typing", {
                          userId: userInfo?._id,
                          receiverId: currentCustomer._id,
                          isTyping: true,
                        });

                        // Clear existing timeout
                        if (typingTimeout) {
                          clearTimeout(typingTimeout);
                        }

                        // Set timeout to stop typing indicator
                        const timeout = setTimeout(() => {
                          socket.current.emit("typing", {
                            userId: userInfo?._id,
                            receiverId: currentCustomer._id,
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
                  description="Select a customer from the sidebar to start chatting. You can search for specific customers using the search bar."
                  action={{
                    icon: FaList,
                    label: "View Customers",
                    onClick: () => {
                      navigate("/admin/dashboard/customers");
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
        aria-label="Toggle customer list"
      >
        <FaList className="h-6 w-6" />
      </button>
    </div>
  );
};

export default AdminToCustomer;
