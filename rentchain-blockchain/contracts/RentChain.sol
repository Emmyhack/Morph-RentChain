// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/proxy/utils/UUPSUpgradeable.sol";

import "./Escrow.sol";
import "./Listings.sol";
import "./Complaints.sol";
import "./Reports.sol";
import "./CreditScore.sol";
import "./Reminders.sol";
import "./Chat.sol";
import "./OnRamp.sol";
import "./Language.sol";

/**
 * @title RentChain
 * @dev Main contract for the RentChain platform that coordinates all other contracts
 * @notice This contract serves as the entry point for all RentChain functionality
 * @author RentChain Team
 */
contract RentChain is Ownable, Pausable, ReentrancyGuard, UUPSUpgradeable {
    // Contract addresses for all RentChain modules
    Escrow public escrowContract;
    Listings public listingsContract;
    Complaints public complaintsContract;
    Reports public reportsContract;
    CreditScore public creditScoreContract;
    Reminders public remindersContract;
    Chat public chatContract;
    OnRamp public onRampContract;
    Language public languageContract;

    // Events for contract updates
    event ContractUpdated(string indexed contractName, address indexed oldAddress, address indexed newAddress);
    event PlatformPaused(address indexed pauser, string reason);
    event PlatformUnpaused(address indexed unpauser);

    /**
     * @dev Constructor initializes the RentChain platform with all contract addresses
     * @param _escrow Address of the Escrow contract
     * @param _listings Address of the Listings contract
     * @param _complaints Address of the Complaints contract
     * @param _reports Address of the Reports contract
     * @param _creditScore Address of the CreditScore contract
     * @param _reminders Address of the Reminders contract
     * @param _chat Address of the Chat contract
     * @param _onRamp Address of the OnRamp contract
     * @param _language Address of the Language contract
     */
    constructor(
        address _escrow,
        address _listings,
        address _complaints,
        address _reports,
        address _creditScore,
        address _reminders,
        address _chat,
        address _onRamp,
        address _language
    ) Ownable(msg.sender) {
        require(_escrow != address(0), "Invalid escrow address");
        require(_listings != address(0), "Invalid listings address");
        require(_complaints != address(0), "Invalid complaints address");
        require(_reports != address(0), "Invalid reports address");
        require(_creditScore != address(0), "Invalid credit score address");
        require(_reminders != address(0), "Invalid reminders address");
        require(_chat != address(0), "Invalid chat address");
        require(_onRamp != address(0), "Invalid on-ramp address");
        require(_language != address(0), "Invalid language address");

        escrowContract = Escrow(_escrow);
        listingsContract = Listings(_listings);
        complaintsContract = Complaints(_complaints);
        reportsContract = Reports(_reports);
        creditScoreContract = CreditScore(_creditScore);
        remindersContract = Reminders(_reminders);
        chatContract = Chat(_chat);
        onRampContract = OnRamp(_onRamp);
        languageContract = Language(_language);
    }

    /**
     * @dev Updates a contract address (only owner)
     * @param contractName Name of the contract to update
     * @param newAddress New address for the contract
     */
    function updateContract(string memory contractName, address newAddress) external onlyOwner {
        require(newAddress != address(0), "Invalid contract address");
        
        if (keccak256(bytes(contractName)) == keccak256(bytes("Escrow"))) {
            address oldAddress = address(escrowContract);
            escrowContract = Escrow(newAddress);
            emit ContractUpdated("Escrow", oldAddress, newAddress);
        } else if (keccak256(bytes(contractName)) == keccak256(bytes("Listings"))) {
            address oldAddress = address(listingsContract);
            listingsContract = Listings(newAddress);
            emit ContractUpdated("Listings", oldAddress, newAddress);
        } else if (keccak256(bytes(contractName)) == keccak256(bytes("Complaints"))) {
            address oldAddress = address(complaintsContract);
            complaintsContract = Complaints(newAddress);
            emit ContractUpdated("Complaints", oldAddress, newAddress);
        } else if (keccak256(bytes(contractName)) == keccak256(bytes("Reports"))) {
            address oldAddress = address(reportsContract);
            reportsContract = Reports(newAddress);
            emit ContractUpdated("Reports", oldAddress, newAddress);
        } else if (keccak256(bytes(contractName)) == keccak256(bytes("CreditScore"))) {
            address oldAddress = address(creditScoreContract);
            creditScoreContract = CreditScore(newAddress);
            emit ContractUpdated("CreditScore", oldAddress, newAddress);
        } else if (keccak256(bytes(contractName)) == keccak256(bytes("Reminders"))) {
            address oldAddress = address(remindersContract);
            remindersContract = Reminders(newAddress);
            emit ContractUpdated("Reminders", oldAddress, newAddress);
        } else if (keccak256(bytes(contractName)) == keccak256(bytes("Chat"))) {
            address oldAddress = address(chatContract);
            chatContract = Chat(newAddress);
            emit ContractUpdated("Chat", oldAddress, newAddress);
        } else if (keccak256(bytes(contractName)) == keccak256(bytes("OnRamp"))) {
            address oldAddress = address(onRampContract);
            onRampContract = OnRamp(newAddress);
            emit ContractUpdated("OnRamp", oldAddress, newAddress);
        } else if (keccak256(bytes(contractName)) == keccak256(bytes("Language"))) {
            address oldAddress = address(languageContract);
            languageContract = Language(newAddress);
            emit ContractUpdated("Language", oldAddress, newAddress);
        } else {
            revert("Invalid contract name");
        }
    }

    /**
     * @dev Pauses the entire platform (only owner)
     * @param reason Reason for pausing the platform
     */
    function pausePlatform(string memory reason) external onlyOwner {
        _pause();
        emit PlatformPaused(msg.sender, reason);
    }

    /**
     * @dev Unpauses the entire platform (only owner)
     */
    function unpausePlatform() external onlyOwner {
        _unpause();
        emit PlatformUnpaused(msg.sender);
    }

    /**
     * @dev Returns all contract addresses for frontend integration
     * @return Array of contract addresses in order: escrow, listings, complaints, reports, creditScore, reminders, chat, onRamp, language
     */
    function getContractAddresses() external view returns (address[] memory) {
        address[] memory addresses = new address[](9);
        addresses[0] = address(escrowContract);
        addresses[1] = address(listingsContract);
        addresses[2] = address(complaintsContract);
        addresses[3] = address(reportsContract);
        addresses[4] = address(creditScoreContract);
        addresses[5] = address(remindersContract);
        addresses[6] = address(chatContract);
        addresses[7] = address(onRampContract);
        addresses[8] = address(languageContract);
        return addresses;
    }

    /**
     * @dev Returns platform statistics for analytics
     * @return totalProperties Total number of properties listed
     * @return totalComplaints Total number of complaints logged
     * @return totalReports Total number of reports submitted
     * @return totalReminders Total number of active reminders
     */
    function getPlatformStats() external view returns (
        uint256 totalProperties,
        uint256 totalComplaints,
        uint256 totalReports,
        uint256 totalReminders
    ) {
        totalProperties = listingsContract.getTotalProperties();
        totalComplaints = complaintsContract.getTotalComplaints();
        totalReports = reportsContract.getTotalReports();
        totalReminders = remindersContract.getTotalReminders();
    }

    /**
     * @dev Required by the OZ UUPS module
     */
    function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}
} 