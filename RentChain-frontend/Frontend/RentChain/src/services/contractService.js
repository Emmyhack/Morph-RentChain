import { ethers } from 'ethers';
import RentChainABI from '../abis/RentChain.json';
import ListingsABI from '../abis/Listings.json';
import EscrowABI from '../abis/Escrow.json';
import ChatABI from '../abis/Chat.json';
import ComplaintsABI from '../abis/Complaints.json';
import CreditScoreABI from '../abis/CreditScore.json';

// Contract addresses (these should be updated with actual deployed addresses)
const CONTRACT_ADDRESSES = {
  RENTCHAIN: '0x...', // Main RentChain contract address
  LISTINGS: '0x...',  // Listings contract address
  ESCROW: '0x...',    // Escrow contract address
  CHAT: '0x...',      // Chat contract address
  COMPLAINTS: '0x...', // Complaints contract address
  USDT: '0x...',      // USDT token address
  CREDITSCORE: '0x...', // CreditScore contract address
  CREDIT_SCORE: '0x...', // CreditScore contract address
  creditScore: '0x...'  // CreditScore contract address
};

class ContractService {
  constructor() {
    this.provider = null;
    this.signer = null;
    this.contracts = {};
    this.isInitialized = false;
  }

  // Initialize the service with provider and signer
  async initialize(provider, signer) {
    try {
      this.provider = provider;
      this.signer = signer;
      
      // Initialize all contracts
      this.contracts.rentChain = new ethers.Contract(
        CONTRACT_ADDRESSES.RENTCHAIN,
        RentChainABI,
        signer
      );

      this.contracts.listings = new ethers.Contract(
        CONTRACT_ADDRESSES.LISTINGS,
        ListingsABI,
        signer
      );

      this.contracts.escrow = new ethers.Contract(
        CONTRACT_ADDRESSES.ESCROW,
        EscrowABI,
        signer
      );

      this.contracts.chat = new ethers.Contract(
        CONTRACT_ADDRESSES.CHAT,
        ChatABI,
        signer
      );

      this.contracts.complaints = new ethers.Contract(
        CONTRACT_ADDRESSES.COMPLAINTS,
        ComplaintsABI,
        signer
      );

      this.contracts.creditScore = new ethers.Contract(
        CONTRACT_ADDRESSES.CREDITSCORE || CONTRACT_ADDRESSES.CREDIT_SCORE || CONTRACT_ADDRESSES.creditScore,
        CreditScoreABI,
        signer
      );

      this.isInitialized = true;
      console.log('ContractService initialized successfully');
    } catch (error) {
      console.error('Failed to initialize ContractService:', error);
      throw error;
    }
  }

  // Check if service is initialized
  checkInitialized() {
    if (!this.isInitialized) {
      throw new Error('ContractService not initialized. Call initialize() first.');
    }
  }

  // ===== RENTCHAIN CONTRACT METHODS =====

  async getContractAddresses() {
    this.checkInitialized();
    try {
      const addresses = await this.contracts.rentChain.getContractAddresses();
      return addresses;
    } catch (error) {
      console.error('Error getting contract addresses:', error);
      throw error;
    }
  }

  async getPlatformStats() {
    this.checkInitialized();
    try {
      const stats = await this.contracts.rentChain.getPlatformStats();
      return {
        totalProperties: stats[0].toString(),
        totalComplaints: stats[1].toString(),
        totalReports: stats[2].toString(),
        totalReminders: stats[3].toString()
      };
    } catch (error) {
      console.error('Error getting platform stats:', error);
      throw error;
    }
  }

  // ===== LISTINGS CONTRACT METHODS =====

  async addProperty(title, propertyType, rentAmount, ipfsHash, leaseAgreementIpfsHash) {
    this.checkInitialized();
    try {
      const tx = await this.contracts.listings.addProperty(
        title,
        propertyType, // 0 for House, 1 for Office
        ethers.utils.parseUnits(rentAmount.toString(), 6), // USDT has 6 decimals
        ipfsHash,
        leaseAgreementIpfsHash
      );
      const receipt = await tx.wait();
      return receipt;
    } catch (error) {
      console.error('Error adding property:', error);
      throw error;
    }
  }

