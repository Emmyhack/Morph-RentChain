import { useState, useEffect, useCallback } from 'react';
import { useWeb3 } from './useWeb3';
import { useContracts } from './useContracts';

export const useChat = () => {
  const { account, isConnected } = useWeb3();
  const { contractService } = useContracts();
  
  // State
  const [messages, setMessages] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Load conversations
  const loadConversations = useCallback(async () => {
    if (!isConnected || !account || !contractService) return;

    try {
      setLoading(true);
      const participants = await contractService.getConversationParticipants(account);
      
      // Get conversation details
      const conversationData = await Promise.all(
        participants.map(async (participant) => {
          const messages = await contractService.getMessages(account, participant);
          const unreadCount = await contractService.getUnreadMessageCount(account);
          
          let lastMessage = null;
          if (messages.length > 0) {
            lastMessage = await contractService.getMessage(messages[messages.length - 1]);
          }
          
          return {
            participant,
            lastMessage,
            unreadCount: parseInt(unreadCount),
            messageCount: messages.length
          };
        })
      );

      setConversations(conversationData);
      
      // Calculate total unread count
      const totalUnread = conversationData.reduce((sum, conv) => sum + conv.unreadCount, 0);
      setUnreadCount(totalUnread);
    } catch (error) {
      console.error("Error loading conversations:", error);
    } finally {
      setLoading(false);
    }
  }, [isConnected, account, contractService]);

  // Load messages for a specific conversation
  const loadMessages = useCallback(async (participant) => {
    if (!isConnected || !account || !contractService || !participant) return;

    try {
      setLoading(true);
      const messageIds = await contractService.getMessages(account, participant);
      
      // Get full message details
      const messageData = await Promise.all(
        messageIds.map(async (messageId) => {
          const message = await contractService.getMessage(messageId);
          return {
            ...message,
            isOwn: message.sender === account,
            formattedTime: new Date(message.timestamp).toLocaleTimeString([], { 
              hour: "2-digit", 
              minute: "2-digit" 
            }),
            formattedDate: new Date(message.timestamp).toLocaleDateString()
          };
        })
      );

      setMessages(messageData);
      setSelectedConversation(participant);
    } catch (error) {
      console.error("Error loading messages:", error);
    } finally {
      setLoading(false);
    }
  }, [isConnected, account, contractService]);

  // Send a new message
  const sendMessage = useCallback(async (content, propertyId = 0) => {
    if (!content.trim() || !isConnected || !contractService || !selectedConversation) {
      throw new Error('Cannot send message: missing required parameters');
    }

    try {
      setSending(true);
      
      // Create message content
      const messageContent = {
        text: content.trim(),
        timestamp: Date.now(),
        sender: account,
        receiver: selectedConversation
      };

      // Create a simple hash for demo purposes
      // In production, this would be uploaded to IPFS
      const messageHash = btoa(JSON.stringify(messageContent));
      
      // Log message to blockchain
      await contractService.logMessage(selectedConversation, messageHash, propertyId);
      
      // Add message to local state
      const newMessage = {
        id: Date.now().toString(),
        sender: account,
        receiver: selectedConversation,
        ipfsHash: messageHash,
        timestamp: new Date(),
        propertyId: propertyId.toString(),
        isRead: false,
        isOwn: true,
        formattedTime: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        formattedDate: new Date().toLocaleDateString(),
        content: content.trim()
      };

      setMessages(prev => [...prev, newMessage]);
      
      // Reload conversations to update last message
      await loadConversations();
      
      return newMessage;
    } catch (error) {
      console.error("Error sending message:", error);
      throw error;
    } finally {
      setSending(false);
    }
  }, [isConnected, account, contractService, selectedConversation, loadConversations]);

  // Mark message as read
  const markAsRead = useCallback(async (messageId) => {
    if (!isConnected || !contractService) return;

    try {
      await contractService.markMessageAsRead(messageId);
      setMessages(prev => 
        prev.map(msg => 
          msg.id === messageId ? { ...msg, isRead: true } : msg
        )
      );
      
      // Reload conversations to update unread count
      await loadConversations();
    } catch (error) {
      console.error("Error marking message as read:", error);
    }
  }, [isConnected, contractService, loadConversations]);

  // Start a new conversation
  const startConversation = useCallback((participant) => {
    setSelectedConversation(participant);
    setMessages([]);
  }, []);

  // Clear current conversation
  const clearConversation = useCallback(() => {
    setSelectedConversation(null);
    setMessages([]);
  }, []);

  // Format address for display
  const formatAddress = useCallback((address) => {
    if (!address) return "Unknown";
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  }, []);

  // Auto-refresh conversations when connection changes
  useEffect(() => {
    if (isConnected && account && contractService) {
      loadConversations();
    }
  }, [isConnected, account, contractService, loadConversations]);

  return {
    // State
    messages,
    conversations,
    selectedConversation,
    loading,
    sending,
    unreadCount,
    
    // Actions
    loadConversations,
    loadMessages,
    sendMessage,
    markAsRead,
    startConversation,
    clearConversation,
    formatAddress,
    
    // Computed
    hasUnreadMessages: unreadCount > 0,
    isConnected,
    account
  };
};