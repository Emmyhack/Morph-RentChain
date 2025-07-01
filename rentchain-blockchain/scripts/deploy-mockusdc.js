// scripts/deploy-mockusdt.js
// Deploys the MockUSDT contract for local/test environments

const { ethers } = require("hardhat");

async function main() {
    // 1,000,000 USDT (6 decimals)
    const initialSupply = ethers.parseUnits("1000000", 6);

    const [deployer] = await ethers.getSigners();
    console.log("Deploying MockUSDT with account:", deployer.address);

    const MockUSDT = await ethers.getContractFactory("MockUSDT");
    const mockUSDT = await MockUSDT.deploy(initialSupply);
    await mockUSDT.waitForDeployment();

    console.log("MockUSDT deployed to:", await mockUSDT.getAddress());
    console.log("Deployer (owner):", deployer.address);
    console.log("Total supply:", (await mockUSDT.totalSupply()).toString());
    console.log("Decimals:", await mockUSDT.decimals());
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
}); 