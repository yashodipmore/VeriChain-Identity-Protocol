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

    style UI fill:#3b82f6,stroke:#1d4ed8,color:#fff
    style CONTRACTS fill:#f97316,stroke:#ea580c,color:#fff
    style EXTERNAL fill:#22c55e,stroke:#16a34a,color:#fff
```

---

## 2. Smart Contract Layer

```mermaid
flowchart LR
    IR[IdentityRegistry]:::core --> TSC[TrustScoreCalculator]:::core
    TSC --> OA[OracleAdapter]:::oracle
    OA --> QIE[QIE Oracles]:::oracle
    
    IR --> ZKV[ZKVerifier]:::security
    IR --> MSA[MultiSigAdmin]:::security
    IR --> RL[RateLimiter]:::security
    TSC --> CCR[CrossChainReputation]:::rep

    classDef core fill:#ef4444,stroke:#dc2626,color:#fff
    classDef oracle fill:#f97316,stroke:#ea580c,color:#fff
    classDef security fill:#3b82f6,stroke:#1d4ed8,color:#fff
    classDef rep fill:#8b5cf6,stroke:#7c3aed,color:#fff
```

---

## 3. Identity Creation Flow

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant I as IPFS
    participant M as MetaMask
    participant C as Contract
    participant O as Oracle

    U->>F: Fill Form
    F->>F: Encrypt Data
    F->>I: Upload
    I-->>F: CID
    F->>M: Sign Tx
    M->>C: createIdentity()
    C->>O: Get Prices
    O-->>C: Price Data
    C-->>F: Success
```

---

## 4. ZK Proof Flow

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant C as Circom
    participant S as SnarkJS
    participant V as ZKVerifier

    U->>F: Select Proof Type
    F->>C: Generate Witness
    C-->>F: Witness
    F->>S: Create Proof
    S-->>F: Proof + Signals
    F->>V: Verify On-Chain
    V-->>F: Valid/Invalid
```

---

## 5. Trust Score Calculation

```mermaid
flowchart LR
    A[Oracle Data<br/>40%]:::orange --> E[Trust Score<br/>0-100]:::result
    B[On-Chain<br/>30%]:::blue --> E
    C[Cross-Chain<br/>20%]:::purple --> E
    D[Consistency<br/>10%]:::green --> E

    classDef orange fill:#f97316,stroke:#ea580c,color:#fff
    classDef blue fill:#3b82f6,stroke:#1d4ed8,color:#fff
    classDef purple fill:#8b5cf6,stroke:#7c3aed,color:#fff
    classDef green fill:#22c55e,stroke:#16a34a,color:#fff
    classDef result fill:#111827,stroke:#374151,color:#fff
```

---

## 6. Oracle Integration

```mermaid
flowchart LR
    OA[OracleAdapter]:::main --> BTC[BTC/USD]:::coin
    OA --> ETH[ETH/USD]:::coin
    OA --> QIE[QIE/USD]:::qie
    OA --> BNB[BNB/USD]:::coin
    OA --> XRP[XRP/USD]:::coin
    OA --> USDT[USDT/USD]:::stable
    OA --> USDC[USDC/USD]:::stable

    classDef main fill:#f97316,stroke:#ea580c,color:#fff
    classDef coin fill:#3b82f6,stroke:#1d4ed8,color:#fff
    classDef qie fill:#22c55e,stroke:#16a34a,color:#fff
    classDef stable fill:#8b5cf6,stroke:#7c3aed,color:#fff
```

---

## 7. Security Layers

```mermaid
flowchart TB
    A[Access Control]:::blue --> B[Multi-Sig 3/5]:::purple
    B --> C[Rate Limiting]:::orange
    C --> D[AES-256 Encryption]:::green
    D --> E[ReentrancyGuard]:::red

    classDef blue fill:#3b82f6,stroke:#1d4ed8,color:#fff
    classDef purple fill:#8b5cf6,stroke:#7c3aed,color:#fff
    classDef orange fill:#f97316,stroke:#ea580c,color:#fff
    classDef green fill:#22c55e,stroke:#16a34a,color:#fff
    classDef red fill:#ef4444,stroke:#dc2626,color:#fff
```

---

## 8. Data Flow

```mermaid
flowchart LR
    A[User Input]:::input --> B[Validate]:::process
    B --> C[Encrypt]:::process
    C --> D[Hash]:::process
    D --> E[IPFS]:::storage
    D --> F[Blockchain]:::storage
    F --> G[ZK Verify]:::verify
    F --> H[Trust Score]:::verify

    classDef input fill:#ef4444,stroke:#dc2626,color:#fff
    classDef process fill:#f97316,stroke:#ea580c,color:#fff
    classDef storage fill:#3b82f6,stroke:#1d4ed8,color:#fff
    classDef verify fill:#22c55e,stroke:#16a34a,color:#fff
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

    style FRONTEND fill:#3b82f6,stroke:#1d4ed8,color:#fff
    style BLOCKCHAIN fill:#f97316,stroke:#ea580c,color:#fff
    style ZK fill:#8b5cf6,stroke:#7c3aed,color:#fff
```

---

## 10. Deployment

```mermaid
flowchart LR
    A[Development]:::dev --> B[QIE Testnet]:::test
    B --> C[QIE Mainnet]:::prod
    
    D[Vercel]:::host --> B
    D -.-> C

    classDef dev fill:#8b5cf6,stroke:#7c3aed,color:#fff
    classDef test fill:#f97316,stroke:#ea580c,color:#fff
    classDef prod fill:#22c55e,stroke:#16a34a,color:#fff
    classDef host fill:#3b82f6,stroke:#1d4ed8,color:#fff
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
