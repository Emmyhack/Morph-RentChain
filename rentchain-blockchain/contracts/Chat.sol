// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title Chat
 * @dev Stores message hashes for landlord-tenant communication
 * @notice This contract enables dispute resolution by storing message metadata
 * @author RentChain Team
 */
contract Chat is Ownable, Pausable, ReentrancyGuard {
    // Message structure
    struct Message {
        uint256 messageId;
        address sender;
        address receiver;
        string ipfsHash;
        uint256 timestamp;
        uint256 propertyId; // Optional: link to specific property
        bool isRead;
    }
    
    // Messages mapping: messageId => Message
    mapping(uint256 => Message) public messages;
    
    // User messages: user => messageId[]
    mapping(address => uint256[]) public userMessages;
    
    // Conversation messages: user1 => user2 => messageId[]
    mapping(address => mapping(address => uint256[])) public conversationMessages;
    
    // Property messages: propertyId => messageId[]
    mapping(uint256 => uint256[]) public propertyMessages;
    
    // Total messages counter
    uint256 public totalMessages;
    
    // Events
    event MessageLogged(uint256 indexed messageId, address indexed sender, address indexed receiver, string ipfsHash, uint256 propertyId);
    event MessageRead(uint256 indexed messageId, address indexed reader);
    event PropertyMessageAdded(uint256 indexed propertyId, uint256 indexed messageId);

    /**
     * @dev Constructor
     */
    constructor() Ownable(msg.sender) {}

    /**
     * @dev Logs a message hash
     * @param receiver Address of the message receiver
     * @param ipfsHash IPFS hash containing the message content
     * @param propertyId ID of the property (0 if not property-specific)
     */
    function logMessage(
        address receiver,
        string memory ipfsHash,
        uint256 propertyId
    ) external whenNotPaused {
        require(receiver != address(0), "Invalid receiver address");
        require(receiver != msg.sender, "Cannot send message to self");
        require(bytes(ipfsHash).length > 0, "IPFS hash cannot be empty");
        
        totalMessages++;
        uint256 messageId = totalMessages;
        
        Message memory newMessage = Message({
            messageId: messageId,
            sender: msg.sender,
            receiver: receiver,
            ipfsHash: ipfsHash,
            timestamp: block.timestamp,
            propertyId: propertyId,
            isRead: false
        });
        
        messages[messageId] = newMessage;
        userMessages[msg.sender].push(messageId);
        userMessages[receiver].push(messageId);
        conversationMessages[msg.sender][receiver].push(messageId);
        conversationMessages[receiver][msg.sender].push(messageId);
        
        if (propertyId > 0) {
            propertyMessages[propertyId].push(messageId);
            emit PropertyMessageAdded(propertyId, messageId);
        }
        
        emit MessageLogged(messageId, msg.sender, receiver, ipfsHash, propertyId);
    }

    /**
     * @dev Marks a message as read
     * @param messageId ID of the message
     */
    function markMessageAsRead(uint256 messageId) external whenNotPaused {
        require(messages[messageId].messageId != 0, "Message not found");
        require(
            messages[messageId].receiver == msg.sender,
            "Only receiver can mark message as read"
        );
        require(!messages[messageId].isRead, "Message already read");
        
        messages[messageId].isRead = true;
        
        emit MessageRead(messageId, msg.sender);
    }

    /**
     * @dev Returns message details
     * @param messageId ID of the message
     * @return id Message ID
     * @return sender Sender address
     * @return receiver Receiver address
     * @return ipfsHash IPFS hash of the message
     * @return timestamp Message timestamp
     * @return propertyId Property ID (0 if not property-specific)
     * @return isRead Whether the message has been read
     */
    function getMessage(uint256 messageId) external view returns (
        uint256 id,
        address sender,
        address receiver,
        string memory ipfsHash,
        uint256 timestamp,
        uint256 propertyId,
        bool isRead
    ) {
        Message memory message = messages[messageId];
        return (
            message.messageId,
            message.sender,
            message.receiver,
            message.ipfsHash,
            message.timestamp,
            message.propertyId,
            message.isRead
        );
    }

    /**
     * @dev Returns messages between two users
     * @param user1 First user address
     * @param user2 Second user address
     * @return Array of message IDs
     */
    function getMessages(address user1, address user2) external view returns (uint256[] memory) {
        require(
            msg.sender == user1 || msg.sender == user2,
            "Only conversation participants can view messages"
        );
        return conversationMessages[user1][user2];
    }

    /**
     * @dev Returns all messages for a user
     * @param user Address of the user
     * @return Array of message IDs
     */
    function getUserMessages(address user) external view returns (uint256[] memory) {
        require(
            msg.sender == user,
            "Only user can view their own messages"
        );
        return userMessages[user];
    }

    /**
     * @dev Returns messages for a specific property
     * @param propertyId ID of the property
     * @return Array of message IDs
     */
    function getPropertyMessages(uint256 propertyId) external view returns (uint256[] memory) {
        return propertyMessages[propertyId];
    }

    /**
     * @dev Returns unread messages for a user
     * @param user Address of the user
     * @return Array of unread message IDs
     */
    function getUnreadMessages(address user) external view returns (uint256[] memory) {
        require(
            msg.sender == user,
            "Only user can view their unread messages"
        );
        
        uint256[] memory allMessages = userMessages[user];
        uint256 unreadCount = 0;
        
        // Count unread messages
        for (uint256 i = 0; i < allMessages.length; i++) {
            if (messages[allMessages[i]].receiver == user && !messages[allMessages[i]].isRead) {
                unreadCount++;
            }
        }
        
        // Create array with unread messages
        uint256[] memory unreadMessages = new uint256[](unreadCount);
        uint256 index = 0;
        
        for (uint256 i = 0; i < allMessages.length; i++) {
            if (messages[allMessages[i]].receiver == user && !messages[allMessages[i]].isRead) {
                unreadMessages[index] = allMessages[i];
                index++;
            }
        }
        
        return unreadMessages;
    }

    /**
     * @dev Returns recent messages for a user (last N messages)
     * @param user Address of the user
     * @param count Number of recent messages to return
     * @return Array of recent message IDs
     */
    function getRecentMessages(address user, uint256 count) external view returns (uint256[] memory) {
        require(
            msg.sender == user,
            "Only user can view their recent messages"
        );
        
        uint256[] memory allMessages = userMessages[user];
        uint256 messageCount = allMessages.length;
        
        if (messageCount == 0) {
            return new uint256[](0);
        }
        
        uint256 startIndex = messageCount > count ? messageCount - count : 0;
        uint256 resultCount = messageCount - startIndex;
        
        uint256[] memory recentMessages = new uint256[](resultCount);
        
        for (uint256 i = 0; i < resultCount; i++) {
            recentMessages[i] = allMessages[startIndex + i];
        }
        
        return recentMessages;
    }

    /**
     * @dev Returns total number of messages
     * @return Total messages count
     */
    function getTotalMessages() external view returns (uint256) {
        return totalMessages;
    }

    /**
     * @dev Returns unread message count for a user
     * @param user Address of the user
     * @return Unread message count
     */
    function getUnreadMessageCount(address user) external view returns (uint256) {
        uint256[] memory allMessages = userMessages[user];
        uint256 unreadCount = 0;
        
        for (uint256 i = 0; i < allMessages.length; i++) {
            if (messages[allMessages[i]].receiver == user && !messages[allMessages[i]].isRead) {
                unreadCount++;
            }
        }
        
        return unreadCount;
    }

    /**
     * @dev Checks if a message is read
     * @param messageId ID of the message
     * @return True if message is read
     */
    function isMessageRead(uint256 messageId) external view returns (bool) {
        return messages[messageId].isRead;
    }

    /**
     * @dev Returns conversation participants for a user
     * @param user Address of the user
     * @return Array of conversation participant addresses
     */
    function getConversationParticipants(address user) external view returns (address[] memory) {
        require(
            msg.sender == user,
            "Only user can view their conversation participants"
        );
        
        // This is a simplified implementation
        // In a real scenario, you might want to track unique participants more efficiently
        uint256[] memory allMessages = userMessages[user];
        address[] memory participants = new address[](allMessages.length);
        uint256 participantCount = 0;
        
        for (uint256 i = 0; i < allMessages.length; i++) {
            Message memory message = messages[allMessages[i]];
            address otherParticipant = message.sender == user ? message.receiver : message.sender;
            
            // Check if participant already exists
            bool exists = false;
            for (uint256 j = 0; j < participantCount; j++) {
                if (participants[j] == otherParticipant) {
                    exists = true;
                    break;
                }
            }
            
            if (!exists) {
                participants[participantCount] = otherParticipant;
                participantCount++;
            }
        }
        
        // Resize array to actual count
        address[] memory result = new address[](participantCount);
        for (uint256 i = 0; i < participantCount; i++) {
            result[i] = participants[i];
        }
        
        return result;
    }

    /**
     * @dev Pauses the chat contract (only owner)
     */
    function pause() external onlyOwner {
        _pause();
    }

    /**
     * @dev Unpauses the chat contract (only owner)
     */
    function unpause() external onlyOwner {
        _unpause();
    }
} 