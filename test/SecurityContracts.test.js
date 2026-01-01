import { expect } from "chai";
import hre from "hardhat";
const { ethers } = hre;
import { loadFixture, time } from "@nomicfoundation/hardhat-network-helpers";

describe("MultiSigAdmin", function () {
  async function deployMultiSigFixture() {
    const [owner, admin1, admin2, admin3, nonAdmin] = await ethers.getSigners();

    const MultiSigAdmin = await ethers.getContractFactory("MultiSigAdmin");
    const admins = [owner.address, admin1.address, admin2.address];
    const requiredApprovals = 2;
    const timeLockDelay = 3600; // 1 hour

    const multiSig = await MultiSigAdmin.deploy(admins, requiredApprovals, timeLockDelay);

    return { multiSig, owner, admin1, admin2, admin3, nonAdmin, admins, requiredApprovals, timeLockDelay };
  }

  describe("Deployment", function () {
    it("Should set the correct admins", async function () {
      const { multiSig, admins } = await loadFixture(deployMultiSigFixture);
      
      expect(await multiSig.adminCount()).to.equal(3);
      
      for (const admin of admins) {
        expect(await multiSig.isAdmin(admin)).to.be.true;
      }
    });

    it("Should set the correct required approvals", async function () {
      const { multiSig, requiredApprovals } = await loadFixture(deployMultiSigFixture);
      expect(await multiSig.requiredApprovals()).to.equal(requiredApprovals);
    });

    it("Should set the correct time lock delay", async function () {
      const { multiSig, timeLockDelay } = await loadFixture(deployMultiSigFixture);
      const lock = await multiSig.timeLock();
      expect(lock.delay).to.equal(timeLockDelay);
    });

    it("Should reject deployment with no admins", async function () {
      const MultiSigAdmin = await ethers.getContractFactory("MultiSigAdmin");
      await expect(MultiSigAdmin.deploy([], 1, 3600)).to.be.revertedWithCustomError(
        MultiSigAdmin,
        "InvalidAdminCount"
      );
    });

    it("Should reject deployment with invalid required approvals", async function () {
      const [owner] = await ethers.getSigners();
      const MultiSigAdmin = await ethers.getContractFactory("MultiSigAdmin");
      
      // Required approvals greater than admin count
      await expect(MultiSigAdmin.deploy([owner.address], 2, 3600)).to.be.revertedWithCustomError(
        MultiSigAdmin,
        "InvalidRequiredApprovals"
      );
    });
  });

  describe("Proposals", function () {
    it("Should create a proposal", async function () {
      const { multiSig, owner } = await loadFixture(deployMultiSigFixture);
      
      const target = owner.address;
      const data = "0x";
      const value = 0;
      const description = "Test proposal";

      await expect(multiSig.createProposal(target, data, value, description))
        .to.emit(multiSig, "ProposalCreated");

      expect(await multiSig.proposalCount()).to.equal(1);
    });

    it("Should auto-approve for proposer", async function () {
      const { multiSig, owner } = await loadFixture(deployMultiSigFixture);
      
      await multiSig.createProposal(owner.address, "0x", 0, "Test");
      const proposal = await multiSig.getProposal(1);
      
      expect(proposal.approvalCount).to.equal(1);
      expect(await multiSig.hasApproved(1, owner.address)).to.be.true;
    });

    it("Should allow admins to approve proposals", async function () {
      const { multiSig, owner, admin1 } = await loadFixture(deployMultiSigFixture);
      
      await multiSig.createProposal(owner.address, "0x", 0, "Test");
      await expect(multiSig.connect(admin1).approveProposal(1))
        .to.emit(multiSig, "ProposalApproved")
        .withArgs(1, admin1.address);
    });

    it("Should not allow non-admins to create proposals", async function () {
      const { multiSig, owner, nonAdmin } = await loadFixture(deployMultiSigFixture);
      
      await expect(
        multiSig.connect(nonAdmin).createProposal(owner.address, "0x", 0, "Test")
      ).to.be.revertedWithCustomError(multiSig, "NotAdmin");
    });

    it("Should not allow double approval", async function () {
      const { multiSig, owner } = await loadFixture(deployMultiSigFixture);
      
      await multiSig.createProposal(owner.address, "0x", 0, "Test");
      
      await expect(multiSig.approveProposal(1)).to.be.revertedWithCustomError(
        multiSig,
        "AlreadyApproved"
      );
    });
  });

  describe("Execution", function () {
    it("Should execute proposal after time lock and sufficient approvals", async function () {
      const { multiSig, owner, admin1, timeLockDelay } = await loadFixture(deployMultiSigFixture);
      
      // Create and approve proposal
      await multiSig.createProposal(owner.address, "0x", 0, "Test");
      await multiSig.connect(admin1).approveProposal(1);

      // Increase time past the time lock
      await time.increase(timeLockDelay + 1);

      // Execute
      await expect(multiSig.executeProposal(1))
        .to.emit(multiSig, "ProposalExecuted");
    });

    it("Should not execute before time lock", async function () {
      const { multiSig, owner, admin1 } = await loadFixture(deployMultiSigFixture);
      
      await multiSig.createProposal(owner.address, "0x", 0, "Test");
      await multiSig.connect(admin1).approveProposal(1);

      await expect(multiSig.executeProposal(1)).to.be.revertedWithCustomError(
        multiSig,
        "TimeLockNotPassed"
      );
    });

    it("Should not execute without sufficient approvals", async function () {
      const { multiSig, owner, timeLockDelay } = await loadFixture(deployMultiSigFixture);
      
      await multiSig.createProposal(owner.address, "0x", 0, "Test");
      await time.increase(timeLockDelay + 1);

      await expect(multiSig.executeProposal(1)).to.be.revertedWithCustomError(
        multiSig,
        "InsufficientApprovals"
      );
    });
  });

  describe("Pause", function () {
    it("Should allow admin to pause", async function () {
      const { multiSig, owner } = await loadFixture(deployMultiSigFixture);
      
      await expect(multiSig.pause())
        .to.emit(multiSig, "ContractPaused")
        .withArgs(owner.address);
      
      expect(await multiSig.paused()).to.be.true;
    });

    it("Should block proposals when paused", async function () {
      const { multiSig, owner } = await loadFixture(deployMultiSigFixture);
      
      await multiSig.pause();
      
      await expect(
        multiSig.createProposal(owner.address, "0x", 0, "Test")
      ).to.be.revertedWithCustomError(multiSig, "ContractIsPaused");
    });
  });
});