  async editProperty(propertyId, title, propertyType, rentAmount, ipfsHash, leaseAgreementIpfsHash) {
    this.checkInitialized();
    try {
      const tx = await this.contracts.listings.editProperty(
        propertyId,
        title,
        propertyType,
        ethers.utils.parseUnits(rentAmount.toString(), 6),
        ipfsHash,
        leaseAgreementIpfsHash
      );
      const receipt = await tx.wait();
      return receipt;
    } catch (error) {
      console.error('Error editing property:', error);
      throw error;
    }
  }

  async getProperty(propertyId) {
    this.checkInitialized();
    try {
      const property = await this.contracts.listings.getProperty(propertyId);
      return {
        id: property[0].toString(),
        landlord: property[1],
        title: property[2],
        propertyType: property[3],
        rentAmount: ethers.utils.formatUnits(property[4], 6),
        isAvailable: property[5],
        ipfsHash: property[6],
        leaseAgreementIpfsHash: property[7],
        createdAt: new Date(property[8] * 1000),
        updatedAt: new Date(property[9] * 1000)
      };
    } catch (error) {
      console.error('Error getting property:', error);
      throw error;
    }
  }

  async getLandlordProperties(landlordAddress) {
    this.checkInitialized();
    try {
      const propertyIds = await this.contracts.listings.getLandlordProperties(landlordAddress);
      return propertyIds.map(id => id.toString());
    } catch (error) {
      console.error('Error getting landlord properties:', error);
      throw error;
    }
  }

  async getAvailableProperties(offset = 0, limit = 10) {
    this.checkInitialized();
    try {
      const propertyIds = await this.contracts.listings.getAvailableProperties(offset, limit);
      return propertyIds.map(id => id.toString());
    } catch (error) {
      console.error('Error getting available properties:', error);
      throw error;
    }
  }

  async toggleAvailability(propertyId, isAvailable) {
    this.checkInitialized();
    try {
      const tx = await this.contracts.listings.toggleAvailability(propertyId, isAvailable);
      const receipt = await tx.wait();
      return receipt;
    } catch (error) {
      console.error('Error toggling availability:', error);
      throw error;
    }
  }

  async removeProperty(propertyId) {
    this.checkInitialized();
    try {
      const tx = await this.contracts.listings.removeProperty(propertyId);
      const receipt = await tx.wait();
      return receipt;
    } catch (error) {
      console.error('Error removing property:', error);
      throw error;
    }
  }

  async isLandlordVerified(landlordAddress) {
    this.checkInitialized();
    try {
      const verified = await this.contracts.listings.isLandlordVerified(landlordAddress);
      return verified;
    } catch (error) {
      console.error('Error checking landlord verification:', error);
      throw error;
    }
  }

  // ===== ESCROW CONTRACT METHODS =====

  async createPayment(landlord, propertyId, amount, dueDate) {
    this.checkInitialized();
    try {
      const tx = await this.contracts.escrow.createPayment(
        landlord,
        propertyId,
        ethers.utils.parseUnits(amount.toString(), 6),
        Math.floor(dueDate.getTime() / 1000)
      );
      const receipt = await tx.wait();
      return receipt;
    } catch (error) {
      console.error('Error creating payment:', error);
      throw error;
    }
  }

  async payWithUSDT(paymentId) {
    this.checkInitialized();
    try {
      const tx = await this.contracts.escrow.payWithUSDT(paymentId);
      const receipt = await tx.wait();
      return receipt;
    } catch (error) {
      console.error('Error paying with USDT:', error);
      throw error;
    }
  }

  async recordFiatPayment(paymentId, transactionHash) {
    this.checkInitialized();
    try {
      const tx = await this.contracts.escrow.recordFiatPayment(paymentId, transactionHash);
      const receipt = await tx.wait();
      return receipt;
    } catch (error) {
      console.error('Error recording fiat payment:', error);
      throw error;
    }
  }

  async getPayment(paymentId) {
    this.checkInitialized();
    try {
      const payment = await this.contracts.escrow.getPayment(paymentId);
      return {
        id: payment[0].toString(),
        tenant: payment[1],
        landlord: payment[2],
        propertyId: payment[3].toString(),
        amount: ethers.utils.formatUnits(payment[4], 6),
        dueDate: new Date(payment[5] * 1000),
        paidDate: payment[6] > 0 ? new Date(payment[6] * 1000) : null,
        status: payment[7],
        paymentType: payment[8],
        transactionHash: payment[9]
      };
    } catch (error) {
      console.error('Error getting payment:', error);
      throw error;
    }
  }

