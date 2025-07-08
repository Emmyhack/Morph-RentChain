// Contract addresses configuration
// Update these addresses with your actual deployed contract addresses

export const CONTRACT_ADDRESSES = {
  // Main RentChain contract (coordinates all other contracts)
  RENTCHAIN: '0x...', // Replace with actual deployed address
  
  // Individual contract addresses
  LISTINGS: '0x...',    // Property listings contract
  ESCROW: '0x...',      // Payment and escrow contract
  CHAT: '0x...',        // Messaging contract
  COMPLAINTS: '0x...',  // Dispute resolution contract
  REPORTS: '0x...',     // Reporting contract
  CREDIT_SCORE: '0x...', // Credit scoring contract
  REMINDERS: '0x...',   // Payment reminders contract
  ON_RAMP: '0x...',     // Fiat on-ramp contract
  LANGUAGE: '0x...',    // Multi-language support contract
  
  // Token addresses
  USDT: '0x...',        // USDT token address on your network
};

// Network configuration
export const NETWORKS = {
  // Morph mainnet
  MORPH_MAINNET: {
    chainId: '0x1',
    chainName: 'Morph',
    nativeCurrency: {
      name: 'ETH',
      symbol: 'ETH',
      decimals: 18,
    },
    rpcUrls: ['https://rpc.morphl2.io'],
    blockExplorerUrls: ['https://explorer.morphl2.io'],
  },
  
  // Morph testnet
  MORPH_TESTNET: {
    chainId: '0x2',
    chainName: 'Morph Testnet',
    nativeCurrency: {
      name: 'ETH',
      symbol: 'ETH',
      decimals: 18,
    },
    rpcUrls: ['https://rpc-testnet.morphl2.io'],
    blockExplorerUrls: ['https://explorer-testnet.morphl2.io'],
  },
  
  // Local development
  LOCALHOST: {
    chainId: '0x7A69',
    chainName: 'Localhost 8545',
    nativeCurrency: {
      name: 'ETH',
      symbol: 'ETH',
      decimals: 18,
    },
    rpcUrls: ['http://localhost:8545'],
    blockExplorerUrls: [],
  },
};

// Default network
export const DEFAULT_NETWORK = NETWORKS.MORPH_TESTNET;

// Contract ABIs import paths
export const CONTRACT_ABIS = {
  RENTCHAIN: () => import('../abis/RentChain.json'),
  LISTINGS: () => import('../abis/Listings.json'),
  ESCROW: () => import('../abis/Escrow.json'),
  CHAT: () => import('../abis/Chat.json'),
  COMPLAINTS: () => import('../abis/Complaints.json'),
  REPORTS: () => import('../abis/Reports.json'),
  CREDIT_SCORE: () => import('../abis/CreditScore.json'),
  REMINDERS: () => import('../abis/Reminders.json'),
  ON_RAMP: () => import('../abis/OnRamp.json'),
  LANGUAGE: () => import('../abis/Language.json'),
};

// Platform configuration
export const PLATFORM_CONFIG = {
  // Platform fee in basis points (0.5% = 50)
  DEFAULT_PLATFORM_FEE: 50,
  
  // Maximum platform fee in basis points (5% = 500)
  MAX_PLATFORM_FEE: 500,
  
  // USDT decimals
  USDT_DECIMALS: 6,
  
  // Gas limit for transactions
  DEFAULT_GAS_LIMIT: 300000,
  
  // Gas price (in wei)
  DEFAULT_GAS_PRICE: '20000000000', // 20 gwei
  
  // Transaction timeout (in seconds)
  TX_TIMEOUT: 300, // 5 minutes
  
  // Maximum properties per landlord
  MAX_PROPERTIES_PER_LANDLORD: 100,
  
  // Maximum messages per conversation
  MAX_MESSAGES_PER_CONVERSATION: 1000,
  
  // Maximum complaints per user
  MAX_COMPLAINTS_PER_USER: 50,
};

