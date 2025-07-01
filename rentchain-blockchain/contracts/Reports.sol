// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title Reports
 * @dev Manages tenant reports with dispute support via Kleros
 * @notice This contract allows landlords to submit reports and tenants to dispute them
 * @author RentChain Team
 */
contract Reports is Ownable, Pausable, ReentrancyGuard {
    // Report structure
    struct Report {
        uint256 reportId;
        address tenant;
        uint256 propertyId;
        uint8 rating;
        string ipfsHash;
        uint256 createdAt;
        bool isDisputed;
        string klerosDisputeId;
        uint256 disputedAt;
    }
    
    // Reports mapping: reportId => Report
    mapping(uint256 => Report) public reports;
    
    // Tenant reports: tenant => reportId[]
    mapping(address => uint256[]) public tenantReports;
    
    // Property reports: propertyId => reportId[]
    mapping(uint256 => uint256[]) public propertyReports;
    
    // Property landlords: propertyId => landlord address
    mapping(uint256 => address) public propertyLandlords;
    
    // Total reports counter
    uint256 public totalReports;
    
    // Events
    event ReportSubmitted(uint256 indexed reportId, address indexed tenant, uint256 indexed propertyId, uint8 rating, string ipfsHash);
    event ReportDisputed(uint256 indexed reportId, string klerosDisputeId, uint256 disputedAt);
    event PropertyLandlordSet(uint256 indexed propertyId, address indexed landlord);

    /**
     * @dev Constructor
     */
    constructor() Ownable(msg.sender) {}

    /**
     * @dev Landlord submits a tenant report
     * @param tenant Address of the tenant
     * @param propertyId ID of the property
     * @param rating Rating from 1-5
     * @param ipfsHash IPFS hash containing report details
     */
    function submitReport(
        address tenant,
        uint256 propertyId,
        uint8 rating,
        string memory ipfsHash
    ) external whenNotPaused {
        require(tenant != address(0), "Invalid tenant address");
        require(propertyLandlords[propertyId] == msg.sender, "Only landlord can submit report");
        require(rating >= 1 && rating <= 5, "Rating must be between 1 and 5");
        require(bytes(ipfsHash).length > 0, "IPFS hash cannot be empty");
        
        totalReports++;
        uint256 reportId = totalReports;
        
        Report memory newReport = Report({
            reportId: reportId,
            tenant: tenant,
            propertyId: propertyId,
            rating: rating,
            ipfsHash: ipfsHash,
            createdAt: block.timestamp,
            isDisputed: false,
            klerosDisputeId: "",
            disputedAt: 0
        });
        
        reports[reportId] = newReport;
        tenantReports[tenant].push(reportId);
        propertyReports[propertyId].push(reportId);
        
        emit ReportSubmitted(reportId, tenant, propertyId, rating, ipfsHash);
    }

    /**
     * @dev Tenant disputes a report via Kleros
     * @param reportId ID of the report to dispute
     * @param klerosDisputeId Kleros dispute ID
     */
    function disputeReport(uint256 reportId, string memory klerosDisputeId) external whenNotPaused {
        require(reports[reportId].reportId != 0, "Report not found");
        require(reports[reportId].tenant == msg.sender, "Only tenant can dispute report");
        require(!reports[reportId].isDisputed, "Report already disputed");
        require(bytes(klerosDisputeId).length > 0, "Kleros dispute ID cannot be empty");
        
        Report storage report = reports[reportId];
        report.isDisputed = true;
        report.klerosDisputeId = klerosDisputeId;
        report.disputedAt = block.timestamp;
        
        emit ReportDisputed(reportId, klerosDisputeId, block.timestamp);
    }

    /**
     * @dev Sets the landlord for a property (called by Listings contract)
     * @param propertyId ID of the property
     * @param landlord Address of the landlord
     */
    function setPropertyLandlord(uint256 propertyId, address landlord) external {
        require(msg.sender == owner(), "Only owner can set property landlord");
        require(landlord != address(0), "Invalid landlord address");
        
        propertyLandlords[propertyId] = landlord;
        emit PropertyLandlordSet(propertyId, landlord);
    }

    /**
     * @dev Returns report details
     * @param reportId ID of the report
     * @return id Report ID
     * @return tenant Tenant address
     * @return propertyId Property ID
     * @return rating Rating value
     * @return ipfsHash IPFS hash of report details
     * @return createdAt Creation timestamp
     * @return isDisputed Disputed status
     * @return klerosDisputeId Kleros dispute ID
     * @return disputedAt Dispute timestamp
     */
    function getReport(uint256 reportId) external view returns (
        uint256 id,
        address tenant,
        uint256 propertyId,
        uint8 rating,
        string memory ipfsHash,
        uint256 createdAt,
        bool isDisputed,
        string memory klerosDisputeId,
        uint256 disputedAt
    ) {
        Report memory report = reports[reportId];
        return (
            report.reportId,
            report.tenant,
            report.propertyId,
            report.rating,
            report.ipfsHash,
            report.createdAt,
            report.isDisputed,
            report.klerosDisputeId,
            report.disputedAt
        );
    }

    /**
     * @dev Returns all reports for a tenant
     * @param tenant Address of the tenant
     * @return Array of report IDs
     */
    function getTenantReports(address tenant) external view returns (uint256[] memory) {
        return tenantReports[tenant];
    }

    /**
     * @dev Returns all reports for a property
     * @param propertyId ID of the property
     * @return Array of report IDs
     */
    function getPropertyReports(uint256 propertyId) external view returns (uint256[] memory) {
        return propertyReports[propertyId];
    }

    /**
     * @dev Returns average rating for a tenant
     * @param tenant Address of the tenant
     * @return Average rating (0 if no reports)
     */
    function getTenantAverageRating(address tenant) external view returns (uint8) {
        uint256[] memory tenantReportIds = tenantReports[tenant];
        if (tenantReportIds.length == 0) {
            return 0;
        }
        
        uint256 totalRating = 0;
        uint256 validReports = 0;
        
        for (uint256 i = 0; i < tenantReportIds.length; i++) {
            Report memory report = reports[tenantReportIds[i]];
            if (!report.isDisputed) {
                totalRating += report.rating;
                validReports++;
            }
        }
        
        if (validReports == 0) {
            return 0;
        }
        
        return uint8(totalRating / validReports);
    }

    /**
     * @dev Returns total number of reports
     * @return Total reports count
     */
    function getTotalReports() external view returns (uint256) {
        return totalReports;
    }

    /**
     * @dev Returns total number of disputed reports
     * @return Total disputed reports count
     */
    function getTotalDisputedReports() external view returns (uint256) {
        uint256 disputedCount = 0;
        for (uint256 i = 1; i <= totalReports; i++) {
            if (reports[i].isDisputed) {
                disputedCount++;
            }
        }
        return disputedCount;
    }

    /**
     * @dev Returns the landlord for a property
     * @param propertyId ID of the property
     * @return Landlord address
     */
    function getPropertyLandlord(uint256 propertyId) external view returns (address) {
        return propertyLandlords[propertyId];
    }

    /**
     * @dev Checks if a report is disputed
     * @param reportId ID of the report
     * @return True if report is disputed
     */
    function isReportDisputed(uint256 reportId) external view returns (bool) {
        return reports[reportId].isDisputed;
    }

    /**
     * @dev Returns all non-disputed reports for a tenant
     * @param tenant Address of the tenant
     * @return Array of non-disputed report IDs
     */
    function getValidTenantReports(address tenant) external view returns (uint256[] memory) {
        uint256[] memory allReports = tenantReports[tenant];
        uint256 validCount = 0;
        
        // Count valid reports
        for (uint256 i = 0; i < allReports.length; i++) {
            if (!reports[allReports[i]].isDisputed) {
                validCount++;
            }
        }
        
        // Create array with valid reports
        uint256[] memory validReports = new uint256[](validCount);
        uint256 index = 0;
        
        for (uint256 i = 0; i < allReports.length; i++) {
            if (!reports[allReports[i]].isDisputed) {
                validReports[index] = allReports[i];
                index++;
            }
        }
        
        return validReports;
    }

    /**
     * @dev Pauses the reports contract (only owner)
     */
    function pause() external onlyOwner {
        _pause();
    }

    /**
     * @dev Unpauses the reports contract (only owner)
     */
    function unpause() external onlyOwner {
        _unpause();
    }
} 