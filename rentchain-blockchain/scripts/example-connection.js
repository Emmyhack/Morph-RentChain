const { ethers } = require('ethers');
const { getProvider, getWallet, networks } = require('../config/networks');

async function main() {
    console.log('=== RentChain Morph L2 Connection Example ===\n');

    // Example 1: Basic provider connection
    console.log('1. Basic Provider Connection:');
    try {
        const provider = getProvider('morphl2');
        const network = await provider.getNetwork();
        console.log(`   Connected to: ${network.name} (Chain ID: ${network.chainId})`);
        console.log(`   RPC URL: ${networks.morphl2.rpcUrl}`);
        
        // Get latest block
        const latestBlock = await provider.getBlockNumber();
        console.log(`   Latest block: ${latestBlock}`);
    } catch (error) {
        console.error('   Error connecting to provider:', error.message);
    }

    // Example 2: Wallet connection (if private key is provided)
    console.log('\n2. Wallet Connection:');
    const privateKey = process.env.PRIVATE_KEY;
    if (privateKey) {
        try {
            const wallet = getWallet(privateKey, 'morphl2');
            console.log(`   Wallet address: ${wallet.address}`);
            
            const balance = await wallet.getBalance();
            console.log(`   Balance: ${ethers.formatEther(balance)} ETH`);
        } catch (error) {
            console.error('   Error connecting wallet:', error.message);
        }
    } else {
        console.log('   No private key provided (set PRIVATE_KEY environment variable)');
    }

    // Example 3: Contract interaction (if deployed contracts exist)
    console.log('\n3. Contract Interaction Example:');
    try {
        const provider = getProvider('morphl2');
        
        // Example USDC contract address (replace with actual)
        const usdcAddress = process.env.USDC_ADDRESS || '0x176211869cA2b568f2A7D4EE941E073a821EE1ff';
        
        // USDC ABI (minimal for balance check)
        const usdcAbi = [
            'function balanceOf(address owner) view returns (uint256)',
            'function decimals() view returns (uint8)',
            'function symbol() view returns (string)'
        ];
        
        const usdcContract = new ethers.Contract(usdcAddress, usdcAbi, provider);
        
        // Get USDC info
        const symbol = await usdcContract.symbol();
        const decimals = await usdcContract.decimals();
        console.log(`   USDC Contract: ${usdcAddress}`);
        console.log(`   Symbol: ${symbol}`);
        console.log(`   Decimals: ${decimals}`);
        
        // Check balance of deployer address (if available)
        if (privateKey) {
            const wallet = getWallet(privateKey, 'morphl2');
            const balance = await usdcContract.balanceOf(wallet.address);
            console.log(`   USDC Balance: ${ethers.formatUnits(balance, decimals)} ${symbol}`);
        }
    } catch (error) {
        console.error('   Error interacting with contract:', error.message);
    }

    // Example 4: Network information
    console.log('\n4. Network Information:');
    console.log(`   Morph L2 Chain ID: ${networks.morphl2.chainId}`);
    console.log(`   Gas Price: ${ethers.formatUnits(networks.morphl2.gasPrice, 'gwei')} gwei`);
    console.log(`   Explorer: ${networks.morphl2.explorer}`);
    console.log(`   Native Currency: ${networks.morphl2.nativeCurrency.symbol}`);

    // Example 5: Environment setup instructions
    console.log('\n5. Environment Setup:');
    console.log('   To use this script, set the following environment variables:');
    console.log('   export PRIVATE_KEY=your_private_key_here');
    console.log('   export USDC_ADDRESS=actual_usdc_contract_address');
    console.log('   export MORPHSCAN_API_KEY=your_morphscan_api_key');

    console.log('\n=== Connection Example Complete ===');
}

// Helper function to check if running in browser
function isBrowser() {
    return typeof window !== 'undefined';
}

// Browser-compatible version
if (isBrowser()) {
    // For browser usage, you would import ethers differently
    console.log('Browser environment detected');
    console.log('Use: import { ethers } from "ethers";');
    console.log('And: const provider = new ethers.JsonRpcProvider("https://rpc-quicknode.morphl2.io");');
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error('Script failed:', error);
        process.exit(1);
    }); 