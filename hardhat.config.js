import "@nomicfoundation/hardhat-toolbox";
import dotenv from "dotenv";

dotenv.config();

/** @type import('hardhat/config').HardhatUserConfig */
export default {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
      viaIR: true,
    },
  },
  
  networks: {
    // Local development
    hardhat: {
      chainId: 31337,
    },
    
    // QIE Testnet
    qieTestnet: {
      url: process.env.QIE_TESTNET_RPC || "https://rpc1testnet.qie.digital/",
      chainId: parseInt(process.env.QIE_TESTNET_CHAIN_ID) || 1983,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      gasPrice: 1000000000, // 1 gwei
    },
    
    // QIE Mainnet (for production deployment)
    qieMainnet: {
      url: process.env.QIE_MAINNET_RPC || "https://rpc1mainnet.qie.digital/",
      chainId: parseInt(process.env.QIE_MAINNET_CHAIN_ID) || 1990,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      gasPrice: 1000000000, // 1 gwei
    },
  },
  
  etherscan: {
    apiKey: {
      qieTestnet: "not-needed",
      qieMainnet: "not-needed",
    },
    customChains: [
      {
        network: "qieTestnet",
        chainId: 1983,
        urls: {
          apiURL: "https://testnet.qie.digital/api",
          browserURL: "https://testnet.qie.digital",
        },
      },
      {
        network: "qieMainnet",
        chainId: 1990,
        urls: {
          apiURL: "https://mainnet.qie.digital/api",
          browserURL: "https://mainnet.qie.digital",
        },
      },
    ],
  },
  
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
  
  mocha: {
    timeout: 40000,
  },
};
