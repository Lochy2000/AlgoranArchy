import React, { useState, useEffect } from 'react';
import { X, Wallet, ExternalLink, AlertCircle, CheckCircle } from 'lucide-react';
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

  useEffect(() => {
    const checkWalletAvailability = async () => {
      if (isOpen) {
        await WalletService.initializeWallets();
        const status = WalletService.getWalletStatus();
        setWalletStatus(status);
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
      if (walletType === 'pera' && !walletStatus.pera.available) {
        alert('Pera Wallet SDK not available. Please install @perawallet/connect package.');
        return;
      }
      
      if (walletType === 'myalgo' && !walletStatus.myalgo.available) {
        alert('MyAlgo Connect SDK not available. Please install @randlabs/myalgo-connect package.');
        return;
      }

      await onConnect(walletType);
      onClose();
    } catch (error) {
      console.error(`Failed to connect ${walletType} wallet:`, error);
      // Error handling is done in the parent component
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

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 border border-cyan-400 rounded-xl p-6 w-full max-w-md">
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
          <button
            onClick={() => handleConnect('pera')}
            disabled={isConnecting}
            className={`w-full p-4 border rounded-lg transition-all flex items-center justify-between group disabled:opacity-50 ${
              walletStatus.pera.available 
                ? 'border-gray-700 hover:border-cyan-400' 
                : 'border-red-500 opacity-60'
            } ${connectingWallet === 'pera' ? 'animate-pulse' : ''}`}
          >
            <div className="flex items-center">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mr-3">
                <Wallet size={20} />
              </div>
              <div className="text-left">
                <div className="font-semibold flex items-center">
                  Pera Wallet
                  <span className="ml-2">
                    {getWalletIcon('pera', walletStatus.pera.available)}
                  </span>
                </div>
                <div className="text-sm text-gray-400">
                  {connectingWallet === 'pera' ? 'Connecting...' :
                   walletStatus.pera.available ? 'Connect with Pera Wallet' : 'SDK not installed'}
                </div>
              </div>
            </div>
            <ExternalLink size={16} className="text-gray-400 group-hover:text-cyan-400" />
          </button>

          <button
            onClick={() => handleConnect('myalgo')}
            disabled={isConnecting}
            className={`w-full p-4 border rounded-lg transition-all flex items-center justify-between group disabled:opacity-50 ${
              walletStatus.myalgo.available 
                ? 'border-gray-700 hover:border-cyan-400' 
                : 'border-red-500 opacity-60'
            } ${connectingWallet === 'myalgo' ? 'animate-pulse' : ''}`}
          >
            <div className="flex items-center">
              <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center mr-3">
                <Wallet size={20} />
              </div>
              <div className="text-left">
                <div className="font-semibold flex items-center">
                  MyAlgo Connect
                  <span className="ml-2">
                    {getWalletIcon('myalgo', walletStatus.myalgo.available)}
                  </span>
                </div>
                <div className="text-sm text-gray-400">
                  {connectingWallet === 'myalgo' ? 'Connecting...' :
                   walletStatus.myalgo.available ? 'Connect with MyAlgo' : 'SDK not installed'}
                </div>
              </div>
            </div>
            <ExternalLink size={16} className="text-gray-400 group-hover:text-cyan-400" />
          </button>

          <button
            onClick={() => handleConnect('demo')}
            disabled={isConnecting}
            className={`w-full p-4 border border-pink-500 rounded-lg hover:border-pink-400 transition-all flex items-center justify-between group disabled:opacity-50 ${
              connectingWallet === 'demo' ? 'animate-pulse' : ''
            }`}
          >
            <div className="flex items-center">
              <div className="w-10 h-10 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full flex items-center justify-center mr-3">
                <Wallet size={20} />
              </div>
              <div className="text-left">
                <div className="font-semibold">Demo Account</div>
                <div className="text-sm text-gray-400">
                  {connectingWallet === 'demo' ? 'Connecting...' : 'Try with demo data'}
                </div>
              </div>
            </div>
          </button>
        </div>

        <div className="mt-6 text-center text-sm text-gray-400">
          By connecting a wallet, you agree to our Terms of Service and Privacy Policy.
        </div>

        {(!walletStatus.pera.available || !walletStatus.myalgo.available) && (
          <div className="mt-4 p-3 bg-yellow-900/30 border border-yellow-500 rounded-lg">
            <div className="flex items-start text-yellow-400 text-sm">
              <AlertCircle className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
              <div>
                <div className="font-semibold mb-1">Missing Wallet SDKs</div>
                <div className="text-xs">
                  Install wallet packages: <br />
                  <code className="bg-black/30 px-1 rounded">npm install @perawallet/connect @randlabs/myalgo-connect</code>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};