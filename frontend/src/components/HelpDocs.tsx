import { useState } from 'react';

interface HelpDocsProps {
  onBack?: () => void;
}

export function HelpDocs({ onBack }: HelpDocsProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      id: 1,
      title: 'Install MetaMask',
      subtitle: 'Browser Extension Setup',
      content: (
        <div className="space-y-6">
          <div className="bg-orange-50 border-2 border-orange-200 rounded-2xl p-6">
            <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
              <span className="w-8 h-8 bg-orange-500 text-white rounded-lg flex items-center justify-center text-sm font-bold">1</span>
              Download MetaMask
            </h4>
            <p className="text-gray-600 mb-4">
              MetaMask is a crypto wallet & gateway to blockchain apps. It's available as a browser extension.
            </p>
            <a 
              href="https://metamask.io/download/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-orange-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-orange-600 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download MetaMask
            </a>
          </div>

          <div className="bg-gray-50 border-2 border-gray-200 rounded-2xl p-6">
            <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
              <span className="w-8 h-8 bg-gray-500 text-white rounded-lg flex items-center justify-center text-sm font-bold">2</span>
              Create or Import Wallet
            </h4>
            <ul className="space-y-3 text-gray-600">
              <li className="flex items-start gap-3">
                <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Click on the MetaMask extension icon in your browser</span>
              </li>
              <li className="flex items-start gap-3">
                <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Choose "Create a new wallet" or "Import wallet"</span>
              </li>
              <li className="flex items-start gap-3">
                <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Create a strong password and <strong>securely save your Secret Recovery Phrase</strong></span>
              </li>
            </ul>
          </div>

          <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-5">
            <div className="flex items-start gap-3">
              <svg className="w-6 h-6 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div>
                <p className="font-bold text-red-700">Important Security Warning</p>
                <p className="text-red-600 text-sm mt-1">Never share your Secret Recovery Phrase with anyone. VeriChain will never ask for it.</p>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 2,
      title: 'Add QIE Network',
      subtitle: 'Configure Custom Network',
      content: (
        <div className="space-y-6">
          <div className="bg-orange-50 border-2 border-orange-200 rounded-2xl p-6">
            <h4 className="font-bold text-gray-900 mb-4">Add QIE Networks to MetaMask</h4>
            <p className="text-gray-600 mb-4">
              Follow these steps to add QIE Blockchain networks to MetaMask:
            </p>
            <ol className="space-y-3 text-gray-600">
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 bg-orange-500 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">1</span>
                <span>Open MetaMask and click on the network dropdown (top center)</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 bg-orange-500 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">2</span>
                <span>Click "Add Network" → "Add a network manually"</span>
              </li>
            </ol>
          </div>

          {/* Testnet Configuration */}
          <div className="bg-gray-900 rounded-2xl p-6 text-white">
            <h4 className="font-bold mb-4 flex items-center gap-2">
              <span className="px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-xs font-bold">TESTNET</span>
              <span>QIE Testnet Configuration</span>
            </h4>
            <p className="text-gray-400 text-sm mb-4">Use this for testing and development. Tokens have no real value.</p>
            <div className="space-y-3">
              {[
                { label: 'Network Name', value: 'QIE Testnet' },
                { label: 'RPC URL', value: 'https://rpc1testnet.qie.digital/' },
                { label: 'Chain ID', value: '1983' },
                { label: 'Currency Symbol', value: 'QIE' },
                { label: 'Block Explorer', value: 'https://testnet.qie.digital/' },
              ].map((item, index) => (
                <div key={index} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-gray-800 rounded-xl p-4">
                  <span className="text-gray-400 text-sm font-medium">{item.label}</span>
                  <div className="flex items-center gap-2">
                    <code className="text-yellow-400 text-sm font-mono">{item.value}</code>
                    <button 
                      onClick={() => navigator.clipboard.writeText(item.value)}
                      className="p-1.5 hover:bg-gray-700 rounded-lg transition-colors"
                      title="Copy to clipboard"
                    >
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Mainnet Configuration */}
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 text-white border-2 border-green-500/30">
            <h4 className="font-bold mb-4 flex items-center gap-2">
              <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-xs font-bold">MAINNET</span>
              <span>QIE Mainnet Configuration</span>
            </h4>
            <p className="text-gray-400 text-sm mb-4">Production network. Use real QIE tokens with actual value.</p>
            <div className="space-y-3">
              {[
                { label: 'Network Name', value: 'QIE Mainnet' },
                { label: 'RPC URL', value: 'https://rpc.qie.digital/' },
                { label: 'Chain ID', value: '5765' },
                { label: 'Currency Symbol', value: 'QIE' },
                { label: 'Block Explorer', value: 'https://mainnet.qie.digital/' },
              ].map((item, index) => (
                <div key={index} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-gray-800/50 rounded-xl p-4">
                  <span className="text-gray-400 text-sm font-medium">{item.label}</span>
                  <div className="flex items-center gap-2">
                    <code className="text-green-400 text-sm font-mono">{item.value}</code>
                    <button 
                      onClick={() => navigator.clipboard.writeText(item.value)}
                      className="p-1.5 hover:bg-gray-700 rounded-lg transition-colors"
                      title="Copy to clipboard"
                    >
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-5">
            <div className="flex items-start gap-3">
              <svg className="w-6 h-6 text-blue-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="font-bold text-blue-700">Which Network to Use?</p>
                <p className="text-blue-600 text-sm mt-1">
                  <strong>Testnet:</strong> For learning and testing. Get free tokens from faucet.<br/>
                  <strong>Mainnet:</strong> For production. Requires real QIE tokens.
                </p>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 3,
      title: 'Get Test QIE Tokens',
      subtitle: 'Fund Your Wallet',
      content: (
        <div className="space-y-6">
          <div className="bg-orange-50 border-2 border-orange-200 rounded-2xl p-6">
            <h4 className="font-bold text-gray-900 mb-4">Get Free Testnet Tokens</h4>
            <p className="text-gray-600 mb-4">
              You need QIE testnet tokens to pay for transaction gas fees. Get them for free from the faucet.
            </p>
            
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <span className="w-6 h-6 bg-orange-500 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">1</span>
                <span className="text-gray-600">Copy your wallet address from MetaMask (click on address to copy)</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="w-6 h-6 bg-orange-500 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">2</span>
                <span className="text-gray-600">Visit the QIE Testnet Faucet</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="w-6 h-6 bg-orange-500 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">3</span>
                <span className="text-gray-600">Paste your address and request test tokens</span>
              </div>
            </div>
          </div>

          <a 
            href="https://faucet.qie.digital/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white px-8 py-4 rounded-2xl font-bold text-lg hover:from-orange-600 hover:to-orange-700 transition-all shadow-lg border-2 border-orange-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Open QIE Faucet
          </a>

          <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-5">
            <div className="flex items-start gap-3">
              <svg className="w-6 h-6 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="font-bold text-green-700">You're Almost Ready!</p>
                <p className="text-green-600 text-sm mt-1">Once you receive tokens (usually instant), you can proceed to connect your wallet.</p>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 4,
      title: 'Connect to VeriChain',
      subtitle: 'Link Your Wallet',
      content: (
        <div className="space-y-6">
          <div className="bg-orange-50 border-2 border-orange-200 rounded-2xl p-6">
            <h4 className="font-bold text-gray-900 mb-4">Connect Your Wallet</h4>
            <p className="text-gray-600 mb-4">
              Now let's connect your MetaMask wallet to VeriChain:
            </p>
            
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <span className="w-6 h-6 bg-orange-500 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">1</span>
                <span className="text-gray-600">Make sure MetaMask is on <strong>QIE Testnet</strong></span>
              </div>
              <div className="flex items-start gap-3">
                <span className="w-6 h-6 bg-orange-500 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">2</span>
                <span className="text-gray-600">Click the <strong>"Connect Wallet"</strong> button in the header or homepage</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="w-6 h-6 bg-orange-500 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">3</span>
                <span className="text-gray-600">MetaMask popup will appear - click <strong>"Connect"</strong></span>
              </div>
              <div className="flex items-start gap-3">
                <span className="w-6 h-6 bg-orange-500 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">4</span>
                <span className="text-gray-600">If prompted to switch network, click <strong>"Switch Network"</strong></span>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-gray-50 border-2 border-gray-200 rounded-2xl p-5">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h5 className="font-bold text-gray-900 mb-2">Connected State</h5>
              <p className="text-gray-600 text-sm">You'll see your wallet address and QIE balance in the header.</p>
            </div>
            
            <div className="bg-gray-50 border-2 border-gray-200 rounded-2xl p-5">
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h5 className="font-bold text-gray-900 mb-2">Wrong Network?</h5>
              <p className="text-gray-600 text-sm">If you see "Wrong Network", click on it to switch to QIE Testnet.</p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 5,
      title: 'Create Your Identity',
      subtitle: 'Build Your DID',
      content: (
        <div className="space-y-6">
          <div className="bg-orange-50 border-2 border-orange-200 rounded-2xl p-6">
            <h4 className="font-bold text-gray-900 mb-4">Create Decentralized Identity</h4>
            <p className="text-gray-600 mb-4">
              After connecting, you can create your unique decentralized identity (DID):
            </p>
            
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <span className="w-6 h-6 bg-orange-500 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">1</span>
                <span className="text-gray-600">Click <strong>"Get Started"</strong> or go to <strong>Dashboard</strong></span>
              </div>
              <div className="flex items-start gap-3">
                <span className="w-6 h-6 bg-orange-500 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">2</span>
                <span className="text-gray-600">Fill in your details: <strong>Name, Email</strong> (required), and optional fields</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="w-6 h-6 bg-orange-500 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">3</span>
                <span className="text-gray-600">Click <strong>"Create Identity"</strong></span>
              </div>
              <div className="flex items-start gap-3">
                <span className="w-6 h-6 bg-orange-500 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">4</span>
                <span className="text-gray-600">Approve the transaction in MetaMask</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="w-6 h-6 bg-orange-500 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">5</span>
                <span className="text-gray-600"><strong>IMPORTANT:</strong> Save the encryption key shown - you need it to decrypt your data!</span>
              </div>
            </div>
          </div>

          <div className="bg-violet-50 border-2 border-violet-200 rounded-2xl p-5">
            <h5 className="font-bold text-violet-700 mb-3">What Happens Behind the Scenes?</h5>
            <ul className="space-y-2 text-violet-600 text-sm">
              <li className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4" />
                </svg>
                Your data is encrypted with AES-256 encryption
              </li>
              <li className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4" />
                </svg>
                Encrypted data is uploaded to IPFS (decentralized storage)
              </li>
              <li className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4" />
                </svg>
                Only the IPFS hash is stored on QIE blockchain
              </li>
              <li className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4" />
                </svg>
                Your DID (did:qie:0x...) is generated from your wallet address
              </li>
            </ul>
          </div>
        </div>
      )
    },
    {
      id: 6,
      title: 'Use VeriChain Features',
      subtitle: 'Explore the Platform',
      content: (
        <div className="space-y-6">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-white border-2 border-gray-300 rounded-2xl p-6 hover:border-orange-400 transition-colors">
              <div className="w-12 h-12 bg-violet-100 border-2 border-violet-300 rounded-xl flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h5 className="font-bold text-gray-900 mb-2">Dashboard</h5>
              <p className="text-gray-600 text-sm">View your DID, trust score, and quick actions. Monitor your identity status.</p>
            </div>
            
            <div className="bg-white border-2 border-gray-300 rounded-2xl p-6 hover:border-orange-400 transition-colors">
              <div className="w-12 h-12 bg-orange-100 border-2 border-orange-300 rounded-xl flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
              </div>
              <h5 className="font-bold text-gray-900 mb-2">Credentials</h5>
              <p className="text-gray-600 text-sm">Add verifiable credentials like ID documents, certificates, and proofs.</p>
            </div>
            
            <div className="bg-white border-2 border-gray-300 rounded-2xl p-6 hover:border-orange-400 transition-colors">
              <div className="w-12 h-12 bg-green-100 border-2 border-green-300 rounded-xl flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h5 className="font-bold text-gray-900 mb-2">Verify</h5>
              <p className="text-gray-600 text-sm">Verify other users' DIDs. Check if an identity is authentic and get trust scores.</p>
            </div>
            
            <div className="bg-white border-2 border-gray-300 rounded-2xl p-6 hover:border-orange-400 transition-colors">
              <div className="w-12 h-12 bg-blue-100 border-2 border-blue-300 rounded-xl flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h5 className="font-bold text-gray-900 mb-2">ZK Proofs</h5>
              <p className="text-gray-600 text-sm">Generate zero-knowledge proofs to verify claims without revealing data.</p>
            </div>
          </div>

          <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl p-6 text-white">
            <h4 className="font-bold text-xl mb-3">🎉 You're All Set!</h4>
            <p className="text-orange-100 mb-4">
              You now know everything to use VeriChain. Start by connecting your wallet and creating your decentralized identity!
            </p>
            <button 
              onClick={onBack}
              className="bg-white text-orange-600 font-bold px-8 py-3 rounded-xl hover:bg-orange-50 transition-colors"
            >
              Go to Homepage
            </button>
          </div>
        </div>
      )
    }
  ];

  const currentStepData = steps[currentStep];
  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <div className="pt-24 pb-16 px-4 max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center mb-10">
        <h1 className="font-display text-4xl font-bold text-gray-900 mb-3">
          Getting Started with <span className="text-gradient-orange">VeriChain</span>
        </h1>
        <p className="text-gray-600 text-lg">
          Follow this step-by-step guide to set up your decentralized identity
        </p>
      </div>

      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-gray-600">Step {currentStep + 1} of {steps.length}</span>
          <span className="text-sm font-medium text-orange-600">{Math.round(progress)}% Complete</span>
        </div>
        <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-orange-500 to-orange-600 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>

      {/* Step Indicators */}
      <div className="flex items-center justify-between mb-10 overflow-x-auto pb-2">
        {steps.map((step, index) => (
          <button
            key={step.id}
            onClick={() => setCurrentStep(index)}
            className={`flex flex-col items-center min-w-[80px] transition-all ${
              index <= currentStep ? 'opacity-100' : 'opacity-50'
            }`}
          >
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm border-2 transition-all ${
              index === currentStep 
                ? 'bg-orange-500 border-orange-500 text-white shadow-lg scale-110' 
                : index < currentStep 
                  ? 'bg-green-500 border-green-500 text-white' 
                  : 'bg-white border-gray-300 text-gray-400'
            }`}>
              {index < currentStep ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                step.id
              )}
            </div>
            <span className={`text-xs mt-2 font-medium text-center ${
              index === currentStep ? 'text-orange-600' : 'text-gray-500'
            }`}>
              {step.title.split(' ')[0]}
            </span>
          </button>
        ))}
      </div>

      {/* Content Card */}
      <div className="bg-white border-2 border-gray-300 rounded-3xl p-8 mb-8 shadow-lg">
        <div className="mb-6">
          <span className="text-sm font-semibold text-orange-600 mb-1 block">{currentStepData.subtitle}</span>
          <h2 className="font-display text-2xl font-bold text-gray-900">{currentStepData.title}</h2>
        </div>
        
        {currentStepData.content}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
          disabled={currentStep === 0}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all ${
            currentStep === 0 
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Previous
        </button>

        <div className="text-center">
          <p className="text-sm text-gray-500">
            {currentStep < steps.length - 1 ? (
              <>Next: <span className="font-semibold text-gray-700">{steps[currentStep + 1].title}</span></>
            ) : (
              <span className="font-semibold text-green-600">You're ready to go!</span>
            )}
          </p>
        </div>

        <button
          onClick={() => setCurrentStep(Math.min(steps.length - 1, currentStep + 1))}
          disabled={currentStep === steps.length - 1}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all ${
            currentStep === steps.length - 1 
              ? 'bg-green-500 text-white' 
              : 'bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:from-orange-600 hover:to-orange-700 shadow-lg'
          }`}
        >
          {currentStep === steps.length - 1 ? 'Complete' : 'Next'}
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}
