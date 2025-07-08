# RentChain Blockchain

A decentralized rent payment and property management platform built on the Morph blockchain (Layer 2, Ethereum-compatible).

## 📋 Problem Statement

### **Core Problems in Traditional Rental Markets:**

#### 1. **Payment Insecurity & Trust Issues**
- **Problem**: Traditional rental payments lack transparency and security
  - Tenants pay rent directly to landlords without escrow protection
  - No guarantee that landlords will fulfill their obligations
  - Disputes over payments are difficult to resolve
  - Cash payments create no verifiable record

#### 2. **Lack of Verifiable Rental History**
- **Problem**: Tenants cannot build credit from rental payments
  - Traditional rental payments don't contribute to credit scores
  - No portable rental history that follows tenants
  - Landlords have limited ways to verify tenant payment history
  - International tenants face additional barriers

#### 3. **Geographic & Language Barriers**
- **Problem**: Rental markets are fragmented and inaccessible
  - Limited access for international tenants and landlords
  - Language barriers prevent cross-border rentals
  - Different legal systems create complexity
  - No unified platform for global rental transactions

#### 4. **Poor Communication & Dispute Resolution**
- **Problem**: Inefficient communication and dispute handling
  - No standardized complaint system
  - Maintenance requests often go unaddressed
  - Disputes require expensive legal intervention
  - No transparent record of interactions

#### 5. **Limited Payment Options**
- **Problem**: Restricted payment methods create barriers
  - Traditional banking systems exclude many users
  - International transfers are expensive and slow
  - No support for cryptocurrency payments
  - High fees for cross-border transactions

## 🚀 Solution

### **How RentChain Solves These Problems:**

#### **Solution 1: Secure Escrow System**
- **Escrow Protection**: Rent payments are held in smart contract escrow until both parties are satisfied
- **Automatic Release**: Funds are automatically released to landlords upon successful payment
- **Dispute Resolution**: Built-in dispute mechanism with transparent resolution process
- **Dual Payment Support**: Both USDT (crypto) and fiat on-ramp payments supported

#### **Solution 2: On-Chain Credit Scoring**
- **Verifiable History**: All rental payments are recorded on the blockchain
- **Portable Credit Score**: Credit score follows tenants across properties and countries
- **Transparent Scoring**: Algorithm considers payment history, complaint resolution, and ratings
- **Global Recognition**: On-chain records are universally verifiable

#### **Solution 3: Multilingual Global Platform**
- **13+ Languages**: Support for major world languages
- **IPFS Translations**: Decentralized translation storage
- **Global Accessibility**: Available to users worldwide
- **Cross-Border Rentals**: Enables international rental transactions

#### **Solution 4: Transparent Complaint System**
- **Structured Complaints**: Categorized complaint system (Maintenance, Noise, Safety, Other)
- **Transparent Tracking**: All complaints recorded on blockchain with timestamps
- **Resolution Tracking**: Automatic tracking of complaint resolution times
- **IPFS Storage**: Detailed complaint information stored off-chain but verifiably linked

#### **Solution 5: Flexible Payment Infrastructure**
- **Crypto Payments**: Direct USDT payments with automatic fee calculation
- **Fiat Integration**: Support for traditional payment methods via on-ramp providers
- **Low Fees**: 0.5% platform fee (much lower than traditional rental platforms)
- **Fast Settlement**: Near-instant settlement for crypto payments

#### **Solution 6: Built-in Communication & Reporting**
- **Direct Messaging**: Built-in chat system for landlord-tenant communication
- **Rating System**: Transparent rating system with dispute resolution via Kleros
- **Report Generation**: Automated report generation for payment history, property performance
- **Dispute Resolution**: Integration with decentralized dispute resolution platforms

### **Key Value Propositions:**

#### **For Tenants:**
1. **Secure Payments**: Funds protected until both parties are satisfied
2. **Credit Building**: Verifiable rental history that improves credit scores
3. **Global Access**: Rent properties anywhere with multilingual support
4. **Lower Fees**: 0.5% platform fee vs. traditional 8-12% agent fees
5. **Transparent Records**: All interactions recorded on blockchain

#### **For Landlords:**
1. **Guaranteed Payments**: Escrow ensures rent is paid before release
2. **Better Tenants**: Access to verified rental history and credit scores
3. **Global Market**: Access to international tenants
4. **Automated Management**: Smart contracts handle payment processing
5. **Reduced Disputes**: Transparent record-keeping reduces conflicts

#### **For the Platform:**
1. **Sustainable Revenue**: 0.5% fee on all transactions
2. **Network Effects**: More users increase platform value
3. **Data Value**: Rental market data for analytics and insights
4. **Global Scale**: No geographic limitations on growth

### **Market Impact:**
RentChain addresses a **$1.5 trillion global rental market** by solving fundamental trust and accessibility issues that have plagued the industry for decades. The platform creates a more efficient, transparent, and accessible rental ecosystem that benefits all stakeholders while generating sustainable revenue through transaction fees and value-added services.

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
