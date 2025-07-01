const { ethers } = require("hardhat");

async function main() {
    console.log("🔍 Checking RentChain installation...\n");

    try {
        // Check ethers version
        console.log("1. Checking ethers version...");
        const ethersVersion = require("ethers/package.json").version;
        console.log(`   ✅ Ethers version: ${ethersVersion}`);
        
        if (ethersVersion.startsWith("6.")) {
            console.log("   ✅ Using ethers v6 (compatible)");
        } else {
            console.log("   ⚠️  Warning: Expected ethers v6, found v" + ethersVersion.split(".")[0]);
        }

        // Check hardhat version
        console.log("\n2. Checking Hardhat version...");
        const hardhatVersion = require("hardhat/package.json").version;
        console.log(`   ✅ Hardhat version: ${hardhatVersion}`);
        
        if (parseInt(hardhatVersion.split(".")[0]) >= 2) {
            console.log("   ✅ Using Hardhat v2+ (compatible)");
        } else {
            console.log("   ⚠️  Warning: Expected Hardhat v2+, found v" + hardhatVersion.split(".")[0]);
        }

        // Check OpenZeppelin contracts version
        console.log("\n3. Checking OpenZeppelin contracts...");
        const ozVersion = require("@openzeppelin/contracts/package.json").version;
        console.log(`   ✅ OpenZeppelin contracts version: ${ozVersion}`);
        
        if (parseInt(ozVersion.split(".")[0]) >= 5) {
            console.log("   ✅ Using OpenZeppelin v5+ (compatible)");
        } else {
            console.log("   ⚠️  Warning: Expected OpenZeppelin v5+, found v" + ozVersion.split(".")[0]);
        }

        // Check Chainlink contracts version
        console.log("\n4. Checking Chainlink contracts...");
        const chainlinkVersion = require("@chainlink/contracts/package.json").version;
        console.log(`   ✅ Chainlink contracts version: ${chainlinkVersion}`);
        
        if (parseInt(chainlinkVersion.split(".")[0]) >= 1) {
            console.log("   ✅ Using Chainlink v1+ (compatible)");
        } else {
            console.log("   ⚠️  Warning: Expected Chainlink v1+, found v" + chainlinkVersion.split(".")[0]);
        }

        // Test ethers functionality
        console.log("\n5. Testing ethers functionality...");
        const provider = new ethers.JsonRpcProvider("https://rpc-testnet.morphl2.io");
        const network = await provider.getNetwork();
        console.log(`   ✅ Connected to network: ${network.name} (Chain ID: ${network.chainId})`);
        
        if (network.chainId === 2710n || network.chainId === 2718n) {
            console.log("   ✅ Connected to Morph L2 network");
        } else {
            console.log("   ⚠️  Warning: Connected to unexpected network");
        }

        // Check environment variables
        console.log("\n6. Checking environment variables...");
        const requiredVars = ["PRIVATE_KEY", "USDC_ADDRESS"];
        const optionalVars = ["MORPHSCAN_API_KEY", "KEEPER_REGISTRY", "REPORT_GAS"];
        
        let envOk = true;
        requiredVars.forEach(varName => {
            if (process.env[varName]) {
                console.log(`   ✅ ${varName}: Set`);
            } else {
                console.log(`   ❌ ${varName}: Not set (required)`);
                envOk = false;
            }
        });
        
        optionalVars.forEach(varName => {
            if (process.env[varName]) {
                console.log(`   ✅ ${varName}: Set`);
            } else {
                console.log(`   ⚪ ${varName}: Not set (optional)`);
            }
        });

        // Test contract compilation
        console.log("\n7. Testing contract compilation...");
        try {
            await hre.run("compile");
            console.log("   ✅ Contracts compiled successfully");
        } catch (error) {
            console.log("   ❌ Contract compilation failed:", error.message);
        }

        console.log("\n=== Installation Check Complete ===");
        
        if (envOk) {
            console.log("✅ All checks passed! You're ready to deploy.");
            console.log("\nNext steps:");
            console.log("1. npm run deploy:morphTestnet");
            console.log("2. npx hardhat run scripts/verify.js --network morphTestnet");
        } else {
            console.log("⚠️  Some issues found. Please check the warnings above.");
            console.log("\nTo fix:");
            console.log("1. Set required environment variables in .env file");
            console.log("2. Run: cp .env.example .env");
            console.log("3. Edit .env with your values");
        }

    } catch (error) {
        console.error("❌ Installation check failed:", error.message);
        console.log("\nTroubleshooting:");
        console.log("1. Run: npm install");
        console.log("2. Check Node.js version (requires 18+)");
        console.log("3. Clear node_modules and reinstall if needed");
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("Script failed:", error);
        process.exit(1);
    }); 