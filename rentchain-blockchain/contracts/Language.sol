// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title Language
 * @dev Manages user language preferences and translation file hashes for multilingual support
 * @notice This contract supports decentralized multilingual interfaces by storing language codes and IPFS hashes
 * @author RentChain Team
 */
contract Language is Ownable, Pausable, ReentrancyGuard {
    // User language preference structure
    struct UserLanguage {
        address user;
        string languageCode;
        uint256 updatedAt;
    }
    
    // Translation file structure
    struct TranslationFile {
        string languageCode;
        string ipfsHash;
        uint256 version;
        uint256 updatedAt;
        address updatedBy;
    }
    
    // User language preferences: user => UserLanguage
    mapping(address => UserLanguage) public userLanguages;
    
    // Translation files: languageCode => TranslationFile
    mapping(string => TranslationFile) public translationFiles;
    
    // Supported language codes
    string[] public supportedLanguages;
    
    // Language code validation: languageCode => bool
    mapping(string => bool) public isLanguageSupported;
    
    // Events
    event LanguagePreferenceUpdated(address indexed user, string languageCode, uint256 updatedAt);
    event TranslationFileUpdated(string indexed languageCode, string ipfsHash, uint256 version, address updatedBy);
    event LanguageSupported(string indexed languageCode, bool supported);

    /**
     * @dev Constructor initializes supported languages
     */
    constructor() Ownable(msg.sender) {
        // Initialize with common languages
        _addSupportedLanguage("en"); // English
        _addSupportedLanguage("es"); // Spanish
        _addSupportedLanguage("fr"); // French
        _addSupportedLanguage("de"); // German
        _addSupportedLanguage("it"); // Italian
        _addSupportedLanguage("pt"); // Portuguese
        _addSupportedLanguage("ru"); // Russian
        _addSupportedLanguage("zh"); // Chinese
        _addSupportedLanguage("ja"); // Japanese
        _addSupportedLanguage("ko"); // Korean
        _addSupportedLanguage("ar"); // Arabic
        _addSupportedLanguage("hi"); // Hindi
    }

    /**
     * @dev Sets user's language preference
     * @param languageCode Language code (e.g., "en", "es", "fr")
     */
    function setLanguagePreference(string memory languageCode) external whenNotPaused {
        require(bytes(languageCode).length > 0, "Language code cannot be empty");
        require(bytes(languageCode).length <= 5, "Language code too long");
        require(isLanguageSupported[languageCode], "Language not supported");
        
        UserLanguage storage userLang = userLanguages[msg.sender];
        userLang.user = msg.sender;
        userLang.languageCode = languageCode;
        userLang.updatedAt = block.timestamp;
        
        emit LanguagePreferenceUpdated(msg.sender, languageCode, block.timestamp);
    }

    /**
     * @dev Updates translation file hash (DAO-only)
     * @param languageCode Language code
     * @param ipfsHash IPFS hash of the translation file
     */
    function setTranslationFile(string memory languageCode, string memory ipfsHash) external onlyOwner {
        require(bytes(languageCode).length > 0, "Language code cannot be empty");
        require(bytes(languageCode).length <= 5, "Language code too long");
        require(bytes(ipfsHash).length > 0, "IPFS hash cannot be empty");
        require(isLanguageSupported[languageCode], "Language not supported");
        
        TranslationFile storage translation = translationFiles[languageCode];
        translation.languageCode = languageCode;
        translation.ipfsHash = ipfsHash;
        translation.version++;
        translation.updatedAt = block.timestamp;
        translation.updatedBy = msg.sender;
        
        emit TranslationFileUpdated(languageCode, ipfsHash, translation.version, msg.sender);
    }

    /**
     * @dev Adds a supported language (DAO-only)
     * @param languageCode Language code to add
     */
    function addSupportedLanguage(string memory languageCode) external onlyOwner {
        require(bytes(languageCode).length > 0, "Language code cannot be empty");
        require(bytes(languageCode).length <= 5, "Language code too long");
        require(!isLanguageSupported[languageCode], "Language already supported");
        
        _addSupportedLanguage(languageCode);
    }

    /**
     * @dev Removes a supported language (DAO-only)
     * @param languageCode Language code to remove
     */
    function removeSupportedLanguage(string memory languageCode) external onlyOwner {
        require(isLanguageSupported[languageCode], "Language not supported");
        require(keccak256(bytes(languageCode)) != keccak256(bytes("en")), "Cannot remove English");
        
        isLanguageSupported[languageCode] = false;
        
        // Remove from supported languages array
        for (uint256 i = 0; i < supportedLanguages.length; i++) {
            if (keccak256(bytes(supportedLanguages[i])) == keccak256(bytes(languageCode))) {
                supportedLanguages[i] = supportedLanguages[supportedLanguages.length - 1];
                supportedLanguages.pop();
                break;
            }
        }
        
        emit LanguageSupported(languageCode, false);
    }

    /**
     * @dev Internal function to add supported language
     * @param languageCode Language code to add
     */
    function _addSupportedLanguage(string memory languageCode) internal {
        isLanguageSupported[languageCode] = true;
        supportedLanguages.push(languageCode);
        emit LanguageSupported(languageCode, true);
    }

    /**
     * @dev Returns user's language preference
     * @param user Address of the user
     * @return Language code
     */
    function getLanguagePreference(address user) external view returns (string memory) {
        return userLanguages[user].languageCode;
    }

    /**
     * @dev Returns translation file hash for a language
     * @param languageCode Language code
     * @return IPFS hash of the translation file
     */
    function getTranslationFile(string memory languageCode) external view returns (string memory) {
        return translationFiles[languageCode].ipfsHash;
    }

    /**
     * @dev Returns translation file details
     * @param languageCode Language code
     * @return code Language code
     * @return ipfsHash IPFS hash of the translation file
     * @return version Version number
     * @return updatedAt Last update timestamp
     * @return updatedBy Address that last updated the file
     */
    function getTranslationFileDetails(string memory languageCode) external view returns (
        string memory code,
        string memory ipfsHash,
        uint256 version,
        uint256 updatedAt,
        address updatedBy
    ) {
        TranslationFile memory translation = translationFiles[languageCode];
        return (
            translation.languageCode,
            translation.ipfsHash,
            translation.version,
            translation.updatedAt,
            translation.updatedBy
        );
    }

    /**
     * @dev Returns all supported languages
     * @return Array of supported language codes
     */
    function getSupportedLanguages() external view returns (string[] memory) {
        return supportedLanguages;
    }

    /**
     * @dev Returns user language details
     * @param user Address of the user
     * @return userAddress User address
     * @return languageCode Language code
     * @return updatedAt Last update timestamp
     */
    function getUserLanguageDetails(address user) external view returns (
        address userAddress,
        string memory languageCode,
        uint256 updatedAt
    ) {
        UserLanguage memory userLang = userLanguages[user];
        return (
            userLang.user,
            userLang.languageCode,
            userLang.updatedAt
        );
    }

    /**
     * @dev Checks if a language is supported
     * @param languageCode Language code to check
     * @return True if language is supported
     */
    function isLanguageCodeSupported(string memory languageCode) external view returns (bool) {
        return isLanguageSupported[languageCode];
    }

    /**
     * @dev Returns total number of supported languages
     * @return Total supported languages count
     */
    function getTotalSupportedLanguages() external view returns (uint256) {
        return supportedLanguages.length;
    }

    /**
     * @dev Returns translation file version for a language
     * @param languageCode Language code
     * @return Version number
     */
    function getTranslationFileVersion(string memory languageCode) external view returns (uint256) {
        return translationFiles[languageCode].version;
    }

    /**
     * @dev Returns users with a specific language preference
     * @param limit Maximum number of users to return
     * @return Array of user addresses
     */
    function getUsersByLanguage(string memory /* languageCode */, uint256 /* offset */, uint256 limit) external pure returns (address[] memory) {
        // Note: This is a simplified implementation
        // In a real scenario, you might want to maintain a separate mapping for efficient queries
        address[] memory users = new address[](limit);
        
        // This would need to iterate through all users, which is not gas efficient
        // For demonstration purposes, we'll return an empty array
        // In production, consider using events or a separate indexing solution
        
        return users;
    }

    /**
     * @dev Returns language statistics
     * @return totalSupported Total supported languages
     * @return totalTranslationFiles Total translation files
     */
    function getLanguageStats() external view returns (uint256 totalSupported, uint256 totalTranslationFiles) {
        totalSupported = supportedLanguages.length;
        
        uint256 filesCount = 0;
        for (uint256 i = 0; i < supportedLanguages.length; i++) {
            if (bytes(translationFiles[supportedLanguages[i]].ipfsHash).length > 0) {
                filesCount++;
            }
        }
        totalTranslationFiles = filesCount;
    }

    /**
     * @dev Validates language code format
     * @param languageCode Language code to validate
     * @return True if valid format
     */
    function isValidLanguageCode(string memory languageCode) external pure returns (bool) {
        bytes memory code = bytes(languageCode);
        if (code.length == 0 || code.length > 5) {
            return false;
        }
        
        // Check if contains only lowercase letters and hyphens
        for (uint256 i = 0; i < code.length; i++) {
            if (!((code[i] >= 0x61 && code[i] <= 0x7a) || code[i] == 0x2d)) { // a-z or hyphen
                return false;
            }
        }
        
        return true;
    }

    /**
     * @dev Pauses the language contract (only owner)
     */
    function pause() external onlyOwner {
        _pause();
    }

    /**
     * @dev Unpauses the language contract (only owner)
     */
    function unpause() external onlyOwner {
        _unpause();
    }
} 