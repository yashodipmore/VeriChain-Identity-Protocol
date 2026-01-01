# 🔐 VeriChain Identity Protocol

<div align="center">

![VeriChain Banner](https://img.shields.io/badge/VeriChain-DID%20Protocol-indigo?style=for-the-badge&logo=ethereum)

**Decentralized Identity Verification on QIE Blockchain**

*The First Identity System with Proof-of-Real-World-Stake*

[![QIE Blockchain](https://img.shields.io/badge/Chain-QIE%20Blockchain-orange)](https://qie.digital)
[![Solidity](https://img.shields.io/badge/Solidity-0.8.20-363636)](https://soliditylang.org)
[![React](https://img.shields.io/badge/React-19-61DAFB)](https://react.dev)
[![Circom](https://img.shields.io/badge/Circom-2.1.6-purple)](https://docs.circom.io)
[![License](https://img.shields.io/badge/License-MIT-green)](LICENSE)
[![Tests](https://img.shields.io/badge/Tests-65%20Passing-brightgreen)](./test)

[🌐 Live Demo](https://verichain-did.vercel.app) • [📖 Documentation](#-architecture) • [🎬 Video Demo](#-demo-video)

</div>

---

## 🏆 QIE Blockchain Hackathon 2025 Submission

### 👥 Team
| Name | Role | Contributions |
|------|------|---------------|
| **Yashodip More** | Full Stack Blockchain Developer | Smart Contracts, Frontend, Architecture, ZK Circuits |
| **Komal Kumavat** | Blockchain Developer | Research, Testing, Documentation |

---

## 💡 Why QIE Blockchain?

VeriChain is purpose-built for QIE Blockchain, leveraging its unique advantages:

| Feature | QIE Advantage | How VeriChain Uses It |
|---------|--------------|----------------------|
| **FREE Oracles** | No gas fees for oracle calls (unlike Chainlink) | Real-time financial verification at zero cost |
| **25,000+ TPS** | Ultra-high throughput | Instant identity verification |
| **3-Second Finality** | Near-instant confirmation | Real-time trust score updates |
| **7 Native Oracles** | BTC, ETH, XRP, BNB, USDT, USDC, QIE | Multi-asset financial profiling |
| **EVM Compatible** | Standard Solidity support | Easy integration with existing tools |

### 🔮 QIE Oracle Integration - The Game Changer

```solidity
// VeriChain's Oracle Adapter - Fetching LIVE price data for free
function getAssetPrice(AssetType asset) public view returns (uint256) {
    return IQIEOracle(oracleAddress).getPrice(assetPriceFeeds[asset]);
}

// Trust Score uses ALL 7 oracles for comprehensive financial profiling
function calculateFinancialScore(address user) external view returns (uint256) {
    uint256 btcPrice = getAssetPrice(AssetType.BTC);   // ✅ FREE
    uint256 ethPrice = getAssetPrice(AssetType.ETH);   // ✅ FREE
    uint256 qiePrice = getAssetPrice(AssetType.QIE);   // ✅ FREE
    // ... comprehensive multi-asset analysis
}
```

**Cost Comparison:**
| Operation | Chainlink (Ethereum) | VeriChain (QIE) |
|-----------|---------------------|-----------------|
| Single Price Feed | ~$0.10 - $0.50 | **$0.00** |
| 7-Asset Profile | ~$0.70 - $3.50 | **$0.00** |
| 1000 Verifications | ~$700 - $3500 | **$0.00** |

---

## 🎯 Problem Statement

### The Identity Crisis in Web3

1. **Centralized KYC** - Users trust third parties with sensitive data → Data breaches, privacy violations
2. **Static Blockchain IDs** - One-time verification → No ongoing trust measurement
3. **Privacy Violations** - Proving credentials requires revealing all data → Unnecessary exposure
4. **No Real-World Context** - Blockchain-only reputation → Incomplete trust picture

### VeriChain's Solution

| Problem | VeriChain Solution |
|---------|-------------------|
| Centralized data storage | **IPFS + AES-256 encryption** - User controls their data |
| Static verification | **Dynamic Trust Scores** - Real-time updates via QIE oracles |
| Privacy violations | **Zero-Knowledge Proofs** - Prove without revealing |
| No real-world context | **Proof-of-Real-World-Stake** - Oracle-verified financial behavior |

---

## 🔮 Proof-of-Real-World-Stake (PoRWS)

**World's First** identity protocol that uses LIVE oracle data for trust verification.

```
┌─────────────────────────────────────────────────────────────────┐
│                    PROOF-OF-REAL-WORLD-STAKE                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   User Holdings ──► QIE Oracle ──► Trust Score Calculator       │
│        │                │                    │                   │
│        ▼                ▼                    ▼                   │
│   ┌─────────┐    ┌──────────────┐    ┌─────────────────┐        │
│   │  BTC    │    │ Live Price   │    │ Financial Score │        │
│   │  ETH    │───►│ Aggregation  │───►│  (0-100)        │        │
│   │  USDT   │    │ (FREE!)      │    │                 │        │
│   │  QIE    │    └──────────────┘    └─────────────────┘        │
│   └─────────┘                                                    │
│                                                                  │
│   Unlike PoS: Your REAL-WORLD assets back your identity         │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🎯 Overview

**VeriChain** is a revolutionary Decentralized Identity (DID) verification system that leverages QIE's free oracle infrastructure to create the world's first **Proof-of-Real-World-Stake** identity protocol.

Unlike traditional KYC systems or static blockchain identities, VeriChain dynamically verifies user credentials through real-world data while preserving privacy through Zero-Knowledge Proofs.

### Key Features

- 🔮 **Proof-of-Real-World-Stake (PoRWS)** - First protocol using LIVE oracle data for trust scores
- 🆓 **Free QIE Oracles** - No gas overhead like Chainlink
- 🔒 **Zero-Knowledge Proofs** - Verify credentials without revealing data
- 📊 **Dynamic Trust Scoring** - Real-time score updates based on behavior
- 🌐 **Cross-Chain Reputation** - Aggregate reputation from multiple blockchains
- 🛡️ **Enterprise Security** - Multi-sig admin, rate limiting, time-locked upgrades

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    USER INTERFACE                        │
│  (React 19 + TypeScript + TailwindCSS + shadcn/ui)      │
└────────────────┬────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────┐
│              SMART CONTRACT LAYER (QIE EVM)             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │   Identity   │  │   Oracle     │  │  Trust Score │ │
│  │   Registry   │  │   Adapter    │  │  Calculator  │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │  ZKVerifier  │  │  MultiSig    │  │ RateLimiter  │ │
│  │              │  │   Admin      │  │              │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
└────────────────┬────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────┐
│           QIE ORACLE NETWORK (FREE ACCESS)               │
│  [BTC] [ETH] [XRP] [BNB] [USDT] [USDC] [QIE]          │
└────────────────┬────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────┐
│         DECENTRALIZED STORAGE (IPFS via Pinata)         │
│           (AES-256 Encrypted User Credentials)          │
└─────────────────────────────────────────────────────────┘
```

---

## 📜 Smart Contracts

### Deployed on QIE Testnet (Chain ID: 1983)

| Contract | Address | Description |
|----------|---------|-------------|
| IdentityRegistry | `0x33b9eb7320c2ACE82caDBA8F61eAB5D72E8282C6` | DID storage & management |
| OracleAdapter | `0x32376c7aABa1c6F9d802Ede04d7e106d113e275B` | QIE Oracle integration |
| TrustScoreCalculator | `0xEb0a50DEAb93c92730E1429Fb2A82B431C54b48A` | Dynamic trust scoring |
| ZKVerifier | `0x056cbf01E11105858005E6aB43076a41387D164C` | ZK proof verification |
| MultiSigAdmin | `0x6668fF8D75209B51D2D292ceF5A688F77142cb6C` | Multi-signature governance |
| RateLimiter | `0xA9b1Ff4B906F11629fAcB9183cd8b201A8f452c8` | Anti-spam protection |
| CrossChainReputation | `0xF7fD38Bf7EFDFA33b7fa368b9A87d76c92f38389` | Cross-chain reputation |

### Trust Score Algorithm

```
Trust Score = (
  Oracle_Verification_Score * 0.4 +    // 40% - Financial behavior
  On_Chain_Activity_Score * 0.3 +       // 30% - Transaction history
  Cross_Chain_Reputation * 0.2 +        // 20% - Multi-chain reputation
  Time_Weighted_Consistency * 0.1       // 10% - Behavioral consistency
)

Score Range: 0-100
├── 0-30:  Low Trust (New/Suspicious)
├── 31-60: Medium Trust (Active User)
├── 61-85: High Trust (Verified User)
└── 86-100: Elite Trust (Power User)
```

---

## 🚀 Quick Start

### Prerequisites

- Node.js v20+
- MetaMask wallet
- QIE Testnet tokens ([Faucet](https://www.qie.digital/faucet))

### Installation

```bash
# Clone the repository
git clone https://github.com/verichain/protocol.git
cd protocol

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your values

# Compile contracts
npx hardhat compile

# Run tests
npx hardhat test

# Deploy to QIE Testnet
npx hardhat run scripts/deploy.js --network qieTestnet
```

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Add Pinata JWT

# Start development server
npm run dev
```

---

## 🛠️ Technology Stack

### Blockchain Layer
- **Chain:** QIE Blockchain (25,000+ TPS, 3-sec finality)
- **Smart Contracts:** Solidity 0.8.20
- **Framework:** Hardhat 2.28.x
- **Libraries:** OpenZeppelin v5.4.0

### Frontend
- **Framework:** React 19 + TypeScript
- **Build Tool:** Vite 7.3
- **Styling:** TailwindCSS v4 + shadcn/ui
- **Web3:** ethers.js v6.16
- **State:** Zustand v5
- **Forms:** React Hook Form + Zod

### Privacy & Security
- **Encryption:** AES-256-CBC with PBKDF2 key derivation
- **Storage:** IPFS via Pinata
- **ZK Proofs:** Circom 2.1.6 circuits (5 production circuits)

---

## 🔐 Zero-Knowledge Proof Circuits

VeriChain includes **5 production-ready Circom circuits** for privacy-preserving verification:

| Circuit | Purpose | Use Case |
|---------|---------|----------|
| `age_verification.circom` | Prove age > X without revealing birthdate | Age-gated services, alcohol/gambling |
| `credential_commitment.circom` | Prove credential ownership without data | General credential verification |
| `trust_score_range.circom` | Prove score in range without exact value | DeFi lending, access control |
| `degree_verification.circom` | Prove degree level without university name | Job applications |
| `financial_status.circom` | Prove financial threshold without balance | Loan eligibility |

### Example: Age Verification ZK Proof

```circom
// Prove you're 18+ without revealing your birthday
template AgeVerification() {
    signal input currentTimestamp;    // Public: Current time
    signal input minAge;              // Public: Required age (18)
    signal input commitment;          // Public: Hash of (birthdate, secret)
    
    signal input birthTimestamp;      // Private: Actual birthdate
    signal input secret;              // Private: User's secret
    
    signal output isAboveAge;         // Output: true/false
    
    // Verify commitment matches
    component poseidon = Poseidon(2);
    poseidon.inputs[0] <== birthTimestamp;
    poseidon.inputs[1] <== secret;
    commitment === poseidon.out;
    
    // Check age >= minAge (without revealing birthTimestamp)
    isAboveAge <== (currentTimestamp - birthTimestamp) >= (minAge * 31536000);
}
```

---

## 📊 Test Results

```
  65 passing (5s)

  ✓ IdentityRegistry (11 tests)
  ✓ TrustScoreCalculator (8 tests)
  ✓ OracleAdapter (4 tests)
  ✓ ZKVerifier (9 tests)
  ✓ MultiSigAdmin (15 tests)
  ✓ RateLimiter (8 tests)
  ✓ CrossChainReputation (8 tests)
  ✓ Integration Tests (2 tests)
```

---

## 🔐 Security Features

| Feature | Implementation |
|---------|---------------|
| Multi-Sig Admin | 3-of-5 signature for critical operations |
| Time-Locked Upgrades | 1-hour delay for governance actions |
| Rate Limiting | Per-user operation limits with cooldowns |
| Access Control | Role-based (Admin, Verifier, User) |
| Encryption | AES-256-CBC with PBKDF2 key derivation |
| Reentrancy Guard | OpenZeppelin ReentrancyGuard |

---

## 📁 Project Structure

```
verichain/
├── contracts/                 # Solidity smart contracts
│   ├── IdentityRegistry.sol   # Main DID registry
│   ├── OracleAdapter.sol      # QIE oracle integration
│   ├── TrustScoreCalculator.sol
│   ├── ZKVerifier.sol
│   ├── MultiSigAdmin.sol
│   ├── RateLimiter.sol
│   └── CrossChainReputation.sol
├── test/                      # Contract tests
├── scripts/                   # Deployment scripts
├── frontend/                  # React application
│   ├── src/
│   │   ├── components/        # UI components
│   │   │   ├── ui/            # shadcn/ui components
│   │   │   ├── Header.tsx
│   │   │   ├── Dashboard.tsx
│   │   │   ├── CreateIdentity.tsx
│   │   │   ├── VerifyIdentity.tsx
│   │   │   ├── ZKProofGenerator.tsx
│   │   │   └── ...
│   │   ├── store/             # Zustand stores
│   │   ├── config/            # Contract ABIs & addresses
│   │   ├── utils/             # Helper functions
│   │   └── lib/               # Utilities
│   └── ...
├── deployments/               # Deployment records
└── hardhat.config.ts          # Hardhat configuration
```

---

## 🎬 Demo Video

[Watch the Demo on YouTube](#) *(Coming Soon)*

### Demo Flow:
1. **Create Identity** - Connect wallet, fill profile, upload encrypted credentials
2. **Get Verified** - Oracle fetches data, calculates trust score
3. **Generate ZK Proof** - Prove credentials without revealing data
4. **Third-Party Verification** - Employers verify claims on-chain

---

## 🌐 Network Configuration

### QIE Testnet (Development)
```json
{
  "networkName": "QIE Testnet",
  "chainId": 1983,
  "chainIdHex": "0x7BF",
  "rpcUrl": "https://rpc1testnet.qie.digital/",
  "explorer": "https://testnet.qie.digital",
  "currency": { "name": "QIE", "symbol": "QIE", "decimals": 18 },
  "faucet": "https://faucet.qie.digital/"
}
```

### QIE Mainnet (Production)
```json
{
  "networkName": "QIE Mainnet",
  "chainId": 5765,
  "chainIdHex": "0x1685",
  "rpcUrl": "https://rpc.qie.digital/",
  "explorer": "https://mainnet.qie.digital",
  "currency": { "name": "QIE", "symbol": "QIE", "decimals": 18 }
}
```

---

## 💼 Real-World Use Cases

| Industry | Use Case | How VeriChain Helps |
|----------|----------|---------------------|
| **DeFi** | Under-collateralized Lending | Trust score determines creditworthiness |
| **Employment** | Background Verification | Prove degree/experience with ZK proofs |
| **Gaming** | Age Verification | Prove 18+ without revealing birthdate |
| **DAOs** | Sybil Resistance | One-person-one-vote with verified identity |
| **Healthcare** | Patient Identity | Secure credential sharing between providers |
| **Government** | e-KYC | Privacy-preserving citizen verification |

### Enterprise Integration

```javascript
// Third-party apps can verify users in 3 lines
const verichain = new VeriChain(provider);
const identity = await verichain.getIdentity(userAddress);
const isVerified = identity.trustScore >= 60 && identity.isActive;
```

---

## 📈 Roadmap

- [x] ✅ Smart Contracts (7 contracts deployed)
- [x] ✅ QIE Testnet Deployment
- [x] ✅ React 19 Frontend
- [x] ✅ Trust Score Algorithm with Oracle Integration
- [x] ✅ ZK Proof UI Generator
- [x] ✅ Multi-Sig Governance
- [x] ✅ Rate Limiting & Anti-Spam
- [x] ✅ Cross-Chain Reputation System
- [x] ✅ Circom ZK Circuits (5 circuits)
- [x] ✅ IPFS Encrypted Storage
- [ ] 🔄 QIE Mainnet Deployment
- [ ] 📅 Mobile App (React Native)
- [ ] 📅 Enterprise SDK & API
- [ ] 📅 Multi-language Support

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **QIE Blockchain** - Free oracle infrastructure & high-speed network
- **OpenZeppelin** - Battle-tested smart contract security
- **Circom/SnarkJS** - Zero-Knowledge proof framework
- **Pinata** - Reliable IPFS pinning service
- **Hardhat** - Ethereum development framework

---

## 📞 Contact

**Yashodip More** - Full Stack Blockchain Developer  
**Komal Kumavat** - Blockchain Developer

📧 Email: [Contact via GitHub](https://github.com/yashodipmore)  
🔗 Project Link: [github.com/yashodipmore/VeriChain-Identity-Protocol](https://github.com/yashodipmore/VeriChain-Identity-Protocol)

---

<div align="center">

### 🏆 QIE Blockchain Hackathon 2025 Submission

**VeriChain Identity Protocol**

*The First Identity System with Proof-of-Real-World-Stake*

---

**7 Smart Contracts** • **5 ZK Circuits** • **65 Tests Passing** • **FREE Oracle Integration**

Built with ❤️ by **Yashodip More** & **Komal Kumavat**

</div>