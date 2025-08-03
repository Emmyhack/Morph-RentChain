# RentChain Contract Integration Guide

This document explains how to integrate the RentChain smart contracts with the frontend application.

## Overview

The RentChain platform consists of multiple smart contracts that work together to provide a comprehensive rental management system:

- **RentChain.sol** - Main coordinator contract
- **Listings.sol** - Property management
- **Escrow.sol** - Payment processing
- **Chat.sol** - Messaging system
- **Complaints.sol** - Dispute resolution
- **Reports.sol** - User reporting
- **CreditScore.sol** - Credit scoring
- **Reminders.sol** - Payment reminders
- **OnRamp.sol** - Fiat on-ramp
- **Language.sol** - Multi-language support

## Setup Instructions

### 1. Update Contract Addresses

Edit `src/config/contracts.js` and update the contract addresses with your deployed contract addresses:

```javascript
export const CONTRACT_ADDRESSES = {
  RENTCHAIN: '0x...', // Your deployed RentChain address
  LISTINGS: '0x...',  // Your deployed Listings address
  ESCROW: '0x...',    // Your deployed Escrow address
  CHAT: '0x...',      // Your deployed Chat address
  COMPLAINTS: '0x...', // Your deployed Complaints address
  // ... other contracts
  USDT: '0x...',      // USDT token address on your network
};
```

### 2. Network Configuration

Update the network configuration in `src/config/contracts.js`:

```javascript
export const NETWORKS = {
  MORPH_MAINNET: {
    chainId: '0x1',
    chainName: 'Morph',
    rpcUrls: ['https://rpc.morphl2.io'],
    blockExplorerUrls: ['https://explorer.morphl2.io'],
  },
  // ... other networks
};
```

### 3. Install Dependencies

Make sure you have the required dependencies:

```bash
npm install ethers@6.0.0
```

## Usage

### Basic Contract Interaction

The contract integration is handled through the `useContracts` hook:

```javascript
import { useContracts } from '../hooks/useContracts';

function MyComponent() {
  const { 
    addProperty, 
    getProperty, 
    loading, 
    error 
  } = useContracts();

  const handleAddProperty = async () => {
    const result = await addProperty(
      'My Property',    // title
      0,                // propertyType (0 = House, 1 = Office)
      1000,             // rentAmount in USDT
      'QmHash...'       // ipfsHash
    );
    
    if (result) {
      console.log('Property added successfully!');
    }
  };

  return (
    <div>
      <button onClick={handleAddProperty} disabled={loading}>
        {loading ? 'Adding...' : 'Add Property'}
      </button>
      {error && <p>Error: {error}</p>}
    </div>
  );
}
```

### Available Contract Methods

#### Listings Contract

```javascript
const {
  addProperty,           // Add new property
  editProperty,          // Edit existing property
  getProperty,           // Get property details
  getLandlordProperties, // Get properties by landlord
  getAvailableProperties, // Get available properties
  toggleAvailability,    // Toggle property availability
  removeProperty,        // Remove property
  isLandlordVerified,    // Check if landlord is verified
} = useContracts();
```

#### Escrow Contract

```javascript
const {
  createPayment,         // Create new payment
  payWithUSDT,          // Pay with USDT
  recordFiatPayment,    // Record fiat payment
  getPayment,           // Get payment details
  getUserPayments,      // Get user's payments
  getPendingPayments,   // Get pending payments
  getOverduePayments,   // Get overdue payments
  calculateFee,         // Calculate platform fee
} = useContracts();
```

#### Chat Contract

```javascript
const {
  logMessage,           // Send message
  markMessageAsRead,    // Mark message as read
  getMessage,           // Get message details
  getMessages,          // Get conversation messages
  getUserMessages,      // Get user's messages
  getUnreadMessages,    // Get unread messages
} = useContracts();
```

#### Complaints Contract

```javascript
const {
  fileComplaint,        // File a complaint
  submitResponse,       // Submit response to complaint
  getComplaint,         // Get complaint details
  getUserComplaints,    // Get user's complaints
} = useContracts();
```

#### Platform Methods

```javascript
const {
  getPlatformStats,     // Get platform statistics
  getContractAddresses, // Get all contract addresses
  getBalance,           // Get user balance
} = useContracts();
```

### Error Handling

The contract service includes comprehensive error handling:

