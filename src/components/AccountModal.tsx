import React, { useState, useEffect } from 'react';
import { X, Copy, ExternalLink, Wallet, RefreshCw, Send, ArrowUpDown } from 'lucide-react';
import { AlgorandService } from '../utils/algorand';
import { useAlgorandStore } from '../store/algorandStore';
import type { AlgorandAccount } from '../types/algorand';

interface AccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  account: AlgorandAccount | null;
  onDisconnect: () => void;
}

export const AccountModal: React.FC<AccountModalProps> = ({ 
  isOpen, 
  onClose, 
  account, 
  onDisconnect 
}) => {
  const [copied, setCopied] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { fetchAccount } = useAlgorandStore();

  if (!isOpen || !account) return null;

  const copyAddress = async () => {
    try {
      await navigator.clipboard.writeText(account.address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy address:', error);
    }
  };

  const refreshAccount = async () => {
    if (!account.address) return;
    
    setIsRefreshing(true);
    try {
      await fetchAccount(account.address);
    } catch (error) {
      console.error('Failed to refresh account:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const openInExplorer = () => {
    const url = AlgorandService.getAccountExplorerUrl(account.address);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleSend = () => {
    // This would open a send transaction modal
    alert('Send functionality requires transaction building and signing. This would typically open a send modal.');
  };

  const handleSwap = () => {
    // This would open the trading modal with this account
    alert('Swap functionality would open the trading modal with this account connected.');
  };

  const formatAlgo = (microAlgos: number): string => {
    return (microAlgos / 1000000).toFixed(6);
  };

  const getAccountStatus = () => {
    if (account.address.includes('DEMO')) {
      return { status: 'Demo Account', color: 'text-pink-400' };
    }
    return { status: account.status || 'Online', color: 'text-green-400' };
  };

  const accountStatus = getAccountStatus();

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 border border-cyan-400 rounded-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-cyan-400 flex items-center">
            <Wallet className="w-5 h-5 mr-2" />
            Account Details
          </h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-all"
          >
            <X size={24} />
          </button>
        </div>

        <div className="space-y-6">
          {/* Account Address */}
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-400">Address</span>
              <div className="flex space-x-2">
                <button
                  onClick={copyAddress}
                  className="text-cyan-400 hover:text-cyan-300 transition-all"
                  title="Copy address"
                >
                  <Copy size={16} />
                </button>
                <button
                  onClick={openInExplorer}
                  className="text-cyan-400 hover:text-cyan-300 transition-all"
                  title="View in explorer"
                >
                  <ExternalLink size={16} />
                </button>
              </div>
            </div>
            <div className="font-mono text-sm break-all text-white">
              {account.address}
            </div>
            {copied && (
              <div className="text-green-400 text-xs mt-1">Address copied!</div>
            )}
          </div>

          {/* Account Balance */}
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-400">ALGO Balance</span>
              <button
                onClick={refreshAccount}
                disabled={isRefreshing}
                className="text-cyan-400 hover:text-cyan-300 transition-all disabled:opacity-50"
                title="Refresh balance"
              >
                <RefreshCw size={16} className={isRefreshing ? 'animate-spin' : ''} />
              </button>
            </div>
            <div className="text-2xl font-bold text-white">
              {formatAlgo(account.amount)} ALGO
            </div>
            <div className="text-sm text-gray-400">
              Available: {formatAlgo(account['amount-without-pending-rewards'])} ALGO
            </div>
            {account['pending-rewards'] > 0 && (
              <div className="text-sm text-green-400">
                Pending Rewards: {formatAlgo(account['pending-rewards'])} ALGO
              </div>
            )}
          </div>

          {/* Account Status */}
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-gray-400">Status</div>
                <div className={`font-semibold ${accountStatus.color}`}>
                  {accountStatus.status}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-400">Min Balance</div>
                <div className="text-white">
                  {formatAlgo(account['min-balance'])} ALGO
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-400">Round</div>
                <div className="text-white font-mono">
                  {account.round?.toLocaleString() || 'N/A'}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-400">Total Rewards</div>
                <div className="text-white">
                  {formatAlgo(account['rewards-total'])} ALGO
                </div>
              </div>
            </div>
          </div>

          {/* Assets */}
          {account.assets && account.assets.length > 0 && (
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="text-sm text-gray-400 mb-3">Assets ({account.assets.length})</div>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {account.assets.slice(0, 5).map((asset, index) => (
                  <div key={index} className="flex justify-between items-center text-sm">
                    <span className="text-gray-300">Asset #{asset['asset-id']}</span>
                    <span className="text-white font-mono">{asset.amount}</span>
                  </div>
                ))}
                {account.assets.length > 5 && (
                  <div className="text-xs text-gray-400 text-center">
                    +{account.assets.length - 5} more assets
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={handleSend}
              className="bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg transition-all flex items-center justify-center"
            >
              <Send className="w-4 h-4 mr-2" />
              Send
            </button>
            <button
              onClick={handleSwap}
              className="bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-lg transition-all flex items-center justify-center"
            >
              <ArrowUpDown className="w-4 h-4 mr-2" />
              Swap
            </button>
          </div>

          {/* Disconnect Button */}
          <button
            onClick={() => {
              onDisconnect();
              onClose();
            }}
            className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg transition-all"
          >
            Disconnect Wallet
          </button>
        </div>

        {/* Demo Account Notice */}
        {account.address.includes('DEMO') && (
          <div className="mt-4 p-3 bg-pink-900/30 border border-pink-500 rounded-lg">
            <div className="text-pink-400 text-sm">
              <strong>Demo Account:</strong> This is a demonstration account with mock data. 
              Connect a real wallet to see actual balances and perform transactions.
            </div>
          </div>
        )}
      </div>
    </div>
  );
};