# 🔐 VeriChain Identity Protocol

<div align="center">

![VeriChain Banner](https://img.shields.io/badge/VeriChain-DID%20Protocol-indigo?style=for-the-badge&logo=ethereum)

**Decentralized Identity Verification on QIE Blockchain**

*Trust Without Borders, Privacy Without Compromise*

[![QIE Blockchain](https://img.shields.io/badge/Chain-QIE%20Testnet-blue)](https://testnet.qie.digital)
[![Solidity](https://img.shields.io/badge/Solidity-0.8.20-363636)](https://soliditylang.org)
[![React](https://img.shields.io/badge/React-19-61DAFB)](https://react.dev)
[![License](https://img.shields.io/badge/License-MIT-green)](LICENSE)
[![Tests](https://img.shields.io/badge/Tests-65%20Passing-brightgreen)](./test)

[Demo](https://verichain.io) • [Documentation](https://docs.verichain.io) • [Video Demo](#demo-video)

</div>

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
- **ZK Proofs:** Simulated (Circom integration ready)

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

### QIE Testnet
```json
{
  "chainId": 1983,
  "chainIdHex": "0x7BF",
  "rpcUrl": "https://rpc1testnet.qie.digital/",
  "explorer": "https://testnet.qie.digital",
  "currency": { "name": "QIE", "symbol": "QIE", "decimals": 18 }
}
```

### Add to MetaMask
1. Open MetaMask → Networks → Add Network
2. Enter the above details
3. Get test tokens from [QIE Faucet](https://www.qie.digital/faucet)

---

## 📈 Roadmap

- [x] ✅ Smart Contracts (7 contracts)
- [x] ✅ QIE Testnet Deployment
- [x] ✅ React Frontend
- [x] ✅ Trust Score Algorithm
- [x] ✅ ZK Proof UI
- [x] ✅ Multi-Sig Governance
- [x] ✅ Rate Limiting
- [x] ✅ Cross-Chain Reputation
- [ ] 🔄 QIE Mainnet Deployment
- [ ] 🔄 Circom ZK Circuits
- [ ] 📅 Mobile App (React Native)
- [ ] 📅 Enterprise API

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

- **QIE Blockchain** - Free oracles and fast infrastructure
- **OpenZeppelin** - Secure smart contract libraries
- **Pinata** - IPFS hosting
- **shadcn/ui** - Beautiful UI components

---

<div align="center">

**Built with ❤️ for QIE Blockchain Hackathon 2025**

*VeriChain - Trust Without Borders, Privacy Without Compromise*

</div>
