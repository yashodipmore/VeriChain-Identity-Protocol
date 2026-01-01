import hre from "hardhat";
import fs from "fs";
import path from "path";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * VeriChain Deployment Script
 * Deploys all contracts to QIE Blockchain
 * 
 * Usage:
 *   npx hardhat run scripts/deploy.js --network qieTestnet
 *   npx hardhat run scripts/deploy.js --network qieMainnet
 */

async function main() {
  console.log("🚀 Starting VeriChain Deployment...\n");
  
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
  // 1. Deploy IdentityRegistry
  // ===================================
  console.log("📦 Deploying IdentityRegistry...");
  const IdentityRegistry = await hre.ethers.getContractFactory("IdentityRegistry");
  const identityRegistry = await IdentityRegistry.deploy(deployer.address);
  await identityRegistry.waitForDeployment();
  deployedAddresses.IdentityRegistry = await identityRegistry.getAddress();
  console.log("✅ IdentityRegistry deployed to:", deployedAddresses.IdentityRegistry);
  
  // ===================================
  // 2. Deploy OracleAdapter
  // ===================================
  console.log("\n📦 Deploying OracleAdapter...");
  const OracleAdapter = await hre.ethers.getContractFactory("OracleAdapter");
  const oracleAdapter = await OracleAdapter.deploy(deployer.address);
  await oracleAdapter.waitForDeployment();
  deployedAddresses.OracleAdapter = await oracleAdapter.getAddress();
  console.log("✅ OracleAdapter deployed to:", deployedAddresses.OracleAdapter);
  
  // ===================================
  // 3. Deploy TrustScoreCalculator
  // ===================================
  console.log("\n📦 Deploying TrustScoreCalculator...");
  const TrustScoreCalculator = await hre.ethers.getContractFactory("TrustScoreCalculator");
  const trustScoreCalculator = await TrustScoreCalculator.deploy(deployer.address);
  await trustScoreCalculator.waitForDeployment();
  deployedAddresses.TrustScoreCalculator = await trustScoreCalculator.getAddress();
  console.log("✅ TrustScoreCalculator deployed to:", deployedAddresses.TrustScoreCalculator);
  
  // ===================================
  // 4. Deploy ZKVerifier
  // ===================================
  console.log("\n📦 Deploying ZKVerifier...");
  const ZKVerifier = await hre.ethers.getContractFactory("ZKVerifier");
  const zkVerifier = await ZKVerifier.deploy(deployer.address);
  await zkVerifier.waitForDeployment();
  deployedAddresses.ZKVerifier = await zkVerifier.getAddress();
  console.log("✅ ZKVerifier deployed to:", deployedAddresses.ZKVerifier);
  
  // ===================================
  // 5. Configure Contract References
  // ===================================
  console.log("\n⚙️ Configuring contract references...");
  
  // IdentityRegistry configurations
  console.log("   Setting TrustScoreCalculator in IdentityRegistry...");
  await identityRegistry.setTrustScoreCalculator(deployedAddresses.TrustScoreCalculator);
  
  console.log("   Setting OracleAdapter in IdentityRegistry...");
  await identityRegistry.setOracleAdapter(deployedAddresses.OracleAdapter);
  
  // TrustScoreCalculator configurations
  console.log("   Setting IdentityRegistry in TrustScoreCalculator...");
  await trustScoreCalculator.setIdentityRegistry(deployedAddresses.IdentityRegistry);
  
  console.log("   Setting OracleAdapter in TrustScoreCalculator...");
  await trustScoreCalculator.setOracleAdapter(deployedAddresses.OracleAdapter);
  
  // OracleAdapter configurations
  console.log("   Setting IdentityRegistry in OracleAdapter...");
  await oracleAdapter.setIdentityRegistry(deployedAddresses.IdentityRegistry);
  
  // ZKVerifier configurations
  console.log("   Setting IdentityRegistry in ZKVerifier...");
  await zkVerifier.setIdentityRegistry(deployedAddresses.IdentityRegistry);
  
  console.log("✅ All contract references configured!\n");
  
  // ===================================
  // 6. Add QIE Oracle (if on testnet/mainnet)
  // ===================================
  const oracleBTC = process.env.ORACLE_BTC_USD;
  if (oracleBTC && oracleBTC !== "") {
    console.log("🔮 Adding QIE Oracle for BTC/USD...");
    try {
      await oracleAdapter.addOracle("BTC", oracleBTC);
      console.log("✅ BTC/USD Oracle added:", oracleBTC);
    } catch (error) {
      console.log("⚠️ Could not add oracle (might not be available on this network)");
    }
  }
  
  // ===================================
  // 7. Save Deployment Info
  // ===================================
  const deploymentInfo = {
    network: hre.network.name,
    chainId: (await hre.ethers.provider.getNetwork()).chainId.toString(),
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    contracts: deployedAddresses,
  };
  
  // Save to file
  const deploymentsDir = path.join(__dirname, "../deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }
  
  const filename = `${hre.network.name}-${Date.now()}.json`;
  fs.writeFileSync(
    path.join(deploymentsDir, filename),
    JSON.stringify(deploymentInfo, null, 2)
  );
  
  // Also save as latest
  fs.writeFileSync(
    path.join(deploymentsDir, `${hre.network.name}-latest.json`),
    JSON.stringify(deploymentInfo, null, 2)
  );
  
  // ===================================
  // Print Summary
  // ===================================
  console.log("\n" + "=".repeat(60));
  console.log("🎉 DEPLOYMENT COMPLETE!");
  console.log("=".repeat(60));
  console.log("\n📋 Deployed Contracts:\n");
  console.log(`   IdentityRegistry:     ${deployedAddresses.IdentityRegistry}`);
  console.log(`   OracleAdapter:        ${deployedAddresses.OracleAdapter}`);
  console.log(`   TrustScoreCalculator: ${deployedAddresses.TrustScoreCalculator}`);
  console.log(`   ZKVerifier:           ${deployedAddresses.ZKVerifier}`);
  console.log("\n📁 Deployment info saved to:", path.join(deploymentsDir, filename));
  console.log("\n🔗 View on Explorer:");
  
  const explorerBase = hre.network.name === "qieMainnet" 
    ? "https://mainnet.qie.digital" 
    : "https://testnet.qie.digital";
  
  console.log(`   ${explorerBase}/address/${deployedAddresses.IdentityRegistry}`);
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
