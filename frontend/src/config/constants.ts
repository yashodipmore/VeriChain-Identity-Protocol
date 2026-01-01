// Contract Addresses - QIE Testnet
export const CONTRACT_ADDRESSES = {
  IDENTITY_REGISTRY: '0x33b9eb7320c2ACE82caDBA8F61eAB5D72E8282C6',
  ORACLE_ADAPTER: '0x32376c7aABa1c6F9d802Ede04d7e106d113e275B',
  TRUST_SCORE_CALCULATOR: '0xEb0a50DEAb93c92730E1429Fb2A82B431C54b48A',
  ZK_VERIFIER: '0x056cbf01E11105858005E6aB43076a41387D164C',
  // Security Contracts
  MULTI_SIG_ADMIN: '0x6668fF8D75209B51D2D292ceF5A688F77142cb6C',
  RATE_LIMITER: '0xA9b1Ff4B906F11629fAcB9183cd8b201A8f452c8',
  CROSS_CHAIN_REPUTATION: '0xF7fD38Bf7EFDFA33b7fa368b9A87d76c92f38389',
} as const;

// Network Configuration
export const QIE_TESTNET = {
  chainId: 1983,
  chainIdHex: '0x7BF',
  name: 'QIE Testnet',
  rpcUrl: 'https://rpc1testnet.qie.digital/',
  explorerUrl: 'https://testnet.qie.digital',
  currency: {
    name: 'QIE',
    symbol: 'QIE',
    decimals: 18,
  },
};

export const QIE_MAINNET = {
  chainId: 1990,
  chainIdHex: '0x7C6',
  name: 'QIE Mainnet',
  rpcUrl: 'https://rpc1mainnet.qie.digital/',
  explorerUrl: 'https://mainnet.qie.digital',
  currency: {
    name: 'QIE',
    symbol: 'QIEV3',
    decimals: 18,
  },
};

// Pinata IPFS Configuration
export const PINATA_CONFIG = {
  gateway: 'https://gateway.pinata.cloud/ipfs/',
};

// Trust Score Thresholds
export const TRUST_LEVELS = {
  LOW: { min: 0, max: 30, label: 'Low Trust', color: 'text-red-400', bgColor: 'bg-red-500/20' },
  MEDIUM: { min: 31, max: 60, label: 'Medium Trust', color: 'text-yellow-400', bgColor: 'bg-yellow-500/20' },
  HIGH: { min: 61, max: 85, label: 'High Trust', color: 'text-emerald-400', bgColor: 'bg-emerald-500/20' },
  ELITE: { min: 86, max: 100, label: 'Elite Trust', color: 'text-indigo-400', bgColor: 'bg-indigo-500/20' },
};

// Credential Types
export const CREDENTIAL_TYPES = [
  { id: 'DEGREE', label: 'Educational Degree', icon: '🎓' },
  { id: 'EMPLOYMENT', label: 'Employment History', icon: '💼' },
  { id: 'IDENTITY', label: 'Government ID', icon: '🪪' },
  { id: 'AGE', label: 'Age Verification', icon: '📅' },
  { id: 'FINANCIAL', label: 'Financial Status', icon: '💰' },
];
