# RentChain Blockchain

A decentralized rent payment and property management platform built on the Morph blockchain (Layer 2, Ethereum-compatible).

## 🏗️ Architecture

RentChain consists of 10 modular smart contracts that work together to provide a complete rental management solution:

- **RentChain.sol** - Main coordination contract
- **Escrow.sol** - Rent payment management with USDT
- **Listings.sol** - Property listings (houses and offices)
- **Complaints.sol** - Maintenance complaint system
- **Reports.sol** - Tenant evaluation with dispute resolution
- **CreditScore.sol** - On-chain rental history and credit scoring
- **Reminders.sol** - Automated reminders with Chainlink Keepers
- **Chat.sol** - Message metadata for dispute resolution
- **OnRamp.sol** - Fiat-to-crypto transaction tracking
- **Language.sol** - Multilingual support with IPFS translations

## 🚀 Quick Start

### Prerequisites

- **Node.js 18+** and npm 8+
- Hardhat 2.25+
- MetaMask or compatible wallet
- Morph L2 testnet/mainnet access

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd rentchain-blockchain

# Install dependencies (uses latest compatible versions)
npm install

# Set up environment variables
cp .env.example .env

# Verify installation
npm run check
```

### Environment Variables

Edit the `.env` file with your configuration:


### Dependency Versions

This project uses the latest compatible versions:

- **@nomicfoundation/hardhat-toolbox**: ^6.0.0 (includes ethers v6)
- **@openzeppelin/contracts**: ^5.3.0
- **@openzeppelin/hardhat-upgrades**: ^3.9.0
- **hardhat**: ^2.25.0
- **@chainlink/contracts**: ^1.4.0

### Compilation

```bash
# Compile contracts
npm run compile
```

### Testing

```bash
# Run tests
npm test

# Run tests with gas reporting
REPORT_GAS=true npm test
```

### Deployment

#### Testnet Deployment

```bash
# Deploy to Morph testnet (recommended)
npm run deploy:morphTestnet

# Alternative testnet deployment
npm run deploy:testnet
```

#### Mainnet Deployment

```bash
# Deploy to Morph mainnet
npm run deploy:mainnet
```

#### QuickNode Morph L2

```bash
# Deploy using QuickNode RPC
npm run deploy:morphl2
```

### Contract Verification

#### Automatic Verification (Recommended)

```bash
# Verify all contracts on Morph testnet
npx hardhat run scripts/verify.js --network morphTestnet

# Verify all contracts on Morph mainnet
npx hardhat run scripts/verify.js --network morph-mainnet
```

#### Manual Verification

```bash
# Verify on MorphScan (testnet)
npm run verify:morphTestnet

# Verify on MorphScan (mainnet)
npm run verify:mainnet

# Verify on MorphScan (QuickNode)
npm run verify:morphl2
```

#### Sourcify Verification

```bash
# Verify on Sourcify (testnet)
npm run sourcify:testnet

