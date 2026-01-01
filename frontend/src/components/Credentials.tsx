import { useState, useEffect, useCallback } from 'react';
import { useWalletStore } from '../store/walletStore';
import { uploadToIPFS, uploadFileToIPFS, encryptData } from '../utils/ipfs';
import { generateRandomHash, formatTimestamp } from '../utils/helpers';
import toast from 'react-hot-toast';

interface Credential {
  id: string;
  type: string;
  issuer: string;
  issuedAt: number;
  expiresAt?: number;
  status: 'valid' | 'expired' | 'revoked' | 'pending';
  ipfsHash?: string;
  documentHash?: string;
}

// Storage key for credentials
const getStorageKey = (address: string) => `verichain_credentials_${address.toLowerCase()}`;

interface CredentialsProps {
  onBack?: () => void;
}

export function Credentials({ onBack }: CredentialsProps) {
  const { isConnected, hasIdentity, address } = useWalletStore();
  const [credentials, setCredentials] = useState<Credential[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [newCredential, setNewCredential] = useState({
    type: '',
    issuer: '',
    expiresAt: '',
    document: null as File | null,
  });

  // Load credentials from localStorage
  const loadCredentials = useCallback(() => {
    if (!address) {
      setCredentials([]);
      setIsLoading(false);
      return;
    }

    try {
      const stored = localStorage.getItem(getStorageKey(address));
      if (stored) {
        const parsed = JSON.parse(stored) as Credential[];
        // Update status based on expiry
        const updated = parsed.map(cred => {
          if (cred.expiresAt && cred.expiresAt < Date.now() && cred.status === 'valid') {
            return { ...cred, status: 'expired' as const };
          }
          return cred;
        });
        setCredentials(updated);
      } else {
        setCredentials([]);
      }
    } catch (error) {
      console.error('Error loading credentials:', error);
      setCredentials([]);
    }
    setIsLoading(false);
  }, [address]);

  // Save credentials to localStorage
  const saveCredentials = useCallback((creds: Credential[]) => {
    if (!address) return;
    try {
      localStorage.setItem(getStorageKey(address), JSON.stringify(creds));
    } catch (error) {
      console.error('Error saving credentials:', error);
    }
  }, [address]);

  // Load on mount and address change
  useEffect(() => {
    loadCredentials();
  }, [loadCredentials]);

  if (!isConnected) {
    return (
      <div className="pt-24 pb-12 px-4 max-w-4xl mx-auto text-center">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <div className="w-16 h-16 rounded-full bg-yellow-100 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-xl font-display font-semibold text-gray-900 mb-2">Wallet Not Connected</h2>
          <p className="text-gray-500">Please connect your wallet to view credentials.</p>
        </div>
      </div>
    );
  }

  if (!hasIdentity) {
    return (
      <div className="pt-24 pb-12 px-4 max-w-4xl mx-auto text-center">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <div className="w-16 h-16 rounded-full bg-violet-100 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h2 className="text-xl font-display font-semibold text-gray-900 mb-2">No Identity Found</h2>
          <p className="text-gray-500 mb-4">Create a VeriChain identity first to manage credentials.</p>
          {onBack && (
            <button onClick={onBack} className="bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-xl shadow-lg hover:from-violet-600 hover:to-purple-700 px-6 py-3 font-medium transition-all">
              Create Identity
            </button>
          )}
        </div>
      </div>
    );
  }

  const handleAddCredential = async () => {
    if (!newCredential.type || !newCredential.issuer) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsUploading(true);

    try {
      let documentHash = '';
      
      // Upload document if provided
      if (newCredential.document) {
        documentHash = await uploadFileToIPFS(newCredential.document);
        toast.success('Document uploaded successfully!');
      }

      // Create credential data
      const credentialId = generateRandomHash().slice(0, 16);
      const credentialData = {
        id: credentialId,
        type: newCredential.type,
        issuer: newCredential.issuer,
        issuedAt: Date.now(),
        holder: address,
        documentHash: documentHash,
        signature: generateRandomHash(), // In production, this would be issuer's signature
      };

      // Encrypt and upload to IPFS
      const secret = generateRandomHash().slice(0, 32);
      const encrypted = encryptData(JSON.stringify(credentialData), secret);
      
      const ipfsHash = await uploadToIPFS({
        encrypted,
        type: 'credential',
        version: '1.0',
      }, `credential-${credentialId}`);

      // Create new credential
      const newCred: Credential = {
        id: credentialId,
        type: newCredential.type,
        issuer: newCredential.issuer,
        issuedAt: Date.now(),
        expiresAt: newCredential.expiresAt ? new Date(newCredential.expiresAt).getTime() : undefined,
        status: 'valid',
        ipfsHash: ipfsHash,
        documentHash: documentHash || undefined,
      };

      // Add to credentials list and save
      const updatedCredentials = [...credentials, newCred];
      setCredentials(updatedCredentials);
      saveCredentials(updatedCredentials);

      toast.success('Credential added successfully!');
      setShowAddModal(false);
      setNewCredential({ type: '', issuer: '', expiresAt: '', document: null });

    } catch (error: any) {
      console.error('Error adding credential:', error);
      toast.error(error.message || 'Failed to add credential');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteCredential = (id: string) => {
    const updatedCredentials = credentials.filter(c => c.id !== id);
    setCredentials(updatedCredentials);
    saveCredentials(updatedCredentials);
    toast.success('Credential removed');
  };

  const getStatusBadge = (status: Credential['status']) => {
    switch (status) {
      case 'valid':
        return <span className="px-2 py-1 text-xs rounded-full bg-emerald-100 text-emerald-600">Valid</span>;
      case 'expired':
        return <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-600">Expired</span>;
      case 'revoked':
        return <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-600">Revoked</span>;
      case 'pending':
        return <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-600">Pending</span>;
    }
  };

  const getCredentialIcon = (type: string) => {
    if (type.toLowerCase().includes('degree') || type.toLowerCase().includes('university')) {
      return (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path d="M12 14l9-5-9-5-9 5 9 5z" />
          <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
        </svg>
      );
    }
    if (type.toLowerCase().includes('certificate')) {
      return (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
        </svg>
      );
    }
    if (type.toLowerCase().includes('kyc')) {
      return (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
        </svg>
      );
    }
    return (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    );
  };

  if (isLoading) {
    return (
      <div className="pt-24 pb-12 px-4 max-w-4xl mx-auto text-center">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <div className="animate-spin w-12 h-12 border-4 border-violet-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-500">Loading credentials...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-12 px-4 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold text-gray-900 mb-2">My Credentials</h1>
          <p className="text-gray-500">Manage your verified credentials and certificates</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-xl shadow-lg hover:from-violet-600 hover:to-purple-700 flex items-center gap-2 px-6 py-3 font-medium transition-all"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Credential
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Credentials</p>
              <p className="text-2xl font-bold text-gray-900">{credentials.length}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-violet-100 flex items-center justify-center">
              <svg className="w-6 h-6 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Valid</p>
              <p className="text-2xl font-bold text-emerald-600">
                {credentials.filter(c => c.status === 'valid').length}
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center">
              <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Expired</p>
              <p className="text-2xl font-bold text-red-600">
                {credentials.filter(c => c.status === 'expired').length}
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Empty State */}
      {credentials.length === 0 && (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 text-center py-16">
          <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-xl font-display font-semibold text-gray-900 mb-2">No Credentials Yet</h3>
          <p className="text-gray-500 mb-6 max-w-md mx-auto">
            Start building your verified digital identity by adding your first credential.
          </p>
          <button 
            onClick={() => setShowAddModal(true)}
            className="bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-xl shadow-lg hover:from-violet-600 hover:to-purple-700 inline-flex items-center gap-2 px-6 py-3 font-medium transition-all"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Your First Credential
          </button>
        </div>
      )}

      {/* Credentials Grid */}
      {credentials.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {credentials.map((credential) => (
            <div key={credential.id} className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:border-violet-300 transition-colors">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-100 to-purple-100 flex items-center justify-center text-violet-600">
                  {getCredentialIcon(credential.type)}
                </div>
                <div className="flex items-center gap-2">
                  {getStatusBadge(credential.status)}
                  <button
                    onClick={() => handleDeleteCredential(credential.id)}
                    className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                    title="Delete credential"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
              
              <h3 className="font-semibold text-gray-900 mb-1">{credential.type}</h3>
              <p className="text-sm text-gray-500 mb-4">Issued by {credential.issuer}</p>
              
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Issued</span>
                <span className="text-gray-600">{formatTimestamp(credential.issuedAt)}</span>
              </div>
              
              {credential.expiresAt && (
                <div className="flex items-center justify-between text-sm mt-2">
                  <span className="text-gray-400">Expires</span>
                  <span className={credential.status === 'expired' ? 'text-red-500' : 'text-gray-600'}>
                    {formatTimestamp(credential.expiresAt)}
                  </span>
                </div>
              )}

              {credential.ipfsHash && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-xs text-gray-400 truncate">
                    IPFS: {credential.ipfsHash.replace('ipfs://', '').slice(0, 20)}...
                  </p>
                </div>
              )}
            </div>
          ))}

          {/* Add New Card */}
          <div 
            onClick={() => setShowAddModal(true)}
            className="bg-white rounded-2xl shadow-lg border-2 border-dashed border-gray-200 hover:border-violet-400 flex flex-col items-center justify-center py-12 cursor-pointer transition-colors p-6"
          >
            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <p className="text-gray-500">Add New Credential</p>
          </div>
        </div>
      )}

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-display font-semibold text-gray-900">Add New Credential</h2>
              <button 
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-700 mb-2">Credential Type *</label>
                <select
                  value={newCredential.type}
                  onChange={(e) => setNewCredential(prev => ({ ...prev, type: e.target.value }))}
                  className="bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:ring-violet-500 focus:border-violet-500 w-full px-4 py-3"
                >
                  <option value="">Select type...</option>
                  <option value="University Degree">University Degree</option>
                  <option value="Professional Certificate">Professional Certificate</option>
                  <option value="KYC Verification">KYC Verification</option>
                  <option value="Employment Verification">Employment Verification</option>
                  <option value="License">License</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-2">Issuer *</label>
                <input
                  type="text"
                  placeholder="e.g., MIT, Google, etc."
                  value={newCredential.issuer}
                  onChange={(e) => setNewCredential(prev => ({ ...prev, issuer: e.target.value }))}
                  className="bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:ring-violet-500 focus:border-violet-500 w-full px-4 py-3"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-2">Expiry Date (Optional)</label>
                <input
                  type="date"
                  value={newCredential.expiresAt}
                  onChange={(e) => setNewCredential(prev => ({ ...prev, expiresAt: e.target.value }))}
                  className="bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:ring-violet-500 focus:border-violet-500 w-full px-4 py-3"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-2">Document (Optional)</label>
                <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center hover:border-violet-400 transition-colors">
                  <input
                    type="file"
                    id="document"
                    className="hidden"
                    accept=".pdf,.png,.jpg,.jpeg"
                    onChange={(e) => setNewCredential(prev => ({ ...prev, document: e.target.files?.[0] || null }))}
                  />
                  <label htmlFor="document" className="cursor-pointer">
                    {newCredential.document ? (
                      <div className="text-emerald-600">
                        <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <p className="font-medium">{newCredential.document.name}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {(newCredential.document.size / 1024).toFixed(1)} KB
                        </p>
                      </div>
                    ) : (
                      <>
                        <svg className="w-8 h-8 mx-auto text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        <p className="text-gray-500">Click to upload or drag and drop</p>
                        <p className="text-xs text-gray-400 mt-1">PDF, PNG, JPG up to 10MB</p>
                      </>
                    )}
                  </label>
                </div>
              </div>
            </div>

            <div className="flex gap-4 mt-6">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl px-6 py-3 font-medium transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleAddCredential}
                disabled={isUploading || !newCredential.type || !newCredential.issuer}
                className="flex-1 bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-xl shadow-lg hover:from-violet-600 hover:to-purple-700 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed px-6 py-3 font-medium transition-all"
              >
                {isUploading ? (
                  <>
                    <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Uploading...</span>
                  </>
                ) : (
                  'Add Credential'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
