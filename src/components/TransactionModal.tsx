import React, { useState, useEffect } from 'react';
import { X, Search, ExternalLink, Clock, CheckCircle, AlertCircle, ArrowRight } from 'lucide-react';
import { AlgorandService } from '../services/algorandService';
import type { Transaction } from '../types/algorand';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTxId?: string;
}

export const TransactionModal: React.FC<TransactionModalProps> = ({ 
  isOpen, 
  onClose, 
  initialTxId 
}) => {
  const [searchTxId, setSearchTxId] = useState(initialTxId || '');
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [latestTransactions, setLatestTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    if (isOpen) {
      fetchLatestTransactions();
      if (initialTxId) {
        handleSearch(initialTxId);
      }
    }
  }, [isOpen, initialTxId]);

  const fetchLatestTransactions = async () => {
    try {
      const txs = await AlgorandService.getLatestTransactions(10);
      setLatestTransactions(txs);
    } catch (error) {
      console.warn('Failed to fetch latest transactions:', error);
    }
  };

  const handleSearch = async (txId?: string) => {
    const searchId = txId || searchTxId.trim();
    if (!searchId) return;

    setIsLoading(true);
    setError(null);
    setTransaction(null);

    try {
      const tx = await AlgorandService.getTransaction(searchId);
      setTransaction(tx);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Transaction not found');
    } finally {
      setIsLoading(false);
    }
  };

  const openInExplorer = (txId: string) => {
    const url = AlgorandService.getTransactionExplorerUrl(txId);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const formatAmount = (amount: number, decimals: number = 6): string => {
    return (amount / Math.pow(10, decimals)).toFixed(decimals);
  };

  const getTransactionType = (tx: Transaction): string => {
    if (tx['payment-transaction']) return 'Payment';
    if (tx['asset-transfer-transaction']) return 'Asset Transfer';
    if (tx['application-transaction']) return 'App Call';
    if (tx['asset-config-transaction']) return 'Asset Config';
    if (tx['key-registration-transaction']) return 'Key Registration';
    return tx['tx-type'] || 'Unknown';
  };

  const getTransactionStatus = (tx: Transaction): { status: string; color: string; icon: React.ReactNode } => {
    if (tx['confirmed-round']) {
      return {
        status: 'Confirmed',
        color: 'text-green-400',
        icon: <CheckCircle className="w-4 h-4" />
      };
    }
    return {
      status: 'Pending',
      color: 'text-yellow-400',
      icon: <Clock className="w-4 h-4" />
    };
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 border border-cyan-400 rounded-xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-cyan-400">Transaction Explorer</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-all">
            <X size={24} />
          </button>
        </div>

        {/* Search Section */}
        <div className="mb-6">
          <div className="flex space-x-3">
            <input
              type="text"
              value={searchTxId}
              onChange={(e) => setSearchTxId(e.target.value)}
              placeholder="Enter transaction ID..."
              className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:border-cyan-400 focus:outline-none"
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
            <button
              onClick={() => handleSearch()}
              disabled={isLoading || !searchTxId.trim()}
              className="bg-cyan-600 hover:bg-cyan-700 disabled:bg-gray-600 text-white px-6 py-2 rounded-lg transition-all flex items-center"
            >
              <Search className="w-4 h-4 mr-2" />
              Search
            </button>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-8">
            <div className="animate-spin w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full mx-auto mb-4"></div>
            <div className="text-gray-400">Searching for transaction...</div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-900/50 border border-red-500 rounded-lg p-4 mb-6 flex items-center">
            <AlertCircle className="w-5 h-5 text-red-400 mr-3" />
            <span className="text-red-200">{error}</span>
          </div>
        )}

        {/* Transaction Details */}
        {transaction && (
          <div className="bg-gray-800 rounded-lg p-6 mb-6">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-bold text-white">Transaction Details</h3>
              <button
                onClick={() => openInExplorer(transaction.id)}
                className="text-cyan-400 hover:text-cyan-300 transition-all flex items-center"
              >
                <ExternalLink className="w-4 h-4 mr-1" />
                View in Explorer
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Basic Info */}
              <div className="space-y-4">
                <div>
                  <div className="text-sm text-gray-400">Transaction ID</div>
                  <div className="font-mono text-sm break-all text-white">{transaction.id}</div>
                </div>

                <div>
                  <div className="text-sm text-gray-400">Type</div>
                  <div className="text-white">{getTransactionType(transaction)}</div>
                </div>

                <div>
                  <div className="text-sm text-gray-400">Status</div>
                  <div className={`flex items-center ${getTransactionStatus(transaction).color}`}>
                    {getTransactionStatus(transaction).icon}
                    <span className="ml-2">{getTransactionStatus(transaction).status}</span>
                  </div>
                </div>

                <div>
                  <div className="text-sm text-gray-400">Fee</div>
                  <div className="text-white">{formatAmount(transaction.fee)} ALGO</div>
                </div>
              </div>

              {/* Transaction Specific Details */}
              <div className="space-y-4">
                {transaction['confirmed-round'] && (
                  <div>
                    <div className="text-sm text-gray-400">Confirmed Round</div>
                    <div className="text-white font-mono">{transaction['confirmed-round'].toLocaleString()}</div>
                  </div>
                )}

                <div>
                  <div className="text-sm text-gray-400">Round Time</div>
                  <div className="text-white">
                    {transaction['round-time'] 
                      ? new Date(transaction['round-time'] * 1000).toLocaleString()
                      : 'N/A'
                    }
                  </div>
                </div>

                <div>
                  <div className="text-sm text-gray-400">Sender</div>
                  <div className="font-mono text-sm text-cyan-400 break-all">
                    {AlgorandService.shortenAddress(transaction.sender)}
                  </div>
                </div>

                {/* Payment Transaction Details */}
                {transaction['payment-transaction'] && (
                  <div>
                    <div className="text-sm text-gray-400">Receiver</div>
                    <div className="font-mono text-sm text-cyan-400 break-all">
                      {AlgorandService.shortenAddress(transaction['payment-transaction'].receiver)}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Payment Amount */}
            {transaction['payment-transaction'] && (
              <div className="mt-6 p-4 bg-gray-700 rounded-lg">
                <div className="flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-sm text-gray-400 mb-1">Amount</div>
                    <div className="text-2xl font-bold text-green-400">
                      {formatAmount(transaction['payment-transaction'].amount)} ALGO
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Asset Transfer Details */}
            {transaction['asset-transfer-transaction'] && (
              <div className="mt-6 p-4 bg-gray-700 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-sm text-gray-400">Asset ID</div>
                    <div className="font-mono text-cyan-400">
                      {transaction['asset-transfer-transaction']['asset-id']}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-400">Amount</div>
                    <div className="text-green-400 font-bold">
                      {transaction['asset-transfer-transaction'].amount}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-400">Receiver</div>
                    <div className="font-mono text-cyan-400 text-sm">
                      {AlgorandService.shortenAddress(transaction['asset-transfer-transaction'].receiver)}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Latest Transactions */}
        {!transaction && !isLoading && latestTransactions.length > 0 && (
          <div>
            <h3 className="text-lg font-bold text-white mb-4">Latest Transactions</h3>
            <div className="space-y-3">
              {latestTransactions.map((tx, index) => (
                <div
                  key={tx.id || index}
                  className="bg-gray-800 rounded-lg p-4 hover:bg-gray-700 transition-all cursor-pointer"
                  onClick={() => handleSearch(tx.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="text-cyan-400 font-mono text-sm">
                        {AlgorandService.shortenAddress(tx.id, 8)}
                      </div>
                      <ArrowRight className="w-4 h-4 text-gray-400" />
                      <div className="text-white text-sm">{getTransactionType(tx)}</div>
                    </div>
                    <div className="flex items-center space-x-3">
                      {tx['payment-transaction'] && (
                        <div className="text-green-400 text-sm">
                          {formatAmount(tx['payment-transaction'].amount)} ALGO
                        </div>
                      )}
                      <div className={`flex items-center ${getTransactionStatus(tx).color}`}>
                        {getTransactionStatus(tx).icon}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {!transaction && !isLoading && !error && latestTransactions.length === 0 && (
          <div className="text-center py-8 text-gray-400">
            <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <div>Enter a transaction ID to search for transaction details</div>
          </div>
        )}
      </div>
    </div>
  );
};