# Verify on Sourcify (mainnet)
npm run sourcify:mainnet
```

## 🌐 Network Configuration

### Morph L2 Networks

| Network | RPC URL | Chain ID | Explorer | API URL |
|---------|---------|----------|----------|---------|
| Testnet | `https://rpc-testnet.morphl2.io` | 2710 | [MorphScan Testnet](https://explorer-holesky.morphl2.io) | `https://explorer-api-holesky.morphl2.io/api` |
| Mainnet | `https://rpc.morphl2.io` | 2718 | [MorphScan](https://explorer.morphl2.io) | `https://explorer.morphl2.io/api` |
| QuickNode | `https://rpc-quicknode.morphl2.io` | 2718 | [MorphScan](https://explorer.morphl2.io) | `https://explorer.morphl2.io/api` |

### Connecting with Ethers

```javascript
import { ethers } from 'ethers';

// Basic provider connection
const provider = new ethers.JsonRpcProvider('https://rpc-quicknode.morphl2.io');

// With wallet
const wallet = new ethers.Wallet(privateKey, provider);

// Get network info
const network = await provider.getNetwork();
console.log(`Connected to: ${network.name} (Chain ID: ${network.chainId})`);
```

## 🔧 Contract Integration

### Frontend Integration

```javascript
// Example: Connecting to RentChain contracts
import { ethers } from 'ethers';
import RentChainABI from './artifacts/contracts/RentChain.sol/RentChain.json';

const provider = new ethers.JsonRpcProvider('https://rpc-quicknode.morphl2.io');
const signer = provider.getSigner();

const rentChain = new ethers.Contract(
  'RENTCHAIN_CONTRACT_ADDRESS',
  RentChainABI.abi,
  signer
);

// Get all contract addresses
const addresses = await rentChain.getContractAddresses();
console.log('Contract addresses:', addresses);
```

### Backend Integration

```javascript
// Example: Monitoring events
const escrow = new ethers.Contract(escrowAddress, EscrowABI, provider);

escrow.on('RentDeposited', (propertyId, tenant, amount, onRampTxId) => {
  console.log(`Rent deposited: Property ${propertyId}, Tenant ${tenant}, Amount ${amount}`);
});

escrow.on('RentReleased', (propertyId, tenant, landlord, amount) => {
  console.log(`Rent released: Property ${propertyId}, Amount ${amount}`);
});
```

## 🔗 External Integrations

### IPFS Storage

Store off-chain data on IPFS and reference via hashes:

```javascript
// Example: Property listing with IPFS metadata
const propertyData = {
  title: "Modern 2BR Apartment",
  description: "Beautiful apartment in downtown...",
  images: ["ipfs://QmHash1", "ipfs://QmHash2"],
  amenities: ["Parking", "Gym", "Pool"]
};

const ipfsHash = await uploadToIPFS(propertyData);
await listings.addProperty("Modern 2BR Apartment", 0, 2000, ipfsHash);
```

### Chainlink Keepers

Automate reminder triggers:

```javascript
// Register contract with Chainlink Keepers
const upkeepConfig = {
  name: "RentChain Reminders",
  encryptedEmail: "0x...",
  upkeepContract: remindersAddress,
  gasLimit: 500000,
  adminAddress: adminAddress,
  triggerType: 0, // Log trigger
  checkData: "0x",
  offchainConfig: "0x",
  amount: ethers.parseEther("0.1")
};
```

### The Graph Subgraph

Index events for efficient querying:

```graphql
# Example GraphQL query
{
  properties(first: 10, where: { isAvailable: true }) {
    id
    title
    rentAmount
    landlord
    propertyType
  }
  
  complaints(first: 5, where: { status: "Open" }) {
    id
    property {
      title
    }
    tenant
    createdAt
  }
}
```

## 🛡️ Security Features

- **Reentrancy Protection**: All fund-handling functions use `ReentrancyGuard`
- **Access Control**: Role-based permissions with `Ownable` pattern
- **Input Validation**: Comprehensive parameter checking
- **Pausable**: Emergency stop functionality
- **Upgradeable**: UUPS proxy pattern for future updates
- **Gas Optimization**: Efficient storage patterns for L2

## 📊 Gas Optimization

Optimized for Morph L2's low gas costs (~$0.01 per transaction):

- Use `uint256` for IDs and amounts
- Efficient mapping storage patterns
- Minimal on-chain data (offload to IPFS)
- Batch operations where possible

## 🧪 Testing

### Running Tests

```bash
# Run all tests
npm test

# Run specific test file
npx hardhat test test/Escrow.test.js

# Run with coverage
npx hardhat coverage
```

### Test Structure

```
test/
├── RentChain.test.js      # Main contract tests
├── Escrow.test.js         # Escrow functionality
├── Listings.test.js       # Property listings
├── Complaints.test.js     # Complaint system
├── Reports.test.js        # Tenant reports
├── CreditScore.test.js    # Credit scoring
├── Reminders.test.js      # Automated reminders
├── Chat.test.js           # Message storage
├── OnRamp.test.js         # Fiat integration
└── Language.test.js       # Multilingual support
```

## 📈 Monitoring & Analytics

### Event Monitoring

Key events to monitor:

- `PropertyListed` - New property listings
- `RentDeposited` - Rent payments to escrow
- `RentReleased` - Rent payments to landlords
- `ComplaintLogged` - New maintenance complaints
- `ReportSubmitted` - Tenant evaluations
- `CreditScoreUpdated` - Credit score changes

### Metrics to Track

- Total properties listed
- Total rent volume in escrow
- Complaint resolution rates
- Average credit scores
- Platform usage by language

## 🔄 Upgrade Process

The main RentChain contract uses UUPS proxy pattern:

```javascript
// Upgrade to new implementation
const RentChainV2 = await ethers.getContractFactory("RentChainV2");
const upgraded = await upgrades.upgradeProxy(rentChainAddress, RentChainV2);
await upgraded.waitForDeployment();
```

## 🌍 Multilingual Support

Support for 13+ languages with IPFS-based translations:

```javascript
// Set user language preference
await language.setLanguagePreference("es");

// Get translation file hash
const translationHash = await language.getTranslationFile("es");

// Fetch translations from IPFS
const translations = await fetchFromIPFS(translationHash);
```

## 📝 License

MIT License - see LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📞 Support

- **Documentation**: [docs.rentchain.io](https://docs.rentchain.io)
- **Discord**: [discord.gg/rentchain](https://discord.gg/rentchain)
- **Email**: support@rentchain.io

## 🗺️ Roadmap

- [ ] Mobile app development (Phase 2)
- [ ] Advanced dispute resolution
- [ ] DeFi integration (yield farming on escrow)
- [ ] Cross-chain bridges
- [ ] DAO governance implementation
- [ ] Advanced analytics dashboard 
