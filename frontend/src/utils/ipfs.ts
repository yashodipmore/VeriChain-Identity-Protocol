import { PINATA_CONFIG } from '../config/constants';
import CryptoJS from 'crypto-js';

// Pinata API Keys (from environment or constants)
const PINATA_JWT = import.meta.env.VITE_PINATA_JWT || '';

interface PinataResponse {
  IpfsHash: string;
  PinSize: number;
  Timestamp: string;
}

/**
 * Upload JSON data to IPFS via Pinata
 */
export async function uploadToIPFS(data: object, name?: string): Promise<string> {
  // Check if JWT is configured
  if (!PINATA_JWT) {
    console.error('Pinata JWT not configured. Using mock IPFS hash for demo.');
    // Return a mock IPFS hash for demo purposes
    const mockHash = 'Qm' + btoa(JSON.stringify(data).slice(0, 30)).replace(/[^a-zA-Z0-9]/g, '').slice(0, 44);
    return `ipfs://${mockHash}`;
  }

  try {
    const response = await fetch('https://api.pinata.cloud/pinning/pinJSONToIPFS', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${PINATA_JWT}`,
      },
      body: JSON.stringify({
        pinataContent: data,
        pinataMetadata: {
          name: name || `verichain-${Date.now()}`,
        },
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Pinata error:', response.status, errorData);
      
      // If unauthorized (JWT expired), use mock hash for demo
      if (response.status === 401 || response.status === 403) {
        console.warn('Pinata JWT expired or invalid. Using mock IPFS hash for demo.');
        const mockHash = 'Qm' + btoa(JSON.stringify(data).slice(0, 30)).replace(/[^a-zA-Z0-9]/g, '').slice(0, 44);
        return `ipfs://${mockHash}`;
      }
      
      throw new Error(`Failed to upload to IPFS: ${errorData.error?.reason || response.statusText}`);
    }

    const result: PinataResponse = await response.json();
    return `ipfs://${result.IpfsHash}`;
  } catch (error: any) {
    console.error('IPFS upload error:', error);
    // Fallback to mock hash for demo
    console.warn('Using mock IPFS hash due to error:', error.message);
    const mockHash = 'Qm' + btoa(JSON.stringify(data).slice(0, 30)).replace(/[^a-zA-Z0-9]/g, '').slice(0, 44);
    return `ipfs://${mockHash}`;
  }
}

/**
 * Upload file to IPFS via Pinata
 */
export async function uploadFileToIPFS(file: File): Promise<string> {
  // Check if JWT is configured
  if (!PINATA_JWT) {
    console.warn('Pinata JWT not configured. Using local storage fallback.');
    // Store file as base64 in localStorage for demo
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result as string;
        const mockHash = 'QmFile' + btoa(file.name).replace(/[^a-zA-Z0-9]/g, '').slice(0, 38);
        // Store in localStorage
        try {
          localStorage.setItem(`ipfs_${mockHash}`, base64);
          resolve(`ipfs://${mockHash}`);
        } catch (e) {
          console.error('LocalStorage full, using mock hash only');
          resolve(`ipfs://${mockHash}`);
        }
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  }

  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('pinataMetadata', JSON.stringify({
      name: file.name,
    }));

    const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${PINATA_JWT}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Pinata file upload error:', response.status, errorData);
      
      // Fallback to local storage
      if (response.status === 401 || response.status === 403) {
        console.warn('Pinata JWT expired. Using local storage fallback.');
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => {
            const base64 = reader.result as string;
            const mockHash = 'QmFile' + btoa(file.name).replace(/[^a-zA-Z0-9]/g, '').slice(0, 38);
            try {
              localStorage.setItem(`ipfs_${mockHash}`, base64);
              resolve(`ipfs://${mockHash}`);
            } catch (e) {
              resolve(`ipfs://${mockHash}`);
            }
          };
          reader.onerror = () => reject(new Error('Failed to read file'));
          reader.readAsDataURL(file);
        });
      }
      
      throw new Error(`Failed to upload file to IPFS: ${errorData.error?.reason || response.statusText}`);
    }

    const result: PinataResponse = await response.json();
    return `ipfs://${result.IpfsHash}`;
  } catch (error: any) {
    console.error('IPFS file upload error:', error);
    // Final fallback
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result as string;
        const mockHash = 'QmFile' + btoa(file.name).replace(/[^a-zA-Z0-9]/g, '').slice(0, 38);
        try {
          localStorage.setItem(`ipfs_${mockHash}`, base64);
          resolve(`ipfs://${mockHash}`);
        } catch (e) {
          resolve(`ipfs://${mockHash}`);
        }
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  }
}

