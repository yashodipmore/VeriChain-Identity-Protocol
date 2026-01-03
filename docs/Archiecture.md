# VeriChain Architecture Documentation

> Complete system architecture, workflows, and technical diagrams for QIE Blockchain Hackathon 2025

---

## 1. High-Level System Architecture

```mermaid
flowchart TB
    subgraph USER["👤 User Layer"]
        A[Web Browser] --> B[React 19 Frontend]
        B --> C[MetaMask Wallet]
    end

    subgraph FRONTEND["🖥️ Frontend Application"]
        D[Landing Page] --> E[Dashboard]
        E --> F[Create Identity]
        E --> G[Verify Identity]
        E --> H[ZK Proof Generator]
        E --> I[Credentials Manager]
    end

    subgraph BLOCKCHAIN["⛓️ QIE Blockchain Layer"]
        J[IdentityRegistry] --> K[TrustScoreCalculator]
        K --> L[OracleAdapter]
        L --> M[QIE Oracle Network]
        J --> N[ZKVerifier]
        J --> O[MultiSigAdmin]
        J --> P[RateLimiter]
        J --> Q[CrossChainReputation]
    end

    subgraph STORAGE["💾 Decentralized Storage"]
        R[IPFS via Pinata]
        S[AES-256 Encrypted Data]
    end

    B --> J
    C --> J
    F --> R
    R --> S

    style USER fill:#f0f9ff,stroke:#0ea5e9
    style FRONTEND fill:#fef3c7,stroke:#f59e0b
    style BLOCKCHAIN fill:#fce7f3,stroke:#ec4899
    style STORAGE fill:#ecfdf5,stroke:#10b981
```

---

## 2. Smart Contract Architecture

```mermaid
flowchart LR
    subgraph CORE["Core Contracts"]
        IR[IdentityRegistry<br/>0x33b9...C6]
        TSC[TrustScoreCalculator<br/>0xEb0a...8A]
    end

    subgraph ORACLE["Oracle Layer"]
        OA[OracleAdapter<br/>0x3237...5B]
        QO[QIE Oracle Network<br/>7 Price Feeds]
    end

    subgraph SECURITY["Security Layer"]
        ZKV[ZKVerifier<br/>0x056c...4C]
        MSA[MultiSigAdmin<br/>0x6668...6C]
        RL[RateLimiter<br/>0xA9b1...c8]
    end

    subgraph REPUTATION["Reputation Layer"]
        CCR[CrossChainReputation<br/>0xF7fD...89]
    end

    IR --> TSC
    TSC --> OA
    OA --> QO
    IR --> ZKV
    IR --> MSA
    IR --> RL
    TSC --> CCR

    style CORE fill:#fee2e2,stroke:#ef4444
    style ORACLE fill:#fef3c7,stroke:#f59e0b
    style SECURITY fill:#dbeafe,stroke:#3b82f6
    style REPUTATION fill:#f3e8ff,stroke:#a855f7
```

---

## 3. Identity Creation Workflow

```mermaid
sequenceDiagram
    autonumber
    participant U as 👤 User
    participant F as 🖥️ Frontend
    participant M as 🦊 MetaMask
    participant I as 📦 IPFS
    participant B as ⛓️ IdentityRegistry
    participant T as 📊 TrustScoreCalculator
    participant O as 🔮 OracleAdapter

    U->>F: Fill Identity Form
    F->>F: Validate Input (Zod)
    F->>F: Encrypt Data (AES-256)
    F->>I: Upload Encrypted JSON
    I-->>F: Return IPFS CID
    F->>M: Request Signature
    M-->>U: Confirm Transaction
    U->>M: Approve
    M->>B: createIdentity(did, ipfsHash, credentials)
    B->>T: calculateInitialScore(user)
    T->>O: getAssetPrices()
    O-->>T: Return 7 Price Feeds
    T-->>B: Return Trust Score
    B-->>F: Identity Created Event
    F-->>U: Show Success + DID
```

---

## 4. Zero-Knowledge Proof Workflow

```mermaid
sequenceDiagram
    autonumber
    participant U as 👤 User
    participant F as 🖥️ Frontend
    participant C as 🔐 Circom Circuit
    participant S as 📜 SnarkJS
    participant V as ✅ ZKVerifier Contract

    U->>F: Select Proof Type (Age/Degree/etc)
    F->>F: Load Private Inputs
    F->>C: Generate Witness
    C-->>F: Witness Generated
    F->>S: Generate Proof (Groth16)
    S-->>F: {proof, publicSignals}
    F->>V: verifyProof(proof, publicSignals)
    V->>V: Pairing Check
    V-->>F: Return true/false
    F-->>U: Proof Verified ✅
```

---

## 5. Trust Score Calculation Flow

