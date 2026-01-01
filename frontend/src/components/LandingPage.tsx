import { useWalletStore } from '../store/walletStore';

interface LandingPageProps {
  onGetStarted: () => void;
}

export function LandingPage({ onGetStarted }: LandingPageProps) {
  const { isConnected, connect, isConnecting } = useWalletStore();

  return (
    <div className="theme-orange">
      {/* Hero Section */}
      <section className="relative min-h-screen bg-white overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-pattern opacity-50"></div>
        
        {/* Orange Gradient Blob */}
        <div className="absolute top-20 right-0 w-[600px] h-[600px] bg-gradient-to-br from-orange-100 via-orange-50 to-transparent rounded-full blur-3xl opacity-60"></div>
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-tr from-orange-100 to-transparent rounded-full blur-3xl opacity-40"></div>
        
        <div className="relative container mx-auto px-6 pt-32 pb-20">
          <div className="max-w-4xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-orange-50 border border-orange-200 rounded-full px-5 py-2.5 mb-8">
              <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></span>
              <span className="text-sm font-medium text-orange-700">Built on QIE Blockchain</span>
            </div>

            {/* Main Heading */}
            <h1 className="font-display heading-xl text-gray-900 mb-6">
              <span className="text-gradient-orange">Trust</span> Without Borders
              <br />
              <span className="text-gray-600 text-4xl md:text-5xl font-semibold">Privacy Without Compromise</span>
            </h1>

            {/* Subtitle */}
            <p className="body-lg text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
              VeriChain is a revolutionary <strong className="text-gray-900">Decentralized Identity (DID)</strong> verification 
              system that leverages QIE's free oracle infrastructure to create the world's first 
              <span className="text-orange-600 font-semibold"> Proof-of-Real-World-Stake </span>
              identity protocol.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
              {!isConnected ? (
                <button
                  onClick={connect}
                  disabled={isConnecting}
                  className="btn-primary text-lg px-10 py-4 flex items-center gap-3"
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
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      <span>Get Started</span>
                    </>
                  )}
                </button>
              ) : (
                <button 
                  onClick={onGetStarted}
                  className="btn-primary text-lg px-10 py-4"
                >
                  Go to Dashboard
                </button>
              )}
              
              <a 
                href="#features" 
                className="btn-secondary text-lg px-8 py-4 flex items-center gap-2"
              >
                <span>Learn More</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </a>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto">
              {[
                { value: '25K+', label: 'TPS Speed', icon: '⚡' },
                { value: '7', label: 'Live Oracles', icon: '🔗' },
                { value: '3s', label: 'Finality', icon: '⏱️' },
                { value: 'FREE', label: 'Oracle Access', icon: '🎁' },
              ].map((stat, index) => (
                <div key={index} className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
                  <div className="text-3xl font-bold text-gray-900 font-display">{stat.value}</div>
                  <div className="text-sm text-gray-500 font-medium mt-1">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Problem Statement Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <h2 className="font-display heading-lg text-gray-900 mb-4">
              The Problem We're <span className="text-gradient-orange">Solving</span>
            </h2>
            <p className="body-lg text-gray-600">
              Current DID solutions are either too centralized, lack privacy, or don't provide 
              reliable verification. VeriChain changes everything.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                ),
                title: 'Centralized Control',
                description: 'Traditional identity systems are controlled by governments and corporations, creating single points of failure.'
              },
              {
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                ),
                title: 'Privacy Concerns',
                description: 'Every verification exposes your personal data. You can\'t prove your age without revealing your birthdate.'
              },
              {
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                ),
                title: 'Trust Issues',
                description: 'No standardized way to verify credentials across platforms, leading to fraud and identity theft.'
              }
            ].map((item, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-2xl p-8 hover:border-orange-200 transition-colors">
                <div className="w-14 h-14 bg-orange-50 rounded-xl flex items-center justify-center text-orange-600 mb-5">
                  {item.icon}
                </div>
                <h3 className="heading-sm text-gray-900 mb-3">{item.title}</h3>
                <p className="body-md text-gray-600">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <h2 className="font-display heading-lg text-gray-900 mb-4">
              Our <span className="text-gradient-orange">Solution</span>
            </h2>
            <p className="body-lg text-gray-600">
              VeriChain combines cutting-edge cryptography with QIE's unique oracle infrastructure.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              {
                icon: (
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                ),
                title: 'Zero-Knowledge Proofs',
                description: 'Prove credentials without revealing sensitive data. Verify age without showing your birthdate.',
                color: 'orange'
              },
              {
                icon: (
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                ),
                title: 'Dynamic Trust Scores',
                description: 'Real-time trust scores based on oracle data, on-chain activity, and cross-chain reputation.',
                color: 'orange'
              },
              {
                icon: (
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                  </svg>
                ),
                title: 'Decentralized Storage',
                description: 'Encrypted credentials stored on IPFS. Only you control access with your private keys.',
                color: 'orange'
              },
              {
                icon: (
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                  </svg>
                ),
                title: 'QIE Oracle Integration',
                description: 'Free access to 7+ real-world data feeds for accurate verification and scoring.',
                color: 'orange'
              },
              {
                icon: (
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                ),
                title: 'AES-256 Encryption',
                description: 'Military-grade encryption with PBKDF2 key derivation protects your personal data.',
                color: 'orange'
              },
              {
                icon: (
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                ),
                title: 'Multi-Sig Governance',
                description: 'Decentralized admin controls with time-locked operations for maximum security.',
                color: 'orange'
              }
            ].map((feature, index) => (
              <div key={index} className="group bg-white border border-gray-200 rounded-2xl p-7 hover:border-orange-300 hover:shadow-lg transition-all">
                <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center text-orange-600 mb-5 group-hover:bg-orange-100 transition-colors">
                  {feature.icon}
                </div>
                <h3 className="heading-sm text-gray-900 mb-2">{feature.title}</h3>
                <p className="body-sm text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Technology Stack Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <h2 className="font-display heading-lg text-gray-900 mb-4">
              Technology <span className="text-gradient-orange">Stack</span>
            </h2>
            <p className="body-lg text-gray-600">
              Built with modern, battle-tested technologies for reliability and performance.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6 max-w-5xl mx-auto">
            {[
              { name: 'Solidity', icon: '📜' },
              { name: 'React', icon: '⚛️' },
              { name: 'TypeScript', icon: '🔷' },
              { name: 'ethers.js', icon: '🔗' },
              { name: 'Hardhat', icon: '👷' },
              { name: 'IPFS', icon: '📦' },
              { name: 'Circom', icon: '🔐' },
              { name: 'Tailwind', icon: '🎨' },
              { name: 'Vite', icon: '⚡' },
              { name: 'Zustand', icon: '🐻' },
              { name: 'OpenZeppelin', icon: '🛡️' },
              { name: 'QIE Oracle', icon: '🔮' },
            ].map((tech, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-xl p-4 text-center hover:border-orange-200 hover:shadow-md transition-all">
                <div className="text-2xl mb-2">{tech.icon}</div>
                <div className="text-sm font-medium text-gray-700">{tech.name}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Smart Contracts Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <h2 className="font-display heading-lg text-gray-900 mb-4">
              Deployed <span className="text-gradient-orange">Smart Contracts</span>
            </h2>
            <p className="body-lg text-gray-600">
              7 production-ready contracts on QIE Testnet
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {[
              { name: 'IdentityRegistry', address: '0x33b9...C6', desc: 'Core DID storage' },
              { name: 'OracleAdapter', address: '0x3237...5B', desc: 'QIE Oracle integration' },
              { name: 'TrustScoreCalculator', address: '0xEb0a...8A', desc: 'Dynamic scoring' },
              { name: 'ZKVerifier', address: '0x056c...4C', desc: 'ZK proof verification' },
              { name: 'MultiSigAdmin', address: '0x6668...6C', desc: 'Governance' },
              { name: 'RateLimiter', address: '0xA9b1...c8', desc: 'Anti-spam protection' },
            ].map((contract, index) => (
              <div key={index} className="bg-gray-50 border border-gray-200 rounded-xl p-5 hover:border-orange-200 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-gray-900">{contract.name}</h4>
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">Live</span>
                </div>
                <code className="text-xs text-orange-600 font-mono">{contract.address}</code>
                <p className="text-sm text-gray-500 mt-2">{contract.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <h2 className="font-display heading-lg text-gray-900 mb-4">
              Meet the <span className="text-gradient-orange">Team</span>
            </h2>
            <p className="body-lg text-gray-600">
              The minds behind VeriChain
            </p>
          </div>

          <div className="flex flex-col md:flex-row justify-center items-center gap-8 max-w-3xl mx-auto">
            {[
              { 
                name: 'Yashodip More', 
                role: 'Full Stack Blockchain Developer',
                desc: 'Smart Contracts • Frontend • Architecture'
              },
              { 
                name: 'Komal Kumavat', 
                role: 'Blockchain Developer',
                desc: 'Research • Testing • Documentation'
              }
            ].map((member, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-2xl p-8 text-center hover:border-orange-200 hover:shadow-lg transition-all flex-1 max-w-sm">
                <div className="w-20 h-20 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-5">
                  {member.name.charAt(0)}
                </div>
                <h3 className="heading-sm text-gray-900 mb-1">{member.name}</h3>
                <p className="text-orange-600 font-medium text-sm mb-3">{member.role}</p>
                <p className="body-sm text-gray-500">{member.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-orange-500 to-orange-600">
        <div className="container mx-auto px-6 text-center">
          <h2 className="font-display heading-lg text-white mb-4">
            Ready to Build Your Digital Identity?
          </h2>
          <p className="text-orange-100 text-lg mb-8 max-w-2xl mx-auto">
            Join the future of decentralized identity verification on QIE Blockchain.
          </p>
          <button 
            onClick={isConnected ? onGetStarted : connect}
            className="bg-white text-orange-600 font-semibold px-10 py-4 rounded-xl hover:bg-orange-50 transition-colors text-lg shadow-lg"
          >
            {isConnected ? 'Go to Dashboard' : 'Connect Wallet & Start'}
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <span className="text-white font-semibold text-lg">VeriChain</span>
            </div>
            
            <div className="text-sm">
              Built for QIE Blockchain Hackathon 2025
            </div>
            
            <div className="flex items-center gap-6">
              <a href="https://github.com/yashodipmore/VeriChain-Identity-Protocol" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                </svg>
              </a>
              <a href="https://testnet.qie.digital" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors text-sm">
                QIE Explorer
              </a>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm">
            © 2025 VeriChain. Built with ❤️ by Yashodip More & Komal Kumavat
          </div>
        </div>
      </footer>
    </div>
  );
}
