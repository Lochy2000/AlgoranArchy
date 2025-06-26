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
import { ErrorBanner } from './components/ErrorBanner';
import { EnhancedTradingModal } from './components/EnhancedTradingModal';
import { TransactionModal } from './components/TransactionModal';
import { AccountModal } from './components/AccountModal';
import { useEnhancedAlgorandStore } from './store/enhancedAlgorandStore';
import { WalletService } from './services/walletService';
import { Rocket, Code, ExternalLink, Wallet, Search } from 'lucide-react';

function App() {
  const { 
    connectedAccount, 
    fetchNodeStatus, 
    fetchLedgerSupply, 
    fetchLatestBlocks,
    fetchLatestTransactions,
    fetchTopAssets,
    fetchDexPools,
    setConnectedAccount,
    fetchAccount,
    startRealTimeUpdates,
    stopRealTimeUpdates,
    error,
    clearError 
  } = useEnhancedAlgorandStore();
  
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [isTradingModalOpen, setIsTradingModalOpen] = useState(false);
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [dismissedBanners, setDismissedBanners] = useState<Set<string>>(new Set());

  useEffect(() => {
    // Initialize data on app load
    console.log('🚀 Initializing Enhanced Algoranarchy app...');
    const environment = (import.meta.env.VITE_ENVIRONMENT || '').toLowerCase();
    const network = environment === 'testnet' ? 'testnet' : 'mainnet';
    const nodeUrl = network === 'testnet'
      ? import.meta.env.VITE_ALGO_NODE_TESTNET
      : import.meta.env.VITE_ALGO_NODE_MAINNET;
    const indexerUrl = network === 'testnet'
      ? import.meta.env.VITE_ALGO_INDEXER_TESTNET
      : import.meta.env.VITE_ALGO_INDEXER_MAINNET;
    console.log('Environment check:', {
      algoToken: import.meta.env.VITE_ALGO_API_TOKEN ? 'Present ✅' : 'Missing ❌',
      moralisKey: import.meta.env.VITE_MORALIS_API_KEY ? 'Present ✅' : 'Missing ❌',
      network,
      nodeUrl,
      indexerUrl,
      peraWalletBridge: import.meta.env.VITE_PERA_WALLET_BRIDGE_URL,
      debugMode: import.meta.env.VITE_DEBUG_MODE
    });
    
    // Initialize wallet services
    WalletService.initializeWallets();
    
    // Fetch initial data
    const initializeData = async () => {
      try {
        await Promise.all([
          fetchNodeStatus(),
          fetchLedgerSupply(),
          fetchLatestBlocks(10),
          fetchLatestTransactions(20),
          fetchTopAssets(20),
          fetchDexPools()
        ]);
        
        // Start real-time updates
        startRealTimeUpdates();
      } catch (error) {
        console.error('Failed to initialize data:', error);
      }
    };

    initializeData();

    // Cleanup on unmount
    return () => {
      stopRealTimeUpdates();
    };
  }, []);

  const handleConnectWallet = () => {
    setConnectionError(null);
    setIsWalletModalOpen(true);
  };

  const handleWalletConnect = async (walletType: 'pera' | 'myalgo' | 'demo') => {
    setIsConnecting(true);
    setConnectionError(null);
    
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
          console.log('✅ Pera wallet connection result:', result);
          
          // Fetch account info for the connected address
          try {
            const accountInfo = await fetchAccount(result.selectedAccount);
            console.log('✅ Account info fetched:', accountInfo);
          } catch (accountError) {
            console.warn('⚠️ Could not fetch account info, using basic account data');
            // Create basic account object if fetch fails
            setConnectedAccount({
              address: result.selectedAccount,
              amount: 0,
              'amount-without-pending-rewards': 0,
              'min-balance': 100000,
              'pending-rewards': 0,
              'reward-base': 0,
              'rewards-total': 0,
              round: 0,
              status: 'Online'
            });
          }
          
        } catch (error) {
          console.error('❌ Pera wallet connection failed:', error);
          throw error;
        }
        
      } else if (walletType === 'myalgo') {
        try {
          const result = await WalletService.connectMyAlgoWallet();
          console.log('✅ MyAlgo wallet connection result:', result);
          
          // Fetch account info for the connected address
          try {
            const accountInfo = await fetchAccount(result.selectedAccount);
            console.log('✅ Account info fetched:', accountInfo);
          } catch (accountError) {
            console.warn('⚠️ Could not fetch account info, using basic account data');
            // Create basic account object if fetch fails
            setConnectedAccount({
              address: result.selectedAccount,
              amount: 0,
              'amount-without-pending-rewards': 0,
              'min-balance': 100000,
              'pending-rewards': 0,
              'reward-base': 0,
              'rewards-total': 0,
              round: 0,
              status: 'Online'
            });
          }
          
        } catch (error) {
          console.error('❌ MyAlgo wallet connection failed:', error);
          throw error;
        }
      }
      
      setIsWalletModalOpen(false);
      
    } catch (error) {
      console.error('❌ Failed to connect wallet:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setConnectionError(errorMessage);
      
      // Don't close modal on error, let user try again
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnectWallet = async () => {
    try {
      await WalletService.disconnectWallet();
      setConnectedAccount(null);
      console.log('🔌 Wallet disconnected');
    } catch (error) {
      console.error('❌ Error disconnecting wallet:', error);
    }
  };

  const handleAccountClick = () => {
    if (connectedAccount) {
      setIsAccountModalOpen(true);
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

  const handleSearchTransactions = () => {
    setIsTransactionModalOpen(true);
  };

  const dismissBanner = (bannerId: string) => {
    setDismissedBanners(prev => new Set([...prev, bannerId]));
  };

  // Check for critical issues
  const hasApiToken = !!import.meta.env.VITE_ALGO_API_TOKEN;
  const showApiTokenBanner = !hasApiToken && !dismissedBanners.has('api-token');

  return (
    <div className="min-h-screen bg-black text-white font-mono relative overflow-x-hidden">
      <PartyMode />
      
      <div className="relative z-10">
        <Header 
          onConnectWallet={handleConnectWallet}
          connectedAddress={connectedAccount?.address}
          onAccountClick={handleAccountClick}
          onDisconnectWallet={handleDisconnectWallet}
        />
        
        <Ticker />
        
        {/* Critical API Token Banner */}
        {showApiTokenBanner && (
          <ErrorBanner
            type="api-token"
            message="Missing Algorand API Token - Some features may not work properly"
            onDismiss={() => dismissBanner('api-token')}
            showHelp={true}
          />
        )}
        
        {/* Error Display */}
        {(error || connectionError) && (
          <ErrorBanner
            type="general"
            message={error || connectionError || 'An error occurred'}
            onDismiss={() => {
              clearError();
              setConnectionError(null);
            }}
            showHelp={false}
          />
        )}
        
        {/* Connection Success Message */}
        {connectedAccount && !error && !connectionError && (
          <div className="bg-green-900/50 border border-green-500 text-green-200 px-4 py-3 mx-4 mt-4 rounded-lg">
            <div className="flex justify-between items-center">
              <span>✅ Wallet connected successfully!</span>
              <div className="flex space-x-2">
                <button 
                  onClick={() => setIsAccountModalOpen(true)}
                  className="text-green-400 hover:text-green-200 flex items-center text-sm"
                >
                  <Wallet className="w-4 h-4 mr-1" />
                  View Account
                </button>
                <button 
                  onClick={handleSearchTransactions}
                  className="text-green-400 hover:text-green-200 flex items-center text-sm"
                >
                  <Search className="w-4 h-4 mr-1" />
                  Search Transactions
                </button>
              </div>
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
                  ALGORANARCHY is your comprehensive gateway to the Algorand ecosystem. Explore real-time blockchain data, 
                  connect multiple wallets, get the best trading quotes across DEXs, search transactions, and monitor 
                  network health - all with our rebellious punk rock interface that breaks the mold.
                </p>
                <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center text-cyan-400">
                    <div className="w-2 h-2 bg-cyan-400 rounded-full mr-3"></div>
                    Real-time blockchain data & analytics
                  </div>
                  <div className="flex items-center text-pink-400">
                    <div className="w-2 h-2 bg-pink-400 rounded-full mr-3"></div>
                    Multi-wallet support (Pera, MyAlgo)
                  </div>
                  <div className="flex items-center text-purple-400">
                    <div className="w-2 h-2 bg-purple-400 rounded-full mr-3"></div>
                    Best quotes across all DEXs
                  </div>
                  <div className="flex items-center text-yellow-400">
                    <div className="w-2 h-2 bg-yellow-400 rounded-full mr-3"></div>
                    Transaction search & explorer
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
                <div className="mt-4 flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
                  <button 
                    onClick={handleStartTrading}
                    className="text-sm bg-pink-600 hover:bg-pink-700 text-white px-4 py-2 rounded-lg transition-all"
                  >
                    Enhanced Trading →
                  </button>
                  <button 
                    onClick={handleSearchTransactions}
                    className="text-sm bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-all"
                  >
                    Search Transactions →
                  </button>
                </div>
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
        onClose={() => {
          setIsWalletModalOpen(false);
          setConnectionError(null);
        }}
        onConnect={handleWalletConnect}
      />

      <EnhancedTradingModal 
        isOpen={isTradingModalOpen}
        onClose={() => setIsTradingModalOpen(false)}
      />

      <TransactionModal
        isOpen={isTransactionModalOpen}
        onClose={() => setIsTransactionModalOpen(false)}
      />

      <AccountModal
        isOpen={isAccountModalOpen}
        onClose={() => setIsAccountModalOpen(false)}
        account={connectedAccount}
        onDisconnect={handleDisconnectWallet}
      />

      {/* Debug Panel - only show in development */}
      {import.meta.env.VITE_DEBUG_MODE === 'true' && <DebugPanel />}
    </div>
  );
}

export default App;