describe("RateLimiter", function () {
  async function deployRateLimiterFixture() {
    const [owner, user1, user2] = await ethers.getSigners();

    const RateLimiter = await ethers.getContractFactory("RateLimiter");
    const rateLimiter = await RateLimiter.deploy();

    return { rateLimiter, owner, user1, user2 };
  }

  describe("Deployment", function () {
    it("Should set default rate limits", async function () {
      const { rateLimiter } = await loadFixture(deployRateLimiterFixture);
      
      // IDENTITY_CREATE = 0
      const limit = await rateLimiter.getRateLimit(0);
      expect(limit.maxRequests).to.equal(1);
      expect(limit.windowDuration).to.equal(86400); // 1 day
    });
  });

  describe("Rate Limiting", function () {
    it("Should allow first request", async function () {
      const { rateLimiter, user1 } = await loadFixture(deployRateLimiterFixture);
      
      // VERIFICATION_REQUEST = 2 (20 per hour)
      const [allowed, remaining] = await rateLimiter.checkRateLimit(user1.address, 2);
      expect(allowed).to.be.true;
      expect(remaining).to.equal(20);
    });

    it("Should record requests", async function () {
      const { rateLimiter, user1 } = await loadFixture(deployRateLimiterFixture);
      
      await rateLimiter.recordRequest(user1.address, 2);
      
      const [allowed, remaining] = await rateLimiter.checkRateLimit(user1.address, 2);
      expect(allowed).to.be.true;
      expect(remaining).to.equal(19);
    });

    it("Should block when limit reached", async function () {
      const { rateLimiter, user1 } = await loadFixture(deployRateLimiterFixture);
      
      // IDENTITY_CREATE = 0 (1 per day)
      await rateLimiter.recordRequest(user1.address, 0);
      
      await expect(rateLimiter.recordRequest(user1.address, 0))
        .to.be.revertedWithCustomError(rateLimiter, "RateLimitExceededError");
    });
  });

  describe("Whitelist/Blacklist", function () {
    it("Should whitelist users", async function () {
      const { rateLimiter, owner, user1 } = await loadFixture(deployRateLimiterFixture);
      
      await rateLimiter.addToWhitelist(user1.address);
      
      const [allowed, remaining] = await rateLimiter.checkRateLimit(user1.address, 0);
      expect(allowed).to.be.true;
      expect(remaining).to.equal(ethers.MaxUint256);
    });

    it("Should blacklist users", async function () {
      const { rateLimiter, owner, user1 } = await loadFixture(deployRateLimiterFixture);
      
      await rateLimiter.addToBlacklist(user1.address);
      
      const [allowed] = await rateLimiter.checkRateLimit(user1.address, 0);
      expect(allowed).to.be.false;
    });

    it("Should block blacklisted users from recording", async function () {
      const { rateLimiter, owner, user1 } = await loadFixture(deployRateLimiterFixture);
      
      await rateLimiter.addToBlacklist(user1.address);
      
      await expect(rateLimiter.recordRequest(user1.address, 0))
        .to.be.revertedWithCustomError(rateLimiter, "AddressBlacklistedError");
    });
  });

  describe("Admin Functions", function () {
    it("Should update rate limits", async function () {
      const { rateLimiter, owner } = await loadFixture(deployRateLimiterFixture);
      
      await rateLimiter.setRateLimit(0, 5, 3600, 600);
      
      const limit = await rateLimiter.getRateLimit(0);
      expect(limit.maxRequests).to.equal(5);
      expect(limit.windowDuration).to.equal(3600);
      expect(limit.cooldownPeriod).to.equal(600);
    });
  });
});

