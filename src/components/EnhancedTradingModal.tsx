import React, { useState, useEffect } from 'react';
import { X, ArrowDownUp, AlertTriangle, ExternalLink, TrendingUp, BarChart3 } from 'lucide-react';
import { EnhancedDexService } from '../services/enhancedDexService';
import type { DexQuote } from '../services/enhancedDexService';

interface EnhancedTradingModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialInputAsset?: number;
  initialOutputAsset?: number;
}

export const EnhancedTradingModal: React.FC<EnhancedTradingModalProps> = ({ 
  isOpen, 
  onClose, 
  initialInputAsset,
  initialOutputAsset 
}) => {
  const [inputAmount, setInputAmount] = useState('');
  const [outputAmount, setOutputAmount] = useState('');
  const [inputAsset, setInputAsset] = useState(initialInputAsset || 0);
  const [outputAsset, setOutputAsset] = useState(initialOutputAsset || 31566704);
  const [isLoading, setIsLoading] = useState(false);
  const [quote, setQuote] = useState<DexQuote | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [slippage, setSlippage] = useState(0.5);
  const [poolAnalytics, setPoolAnalytics] = useState<any>(null);

  const supportedAssets = EnhancedDexService.getAllSupportedAssets();

  useEffect(() => {
    if (initialInputAsset !== undefined) setInputAsset(initialInputAsset);
    if (initialOutputAsset !== undefined) setOutputAsset(initialOutputAsset);
  }, [initialInputAsset, initialOutputAsset]);

  useEffect(() => {
    if (inputAsset !== outputAsset) {
      fetchPoolAnalytics();
    }
  }, [inputAsset, outputAsset]);

  const fetchPoolAnalytics = async () => {
    try {
      const analytics = await EnhancedDexService.getPoolAnalytics(inputAsset, outputAsset);
      setPoolAnalytics(analytics);
    } catch (error) {
      console.warn('Failed to fetch pool analytics:', error);
    }
  };

  const getBestQuote = async () => {
    if (!inputAmount || parseFloat(inputAmount) <= 0) return;

    setIsLoading(true);
    setError(null);

    try {
      const inputAssetInfo = EnhancedDexService.getAssetInfo(inputAsset);
      const amount = parseFloat(inputAmount) * Math.pow(10, inputAssetInfo.decimals);
      
      const bestQuote = await EnhancedDexService.getBestQuote(inputAsset, outputAsset, amount);
      
      if (bestQuote) {
        setQuote(bestQuote);
        const outputAssetInfo = EnhancedDexService.getAssetInfo(outputAsset);
        const formattedOutput = (bestQuote.outputAmount / Math.pow(10, outputAssetInfo.decimals)).toFixed(6);
        setOutputAmount(formattedOutput);
      } else {
        setError('No quotes available for this trading pair');
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

  const openDexApp = (dex: 'tinyman' | 'pact' | 'vestige') => {
    let url: string;
    
    switch (dex) {
      case 'tinyman':
        url = EnhancedDexService.getTinymanUrl(inputAsset, outputAsset);
        break;
      case 'pact':
        url = EnhancedDexService.getPactUrl(inputAsset, outputAsset);
        break;
      case 'vestige':
        url = EnhancedDexService.getVestigeUrl(inputAsset, outputAsset);
        break;
      default:
        return;
    }

    window.open(url, '_blank', 'noopener,noreferrer');
    onClose();
  };

  const formatNumber = (num: number): string => {
    if (num >= 1e9) return (num / 1e9).toFixed(2) + 'B';
    if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M';
    if (num >= 1e3) return (num / 1e3).toFixed(2) + 'K';
    return num.toFixed(2);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 border border-pink-500 rounded-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-pink-400">Enhanced Trading</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X size={24} />
          </button>
        </div>

        <div className="space-y-6">
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
                {supportedAssets.map(asset => (
                  <option key={asset.id} value={asset.id}>
                    {asset.symbol}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Swap Button */}
          <div className="flex justify-center">
            <button
              onClick={swapAssets}
              className="bg-gray-800 hover:bg-gray-700 p-3 rounded-full transition-all"
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
                {supportedAssets.map(asset => (
                  <option key={asset.id} value={asset.id}>
                    {asset.symbol}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Slippage Settings */}
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm text-gray-400">Slippage Tolerance</span>
              <span className="text-sm text-white">{slippage}%</span>
            </div>
            <div className="flex space-x-2">
              {[0.1, 0.5, 1.0, 3.0].map(value => (
                <button
                  key={value}
                  onClick={() => setSlippage(value)}
                  className={`px-3 py-1 rounded text-sm transition-all ${
                    slippage === value 
                      ? 'bg-pink-600 text-white' 
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  {value}%
                </button>
              ))}
            </div>
          </div>

          {/* Get Quote Button */}
          <button
            onClick={getBestQuote}
            disabled={!inputAmount || isLoading || inputAsset === outputAsset}
            className="w-full bg-cyan-600 hover:bg-cyan-700 disabled:bg-gray-600 text-white py-3 rounded-lg transition-all flex items-center justify-center"
          >
            {isLoading ? (
              <>
                <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                Getting Best Quote...
              </>
            ) : (
              'Get Best Quote'
            )}
          </button>

          {/* Quote Details */}
          {quote && (
            <div className="bg-gray-800 rounded-lg p-4 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-400">Best Quote from</span>
                <span className="text-pink-400 font-bold uppercase">{quote.dex}</span>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Price Impact</span>
                  <span className={quote.priceImpact > 5 ? 'text-red-400' : 'text-green-400'}>
                    {quote.priceImpact.toFixed(2)}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Fee</span>
                  <span className="text-white">
                    {(quote.fee / Math.pow(10, EnhancedDexService.getAssetInfo(inputAsset).decimals)).toFixed(6)}
                  </span>
                </div>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-400">Minimum Received</span>
                <span className="text-white">
                  {((quote.outputAmount * (1 - slippage / 100)) / Math.pow(10, EnhancedDexService.getAssetInfo(outputAsset).decimals)).toFixed(6)}
                </span>
              </div>
            </div>
          )}

          {/* Pool Analytics */}
          {poolAnalytics && (
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="flex items-center mb-3">
                <BarChart3 className="w-4 h-4 text-cyan-400 mr-2" />
                <span className="text-sm font-semibold text-cyan-400">Pool Analytics</span>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-gray-400">Total Liquidity</div>
                  <div className="text-white font-mono">
                    ${formatNumber(poolAnalytics.totalLiquidity / 1000000)}
                  </div>
                </div>
                <div>
                  <div className="text-gray-400">24h Volume</div>
                  <div className="text-white font-mono">
                    ${formatNumber(poolAnalytics.volume24h / 1000000)}
                  </div>
                </div>
                <div>
                  <div className="text-gray-400">Average APY</div>
                  <div className="text-green-400 font-mono">
                    {poolAnalytics.averageApy.toFixed(2)}%
                  </div>
                </div>
                <div>
                  <div className="text-gray-400">Pool Count</div>
                  <div className="text-white font-mono">
                    {poolAnalytics.poolCount}
                  </div>
                </div>
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
            
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => openDexApp('tinyman')}
                className="bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg transition-all flex flex-col items-center text-sm"
              >
                <ExternalLink className="w-4 h-4 mb-1" />
                Tinyman
              </button>
              
              <button
                onClick={() => openDexApp('pact')}
                className="bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-lg transition-all flex flex-col items-center text-sm"
              >
                <ExternalLink className="w-4 h-4 mb-1" />
                Pact
              </button>

              <button
                onClick={() => openDexApp('vestige')}
                className="bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg transition-all flex flex-col items-center text-sm"
              >
                <ExternalLink className="w-4 h-4 mb-1" />
                Vestige
              </button>
            </div>
          </div>

          {/* Disclaimer */}
          <div className="text-xs text-gray-400 text-center">
            Quotes are estimates. Actual amounts may vary due to slippage and market conditions.
            Always verify transaction details before confirming.
          </div>
        </div>
      </div>
    </div>
  );
};