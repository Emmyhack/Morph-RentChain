const { ethers } = require("hardhat");
const { networks, getProvider } = require("../config/networks");

async function main() {
    console.log("Starting RentChain deployment...");

    // Get deployer account
    const [deployer] = await ethers.getSigners();
    console.log("Deploying contracts with account:", deployer.address);
    console.log("Account balance:", (await ethers.provider.getBalance(deployer.address)).toString());

    // Get network info
    const network = await ethers.provider.getNetwork();
    console.log("Network:", network.name, "Chain ID:", network.chainId);

    // USDT token address on Morph (replace with actual address)
    const USDT_ADDRESS = process.env.USDT_ADDRESS || "0x176211869cA2b568f2A7D4EE941E073a821EE1ff"; // Example address

    console.log("USDT Address:", USDT_ADDRESS);

    // Deploy Escrow contract
    console.log("\nDeploying Escrow contract...");
    const Escrow = await ethers.getContractFactory("Escrow");
    const escrow = await Escrow.deploy(USDT_ADDRESS);
    await escrow.waitForDeployment();
    const escrowAddress = await escrow.getAddress();
    console.log("Escrow deployed to:", escrowAddress);

    // Deploy Listings contract
    console.log("\nDeploying Listings contract...");
    const Listings = await ethers.getContractFactory("Listings");
    const listings = await Listings.deploy();
    await listings.waitForDeployment();
    const listingsAddress = await listings.getAddress();
    console.log("Listings deployed to:", listingsAddress);

    // Deploy Complaints contract
    console.log("\nDeploying Complaints contract...");
    const Complaints = await ethers.getContractFactory("Complaints");
    const complaints = await Complaints.deploy();
    await complaints.waitForDeployment();
    const complaintsAddress = await complaints.getAddress();
    console.log("Complaints deployed to:", complaintsAddress);

    // Deploy Reports contract
    console.log("\nDeploying Reports contract...");
    const Reports = await ethers.getContractFactory("Reports");
    const reports = await Reports.deploy();
    await reports.waitForDeployment();
    const reportsAddress = await reports.getAddress();
    console.log("Reports deployed to:", reportsAddress);

    // Deploy CreditScore contract
    console.log("\nDeploying CreditScore contract...");
    const CreditScore = await ethers.getContractFactory("CreditScore");
    const creditScore = await CreditScore.deploy();
    await creditScore.waitForDeployment();
    const creditScoreAddress = await creditScore.getAddress();
    console.log("CreditScore deployed to:", creditScoreAddress);

    // Deploy Reminders contract
    console.log("\nDeploying Reminders contract...");
    const Reminders = await ethers.getContractFactory("Reminders");
    const reminders = await Reminders.deploy();
    await reminders.waitForDeployment();
    const remindersAddress = await reminders.getAddress();
    console.log("Reminders deployed to:", remindersAddress);

    // Deploy Chat contract
    console.log("\nDeploying Chat contract...");
    const Chat = await ethers.getContractFactory("Chat");
    const chat = await Chat.deploy();
    await chat.waitForDeployment();
    const chatAddress = await chat.getAddress();
    console.log("Chat deployed to:", chatAddress);

    // Deploy OnRamp contract
    console.log("\nDeploying OnRamp contract...");
    const OnRamp = await ethers.getContractFactory("OnRamp");
    const onRamp = await OnRamp.deploy();
    await onRamp.waitForDeployment();
    const onRampAddress = await onRamp.getAddress();
    console.log("OnRamp deployed to:", onRampAddress);

    // Deploy Language contract
    console.log("\nDeploying Language contract...");
    const Language = await ethers.getContractFactory("Language");
    const language = await Language.deploy();
    await language.waitForDeployment();
    const languageAddress = await language.getAddress();
    console.log("Language deployed to:", languageAddress);

    // Deploy main RentChain contract
    console.log("\nDeploying main RentChain contract...");
    const RentChain = await ethers.getContractFactory("RentChain");
    const rentChain = await RentChain.deploy(
        escrowAddress,
        listingsAddress,
        complaintsAddress,
        reportsAddress,
        creditScoreAddress,
        remindersAddress,
        chatAddress,
        onRampAddress,
        languageAddress
    );
    await rentChain.waitForDeployment();
    const rentChainAddress = await rentChain.getAddress();
    console.log("RentChain deployed to:", rentChainAddress);

    // Set up contract relationships
    console.log("\nSetting up contract relationships...");

    // Set property landlords in Complaints contract
    console.log("Setting up Complaints contract relationships...");
    await complaints.setPropertyLandlord(1, deployer.address); // Example property

    // Set property landlords in Reports contract
    console.log("Setting up Reports contract relationships...");
    await reports.setPropertyLandlord(1, deployer.address); // Example property

    // Set authorized contracts in CreditScore contract
    console.log("Setting up CreditScore contract relationships...");
    await creditScore.setAuthorizedContract(complaintsAddress, true);
    await creditScore.setAuthorizedContract(reportsAddress, true);

    // Set authorized contracts in OnRamp contract
    console.log("Setting up OnRamp contract relationships...");
    await onRamp.setAuthorizedContract(escrowAddress, true);

    // Update keeper registry in Reminders contract
    console.log("Setting up Reminders contract relationships...");
    const KEEPER_REGISTRY = process.env.KEEPER_REGISTRY || "0x0000000000000000000000000000000000000000"; // Replace with actual address
    await reminders.updateKeeperRegistry(KEEPER_REGISTRY);

    console.log("\n=== Deployment Summary ===");
    console.log("Network:", network.name);
    console.log("Chain ID:", network.chainId);
    console.log("Deployer:", deployer.address);
    console.log("USDT Address:", USDT_ADDRESS);
    console.log("Keeper Registry:", KEEPER_REGISTRY);
    console.log("\nContract Addresses:");
    console.log("RentChain:", rentChainAddress);
    console.log("Escrow:", escrowAddress);
    console.log("Listings:", listingsAddress);
    console.log("Complaints:", complaintsAddress);
    console.log("Reports:", reportsAddress);
    console.log("CreditScore:", creditScoreAddress);
    console.log("Reminders:", remindersAddress);
    console.log("Chat:", chatAddress);
    console.log("OnRamp:", onRampAddress);
    console.log("Language:", languageAddress);

    // Save deployment info
    const deploymentInfo = {
        network: network.name,
        chainId: network.chainId,
        deployer: deployer.address,
        usdtAddress: USDT_ADDRESS,
        keeperRegistry: KEEPER_REGISTRY,
        contracts: {
            rentChain: rentChainAddress,
            escrow: escrowAddress,
            listings: listingsAddress,
            complaints: complaintsAddress,
            reports: reportsAddress,
            creditScore: creditScoreAddress,
            reminders: remindersAddress,
            chat: chatAddress,
            onRamp: onRampAddress,
            language: languageAddress
        },
        timestamp: new Date().toISOString()
    };

    // Write deployment info to file
    const fs = require("fs");
    const deploymentPath = `./deployments/${network.name}.json`;
    
    // Create deployments directory if it doesn't exist
    if (!fs.existsSync("./deployments")) {
        fs.mkdirSync("./deployments");
    }
    
    fs.writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2));
    console.log(`\nDeployment info saved to: ${deploymentPath}`);

    console.log("\n=== Next Steps ===");
    console.log("1. Verify contracts on MorphScan");
    console.log("2. Set up Chainlink Keepers for Reminders contract");
    console.log("3. Deploy The Graph subgraph");
    console.log("4. Configure IPFS for off-chain data storage");
    console.log("5. Set up Kleros integration for disputes");
    console.log("6. Transfer ownership to DAO when ready");

    console.log("\nDeployment completed successfully!");
}

main().catch((error) => {
    console.error("Deployment failed:", error);
    process.exit(1);
}); 