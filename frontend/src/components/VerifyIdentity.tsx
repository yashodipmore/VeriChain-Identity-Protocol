import { useState } from 'react';
import { useWalletStore } from '../store/walletStore';
import { formatAddress, formatTimestamp } from '../utils/helpers';
import toast from 'react-hot-toast';

interface VerificationResult {
  exists: boolean;
  did: string;
  trustScore: number;
  verified: boolean;
  createdAt: number;
  verificationCount: number;
}

export function VerifyIdentity() {
  const { isConnected, identityRegistry } = useWalletStore();
  const [addressToVerify, setAddressToVerify] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<VerificationResult | null>(null);

  const handleVerify = async () => {
    if (!identityRegistry) {
      toast.error('Please connect your wallet first');
      return;
    }

    if (!addressToVerify || !/^0x[a-fA-F0-9]{40}$/.test(addressToVerify)) {
      toast.error('Please enter a valid Ethereum address');
      return;
    }

    setIsLoading(true);
    setResult(null);

    try {
      console.log('Verifying address:', addressToVerify);
      
      const hasId = await identityRegistry.hasIdentity(addressToVerify);
      console.log('Has identity:', hasId);
      
      if (!hasId) {
        setResult({
          exists: false,
          did: '',
          trustScore: 0,
          verified: false,
          createdAt: 0,
          verificationCount: 0,
        });
        toast.error('No identity found for this address');
        return;
      }

      const identity = await identityRegistry.getIdentity(addressToVerify);
      console.log('Identity data:', identity);
      
      // Format DID - convert bytes32 to readable format
      const didHex = identity.did;
      const formattedDID = `did:qie:${didHex.slice(0, 10)}...${didHex.slice(-8)}`;
      
      setResult({
        exists: true,
        did: formattedDID,
        trustScore: Number(identity.trustScore),
        verified: identity.verified,
        createdAt: Number(identity.createdAt) * 1000, // Convert to milliseconds
        verificationCount: Number(identity.verificationCount),
      });

      toast.success('Identity verified successfully!');
    } catch (error: any) {
      console.error('Verification error:', error);
      
      // Parse contract errors
      let errorMessage = 'Failed to verify identity';
      if (error.reason) {
        errorMessage = error.reason;
      } else if (error.message) {
        if (error.message.includes('IdentityDoesNotExist')) {
          errorMessage = 'No identity found for this address';
        } else if (error.message.includes('network')) {
          errorMessage = 'Network error. Please check your connection.';
        } else {
          errorMessage = error.message;
        }
      }
      
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const getTrustLevel = (score: number) => {
    if (score >= 80) return { label: 'Elite', class: 'text-indigo-400', bg: 'bg-indigo-500/20' };
    if (score >= 60) return { label: 'High', class: 'text-emerald-400', bg: 'bg-emerald-500/20' };
    if (score >= 40) return { label: 'Medium', class: 'text-yellow-400', bg: 'bg-yellow-500/20' };
    return { label: 'Low', class: 'text-red-400', bg: 'bg-red-500/20' };
  };

  return (
    <div className="pt-24 px-4 max-w-4xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold gradient-text mb-4">Verify Identity</h1>
        <p className="text-slate-400">
          Verify any Ethereum address to check their VeriChain identity and trust score
        </p>
      </div>

      {/* Search Box */}
      <div className="card mb-8">
        <div className="flex flex-col sm:flex-row gap-4">
          <input
            type="text"
            placeholder="Enter Ethereum address (0x...)"
            value={addressToVerify}
            onChange={(e) => setAddressToVerify(e.target.value)}
            className="input-field flex-1 font-mono text-sm"
          />
          <button
            onClick={handleVerify}
            disabled={isLoading || !isConnected}
            className="btn-primary flex items-center justify-center gap-2 min-w-[140px]"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Verifying...</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <span>Verify</span>
              </>
            )}
          </button>
        </div>
        
        {!isConnected && (
          <p className="text-sm text-yellow-400 mt-4">
            ⚠️ Please connect your wallet to verify identities
          </p>
        )}
      </div>

      {/* Result */}
      {result && (
        <div className="card">
          {result.exists ? (
            <>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">Identity Found</h2>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getTrustLevel(result.trustScore).bg} ${getTrustLevel(result.trustScore).class}`}>
                  {getTrustLevel(result.trustScore).label} Trust
                </span>
              </div>

              <div className="space-y-4">
                {/* Address */}
                <div className="flex items-center justify-between py-3 border-b border-slate-700">
                  <span className="text-slate-400">Address</span>
                  <span className="font-mono text-sm">{formatAddress(addressToVerify)}</span>
                </div>

                {/* DID */}
                <div className="flex items-center justify-between py-3 border-b border-slate-700">
                  <span className="text-slate-400">DID</span>
                  <span className="font-mono text-sm truncate max-w-[200px]">{result.did}</span>
                </div>

                {/* Trust Score */}
                <div className="py-3 border-b border-slate-700">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-slate-400">Trust Score</span>
                    <span className={`font-bold ${getTrustLevel(result.trustScore).class}`}>
                      {result.trustScore}/100
                    </span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        result.trustScore >= 80 ? 'bg-indigo-500' :
                        result.trustScore >= 60 ? 'bg-emerald-500' :
                        result.trustScore >= 40 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${result.trustScore}%` }}
                    ></div>
                  </div>
                </div>

                {/* Verified Status */}
                <div className="flex items-center justify-between py-3 border-b border-slate-700">
                  <span className="text-slate-400">Verified</span>
                  <span className={`flex items-center gap-2 ${result.verified ? 'text-emerald-400' : 'text-slate-500'}`}>
                    {result.verified ? (
                      <>
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        Verified
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                        Not Verified
                      </>
                    )}
                  </span>
                </div>

                {/* Created At */}
                <div className="flex items-center justify-between py-3 border-b border-slate-700">
                  <span className="text-slate-400">Created</span>
                  <span>{formatTimestamp(result.createdAt)}</span>
                </div>

                {/* Verification Count */}
                <div className="flex items-center justify-between py-3">
                  <span className="text-slate-400">Times Verified</span>
                  <span className="font-semibold">{result.verificationCount}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 flex gap-4">
                <a
                  href={`https://testnet.qie.digital/address/${addressToVerify}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-secondary flex-1 flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  View on Explorer
                </a>
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">No Identity Found</h3>
              <p className="text-slate-400">
                This address has not created a VeriChain identity yet.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Help Section */}
      <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h4 className="font-semibold mb-1">What is Trust Score?</h4>
              <p className="text-sm text-slate-400">
                Trust Score is calculated using oracle data (40%), on-chain activity (30%), 
                reputation (20%), and consistency (10%). Higher scores indicate more trustworthy identities.
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div>
              <h4 className="font-semibold mb-1">Zero-Knowledge Verification</h4>
              <p className="text-sm text-slate-400">
                VeriChain uses ZK proofs to verify credentials without exposing sensitive data. 
                You can prove attributes without revealing the actual information.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
