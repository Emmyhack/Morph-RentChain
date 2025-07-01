// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title Reminders
 * @dev Manages automated reminders with Chainlink Keepers integration
 * @notice This contract handles rent due dates and complaint resolution reminders
 * @author RentChain Team
 */
contract Reminders is Ownable, Pausable, ReentrancyGuard {
    // Reminder types
    enum ReminderType { Rent, Complaint }
    
    // Reminder structure
    struct Reminder {
        uint256 reminderId;
        uint256 propertyId;
        address tenant;
        address landlord;
        uint256 dueDate;
        ReminderType reminderType;
        bool isActive;
        bool isTriggered;
        uint256 triggeredAt;
        string ipfsHash; // Additional reminder details
    }
    
    // Reminders mapping: reminderId => Reminder
    mapping(uint256 => Reminder) public reminders;
    
    // Property reminders: propertyId => reminderId[]
    mapping(uint256 => uint256[]) public propertyReminders;
    
    // Tenant reminders: tenant => reminderId[]
    mapping(address => uint256[]) public tenantReminders;
    
    // Landlord reminders: landlord => reminderId[]
    mapping(address => uint256[]) public landlordReminders;
    
    // Active reminders: reminderId => bool
    mapping(uint256 => bool) public activeReminders;
    
    // Total reminders counter
    uint256 public totalReminders;
    
    // Chainlink Keeper interface (simplified)
    address public keeperRegistry;
    
    // Events
    event ReminderSet(uint256 indexed reminderId, uint256 indexed propertyId, address indexed tenant, ReminderType reminderType, uint256 dueDate);
    event ReminderTriggered(uint256 indexed reminderId, ReminderType reminderType, uint256 triggeredAt);
    event ReminderCancelled(uint256 indexed reminderId, address indexed cancelledBy);
    event KeeperRegistryUpdated(address indexed oldRegistry, address indexed newRegistry);

    /**
     * @dev Constructor
     */
    constructor() Ownable(msg.sender) {}

    /**
     * @dev Sets a reminder for rent payment or complaint resolution
     * @param propertyId ID of the property
     * @param tenant Address of the tenant
     * @param landlord Address of the landlord
     * @param dueDate Due date timestamp
     * @param reminderType Type of reminder (0 = Rent, 1 = Complaint)
     * @param ipfsHash IPFS hash containing reminder details
     */
    function setReminder(
        uint256 propertyId,
        address tenant,
        address landlord,
        uint256 dueDate,
        uint8 reminderType,
        string memory ipfsHash
    ) external whenNotPaused {
        require(tenant != address(0), "Invalid tenant address");
        require(landlord != address(0), "Invalid landlord address");
        require(dueDate > block.timestamp, "Due date must be in the future");
        require(reminderType <= 1, "Invalid reminder type");
        require(
            msg.sender == tenant || msg.sender == landlord || msg.sender == owner(),
            "Only tenant, landlord, or owner can set reminder"
        );
        
        totalReminders++;
        uint256 reminderId = totalReminders;
        
        Reminder memory newReminder = Reminder({
            reminderId: reminderId,
            propertyId: propertyId,
            tenant: tenant,
            landlord: landlord,
            dueDate: dueDate,
            reminderType: ReminderType(reminderType),
            isActive: true,
            isTriggered: false,
            triggeredAt: 0,
            ipfsHash: ipfsHash
        });
        
        reminders[reminderId] = newReminder;
        propertyReminders[propertyId].push(reminderId);
        tenantReminders[tenant].push(reminderId);
        landlordReminders[landlord].push(reminderId);
        activeReminders[reminderId] = true;
        
        emit ReminderSet(reminderId, propertyId, tenant, ReminderType(reminderType), dueDate);
    }

    /**
     * @dev Triggers a reminder (called by Chainlink Keepers)
     * @param reminderId ID of the reminder to trigger
     */
    function triggerReminder(uint256 reminderId) external whenNotPaused {
        require(reminders[reminderId].reminderId != 0, "Reminder not found");
        require(reminders[reminderId].isActive, "Reminder is not active");
        require(reminders[reminderId].dueDate <= block.timestamp, "Reminder not due yet");
        require(!reminders[reminderId].isTriggered, "Reminder already triggered");
        
        // Only allow Chainlink Keepers or owner to trigger
        require(
            msg.sender == keeperRegistry || msg.sender == owner(),
            "Only keeper or owner can trigger reminder"
        );
        
        Reminder storage reminder = reminders[reminderId];
        reminder.isTriggered = true;
        reminder.triggeredAt = block.timestamp;
        
        emit ReminderTriggered(reminderId, reminder.reminderType, block.timestamp);
    }

    /**
     * @dev Cancels an active reminder
     * @param reminderId ID of the reminder to cancel
     */
    function cancelReminder(uint256 reminderId) external whenNotPaused {
        require(reminders[reminderId].reminderId != 0, "Reminder not found");
        require(reminders[reminderId].isActive, "Reminder is not active");
        require(
            msg.sender == reminders[reminderId].tenant ||
            msg.sender == reminders[reminderId].landlord ||
            msg.sender == owner(),
            "Only tenant, landlord, or owner can cancel reminder"
        );
        
        Reminder storage reminder = reminders[reminderId];
        reminder.isActive = false;
        activeReminders[reminderId] = false;
        
        emit ReminderCancelled(reminderId, msg.sender);
    }

    /**
     * @dev Updates the Chainlink Keeper registry address
     * @param newRegistry New keeper registry address
     */
    function updateKeeperRegistry(address newRegistry) external onlyOwner {
        require(newRegistry != address(0), "Invalid registry address");
        address oldRegistry = keeperRegistry;
        keeperRegistry = newRegistry;
        emit KeeperRegistryUpdated(oldRegistry, newRegistry);
    }

    /**
     * @dev Returns reminder details
     * @param reminderId ID of the reminder
     * @return id Reminder ID
     * @return propertyId Property ID
     * @return tenant Tenant address
     * @return landlord Landlord address
     * @return dueDate Due date timestamp
     * @return reminderType Type of reminder
     * @return isActive Active status
     * @return isTriggered Triggered status
     * @return triggeredAt Trigger timestamp
     * @return ipfsHash IPFS hash of reminder details
     */
    function getReminder(uint256 reminderId) external view returns (
        uint256 id,
        uint256 propertyId,
        address tenant,
        address landlord,
        uint256 dueDate,
        ReminderType reminderType,
        bool isActive,
        bool isTriggered,
        uint256 triggeredAt,
        string memory ipfsHash
    ) {
        Reminder memory reminder = reminders[reminderId];
        return (
            reminder.reminderId,
            reminder.propertyId,
            reminder.tenant,
            reminder.landlord,
            reminder.dueDate,
            reminder.reminderType,
            reminder.isActive,
            reminder.isTriggered,
            reminder.triggeredAt,
            reminder.ipfsHash
        );
    }

    /**
     * @dev Returns all reminders for a property
     * @param propertyId ID of the property
     * @return Array of reminder IDs
     */
    function getPropertyReminders(uint256 propertyId) external view returns (uint256[] memory) {
        return propertyReminders[propertyId];
    }

    /**
     * @dev Returns all reminders for a tenant
     * @param tenant Address of the tenant
     * @return Array of reminder IDs
     */
    function getTenantReminders(address tenant) external view returns (uint256[] memory) {
        return tenantReminders[tenant];
    }

    /**
     * @dev Returns all reminders for a landlord
     * @param landlord Address of the landlord
     * @return Array of reminder IDs
     */
    function getLandlordReminders(address landlord) external view returns (uint256[] memory) {
        return landlordReminders[landlord];
    }

    /**
     * @dev Returns all active reminders
     * @param offset Starting index
     * @param limit Maximum number of reminders to return
     * @return Array of active reminder IDs
     */
    function getActiveReminders(uint256 offset, uint256 limit) external view returns (uint256[] memory) {
        uint256[] memory active = new uint256[](limit);
        uint256 count = 0;
        
        for (uint256 i = offset + 1; i <= totalReminders && count < limit; i++) {
            if (activeReminders[i]) {
                active[count] = i;
                count++;
            }
        }
        
        // Resize array to actual count
        uint256[] memory result = new uint256[](count);
        for (uint256 i = 0; i < count; i++) {
            result[i] = active[i];
        }
        
        return result;
    }

    /**
     * @dev Returns reminders that are due for triggering
     * @param maxCount Maximum number of reminders to return
     * @return Array of due reminder IDs
     */
    function getDueReminders(uint256 maxCount) external view returns (uint256[] memory) {
        uint256[] memory due = new uint256[](maxCount);
        uint256 count = 0;
        
        for (uint256 i = 1; i <= totalReminders && count < maxCount; i++) {
            Reminder memory reminder = reminders[i];
            if (reminder.isActive && 
                !reminder.isTriggered && 
                reminder.dueDate <= block.timestamp) {
                due[count] = i;
                count++;
            }
        }
        
        // Resize array to actual count
        uint256[] memory result = new uint256[](count);
        for (uint256 i = 0; i < count; i++) {
            result[i] = due[i];
        }
        
        return result;
    }

    /**
     * @dev Returns total number of reminders
     * @return Total reminders count
     */
    function getTotalReminders() external view returns (uint256) {
        return totalReminders;
    }

    /**
     * @dev Returns total number of active reminders
     * @return Total active reminders count
     */
    function getTotalActiveReminders() external view returns (uint256) {
        uint256 activeCount = 0;
        for (uint256 i = 1; i <= totalReminders; i++) {
            if (activeReminders[i]) {
                activeCount++;
            }
        }
        return activeCount;
    }

    /**
     * @dev Checks if a reminder is active
     * @param reminderId ID of the reminder
     * @return True if reminder is active
     */
    function isReminderActive(uint256 reminderId) external view returns (bool) {
        return activeReminders[reminderId];
    }

    /**
     * @dev Checks if a reminder is due
     * @param reminderId ID of the reminder
     * @return True if reminder is due
     */
    function isReminderDue(uint256 reminderId) external view returns (bool) {
        Reminder memory reminder = reminders[reminderId];
        return reminder.isActive && 
               !reminder.isTriggered && 
               reminder.dueDate <= block.timestamp;
    }

    /**
     * @dev Pauses the reminders contract (only owner)
     */
    function pause() external onlyOwner {
        _pause();
    }

    /**
     * @dev Unpauses the reminders contract (only owner)
     */
    function unpause() external onlyOwner {
        _unpause();
    }
} 