```javascript
const { error, clearError } = useContracts();

// Clear error manually
clearError();

// Error types are automatically detected:
// - User rejection
// - Insufficient balance
// - Network errors
// - Gas estimation failures
// - Transaction timeouts
```

### Loading States

All contract interactions provide loading states:

```javascript
const { loading } = useContracts();

// Use loading state in UI
<button disabled={loading}>
  {loading ? 'Processing...' : 'Submit'}
</button>
```

## Contract ABIs

All contract ABIs are located in `src/abis/`:

- `RentChain.json` - Main coordinator contract
- `Listings.json` - Property management
- `Escrow.json` - Payment processing
- `Chat.json` - Messaging system
- `Complaints.json` - Dispute resolution
- `Reports.json` - User reporting

## Configuration

### Platform Configuration

```javascript
export const PLATFORM_CONFIG = {
  DEFAULT_PLATFORM_FEE: 50,        // 0.5% in basis points
  MAX_PLATFORM_FEE: 500,           // 5% maximum
  USDT_DECIMALS: 6,                // USDT has 6 decimals
  DEFAULT_GAS_LIMIT: 300000,       // Gas limit for transactions
  TX_TIMEOUT: 300,                 // 5 minutes timeout
  MAX_PROPERTIES_PER_LANDLORD: 100,
  MAX_MESSAGES_PER_CONVERSATION: 1000,
  MAX_COMPLAINTS_PER_USER: 50,
};
```

### Validation Rules

```javascript
export const VALIDATION_RULES = {
  PROPERTY: {
    TITLE_MIN_LENGTH: 3,
    TITLE_MAX_LENGTH: 100,
    RENT_MIN_AMOUNT: 1,            // 1 USDT
    RENT_MAX_AMOUNT: 100000,       // 100,000 USDT
    IPFS_HASH_LENGTH: 46,          // IPFS v0 CID length
  },
  // ... other validation rules
};
```

## Network Support

The system supports multiple networks:

- **Morph Mainnet** - Production network
- **Morph Testnet** - Testing network
- **Localhost** - Development network

## Security Considerations

1. **Contract Addresses**: Always verify contract addresses before deployment
2. **User Input Validation**: Validate all user inputs before sending to contracts
3. **Error Handling**: Implement proper error handling for all contract interactions
4. **Gas Estimation**: Use proper gas estimation for transactions
5. **Network Validation**: Ensure users are on the correct network

## Testing

### Unit Tests

Create tests for contract interactions:

```javascript
import { renderHook } from '@testing-library/react';
import { useContracts } from '../hooks/useContracts';

test('should add property successfully', async () => {
  const { result } = renderHook(() => useContracts());
  
  const mockResult = await result.current.addProperty(
    'Test Property',
    0,
    1000,
    'QmTestHash'
  );
  
  expect(mockResult).toBeTruthy();
});
```

### Integration Tests

Test the full contract integration flow:

```javascript
test('should handle complete property lifecycle', async () => {
  // 1. Add property
  // 2. Create payment
  // 3. Process payment
  // 4. Verify state changes
});
```

## Troubleshooting

### Common Issues

1. **Contract Not Initialized**
   - Ensure MetaMask is connected
   - Check if contract addresses are correct
   - Verify network connection

2. **Transaction Failures**
   - Check user balance
   - Verify gas limits
   - Ensure correct network

3. **ABI Errors**
   - Verify ABI files are up to date
   - Check contract compilation
   - Ensure correct import paths

### Debug Mode

Enable debug logging:

```javascript
// In contractService.js
const DEBUG = true;

if (DEBUG) {
  console.log('Contract call:', methodName, params);
}
```

## Deployment Checklist

Before deploying to production:

- [ ] Update all contract addresses
- [ ] Verify network configuration
- [ ] Test all contract interactions
- [ ] Validate error handling
- [ ] Check gas limits and fees
- [ ] Test with real transactions
- [ ] Verify security measures
- [ ] Update documentation

## Support

For issues with contract integration:

1. Check the browser console for errors
2. Verify contract addresses and network
3. Test with a simple transaction first
4. Check MetaMask connection and permissions
5. Review the contract ABIs for compatibility

## Additional Resources

- [Ethers.js Documentation](https://docs.ethers.org/)
- [MetaMask Documentation](https://docs.metamask.io/)
- [Solidity Documentation](https://docs.soliditylang.org/)
- [OpenZeppelin Contracts](https://docs.openzeppelin.com/contracts/) 