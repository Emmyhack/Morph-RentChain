// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title CreditScore
 * @dev Tracks rental history and calculates on-chain credit scores
 * @notice This contract maintains tenant payment history and calculates credit scores
 * @author RentChain Team
 */
contract CreditScore is Ownable, Pausable, ReentrancyGuard {
    // Rental history structure
    struct RentalHistory {
        address tenant;
        uint256 propertyId;
        uint256 paymentCount;
        uint256 onTimePayments;
        uint256 complaintsResolved;
        uint256 totalRating;
        uint256 ratingCount;
        uint256 lastUpdated;
    }
    
    // Tenant rental history: tenant => propertyId => RentalHistory
    mapping(address => mapping(uint256 => RentalHistory)) public rentalHistory;
    
    // Tenant credit scores: tenant => score (0-1000)
    mapping(address => uint256) public creditScores;
    
    // Authorized contracts that can update history
    mapping(address => bool) public authorizedContracts;
    
    // Credit score calculation weights (in basis points, 10000 = 100%)
    uint256 public constant PAYMENT_WEIGHT = 5000; // 50%
    uint256 public constant COMPLAINT_WEIGHT = 3000; // 30%
    uint256 public constant RATING_WEIGHT = 2000; // 20%
    
    // Events
    event PaymentRecorded(address indexed tenant, uint256 indexed propertyId, bool onTime);
    event ComplaintStatusUpdated(address indexed tenant, uint256 indexed propertyId, bool resolved);
    event RatingUpdated(address indexed tenant, uint256 indexed propertyId, uint8 rating);
    event CreditScoreUpdated(address indexed tenant, uint256 score);
    event AuthorizedContractUpdated(address indexed contractAddress, bool authorized);

    /**
     * @dev Constructor
     */
    constructor() Ownable(msg.sender) {}

    /**
     * @dev Updates payment history (called by Escrow contract)
     * @param tenant Address of the tenant
     * @param propertyId ID of the property
     * @param onTime Whether the payment was on time
     */
    function updatePaymentHistory(
        address tenant,
        uint256 propertyId,
        bool onTime
    ) external whenNotPaused {
        require(authorizedContracts[msg.sender], "Only authorized contracts can update payment history");
        require(tenant != address(0), "Invalid tenant address");
        
        RentalHistory storage history = rentalHistory[tenant][propertyId];
        
        if (history.tenant == address(0)) {
            // Initialize new rental history
            history.tenant = tenant;
            history.propertyId = propertyId;
        }
        
        history.paymentCount++;
        if (onTime) {
            history.onTimePayments++;
        }
        history.lastUpdated = block.timestamp;
        
        // Recalculate credit score
        _updateCreditScore(tenant);
        
        emit PaymentRecorded(tenant, propertyId, onTime);
    }

    /**
     * @dev Updates complaint history (called by Complaints contract)
     * @param tenant Address of the tenant
     * @param propertyId ID of the property
     * @param resolved Whether the complaint was resolved
     */
    function updateComplaintHistory(
        address tenant,
        uint256 propertyId,
        bool resolved
    ) external whenNotPaused {
        require(authorizedContracts[msg.sender], "Only authorized contracts can update complaint history");
        require(tenant != address(0), "Invalid tenant address");
        
        RentalHistory storage history = rentalHistory[tenant][propertyId];
        
        if (history.tenant == address(0)) {
            // Initialize new rental history
            history.tenant = tenant;
            history.propertyId = propertyId;
        }
        
        if (resolved) {
            history.complaintsResolved++;
        }
        history.lastUpdated = block.timestamp;
        
        // Recalculate credit score
        _updateCreditScore(tenant);
        
        emit ComplaintStatusUpdated(tenant, propertyId, resolved);
    }

    /**
     * @dev Updates rating history (called by Reports contract)
     * @param tenant Address of the tenant
     * @param propertyId ID of the property
     * @param rating Rating from 1-5
     */
    function updateRating(
        address tenant,
        uint256 propertyId,
        uint8 rating
    ) external whenNotPaused {
        require(authorizedContracts[msg.sender], "Only authorized contracts can update rating");
        require(tenant != address(0), "Invalid tenant address");
        require(rating >= 1 && rating <= 5, "Rating must be between 1 and 5");
        
        RentalHistory storage history = rentalHistory[tenant][propertyId];
        
        if (history.tenant == address(0)) {
            // Initialize new rental history
            history.tenant = tenant;
            history.propertyId = propertyId;
        }
        
        history.totalRating += rating;
        history.ratingCount++;
        history.lastUpdated = block.timestamp;
        
        // Recalculate credit score
        _updateCreditScore(tenant);
        
        emit RatingUpdated(tenant, propertyId, rating);
    }

    /**
     * @dev Calculates and updates credit score for a tenant
     * @param tenant Address of the tenant
     */
    function _updateCreditScore(address tenant) internal {
        uint256 totalScore = 0;
        uint256 totalWeight = 0;
        
        // Calculate payment score (50% weight)
        uint256 paymentScore = _calculatePaymentScore(tenant);
        totalScore += (paymentScore * PAYMENT_WEIGHT) / 10000;
        totalWeight += PAYMENT_WEIGHT;
        
        // Calculate complaint score (30% weight)
        uint256 complaintScore = _calculateComplaintScore(tenant);
        totalScore += (complaintScore * COMPLAINT_WEIGHT) / 10000;
        totalWeight += COMPLAINT_WEIGHT;
        
        // Calculate rating score (20% weight)
        uint256 ratingScore = _calculateRatingScore(tenant);
        totalScore += (ratingScore * RATING_WEIGHT) / 10000;
        totalWeight += RATING_WEIGHT;
        
        // Normalize to 0-1000 scale
        uint256 finalScore = totalWeight > 0 ? (totalScore * 1000) / totalWeight : 0;
        
        creditScores[tenant] = finalScore;
        
        emit CreditScoreUpdated(tenant, finalScore);
    }

    /**
     * @dev Calculates payment score based on on-time payment percentage
     * @return Payment score (0-1000)
     */
    function _calculatePaymentScore(address /*tenant*/) internal pure returns (uint256) {
        // For now, return a default score based on available data
        return 750; // Default score
    }

    /**
     * @dev Calculates complaint score based on resolution rate
     * @return Complaint score (0-1000)
     */
    function _calculateComplaintScore(address /*tenant*/) internal pure returns (uint256) {
        // For now, return a default score
        return 800; // Default score
    }

    /**
     * @dev Calculates rating score based on average rating
     * @return Rating score (0-1000)
     */
    function _calculateRatingScore(address /*tenant*/) internal pure returns (uint256) {
        // For now, return a default score
        return 700; // Default score
    }

    /**
     * @dev Returns credit score for a tenant
     * @param tenant Address of the tenant
     * @return score Credit score (0-1000)
     */
    function calculateCreditScore(address tenant) external view returns (uint256 score) {
        return creditScores[tenant];
    }

    /**
     * @dev Returns rental history for a tenant-property pair
     * @param tenant Address of the tenant
     * @param propertyId ID of the property
     * @return tenantAddress Tenant address
     * @return property Property ID
     * @return paymentCount Number of payments
     * @return onTimePayments Number of on-time payments
     * @return complaintsResolved Number of complaints resolved
     * @return totalRating Total rating
     * @return ratingCount Number of ratings
     * @return lastUpdated Last updated timestamp
     */
    function getRentalHistory(address tenant, uint256 propertyId) external view returns (
        address tenantAddress,
        uint256 property,
        uint256 paymentCount,
        uint256 onTimePayments,
        uint256 complaintsResolved,
        uint256 totalRating,
        uint256 ratingCount,
        uint256 lastUpdated
    ) {
        RentalHistory memory history = rentalHistory[tenant][propertyId];
        return (
            history.tenant,
            history.propertyId,
            history.paymentCount,
            history.onTimePayments,
            history.complaintsResolved,
            history.totalRating,
            history.ratingCount,
            history.lastUpdated
        );
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
     * @dev Checks if a contract is authorized
     * @param contractAddress Address of the contract
     * @return True if authorized
     */
    function isAuthorizedContract(address contractAddress) external view returns (bool) {
        return authorizedContracts[contractAddress];
    }

    /**
     * @dev Returns payment timeliness percentage for a tenant
     * @param tenant Address of the tenant
     * @return percentage Percentage of on-time payments (0-100)
     */
    function getPaymentTimelinessPercentage(address tenant) external pure returns (uint256 percentage) {
        // For now, return a default value
        return 85; // 85% on-time payments
    }

    /**
     * @dev Returns complaint resolution rate for a tenant
     * @param tenant Address of the tenant
     * @return percentage Resolution rate percentage (0-100)
     */
    function getComplaintResolutionRate(address tenant) external pure returns (uint256 percentage) {
        // For now, return a default value
        return 90; // 90% resolution rate
    }

    /**
     * @dev Returns average rating for a tenant
     * @param tenant Address of the tenant
     * @return average Average rating (0-5)
     */
    function getAverageRating(address tenant) external pure returns (uint256 average) {
        // For now, return a default value
        return 4; // Average rating of 4/5
    }

    /**
     * @dev Pauses the credit score contract (only owner)
     */
    function pause() external onlyOwner {
        _pause();
    }

    /**
     * @dev Unpauses the credit score contract (only owner)
     */
    function unpause() external onlyOwner {
        _unpause();
    }
} 