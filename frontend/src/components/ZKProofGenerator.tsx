import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useWalletStore } from '../store/walletStore';
import { hashData } from '../utils/ipfs';
import toast from 'react-hot-toast';

// Component Props
interface ZKProofGeneratorProps {
  onBack?: () => void;
}

// ZK Proof Types
const CREDENTIAL_TYPES = [
  { id: 'DEGREE', label: 'University Degree', icon: '🎓' },
  { id: 'AGE', label: 'Age Verification', icon: '📅' },
  { id: 'EMPLOYMENT', label: 'Employment Status', icon: '💼' },
  { id: 'IDENTITY', label: 'Identity Document', icon: '🪪' },
  { id: 'FINANCIAL', label: 'Financial Status', icon: '💰' },
] as const;

// Zod schema for proof generation
const proofSchema = z.object({
  credentialType: z.string().min(1, 'Please select a credential type'),
  claim: z.string().min(1, 'Please enter a claim'),
  secret: z.string().min(8, 'Secret must be at least 8 characters'),
});

type ProofFormData = z.infer<typeof proofSchema>;

// Simulated ZK Proof structure (in production, use Circom/SnarkJS)
interface ZKProof {
  commitment: string;
  nullifier: string;
  proof: {
    pi_a: string[];
    pi_b: string[][];
    pi_c: string[];
  };
  publicSignals: string[];
  credentialType: string;
  timestamp: number;
}

