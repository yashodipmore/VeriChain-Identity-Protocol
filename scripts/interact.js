import hre from "hardhat";
import fs from "fs";
import path from "path";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * VeriChain Contract Interaction Script
 * Test deployed contracts on QIE Blockchain
 * 
 * Usage:
 *   npx hardhat run scripts/interact.js --network qieTestnet
 */

async function main() {
  console.log("🔧 VeriChain Contract Interaction\n");
  
  // Get deployer account
  const [user] = await hre.ethers.getSigners();
  console.log("👤 Using account:", user.address);
  
  // Load deployment info
  const deploymentsDir = path.join(__dirname, "../deployments");
  const latestDeployment = path.join(deploymentsDir, `${hre.network.name}-latest.json`);
  
  if (!fs.existsSync(latestDeployment)) {
    throw new Error("❌ No deployment found! Run deploy.js first.");
  }
  
  const deployment = JSON.parse(fs.readFileSync(latestDeployment, "utf-8"));
  console.log("📋 Loaded deployment from:", deployment.timestamp);
  console.log("\n");
  
  // Get contract instances
  const identityRegistry = await hre.ethers.getContractAt(
    "IdentityRegistry",
    deployment.contracts.IdentityRegistry
  );
  
  const oracleAdapter = await hre.ethers.getContractAt(
    "OracleAdapter",
    deployment.contracts.OracleAdapter
  );
  
  const trustScoreCalculator = await hre.ethers.getContractAt(
    "TrustScoreCalculator",
    deployment.contracts.TrustScoreCalculator
  );
  
  const zkVerifier = await hre.ethers.getContractAt(
    "ZKVerifier",
    deployment.contracts.ZKVerifier
  );
  
  // ===================================
  // Test 1: Create Identity
  // ===================================
  console.log("📝 Test 1: Creating Identity...");
  
  const hasIdentity = await identityRegistry.hasIdentity(user.address);
  
  if (hasIdentity) {
    console.log("   Identity already exists!");
    const identity = await identityRegistry.getIdentity(user.address);
    console.log("   DID:", identity.did);
    console.log("   Trust Score:", identity.trustScore.toString());
    console.log("   Verified:", identity.verified);
  } else {
    const ipfsURI = "ipfs://QmTestHash123456789"; // Placeholder
    const tx = await identityRegistry.createIdentity(ipfsURI);
    await tx.wait();
    
    const identity = await identityRegistry.getIdentity(user.address);
    console.log("   ✅ Identity created!");
    console.log("   DID:", identity.did);
  }
  
  // ===================================
  // Test 2: Check Oracle
  // ===================================
  console.log("\n🔮 Test 2: Checking Oracle Adapter...");
  
  const supportedAssets = await oracleAdapter.getSupportedAssets();
  console.log("   Supported assets:", supportedAssets);
  
  if (supportedAssets.length > 0) {
    try {
      const [price, decimals, timestamp] = await oracleAdapter.getLatestPrice(supportedAssets[0]);
      console.log(`   ${supportedAssets[0]} Price: $${(Number(price) / 10 ** Number(decimals)).toFixed(2)}`);
    } catch (error) {
      console.log("   ⚠️ Could not fetch price:", error.message);
    }
  }
  
  // ===================================
  // Test 3: Trust Score
  // ===================================
  console.log("\n📊 Test 3: Checking Trust Score...");
  
  const scoreComponents = await trustScoreCalculator.getScoreComponents(user.address);
  console.log("   Oracle Score:", scoreComponents.oracleScore.toString());
  console.log("   Activity Score:", scoreComponents.activityScore.toString());
  console.log("   Reputation Score:", scoreComponents.reputationScore.toString());
  console.log("   Consistency Score:", scoreComponents.consistencyScore.toString());
  console.log("   Final Score:", scoreComponents.finalScore.toString());
  
  const trustLevel = await trustScoreCalculator.getTrustLevel(user.address);
  console.log("   Trust Level:", trustLevel);
  
  // ===================================
  // Test 4: ZK Verifier
  // ===================================
  console.log("\n🔐 Test 4: Checking ZK Verifier...");
  
  const isIssuer = await zkVerifier.isTrustedIssuer(user.address);
  console.log("   Is Trusted Issuer:", isIssuer);
  
  const totalCredentials = await zkVerifier.totalCredentialsIssued();
  console.log("   Total Credentials Issued:", totalCredentials.toString());
  
  const totalVerifications = await zkVerifier.totalVerifications();
  console.log("   Total Verifications:", totalVerifications.toString());
  
  // ===================================
  // Summary
  // ===================================
  console.log("\n" + "=".repeat(60));
  console.log("✅ All contract interactions completed successfully!");
  console.log("=".repeat(60));
  console.log("\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Interaction failed:", error);
    process.exit(1);
  });
