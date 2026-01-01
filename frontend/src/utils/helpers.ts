import { TRUST_LEVELS } from '../config/constants';

/**
 * Get trust level info based on score
 */
export function getTrustLevel(score: number) {
  if (score <= TRUST_LEVELS.LOW.max) return TRUST_LEVELS.LOW;
  if (score <= TRUST_LEVELS.MEDIUM.max) return TRUST_LEVELS.MEDIUM;
  if (score <= TRUST_LEVELS.HIGH.max) return TRUST_LEVELS.HIGH;
  return TRUST_LEVELS.ELITE;
}

/**
 * Format address for display
 */
export function formatAddress(address: string): string {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

/**
 * Format timestamp to readable date
 */
export function formatDate(timestamp: number): string {
  if (!timestamp) return 'N/A';
  return new Date(timestamp * 1000).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Format timestamp to relative time
 */
export function formatRelativeTime(timestamp: number): string {
  if (!timestamp) return 'Never';
  
  const now = Date.now() / 1000;
  const diff = now - timestamp;
  
  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
  if (diff < 2592000) return `${Math.floor(diff / 86400)} days ago`;
  return formatDate(timestamp);
}

/**
 * Format timestamp (milliseconds) to readable date
 */
export function formatTimestamp(timestamp: number): string {
  if (!timestamp) return 'N/A';
  // Handle both seconds and milliseconds
  const ts = timestamp > 1e12 ? timestamp : timestamp * 1000;
  return new Date(ts).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Copy text to clipboard
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

/**
 * Generate random bytes32 hash
 */
export function generateRandomHash(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return '0x' + Array.from(array).map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Validate Ethereum address
 */
export function isValidAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

/**
 * Get explorer URL for address
 */
export function getExplorerUrl(address: string, type: 'address' | 'tx' = 'address'): string {
  return `https://testnet.qie.digital/${type}/${address}`;
}