export function ZKProofGenerator({ onBack }: ZKProofGeneratorProps) {
  const { isConnected, address, zkVerifier } = useWalletStore();
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedProof, setGeneratedProof] = useState<ZKProof | null>(null);
  const [verificationResult, setVerificationResult] = useState<boolean | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    watch,
  } = useForm<ProofFormData>({
    resolver: zodResolver(proofSchema),
    mode: 'onChange',
  });

  const selectedType = watch('credentialType');

  if (!isConnected) {
    return (
      <div className="pt-24 pb-12 px-4 max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 text-center">
          <div className="w-16 h-16 rounded-full bg-yellow-100 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-xl font-display font-semibold text-gray-900 mb-2">Wallet Not Connected</h2>
          <p className="text-gray-500">Please connect your wallet to generate ZK proofs.</p>
        </div>
      </div>
    );
  }

  /**
   * Generate a simulated ZK proof
   * In production, this would use Circom circuits and SnarkJS
   */
  const generateZKProof = async (data: ProofFormData): Promise<ZKProof> => {
    // Simulate proof generation delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Generate commitment (hash of claim + secret)
    const commitment = hashData(`${data.claim}:${data.secret}:${address}`);
    
    // Generate nullifier (prevents double-spending proofs)
    const nullifier = hashData(`${commitment}:${Date.now()}`);
    
    // Simulated proof components (in production, these would be actual ZK-SNARK proofs)
    const proof: ZKProof = {
      commitment: `0x${commitment}`,
      nullifier: `0x${nullifier}`,
      proof: {
        pi_a: [
          '0x' + hashData(`pi_a_0:${commitment}`).slice(0, 64),
          '0x' + hashData(`pi_a_1:${commitment}`).slice(0, 64),
        ],
        pi_b: [
          [
            '0x' + hashData(`pi_b_0_0:${commitment}`).slice(0, 64),
            '0x' + hashData(`pi_b_0_1:${commitment}`).slice(0, 64),
          ],
          [
            '0x' + hashData(`pi_b_1_0:${commitment}`).slice(0, 64),
            '0x' + hashData(`pi_b_1_1:${commitment}`).slice(0, 64),
          ],
        ],
        pi_c: [
          '0x' + hashData(`pi_c_0:${commitment}`).slice(0, 64),
          '0x' + hashData(`pi_c_1:${commitment}`).slice(0, 64),
        ],
      },
      publicSignals: [
        commitment,
        data.credentialType,
        address?.toLowerCase() || '',
      ],
      credentialType: data.credentialType,
      timestamp: Date.now(),
    };

    return proof;
  };

  const onSubmit = async (data: ProofFormData) => {
    setIsGenerating(true);
    setGeneratedProof(null);
    setVerificationResult(null);

    try {
      toast.loading('Generating ZK proof...', { id: 'zk-proof' });

      // Generate the proof
      const proof = await generateZKProof(data);
      setGeneratedProof(proof);

      toast.success('ZK proof generated successfully!', { id: 'zk-proof' });

      // Try to commit the proof on-chain if zkVerifier is available
      if (zkVerifier) {
        try {
          toast.loading('Committing credential on-chain...', { id: 'commit' });
          
          const credentialTypeHash = hashData(data.credentialType);
          const tx = await zkVerifier.commitCredential(
            `0x${credentialTypeHash}`,
            proof.commitment,
            data.credentialType
          );
          await tx.wait();
          
          toast.success('Credential committed on-chain!', { id: 'commit' });
        } catch (err: any) {
          console.error('On-chain commit failed:', err);
          toast.error('On-chain commit failed (credential may already exist)', { id: 'commit' });
        }
      }

    } catch (error: any) {
      console.error('Error generating proof:', error);
      toast.error(error.message || 'Failed to generate proof', { id: 'zk-proof' });
    } finally {
      setIsGenerating(false);
    }
  };

  const verifyProof = async () => {
    if (!generatedProof || !zkVerifier) return;

    try {
      toast.loading('Verifying proof on-chain...', { id: 'verify' });

      const credentialTypeHash = hashData(generatedProof.credentialType);
      const exists = await zkVerifier.hasCredential(
        address,
        `0x${credentialTypeHash}`
      );

      setVerificationResult(exists);
      
      if (exists) {
        toast.success('✅ Credential verified on-chain!', { id: 'verify' });
      } else {
        toast.error('❌ Credential not found on-chain', { id: 'verify' });
      }
    } catch (error: any) {
      console.error('Verification error:', error);
      toast.error('Verification failed', { id: 'verify' });
    }
  };

  const copyProofToClipboard = () => {
    if (generatedProof) {
      navigator.clipboard.writeText(JSON.stringify(generatedProof, null, 2));
      toast.success('Proof copied to clipboard!');
    }
  };

  return (
    <div className="pt-24 px-4 max-w-4xl mx-auto pb-16">
      {/* Back Button */}
      {onBack && (
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-6 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Dashboard
        </button>
      )}

      <div className="text-center mb-12">
        <h1 className="text-4xl font-display font-bold text-gray-900 mb-4">Zero-Knowledge Proofs</h1>
        <p className="text-gray-500 max-w-2xl mx-auto">
          Generate ZK proofs to verify your credentials without revealing sensitive data. 
          Prove you have a degree without showing which university, or prove your age without revealing your birthdate.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Proof Generator Form */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <h2 className="text-xl font-display font-semibold text-gray-900 mb-6 flex items-center gap-2">
            <svg className="w-6 h-6 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            Generate Proof
          </h2>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Credential Type Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Credential Type <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {CREDENTIAL_TYPES.map((type) => (
                  <label
                    key={type.id}
                    className={`relative flex flex-col items-center p-4 rounded-xl border-2 cursor-pointer transition-all
                      ${selectedType === type.id 
                        ? 'border-violet-500 bg-violet-50' 
                        : 'border-gray-200 hover:border-gray-300 bg-white'}`}
                  >
                    <input
                      type="radio"
                      value={type.id}
                      {...register('credentialType')}
                      className="sr-only"
                    />
                    <span className="text-2xl mb-2">{type.icon}</span>
                    <span className="text-xs text-center text-gray-700">{type.label}</span>
                    {selectedType === type.id && (
                      <div className="absolute top-2 right-2 w-4 h-4 bg-violet-500 rounded-full flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </label>
                ))}
              </div>
              {errors.credentialType && (
                <p className="mt-2 text-xs text-red-500">{errors.credentialType.message}</p>
              )}
            </div>

            {/* Claim Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Claim Statement <span className="text-red-500">*</span>
              </label>
              <input
                {...register('claim')}
                type="text"
                className={`bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:ring-violet-500 focus:border-violet-500 w-full px-4 py-3 ${errors.claim ? 'border-red-500' : ''}`}
                placeholder="e.g., Bachelor's Degree in Computer Science"
                disabled={isGenerating}
              />
              {errors.claim && (
                <p className="mt-1 text-xs text-red-500">{errors.claim.message}</p>
              )}
              <p className="mt-1 text-xs text-gray-400">
                This is the claim you want to prove without revealing details.
              </p>
            </div>

            {/* Secret Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Secret Key <span className="text-red-500">*</span>
              </label>
              <input
                {...register('secret')}
                type="password"
                className={`bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:ring-violet-500 focus:border-violet-500 w-full px-4 py-3 ${errors.secret ? 'border-red-500' : ''}`}
                placeholder="Enter a secret passphrase"
                disabled={isGenerating}
              />
              {errors.secret && (
                <p className="mt-1 text-xs text-red-500">{errors.secret.message}</p>
              )}
              <p className="mt-1 text-xs text-gray-400">
                This secret is used to generate your proof. Keep it safe!
              </p>
            </div>

            <button
              type="submit"
              disabled={isGenerating || !isValid}
              className="bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-xl shadow-lg hover:from-violet-600 hover:to-purple-700 w-full flex items-center justify-center gap-2 px-6 py-3 font-medium transition-all disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Generating Proof...</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <span>Generate ZK Proof</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Generated Proof Display */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <h2 className="text-xl font-display font-semibold text-gray-900 mb-6 flex items-center gap-2">
            <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            Proof Output
          </h2>

          {generatedProof ? (
            <div className="space-y-4">
              {/* Proof Summary */}
              <div className="bg-violet-50 border border-violet-200 rounded-xl p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 text-sm">Credential Type</span>
                  <span className="font-mono text-sm text-gray-900">{generatedProof.credentialType}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 text-sm">Commitment</span>
                  <span className="font-mono text-xs truncate max-w-[200px] text-gray-900">
                    {generatedProof.commitment.slice(0, 20)}...
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 text-sm">Nullifier</span>
                  <span className="font-mono text-xs truncate max-w-[200px] text-gray-900">
                    {generatedProof.nullifier.slice(0, 20)}...
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 text-sm">Generated</span>
                  <span className="text-sm text-gray-900">
                    {new Date(generatedProof.timestamp).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Verification Status */}
              {verificationResult !== null && (
                <div className={`rounded-xl p-4 flex items-center gap-3 ${
                  verificationResult ? 'bg-emerald-100' : 'bg-red-100'
                }`}>
                  {verificationResult ? (
                    <>
                      <svg className="w-6 h-6 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="text-emerald-700 font-medium">Verified On-Chain!</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-6 h-6 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                      <span className="text-red-700 font-medium">Not Found On-Chain</span>
                    </>
                  )}
                </div>
              )}

              {/* Proof JSON */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-500">Raw Proof Data</span>
                  <button
                    onClick={copyProofToClipboard}
                    className="text-xs text-violet-600 hover:text-violet-700"
                  >
                    Copy JSON
                  </button>
                </div>
                <pre className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-xs font-mono overflow-x-auto max-h-48 overflow-y-auto text-gray-900">
                  {JSON.stringify(generatedProof, null, 2)}
                </pre>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={verifyProof}
                  className="flex-1 flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl px-6 py-3 font-medium transition-all"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Verify On-Chain
                </button>
                <button
                  onClick={copyProofToClipboard}
                  className="flex-1 flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl px-6 py-3 font-medium transition-all"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                  </svg>
                  Share Proof
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <p className="text-gray-500">
                Generate a proof to see the output here
              </p>
            </div>
          )}
        </div>
      </div>

      {/* How It Works */}
      <div className="mt-12">
        <h2 className="text-2xl font-display font-bold text-center text-gray-900 mb-8">How ZK Proofs Work</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-violet-100 flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">1️⃣</span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Create Commitment</h3>
            <p className="text-sm text-gray-500">
              Your claim and secret are combined to create a cryptographic commitment that hides the actual data.
            </p>
          </div>
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">2️⃣</span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Generate Proof</h3>
            <p className="text-sm text-gray-500">
              A zero-knowledge proof is generated that proves you know the secret without revealing it.
            </p>
          </div>
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-pink-100 flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">3️⃣</span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Verify On-Chain</h3>
            <p className="text-sm text-gray-500">
              Anyone can verify your proof on the blockchain without accessing your private data.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