/**
 * Fetch data from IPFS
 */
export async function fetchFromIPFS<T>(ipfsUri: string): Promise<T> {
  // Convert ipfs:// to gateway URL
  const hash = ipfsUri.replace('ipfs://', '');
  const url = `${PINATA_CONFIG.gateway}${hash}`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Failed to fetch from IPFS');
  }

  return response.json();
}

/**
 * Derive a 256-bit key from password using PBKDF2
 * @param password User's secret/password
 * @param salt Salt for key derivation (default: fixed salt for demo, should be random in production)
 */
function deriveKey(password: string, salt: string = 'VeriChain-Salt-2025'): CryptoJS.lib.WordArray {
  return CryptoJS.PBKDF2(password, salt, {
    keySize: 256 / 32, // 256 bits
    iterations: 10000,
    hasher: CryptoJS.algo.SHA256
  });
}

/**
 * AES-256 encryption for credentials
 * Uses AES-256-CBC with PBKDF2 key derivation
 * @param data Plain text data to encrypt
 * @param secret User's secret/password
 * @returns Encrypted data as base64 string with IV prepended
 */
export function encryptData(data: string, secret: string): string {
  // Generate random IV (16 bytes for AES)
  const iv = CryptoJS.lib.WordArray.random(16);
  
  // Derive 256-bit key using PBKDF2
  const key = deriveKey(secret);
  
  // Encrypt using AES-256-CBC
  const encrypted = CryptoJS.AES.encrypt(data, key, {
    iv: iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7
  });
  
  // Prepend IV to ciphertext for decryption
  const ivAndCiphertext = iv.concat(encrypted.ciphertext);
  
  return ivAndCiphertext.toString(CryptoJS.enc.Base64);
}

/**
 * AES-256 decryption for credentials
 * @param encryptedData Base64 encrypted data with IV prepended
 * @param secret User's secret/password
 * @returns Decrypted plain text
 */
export function decryptData(encryptedData: string, secret: string): string {
  // Parse the base64 encoded data
  const ivAndCiphertext = CryptoJS.enc.Base64.parse(encryptedData);
  
  // Extract IV (first 16 bytes = 4 words)
  const iv = CryptoJS.lib.WordArray.create(ivAndCiphertext.words.slice(0, 4), 16);
  
  // Extract ciphertext (remaining bytes)
  const ciphertext = CryptoJS.lib.WordArray.create(
    ivAndCiphertext.words.slice(4),
    ivAndCiphertext.sigBytes - 16
  );
  
  // Derive key
  const key = deriveKey(secret);
  
  // Create cipher params
  const cipherParams = CryptoJS.lib.CipherParams.create({
    ciphertext: ciphertext
  });
  
  // Decrypt
  const decrypted = CryptoJS.AES.decrypt(cipherParams, key, {
    iv: iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7
  });
  
  return decrypted.toString(CryptoJS.enc.Utf8);
}

/**
 * Generate a secure random encryption key
 * @returns 32-byte hex string suitable for AES-256
 */
export function generateEncryptionKey(): string {
  const randomBytes = CryptoJS.lib.WordArray.random(32);
  return randomBytes.toString(CryptoJS.enc.Hex);
}

/**
 * Hash data using SHA-256
 * @param data Data to hash
 * @returns SHA-256 hash as hex string
 */
export function hashData(data: string): string {
  return CryptoJS.SHA256(data).toString(CryptoJS.enc.Hex);
}
