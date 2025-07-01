const { ethers } = require('ethers');

// Network configurations
const networks = {
  morphl2: {
    name: 'Morph L2',
    chainId: 2718,
    rpcUrl: 'https://rpc-quicknode.morphl2.io',
    explorer: 'https://explorer.morphl2.io',
    gasPrice: ethers.parseUnits('1', 'gwei'), // 1 gwei
    nativeCurrency: {
      name: 'ETH',
      symbol: 'ETH',
      decimals: 18
    }
  },
  morphTestnet: {
    name: 'Morph Testnet',
    chainId: 2710,
    rpcUrl: 'https://rpc-testnet.morphl2.io',
    explorer: 'https://explorer-testnet.morphl2.io',
    gasPrice: ethers.parseUnits('1', 'gwei'), // 1 gwei
    nativeCurrency: {
      name: 'ETH',
      symbol: 'ETH',
      decimals: 18
    }
  }
};

// Provider factory function
function getProvider(networkName) {
  const network = networks[networkName];
  if (!network) {
    throw new Error(`Network ${networkName} not found`);
  }
  
  return new ethers.JsonRpcProvider(network.rpcUrl);
}

// Wallet factory function
function getWallet(privateKey, networkName) {
  const provider = getProvider(networkName);
  return new ethers.Wallet(privateKey, provider);
}

// Contract factory function
function getContract(address, abi, signer) {
  return new ethers.Contract(address, abi, signer);
}

module.exports = {
  networks,
  getProvider,
  getWallet,
  getContract
}; 