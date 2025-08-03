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
  const [registeredWallets, setRegisteredWallets] = useState({}); // Track wallet registrations

  // Check if MetaMask is installed
  const isMetaMaskInstalled = () => {
    return typeof window !== 'undefined' && window.ethereum && window.ethereum.isMetaMask;
  };

  // Register wallet to a specific role
  const registerWallet = (walletAddress, role) => {
    const savedRegistrations = JSON.parse(localStorage.getItem('registeredWallets') || '{}');
    savedRegistrations[walletAddress.toLowerCase()] = role;
    localStorage.setItem('registeredWallets', JSON.stringify(savedRegistrations));
    setRegisteredWallets(savedRegistrations);
    setUserRole(role);
  };

  // Get wallet registration
  const getWalletRole = (walletAddress) => {
    if (!walletAddress) return null;
    const savedRegistrations = JSON.parse(localStorage.getItem('registeredWallets') || '{}');
    return savedRegistrations[walletAddress.toLowerCase()] || null;
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
      const web3Provider = new ethers.BrowserProvider(window.ethereum);
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
        const savedRole = getWalletRole(address);
        
        setAccount(address);
        setIsConnected(true);
        setUserRole(savedRole);
        setProvider(web3Provider);
        setSigner(web3Signer);
        
        // Load saved registrations
        const savedRegistrations = JSON.parse(localStorage.getItem('registeredWallets') || '{}');
        setRegisteredWallets(savedRegistrations);
        
        // Initialize contract service
        try {
          await contractService.initialize(web3Provider, web3Signer);
          setContractsInitialized(true);
          console.log('Contract service initialized successfully');
        } catch (contractError) {
          console.error('Failed to initialize contract service:', contractError);
          // Continue without contract service for now
        }
        
        return { address, role: savedRole };
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

  // Check if user can access a specific role (now always true for connected wallets)
  const canAccessRole = (requiredRole) => {
    return isConnected; // Any connected wallet can access any role
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
          const savedRole = getWalletRole(address);
          setAccount(address);
          setIsConnected(true);
          setUserRole(savedRole);
          
          // Load saved registrations
          const savedRegistrations = JSON.parse(localStorage.getItem('registeredWallets') || '{}');
          setRegisteredWallets(savedRegistrations);
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
            const savedRole = getWalletRole(address);
            setAccount(address);
            setIsConnected(true);
            setUserRole(savedRole);
            
            // Load saved registrations
            const savedRegistrations = JSON.parse(localStorage.getItem('registeredWallets') || '{}');
            setRegisteredWallets(savedRegistrations);
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
    registeredWallets,
    connectWallet,
    disconnectWallet,
    registerWallet,
    getWalletRole,
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