  async getUserPayments(userAddress) {
    this.checkInitialized();
    try {
      const paymentIds = await this.contracts.escrow.getUserPayments(userAddress);
      return paymentIds.map(id => id.toString());
    } catch (error) {
      console.error('Error getting user payments:', error);
      throw error;
    }
  }

  async getPendingPayments(userAddress) {
    this.checkInitialized();
    try {
      const paymentIds = await this.contracts.escrow.getPendingPayments(userAddress);
      return paymentIds.map(id => id.toString());
    } catch (error) {
      console.error('Error getting pending payments:', error);
      throw error;
    }
  }

  async getOverduePayments(userAddress) {
    this.checkInitialized();
    try {
      const paymentIds = await this.contracts.escrow.getOverduePayments(userAddress);
      return paymentIds.map(id => id.toString());
    } catch (error) {
      console.error('Error getting overdue payments:', error);
      throw error;
    }
  }

  async calculateFee(amount) {
    this.checkInitialized();
    try {
      const fee = await this.contracts.escrow.calculateFee(ethers.utils.parseUnits(amount.toString(), 6));
      return ethers.utils.formatUnits(fee, 6);
    } catch (error) {
      console.error('Error calculating fee:', error);
      throw error;
    }
  }

  // ===== CHAT CONTRACT METHODS =====

  async logMessage(receiver, ipfsHash, propertyId = 0) {
    this.checkInitialized();
    try {
      const tx = await this.contracts.chat.logMessage(receiver, ipfsHash, propertyId);
      const receipt = await tx.wait();
      return receipt;
    } catch (error) {
      console.error('Error logging message:', error);
      throw error;
    }
  }

  async markMessageAsRead(messageId) {
    this.checkInitialized();
    try {
      const tx = await this.contracts.chat.markMessageAsRead(messageId);
      const receipt = await tx.wait();
      return receipt;
    } catch (error) {
      console.error('Error marking message as read:', error);
      throw error;
    }
  }

  async getMessage(messageId) {
    this.checkInitialized();
    try {
      const message = await this.contracts.chat.getMessage(messageId);
      return {
        id: message[0].toString(),
        sender: message[1],
        receiver: message[2],
        ipfsHash: message[3],
        timestamp: new Date(message[4] * 1000),
        propertyId: message[5].toString(),
        isRead: message[6]
      };
    } catch (error) {
      console.error('Error getting message:', error);
      throw error;
    }
  }

  async getMessages(user1, user2) {
    this.checkInitialized();
    try {
      const messageIds = await this.contracts.chat.getMessages(user1, user2);
      return messageIds.map(id => id.toString());
    } catch (error) {
      console.error('Error getting messages:', error);
      throw error;
    }
  }

  async getUserMessages(userAddress) {
    this.checkInitialized();
    try {
      const messageIds = await this.contracts.chat.getUserMessages(userAddress);
      return messageIds.map(id => id.toString());
    } catch (error) {
      console.error('Error getting user messages:', error);
      throw error;
    }
  }

  async getUnreadMessages(userAddress) {
    this.checkInitialized();
    try {
      const messageIds = await this.contracts.chat.getUnreadMessages(userAddress);
      return messageIds.map(id => id.toString());
    } catch (error) {
      console.error('Error getting unread messages:', error);
      throw error;
    }
  }

  // ===== COMPLAINTS CONTRACT METHODS =====

  async fileComplaint(respondent, propertyId, ipfsHash) {
    this.checkInitialized();
    try {
      const tx = await this.contracts.complaints.fileComplaint(respondent, propertyId, ipfsHash);
      const receipt = await tx.wait();
      return receipt;
    } catch (error) {
      console.error('Error filing complaint:', error);
      throw error;
    }
  }

  async submitResponse(complaintId, ipfsHash) {
    this.checkInitialized();
    try {
      const tx = await this.contracts.complaints.submitResponse(complaintId, ipfsHash);
      const receipt = await tx.wait();
      return receipt;
    } catch (error) {
      console.error('Error submitting response:', error);
      throw error;
    }
  }

