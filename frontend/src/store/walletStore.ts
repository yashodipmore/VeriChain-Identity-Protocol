import { create } from 'zustand';
import { BrowserProvider, JsonRpcSigner, Contract } from 'ethers';
import { CONTRACT_ADDRESSES, QIE_TESTNET } from '../config/constants';
import { IDENTITY_REGISTRY_ABI, TRUST_SCORE_CALCULATOR_ABI, ZK_VERIFIER_ABI } from '../config/abis';

// Types
interface Identity {
  did: string;
  trustScore: number;
  createdAt: number;
  lastUpdated: number;
  verified: boolean;
  encryptedDataURI: string;
  verificationCount: number;
}

interface WalletState {
  // Connection state
  isConnected: boolean;
  isConnecting: boolean;
  address: string | null;
  chainId: number | null;
  balance: string;
  
  // Provider & Signer
  provider: BrowserProvider | null;
  signer: JsonRpcSigner | null;
  
  // Contract instances
  identityRegistry: Contract | null;
  trustScoreCalculator: Contract | null;
  zkVerifier: Contract | null;
  
  // User identity
  identity: Identity | null;
  hasIdentity: boolean;
  
  // Actions
  connect: () => Promise<void>;
  disconnect: () => void;
  switchToQIE: () => Promise<void>;
  fetchIdentity: () => Promise<void>;
  createIdentity: (ipfsUri: string) => Promise<string>;
  updateCredentials: (ipfsUri: string) => Promise<string>;
}

export const useWalletStore = create<WalletState>((set, get) => ({
  // Initial state
  isConnected: false,
  isConnecting: false,
  address: null,
  chainId: null,
  balance: '0',
  provider: null,
  signer: null,
  identityRegistry: null,
  trustScoreCalculator: null,
  zkVerifier: null,
  identity: null,
  hasIdentity: false,

  // Connect wallet
  connect: async () => {
    if (typeof window.ethereum === 'undefined') {
      throw new Error('MetaMask not installed');
    }

    set({ isConnecting: true });

    try {
      // Request accounts
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });

      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const network = await provider.getNetwork();
      const balance = await provider.getBalance(accounts[0]);

      // Initialize contracts
      const identityRegistry = new Contract(
        CONTRACT_ADDRESSES.IDENTITY_REGISTRY,
        IDENTITY_REGISTRY_ABI,
        signer
      );

      const trustScoreCalculator = new Contract(
        CONTRACT_ADDRESSES.TRUST_SCORE_CALCULATOR,
        TRUST_SCORE_CALCULATOR_ABI,
        signer
      );

      const zkVerifier = new Contract(
        CONTRACT_ADDRESSES.ZK_VERIFIER,
        ZK_VERIFIER_ABI,
        signer
      );

      set({
        isConnected: true,
        isConnecting: false,
        address: accounts[0],
        chainId: Number(network.chainId),
        balance: (Number(balance) / 1e18).toFixed(4),
        provider,
        signer,
        identityRegistry,
        trustScoreCalculator,
        zkVerifier,
      });

      // Check if on correct network
      if (Number(network.chainId) !== QIE_TESTNET.chainId) {
        await get().switchToQIE();
      }

      // Fetch identity
      await get().fetchIdentity();

      // Setup event listeners
      window.ethereum.on('accountsChanged', (accounts: string[]) => {
        if (accounts.length === 0) {
          get().disconnect();
        } else {
          set({ address: accounts[0] });
          get().fetchIdentity();
        }
      });

      window.ethereum.on('chainChanged', () => {
        window.location.reload();
      });

    } catch (error) {
      set({ isConnecting: false });
      throw error;
    }
  },

  // Disconnect wallet
  disconnect: () => {
    set({
      isConnected: false,
      address: null,
      chainId: null,
      balance: '0',
      provider: null,
      signer: null,
      identityRegistry: null,
      trustScoreCalculator: null,
      zkVerifier: null,
      identity: null,
      hasIdentity: false,
    });
  },

  // Switch to QIE network
  switchToQIE: async () => {
    if (!window.ethereum) return;

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: QIE_TESTNET.chainIdHex }],
      });
    } catch (switchError: any) {
      // Chain not added, add it
      if (switchError.code === 4902) {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [{
            chainId: QIE_TESTNET.chainIdHex,
            chainName: QIE_TESTNET.name,
            rpcUrls: [QIE_TESTNET.rpcUrl],
            blockExplorerUrls: [QIE_TESTNET.explorerUrl],
            nativeCurrency: QIE_TESTNET.currency,
          }],
        });
      }
    }
  },

  // Fetch user identity
  fetchIdentity: async () => {
    const { identityRegistry, address } = get();
    if (!identityRegistry || !address) return;

    try {
      const hasId = await identityRegistry.hasIdentity(address);
      set({ hasIdentity: hasId });

      if (hasId) {
        const identity = await identityRegistry.getIdentity(address);
        
        // Format DID from bytes32 to readable string
        const didHex = identity.did;
        const formattedDID = `did:qie:${didHex.slice(2, 12)}...${didHex.slice(-8)}`;
        
        set({
          identity: {
            did: formattedDID,
            trustScore: Number(identity.trustScore),
            createdAt: Number(identity.createdAt) * 1000, // Convert to milliseconds
            lastUpdated: Number(identity.lastUpdated) * 1000,
            verified: identity.verified,
            encryptedDataURI: identity.encryptedDataURI,
            verificationCount: Number(identity.verificationCount),
          },
        });
      }
    } catch (error) {
      console.error('Error fetching identity:', error);
    }
  },

  // Create new identity
  createIdentity: async (ipfsUri: string) => {
    const { identityRegistry } = get();
    if (!identityRegistry) throw new Error('Not connected');

    const tx = await identityRegistry.createIdentity(ipfsUri);
    await tx.wait();
    
    await get().fetchIdentity();
    return tx.hash;
  },

  // Update credentials
  updateCredentials: async (ipfsUri: string) => {
    const { identityRegistry } = get();
    if (!identityRegistry) throw new Error('Not connected');

    const tx = await identityRegistry.updateCredentials(ipfsUri);
    await tx.wait();
    
    await get().fetchIdentity();
    return tx.hash;
  },
}));

// TypeScript declaration for window.ethereum
declare global {
  interface Window {
    ethereum?: any;
  }
}
