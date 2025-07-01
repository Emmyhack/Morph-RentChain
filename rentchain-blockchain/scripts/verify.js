const { ethers } = require("hardhat");
const fs = require("fs");

async function main() {
    console.log("Starting contract verification...");

    // Get network info
    const network = await ethers.provider.getNetwork();
    console.log("Network:", network.name, "Chain ID:", network.chainId);

    // Load deployment info
    const deploymentPath = `./deployments/${network.name}.json`;
    if (!fs.existsSync(deploymentPath)) {
        console.error(`Deployment file not found: ${deploymentPath}`);
        console.log("Please deploy contracts first using: npm run deploy:morphTestnet");
        return;
    }

    const deploymentInfo = JSON.parse(fs.readFileSync(deploymentPath, 'utf8'));
    console.log("Loaded deployment info from:", deploymentPath);

    // USDT address for Escrow contract verification
    const USDT_ADDRESS = deploymentInfo.usdtAddress;

    try {
        // Verify Escrow contract
        console.log("\n1. Verifying Escrow contract...");
        await hre.run("verify:verify", {
            address: deploymentInfo.contracts.escrow,
            constructorArguments: [USDT_ADDRESS],
            network: network.name
        });
        console.log("✅ Escrow contract verified");

        // Verify Listings contract
        console.log("\n2. Verifying Listings contract...");
        await hre.run("verify:verify", {
            address: deploymentInfo.contracts.listings,
            constructorArguments: [],
            network: network.name
        });
        console.log("✅ Listings contract verified");

        // Verify Complaints contract
        console.log("\n3. Verifying Complaints contract...");
        await hre.run("verify:verify", {
            address: deploymentInfo.contracts.complaints,
            constructorArguments: [],
            network: network.name
        });
        console.log("✅ Complaints contract verified");

        // Verify Reports contract
        console.log("\n4. Verifying Reports contract...");
        await hre.run("verify:verify", {
            address: deploymentInfo.contracts.reports,
            constructorArguments: [],
            network: network.name
        });
        console.log("✅ Reports contract verified");

        // Verify CreditScore contract
        console.log("\n5. Verifying CreditScore contract...");
        await hre.run("verify:verify", {
            address: deploymentInfo.contracts.creditScore,
            constructorArguments: [],
            network: network.name
        });
        console.log("✅ CreditScore contract verified");

        // Verify Reminders contract
        console.log("\n6. Verifying Reminders contract...");
        await hre.run("verify:verify", {
            address: deploymentInfo.contracts.reminders,
            constructorArguments: [],
            network: network.name
        });
        console.log("✅ Reminders contract verified");

        // Verify Chat contract
        console.log("\n7. Verifying Chat contract...");
        await hre.run("verify:verify", {
            address: deploymentInfo.contracts.chat,
            constructorArguments: [],
            network: network.name
        });
        console.log("✅ Chat contract verified");

        // Verify OnRamp contract
        console.log("\n8. Verifying OnRamp contract...");
        await hre.run("verify:verify", {
            address: deploymentInfo.contracts.onRamp,
            constructorArguments: [],
            network: network.name
        });
        console.log("✅ OnRamp contract verified");

        // Verify Language contract
        console.log("\n9. Verifying Language contract...");
        await hre.run("verify:verify", {
            address: deploymentInfo.contracts.language,
            constructorArguments: [],
            network: network.name
        });
        console.log("✅ Language contract verified");

        // Verify main RentChain contract
        console.log("\n10. Verifying main RentChain contract...");
        await hre.run("verify:verify", {
            address: deploymentInfo.contracts.rentChain,
            constructorArguments: [
                deploymentInfo.contracts.escrow,
                deploymentInfo.contracts.listings,
                deploymentInfo.contracts.complaints,
                deploymentInfo.contracts.reports,
                deploymentInfo.contracts.creditScore,
                deploymentInfo.contracts.reminders,
                deploymentInfo.contracts.chat,
                deploymentInfo.contracts.onRamp,
                deploymentInfo.contracts.language
            ],
            network: network.name
        });
        console.log("✅ RentChain contract verified");

        console.log("\n=== Verification Summary ===");
        console.log("Network:", network.name);
        console.log("All contracts verified successfully!");
        console.log("\nContract Addresses:");
        Object.entries(deploymentInfo.contracts).forEach(([name, address]) => {
            console.log(`${name}: ${address}`);
        });

        // Generate verification links
        const explorerBase = network.chainId === 2710 
            ? "https://explorer-holesky.morphl2.io" 
            : "https://explorer.morphl2.io";
        
        console.log("\n=== Verification Links ===");
        Object.entries(deploymentInfo.contracts).forEach(([name, address]) => {
            console.log(`${name}: ${explorerBase}/address/${address}`);
        });

    } catch (error) {
        console.error("Verification failed:", error.message);
        
        if (error.message.includes("Already Verified")) {
            console.log("✅ Contract is already verified");
        } else {
            console.log("❌ Verification failed. Please check the error above.");
        }
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("Verification script failed:", error);
        process.exit(1);
    }); 