import { useWalletStore } from '../store/walletStore';
import { formatAddress } from '../utils/helpers';
import { QIE_TESTNET } from '../config/constants';

type Page = 'home' | 'dashboard' | 'create' | 'verify' | 'credentials' | 'zkproof';

interface HeaderProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
}

export function Header({ currentPage, onNavigate }: HeaderProps) {
  const { isConnected, isConnecting, address, balance, chainId, connect, disconnect } = useWalletStore();

  const isWrongNetwork = chainId !== null && chainId !== QIE_TESTNET.chainId;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-slate-700/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => onNavigate('home')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <span className="text-xl font-bold">V</span>
            </div>
            <div>
              <h1 className="text-xl font-bold gradient-text">VeriChain</h1>
              <p className="text-xs text-slate-400">Decentralized Identity</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-4">
            <button 
              onClick={() => onNavigate('home')}
              className={`transition-colors ${currentPage === 'home' ? 'text-white font-semibold' : 'text-slate-300 hover:text-white'}`}
            >
              Home
            </button>
            <button 
              onClick={() => onNavigate('dashboard')}
              className={`transition-colors ${currentPage === 'dashboard' ? 'text-white font-semibold' : 'text-slate-300 hover:text-white'}`}
            >
              Dashboard
            </button>
            <button 
              onClick={() => onNavigate('credentials')}
              className={`transition-colors ${currentPage === 'credentials' ? 'text-white font-semibold' : 'text-slate-300 hover:text-white'}`}
            >
              Credentials
            </button>
            <button 
              onClick={() => onNavigate('verify')}
              className={`transition-colors ${currentPage === 'verify' ? 'text-white font-semibold' : 'text-slate-300 hover:text-white'}`}
            >
              Verify
            </button>
          </nav>

          {/* Wallet Connection */}
          <div className="flex items-center gap-4">
            {isConnected ? (
              <>
                {isWrongNetwork && (
                  <span className="text-sm text-red-400 bg-red-500/20 px-3 py-1 rounded-lg">
                    Wrong Network
                  </span>
                )}
                <div className="hidden sm:flex items-center gap-2 bg-slate-800 px-4 py-2 rounded-xl">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
                  <span className="text-sm text-slate-300">{balance} QIE</span>
                </div>
                <button
                  onClick={disconnect}
                  className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 px-4 py-2 rounded-xl transition-colors"
                >
                  <span className="text-sm font-medium">{formatAddress(address!)}</span>
                  <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </button>
              </>
            ) : (
              <button
                onClick={connect}
                disabled={isConnecting}
                className="btn-primary flex items-center gap-2"
              >
                {isConnecting ? (
                  <>
                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Connecting...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <span>Connect Wallet</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
