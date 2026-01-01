import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useWalletStore } from '../store/walletStore';
import { uploadToIPFS, encryptData, generateEncryptionKey, hashData } from '../utils/ipfs';
import toast from 'react-hot-toast';

// Zod validation schema
const identitySchema = z.object({
  fullName: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters')
    .regex(/^[a-zA-Z\s]+$/, 'Name can only contain letters and spaces'),
  email: z.string()
    .email('Please enter a valid email address'),
  profession: z.string()
    .max(100, 'Profession must be less than 100 characters')
    .optional()
    .or(z.literal('')),
  location: z.string()
    .max(100, 'Location must be less than 100 characters')
    .optional()
    .or(z.literal('')),
  bio: z.string()
    .max(500, 'Bio must be less than 500 characters')
    .optional()
    .or(z.literal('')),
  dateOfBirth: z.string()
    .optional()
    .or(z.literal('')),
  phone: z.string()
    .regex(/^(\+\d{1,3}[- ]?)?\d{10}$/, 'Please enter a valid phone number')
    .optional()
    .or(z.literal('')),
});

type IdentityFormData = z.infer<typeof identitySchema>;

interface CreateIdentityProps {
  onSuccess?: () => void;
}

export function CreateIdentity({ onSuccess }: CreateIdentityProps) {
  const { isConnected, hasIdentity, createIdentity, address } = useWalletStore();
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(1);
  // Store encryption key for displaying to user after creation
  const [_encryptionKey, setEncryptionKey] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    reset,
  } = useForm<IdentityFormData>({
    resolver: zodResolver(identitySchema),
    mode: 'onChange',
    defaultValues: {
      fullName: '',
      email: '',
      profession: '',
      location: '',
      bio: '',
      dateOfBirth: '',
      phone: '',
    },
  });

  if (!isConnected) {
    return (
      <div className="pt-24 px-4 max-w-2xl mx-auto">
        <div className="card text-center">
          <div className="w-16 h-16 rounded-full bg-yellow-500/20 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold mb-2">Wallet Not Connected</h2>
          <p className="text-slate-400">Please connect your wallet to create an identity.</p>
        </div>
      </div>
    );
  }

  if (hasIdentity) {
    return (
      <div className="pt-24 px-4 max-w-2xl mx-auto">
        <div className="card text-center">
          <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold mb-2">Identity Already Exists</h2>
          <p className="text-slate-400">You have already created a VeriChain identity.</p>
        </div>
      </div>
    );
  }

  const onSubmit = async (data: IdentityFormData) => {
    setIsLoading(true);

    try {
      // Step 1: Generate encryption key
      setStep(2);
      const key = generateEncryptionKey();
      setEncryptionKey(key);

      // Create identity data with metadata
      const identityData = {
        ...data,
        address,
        createdAt: Date.now(),
        version: '1.0',
        dataHash: hashData(JSON.stringify(data)),
      };

      // Encrypt with AES-256
      const encryptedData = encryptData(JSON.stringify(identityData), key);

      // Step 2: Upload to IPFS
      setStep(3);
      const ipfsUri = await uploadToIPFS({
        encrypted: encryptedData,
        version: '1.0',
        protocol: 'VeriChain',
        algorithm: 'AES-256-CBC',
        keyDerivation: 'PBKDF2-SHA256',
      }, `identity-${address}`);

      // Step 3: Create on-chain identity
      setStep(4);
      const txHash = await createIdentity(ipfsUri);
      
      toast.success('Identity created successfully!');
      console.log('Transaction hash:', txHash);
      console.log('IMPORTANT: Save your encryption key:', key);
      
      // Show encryption key modal
      toast((t) => (
        <div className="max-w-sm">
          <p className="font-semibold mb-2">🔐 Save Your Encryption Key!</p>
          <p className="text-xs text-slate-400 mb-2">You need this to decrypt your data later:</p>
          <code className="block bg-slate-800 p-2 rounded text-xs break-all">{key}</code>
          <button 
            onClick={() => {
              navigator.clipboard.writeText(key);
              toast.dismiss(t.id);
              toast.success('Key copied to clipboard!');
            }}
            className="mt-2 text-xs text-indigo-400 hover:text-indigo-300"
          >
            Copy to Clipboard
          </button>
        </div>
      ), { duration: 30000 });
      
      reset();
      
      if (onSuccess) {
        onSuccess();
      }
      
    } catch (error: any) {
      console.error('Error creating identity:', error);
      toast.error(error.message || 'Failed to create identity');
    } finally {
      setIsLoading(false);
      setStep(1);
    }
  };

  return (
    <div className="pt-24 px-4 max-w-2xl mx-auto pb-16">
      <div className="card">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold gradient-text mb-2">Create Your Digital Identity</h2>
          <p className="text-slate-400">
            Your information will be encrypted with AES-256 and stored on IPFS. Only you control access to your data.
          </p>
        </div>

        {/* Progress Steps */}
        {isLoading && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              {['Fill Form', 'Encrypt (AES-256)', 'Upload IPFS', 'Create DID'].map((label, index) => (
                <div key={label} className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                    ${step > index + 1 ? 'bg-emerald-500 text-white' : 
                      step === index + 1 ? 'bg-indigo-500 text-white animate-pulse' : 
                      'bg-slate-700 text-slate-400'}`}
                  >
                    {step > index + 1 ? '✓' : index + 1}
                  </div>
                  {index < 3 && (
                    <div className={`w-12 h-1 mx-1 ${step > index + 1 ? 'bg-emerald-500' : 'bg-slate-700'}`}></div>
                  )}
                </div>
              ))}
            </div>
            <p className="text-center text-sm text-slate-400">
              {step === 2 && 'Encrypting with AES-256-CBC...'}
              {step === 3 && 'Uploading encrypted data to IPFS...'}
              {step === 4 && 'Creating DID on QIE blockchain...'}
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Full Name <span className="text-red-400">*</span>
              </label>
              <input
                {...register('fullName')}
                type="text"
                className={`input-field ${errors.fullName ? 'border-red-500 focus:ring-red-500' : ''}`}
                placeholder="John Doe"
                disabled={isLoading}
              />
              {errors.fullName && (
                <p className="mt-1 text-xs text-red-400">{errors.fullName.message}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Email <span className="text-red-400">*</span>
              </label>
              <input
                {...register('email')}
                type="email"
                className={`input-field ${errors.email ? 'border-red-500 focus:ring-red-500' : ''}`}
                placeholder="john@example.com"
                disabled={isLoading}
              />
              {errors.email && (
                <p className="mt-1 text-xs text-red-400">{errors.email.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Profession */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Profession
              </label>
              <input
                {...register('profession')}
                type="text"
                className={`input-field ${errors.profession ? 'border-red-500 focus:ring-red-500' : ''}`}
                placeholder="Software Engineer"
                disabled={isLoading}
              />
              {errors.profession && (
                <p className="mt-1 text-xs text-red-400">{errors.profession.message}</p>
              )}
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Location
              </label>
              <input
                {...register('location')}
                type="text"
                className={`input-field ${errors.location ? 'border-red-500 focus:ring-red-500' : ''}`}
                placeholder="Mumbai, India"
                disabled={isLoading}
              />
              {errors.location && (
                <p className="mt-1 text-xs text-red-400">{errors.location.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Date of Birth */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Date of Birth
              </label>
              <input
                {...register('dateOfBirth')}
                type="date"
                className="input-field"
                disabled={isLoading}
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Phone Number
              </label>
              <input
                {...register('phone')}
                type="tel"
                className={`input-field ${errors.phone ? 'border-red-500 focus:ring-red-500' : ''}`}
                placeholder="+91 9876543210"
                disabled={isLoading}
              />
              {errors.phone && (
                <p className="mt-1 text-xs text-red-400">{errors.phone.message}</p>
              )}
            </div>
          </div>

          {/* Bio */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Bio
            </label>
            <textarea
              {...register('bio')}
              className={`input-field min-h-[100px] resize-none ${errors.bio ? 'border-red-500 focus:ring-red-500' : ''}`}
              placeholder="Tell us about yourself..."
              disabled={isLoading}
            />
            {errors.bio && (
              <p className="mt-1 text-xs text-red-400">{errors.bio.message}</p>
            )}
          </div>

          {/* Security Info */}
          <div className="bg-slate-900/50 rounded-xl p-4 space-y-3">
            <div className="flex gap-3">
              <svg className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <div>
                <p className="text-sm font-medium text-slate-300">AES-256 Encryption</p>
                <p className="text-xs text-slate-400">
                  Your data is encrypted using military-grade AES-256-CBC encryption with PBKDF2 key derivation.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <svg className="w-5 h-5 text-indigo-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <div>
                <p className="text-sm font-medium text-slate-300">Decentralized Storage</p>
                <p className="text-xs text-slate-400">
                  Encrypted data is stored on IPFS. Only hash references are stored on-chain.
                </p>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading || !isValid}
            className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Creating Identity...</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <span>Create Identity</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
