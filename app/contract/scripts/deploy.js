const { ethers } = require("hardhat");

async function main() {
    console.log("Starting Culture Drops NFT deployment...");

    // Get the contract factory
    const CultureDropsNFT = await ethers.getContractFactory("CultureDropsNFT");

    // Contract parameters
    const name = "Culture Drops";
    const symbol = "CULTURE";
    const baseTokenURI = "https://api.culturedrops.app/metadata/";
    const platformFeeRecipient = "0x0000000000000000000000000000000000000000"; // Update with actual address

    console.log("Deploying Culture Drops NFT...");
    console.log("Name:", name);
    console.log("Symbol:", symbol);
    console.log("Base URI:", baseTokenURI);
    console.log("Platform Fee Recipient:", platformFeeRecipient);

    // Deploy the contract
    const cultureDropsNFT = await CultureDropsNFT.deploy(
        name,
        symbol,
        baseTokenURI,
        platformFeeRecipient
    );

    await cultureDropsNFT.waitForDeployment();

    const contractAddress = await cultureDropsNFT.getAddress();
    console.log("Culture Drops NFT deployed to:", contractAddress);

    // Verify deployment
    console.log("Verifying deployment...");
    const totalSupply = await cultureDropsNFT.totalSupply();
    console.log("Initial total supply:", totalSupply.toString());

    // Get network info
    const network = await ethers.provider.getNetwork();
    console.log("Deployed on network:", network.name, "Chain ID:", network.chainId);

    // Save deployment info
    const deploymentInfo = {
        contractAddress: contractAddress,
        network: network.name,
        chainId: network.chainId.toString(),
        deployer: (await ethers.getSigners())[0].address,
        timestamp: new Date().toISOString(),
        contractName: "CultureDropsNFT",
        constructorArgs: {
            name: name,
            symbol: symbol,
            baseTokenURI: baseTokenURI,
            platformFeeRecipient: platformFeeRecipient
        }
    };

    console.log("\n=== Deployment Summary ===");
    console.log(JSON.stringify(deploymentInfo, null, 2));

    // Instructions for verification
    console.log("\n=== Next Steps ===");
    console.log("1. Update platformFeeRecipient with actual address:");
    console.log(`   await cultureDropsNFT.updatePlatformFeeRecipient("0x5Dc29E2Fd687547048D9A5466513f8269e85b777");`);
    console.log("\n2. Verify contract on BaseScan:");
    console.log(`   npx hardhat verify --network ${network.name} ${contractAddress} "${name}" "${symbol}" "${baseTokenURI}" "${platformFeeRecipient}"`);

    console.log("\n3. Test basic functionality:");
    console.log(`   - Check total supply: ${totalSupply}`);
    console.log(`   - Contract owner: ${await cultureDropsNFT.owner()}`);
    console.log(`   - Platform fee recipient: ${await cultureDropsNFT.platformFeeRecipient()}`);

    return deploymentInfo;
}

// Execute deployment
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("Deployment failed:", error);
        process.exit(1);
    });