```mermaid
flowchart TD
    A[User Address] --> B{Fetch Data}
    
    B --> C[Oracle Data<br/>40% Weight]
    B --> D[On-Chain Activity<br/>30% Weight]
    B --> E[Cross-Chain Rep<br/>20% Weight]
    B --> F[Time Consistency<br/>10% Weight]
    
    C --> G[BTC Price]
    C --> H[ETH Price]
    C --> I[QIE Price]
    C --> J[+ 4 More Feeds]
    
    G --> K[Financial Score]
    H --> K
    I --> K
    J --> K
    
    D --> L[Transaction Count]
    D --> M[Account Age]
    D --> N[Verification History]
    
    L --> O[Activity Score]
    M --> O
    N --> O
    
    E --> P[Multi-Chain Analysis]
    P --> Q[Reputation Score]
    
    F --> R[Behavioral Analysis]
    R --> S[Consistency Score]
    
    K --> T[Final Trust Score<br/>0-100]
    O --> T
    Q --> T
    S --> T
    
    T --> U{Score Range}
    U -->|0-30| V[🔴 Low Trust]
    U -->|31-60| W[🟡 Medium Trust]
    U -->|61-85| X[🟢 High Trust]
    U -->|86-100| Y[⭐ Elite Trust]

    style T fill:#f59e0b,stroke:#d97706,color:#fff
    style V fill:#ef4444,stroke:#dc2626
    style W fill:#eab308,stroke:#ca8a04
    style X fill:#22c55e,stroke:#16a34a
    style Y fill:#8b5cf6,stroke:#7c3aed
```

---

## 6. QIE Oracle Integration

```mermaid
flowchart LR
    subgraph VERICHAIN["VeriChain Protocol"]
        OA[OracleAdapter.sol]
        TSC[TrustScoreCalculator.sol]
    end

    subgraph QIE_ORACLE["QIE Oracle Network (FREE)"]
        BTC[BTC/USD]
        ETH[ETH/USD]
        QIE[QIE/USD]
        BNB[BNB/USD]
        XRP[XRP/USD]
        USDT[USDT/USD]
        USDC[USDC/USD]
    end

    OA -->|getPrice| BTC
    OA -->|getPrice| ETH
    OA -->|getPrice| QIE
    OA -->|getPrice| BNB
    OA -->|getPrice| XRP
    OA -->|getPrice| USDT
    OA -->|getPrice| USDC

    BTC -->|$0.00| OA
    ETH -->|$0.00| OA
    QIE -->|$0.00| OA

    TSC --> OA

    style QIE_ORACLE fill:#22c55e,stroke:#16a34a
    style VERICHAIN fill:#f59e0b,stroke:#d97706
```

---

## 7. Security Architecture

```mermaid
flowchart TB
    subgraph ACCESS["Access Control"]
        A1[Role-Based Access]
        A2[Admin Role]
        A3[Verifier Role]
        A4[User Role]
    end

    subgraph MULTISIG["Multi-Signature Governance"]
        M1[3-of-5 Signatures Required]
        M2[1-Hour Time Lock]
        M3[Emergency Pause]
    end

    subgraph RATE["Rate Limiting"]
        R1[Per-User Limits]
        R2[Cooldown Periods]
        R3[Anti-Spam Protection]
    end

    subgraph ENCRYPTION["Data Encryption"]
        E1[AES-256-CBC]
        E2[PBKDF2 Key Derivation]
        E3[User-Controlled Keys]
    end

    subgraph GUARDS["Smart Contract Guards"]
        G1[ReentrancyGuard]
        G2[Pausable]
        G3[Input Validation]
    end

    ACCESS --> MULTISIG
    MULTISIG --> RATE
    RATE --> ENCRYPTION
    ENCRYPTION --> GUARDS

    style ACCESS fill:#dbeafe,stroke:#3b82f6
    style MULTISIG fill:#fce7f3,stroke:#ec4899
    style RATE fill:#fef3c7,stroke:#f59e0b
    style ENCRYPTION fill:#dcfce7,stroke:#22c55e
    style GUARDS fill:#f3e8ff,stroke:#a855f7
```

---

## 8. Data Flow Architecture

```mermaid
flowchart LR
    subgraph INPUT["User Input"]
        I1[Personal Info]
        I2[Credentials]
        I3[Documents]
    end

    subgraph PROCESS["Processing"]
        P1[Validation]
        P2[Encryption]
        P3[Hashing]
    end

    subgraph STORE["Storage"]
        S1[IPFS<br/>Encrypted Data]
        S2[Blockchain<br/>Hashes Only]
    end

    subgraph VERIFY["Verification"]
        V1[ZK Proofs]
        V2[Oracle Data]
        V3[Trust Score]
    end

    I1 --> P1
    I2 --> P1
    I3 --> P1
    P1 --> P2
    P2 --> P3
    P3 --> S1
    P3 --> S2
    S2 --> V1
    S2 --> V2
    V1 --> V3
    V2 --> V3

    style INPUT fill:#fee2e2,stroke:#ef4444
    style PROCESS fill:#fef3c7,stroke:#f59e0b
    style STORE fill:#dbeafe,stroke:#3b82f6
    style VERIFY fill:#dcfce7,stroke:#22c55e
```

---

## 9. Technology Stack Diagram

