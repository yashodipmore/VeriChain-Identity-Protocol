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
    <div id="dashboard" className="space-y-6">
      {/* Identity Card */}
      <div className="card relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-pink-500/10"></div>
        
        <div className="relative">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold mb-1">Your Digital Identity</h2>
              <p className="text-slate-400">Verified on QIE Blockchain</p>
            </div>
            {identity.verified && (
              <div className="flex items-center gap-2 bg-emerald-500/20 text-emerald-400 px-4 py-2 rounded-xl">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="font-semibold">Verified</span>
              </div>
            )}
          </div>

          {/* DID Display */}
          <div className="bg-slate-900/50 rounded-xl p-4 mb-6">
            <p className="text-xs text-slate-400 mb-2">Decentralized Identifier (DID)</p>
            <div className="flex items-center justify-between gap-4">
              <code className="text-sm text-indigo-400 font-mono truncate">
                {identity.did}
              </code>
              <button
                onClick={handleCopyDID}
                className="flex-shrink-0 p-2 hover:bg-slate-700 rounded-lg transition-colors"
              >
                {copied ? (
                  <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-slate-900/50 rounded-xl p-4">
              <p className="text-xs text-slate-400 mb-1">Wallet Address</p>
              <a 
                href={getExplorerUrl(address!)} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-sm font-medium text-indigo-400 hover:underline"
              >
                {formatAddress(address!)}
              </a>
            </div>
            <div className="bg-slate-900/50 rounded-xl p-4">
              <p className="text-xs text-slate-400 mb-1">Created</p>
              <p className="text-sm font-medium">{formatDate(identity.createdAt)}</p>
            </div>
            <div className="bg-slate-900/50 rounded-xl p-4">
              <p className="text-xs text-slate-400 mb-1">Last Updated</p>
              <p className="text-sm font-medium">{formatRelativeTime(identity.lastUpdated)}</p>
            </div>
            <div className="bg-slate-900/50 rounded-xl p-4">
              <p className="text-xs text-slate-400 mb-1">Verifications</p>
              <p className="text-sm font-medium">{identity.verificationCount}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Trust Score Card */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">Trust Score</h3>
        
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
                className="text-slate-700"
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
                className={trustLevel.color}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={`text-3xl font-bold ${trustLevel.color}`}>
                {identity.trustScore}
              </span>
              <span className="text-xs text-slate-400">/ 100</span>
            </div>
          </div>

          {/* Trust Level Info */}
          <div className="flex-1">
            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${trustLevel.bgColor} ${trustLevel.color} mb-3`}>
              <span className="text-sm font-semibold">{trustLevel.label}</span>
            </div>
            <p className="text-slate-400 text-sm mb-4">
              Your trust score is calculated based on oracle verification, on-chain activity, 
              cross-chain reputation, and time-weighted consistency.
            </p>
            
            {/* Score Breakdown */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400">Oracle Verification</span>
                <span className="font-medium">40%</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400">On-Chain Activity</span>
                <span className="font-medium">30%</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400">Cross-Chain Reputation</span>
                <span className="font-medium">20%</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400">Time Consistency</span>
                <span className="font-medium">10%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Generate ZK Proof */}
          <button
            onClick={() => onNavigate?.('zkproof')}
            className="flex items-center gap-3 p-4 bg-gradient-to-r from-indigo-600/20 to-purple-600/20 
                       border border-indigo-500/30 rounded-xl hover:border-indigo-400/50 transition-all group"
          >
            <div className="p-3 bg-indigo-500/20 rounded-xl group-hover:bg-indigo-500/30 transition-colors">
              <svg className="w-6 h-6 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div className="text-left">
              <p className="font-semibold text-white">Generate ZK Proof</p>
              <p className="text-sm text-slate-400">Prove identity without revealing data</p>
            </div>
          </button>

          {/* Request Verification */}
          <button
            onClick={() => onNavigate?.('verify')}
            className="flex items-center gap-3 p-4 bg-gradient-to-r from-emerald-600/20 to-teal-600/20 
                       border border-emerald-500/30 rounded-xl hover:border-emerald-400/50 transition-all group"
          >
            <div className="p-3 bg-emerald-500/20 rounded-xl group-hover:bg-emerald-500/30 transition-colors">
              <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="text-left">
              <p className="font-semibold text-white">Verify Identity</p>
              <p className="text-sm text-slate-400">Verify another user's DID</p>
            </div>
          </button>

          {/* Manage Credentials */}
          <button
            onClick={() => onNavigate?.('credentials')}
            className="flex items-center gap-3 p-4 bg-gradient-to-r from-amber-600/20 to-orange-600/20 
                       border border-amber-500/30 rounded-xl hover:border-amber-400/50 transition-all group"
          >
            <div className="p-3 bg-amber-500/20 rounded-xl group-hover:bg-amber-500/30 transition-colors">
              <svg className="w-6 h-6 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
            </div>
            <div className="text-left">
              <p className="font-semibold text-white">Manage Credentials</p>
              <p className="text-sm text-slate-400">Add or update credentials</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
