import { useState, useCallback } from 'react';
import { useWeb3 } from '../context/Web3Context';
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '../config/contracts';

export const useContracts = () => {
  const { contractService, contractsInitialized, account } = useWeb3();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Generic contract interaction wrapper
  const executeContractCall = useCallback(async (contractCall, successMessage = null) => {
    if (!contractsInitialized) {
      setError(ERROR_MESSAGES.CONTRACT_NOT_INITIALIZED);
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await contractCall();
      
      if (successMessage) {
        console.log(successMessage);
      }
      
      return result;
    } catch (err) {
      console.error('Contract call failed:', err);
      
      // Handle specific error types
      let errorMessage = ERROR_MESSAGES.CONTRACT_ERROR;
      
      if (err.code === 4001) {
        errorMessage = ERROR_MESSAGES.USER_REJECTED;
      } else if (err.message.includes('insufficient funds')) {
        errorMessage = ERROR_MESSAGES.INSUFFICIENT_BALANCE;
      } else if (err.message.includes('nonce')) {
        errorMessage = ERROR_MESSAGES.NONCE_ERROR;
      } else if (err.message.includes('timeout')) {
        errorMessage = ERROR_MESSAGES.TIMEOUT_ERROR;
      } else if (err.message.includes('gas')) {
        errorMessage = ERROR_MESSAGES.GAS_ESTIMATION_FAILED;
      }
      
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, [contractsInitialized]);

  // ===== LISTINGS CONTRACT HOOKS =====

  const addProperty = useCallback(async (title, propertyType, rentAmount, ipfsHash, leaseAgreementIpfsHash) => {
    return executeContractCall(
      () => contractService.addProperty(title, propertyType, rentAmount, ipfsHash, leaseAgreementIpfsHash),
      SUCCESS_MESSAGES.PROPERTY_ADDED
    );
  }, [executeContractCall, contractService]);

  const editProperty = useCallback(async (propertyId, title, propertyType, rentAmount, ipfsHash, leaseAgreementIpfsHash) => {
    return executeContractCall(
      () => contractService.editProperty(propertyId, title, propertyType, rentAmount, ipfsHash, leaseAgreementIpfsHash),
      SUCCESS_MESSAGES.PROPERTY_UPDATED
    );
  }, [executeContractCall, contractService]);

  const getProperty = useCallback(async (propertyId) => {
    return executeContractCall(
      () => contractService.getProperty(propertyId)
    );
  }, [executeContractCall, contractService]);

  const getLandlordProperties = useCallback(async (landlordAddress = account) => {
    if (!landlordAddress) return [];
    return executeContractCall(
      () => contractService.getLandlordProperties(landlordAddress)
    );
  }, [executeContractCall, contractService, account]);

  const getAvailableProperties = useCallback(async (offset = 0, limit = 10) => {
    return executeContractCall(
      () => contractService.getAvailableProperties(offset, limit)
    );
  }, [executeContractCall, contractService]);

  const toggleAvailability = useCallback(async (propertyId, isAvailable) => {
    return executeContractCall(
      () => contractService.toggleAvailability(propertyId, isAvailable)
    );
  }, [executeContractCall, contractService]);

  const removeProperty = useCallback(async (propertyId) => {
    return executeContractCall(
      () => contractService.removeProperty(propertyId),
      SUCCESS_MESSAGES.PROPERTY_REMOVED
    );
  }, [executeContractCall, contractService]);

  const isLandlordVerified = useCallback(async (landlordAddress = account) => {
    if (!landlordAddress) return false;
    return executeContractCall(
      () => contractService.isLandlordVerified(landlordAddress)
    );
  }, [executeContractCall, contractService, account]);

  // ===== ESCROW CONTRACT HOOKS =====

  const createPayment = useCallback(async (landlord, propertyId, amount, dueDate) => {
    return executeContractCall(
      () => contractService.createPayment(landlord, propertyId, amount, dueDate),
      SUCCESS_MESSAGES.PAYMENT_CREATED
    );
  }, [executeContractCall, contractService]);

  const payWithUSDT = useCallback(async (paymentId) => {
    return executeContractCall(
      () => contractService.payWithUSDT(paymentId),
      SUCCESS_MESSAGES.PAYMENT_COMPLETED
    );
  }, [executeContractCall, contractService]);

  const recordFiatPayment = useCallback(async (paymentId, transactionHash) => {
    return executeContractCall(
      () => contractService.recordFiatPayment(paymentId, transactionHash),
      SUCCESS_MESSAGES.PAYMENT_COMPLETED
    );
  }, [executeContractCall, contractService]);

  const getPayment = useCallback(async (paymentId) => {
    return executeContractCall(
      () => contractService.getPayment(paymentId)
    );
  }, [executeContractCall, contractService]);

  const getUserPayments = useCallback(async (userAddress = account) => {
    if (!userAddress) return [];
    return executeContractCall(
      () => contractService.getUserPayments(userAddress)
    );
  }, [executeContractCall, contractService, account]);

  const getPendingPayments = useCallback(async (userAddress = account) => {
    if (!userAddress) return [];
    return executeContractCall(
      () => contractService.getPendingPayments(userAddress)
    );
  }, [executeContractCall, contractService, account]);

  const getOverduePayments = useCallback(async (userAddress = account) => {
    if (!userAddress) return [];
    return executeContractCall(
      () => contractService.getOverduePayments(userAddress)
    );
  }, [executeContractCall, contractService, account]);

  const calculateFee = useCallback(async (amount) => {
    return executeContractCall(
      () => contractService.calculateFee(amount)
    );
  }, [executeContractCall, contractService]);

  // ===== CHAT CONTRACT HOOKS =====

  const logMessage = useCallback(async (receiver, ipfsHash, propertyId = 0) => {
    return executeContractCall(
      () => contractService.logMessage(receiver, ipfsHash, propertyId),
      SUCCESS_MESSAGES.MESSAGE_SENT
    );
  }, [executeContractCall, contractService]);

  const markMessageAsRead = useCallback(async (messageId) => {
    return executeContractCall(
      () => contractService.markMessageAsRead(messageId)
    );
  }, [executeContractCall, contractService]);

  const getMessage = useCallback(async (messageId) => {
    return executeContractCall(
      () => contractService.getMessage(messageId)
    );
  }, [executeContractCall, contractService]);

  const getMessages = useCallback(async (user1, user2) => {
    return executeContractCall(
      () => contractService.getMessages(user1, user2)
    );
  }, [executeContractCall, contractService]);

  const getUserMessages = useCallback(async (userAddress = account) => {
    if (!userAddress) return [];
    return executeContractCall(
      () => contractService.getUserMessages(userAddress)
    );
  }, [executeContractCall, contractService, account]);

  const getUnreadMessages = useCallback(async (userAddress = account) => {
    if (!userAddress) return [];
    return executeContractCall(
      () => contractService.getUnreadMessages(userAddress)
    );
  }, [executeContractCall, contractService, account]);

  // ===== COMPLAINTS CONTRACT HOOKS =====

  const fileComplaint = useCallback(async (respondent, propertyId, ipfsHash) => {
    return executeContractCall(
      () => contractService.fileComplaint(respondent, propertyId, ipfsHash),
      SUCCESS_MESSAGES.COMPLAINT_FILED
    );
  }, [executeContractCall, contractService]);

  const submitResponse = useCallback(async (complaintId, ipfsHash) => {
    return executeContractCall(
      () => contractService.submitResponse(complaintId, ipfsHash),
      SUCCESS_MESSAGES.RESPONSE_SUBMITTED
    );
  }, [executeContractCall, contractService]);

  const getComplaint = useCallback(async (complaintId) => {
    return executeContractCall(
      () => contractService.getComplaint(complaintId)
    );
  }, [executeContractCall, contractService]);

  const getUserComplaints = useCallback(async (userAddress = account) => {
    if (!userAddress) return [];
    return executeContractCall(
      () => contractService.getUserComplaints(userAddress)
    );
  }, [executeContractCall, contractService, account]);

  // ===== PLATFORM HOOKS =====

  const getPlatformStats = useCallback(async () => {
    return executeContractCall(
      () => contractService.getPlatformStats()
    );
  }, [executeContractCall, contractService]);

  const getContractAddresses = useCallback(async () => {
    return executeContractCall(
      () => contractService.getContractAddresses()
    );
  }, [executeContractCall, contractService]);

  const getBalance = useCallback(async (address = account) => {
    if (!address) return '0';
    return executeContractCall(
      () => contractService.getBalance(address)
    );
  }, [executeContractCall, contractService, account]);

  // ===== CREDIT SCORE CONTRACT HOOKS =====
  const getCreditScore = useCallback(async (tenantAddress = account) => {
    if (!tenantAddress) return 0;
    return executeContractCall(
      () => contractService.getCreditScore(tenantAddress)
    );
  }, [executeContractCall, contractService, account]);

  const getPaymentTimeliness = useCallback(async (tenantAddress = account) => {
    if (!tenantAddress) return 0;
    return executeContractCall(
      () => contractService.getPaymentTimeliness(tenantAddress)
    );
  }, [executeContractCall, contractService, account]);

  const getComplaintResolutionRate = useCallback(async (tenantAddress = account) => {
    if (!tenantAddress) return 0;
    return executeContractCall(
      () => contractService.getComplaintResolutionRate(tenantAddress)
    );
  }, [executeContractCall, contractService, account]);

  const getAverageRating = useCallback(async (tenantAddress = account) => {
    if (!tenantAddress) return 0;
    return executeContractCall(
      () => contractService.getAverageRating(tenantAddress)
    );
  }, [executeContractCall, contractService, account]);

  const getRentalHistory = useCallback(async (tenantAddress = account, propertyId = 0) => {
    if (!tenantAddress) return null;
    return executeContractCall(
      () => contractService.getRentalHistory(tenantAddress, propertyId)
    );
  }, [executeContractCall, contractService, account]);

  return {
    // State
    loading,
    error,
    clearError,
    
    // Listings
    addProperty,
    editProperty,
    getProperty,
    getLandlordProperties,
    getAvailableProperties,
    toggleAvailability,
    removeProperty,
    isLandlordVerified,
    
    // Escrow
    createPayment,
    payWithUSDT,
    recordFiatPayment,
    getPayment,
    getUserPayments,
    getPendingPayments,
    getOverduePayments,
    calculateFee,
    
    // Chat
    logMessage,
    markMessageAsRead,
    getMessage,
    getMessages,
    getUserMessages,
    getUnreadMessages,
    
    // Complaints
    fileComplaint,
    submitResponse,
    getComplaint,
    getUserComplaints,
    
    // Platform
    getPlatformStats,
    getContractAddresses,
    getBalance,

    // Credit Score
    getCreditScore,
    getPaymentTimeliness,
    getComplaintResolutionRate,
    getAverageRating,
    getRentalHistory,
  };
}; 