```mermaid
mindmap
  root((VeriChain))
    Frontend
      React 19
      TypeScript 5.8
      Vite 7.3
      TailwindCSS v4
      ethers.js 6.16
      Zustand 5
    Smart Contracts
      Solidity 0.8.20
      Hardhat 2.28
      OpenZeppelin 5.4
      7 Contracts
    Zero Knowledge
      Circom 2.1.6
      SnarkJS
      Groth16
      5 Circuits
    Storage
      IPFS
      Pinata
      AES-256
    Blockchain
      QIE Network
      25K+ TPS
      3s Finality
      7 Oracles
```

---

## 10. Proof-of-Real-World-Stake Concept

```mermaid
flowchart TB
    subgraph TRADITIONAL["Traditional PoS"]
        T1[Stake Crypto Tokens]
        T2[On-Chain Only]
        T3[No Real-World Context]
    end

    subgraph PORWS["VeriChain PoRWS"]
        P1[Real-World Asset Holdings]
        P2[Oracle-Verified Data]
        P3[Multi-Asset Profile]
        P4[Dynamic Trust Score]
    end

    subgraph ASSETS["Verified Assets"]
        A1[BTC Holdings]
        A2[ETH Holdings]
        A3[Stablecoins]
        A4[QIE Balance]
    end

    subgraph RESULT["Trust Output"]
        R1[Financial Score]
        R2[Credibility Rating]
        R3[Access Levels]
    end

    TRADITIONAL -.->|Evolution| PORWS
    ASSETS --> P1
    P1 --> P2
    P2 --> P3
    P3 --> P4
    P4 --> R1
    R1 --> R2
    R2 --> R3

    style TRADITIONAL fill:#fee2e2,stroke:#ef4444
    style PORWS fill:#dcfce7,stroke:#22c55e
    style ASSETS fill:#fef3c7,stroke:#f59e0b
    style RESULT fill:#dbeafe,stroke:#3b82f6
```

---

## 11. Deployment Architecture

```mermaid
flowchart TB
    subgraph DEV["Development"]
        D1[Local Hardhat Node]
        D2[localhost:3000]
    end

    subgraph TEST["QIE Testnet"]
        T1[Chain ID: 1983]
        T2[RPC: rpc1testnet.qie.digital]
        T3[7 Contracts Deployed]
        T4[Faucet Tokens]
    end

    subgraph PROD["QIE Mainnet"]
        P1[Chain ID: 5765]
        P2[RPC: rpc.qie.digital]
        P3[Production Ready]
    end

    subgraph FRONTEND["Frontend Hosting"]
        F1[Vercel]
        F2[CDN Distribution]
        F3[SSL/HTTPS]
    end

    DEV -->|Test| TEST
    TEST -->|Audit| PROD
    FRONTEND --> TEST
    FRONTEND -.->|Future| PROD

    style DEV fill:#f3e8ff,stroke:#a855f7
    style TEST fill:#fef3c7,stroke:#f59e0b
    style PROD fill:#dcfce7,stroke:#22c55e
    style FRONTEND fill:#dbeafe,stroke:#3b82f6
```

---

## 12. User Journey Map

```mermaid
journey
    title VeriChain User Journey
    section Discovery
      Visit Landing Page: 5: User
      Read Features: 4: User
      View Architecture: 4: User
    section Onboarding
      Connect MetaMask: 5: User
      Add QIE Network: 4: User
      Get Testnet Tokens: 3: User
    section Identity Creation
      Fill Profile Form: 4: User
      Upload Credentials: 4: User
      Confirm Transaction: 5: User
      Receive DID: 5: User
    section Verification
      View Trust Score: 5: User
      Generate ZK Proof: 4: User
      Share Proof: 5: User
    section Ongoing
      Update Credentials: 4: User
      Monitor Score: 4: User
      Cross-Chain Rep: 3: User
```

---

## Contract Addresses (QIE Testnet)

| Contract | Address | Purpose |
|----------|---------|---------|
| IdentityRegistry | `0x33b9eb7320c2ACE82caDBA8F61eAB5D72E8282C6` | Core DID storage |
| OracleAdapter | `0x32376c7aABa1c6F9d802Ede04d7e106d113e275B` | QIE Oracle integration |
| TrustScoreCalculator | `0xEb0a50DEAb93c92730E1429Fb2A82B431C54b48A` | Dynamic scoring |
| ZKVerifier | `0x056cbf01E11105858005E6aB43076a41387D164C` | ZK proof verification |
| MultiSigAdmin | `0x6668fF8D75209B51D2D292ceF5A688F77142cb6C` | Governance |
| RateLimiter | `0xA9b1Ff4B906F11629fAcB9183cd8b201A8f452c8` | Anti-spam |
| CrossChainReputation | `0xF7fD38Bf7EFDFA33b7fa368b9A87d76c92f38389` | Multi-chain rep |

---

<div align="center">

**VeriChain Identity Protocol**

*QIE Blockchain Hackathon 2025*

Built by **Yashodip More** & **Komal Kumavat**

</div>
