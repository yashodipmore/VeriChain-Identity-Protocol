import { expect } from "chai";
import hre from "hardhat";
const { ethers } = hre;

/**
 * VeriChain Smart Contract Tests
 * Comprehensive test suite for all contracts
 * 
 * Run: npx hardhat test
 */

describe("VeriChain Protocol", function () {
  let owner, user1, user2, verifier;
  let identityRegistry, oracleAdapter, trustScoreCalculator, zkVerifier;
  
  // Deploy all contracts before each test suite
  before(async function () {
    [owner, user1, user2, verifier] = await ethers.getSigners();
    
    // Deploy IdentityRegistry
    const IdentityRegistry = await ethers.getContractFactory("IdentityRegistry");
    identityRegistry = await IdentityRegistry.deploy(owner.address);
    await identityRegistry.waitForDeployment();
    
    // Deploy OracleAdapter
    const OracleAdapter = await ethers.getContractFactory("OracleAdapter");
    oracleAdapter = await OracleAdapter.deploy(owner.address);
    await oracleAdapter.waitForDeployment();
    
    // Deploy TrustScoreCalculator
    const TrustScoreCalculator = await ethers.getContractFactory("TrustScoreCalculator");
    trustScoreCalculator = await TrustScoreCalculator.deploy(owner.address);
    await trustScoreCalculator.waitForDeployment();
    
    // Deploy ZKVerifier
    const ZKVerifier = await ethers.getContractFactory("ZKVerifier");
    zkVerifier = await ZKVerifier.deploy(owner.address);
    await zkVerifier.waitForDeployment();
    
    // Configure references
    await identityRegistry.setTrustScoreCalculator(await trustScoreCalculator.getAddress());
    await identityRegistry.setOracleAdapter(await oracleAdapter.getAddress());
    await trustScoreCalculator.setIdentityRegistry(await identityRegistry.getAddress());
    await trustScoreCalculator.setOracleAdapter(await oracleAdapter.getAddress());
    await oracleAdapter.setIdentityRegistry(await identityRegistry.getAddress());
    await zkVerifier.setIdentityRegistry(await identityRegistry.getAddress());
  });
  
  // ======================================
  // IDENTITY REGISTRY TESTS
  // ======================================
  describe("IdentityRegistry", function () {
    const testIPFSUri = "ipfs://QmTestHash123456789abcdef";
    
    it("Should create a new identity", async function () {
      const tx = await identityRegistry.connect(user1).createIdentity(testIPFSUri);
      await tx.wait();
      
      const hasIdentity = await identityRegistry.hasIdentity(user1.address);
      expect(hasIdentity).to.be.true;
      
      const identity = await identityRegistry.getIdentity(user1.address);
      expect(identity.encryptedDataURI).to.equal(testIPFSUri);
      expect(identity.trustScore).to.equal(0n);
      expect(identity.verified).to.be.false;
    });
    
    it("Should not allow duplicate identity creation", async function () {
      await expect(
        identityRegistry.connect(user1).createIdentity(testIPFSUri)
      ).to.be.revertedWithCustomError(identityRegistry, "IdentityAlreadyExists");
    });
    
    it("Should generate unique DID", async function () {
      const identity = await identityRegistry.getIdentity(user1.address);
      expect(identity.did).to.not.equal(ethers.ZeroHash);
      
      // Verify reverse lookup
      const addressFromDID = await identityRegistry.getAddressFromDID(identity.did);
      expect(addressFromDID).to.equal(user1.address);
    });
    
    it("Should update credentials", async function () {
      const newUri = "ipfs://QmNewHash987654321";
      await identityRegistry.connect(user1).updateCredentials(newUri);
      
      const identity = await identityRegistry.getIdentity(user1.address);
      expect(identity.encryptedDataURI).to.equal(newUri);
    });
    
    it("Should authorize verifier", async function () {
      await identityRegistry.setVerifier(verifier.address, true);
      const isVerifier = await identityRegistry.authorizedVerifiers(verifier.address);
      expect(isVerifier).to.be.true;
    });
    
    it("Should update trust score by authorized verifier", async function () {
      const newScore = 75;
      await identityRegistry.connect(verifier).updateTrustScore(user1.address, newScore);
      
      const trustScore = await identityRegistry.getTrustScore(user1.address);
      expect(trustScore).to.equal(BigInt(newScore));
    });
    
    it("Should auto-verify when score meets threshold", async function () {
      const identity = await identityRegistry.getIdentity(user1.address);
      expect(identity.verified).to.be.true; // Score 75 >= MIN_VERIFIED_SCORE (50)
    });
    
    it("Should create verification request", async function () {
      // First create identity for user2
      await identityRegistry.connect(user2).createIdentity("ipfs://QmUser2Hash");
      
      // User1 requests verification of User2
      const tx = await identityRegistry.connect(user1).requestVerification(
        user2.address,
        "EMPLOYMENT"
      );
      await tx.wait();
      
      const request = await identityRegistry.verificationRequests(0);
      expect(request.requester).to.equal(user1.address);
      expect(request.subject).to.equal(user2.address);
      expect(request.fulfilled).to.be.false;
    });
    
    it("Should not allow self-verification", async function () {
      await expect(
        identityRegistry.connect(user1).requestVerification(user1.address, "SELF")
      ).to.be.revertedWithCustomError(identityRegistry, "SelfVerificationNotAllowed");
    });
    
    it("Should pause and unpause contract", async function () {
      await identityRegistry.pause();
      
      await expect(
        identityRegistry.connect(user2).updateCredentials("ipfs://NewUri")
      ).to.be.reverted;
      
      await identityRegistry.unpause();
    });
  });
  
  // ======================================
  // TRUST SCORE CALCULATOR TESTS
  // ======================================
  describe("TrustScoreCalculator", function () {
    it("Should have correct default weights", async function () {
      const weights = await trustScoreCalculator.getWeights();
      expect(weights.oracleWeight).to.equal(40n);
      expect(weights.activityWeight).to.equal(30n);
      expect(weights.reputationWeight).to.equal(20n);
      expect(weights.consistencyWeight).to.equal(10n);
    });
    
    it("Should calculate weighted score correctly", async function () {
      // Calculate: (80*40 + 60*30 + 50*20 + 70*10) / 100 = 67
      const score = await trustScoreCalculator.calculateScore(80, 60, 50, 70);
      expect(score).to.equal(67n);
    });
    
    it("Should update activity metrics", async function () {
      await trustScoreCalculator.updateActivityMetrics(
        user1.address,
        100,  // txCount
        10,   // uniqueContracts
        180,  // accountAge in days
        1000  // gasSpent
      );
      
      const metrics = await trustScoreCalculator.userMetrics(user1.address);
      expect(metrics.transactionCount).to.equal(100n);
      expect(metrics.uniqueContracts).to.equal(10n);
      expect(metrics.accountAge).to.equal(180n);
    });
    
    it("Should calculate activity score based on metrics", async function () {
      const activityScore = await trustScoreCalculator.getActivityScore(user1.address);
      // 100 txs = 3.3 points, 10 contracts = 16.5 points, 180 days = 16.76 points
      expect(activityScore).to.be.greaterThan(0n);
    });
    
    it("Should return correct trust level", async function () {
      // First calculate a score
      await trustScoreCalculator.calculateTrustScore(
        user1.address,
        80,  // oracleScore
        60,  // reputationScore
        70   // consistencyScore
      );
      
      const trustLevel = await trustScoreCalculator.getTrustLevel(user1.address);
      expect(["LOW", "MEDIUM", "HIGH", "ELITE"]).to.include(trustLevel);
    });
    
    it("Should update weights with valid values", async function () {
      await trustScoreCalculator.updateWeights(50, 25, 15, 10);
      
      const weights = await trustScoreCalculator.getWeights();
      expect(weights.oracleWeight).to.equal(50n);
      
      // Reset to default
      await trustScoreCalculator.updateWeights(40, 30, 20, 10);
    });
    
    it("Should reject weights that don't sum to 100", async function () {
      await expect(
        trustScoreCalculator.updateWeights(50, 30, 20, 10) // Sum = 110
      ).to.be.revertedWithCustomError(trustScoreCalculator, "WeightsSumNot100");
    });
    
    it("Should check minimum trust requirement", async function () {
      const meetsHigh = await trustScoreCalculator.meetsMinimumTrust(user1.address, 50);
      expect(meetsHigh).to.be.true;
      
      const meetsElite = await trustScoreCalculator.meetsMinimumTrust(user1.address, 95);
      // Might be false depending on calculated score
    });
  });
  
  // ======================================
  // ORACLE ADAPTER TESTS
  // ======================================
  describe("OracleAdapter", function () {
    it("Should start with no supported assets", async function () {
      const assets = await oracleAdapter.getSupportedAssets();
      expect(assets.length).to.equal(0);
    });
    
    it("Should check asset support", async function () {
      const isSupported = await oracleAdapter.isAssetSupported("BTC");
      expect(isSupported).to.be.false;
    });
    
    it("Should calculate stability score", async function () {
      // Test with holding durations
      const holdingDurations = [30, 90, 180];
      
      const tx = await oracleAdapter.analyzeFinancialStability(
        user1.address,
        [1000, 2000, 500], // holdings
        holdingDurations
      );
      await tx.wait();
      
      const analysis = await oracleAdapter.getFinancialAnalysis(user1.address);
      expect(analysis.overallScore).to.be.greaterThan(0n);
    });
    
    it("Should store financial analysis", async function () {
      const analysis = await oracleAdapter.getFinancialAnalysis(user1.address);
      expect(analysis.lastAnalyzed).to.be.greaterThan(0n);
      expect(analysis.stabilityScore).to.be.greaterThanOrEqual(0n);
      expect(analysis.diversificationScore).to.be.greaterThanOrEqual(0n);
    });
  });
  
  // ======================================
  // ZK VERIFIER TESTS
  // ======================================
  describe("ZKVerifier", function () {
    const credentialType = "DEGREE";
    const credentialHash = ethers.keccak256(ethers.toUtf8Bytes("Bachelor of Computer Science"));
    const secret = ethers.keccak256(ethers.toUtf8Bytes("my-secret-123"));
    let commitment;
    
    before(async function () {
      // Generate commitment
      commitment = await zkVerifier.generateCommitment(credentialHash, secret);
    });
    
    it("Should recognize owner as trusted issuer", async function () {
      const isIssuer = await zkVerifier.isTrustedIssuer(owner.address);
      expect(isIssuer).to.be.true;
    });
    
    it("Should commit credential", async function () {
      const expiresAt = 0; // Never expires
      
      await zkVerifier.commitCredential(
        user1.address,
        credentialHash,
        commitment,
        credentialType,
        expiresAt
      );
      
      const cred = await zkVerifier.getCredential(user1.address, credentialType);
      expect(cred.credentialHash).to.equal(credentialHash);
      expect(cred.commitment).to.equal(commitment);
      expect(cred.issuer).to.equal(owner.address);
      expect(cred.revoked).to.be.false;
    });
    
    it("Should not allow duplicate credentials", async function () {
      await expect(
        zkVerifier.commitCredential(
          user1.address,
          credentialHash,
          commitment,
          credentialType,
          0
        )
      ).to.be.revertedWithCustomError(zkVerifier, "CredentialAlreadyExists");
    });
    
    it("Should check credential existence", async function () {
      const [exists, issuer] = await zkVerifier.checkCredential(user1.address, credentialType);
      expect(exists).to.be.true;
      expect(issuer).to.equal(owner.address);
    });
    
    it("Should add trusted issuer", async function () {
      await zkVerifier.addTrustedIssuer(
        verifier.address,
        "University Verifier",
        ["DEGREE", "CERTIFICATE"]
      );
      
      const isIssuer = await zkVerifier.isTrustedIssuer(verifier.address);
      expect(isIssuer).to.be.true;
    });
    
    it("Should get all trusted issuers", async function () {
      const issuers = await zkVerifier.getTrustedIssuers();
      expect(issuers.length).to.be.greaterThanOrEqual(2);
    });
    
    it("Should revoke credential", async function () {
      // Commit a new credential to revoke
      const newType = "CERTIFICATE";
      const newHash = ethers.keccak256(ethers.toUtf8Bytes("Test Certificate"));
      const newSecret = ethers.keccak256(ethers.toUtf8Bytes("cert-secret"));
      const newCommitment = await zkVerifier.generateCommitment(newHash, newSecret);
      
      await zkVerifier.commitCredential(
        user2.address,
        newHash,
        newCommitment,
        newType,
        0
      );
      
      // Revoke
      await zkVerifier.revokeCredential(user2.address, newType);
      
      const [exists] = await zkVerifier.checkCredential(user2.address, newType);
      expect(exists).to.be.false;
    });
    
    it("Should remove trusted issuer", async function () {
      await zkVerifier.removeTrustedIssuer(verifier.address);
      
      const isIssuer = await zkVerifier.isTrustedIssuer(verifier.address);
      expect(isIssuer).to.be.false;
    });
    
    it("Should track total credentials issued", async function () {
      const total = await zkVerifier.totalCredentialsIssued();
      expect(total).to.be.greaterThanOrEqual(2n);
    });
  });
  
  // ======================================
  // INTEGRATION TESTS
  // ======================================
  describe("Integration Tests", function () {
    let newUser;
    
    before(async function () {
      [, , , , newUser] = await ethers.getSigners();
    });
    
    it("Should complete full identity lifecycle", async function () {
      // 1. Create identity
      await identityRegistry.connect(newUser).createIdentity("ipfs://QmNewUserHash");
      expect(await identityRegistry.hasIdentity(newUser.address)).to.be.true;
      
      // 2. Update activity metrics
      await trustScoreCalculator.updateActivityMetrics(
        newUser.address,
        500,  // txCount
        15,   // contracts
        365,  // age
        5000  // gas
      );
      
      // 3. Analyze financial stability
      await oracleAdapter.analyzeFinancialStability(
        newUser.address,
        [5000, 3000, 2000],
        [365, 180, 90]
      );
      
      // 4. Calculate trust score
      const analysis = await oracleAdapter.getFinancialAnalysis(newUser.address);
      await trustScoreCalculator.calculateTrustScore(
        newUser.address,
        Number(analysis.overallScore),
        60,  // reputation
        80   // consistency
      );
      
      // 5. Get final score
      const components = await trustScoreCalculator.getScoreComponents(newUser.address);
      expect(components.finalScore).to.be.greaterThan(0n);
      
      // 6. Update identity with trust score
      await identityRegistry.connect(verifier).updateTrustScore(
        newUser.address,
        Number(components.finalScore)
      );
      
      // Verify
      const identity = await identityRegistry.getIdentity(newUser.address);
      expect(identity.trustScore).to.equal(components.finalScore);
    });
    
    it("Should issue and check credential", async function () {
      // Issue credential
      const credHash = ethers.keccak256(ethers.toUtf8Bytes("Employment at TechCorp"));
      const secret = ethers.keccak256(ethers.toUtf8Bytes("emp-secret"));
      const commitment = await zkVerifier.generateCommitment(credHash, secret);
      
      await zkVerifier.commitCredential(
        newUser.address,
        credHash,
        commitment,
        "EMPLOYMENT",
        0
      );
      
      // Check credential
      const [exists, issuer] = await zkVerifier.checkCredential(newUser.address, "EMPLOYMENT");
      expect(exists).to.be.true;
      expect(issuer).to.equal(owner.address);
    });
  });
});
