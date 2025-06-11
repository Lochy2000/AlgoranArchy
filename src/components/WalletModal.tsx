import React, { useState, useEffect } from 'react';
import { X, Wallet, ExternalLink, AlertCircle, CheckCircle, Download, Globe, Smartphone } from 'lucide-react';
import { WalletService } from '../services/walletService';

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConnect: (walletType: 'pera' | 'myalgo' | 'demo') => void;
}

export const WalletModal: React.FC<WalletModalProps> = ({ isOpen, onClose, onConnect }) => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectingWallet, setConnectingWallet] = useState<string | null>(null);
  const [walletStatus, setWalletStatus] = useState({
    pera: { available: false, error: null },
    myalgo: { available: false, error: null }
  });
  const [extensionStatus, setExtensionStatus] = useState({
    peraExtension: false,
    myalgoExtension: false
  });

  useEffect(() => {
    const checkWalletAvailability = async () => {
      if (isOpen) {
        console.log('🔍 Checking wallet availability...');
        await WalletService.initializeWallets();
        const status = WalletService.getWalletStatus();
        const extensions = await WalletService.checkWalletExtensions();
        
        console.log('Wallet status:', status);
        console.log('Extension status:', extensions);
        
        setWalletStatus(status);
        setExtensionStatus(extensions);
      }
    };

    checkWalletAvailability();
  }, [isOpen]);

  if (!isOpen) return null;

  const handleConnect = async (walletType: 'pera' | 'myalgo' | 'demo') => {
    if (isConnecting) return;
    
    setIsConnecting(true);
    setConnectingWallet(walletType);
    
    try {
      console.log(`🔗 Attempting to connect ${walletType} wallet...`);
      
      if (walletType === 'pera' && !walletStatus.pera.available) {
        throw new Error('Pera Wallet SDK not available. Please install the Pera Wallet app or browser extension.');
      }
      
      if (walletType === 'myalgo' && !walletStatus.myalgo.available) {
        throw new Error('MyAlgo Connect SDK not available. Please install @randlabs/myalgo-connect package.');
      }

      await onConnect(walletType);
      
      // Only close modal on successful connection
      console.log(`✅ ${walletType} wallet connected successfully`);
      
    } catch (error) {
      console.error(`❌ Failed to connect ${walletType} wallet:`, error);
      // Error handling is done in the parent component
      // Don't close modal on error so user can try again
    } finally {
      setIsConnecting(false);
      setConnectingWallet(null);
    }
  };

  const getWalletIcon = (walletType: string, available: boolean) => {
    if (available) {
      return <CheckCircle className="w-4 h-4 text-green-400" />;
    } else {
      return <AlertCircle className="w-4 h-4 text-red-400" />;
    }
  };

  const openPeraWalletDownload = () => {
    window.open('https://perawallet.app/', '_blank', 'noopener,noreferrer');
  };

  const openMyAlgoWallet = () => {
    window.open('https://wallet.myalgo.com/', '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 border border-cyan-400 rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-cyan-400">Connect Wallet</h2>
          <button 
            onClick={onClose}
            disabled={isConnecting}
            className="text-gray-400 hover:text-white transition-all disabled:opacity-50"
          >
            <X size={24} />
          </button>
        </div>

        <div className="space-y-4">
          {/* Pera Wallet */}
          <div className="border border-gray-700 rounded-lg p-4 hover:border-blue-500 transition-all">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mr-3">
                  <Smartphone size={20} />
                </div>
                <div>
                  <div className="font-semibold flex items-center">
                    Pera Wallet
                    <span className="ml-2">
                      {getWalletIcon('pera', walletStatus.pera.available)}
                    </span>
                  </div>
                  <div className="text-sm text-gray-400">
                    {extensionStatus.peraExtension ? 'Extension detected' : 'Mobile & Web wallet'}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <button
                onClick={() => handleConnect('pera')}
                disabled={isConnecting || !walletStatus.pera.available}
                className={`w-full p-3 rounded-lg transition-all flex items-center justify-center ${
                  walletStatus.pera.available 
                    ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                    : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                } ${connectingWallet === 'pera' ? 'animate-pulse' : ''}`}
              >
                {connectingWallet === 'pera' ? (
                  'Connecting...'
                ) : walletStatus.pera.available ? (
                  <>
                    <Wallet className="w-4 h-4 mr-2" />
                    Connect Pera Wallet
                  </>
                ) : (
                  'SDK Not Available'
                )}
              </button>
              
              <button
                onClick={openPeraWalletDownload}
                className="w-full p-2 border border-blue-500 text-blue-400 rounded-lg hover:bg-blue-900/30 transition-all flex items-center justify-center text-sm"
              >
                <Download className="w-4 h-4 mr-2" />
                Download Pera Wallet
              </button>
            </div>
          </div>

          {/* MyAlgo Connect */}
          <div className="border border-gray-700 rounded-lg p-4 hover:border-green-500 transition-all">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center mr-3">
                  <Globe size={20} />
                </div>
                <div>
                  <div className="font-semibold flex items-center">
                    MyAlgo Connect
                    <span className="ml-2">
                      {getWalletIcon('myalgo', walletStatus.myalgo.available)}
                    </span>
                  </div>
                  <div className="text-sm text-gray-400">
                    Web-based wallet interface
                  </div>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <button
                onClick={() => handleConnect('myalgo')}
                disabled={isConnecting || !walletStatus.myalgo.available}
                className={`w-full p-3 rounded-lg transition-all flex items-center justify-center ${
                  walletStatus.myalgo.available 
                    ? 'bg-green-600 hover:bg-green-700 text-white' 
                    : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                } ${connectingWallet === 'myalgo' ? 'animate-pulse' : ''}`}
              >
                {connectingWallet === 'myalgo' ? (
                  'Connecting...'
                ) : walletStatus.myalgo.available ? (
                  <>
                    <Globe className="w-4 h-4 mr-2" />
                    Connect MyAlgo
                  </>
                ) : (
                  'SDK Not Available'
                )}
              </button>
              
              <button
                onClick={openMyAlgoWallet}
                className="w-full p-2 border border-green-500 text-green-400 rounded-lg hover:bg-green-900/30 transition-all flex items-center justify-center text-sm"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Open MyAlgo Wallet
              </button>
            </div>
          </div>

          {/* Demo Account */}
          <div className="border border-pink-500 rounded-lg p-4 hover:border-pink-400 transition-all">
            <button
              onClick={() => handleConnect('demo')}
              disabled={isConnecting}
              className={`w-full p-4 rounded-lg transition-all flex items-center justify-between ${
                connectingWallet === 'demo' ? 'animate-pulse' : ''
              } bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white disabled:opacity-50`}
            >
              <div className="flex items-center">
                <div className="w-10 h-10 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full flex items-center justify-center mr-3">
                  <Wallet size={20} />
                </div>
                <div className="text-left">
                  <div className="font-semibold">Demo Account</div>
                  <div className="text-sm opacity-90">
                    {connectingWallet === 'demo' ? 'Connecting...' : 'Try with demo data (1500 ALGO)'}
                  </div>
                </div>
              </div>
            </button>
          </div>
        </div>

        <div className="mt-6 text-center text-sm text-gray-400">
          By connecting a wallet, you agree to our Terms of Service and Privacy Policy.
        </div>

        {/* Installation Instructions */}
        {(!walletStatus.pera.available || !walletStatus.myalgo.available) && (
          <div className="mt-4 p-3 bg-yellow-900/30 border border-yellow-500 rounded-lg">
            <div className="flex items-start text-yellow-400 text-sm">
              <AlertCircle className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
              <div>
                <div className="font-semibold mb-1">Missing Wallet SDKs</div>
                <div className="text-xs space-y-1">
                  <div>For full functionality, install wallet packages:</div>
                  <code className="bg-black/30 px-2 py-1 rounded block">
                    npm install @perawallet/connect @randlabs/myalgo-connect
                  </code>
                  <div className="mt-2">
                    <strong>Alternative:</strong> Use the demo account to explore features with mock data.
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Wallet Status Debug Info (only in debug mode) */}
        {import.meta.env.VITE_DEBUG_MODE === 'true' && (
          <div className="mt-4 p-3 bg-gray-800 rounded-lg text-xs">
            <div className="text-gray-400 mb-2">Debug Info:</div>
            <div className="space-y-1 text-gray-300">
              <div>Pera SDK: {walletStatus.pera.available ? '✅' : '❌'}</div>
              <div>MyAlgo SDK: {walletStatus.myalgo.available ? '✅' : '❌'}</div>
              <div>Pera Extension: {extensionStatus.peraExtension ? '✅' : '❌'}</div>
              <div>Connecting: {connectingWallet || 'None'}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};