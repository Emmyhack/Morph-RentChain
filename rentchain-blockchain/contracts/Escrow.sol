// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/**
 * @title Escrow
 * @dev Handles rent payments and escrow functionality for RentChain
 * @notice Supports both USDT and fiat on-ramp payments
 * @author RentChain Team
 */
contract Escrow is Ownable, Pausable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    // USDT token address (Morph mainnet)
    IERC20 public usdtToken;
    
    // Payment structure
    struct Payment {
        uint256 paymentId;
        address tenant;
        address landlord;
        uint256 propertyId;
        uint256 amount;
        uint256 dueDate;
        uint256 paidDate;
        PaymentStatus status;
        PaymentType paymentType;
        string transactionHash; // For fiat on-ramp transactions
    }
    
    // Payment status enum
    enum PaymentStatus {
        Pending,
        Paid,
        Late,
        Disputed,
        Refunded
    }
    
    // Payment type enum
    enum PaymentType {
        USDT,
        FiatOnRamp
    }
    
    // Payments mapping: paymentId => Payment
    mapping(uint256 => Payment) public payments;
    
    // Property payments: propertyId => paymentId[]
    mapping(uint256 => uint256[]) public propertyPayments;
    
    // User payments: user => paymentId[]
    mapping(address => uint256[]) public userPayments;
    
    // Payment counters
    uint256 public totalPayments;
    uint256 public totalUSDTVolume;
    uint256 public totalFiatVolume;
    
    // Platform fee (0.5% = 50 basis points)
    uint256 public platformFee = 50; // Basis points
    uint256 public constant BASIS_POINTS = 10000;
    
    // Events
    event PaymentCreated(uint256 indexed paymentId, address indexed tenant, address indexed landlord, uint256 propertyId, uint256 amount, uint256 dueDate);
    event PaymentPaid(uint256 indexed paymentId, address indexed tenant, uint256 amount, PaymentType paymentType);
    event PaymentDisputed(uint256 indexed paymentId, address indexed disputer, string reason);
    event PaymentRefunded(uint256 indexed paymentId, address indexed tenant, uint256 amount);
    event PlatformFeeUpdated(uint256 oldFee, uint256 newFee);
    event USDTAddressUpdated(address indexed oldAddress, address indexed newAddress);

    /**
     * @dev Constructor
     * @param _usdtToken USDT token address
     */
    constructor(address _usdtToken) Ownable(msg.sender) {
        require(_usdtToken != address(0), "Invalid USDT address");
        usdtToken = IERC20(_usdtToken);
    }

    /**
     * @dev Creates a new rent payment
     * @param landlord Address of the landlord
     * @param propertyId ID of the property
     * @param amount Payment amount in USDT (6 decimals)
     * @param dueDate Due date timestamp
     */
    function createPayment(
        address landlord,
        uint256 propertyId,
        uint256 amount,
        uint256 dueDate
    ) external whenNotPaused {
        require(landlord != address(0), "Invalid landlord address");
        require(amount > 0, "Amount must be greater than 0");
        require(dueDate > block.timestamp, "Due date must be in the future");
        
        totalPayments++;
        uint256 paymentId = totalPayments;
        
        Payment memory newPayment = Payment({
            paymentId: paymentId,
            tenant: msg.sender,
            landlord: landlord,
            propertyId: propertyId,
            amount: amount,
            dueDate: dueDate,
            paidDate: 0,
            status: PaymentStatus.Pending,
            paymentType: PaymentType.USDT,
            transactionHash: ""
        });
        
        payments[paymentId] = newPayment;
        propertyPayments[propertyId].push(paymentId);
        userPayments[msg.sender].push(paymentId);
        userPayments[landlord].push(paymentId);
        
        emit PaymentCreated(paymentId, msg.sender, landlord, propertyId, amount, dueDate);
    }

    /**
     * @dev Pays rent using USDT
     * @param paymentId ID of the payment to pay
     */
    function payWithUSDT(uint256 paymentId) external nonReentrant whenNotPaused {
        Payment storage payment = payments[paymentId];
        require(payment.paymentId != 0, "Payment not found");
        require(payment.tenant == msg.sender, "Only tenant can pay");
        require(payment.status == PaymentStatus.Pending, "Payment not pending");
        require(payment.paymentType == PaymentType.USDT, "Payment type mismatch");
        
        uint256 feeAmount = (payment.amount * platformFee) / BASIS_POINTS;
        uint256 landlordAmount = payment.amount - feeAmount;
        
        // Transfer USDT from tenant to contract
        usdtToken.safeTransferFrom(msg.sender, address(this), payment.amount);
        
        // Transfer to landlord
        usdtToken.safeTransfer(payment.landlord, landlordAmount);
        
        // Update payment status
        payment.status = PaymentStatus.Paid;
        payment.paidDate = block.timestamp;
        payment.paymentType = PaymentType.USDT;
        
        totalUSDTVolume += payment.amount;
        
        emit PaymentPaid(paymentId, msg.sender, payment.amount, PaymentType.USDT);
    }

    /**
     * @dev Records a fiat on-ramp payment
     * @param paymentId ID of the payment
     * @param transactionHash Transaction hash from the on-ramp provider
     */
    function recordFiatPayment(uint256 paymentId, string memory transactionHash) external whenNotPaused {
        Payment storage payment = payments[paymentId];
        require(payment.paymentId != 0, "Payment not found");
        require(payment.tenant == msg.sender, "Only tenant can record payment");
        require(payment.status == PaymentStatus.Pending, "Payment not pending");
        require(bytes(transactionHash).length > 0, "Transaction hash required");
        
        payment.status = PaymentStatus.Paid;
        payment.paidDate = block.timestamp;
        payment.paymentType = PaymentType.FiatOnRamp;
        payment.transactionHash = transactionHash;
        
        totalFiatVolume += payment.amount;
        
        emit PaymentPaid(paymentId, msg.sender, payment.amount, PaymentType.FiatOnRamp);
    }

    /**
     * @dev Disputes a payment
     * @param paymentId ID of the payment to dispute
     * @param reason Reason for the dispute
     */
    function disputePayment(uint256 paymentId, string memory reason) external whenNotPaused {
        Payment storage payment = payments[paymentId];
        require(payment.paymentId != 0, "Payment not found");
        require(
            msg.sender == payment.tenant || msg.sender == payment.landlord,
            "Only tenant or landlord can dispute"
        );
        require(payment.status == PaymentStatus.Paid, "Payment must be paid to dispute");
        require(bytes(reason).length > 0, "Dispute reason required");
        
        payment.status = PaymentStatus.Disputed;
        
        emit PaymentDisputed(paymentId, msg.sender, reason);
    }

    /**
     * @dev Refunds a payment (only owner for now, could be automated with Kleros)
     * @param paymentId ID of the payment to refund
     */
    function refundPayment(uint256 paymentId) external onlyOwner whenNotPaused {
        Payment storage payment = payments[paymentId];
        require(payment.paymentId != 0, "Payment not found");
        require(payment.status == PaymentStatus.Paid, "Payment must be paid to refund");
        
        payment.status = PaymentStatus.Refunded;
        
        if (payment.paymentType == PaymentType.USDT) {
            // Refund USDT to tenant
            usdtToken.safeTransfer(payment.tenant, payment.amount);
        }
        
        emit PaymentRefunded(paymentId, payment.tenant, payment.amount);
    }

    /**
     * @dev Returns payment details
     * @param paymentId ID of the payment
     * @return id Payment ID
     * @return tenant Tenant address
     * @return landlord Landlord address
     * @return propertyId Property ID
     * @return amount Payment amount
     * @return dueDate Due date timestamp
     * @return paidDate Paid date timestamp
     * @return status Payment status
     * @return paymentType Payment type
     * @return transactionHash Transaction hash
     */
    function getPayment(uint256 paymentId) external view returns (
        uint256 id,
        address tenant,
        address landlord,
        uint256 propertyId,
        uint256 amount,
        uint256 dueDate,
        uint256 paidDate,
        PaymentStatus status,
        PaymentType paymentType,
        string memory transactionHash
    ) {
        Payment memory payment = payments[paymentId];
        return (
            payment.paymentId,
            payment.tenant,
            payment.landlord,
            payment.propertyId,
            payment.amount,
            payment.dueDate,
            payment.paidDate,
            payment.status,
            payment.paymentType,
            payment.transactionHash
        );
    }

    /**
     * @dev Returns all payments for a property
     * @param propertyId ID of the property
     * @return Array of payment IDs
     */
    function getPropertyPayments(uint256 propertyId) external view returns (uint256[] memory) {
        return propertyPayments[propertyId];
    }

    /**
     * @dev Returns all payments for a user
     * @param user Address of the user
     * @return Array of payment IDs
     */
    function getUserPayments(address user) external view returns (uint256[] memory) {
        return userPayments[user];
    }

    /**
     * @dev Returns pending payments for a user
     * @param user Address of the user
     * @return Array of pending payment IDs
     */
    function getPendingPayments(address user) external view returns (uint256[] memory) {
        uint256[] memory allPayments = userPayments[user];
        uint256 pendingCount = 0;
        
        // Count pending payments
        for (uint256 i = 0; i < allPayments.length; i++) {
            if (payments[allPayments[i]].status == PaymentStatus.Pending) {
                pendingCount++;
            }
        }
        
        // Create array with pending payments
        uint256[] memory pendingPayments = new uint256[](pendingCount);
        uint256 index = 0;
        
        for (uint256 i = 0; i < allPayments.length; i++) {
            if (payments[allPayments[i]].status == PaymentStatus.Pending) {
                pendingPayments[index] = allPayments[i];
                index++;
            }
        }
        
        return pendingPayments;
    }

    /**
     * @dev Returns overdue payments for a user
     * @param user Address of the user
     * @return Array of overdue payment IDs
     */
    function getOverduePayments(address user) external view returns (uint256[] memory) {
        uint256[] memory allPayments = userPayments[user];
        uint256 overdueCount = 0;
        
        // Count overdue payments
        for (uint256 i = 0; i < allPayments.length; i++) {
            Payment memory payment = payments[allPayments[i]];
            if (payment.status == PaymentStatus.Pending && payment.dueDate < block.timestamp) {
                overdueCount++;
            }
        }
        
        // Create array with overdue payments
        uint256[] memory overduePayments = new uint256[](overdueCount);
        uint256 index = 0;
        
        for (uint256 i = 0; i < allPayments.length; i++) {
            Payment memory payment = payments[allPayments[i]];
            if (payment.status == PaymentStatus.Pending && payment.dueDate < block.timestamp) {
                overduePayments[index] = allPayments[i];
                index++;
            }
        }
        
        return overduePayments;
    }

    /**
     * @dev Updates platform fee (only owner)
     * @param newFee New fee in basis points
     */
    function updatePlatformFee(uint256 newFee) external onlyOwner {
        require(newFee <= 500, "Fee cannot exceed 5%");
        uint256 oldFee = platformFee;
        platformFee = newFee;
        emit PlatformFeeUpdated(oldFee, newFee);
    }

    /**
     * @dev Updates USDT token address (only owner)
     * @param newUSDTAddress New USDT token address
     */
    function updateUSDTAddress(address newUSDTAddress) external onlyOwner {
        require(newUSDTAddress != address(0), "Invalid USDT address");
        address oldAddress = address(usdtToken);
        usdtToken = IERC20(newUSDTAddress);
        emit USDTAddressUpdated(oldAddress, newUSDTAddress);
    }

    /**
     * @dev Returns platform statistics
     * @return totalPayments Total number of payments
     * @return totalUSDTVolume Total USDT volume
     * @return totalFiatVolume Total fiat volume
     * @return currentFee Current platform fee
     */
    function getPlatformStats() external view returns (
        uint256,
        uint256,
        uint256,
        uint256
    ) {
        return (totalPayments, totalUSDTVolume, totalFiatVolume, platformFee);
    }

    /**
     * @dev Calculates fee for a given amount
     * @param amount Amount to calculate fee for
     * @return feeAmount Fee amount
     */
    function calculateFee(uint256 amount) external view returns (uint256 feeAmount) {
        return (amount * platformFee) / BASIS_POINTS;
    }

    /**
     * @dev Pauses the escrow contract (only owner)
     */
    function pause() external onlyOwner {
        _pause();
    }

    /**
     * @dev Unpauses the escrow contract (only owner)
     */
    function unpause() external onlyOwner {
        _unpause();
    }
} 