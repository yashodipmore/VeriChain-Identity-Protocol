import { useWalletStore } from '../store/walletStore';

interface HeroProps {
  onGetStarted: () => void;
}

export function Hero({ onGetStarted }: HeroProps) {
  const { isConnected, connect, isConnecting } = useWalletStore();

  return (
    <div className="relative min-h-[80vh] flex items-center justify-center overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-pink-500/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto text-center px-4">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 bg-slate-800/50 border border-slate-700 rounded-full px-4 py-2 mb-8">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="text-sm text-slate-300">Built on QIE Blockchain</span>
        </div>

        {/* Main Heading */}
        <h1 className="text-5xl md:text-7xl font-bold mb-6">
          <span className="gradient-text">Trust Without Borders</span>
          <br />
          <span className="text-white">Privacy Without Compromise</span>
        </h1>

        {/* Subtitle */}
        <p className="text-xl text-slate-400 mb-10 max-w-2xl mx-auto">
          VeriChain is a revolutionary Decentralized Identity (DID) verification system 
          that leverages QIE's free oracle infrastructure to create the world's first 
          <span className="text-indigo-400 font-semibold"> Proof-of-Real-World-Stake </span>
          identity protocol.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          {!isConnected ? (
            <button
              onClick={connect}
              disabled={isConnecting}
              className="btn-primary text-lg px-8 py-4 flex items-center gap-3"
            >
              {isConnecting ? (
                <>
                  <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Connecting...</span>
                </>
              ) : (
                <>
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <span>Get Started</span>
                </>
              )}
            </button>
          ) : (
            <button 
              onClick={onGetStarted}
              className="btn-primary text-lg px-8 py-4"
            >
              Go to Dashboard
            </button>
          )}
          
          <a 
            href="https://qi-blockchain.gitbook.io/qie-oracle" 
            target="_blank" 
            rel="noopener noreferrer"
            className="btn-secondary text-lg px-8 py-4 flex items-center gap-2"
          >
            <span>Learn More</span>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        </div>

        {/* Stats */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="text-center">
            <p className="text-3xl font-bold text-white">25,000+</p>
            <p className="text-sm text-slate-400">TPS Speed</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-white">7</p>
            <p className="text-sm text-slate-400">Live Oracles</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-white">3s</p>
            <p className="text-sm text-slate-400">Finality</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-white">FREE</p>
            <p className="text-sm text-slate-400">Oracle Access</p>
          </div>
        </div>

        {/* Features */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card text-left">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/20 flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">Zero-Knowledge Proofs</h3>
            <p className="text-sm text-slate-400">
              Prove your credentials without revealing sensitive data. 
              Employers can verify degrees without seeing your transcript.
            </p>
          </div>

          <div className="card text-left">
            <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">Dynamic Trust Scores</h3>
            <p className="text-sm text-slate-400">
              Your trust score updates in real-time based on oracle data, 
              on-chain activity, and cross-chain reputation.
            </p>
          </div>

          <div className="card text-left">
            <div className="w-12 h-12 rounded-xl bg-pink-500/20 flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">Decentralized Storage</h3>
            <p className="text-sm text-slate-400">
              Your encrypted credentials are stored on IPFS. 
              Only you control access with your private keys.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
