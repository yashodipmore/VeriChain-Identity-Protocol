# VeriChain Architecture Documentation

> Technical diagrams for QIE Blockchain Hackathon 2025

---

## 1. System Architecture

```mermaid
flowchart TB
    subgraph UI[User Interface]
        A[React Frontend]
        B[MetaMask]
    end

    subgraph CONTRACTS[Smart Contracts - QIE Blockchain]
        C[IdentityRegistry]
        D[TrustScoreCalculator]
        E[OracleAdapter]
        F[ZKVerifier]
    end

    subgraph EXTERNAL[External Services]
        G[QIE Oracles]
        H[IPFS Storage]
    end

    A --> B
    B --> C
    C --> D
    D --> E
    E --> G
    C --> F
    A --> H
```

---

## 2. Smart Contract Layer

```mermaid
flowchart LR
    IR[IdentityRegistry] --> TSC[TrustScoreCalculator]
    TSC --> OA[OracleAdapter]
    OA --> QIE[QIE Oracles]
    
    IR --> ZKV[ZKVerifier]
    IR --> MSA[MultiSigAdmin]
    IR --> RL[RateLimiter]
    TSC --> CCR[CrossChainReputation]
```

---

## 3. Identity Creation Flow

```mermaid
sequenceDiagram
    User->>Frontend: Fill Form
    Frontend->>Frontend: Encrypt Data
    Frontend->>IPFS: Upload
    IPFS-->>Frontend: CID
    Frontend->>MetaMask: Sign Tx
    MetaMask->>Contract: createIdentity()
    Contract->>Oracle: Get Prices
    Oracle-->>Contract: Price Data
    Contract-->>Frontend: Success
```

---

## 4. ZK Proof Flow

```mermaid
sequenceDiagram
    User->>Frontend: Select Proof Type
    Frontend->>Circom: Generate Witness
    Circom-->>Frontend: Witness
    Frontend->>SnarkJS: Create Proof
    SnarkJS-->>Frontend: Proof + Signals
    Frontend->>ZKVerifier: Verify On-Chain
    ZKVerifier-->>Frontend: Valid/Invalid
```

---

## 5. Trust Score Calculation

```mermaid
flowchart LR
    subgraph INPUT[Data Sources]
        A[Oracle Data 40%]
        B[On-Chain 30%]
        C[Cross-Chain 20%]
        D[Consistency 10%]
    end

    subgraph OUTPUT[Result]
        E[Trust Score 0-100]
    end

    A --> E
    B --> E
    C --> E
    D --> E
```

---

## 6. Oracle Integration

```mermaid
flowchart LR
    OA[OracleAdapter] --> BTC[BTC/USD]
    OA --> ETH[ETH/USD]
    OA --> QIE[QIE/USD]
    OA --> BNB[BNB/USD]
    OA --> XRP[XRP/USD]
    OA --> USDT[USDT/USD]
    OA --> USDC[USDC/USD]
```

---

## 7. Security Layers

```mermaid
flowchart TB
    A[Access Control] --> B[Multi-Sig 3/5]
    B --> C[Rate Limiting]
    C --> D[AES-256 Encryption]
    D --> E[ReentrancyGuard]
```

---

## 8. Data Flow

```mermaid
flowchart LR
    A[User Input] --> B[Validate]
    B --> C[Encrypt]
    C --> D[Hash]
    D --> E[IPFS]
    D --> F[Blockchain]
    F --> G[ZK Verify]
    F --> H[Trust Score]
```

---

## 9. Tech Stack

```mermaid
flowchart TB
    subgraph FRONTEND[Frontend]
        A[React 19]
        B[TypeScript]
        C[TailwindCSS]
        D[ethers.js]
    end

    subgraph BLOCKCHAIN[Blockchain]
        E[Solidity]
        F[Hardhat]
        G[OpenZeppelin]
    end

    subgraph ZK[Zero Knowledge]
        H[Circom]
        I[SnarkJS]
    end
```

---

## 10. Deployment

```mermaid
flowchart LR
    A[Development] --> B[QIE Testnet]
    B --> C[QIE Mainnet]
    
    D[Vercel] --> B
    D -.-> C
```

---

## Contract Addresses

| Contract | Address |
|----------|---------|
| IdentityRegistry | `0x33b9...C6` |
| OracleAdapter | `0x3237...5B` |
| TrustScoreCalculator | `0xEb0a...8A` |
| ZKVerifier | `0x056c...4C` |
| MultiSigAdmin | `0x6668...6C` |
| RateLimiter | `0xA9b1...c8` |
| CrossChainReputation | `0xF7fD...89` |

---

## Network Config

| Network | Chain ID | RPC |
|---------|----------|-----|
| Testnet | 1983 | rpc1testnet.qie.digital |
| Mainnet | 5765 | rpc.qie.digital |

---

**VeriChain Identity Protocol** | QIE Hackathon 2025 | Yashodip More & Komal Kumavat