// IPFS configuration
export const IPFS_CONFIG = {
  // IPFS gateway for fetching content
  GATEWAY: 'https://ipfs.io/ipfs/',
  
  // IPFS API endpoint for uploading
  API_ENDPOINT: 'https://ipfs.infura.io:5001/api/v0',
  
  // Maximum file size for uploads (in bytes)
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  
  // Supported file types for property images
  SUPPORTED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
  
  // Maximum images per property
  MAX_IMAGES_PER_PROPERTY: 10,
};

// Error messages
export const ERROR_MESSAGES = {
  CONTRACT_NOT_INITIALIZED: 'Contract service not initialized',
  INSUFFICIENT_BALANCE: 'Insufficient balance for transaction',
  USER_REJECTED: 'User rejected the transaction',
  NETWORK_ERROR: 'Network error occurred',
  CONTRACT_ERROR: 'Contract interaction failed',
  INVALID_ADDRESS: 'Invalid contract address',
  TRANSACTION_FAILED: 'Transaction failed',
  GAS_ESTIMATION_FAILED: 'Failed to estimate gas',
  NONCE_ERROR: 'Nonce error - please try again',
  TIMEOUT_ERROR: 'Transaction timeout',
};

// Success messages
export const SUCCESS_MESSAGES = {
  PROPERTY_ADDED: 'Property added successfully',
  PROPERTY_UPDATED: 'Property updated successfully',
  PROPERTY_REMOVED: 'Property removed successfully',
  PAYMENT_CREATED: 'Payment created successfully',
  PAYMENT_COMPLETED: 'Payment completed successfully',
  MESSAGE_SENT: 'Message sent successfully',
  COMPLAINT_FILED: 'Complaint filed successfully',
  RESPONSE_SUBMITTED: 'Response submitted successfully',
  WALLET_CONNECTED: 'Wallet connected successfully',
  WALLET_DISCONNECTED: 'Wallet disconnected successfully',
};

// Validation rules
export const VALIDATION_RULES = {
  // Property validation
  PROPERTY: {
    TITLE_MIN_LENGTH: 3,
    TITLE_MAX_LENGTH: 100,
    RENT_MIN_AMOUNT: 1, // 1 USDT
    RENT_MAX_AMOUNT: 100000, // 100,000 USDT
    IPFS_HASH_LENGTH: 46, // IPFS v0 CID length
  },
  
  // Payment validation
  PAYMENT: {
    AMOUNT_MIN: 1, // 1 USDT
    AMOUNT_MAX: 100000, // 100,000 USDT
    DUE_DATE_MIN_DAYS: 1,
    DUE_DATE_MAX_DAYS: 365,
  },
  
  // Message validation
  MESSAGE: {
    IPFS_HASH_LENGTH: 46,
    MAX_RECEIVERS: 10,
  },
  
  // Complaint validation
  COMPLAINT: {
    IPFS_HASH_LENGTH: 46,
    MAX_REASON_LENGTH: 500,
  },
};

// Role-based access control
export const USER_ROLES = {
  LANDLORD: 'landlord',
  TENANT: 'tenant',
  ADMIN: 'admin',
  MODERATOR: 'moderator',
};

// Property types
export const PROPERTY_TYPES = {
  HOUSE: 0,
  OFFICE: 1,
};

// Payment status
export const PAYMENT_STATUS = {
  PENDING: 0,
  PAID: 1,
  LATE: 2,
  DISPUTED: 3,
  REFUNDED: 4,
};

// Payment types
export const PAYMENT_TYPES = {
  USDT: 0,
  FIAT_ON_RAMP: 1,
};

// Complaint resolution
export const COMPLAINT_RESOLUTION = {
  PENDING: 0,
  RESOLVED_IN_FAVOR_COMPLAINANT: 1,
  RESOLVED_IN_FAVOR_RESPONDENT: 2,
  DISMISSED: 3,
  MEDIATED: 4,
};

// Export all configurations
export default {
  CONTRACT_ADDRESSES,
  NETWORKS,
  DEFAULT_NETWORK,
  CONTRACT_ABIS,
  PLATFORM_CONFIG,
  IPFS_CONFIG,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  VALIDATION_RULES,
  USER_ROLES,
  PROPERTY_TYPES,
  PAYMENT_STATUS,
  PAYMENT_TYPES,
  COMPLAINT_RESOLUTION,
}; 