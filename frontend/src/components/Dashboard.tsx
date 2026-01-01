import { useWalletStore } from '../store/walletStore';
import { getTrustLevel, formatDate, formatRelativeTime, formatAddress, copyToClipboard, getExplorerUrl } from '../utils/helpers';
import { useState } from 'react';
import toast from 'react-hot-toast';

interface DashboardProps {
  onNavigate?: (page: 'home' | 'dashboard' | 'create' | 'verify' | 'credentials' | 'zkproof') => void;
}

export function Dashboard({ onNavigate }: DashboardProps) {
  const { identity, hasIdentity, address } = useWalletStore();
  const [copied, setCopied] = useState(false);

  if (!hasIdentity || !identity) {
    return null;
  }

  const trustLevel = getTrustLevel(identity.trustScore);

  const handleCopyDID = async () => {
    await copyToClipboard(identity.did);
    setCopied(true);
    toast.success('DID copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div id="dashboard" className="pt-24 pb-12 px-4 max-w-7xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">Manage your decentralized identity</p>
      </div>

      {/* Identity Card */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-violet-50 via-purple-50 to-white"></div>
        
        <div className="relative">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-2xl font-display font-bold text-gray-900 mb-1">Your Digital Identity</h2>
              <p className="text-gray-500">Verified on QIE Blockchain</p>
            </div>
            {identity.verified && (
              <div className="flex items-center gap-2 bg-emerald-50 text-emerald-600 px-4 py-2 rounded-xl border border-emerald-200">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="font-semibold">Verified</span>
              </div>
            )}
          </div>

          {/* DID Display */}
          <div className="bg-gray-50 rounded-xl p-4 mb-6 border border-gray-200">
            <p className="text-xs text-gray-500 mb-2 font-medium">Decentralized Identifier (DID)</p>
            <div className="flex items-center justify-between gap-4">
              <code className="text-sm text-violet-600 font-mono truncate">
                {identity.did}
              </code>
              <button
                onClick={handleCopyDID}
                className="flex-shrink-0 p-2 hover:bg-gray-200 rounded-lg transition-colors"
              >
                {copied ? (
                  <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
              <p className="text-xs text-gray-500 mb-1 font-medium">Wallet Address</p>
              <a 
                href={getExplorerUrl(address!)} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-sm font-medium text-violet-600 hover:underline"
              >
                {formatAddress(address!)}
              </a>
            </div>
            <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
              <p className="text-xs text-gray-500 mb-1 font-medium">Created</p>
              <p className="text-sm font-medium text-gray-900">{formatDate(identity.createdAt)}</p>
            </div>
            <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
              <p className="text-xs text-gray-500 mb-1 font-medium">Last Updated</p>
              <p className="text-sm font-medium text-gray-900">{formatRelativeTime(identity.lastUpdated)}</p>
            </div>
            <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
              <p className="text-xs text-gray-500 mb-1 font-medium">Verifications</p>
              <p className="text-sm font-medium text-gray-900">{identity.verificationCount}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Trust Score Card */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
        <h3 className="text-lg font-display font-semibold text-gray-900 mb-4">Trust Score</h3>
        
        <div className="flex items-center gap-6">
          {/* Score Circle */}
          <div className="relative w-32 h-32">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="64"
                cy="64"
                r="56"
                fill="none"
                stroke="currentColor"
                strokeWidth="8"
                className="text-gray-200"
              />
              <circle
                cx="64"
                cy="64"
                r="56"
                fill="none"
                stroke="currentColor"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={`${(identity.trustScore / 100) * 352} 352`}
                className="text-violet-500"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-bold text-violet-600">
                {identity.trustScore}
              </span>
              <span className="text-xs text-gray-500">/ 100</span>
            </div>
          </div>

          {/* Trust Level Info */}
          <div className="flex-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-50 text-violet-700 border border-violet-200 mb-3">
              <span className="text-sm font-semibold">{trustLevel.label}</span>
            </div>
            <p className="text-gray-500 text-sm mb-4">
              Your trust score is calculated based on oracle verification, on-chain activity, 
              cross-chain reputation, and time-weighted consistency.
            </p>
            
            {/* Score Breakdown */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Oracle Verification</span>
                <span className="font-medium text-gray-900">40%</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">On-Chain Activity</span>
                <span className="font-medium text-gray-900">30%</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Cross-Chain Reputation</span>
                <span className="font-medium text-gray-900">20%</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Time Consistency</span>
                <span className="font-medium text-gray-900">10%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
        <h3 className="text-lg font-display font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Generate ZK Proof */}
          <button
            onClick={() => onNavigate?.('zkproof')}
            className="flex items-center gap-3 p-4 bg-gradient-to-r from-violet-50 to-purple-50 
                       border border-violet-200 rounded-xl hover:border-violet-400 hover:shadow-md transition-all group"
          >
            <div className="p-3 bg-violet-100 rounded-xl group-hover:bg-violet-200 transition-colors">
              <svg className="w-6 h-6 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div className="text-left">
              <p className="font-semibold text-gray-900">Generate ZK Proof</p>
              <p className="text-sm text-gray-500">Prove identity without revealing data</p>
            </div>
          </button>

          {/* Request Verification */}
          <button
            onClick={() => onNavigate?.('verify')}
            className="flex items-center gap-3 p-4 bg-gradient-to-r from-emerald-50 to-teal-50 
                       border border-emerald-200 rounded-xl hover:border-emerald-400 hover:shadow-md transition-all group"
          >
            <div className="p-3 bg-emerald-100 rounded-xl group-hover:bg-emerald-200 transition-colors">
              <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="text-left">
              <p className="font-semibold text-gray-900">Verify Identity</p>
              <p className="text-sm text-gray-500">Verify another user's DID</p>
            </div>
          </button>

          {/* Manage Credentials */}
          <button
            onClick={() => onNavigate?.('credentials')}
            className="flex items-center gap-3 p-4 bg-gradient-to-r from-orange-50 to-amber-50 
                       border border-orange-200 rounded-xl hover:border-orange-400 hover:shadow-md transition-all group"
          >
            <div className="p-3 bg-orange-100 rounded-xl group-hover:bg-orange-200 transition-colors">
              <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
            </div>
            <div className="text-left">
              <p className="font-semibold text-gray-900">Manage Credentials</p>
              <p className="text-sm text-gray-500">Add or update credentials</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
