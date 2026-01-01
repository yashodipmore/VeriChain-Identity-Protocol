import { useWalletStore } from '../store/walletStore';
import { formatAddress } from '../utils/helpers';
import { QIE_TESTNET } from '../config/constants';

type Page = 'home' | 'dashboard' | 'create' | 'verify' | 'credentials' | 'zkproof' | 'help';

interface HeaderProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
}

export function Header({ currentPage, onNavigate }: HeaderProps) {
  const { isConnected, isConnecting, address, balance, chainId, connect, disconnect } = useWalletStore();

  const isWrongNetwork = chainId !== null && chainId !== QIE_TESTNET.chainId;
  const isLandingPage = currentPage === 'home';

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 ${isLandingPage ? 'bg-white/95' : 'bg-white/98'} backdrop-blur-md shadow-sm border-b border-gray-100`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => onNavigate('home')}>
            <div className={`w-10 h-10 rounded-xl ${isLandingPage ? 'bg-gradient-to-br from-orange-500 to-orange-600' : 'bg-gradient-to-br from-violet-500 to-purple-600'} flex items-center justify-center shadow-lg`}>
              <span className="text-xl font-bold text-white">V</span>
            </div>
            <div>
              <h1 className="text-xl font-display font-bold text-gray-900">
                <span className={isLandingPage ? 'text-orange-500' : 'text-violet-600'}>Veri</span>Chain
              </h1>
              <p className="text-xs text-gray-500">Decentralized Identity</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <button 
              onClick={() => onNavigate('home')}
              className={`font-medium transition-colors ${currentPage === 'home' 
                ? (isLandingPage ? 'text-orange-600' : 'text-violet-600') 
                : 'text-gray-600 hover:text-gray-900'}`}
            >
              Home
            </button>
            <button 
              onClick={() => onNavigate('dashboard')}
              className={`font-medium transition-colors ${currentPage === 'dashboard' 
                ? 'text-violet-600' 
                : 'text-gray-600 hover:text-gray-900'}`}
            >
              Dashboard
            </button>
            <button 
              onClick={() => onNavigate('credentials')}
              className={`font-medium transition-colors ${currentPage === 'credentials' 
                ? 'text-violet-600' 
                : 'text-gray-600 hover:text-gray-900'}`}
            >
              Credentials
            </button>
            <button 
              onClick={() => onNavigate('verify')}
              className={`font-medium transition-colors ${currentPage === 'verify' 
                ? 'text-violet-600' 
                : 'text-gray-600 hover:text-gray-900'}`}
            >
              Verify
            </button>
            <button 
              onClick={() => onNavigate('help')}
              className={`font-medium transition-colors ${currentPage === 'help' 
                ? 'text-violet-600' 
                : 'text-gray-600 hover:text-gray-900'}`}
            >
              Help
            </button>
          </nav>

          {/* Wallet Connection */}
          <div className="flex items-center gap-4">
            {isConnected ? (
              <>
                {isWrongNetwork && (
                  <span className="text-sm text-red-600 bg-red-50 px-3 py-1 rounded-lg border border-red-200">
                    Wrong Network
                  </span>
                )}
                <div className="hidden sm:flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-xl border border-gray-200">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                  <span className="text-sm text-gray-700 font-medium">{balance} QIE</span>
                </div>
                <button
                  onClick={disconnect}
                  className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-xl transition-colors border border-gray-200"
                >
                  <span className="text-sm font-medium text-gray-700">{formatAddress(address!)}</span>
                  <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </button>
              </>
            ) : (
              <button
                onClick={connect}
                disabled={isConnecting}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-white shadow-lg transition-all ${
                  isLandingPage 
                    ? 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700' 
                    : 'bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
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
