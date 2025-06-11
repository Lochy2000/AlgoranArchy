import React, { useState, useEffect } from 'react';
import { X, ArrowDownUp, AlertTriangle, ExternalLink } from 'lucide-react';
import { DexService } from '../services/dexService';

interface TradingModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialToken?: {
    symbol: string;
    assetId: number;
  };
}

export const TradingModal: React.FC<TradingModalProps> = ({ isOpen, onClose, initialToken }) => {
  const [inputAmount, setInputAmount] = useState('');
  const [outputAmount, setOutputAmount] = useState('');
  const [inputAsset, setInputAsset] = useState(initialToken?.assetId || 0);
  const [outputAsset, setOutputAsset] = useState(31566704); // USDC
  const [isLoading, setIsLoading] = useState(false);
  const [quote, setQuote] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const assets = [
    { id: 0, symbol: 'ALGO', name: 'Algorand' },
    { id: 31566704, symbol: 'USDC', name: 'USD Coin' },
    { id: 312769, symbol: 'USDT', name: 'Tether USD' },
    { id: 386192725, symbol: 'goETH', name: 'Goerli ETH' },
    { id: 386195940, symbol: 'goBTC', name: 'Goerli BTC' },
  ];

  useEffect(() => {
    if (initialToken) {
      setInputAsset(initialToken.assetId);
    }
  }, [initialToken]);

  const getQuote = async () => {
    if (!inputAmount || parseFloat(inputAmount) <= 0) return;

    setIsLoading(true);
    setError(null);

    try {
      const amount = parseFloat(inputAmount) * 1000000; // Convert to microunits
      const quoteResult = await DexService.getQuote(inputAsset, outputAsset, amount);
      
      if (quoteResult) {
        setQuote(quoteResult);
        setOutputAmount((quoteResult.outputAmount / 1000000).toFixed(6));
      } else {
        setError('Unable to get quote for this pair');
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to get quote');
    } finally {
      setIsLoading(false);
    }
  };

  const swapAssets = () => {
    setInputAsset(outputAsset);
    setOutputAsset(inputAsset);
    setInputAmount(outputAmount);
    setOutputAmount('');
    setQuote(null);
  };

  // Fix popup blocking by using direct click handlers
  const openTinyman = (event: React.MouseEvent) => {
    event.preventDefault();
    const url = `https://app.tinyman.org/#/swap?asset_in=${inputAsset}&asset_out=${outputAsset}`;
    
    // Open immediately in the click handler
    const newWindow = window.open(url, '_blank', 'noopener,noreferrer');
    
    if (!newWindow || newWindow.closed || typeof newWindow.closed == 'undefined') {
      // Fallback: create a temporary link and click it
      const link = document.createElement('a');
      link.href = url;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      onClose();
    }
  };

  const openPact = (event: React.MouseEvent) => {
    event.preventDefault();
    const url = `https://app.pact.fi/add-liquidity/${inputAsset}/${outputAsset}`;
    
    // Open immediately in the click handler
    const newWindow = window.open(url, '_blank', 'noopener,noreferrer');
    
    if (!newWindow || newWindow.closed || typeof newWindow.closed == 'undefined') {
      // Fallback: create a temporary link and click it
      const link = document.createElement('a');
      link.href = url;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 border border-pink-500 rounded-xl p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-pink-400">Trade Tokens</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X size={24} />
          </button>
        </div>

        <div className="space-y-4">
          {/* Input Token */}
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-400">From</span>
              <span className="text-sm text-gray-400">Balance: 0.00</span>
            </div>
            <div className="flex items-center space-x-3">
              <input
                type="number"
                value={inputAmount}
                onChange={(e) => setInputAmount(e.target.value)}
                placeholder="0.0"
                className="flex-1 bg-transparent text-xl font-bold text-white outline-none"
              />
              <select
                value={inputAsset}
                onChange={(e) => setInputAsset(Number(e.target.value))}
                className="bg-gray-700 text-white rounded-lg px-3 py-2"
              >
                {assets.map(asset => (
                  <option key={asset.id} value={asset.id}>{asset.symbol}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Swap Button */}
          <div className="flex justify-center">
            <button
              onClick={swapAssets}
              className="bg-gray-800 hover:bg-gray-700 p-2 rounded-full transition-all"
            >
              <ArrowDownUp size={20} className="text-pink-400" />
            </button>
          </div>

          {/* Output Token */}
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-400">To</span>
              <span className="text-sm text-gray-400">Balance: 0.00</span>
            </div>
            <div className="flex items-center space-x-3">
              <input
                type="text"
                value={outputAmount}
                readOnly
                placeholder="0.0"
                className="flex-1 bg-transparent text-xl font-bold text-white outline-none"
              />
              <select
                value={outputAsset}
                onChange={(e) => setOutputAsset(Number(e.target.value))}
                className="bg-gray-700 text-white rounded-lg px-3 py-2"
              >
                {assets.map(asset => (
                  <option key={asset.id} value={asset.id}>{asset.symbol}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Quote Button */}
          <button
            onClick={getQuote}
            disabled={!inputAmount || isLoading}
            className="w-full bg-cyan-600 hover:bg-cyan-700 disabled:bg-gray-600 text-white py-3 rounded-lg transition-all"
          >
            {isLoading ? 'Getting Quote...' : 'Get Quote'}
          </button>

          {/* Quote Details */}
          {quote && (
            <div className="bg-gray-800 rounded-lg p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Price Impact</span>
                <span className={quote.priceImpact > 5 ? 'text-red-400' : 'text-green-400'}>
                  {quote.priceImpact.toFixed(2)}%
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Fee</span>
                <span className="text-white">{(quote.fee / 1000000).toFixed(6)}</span>
              </div>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="bg-red-900/50 border border-red-500 rounded-lg p-3 flex items-start">
              <AlertTriangle className="w-4 h-4 text-red-400 mr-2 mt-0.5 flex-shrink-0" />
              <span className="text-red-200 text-sm">{error}</span>
            </div>
          )}

          {/* DEX Options */}
          <div className="space-y-3">
            <div className="text-sm text-gray-400 text-center">Choose your preferred DEX:</div>
            
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={openTinyman}
                className="bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg transition-all flex items-center justify-center"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Tinyman
              </button>
              
              <button
                onClick={openPact}
                className="bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-lg transition-all flex items-center justify-center"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Pact
              </button>
            </div>
          </div>

          {/* Disclaimer */}
          <div className="text-xs text-gray-400 text-center">
            Trading redirects to external DEX platforms. Always verify transaction details before confirming.
          </div>
        </div>
      </div>
    </div>
  );
};