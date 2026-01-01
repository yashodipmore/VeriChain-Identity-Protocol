import { useState } from 'react';
import { Header, Hero, Dashboard, CreateIdentity, VerifyIdentity, Credentials, ZKProofGenerator } from './components';
import { useWalletStore } from './store/walletStore';

type Page = 'home' | 'dashboard' | 'create' | 'verify' | 'credentials' | 'zkproof';

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const { isConnected } = useWalletStore();

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard onNavigate={setCurrentPage} />;
      case 'create':
        return <CreateIdentity onSuccess={() => setCurrentPage('dashboard')} />;
      case 'verify':
        return <VerifyIdentity />;
      case 'credentials':
        return <Credentials onBack={() => setCurrentPage('create')} />;
      case 'zkproof':
        return <ZKProofGenerator onBack={() => setCurrentPage('dashboard')} />;
      default:
        return (
          <Hero 
            onGetStarted={() => setCurrentPage(isConnected ? 'create' : 'home')} 
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-900 via-primary-800 to-secondary-900">
      <Header 
        currentPage={currentPage} 
        onNavigate={setCurrentPage} 
      />
      <main>
        {renderPage()}
      </main>
      
      {/* Footer */}
      <footer className="bg-primary-900/50 border-t border-primary-700 py-8 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-xl font-bold text-white mb-4">
                <span className="text-accent-400">Veri</span>Chain
              </h3>
              <p className="text-gray-400 text-sm">
                Decentralized Identity Verification on QIE Blockchain. 
                Secure, private, and trustworthy identity management.
              </p>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <button 
                    onClick={() => setCurrentPage('home')}
                    className="text-gray-400 hover:text-accent-400 transition-colors"
                  >
                    Home
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => setCurrentPage('dashboard')}
                    className="text-gray-400 hover:text-accent-400 transition-colors"
                  >
                    Dashboard
                  </button>
                </li>
                <li>
                  <a 
                    href="https://testnet.qie.digital/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-accent-400 transition-colors"
                  >
                    QIE Explorer
                  </a>
                </li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-4">Resources</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a 
                    href="https://github.com" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-accent-400 transition-colors"
                  >
                    GitHub Repository
                  </a>
                </li>
                <li>
                  <a 
                    href="https://docs.qie.digital/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-accent-400 transition-colors"
                  >
                    QIE Documentation
                  </a>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-primary-700 mt-8 pt-6 text-center">
            <p className="text-gray-500 text-sm">
              © 2025 VeriChain. Built for QIE Blockchain Hackathon.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
