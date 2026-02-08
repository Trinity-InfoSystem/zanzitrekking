// src/components/ChatBot/ChatBot.jsx

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Bot,
  Calendar,
  DollarSign,
  Hotel,
  Loader2,
  Maximize2,
  MessageCircle,
  Minimize2,
  Mountain,
  Phone,
  Send,
  Sparkles,
  Tent,
  X,
} from "lucide-react";
import seedData from "../../seed-data.json";
import { IntelligentSearch } from "../../utils/intelligentSearch";
import { ResponseGenerator } from "../../utils/responseGenerator";
import { sanitizeHTML } from "../../utils/sanitize";

export const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  // Initialize search and response generator
  const searchEngine = useMemo(() => new IntelligentSearch(seedData), []);
  const responseGenerator = useMemo(() => new ResponseGenerator(seedData), []);

  const quickActions = useMemo(
    () => [
      {
        icon: Mountain,
        label: "Routes",
        query: "Show me Kilimanjaro routes and their details",
      },
      {
        icon: Tent,
        label: "Safaris",
        query: "What safari options do you have available?",
      },
      {
        icon: DollarSign,
        label: "Pricing",
        query: "Tell me about your pricing for different packages",
      },
      {
        icon: Hotel,
        label: "Hotels",
        query: "What accommodation options are available?",
      },
      {
        icon: Calendar,
        label: "Seasons",
        query: "When is the best time to visit Tanzania?",
      },
      {
        icon: Phone,
        label: "Contact",
        query: "How can I contact you and where are you located?",
      },
    ],
    [],
  );

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  // Initialize with welcome message
  useEffect(() => {
    if (messages.length === 0 && isOpen) {
      setMessages([
        {
          role: "assistant",
          content: responseGenerator.generateWelcome(),
          timestamp: new Date(),
        },
      ]);
    }
  }, [isOpen, messages.length, responseGenerator]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Load chat history from sessionStorage
  useEffect(() => {
    const savedMessages = sessionStorage.getItem("chatMessages");
    if (savedMessages && isOpen) {
      try {
        const parsed = JSON.parse(savedMessages);
        if (parsed.length > 0) {
          setMessages(parsed);
        }
      } catch (error) {
        console.error("Error loading chat history:", error);
      }
    }
  }, [isOpen]);

  // Save chat history to sessionStorage
  useEffect(() => {
    if (messages.length > 0) {
      sessionStorage.setItem("chatMessages", JSON.stringify(messages));
    }
  }, [messages]);

  // Handle ESC key to close chat
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  // Intelligent response generation
  const getIntelligentResponse = useCallback(
    (query) => {
      try {
        const categories = searchEngine.categorizeQuery(query);
        const details = searchEngine.extractDetails(query);

        // Handle pricing queries
        if (categories.includes("pricing")) {
          if (
            categories.includes("routes") ||
            details.routeName ||
            (details.days && details.days >= 3 && details.days <= 10)
          ) {
            const routes = searchEngine.findMountainRoute(
              details.routeName,
              details.days,
            );
            if (routes) {
              return responseGenerator.generatePricingResponse(details, routes);
            }
          }

          if (categories.includes("safari") || details.parkName) {
            const safaris = searchEngine.findSafariOptions(
              details.days,
              details.parkName,
            );
            if (safaris) {
              return responseGenerator.generateSafariPricingResponse(
                safaris,
                details,
              );
            }
          }

          return responseGenerator.generateGeneralPricing(details.category);
        }

        // Handle route details queries
        if (categories.includes("routes") && details.routeName) {
          const routeData = searchEngine.getRouteDetails(details.routeName);
          return responseGenerator.generateRouteDetails(
            details.routeName,
            routeData,
          );
        }

        // Handle routes overview
        if (categories.includes("routes") && !details.routeName) {
          const allRoutes = Object.entries(seedData.kilimanjaroRoutes);
          let response = "⛰️ **Kilimanjaro Climbing Routes**\n\n";
          response += `We offer ${allRoutes.length} main routes to summit Kilimanjaro:\n\n`;

          allRoutes.forEach(([key, route]) => {
            const itineraries = Object.values(route.itineraries);
            response += `**${route.name}** (${route.nickname})\n`;
            response += `• Elevation: ${route.summit.elevation}m\n`;
            response += `• Durations: ${itineraries.map((i) => `${i.days}D`).join(", ")}\n`;
            response += `• Starting point: ${route.startingPoint.name}\n\n`;
          });

          response += "\n💡 For details, ask: \"Tell me about Lemosho route\"";
          return response;
        }

        // Handle safari queries
        if (categories.includes("safari")) {
          const safaris = searchEngine.findSafariOptions(
            details.days,
            details.parkName,
          );
          return responseGenerator.generateSafariOverview(safaris);
        }

        // Handle inclusions queries
        if (categories.includes("inclusions")) {
          return responseGenerator.generateInclusionsResponse(details.category);
        }

        // Handle accommodation queries
        if (categories.includes("accommodation")) {
          return responseGenerator.generateAccommodationResponse();
        }

        // Handle season/timing queries
        if (categories.includes("season")) {
          return responseGenerator.generateSeasonResponse();
        }

        // Handle contact queries
        if (categories.includes("contact")) {
          return responseGenerator.generateContactResponse();
        }

        // Handle company info queries
        if (categories.includes("company")) {
          return responseGenerator.generateCompanyInfo();
        }

        // Handle booking/terms queries
        if (categories.includes("booking") || categories.includes("terms")) {
          let response = "📋 **Booking & Terms Information**\n\n";
          response += "**Deposit:**\n";
          response += "• 10% or minimum $150 (non-refundable)\n";
          response += "• Lifetime validity - change dates anytime!\n";
          response += "• Transferable to different trip\n\n";

          response += "**Cancellation Policy:**\n";
          response += "• 90+ days: 90% refund\n";
          response += "• 60+ days: 70% refund\n";
          response += "• 30+ days: 50% refund\n";
          response += "• Less than 30 days: No refund\n\n";

          response += "**Payment Methods:**\n";
          response += "• Bank transfer (USD or TZS)\n";
          response += "• Credit/Debit card\n";
          response += "• PayPal (additional fees apply)\n\n";

          response += "💡 Full terms available on our website or contact us for details.";
          return response;
        }

        // Fuzzy search as fallback
        const fuzzyResults = searchEngine.fuzzySearch(query, 3);
        if (fuzzyResults.length > 0) {
          let response = "I found some relevant information:\n\n";
          fuzzyResults.forEach((result, index) => {
            response += `${index + 1}. ${result.content}\n\n`;
          });
          response += "\nCan you be more specific about what you'd like to know?";
          return response;
        }

        return responseGenerator.generateDefaultResponse();
      } catch (error) {
        console.error("Error generating response:", error);
        return "I apologize, but I encountered an error processing your question. Please try rephrasing or ask something else! 😊";
      }
    },
    [searchEngine, responseGenerator],
  );

  const handleSendMessage = useCallback(
    (messageText = inputMessage) => {
      const text = messageText.trim();
      if (!text) {return;}

      const userMessage = {
        role: "user",
        content: text,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMessage]);
      setInputMessage("");
      setIsTyping(true);

      setTimeout(() => {
        const response = getIntelligentResponse(text);
        const assistantMessage = {
          role: "assistant",
          content: response,
          timestamp: new Date(),
        };

        setMessages((prev) => [...prev, assistantMessage]);
        setIsTyping(false);
      }, 800);
    },
    [inputMessage, getIntelligentResponse],
  );

  const handleQuickAction = useCallback(
    (query) => {
      handleSendMessage(query);
    },
    [handleSendMessage],
  );

  const handleKeyPress = useCallback(
    (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSendMessage();
      }
    },
    [handleSendMessage],
  );

  const formatMessage = (content) => {
    if (!content || typeof content !== "string") {
      return "";
    }
    // First format the message with markdown-like syntax
    const formatted = content
      .replace(
        /\*\*(.*?)\*\*/g,
        '<strong class="font-semibold text-gray-900">$1</strong>',
      )
      .replace(/• /g, '<span class="text-primary-600">•</span> ')
      .replace(/\n/g, "<br />");
    
    // Then sanitize to prevent XSS attacks
    return sanitizeHTML(formatted);
  };

  return (
    <>
      {/* Floating Chat Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="group fixed bottom-4 right-4 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-primary-600 to-primary-700 shadow-xl transition-all duration-300 hover:scale-110 hover:shadow-2xl sm:bottom-6 sm:right-6 sm:h-16 sm:w-16"
          aria-label="Open chat"
        >
          <MessageCircle className="h-6 w-6 text-white transition-transform duration-300 group-hover:scale-110 sm:h-7 sm:w-7" />
          <span className="absolute -right-1 -top-1 flex h-5 w-5 animate-pulse items-center justify-center rounded-full bg-accent-500 shadow-lg sm:h-6 sm:w-6">
            <Sparkles className="h-3 w-3 text-white sm:h-3.5 sm:w-3.5" />
          </span>
        </button>
      )}

      {/* Chat Window - Responsive */}
      {isOpen && (
        <div
          className={`fixed z-50 flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl transition-all duration-300 ${
            isMinimized
              ? "bottom-4 right-4 h-14 w-64 sm:bottom-6 sm:right-6"
              : "inset-4 sm:inset-auto sm:bottom-6 sm:right-6 sm:h-[680px] sm:w-[440px] md:h-[720px]"
          }`}
        >
          {/* Header */}
          <div className="relative flex-shrink-0 overflow-hidden bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 px-4 py-3 sm:px-6 sm:py-4">
            <div className="absolute inset-0 opacity-10">
              <div
                className="h-full w-full"
                style={{
                  backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Ccircle cx='7' cy='7' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
                }}
              />
            </div>
            <div className="relative flex items-center justify-between">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="relative flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-white/90 shadow-lg backdrop-blur-sm sm:h-12 sm:w-12">
                  <Bot className="h-5 w-5 text-primary-700 sm:h-6 sm:w-6" />
                  <div className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-green-500 ring-2 ring-white sm:h-3 sm:w-3" />
                </div>
                {!isMinimized && (
                  <div>
                    <h3 className="text-base font-bold text-white sm:text-lg">
                      Zanzi Assistant
                    </h3>
                    <p className="text-xs text-white/90 sm:text-sm">
                      Online • Ready to help
                    </p>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-1 sm:gap-2">
                {/* Minimize/Maximize Button - Hidden on mobile when minimized */}
                {!isMinimized && (
                  <button
                    onClick={() => setIsMinimized(!isMinimized)}
                    className="hidden rounded-lg bg-white/10 p-2 text-white backdrop-blur-sm transition-all duration-300 hover:bg-white/20 sm:block"
                    aria-label={isMinimized ? "Maximize" : "Minimize"}
                  >
                    {isMinimized ? (
                      <Maximize2 className="h-4 w-4" />
                    ) : (
                      <Minimize2 className="h-4 w-4" />
                    )}
                  </button>
                )}
                {/* Close Button */}
                <button
                  onClick={() => setIsOpen(false)}
                  className="rounded-lg bg-white/10 p-2 text-white backdrop-blur-sm transition-all duration-300 hover:rotate-90 hover:bg-white/20"
                  aria-label="Close chat"
                >
                  <X className="h-4 w-4 sm:h-5 sm:w-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Content - Hidden when minimized */}
          {!isMinimized && (
            <>
              {/* Messages Container */}
              <div className="scrollbar-thin scrollbar-track-gray-100 scrollbar-thumb-gray-300 flex-1 overflow-y-auto bg-gradient-to-b from-gray-50 to-white p-3 sm:p-4">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`mb-3 flex sm:mb-4 ${message.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    {message.role === "assistant" && (
                      <div className="mr-2 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-primary-100 sm:h-8 sm:w-8">
                        <Bot className="h-3.5 w-3.5 text-primary-700 sm:h-4 sm:w-4" />
                      </div>
                    )}
                    <div
                      className={`max-w-[85%] rounded-2xl px-3 py-2 sm:max-w-[85%] sm:px-4 sm:py-3 ${
                        message.role === "user"
                          ? "rounded-br-md bg-gradient-to-br from-primary-600 to-primary-700 text-white shadow-md"
                          : "rounded-bl-md border border-gray-200 bg-white shadow-sm"
                      }`}
                    >
                      <div
                        className={`whitespace-pre-wrap text-xs leading-relaxed sm:text-sm ${
                          message.role === "user"
                            ? "text-white"
                            : "text-gray-800"
                        }`}
                        dangerouslySetInnerHTML={{
                          __html: formatMessage(message.content),
                        }}
                      />
                      <p
                        className={`mt-1 text-[10px] sm:text-xs ${
                          message.role === "user"
                            ? "text-white/70"
                            : "text-gray-400"
                        }`}
                      >
                        {new Date(message.timestamp).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                ))}

                {/* Typing Indicator */}
                {isTyping && (
                  <div className="mb-4 flex justify-start">
                    <div className="mr-2 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-primary-100 sm:h-8 sm:w-8">
                      <Bot className="h-3.5 w-3.5 text-primary-700 sm:h-4 sm:w-4" />
                    </div>
                    <div className="rounded-2xl rounded-bl-md border border-gray-200 bg-white px-4 py-2 shadow-sm sm:px-5 sm:py-3">
                      <div className="flex items-center gap-1.5">
                        <div
                          className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary-500 sm:h-2 sm:w-2"
                          style={{ animationDelay: "0s" }}
                        />
                        <div
                          className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary-500 sm:h-2 sm:w-2"
                          style={{ animationDelay: "0.2s" }}
                        />
                        <div
                          className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary-500 sm:h-2 sm:w-2"
                          style={{ animationDelay: "0.4s" }}
                        />
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Quick Actions - Only show on first load */}
              {messages.length <= 1 && !isTyping && (
                <div className="flex-shrink-0 border-t border-gray-200 bg-white px-3 py-2 sm:px-4 sm:py-3">
                  <p className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-gray-500 sm:mb-3 sm:text-xs">
                    Quick Actions
                  </p>
                  <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
                    {quickActions.map((action) => {
                      const Icon = action.icon;
                      return (
                        <button
                          key={action.label}
                          onClick={() => handleQuickAction(action.query)}
                          className="group flex flex-col items-center gap-1.5 rounded-lg border border-gray-200 bg-white p-2 transition-all duration-300 hover:scale-105 hover:border-primary-300 hover:bg-primary-50 hover:shadow-md sm:gap-2 sm:rounded-xl sm:p-3"
                        >
                          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary-50 transition-colors group-hover:bg-primary-100 sm:h-9 sm:w-9">
                            <Icon className="h-3.5 w-3.5 text-primary-600 sm:h-5 sm:w-5" />
                          </div>
                          <span className="text-[10px] font-medium text-gray-600 group-hover:text-primary-700 sm:text-xs">
                            {action.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Input Container */}
              <div className="flex-shrink-0 border-t border-gray-200 bg-white p-3 sm:p-4">
                <div className="flex items-end gap-2">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Ask me anything..."
                      className="w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2.5 text-xs text-gray-900 outline-none transition-all placeholder:text-gray-400 focus:border-primary-500 focus:bg-white focus:ring-2 focus:ring-primary-500/20 sm:rounded-xl sm:px-4 sm:py-3 sm:text-sm"
                      disabled={isTyping}
                    />
                  </div>
                  <button
                    onClick={() => handleSendMessage()}
                    disabled={!inputMessage.trim() || isTyping}
                    className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-primary-600 to-primary-700 text-white shadow-md transition-all duration-300 hover:scale-105 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100 sm:h-11 sm:w-11 sm:rounded-xl"
                    aria-label="Send message"
                  >
                    {isTyping ? (
                      <Loader2 className="h-4 w-4 animate-spin sm:h-5 sm:w-5" />
                    ) : (
                      <Send className="h-4 w-4 sm:h-5 sm:w-5" />
                    )}
                  </button>
                </div>
                <p className="mt-1.5 text-center text-[10px] text-gray-400 sm:mt-2 sm:text-xs">
                  Powered by intelligent search • Instant responses
                </p>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
};

export default ChatBot;
