import React, { createContext, useContext, useState, useEffect } from 'react';
import { ethers } from 'ethers';
import contractService from '../services/contractService';
import { CONTRACT_ADDRESSES, DEFAULT_NETWORK, ERROR_MESSAGES, SUCCESS_MESSAGES } from '../config/contracts';

const Web3Context = createContext();

export const useWeb3 = () => {
  const context = useContext(Web3Context);
  if (!context) {
    throw new Error('useWeb3 must be used within a Web3Provider');
  }
  return context;
};

export const Web3Provider = ({ children }) => {
  const [account, setAccount] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [userRole, setUserRole] = useState(null); // 'landlord' or 'tenant' or null
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [network, setNetwork] = useState(null);
  const [contractsInitialized, setContractsInitialized] = useState(false);

  // Check if MetaMask is installed
  const isMetaMaskInstalled = () => {
    return typeof window !== 'undefined' && window.ethereum && window.ethereum.isMetaMask;
  };

  // Determine user role based on wallet address
  // This is a simple implementation - in a real app, you'd check against your smart contract
  const determineUserRole = (address) => {
    if (!address) return null;
    
    // For demo purposes, we'll use a simple rule:
    // Addresses starting with '0x1' are landlords, '0x2' are tenants
    // In production, you'd check against your smart contract
    const firstChar = address.charAt(2); // Skip '0x'
    
    if (firstChar === '1' || firstChar === '3' || firstChar === '5' || firstChar === '7' || firstChar === '9') {
      return 'landlord';
    } else if (firstChar === '2' || firstChar === '4' || firstChar === '6' || firstChar === '8' || firstChar === 'a' || firstChar === 'c' || firstChar === 'e') {
      return 'tenant';
    } else {
      // Default to tenant for addresses starting with '0', 'b', 'd', 'f'
      return 'tenant';
    }
  };

  // Connect to MetaMask
  const connectWallet = async () => {
    if (!isMetaMaskInstalled()) {
      alert('MetaMask is not installed. Please install MetaMask to continue.');
      return;
    }

    try {
      setIsConnecting(true);
      
      // Create provider and signer
      const web3Provider = new ethers.providers.Web3Provider(window.ethereum);
      const web3Signer = web3Provider.getSigner();
      
      // Get network info
      const networkInfo = await web3Provider.getNetwork();
      setNetwork(networkInfo);
      
      // Request account access
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });

      if (accounts.length > 0) {
        const address = accounts[0];
        const role = determineUserRole(address);
        
        setAccount(address);
        setIsConnected(true);
        setUserRole(role);
        setProvider(web3Provider);
        setSigner(web3Signer);
        
        // Initialize contract service
        try {
          await contractService.initialize(web3Provider, web3Signer);
          setContractsInitialized(true);
          console.log('Contract service initialized successfully');
        } catch (contractError) {
          console.error('Failed to initialize contract service:', contractError);
          // Continue without contract service for now
        }
        
        return { address, role };
      }
    } catch (error) {
      console.error('Error connecting to MetaMask:', error);
      alert('Failed to connect to MetaMask. Please try again.');
      throw error;
    } finally {
      setIsConnecting(false);
    }
  };

  // Disconnect wallet
  const disconnectWallet = () => {
    setAccount(null);
    setIsConnected(false);
    setUserRole(null);
    setProvider(null);
    setSigner(null);
    setNetwork(null);
    setContractsInitialized(false);
  };

  // Format address for display
  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  // Check if user can access a specific role
  const canAccessRole = (requiredRole) => {
    return userRole === requiredRole;
  };

  // Listen for account changes
  useEffect(() => {
    if (typeof window !== 'undefined' && window.ethereum) {
      const handleAccountsChanged = (accounts) => {
        if (accounts.length === 0) {
          // User disconnected
          setAccount(null);
          setIsConnected(false);
          setUserRole(null);
        } else {
          // User switched accounts
          const address = accounts[0];
          const role = determineUserRole(address);
          setAccount(address);
          setIsConnected(true);
          setUserRole(role);
        }
      };

      const handleChainChanged = () => {
        // Reload the page when chain changes
        window.location.reload();
      };

      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);

      // Check if already connected
      window.ethereum.request({ method: 'eth_accounts' })
        .then((accounts) => {
          if (accounts.length > 0) {
            const address = accounts[0];
            const role = determineUserRole(address);
            setAccount(address);
            setIsConnected(true);
            setUserRole(role);
          }
        })
        .catch(console.error);

      return () => {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      };
    }
  }, []);

  const value = {
    account,
    isConnected,
    isConnecting,
    userRole,
    provider,
    signer,
    network,
    contractsInitialized,
    connectWallet,
    disconnectWallet,
    formatAddress,
    isMetaMaskInstalled,
    canAccessRole,
    contractService
  };

  return (
    <Web3Context.Provider value={value}>
      {children}
    </Web3Context.Provider>
  );
}; 