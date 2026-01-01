import hre from "hardhat";
import fs from "fs";
import path from "path";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * VeriChain Security Contracts Deployment Script
 * Deploys MultiSigAdmin, RateLimiter, and CrossChainReputation
 * 
 * Usage:
 *   npx hardhat run scripts/deploy-security.js --network qieTestnet
 *   npx hardhat run scripts/deploy-security.js --network qieMainnet
 */

async function main() {
  console.log("🔐 Starting VeriChain Security Contracts Deployment...\n");
  
  // Get deployer account
  const [deployer] = await hre.ethers.getSigners();
  console.log("📍 Deploying contracts with account:", deployer.address);
  
  // Check balance
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("💰 Account balance:", hre.ethers.formatEther(balance), "QIE\n");
  
  if (balance === 0n) {
    throw new Error("❌ No balance! Get testnet tokens from https://www.qie.digital/faucet");
  }
  
  // Store deployed addresses
  const deployedAddresses = {};
  
  // ===================================
  // 1. Deploy MultiSigAdmin
  // ===================================
  console.log("📦 Deploying MultiSigAdmin...");
  const MultiSigAdmin = await hre.ethers.getContractFactory("MultiSigAdmin");
  
  // Configure admins (add more addresses for production)
  const admins = [deployer.address];
  const requiredApprovals = 1; // For testing; use 2+ for production
  const timeLockDelay = 3600; // 1 hour
  
  const multiSigAdmin = await MultiSigAdmin.deploy(admins, requiredApprovals, timeLockDelay);
  await multiSigAdmin.waitForDeployment();
  deployedAddresses.MultiSigAdmin = await multiSigAdmin.getAddress();
  console.log("✅ MultiSigAdmin deployed to:", deployedAddresses.MultiSigAdmin);
  
  // ===================================
  // 2. Deploy RateLimiter
  // ===================================
  console.log("\n📦 Deploying RateLimiter...");
  const RateLimiter = await hre.ethers.getContractFactory("RateLimiter");
  const rateLimiter = await RateLimiter.deploy();
  await rateLimiter.waitForDeployment();
  deployedAddresses.RateLimiter = await rateLimiter.getAddress();
  console.log("✅ RateLimiter deployed to:", deployedAddresses.RateLimiter);
  
  // ===================================
  // 3. Deploy CrossChainReputation
  // ===================================
  console.log("\n📦 Deploying CrossChainReputation...");
  const CrossChainReputation = await hre.ethers.getContractFactory("CrossChainReputation");
  const crossChainReputation = await CrossChainReputation.deploy();
  await crossChainReputation.waitForDeployment();
  deployedAddresses.CrossChainReputation = await crossChainReputation.getAddress();
  console.log("✅ CrossChainReputation deployed to:", deployedAddresses.CrossChainReputation);
  
  // ===================================
  // 4. Configure CrossChainReputation
  // ===================================
  console.log("\n⚙️ Configuring CrossChainReputation...");
  
  // Add popular chains for reputation aggregation
  console.log("   Adding Ethereum chain...");
  await crossChainReputation.addChain(1, "Ethereum", 3000); // 30% weight
  
  console.log("   Adding Polygon chain...");
  await crossChainReputation.addChain(137, "Polygon", 2000); // 20% weight
  
  console.log("✅ Cross-chain configuration complete!\n");
  
  // ===================================
  // 5. Save Deployment Info
  // ===================================
  const deploymentInfo = {
    network: hre.network.name,
    chainId: (await hre.ethers.provider.getNetwork()).chainId.toString(),
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    type: "security",
    contracts: deployedAddresses,
    config: {
      multiSig: {
        admins,
        requiredApprovals,
        timeLockDelay
      }
    }
  };
  
  // Save to file
  const deploymentsDir = path.join(__dirname, "../deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }
  
  const filename = `${hre.network.name}-security-${Date.now()}.json`;
  fs.writeFileSync(
    path.join(deploymentsDir, filename),
    JSON.stringify(deploymentInfo, null, 2)
  );
  
  // Also save as latest security
  fs.writeFileSync(
    path.join(deploymentsDir, `${hre.network.name}-security-latest.json`),
    JSON.stringify(deploymentInfo, null, 2)
  );
  
  // ===================================
  // Print Summary
  // ===================================
  console.log("\n" + "=".repeat(60));
  console.log("🔐 SECURITY CONTRACTS DEPLOYMENT COMPLETE!");
  console.log("=".repeat(60));
  console.log("\n📋 Deployed Contracts:\n");
  console.log(`   MultiSigAdmin:         ${deployedAddresses.MultiSigAdmin}`);
  console.log(`   RateLimiter:           ${deployedAddresses.RateLimiter}`);
  console.log(`   CrossChainReputation:  ${deployedAddresses.CrossChainReputation}`);
  console.log("\n📁 Deployment info saved to:", path.join(deploymentsDir, filename));
  console.log("\n🔗 View on Explorer:");
  
  const explorerBase = hre.network.name === "qieMainnet" 
    ? "https://mainnet.qie.digital" 
    : "https://testnet.qie.digital";
  
  console.log(`   ${explorerBase}/address/${deployedAddresses.MultiSigAdmin}`);
  console.log(`   ${explorerBase}/address/${deployedAddresses.RateLimiter}`);
  console.log(`   ${explorerBase}/address/${deployedAddresses.CrossChainReputation}`);
  console.log("\n");
  
  return deployedAddresses;
}

// Run deployment
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
