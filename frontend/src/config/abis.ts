// IdentityRegistry ABI - Main contract for DID management
export const IDENTITY_REGISTRY_ABI = [
  // Read Functions
  {
    "inputs": [{"internalType": "address", "name": "_user", "type": "address"}],
    "name": "hasIdentity",
    "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "_user", "type": "address"}],
    "name": "getIdentity",
    "outputs": [
      {
        "components": [
          {"internalType": "bytes32", "name": "did", "type": "bytes32"},
          {"internalType": "uint256", "name": "trustScore", "type": "uint256"},
          {"internalType": "uint256", "name": "createdAt", "type": "uint256"},
          {"internalType": "uint256", "name": "lastUpdated", "type": "uint256"},
          {"internalType": "bool", "name": "verified", "type": "bool"},
          {"internalType": "string", "name": "encryptedDataURI", "type": "string"},
          {"internalType": "uint256", "name": "verificationCount", "type": "uint256"}
        ],
        "internalType": "struct IdentityRegistry.Identity",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "_user", "type": "address"}],
    "name": "getTrustScore",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "bytes32", "name": "_did", "type": "bytes32"}],
    "name": "getAddressFromDID",
    "outputs": [{"internalType": "address", "name": "", "type": "address"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "totalIdentities",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  // Write Functions
  {
    "inputs": [{"internalType": "string", "name": "_encryptedDataURI", "type": "string"}],
    "name": "createIdentity",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "string", "name": "_newDataURI", "type": "string"}],
    "name": "updateCredentials",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "address", "name": "_subject", "type": "address"},
      {"internalType": "string", "name": "_credentialType", "type": "string"}
    ],
    "name": "requestVerification",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  // Events
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "internalType": "address", "name": "user", "type": "address"},
      {"indexed": true, "internalType": "bytes32", "name": "did", "type": "bytes32"},
      {"indexed": false, "internalType": "uint256", "name": "timestamp", "type": "uint256"}
    ],
    "name": "IdentityCreated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "internalType": "address", "name": "user", "type": "address"},
      {"indexed": false, "internalType": "uint256", "name": "oldScore", "type": "uint256"},
      {"indexed": false, "internalType": "uint256", "name": "newScore", "type": "uint256"},
      {"indexed": false, "internalType": "uint256", "name": "timestamp", "type": "uint256"}
    ],
    "name": "TrustScoreUpdated",
    "type": "event"
  }
] as const;

// TrustScoreCalculator ABI
export const TRUST_SCORE_CALCULATOR_ABI = [
  {
    "inputs": [{"internalType": "address", "name": "_user", "type": "address"}],
    "name": "getUserScore",
    "outputs": [
      {
        "components": [
          {"internalType": "uint256", "name": "oracleScore", "type": "uint256"},
          {"internalType": "uint256", "name": "activityScore", "type": "uint256"},
          {"internalType": "uint256", "name": "reputationScore", "type": "uint256"},
          {"internalType": "uint256", "name": "consistencyScore", "type": "uint256"},
          {"internalType": "uint256", "name": "finalScore", "type": "uint256"},
          {"internalType": "uint256", "name": "lastCalculated", "type": "uint256"}
        ],
        "internalType": "struct TrustScoreCalculator.ScoreComponents",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "_user", "type": "address"}],
    "name": "getTrustLevel",
    "outputs": [{"internalType": "string", "name": "", "type": "string"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getWeights",
    "outputs": [
      {
        "components": [
          {"internalType": "uint256", "name": "oracleWeight", "type": "uint256"},
          {"internalType": "uint256", "name": "activityWeight", "type": "uint256"},
          {"internalType": "uint256", "name": "reputationWeight", "type": "uint256"},
          {"internalType": "uint256", "name": "consistencyWeight", "type": "uint256"}
        ],
        "internalType": "struct TrustScoreCalculator.ScoreWeights",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
] as const;

// ZKVerifier ABI
export const ZK_VERIFIER_ABI = [
  {
    "inputs": [
      {"internalType": "address", "name": "_user", "type": "address"},
      {"internalType": "string", "name": "_credentialType", "type": "string"}
    ],
    "name": "hasCredential",
    "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "bytes32", "name": "_credentialHash", "type": "bytes32"},
      {"internalType": "bytes32", "name": "_commitment", "type": "bytes32"},
      {"internalType": "string", "name": "_credentialType", "type": "string"},
      {"internalType": "uint256", "name": "_expiresAt", "type": "uint256"}
    ],
    "name": "commitCredential",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "address", "name": "_user", "type": "address"},
      {"internalType": "string", "name": "_credentialType", "type": "string"},
      {"internalType": "bytes", "name": "_proof", "type": "bytes"}
    ],
    "name": "verifyCredential",
    "outputs": [{"internalType": "bool", "name": "valid", "type": "bool"}],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "totalCredentialsIssued",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "totalVerifications",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  }
] as const;

// OracleAdapter ABI
export const ORACLE_ADAPTER_ABI = [
  {
    "inputs": [{"internalType": "string", "name": "_symbol", "type": "string"}],
    "name": "getLatestPrice",
    "outputs": [
      {"internalType": "int256", "name": "price", "type": "int256"},
      {"internalType": "uint256", "name": "timestamp", "type": "uint256"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getSupportedAssets",
    "outputs": [{"internalType": "string[]", "name": "", "type": "string[]"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "_user", "type": "address"}],
    "name": "getUserAnalysis",
    "outputs": [
      {
        "components": [
          {"internalType": "uint256", "name": "stabilityScore", "type": "uint256"},
          {"internalType": "uint256", "name": "diversificationScore", "type": "uint256"},
          {"internalType": "uint256", "name": "activityScore", "type": "uint256"},
          {"internalType": "uint256", "name": "overallScore", "type": "uint256"},
          {"internalType": "uint256", "name": "lastAnalyzed", "type": "uint256"}
        ],
        "internalType": "struct OracleAdapter.FinancialAnalysis",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
] as const;
