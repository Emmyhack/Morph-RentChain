// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title Complaints
 * @dev Manages maintenance complaints linked to properties
 * @notice This contract allows tenants to log complaints and landlords to resolve them
 * @author RentChain Team
 */
contract Complaints is Ownable, Pausable, ReentrancyGuard {
    // Complaint status
    enum ComplaintStatus { Open, Resolved }
    
    // Complaint structure
    struct Complaint {
        uint256 complaintId;
        uint256 propertyId;
        address tenant;
        ComplaintStatus status;
        string ipfsHash;
        uint256 createdAt;
        uint256 resolvedAt;
        address resolvedBy;
    }
    
    // Complaints mapping: complaintId => Complaint
    mapping(uint256 => Complaint) public complaints;
    
    // Property complaints: propertyId => complaintId[]
    mapping(uint256 => uint256[]) public propertyComplaints;
    
    // Tenant complaints: tenant => complaintId[]
    mapping(address => uint256[]) public tenantComplaints;
    
    // Property landlords: propertyId => landlord address
    mapping(uint256 => address) public propertyLandlords;
    
    // Total complaints counter
    uint256 public totalComplaints;
    
    // Events
    event ComplaintLogged(uint256 indexed complaintId, uint256 indexed propertyId, address indexed tenant, string ipfsHash);
    event ComplaintResolved(uint256 indexed complaintId, address indexed landlord, uint256 resolvedAt);
    event PropertyLandlordSet(uint256 indexed propertyId, address indexed landlord);

    /**
     * @dev Constructor
     */
    constructor() Ownable(msg.sender) {}

    /**
     * @dev Tenant logs a maintenance complaint
     * @param propertyId ID of the property
     * @param ipfsHash IPFS hash containing complaint details
     */
    function logComplaint(uint256 propertyId, string memory ipfsHash) external whenNotPaused {
        require(propertyLandlords[propertyId] != address(0), "Property not found");
        require(propertyLandlords[propertyId] != msg.sender, "Landlord cannot log complaints");
        require(bytes(ipfsHash).length > 0, "IPFS hash cannot be empty");
        
        // Check if tenant has active escrow balance (basic verification)
        // This would typically be checked via the Escrow contract
        
        totalComplaints++;
        uint256 complaintId = totalComplaints;
        
        Complaint memory newComplaint = Complaint({
            complaintId: complaintId,
            propertyId: propertyId,
            tenant: msg.sender,
            status: ComplaintStatus.Open,
            ipfsHash: ipfsHash,
            createdAt: block.timestamp,
            resolvedAt: 0,
            resolvedBy: address(0)
        });
        
        complaints[complaintId] = newComplaint;
        propertyComplaints[propertyId].push(complaintId);
        tenantComplaints[msg.sender].push(complaintId);
        
        emit ComplaintLogged(complaintId, propertyId, msg.sender, ipfsHash);
    }

    /**
     * @dev Landlord resolves a complaint
     * @param complaintId ID of the complaint to resolve
     */
    function resolveComplaint(uint256 complaintId) external whenNotPaused {
        require(complaints[complaintId].complaintId != 0, "Complaint not found");
        require(propertyLandlords[complaints[complaintId].propertyId] == msg.sender, "Only landlord can resolve complaint");
        require(complaints[complaintId].status == ComplaintStatus.Open, "Complaint already resolved");
        
        Complaint storage complaint = complaints[complaintId];
        complaint.status = ComplaintStatus.Resolved;
        complaint.resolvedAt = block.timestamp;
        complaint.resolvedBy = msg.sender;
        
        emit ComplaintResolved(complaintId, msg.sender, block.timestamp);
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
     * @dev Returns complaint details
     * @param complaintId ID of the complaint
     * @return id Complaint ID
     * @return propertyId Property ID
     * @return tenant Tenant address
     * @return status Complaint status
     * @return ipfsHash IPFS hash
     * @return createdAt Creation timestamp
     * @return resolvedAt Resolution timestamp
     * @return resolvedBy Address who resolved
     */
    function getComplaint(uint256 complaintId) external view returns (
        uint256 id,
        uint256 propertyId,
        address tenant,
        ComplaintStatus status,
        string memory ipfsHash,
        uint256 createdAt,
        uint256 resolvedAt,
        address resolvedBy
    ) {
        Complaint memory complaint = complaints[complaintId];
        return (
            complaint.complaintId,
            complaint.propertyId,
            complaint.tenant,
            complaint.status,
            complaint.ipfsHash,
            complaint.createdAt,
            complaint.resolvedAt,
            complaint.resolvedBy
        );
    }

    /**
     * @dev Returns all complaints for a property
     * @param propertyId ID of the property
     * @return Array of complaint IDs
     */
    function getPropertyComplaints(uint256 propertyId) external view returns (uint256[] memory) {
        return propertyComplaints[propertyId];
    }

    /**
     * @dev Returns all complaints for a tenant
     * @param tenant Address of the tenant
     * @return Array of complaint IDs
     */
    function getTenantComplaints(address tenant) external view returns (uint256[] memory) {
        return tenantComplaints[tenant];
    }

    /**
     * @dev Returns open complaints for a property
     * @param propertyId ID of the property
     * @return Array of open complaint IDs
     */
    function getOpenPropertyComplaints(uint256 propertyId) external view returns (uint256[] memory) {
        uint256[] memory allComplaints = propertyComplaints[propertyId];
        uint256 openCount = 0;
        
        // Count open complaints
        for (uint256 i = 0; i < allComplaints.length; i++) {
            if (complaints[allComplaints[i]].status == ComplaintStatus.Open) {
                openCount++;
            }
        }
        
        // Create array with open complaints
        uint256[] memory openComplaints = new uint256[](openCount);
        uint256 index = 0;
        
        for (uint256 i = 0; i < allComplaints.length; i++) {
            if (complaints[allComplaints[i]].status == ComplaintStatus.Open) {
                openComplaints[index] = allComplaints[i];
                index++;
            }
        }
        
        return openComplaints;
    }

    /**
     * @dev Returns total number of complaints
     * @return Total complaints count
     */
    function getTotalComplaints() external view returns (uint256) {
        return totalComplaints;
    }

    /**
     * @dev Returns total number of open complaints
     * @return Total open complaints count
     */
    function getTotalOpenComplaints() external view returns (uint256) {
        uint256 openCount = 0;
        for (uint256 i = 1; i <= totalComplaints; i++) {
            if (complaints[i].status == ComplaintStatus.Open) {
                openCount++;
            }
        }
        return openCount;
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
     * @dev Checks if a complaint is open
     * @param complaintId ID of the complaint
     * @return True if complaint is open
     */
    function isComplaintOpen(uint256 complaintId) external view returns (bool) {
        return complaints[complaintId].status == ComplaintStatus.Open;
    }

    /**
     * @dev Pauses the complaints contract (only owner)
     */
    function pause() external onlyOwner {
        _pause();
    }

    /**
     * @dev Unpauses the complaints contract (only owner)
     */
    function unpause() external onlyOwner {
        _unpause();
    }
} 