describe("CrossChainReputation", function () {
  async function deployCrossChainFixture() {
    const [owner, user1, bridge] = await ethers.getSigners();

    const CrossChainReputation = await ethers.getContractFactory("CrossChainReputation");
    const crossChain = await CrossChainReputation.deploy();

    return { crossChain, owner, user1, bridge };
  }

  describe("Deployment", function () {
    it("Should initialize with QIE Testnet", async function () {
      const { crossChain } = await loadFixture(deployCrossChainFixture);
      
      expect(await crossChain.isChainSupported(1983)).to.be.true;
    });

    it("Should set correct weight for QIE", async function () {
      const { crossChain } = await loadFixture(deployCrossChainFixture);
      
      expect(await crossChain.chainWeights(1983)).to.equal(5000);
    });
  });

  describe("Chain Management", function () {
    it("Should add new chains", async function () {
      const { crossChain, owner } = await loadFixture(deployCrossChainFixture);
      
      await expect(crossChain.addChain(1, "Ethereum", 3000))
        .to.emit(crossChain, "ChainAdded")
        .withArgs(1, "Ethereum", 3000);
      
      expect(await crossChain.isChainSupported(1)).to.be.true;
    });

    it("Should remove chains", async function () {
      const { crossChain, owner } = await loadFixture(deployCrossChainFixture);
      
      await crossChain.addChain(1, "Ethereum", 3000);
      
      await expect(crossChain.removeChain(1))
        .to.emit(crossChain, "ChainRemoved")
        .withArgs(1);
      
      expect(await crossChain.isChainSupported(1)).to.be.false;
    });

    it("Should update chain weights", async function () {
      const { crossChain, owner } = await loadFixture(deployCrossChainFixture);
      
      await crossChain.setChainWeight(1983, 7000);
      
      expect(await crossChain.chainWeights(1983)).to.equal(7000);
    });
  });

  describe("Bridge Integration", function () {
    it("Should configure bridges", async function () {
      const { crossChain, owner, bridge } = await loadFixture(deployCrossChainFixture);
      
      await crossChain.addChain(1, "Ethereum", 3000);
      
      await expect(crossChain.configureBridge(1, bridge.address, 8000))
        .to.emit(crossChain, "BridgeConfigured")
        .withArgs(1, bridge.address, 8000);
    });

    it("Should accept reputation from configured bridge", async function () {
      const { crossChain, owner, user1, bridge } = await loadFixture(deployCrossChainFixture);
      
      await crossChain.addChain(1, "Ethereum", 3000);
      await crossChain.configureBridge(1, bridge.address, 8000);
      
      await expect(crossChain.connect(bridge).bridgeSubmitReputation(user1.address, 1, 75))
        .to.emit(crossChain, "ReputationReceived");
      
      const [score] = await crossChain.getChainReputation(user1.address, 1);
      expect(score).to.equal(75);
    });

    it("Should reject reputation from unauthorized bridge", async function () {
      const { crossChain, owner, user1, bridge } = await loadFixture(deployCrossChainFixture);
      
      await crossChain.addChain(1, "Ethereum", 3000);
      await crossChain.configureBridge(1, bridge.address, 8000);
      
      // Try to submit from non-bridge address
      await expect(
        crossChain.bridgeSubmitReputation(user1.address, 1, 75)
      ).to.be.revertedWithCustomError(crossChain, "UnauthorizedBridge");
    });
  });

  describe("Aggregation", function () {
    it("Should aggregate cross-chain reputation", async function () {
      const { crossChain, owner, user1, bridge } = await loadFixture(deployCrossChainFixture);
      
      // Add Ethereum chain
      await crossChain.addChain(1, "Ethereum", 5000);
      await crossChain.configureBridge(1, bridge.address, 8000);
      await crossChain.configureBridge(1983, owner.address, 8000);
      
      // Submit reputation from both chains
      await crossChain.connect(bridge).bridgeSubmitReputation(user1.address, 1, 80);
      await crossChain.bridgeSubmitReputation(user1.address, 1983, 70);
      
      // Get aggregated score
      const aggregated = await crossChain.getAggregatedReputation(user1.address);
      
      // Both chains have equal weight (5000), so average should be 75
      expect(aggregated).to.equal(75);
    });
  });
});
