// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title OnRamp
 * @dev Records fiat-to-crypto transaction IDs for auditability
 * @notice This contract tracks fiat on-ramp transactions linked to escrow payments
 * @author RentChain Team
 */
contract OnRamp is Ownable, Pausable, ReentrancyGuard {
    // On-ramp transaction structure
    struct OnRampTransaction {
        uint256 transactionId;
        address tenant;
        uint256 propertyId;
        uint256 amount;
        string onRampTxId;
        uint256 timestamp;
        bool isVerified;
        string verificationHash;
    }
    
    // On-ramp transactions mapping: transactionId => OnRampTransaction
    mapping(uint256 => OnRampTransaction) public onRampTransactions;
    
    // Tenant transactions: tenant => transactionId[]
    mapping(address => uint256[]) public tenantTransactions;
    
    // Property transactions: propertyId => transactionId[]
    mapping(uint256 => uint256[]) public propertyTransactions;
    
    // On-ramp provider transactions: onRampTxId => transactionId
    mapping(string => uint256) public providerTransactionMap;
    
    // Total transactions counter
    uint256 public totalTransactions;
    
    // Authorized contracts that can record transactions
    mapping(address => bool) public authorizedContracts;
    
    // Events
    event OnRampRecorded(uint256 indexed transactionId, address indexed tenant, uint256 indexed propertyId, uint256 amount, string onRampTxId);
    event TransactionVerified(uint256 indexed transactionId, string verificationHash);
    event AuthorizedContractUpdated(address indexed contractAddress, bool authorized);

    /**
     * @dev Constructor
     */
    constructor() Ownable(msg.sender) {}

    /**
     * @dev Records an on-ramp transaction (called by Escrow contract)
     * @param tenant Address of the tenant
     * @param propertyId ID of the property
     * @param amount Amount in USDT
     * @param onRampTxId On-ramp provider transaction ID
     */
    function recordOnRamp(
        address tenant,
        uint256 propertyId,
        uint256 amount,
        string memory onRampTxId
    ) external whenNotPaused {
        require(authorizedContracts[msg.sender], "Only authorized contracts can record on-ramp transactions");
        require(tenant != address(0), "Invalid tenant address");
        require(amount > 0, "Amount must be greater than 0");
        require(bytes(onRampTxId).length > 0, "On-ramp transaction ID cannot be empty");
        require(providerTransactionMap[onRampTxId] == 0, "On-ramp transaction ID already recorded");
        
        totalTransactions++;
        uint256 transactionId = totalTransactions;
        
        OnRampTransaction memory newTransaction = OnRampTransaction({
            transactionId: transactionId,
            tenant: tenant,
            propertyId: propertyId,
            amount: amount,
            onRampTxId: onRampTxId,
            timestamp: block.timestamp,
            isVerified: false,
            verificationHash: ""
        });
        
        onRampTransactions[transactionId] = newTransaction;
        tenantTransactions[tenant].push(transactionId);
        propertyTransactions[propertyId].push(transactionId);
        providerTransactionMap[onRampTxId] = transactionId;
        
        emit OnRampRecorded(transactionId, tenant, propertyId, amount, onRampTxId);
    }

    /**
     * @dev Verifies an on-ramp transaction (only owner)
     * @param transactionId ID of the transaction to verify
     * @param verificationHash Hash for verification
     */
    function verifyTransaction(uint256 transactionId, string memory verificationHash) external onlyOwner {
        require(onRampTransactions[transactionId].transactionId != 0, "Transaction not found");
        require(!onRampTransactions[transactionId].isVerified, "Transaction already verified");
        require(bytes(verificationHash).length > 0, "Verification hash cannot be empty");
        
        OnRampTransaction storage transaction = onRampTransactions[transactionId];
        transaction.isVerified = true;
        transaction.verificationHash = verificationHash;
        
        emit TransactionVerified(transactionId, verificationHash);
    }

    /**
     * @dev Sets authorized contract (only owner)
     * @param contractAddress Address of the contract
     * @param authorized Whether the contract is authorized
     */
    function setAuthorizedContract(address contractAddress, bool authorized) external onlyOwner {
        require(contractAddress != address(0), "Invalid contract address");
        authorizedContracts[contractAddress] = authorized;
        emit AuthorizedContractUpdated(contractAddress, authorized);
    }

    /**
     * @dev Returns on-ramp transaction details
     * @param transactionId ID of the transaction
     * @return id Transaction ID
     * @return tenant Tenant address
     * @return propertyId Property ID
     * @return amount Amount in USDT
     * @return onRampTxId On-ramp provider transaction ID
     * @return timestamp Timestamp of the transaction
     * @return isVerified Whether the transaction is verified
     * @return verificationHash Verification hash
     */
    function getOnRampTx(uint256 transactionId) external view returns (
        uint256 id,
        address tenant,
        uint256 propertyId,
        uint256 amount,
        string memory onRampTxId,
        uint256 timestamp,
        bool isVerified,
        string memory verificationHash
    ) {
        OnRampTransaction memory transaction = onRampTransactions[transactionId];
        return (
            transaction.transactionId,
            transaction.tenant,
            transaction.propertyId,
            transaction.amount,
            transaction.onRampTxId,
            transaction.timestamp,
            transaction.isVerified,
            transaction.verificationHash
        );
    }

    /**
     * @dev Returns transaction by on-ramp provider ID
     * @param onRampTxId On-ramp provider transaction ID
     * @return Transaction ID
     */
    function getTransactionByProviderId(string memory onRampTxId) external view returns (uint256) {
        return providerTransactionMap[onRampTxId];
    }

    /**
     * @dev Returns all transactions for a tenant
     * @param tenant Address of the tenant
     * @return Array of transaction IDs
     */
    function getTenantTransactions(address tenant) external view returns (uint256[] memory) {
        return tenantTransactions[tenant];
    }

    /**
     * @dev Returns all transactions for a property
     * @param propertyId ID of the property
     * @return Array of transaction IDs
     */
    function getPropertyTransactions(uint256 propertyId) external view returns (uint256[] memory) {
        return propertyTransactions[propertyId];
    }

    /**
     * @dev Returns verified transactions for a tenant
     * @param tenant Address of the tenant
     * @return Array of verified transaction IDs
     */
    function getVerifiedTenantTransactions(address tenant) external view returns (uint256[] memory) {
        uint256[] memory allTransactions = tenantTransactions[tenant];
        uint256 verifiedCount = 0;
        
        // Count verified transactions
        for (uint256 i = 0; i < allTransactions.length; i++) {
            if (onRampTransactions[allTransactions[i]].isVerified) {
                verifiedCount++;
            }
        }
        
        // Create array with verified transactions
        uint256[] memory verifiedTransactions = new uint256[](verifiedCount);
        uint256 index = 0;
        
        for (uint256 i = 0; i < allTransactions.length; i++) {
            if (onRampTransactions[allTransactions[i]].isVerified) {
                verifiedTransactions[index] = allTransactions[i];
                index++;
            }
        }
        
        return verifiedTransactions;
    }

    /**
     * @dev Returns total amount of on-ramp transactions for a tenant
     * @param tenant Address of the tenant
     * @return Total amount in USDT
     */
    function getTenantTotalAmount(address tenant) external view returns (uint256) {
        uint256[] memory allTransactions = tenantTransactions[tenant];
        uint256 totalAmount = 0;
        
        for (uint256 i = 0; i < allTransactions.length; i++) {
            totalAmount += onRampTransactions[allTransactions[i]].amount;
        }
        
        return totalAmount;
    }

    /**
     * @dev Returns total amount of verified on-ramp transactions for a tenant
     * @param tenant Address of the tenant
     * @return Total verified amount in USDT
     */
    function getTenantVerifiedAmount(address tenant) external view returns (uint256) {
        uint256[] memory allTransactions = tenantTransactions[tenant];
        uint256 verifiedAmount = 0;
        
        for (uint256 i = 0; i < allTransactions.length; i++) {
            if (onRampTransactions[allTransactions[i]].isVerified) {
                verifiedAmount += onRampTransactions[allTransactions[i]].amount;
            }
        }
        
        return verifiedAmount;
    }

    /**
     * @dev Returns total number of transactions
     * @return Total transactions count
     */
    function getTotalTransactions() external view returns (uint256) {
        return totalTransactions;
    }

    /**
     * @dev Returns total number of verified transactions
     * @return Total verified transactions count
     */
    function getTotalVerifiedTransactions() external view returns (uint256) {
        uint256 verifiedCount = 0;
        for (uint256 i = 1; i <= totalTransactions; i++) {
            if (onRampTransactions[i].isVerified) {
                verifiedCount++;
            }
        }
        return verifiedCount;
    }

    /**
     * @dev Checks if a transaction is verified
     * @param transactionId ID of the transaction
     * @return True if transaction is verified
     */
    function isTransactionVerified(uint256 transactionId) external view returns (bool) {
        return onRampTransactions[transactionId].isVerified;
    }

    /**
     * @dev Checks if an on-ramp transaction ID is already recorded
     * @param onRampTxId On-ramp provider transaction ID
     * @return True if already recorded
     */
    function isOnRampTxIdRecorded(string memory onRampTxId) external view returns (bool) {
        return providerTransactionMap[onRampTxId] != 0;
    }

    /**
     * @dev Checks if a contract is authorized
     * @param contractAddress Address of the contract
     * @return True if authorized
     */
    function isAuthorizedContract(address contractAddress) external view returns (bool) {
        return authorizedContracts[contractAddress];
    }

    /**
     * @dev Returns recent transactions for a tenant
     * @param tenant Address of the tenant
     * @param count Number of recent transactions to return
     * @return Array of recent transaction IDs
     */
    function getRecentTenantTransactions(address tenant, uint256 count) external view returns (uint256[] memory) {
        uint256[] memory allTransactions = tenantTransactions[tenant];
        uint256 transactionCount = allTransactions.length;
        
        if (transactionCount == 0) {
            return new uint256[](0);
        }
        
        uint256 startIndex = transactionCount > count ? transactionCount - count : 0;
        uint256 resultCount = transactionCount - startIndex;
        
        uint256[] memory recentTransactions = new uint256[](resultCount);
        
        for (uint256 i = 0; i < resultCount; i++) {
            recentTransactions[i] = allTransactions[startIndex + i];
        }
        
        return recentTransactions;
    }

    /**
     * @dev Pauses the on-ramp contract (only owner)
     */
    function pause() external onlyOwner {
        _pause();
    }

    /**
     * @dev Unpauses the on-ramp contract (only owner)
     */
    function unpause() external onlyOwner {
        _unpause();
    }
} 