  async getComplaint(complaintId) {
    this.checkInitialized();
    try {
      const complaint = await this.contracts.complaints.getComplaint(complaintId);
      return {
        id: complaint[0].toString(),
        complainant: complaint[1],
        respondent: complaint[2],
        propertyId: complaint[3].toString(),
        complaintHash: complaint[4],
        responseHash: complaint[5],
        resolution: complaint[6],
        filedAt: new Date(complaint[7] * 1000),
        respondedAt: complaint[8] > 0 ? new Date(complaint[8] * 1000) : null,
        resolvedAt: complaint[9] > 0 ? new Date(complaint[9] * 1000) : null
      };
    } catch (error) {
      console.error('Error getting complaint:', error);
      throw error;
    }
  }

  async getUserComplaints(userAddress) {
    this.checkInitialized();
    try {
      const complaintIds = await this.contracts.complaints.getUserComplaints(userAddress);
      return complaintIds.map(id => id.toString());
    } catch (error) {
      console.error('Error getting user complaints:', error);
      throw error;
    }
  }

  // ===== CREDIT SCORE CONTRACT METHODS =====
  async getCreditScore(tenantAddress) {
    this.checkInitialized();
    try {
      const score = await this.contracts.creditScore.calculateCreditScore(tenantAddress);
      return Number(score);
    } catch (error) {
      console.error('Error getting credit score:', error);
      throw error;
    }
  }

  async getPaymentTimeliness(tenantAddress) {
    this.checkInitialized();
    try {
      const percent = await this.contracts.creditScore.getPaymentTimelinessPercentage(tenantAddress);
      return Number(percent);
    } catch (error) {
      console.error('Error getting payment timeliness:', error);
      throw error;
    }
  }

  async getComplaintResolutionRate(tenantAddress) {
    this.checkInitialized();
    try {
      const percent = await this.contracts.creditScore.getComplaintResolutionRate(tenantAddress);
      return Number(percent);
    } catch (error) {
      console.error('Error getting complaint resolution rate:', error);
      throw error;
    }
  }

  async getAverageRating(tenantAddress) {
    this.checkInitialized();
    try {
      const avg = await this.contracts.creditScore.getAverageRating(tenantAddress);
      return Number(avg);
    } catch (error) {
      console.error('Error getting average rating:', error);
      throw error;
    }
  }

  async getRentalHistory(tenantAddress, propertyId) {
    this.checkInitialized();
    try {
      const history = await this.contracts.creditScore.getRentalHistory(tenantAddress, propertyId);
      return history;
    } catch (error) {
      console.error('Error getting rental history:', error);
      throw error;
    }
  }

  // ===== UTILITY METHODS =====

  async getContractAddressesFromMain() {
    this.checkInitialized();
    try {
      const addresses = await this.contracts.rentChain.getContractAddresses();
      return {
        escrow: addresses[0],
        listings: addresses[1],
        complaints: addresses[2],
        reports: addresses[3],
        creditScore: addresses[4],
        reminders: addresses[5],
        chat: addresses[6],
        onRamp: addresses[7],
        language: addresses[8]
      };
    } catch (error) {
      console.error('Error getting contract addresses from main contract:', error);
      throw error;
    }
  }

  // Get contract instance by name
  getContract(contractName) {
    this.checkInitialized();
    const contract = this.contracts[contractName.toLowerCase()];
    if (!contract) {
      throw new Error(`Contract ${contractName} not found`);
    }
    return contract;
  }

  // Check if user has pending transactions
  async hasPendingTransactions() {
    this.checkInitialized();
    try {
      const address = await this.signer.getAddress();
      const nonce = await this.provider.getTransactionCount(address, 'pending');
      const latestNonce = await this.provider.getTransactionCount(address, 'latest');
      return nonce > latestNonce;
    } catch (error) {
      console.error('Error checking pending transactions:', error);
      return false;
    }
  }

  // Get user's balance
  async getBalance(address) {
    this.checkInitialized();
    try {
      const balance = await this.provider.getBalance(address);
      return ethers.utils.formatEther(balance);
    } catch (error) {
      console.error('Error getting balance:', error);
      throw error;
    }
  }

  // Get current block number
  async getCurrentBlock() {
    this.checkInitialized();
    try {
      const blockNumber = await this.provider.getBlockNumber();
      return blockNumber;
    } catch (error) {
      console.error('Error getting current block:', error);
      throw error;
    }
  }
}

// Create and export a singleton instance
const contractService = new ContractService();
export default contractService; 