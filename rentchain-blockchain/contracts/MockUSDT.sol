// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title MockUSDT
 * @dev Mock USDT token for testing RentChain platform
 * @notice This is a test-only contract that simulates USDT functionality
 * @author RentChain Team
 */
contract MockUSDT is ERC20, Ownable {
    // USDT has 6 decimals (not 18 like most ERC20 tokens)
    uint8 private constant DECIMALS = 6;
    
    // Maximum supply (1 billion USDT)
    uint256 public constant MAX_SUPPLY = 1_000_000_000 * 10**6;
    
    // Events
    event Minted(address indexed to, uint256 amount);
    event Burned(address indexed from, uint256 amount);

    /**
     * @dev Constructor
     * @param initialSupply Initial supply of tokens
     */
    constructor(uint256 initialSupply) ERC20("Mock USDT", "mUSDT") Ownable(msg.sender) {
        require(initialSupply <= MAX_SUPPLY, "Initial supply exceeds max supply");
        _mint(msg.sender, initialSupply);
    }

    /**
     * @dev Returns the number of decimals used to get its user representation
     * @return Number of decimals
     */
    function decimals() public view virtual override returns (uint8) {
        return DECIMALS;
    }

    /**
     * @dev Mints new tokens (only owner for testing)
     * @param to Address to mint tokens to
     * @param amount Amount to mint
     */
    function mint(address to, uint256 amount) external onlyOwner {
        require(to != address(0), "Cannot mint to zero address");
        require(amount > 0, "Amount must be greater than 0");
        require(totalSupply() + amount <= MAX_SUPPLY, "Would exceed max supply");
        
        _mint(to, amount);
        emit Minted(to, amount);
    }

    /**
     * @dev Burns tokens from caller
     * @param amount Amount to burn
     */
    function burn(uint256 amount) external {
        require(amount > 0, "Amount must be greater than 0");
        require(balanceOf(msg.sender) >= amount, "Insufficient balance");
        
        _burn(msg.sender, amount);
        emit Burned(msg.sender, amount);
    }

    /**
     * @dev Burns tokens from a specific address (only owner)
     * @param from Address to burn tokens from
     * @param amount Amount to burn
     */
    function burnFrom(address from, uint256 amount) external onlyOwner {
        require(from != address(0), "Cannot burn from zero address");
        require(amount > 0, "Amount must be greater than 0");
        require(balanceOf(from) >= amount, "Insufficient balance");
        
        _burn(from, amount);
        emit Burned(from, amount);
    }

    /**
     * @dev Returns the maximum supply
     * @return Maximum supply
     */
    function maxSupply() external pure returns (uint256) {
        return MAX_SUPPLY;
    }

    /**
     * @dev Returns remaining mintable supply
     * @return Remaining mintable supply
     */
    function remainingMintableSupply() external view returns (uint256) {
        return MAX_SUPPLY - totalSupply();
    }

    /**
     * @dev Converts amount from USDT decimals to wei (18 decimals)
     * @param usdtAmount Amount in USDT decimals
     * @return Amount in wei
     */
    function toWei(uint256 usdtAmount) external pure returns (uint256) {
        return usdtAmount * 10**12; // 18 - 6 = 12
    }

    /**
     * @dev Converts amount from wei (18 decimals) to USDT decimals
     * @param weiAmount Amount in wei
     * @return Amount in USDT decimals
     */
    function fromWei(uint256 weiAmount) external pure returns (uint256) {
        return weiAmount / 10**12; // 18 - 6 = 12
    }
} 