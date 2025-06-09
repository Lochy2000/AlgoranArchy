import React, { useEffect, useState } from 'react';
import { Header } from './components/Header';
import { Ticker } from './components/Ticker';
import { Terminal } from './components/Terminal';
import { StatsCards } from './components/StatsCards';
import { BlocksTable } from './components/BlocksTable';
import { TokensGrid } from './components/TokensGrid';
import { NodesSection } from './components/NodesSection';
import { Footer } from './components/Footer';
import { PartyMode } from './components/PartyMode';
import { WalletModal } from './components/WalletModal';
import { DebugPanel } from './components/DebugPanel';
import { TradingModal } from './components/TradingModal';
import { useAlgorandStore } from './store/algorandStore';
import { WalletService } from './services/walletService';
import { Rocket, Code, ExternalLink } from 'lucide-react';

function App() {
  const { 
    connectedAccount, 
    fetchNodeStatus, 
    fetchLedgerSupply, 
    setConnectedAccount,
    error,
    clearError 
  } = useAlgorandStore();
  
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [isTradingModalOpen, setIsTradingModalOpen] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    // Initialize data on app load
    console.log('🚀 Initializing Algoranarchy app...');
    console.log('Environment check:', {
      token: import.meta.env.VITE_ALGO_API_TOKEN ? 'Present' : 'Missing',
      nodeUrl: import.meta.env.VITE_ALGO_NODE_MAINNET,
      indexerUrl: import.meta.env.VITE_ALGO_INDEXER_MAINNET,
      debugMode: import.meta.env.VITE_DEBUG_MODE
    });
    
    // Initialize wallet services
    WalletService.initializeWallets();
    
    fetchNodeStatus();
    fetchLedgerSupply();
  }, [fetchNodeStatus, fetchLedgerSupply]);

  const handleConnectWallet = () => {
    setIsWalletModalOpen(true);
  };

  const handleWalletConnect = async (walletType: 'pera' | 'myalgo' | 'demo') => {
    setIsConnecting(true);
    try {
      console.log(`🔗 Connecting to ${walletType} wallet...`);
      
      if (walletType === 'demo') {
        // Mock connected account for demo
        const mockAccount = {
          address: 'ALGORANARCHYDEMOACCOUNT123456789ABCDEFGHIJKLMNOP',
          amount: 1500000000, // 1500 ALGO
          'amount-without-pending-rewards': 1500000000,
          'min-balance': 100000,
          'pending-rewards': 0,
          'reward-base': 0,
          'rewards-total': 0,
          round: 50000000,
          status: 'Online'
        };
        
        setConnectedAccount(mockAccount);
        console.log('✅ Demo wallet connected:', mockAccount);
      } else if (walletType === 'pera') {
        try {
          const result = await WalletService.connectPeraWallet();
          // Fetch account info for the connected address
          const accountInfo = await useAlgorandStore.getState().fetchAccount(result.selectedAccount);
          console.log('✅ Pera wallet connected:', result.selectedAccount);
        } catch (error) {
          console.error('❌ Pera wallet connection failed:', error);
          throw error;
        }
      } else if (walletType === 'myalgo') {
        try {
          const result = await WalletService.connectMyAlgoWallet();
          // Fetch account info for the connected address
          const accountInfo = await useAlgorandStore.getState().fetchAccount(result.selectedAccount);
          console.log('✅ MyAlgo wallet connected:', result.selectedAccount);
        } catch (error) {
          console.error('❌ MyAlgo wallet connection failed:', error);
          throw error;
        }
      }
    } catch (error) {
      console.error('❌ Failed to connect wallet:', error);
      // Show user-friendly error
      alert(`Failed to connect ${walletType} wallet: ${error.message}`);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleRockTheChain = () => {
    // Open Algorand Foundation website
    window.open('https://algorand.foundation/', '_blank');
  };

  const handleDevTools = () => {
    // Open Algorand Developer Portal
    window.open('https://developer.algorand.org/', '_blank');
  };

  const handleStartTrading = () => {
    setIsTradingModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-black text-white font-mono relative overflow-x-hidden">
      <PartyMode />
      
      <div className="relative z-10">
        <Header 
          onConnectWallet={handleConnectWallet}
          connectedAddress={connectedAccount?.address}
        />
        
        <Ticker />
        
        {/* Error Display */}
        {error && (
          <div className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 mx-4 mt-4 rounded-lg">
            <div className="flex justify-between items-center">
              <span>⚠️ {error}</span>
              <button onClick={clearError} className="text-red-400 hover:text-red-200">
                ×
              </button>
            </div>
          </div>
        )}
        
        <main className="container mx-auto px-4 py-8">
          {/* Hero Section */}
          <section id="dashboard" className="mb-16">
            <div className="flex flex-col md:flex-row items-center justify-between mb-10">
              <div className="md:w-1/2 mb-8 md:mb-0">
                <h2 className="font-bold text-3xl md:text-5xl mb-4">
                  <span className="bg-gradient-to-r from-cyan-400 to-pink-500 text-transparent bg-clip-text">
                    ALGORAND
                  </span>
                  <span className="text-white"> BLOCKCHAIN </span>
                  <span className="bg-gradient-to-r from-pink-500 to-purple-600 text-transparent bg-clip-text">
                    EXPLORER
                  </span>
                </h2>
                <p className="mb-6 text-gray-300 leading-relaxed">
                  ALGORANARCHY is your gateway to the Algorand ecosystem. Explore real-time blockchain data, 
                  connect your wallet, trade tokens, and monitor network health - all with a rebellious punk rock interface 
                  that breaks the mold of traditional blockchain explorers.
                </p>
                <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center text-cyan-400">
                    <div className="w-2 h-2 bg-cyan-400 rounded-full mr-3"></div>
                    Real-time blockchain data
                  </div>
                  <div className="flex items-center text-pink-400">
                    <div className="w-2 h-2 bg-pink-400 rounded-full mr-3"></div>
                    Multi-wallet support
                  </div>
                  <div className="flex items-center text-purple-400">
                    <div className="w-2 h-2 bg-purple-400 rounded-full mr-3"></div>
                    DEX integration & trading
                  </div>
                  <div className="flex items-center text-yellow-400">
                    <div className="w-2 h-2 bg-yellow-400 rounded-full mr-3"></div>
                    Network analytics
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
                  <button 
                    onClick={handleRockTheChain}
                    className="bg-gradient-to-r from-cyan-500 to-purple-600 px-6 py-3 rounded-lg hover:opacity-90 transition-all flex items-center justify-center"
                  >
                    <Rocket className="w-5 h-5 mr-2" />
                    EXPLORE ALGORAND
                    <ExternalLink className="w-4 h-4 ml-2" />
                  </button>
                  <button 
                    onClick={handleDevTools}
                    className="border border-cyan-400 text-cyan-400 px-6 py-3 rounded-lg hover:bg-cyan-900 hover:bg-opacity-30 transition-all flex items-center justify-center"
                  >
                    <Code className="w-5 h-5 mr-2" />
                    DEVELOPER DOCS
                    <ExternalLink className="w-4 h-4 ml-2" />
                  </button>
                </div>
                {!connectedAccount && (
                  <div className="mt-4">
                    <button 
                      onClick={handleStartTrading}
                      className="text-sm bg-pink-600 hover:bg-pink-700 text-white px-4 py-2 rounded-lg transition-all"
                    >
                      Start Trading →
                    </button>
                  </div>
                )}
              </div>
              
              <div className="md:w-1/2 flex justify-center">
                <Terminal />
              </div>
            </div>

            <StatsCards />
          </section>

          <BlocksTable />
          <TokensGrid />
          <NodesSection />
        </main>
        
        <Footer />
      </div>

      <WalletModal 
        isOpen={isWalletModalOpen}
        onClose={() => setIsWalletModalOpen(false)}
        onConnect={handleWalletConnect}
      />

      <TradingModal 
        isOpen={isTradingModalOpen}
        onClose={() => setIsTradingModalOpen(false)}
      />

      {/* Debug Panel - only show in development */}
      {import.meta.env.VITE_DEBUG_MODE === 'true' && <DebugPanel />}
    </div>
  );
}

export default App;