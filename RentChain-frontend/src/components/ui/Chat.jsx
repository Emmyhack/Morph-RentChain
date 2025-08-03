import { useState, useEffect, useRef } from "react";
import { FiSend, FiUser, FiHome, FiClock, FiCheck } from "react-icons/fi";
import { IoArrowBackSharp, IoEllipsisVertical } from "react-icons/io5";
import { useLocation, useNavigate } from "react-router-dom";
import { useChat } from "../../hooks/useChat";
import { useTranslation } from "react-i18next";

export default function Chat() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { state } = useLocation();
  const messagesEndRef = useRef(null);
  
  // Chat hook
  const {
    messages,
    conversations,
    selectedConversation,
    loading,
    sending,
    unreadCount,
    loadConversations,
    loadMessages,
    sendMessage,
    markAsRead,
    startConversation,
    formatAddress,
    isConnected,
    account
  } = useChat();
  
  // Local state
  const [input, setInput] = useState("");
  const [showConversations, setShowConversations] = useState(true);

  // Extract data from location state
  const propertyTitle = state?.title || "Unknown Property";
  const propertyId = state?.propertyId || 0;
  const otherParticipant = state?.participant || null;
  const location = useLocation();
  const pathname = location.pathname;

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load conversations and messages
  useEffect(() => {
    if (otherParticipant) {
      loadMessages(otherParticipant);
      setShowConversations(false);
    }
  }, [otherParticipant, loadMessages]);

  // Send a new message
  const handleSendMessage = async () => {
    if (!input.trim() || !selectedConversation) return;

    try {
      await sendMessage(input, propertyId);
      setInput("");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  // Handle Enter key press
  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };



  // Get user role based on pathname
  const getUserRole = () => {
    if (pathname.includes("landlord")) return "Landlord";
    if (pathname.includes("tenant")) return "Tenant";
    return "User";
  };

  // Render conversation list
  const renderConversations = () => (
    <div className="bg-white border rounded-xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-bold">Conversations</h3>
        <button
          onClick={() => setShowConversations(false)}
          className="text-blue-600 hover:text-blue-700"
        >
          New Chat
        </button>
      </div>
      
      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading conversations...</p>
        </div>
      ) : conversations.length === 0 ? (
        <div className="text-center py-8">
          <FiUser className="mx-auto h-12 w-12 text-gray-400" />
          <p className="mt-2 text-gray-600">No conversations yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {conversations.map((conversation, index) => (
                         <div
               key={index}
               onClick={() => {
                 loadMessages(conversation.participant);
                 setShowConversations(false);
               }}
               className="flex items-center p-3 rounded-lg hover:bg-gray-50 cursor-pointer border"
             >
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <FiUser className="text-blue-600" />
                </div>
              </div>
              <div className="ml-3 flex-1">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-900">
                    {formatAddress(conversation.participant)}
                  </p>
                  {conversation.unreadCount > 0 && (
                    <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1">
                      {conversation.unreadCount}
                    </span>
                  )}
                </div>
                {conversation.lastMessage && (
                  <p className="text-sm text-gray-500 truncate">
                    {conversation.lastMessage.content || "Message"}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  // Render chat interface
  const renderChat = () => (
    <div className="bg-white border rounded-xl shadow-sm p-6 flex flex-col h-[52rem]">
      {/* Chat Header */}
      <div className="flex items-center justify-between pb-4 border-b">
        <div className="flex items-center">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <FiUser className="text-blue-600" />
          </div>
          <div className="ml-3">
            <h3 className="font-medium">
              {selectedConversation ? formatAddress(selectedConversation) : "Select a conversation"}
            </h3>
            {propertyTitle !== "Unknown Property" && (
              <p className="text-sm text-gray-500 flex items-center">
                <FiHome className="mr-1" />
                {propertyTitle}
              </p>
            )}
          </div>
        </div>
        <button
          onClick={() => setShowConversations(true)}
          className="text-gray-400 hover:text-gray-600"
        >
          <IoEllipsisVertical />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 space-y-4 overflow-y-auto py-4">
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading messages...</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-8">
            <FiUser className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-2 text-gray-600">No messages yet</p>
            <p className="text-sm text-gray-500">Start a conversation!</p>
          </div>
        ) : (
          messages.map((msg, index) => (
            <div
              key={msg.id || index}
              className={`flex flex-col ${msg.isOwn ? "items-end" : "items-start"}`}
            >
              <div
                className={`px-4 py-3 rounded-xl max-w-[75%] ${
                  msg.isOwn 
                    ? "bg-blue-600 text-white" 
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                <p className="text-sm">{msg.content || "Message content"}</p>
                <div className={`flex items-center justify-between mt-1 ${
                  msg.isOwn ? "text-blue-100" : "text-gray-500"
                }`}>
                  <span className="text-xs flex items-center">
                    <FiClock className="mr-1" />
                    {msg.formattedTime}
                  </span>
                                     {msg.isOwn && (
                     <span className="text-xs ml-2">
                       {msg.isRead ? <FiCheck className="text-green-500" /> : <FiCheck />}
                     </span>
                   )}
                </div>
              </div>
              {!msg.isOwn && !msg.isRead && (
                <button
                  onClick={() => markAsRead(msg.id)}
                  className="text-xs text-blue-600 hover:text-blue-700 mt-1"
                >
                  Mark as read
                </button>
              )}
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="flex items-center gap-3 pt-4 border-t">
        <input
          type="text"
          placeholder="Type your message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={sending || !selectedConversation}
          className="flex-1 px-4 py-3 text-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
        />
                 <button
           onClick={handleSendMessage}
           disabled={sending || !input.trim() || !selectedConversation}
           className="p-3 text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
         >
          {sending ? (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
          ) : (
            <FiSend className="text-lg" />
          )}
        </button>
      </div>
    </div>
  );

  // Main render
  return (
    <div className="section-page !py-52 w-full dark:bg-gray-900 dark:text-white">
      <div className="relative w-full pt-24 mx-auto max-w-7xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div
            onClick={() => navigate(-1)}
            className="flex items-center cursor-pointer gap-x-6 hover:scale-95 hover:text-primary"
          >
            <IoArrowBackSharp className="text-4xl" />
            <span className="text-3xl font-medium">Back</span>
          </div>
          
          <div className="text-right">
            <h2 className="text-5xl font-bold">Chat</h2>
            <p className="text-[1.7rem] normal-case text-secondary">
              {getUserRole()} Dashboard
            </p>
          </div>
        </div>

        {/* Connection Status */}
        {!isConnected && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <p className="text-yellow-800">
              Please connect your wallet to use the chat feature.
            </p>
          </div>
        )}

        {/* Chat Interface */}
        {isConnected ? (
          showConversations ? renderConversations() : renderChat()
        ) : (
          <div className="bg-white border rounded-xl shadow-sm p-6 text-center py-12">
            <FiUser className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">
              Connect Your Wallet
            </h3>
            <p className="text-gray-600">
              Please connect your wallet to start chatting with landlords and tenants.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
