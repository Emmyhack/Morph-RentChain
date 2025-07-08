// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title Listings
 * @dev Manages property listings for houses and offices
 * @notice handles property creation, editing, and availability toggling
 * @author RentChain Team
 */
contract Listings is Ownable, Pausable, ReentrancyGuard {
    // Property types
    enum PropertyType { House, Office }
    
    // Property structure
    struct Property {
        uint256 propertyId;
        address landlord;
        string title;
        PropertyType propertyType;
        uint256 rentAmount;
        bool isAvailable;
        string ipfsHash;
        string leaseAgreementIpfsHash;
        uint256 createdAt;
        uint256 updatedAt;
    }
    
    // Properties mapping: propertyId => Property
    mapping(uint256 => Property) public properties;
    
    // Landlord properties: landlord => propertyId[]
    mapping(address => uint256[]) public landlordProperties;
    
    // Available properties: propertyId => bool
    mapping(uint256 => bool) public availableProperties;
    
    // Total properties counter
    uint256 public totalProperties;
    
    // Landlord verification: landlord => kycHash
    mapping(address => string) public landlordKYC;
    
    // Events
    event PropertyListed(uint256 indexed propertyId, address indexed landlord, string title, PropertyType propertyType, uint256 rentAmount);
    event PropertyUpdated(uint256 indexed propertyId, string title, PropertyType propertyType, uint256 rentAmount);
    event AvailabilityToggled(uint256 indexed propertyId, bool isAvailable);
    event LandlordVerified(address indexed landlord, string kycHash);
    event LandlordKYCUpdated(address indexed landlord, string kycHash);

    /**
     * @dev Constructor
     */
    constructor() Ownable(msg.sender) {}

    /**
     * @dev Adds a new property listing
     * @param title Property title
     * @param propertyType Type of property (0 = House, 1 = Office)
     * @param rentAmount Monthly rent amount in USDT
     * @param ipfsHash IPFS hash containing property details
     * @param leaseAgreementIpfsHash IPFS hash containing lease agreement details
     */
    function addProperty(
        string memory title,
        uint8 propertyType,
        uint256 rentAmount,
        string memory ipfsHash,
        string memory leaseAgreementIpfsHash
    ) external whenNotPaused {
        require(bytes(title).length > 0, "Title cannot be empty");
        require(propertyType <= 1, "Invalid property type");
        require(rentAmount > 0, "Rent amount must be greater than 0");
        require(bytes(ipfsHash).length > 0, "IPFS hash cannot be empty");
        require(bytes(leaseAgreementIpfsHash).length > 0, "Lease agreement IPFS hash cannot be empty");
        require(bytes(landlordKYC[msg.sender]).length > 0, "Landlord must be verified");
        
        totalProperties++;
        uint256 propertyId = totalProperties;
        
        Property memory newProperty = Property({
            propertyId: propertyId,
            landlord: msg.sender,
            title: title,
            propertyType: PropertyType(propertyType),
            rentAmount: rentAmount,
            isAvailable: true,
            ipfsHash: ipfsHash,
            leaseAgreementIpfsHash: leaseAgreementIpfsHash,
            createdAt: block.timestamp,
            updatedAt: block.timestamp
        });
        
        properties[propertyId] = newProperty;
        landlordProperties[msg.sender].push(propertyId);
        availableProperties[propertyId] = true;
        
        emit PropertyListed(propertyId, msg.sender, title, PropertyType(propertyType), rentAmount);
    }

    /**
     * @dev Updates an existing property listing
     * @param propertyId ID of the property to update
     * @param title New property title
     * @param propertyType New property type (0 = House, 1 = Office)
     * @param rentAmount New monthly rent amount in USDT
     * @param ipfsHash New IPFS hash containing property details
     * @param leaseAgreementIpfsHash New IPFS hash containing lease agreement details
     */
    function editProperty(
        uint256 propertyId,
        string memory title,
        uint8 propertyType,
        uint256 rentAmount,
        string memory ipfsHash,
        string memory leaseAgreementIpfsHash
    ) public whenNotPaused {
        require(properties[propertyId].landlord == msg.sender, "Only landlord can edit property");
        require(bytes(title).length > 0, "Title cannot be empty");
        require(propertyType <= 1, "Invalid property type");
        require(rentAmount > 0, "Rent amount must be greater than 0");
        require(bytes(ipfsHash).length > 0, "IPFS hash cannot be empty");
        require(bytes(leaseAgreementIpfsHash).length > 0, "Lease agreement IPFS hash cannot be empty");
        Property storage property = properties[propertyId];
        property.title = title;
        property.propertyType = PropertyType(propertyType);
        property.rentAmount = rentAmount;
        property.ipfsHash = ipfsHash;
        property.leaseAgreementIpfsHash = leaseAgreementIpfsHash;
        property.updatedAt = block.timestamp;
        emit PropertyUpdated(propertyId, title, PropertyType(propertyType), rentAmount);
    }

    /**
     * @dev Toggles property availability
     * @param propertyId ID of the property
     * @param isAvailable New availability status
     */
    function toggleAvailability(uint256 propertyId, bool isAvailable) external whenNotPaused {
        require(properties[propertyId].landlord == msg.sender, "Only landlord can toggle availability");
        
        Property storage property = properties[propertyId];
        property.isAvailable = isAvailable;
        availableProperties[propertyId] = isAvailable;
        property.updatedAt = block.timestamp;
        
        emit AvailabilityToggled(propertyId, isAvailable);
    }

    /**
     * @dev Verifies a landlord with KYC hash
     * @param landlord Address of the landlord
     * @param kycHash KYC verification hash
     */
    function verifyLandlord(address landlord, string memory kycHash) external onlyOwner {
        require(landlord != address(0), "Invalid landlord address");
        require(bytes(kycHash).length > 0, "KYC hash cannot be empty");
        
        landlordKYC[landlord] = kycHash;
        emit LandlordVerified(landlord, kycHash);
    }

    /**
     * @dev Updates landlord KYC hash
     * @param landlord Address of the landlord
     * @param kycHash New KYC verification hash
     */
    function updateLandlordKYC(address landlord, string memory kycHash) external onlyOwner {
        require(landlord != address(0), "Invalid landlord address");
        require(bytes(kycHash).length > 0, "KYC hash cannot be empty");
        
        landlordKYC[landlord] = kycHash;
        emit LandlordKYCUpdated(landlord, kycHash);
    }

    /**
     * @dev Returns property details
     * @param propertyId ID of the property
     * @return id Property ID
     * @return landlord Landlord address
     * @return title Property title
     * @return propertyType Property type
     * @return rentAmount Monthly rent amount
     * @return isAvailable Availability status
     * @return ipfsHash IPFS hash of property details
     * @return leaseAgreementIpfsHash IPFS hash of lease agreement details
     * @return createdAt Creation timestamp
     * @return updatedAt Last update timestamp
     */
    function getProperty(uint256 propertyId) external view returns (
        uint256 id,
        address landlord,
        string memory title,
        PropertyType propertyType,
        uint256 rentAmount,
        bool isAvailable,
        string memory ipfsHash,
        string memory leaseAgreementIpfsHash,
        uint256 createdAt,
        uint256 updatedAt
    ) {
        Property memory property = properties[propertyId];
        return (
            property.propertyId,
            property.landlord,
            property.title,
            property.propertyType,
            property.rentAmount,
            property.isAvailable,
            property.ipfsHash,
            property.leaseAgreementIpfsHash,
            property.createdAt,
            property.updatedAt
        );
    }

    /**
     * @dev Returns all properties for a landlord
     * @param landlord Address of the landlord
     * @return Array of property IDs
     */
    function getLandlordProperties(address landlord) external view returns (uint256[] memory) {
        return landlordProperties[landlord];
    }

    /**
     * @dev Returns all available properties
     * @param offset Starting index
     * @param limit Maximum number of properties to return
     * @return Array of available property IDs
     */
    function getAvailableProperties(uint256 offset, uint256 limit) external view returns (uint256[] memory) {
        uint256[] memory available = new uint256[](limit);
        uint256 count = 0;
        
        for (uint256 i = offset + 1; i <= totalProperties && count < limit; i++) {
            if (availableProperties[i]) {
                available[count] = i;
                count++;
            }
        }
        
        // Resize array to actual count
        uint256[] memory result = new uint256[](count);
        for (uint256 i = 0; i < count; i++) {
            result[i] = available[i];
        }
        
        return result;
    }

    /**
     * @dev Returns total number of properties
     * @return Total properties count
     */
    function getTotalProperties() external view returns (uint256) {
        return totalProperties;
    }

    /**
     * @dev Returns landlord KYC hash
     * @param landlord Address of the landlord
     * @return KYC hash
     */
    function getLandlordKYC(address landlord) external view returns (string memory) {
        return landlordKYC[landlord];
    }

    /**
     * @dev Checks if landlord is verified
     * @param landlord Address of the landlord
     * @return True if verified
     */
    function isLandlordVerified(address landlord) external view returns (bool) {
        return bytes(landlordKYC[landlord]).length > 0;
    }

    /**
     * @dev Pauses the listings contract (only owner)
     */
    function pause() external onlyOwner {
        _pause();
    }

    /**
     * @dev Unpauses the listings contract (only owner)
     */
    function unpause() external onlyOwner {
        _unpause();
    }

    /**
     * @dev Alias for editProperty to match test expectations
     */
    function updateProperty(
        uint256 propertyId,
        string memory title,
        uint8 propertyType,
        uint256 rentAmount,
        string memory ipfsHash,
        string memory leaseAgreementIpfsHash
    ) external whenNotPaused {
        editProperty(propertyId, title, propertyType, rentAmount, ipfsHash, leaseAgreementIpfsHash);
    }

    /**
     * @dev Removes a property listing (only landlord)
     * @param propertyId ID of the property to remove
     */
    function removeProperty(uint256 propertyId) external whenNotPaused {
        require(properties[propertyId].landlord == msg.sender, "Only landlord can remove property");
        delete properties[propertyId];
        // Remove from landlordProperties
        uint256[] storage props = landlordProperties[msg.sender];
        for (uint256 i = 0; i < props.length; i++) {
            if (props[i] == propertyId) {
                props[i] = props[props.length - 1];
                props.pop();
                break;
            }
        }
        availableProperties[propertyId] = false;
        emit PropertyUpdated(propertyId, "", PropertyType.House, 0); // Optionally emit a removal event
    }

    /**
     * @dev Returns all property IDs
     * @return Array of all property IDs
     */
    function getAllProperties() external view returns (uint256[] memory) {
        uint256[] memory all = new uint256[](totalProperties);
        uint256 count = 0;
        for (uint256 i = 1; i <= totalProperties; i++) {
            if (properties[i].landlord != address(0)) {
                all[count] = i;
                count++;
            }
        }
        // Resize array to actual count
        uint256[] memory result = new uint256[](count);
        for (uint256 j = 0; j < count; j++) {
            result[j] = all[j];
        }
        return result;
    }
} 