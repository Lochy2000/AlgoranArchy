import React, { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown, AlertCircle, ExternalLink } from 'lucide-react';
import { useAlgorandStore } from '../store/algorandStore';
import { PriceService } from '../services/priceService';

export const TokensGrid: React.FC = () => {
  const { topAssets, isLoadingAssets, fetchTopAssets } = useAlgorandStore();
  const [priceData, setPriceData] = useState<Record<string, any> | null>(null);
  const [isLoadingPrices, setIsLoadingPrices] = useState(false);

  useEffect(() => {
    fetchTopAssets();
  }, [fetchTopAssets]);

  useEffect(() => {
    if (topAssets.length > 0) {
      fetchPriceData();
    }
  }, [topAssets]);

  const fetchPriceData = async () => {
    if (topAssets.length === 0) return;
    setIsLoadingPrices(true);
    try {
      const ids = topAssets.slice(0, 6).map(a => a.index.toString());
      const prices = await PriceService.getTokenPrices(ids);
      setPriceData(prices);
    } catch (error) {
      console.warn('Failed to fetch token prices:', error);
    } finally {
      setIsLoadingPrices(false);
    }
  };

  // Enhanced token data with real prices when available
  const getTokenData = () => {
    return topAssets.slice(0, 6).map(asset => {
      const price = priceData?.[asset.index.toString()];
      const symbol = asset.params['unit-name'] || asset.params.name || asset.index.toString();

      return {
        symbol,
        name: asset.params.name || 'Unknown',
        assetId: asset.index,
        color: 'from-pink-500 to-purple-500',
        icon: symbol.charAt(0).toUpperCase(),
        price: price ? `$${price.price.toFixed(price.price < 1 ? 4 : 2)}` : 'N/A',
        change: price ? `${price.change24h >= 0 ? '+' : ''}${price.change24h.toFixed(2)}%` : 'N/A',
        volume: price ? `${(price.volume24h / 1_000_000).toFixed(1)}M` : 'N/A',
        trend: price ? (price.change24h >= 0 ? 'up' : 'down') : 'up',
        isReal: !!price
      };
    });
  };

  // Fix popup blocking by using direct click handler
  const handleTradeClick = (event: React.MouseEvent, token: any) => {
    event.preventDefault();
    event.stopPropagation();
    
    // Create the URL
    const url = `https://app.tinyman.org/#/swap?asset_in=0&asset_out=${token.assetId}`;
    
    // Open immediately in the click handler to avoid popup blocking
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
    }
  };

  const handleTokenClick = (event: React.MouseEvent, assetId: number) => {
    event.preventDefault();
    event.stopPropagation();
    
    if (assetId) {
      const url = `https://algoexplorer.io/asset/${assetId}`;
      
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
      }
    }
  };

  const tokens = getTokenData();

  return (
    <section id="tokens" className="mb-16">
      <div className="flex justify-between items-center mb-8">
        <h2 className="font-bold text-3xl text-white">
          <span className="bg-gradient-to-r from-pink-500 to-purple-600 text-transparent bg-clip-text">
            TOP TOKENS
          </span>
        </h2>
        <div className="flex items-center space-x-4">
          {isLoadingPrices && (
            <div className="flex items-center text-cyan-400">
              <AlertCircle className="w-4 h-4 mr-2 animate-pulse" />
              Loading prices...
            </div>
          )}
          <button
            onClick={fetchPriceData}
            className="text-sm bg-cyan-600 hover:bg-cyan-700 text-white px-3 py-1 rounded"
          >
            Refresh Prices
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {tokens.map((token, index) => {
          const TrendIcon = token.trend === 'up' ? TrendingUp : TrendingDown;
          
          return (
            <div 
              key={index}
              className="bg-black/80 border border-pink-500 p-6 rounded-xl transition-all hover:transform hover:-translate-y-2 hover:shadow-lg hover:shadow-pink-500/30 cursor-pointer relative"
              onClick={(e) => handleTokenClick(e, token.assetId)}
            >
              {/* Real/Mock Data Indicator */}
              <div className="absolute top-2 right-2">
                <div className={`w-2 h-2 rounded-full ${token.isReal ? 'bg-green-400' : 'bg-yellow-400'}`} 
                     title={token.isReal ? 'Real price data' : 'Mock price data'} />
              </div>

              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <div className={`w-10 h-10 bg-gradient-to-r ${token.color} rounded-full flex items-center justify-center text-white font-bold`}>
                    {token.icon}
                  </div>
                  <div className="ml-3">
                    <h3 className="font-bold text-white">{token.symbol}</h3>
                    <p className="text-gray-400 text-sm">{token.name}</p>
                  </div>
                </div>
                <div className={`flex items-center ${token.trend === 'up' ? 'text-green-400' : 'text-red-400'}`}>
                  <TrendIcon className="w-4 h-4 mr-1" />
                  {token.change}
                </div>
              </div>
              
              <div className="mb-4">
                <div className="text-2xl font-bold text-white">{token.price}</div>
                <div className="text-sm text-gray-400">Price</div>
              </div>
              
              <div className="mb-4">
                <div className="text-xl font-mono text-white">{token.volume}</div>
                <div className="text-sm text-gray-400">Volume (24h)</div>
              </div>
              
              <button 
                className="w-full py-2 border border-pink-500 text-pink-500 rounded-lg hover:bg-pink-900 hover:bg-opacity-30 transition-all flex items-center justify-center"
                onClick={(e) => handleTradeClick(e, token)}
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                TRADE
              </button>
            </div>
          );
        })}
      </div>

      {/* Price Data Status */}
      <div className="mt-6 text-center">
        <div className="inline-flex items-center space-x-4 text-sm text-gray-400">
          <div className="flex items-center">
            <div className="w-2 h-2 bg-green-400 rounded-full mr-2" />
            Real price data
          </div>
          <div className="flex items-center">
            <div className="w-2 h-2 bg-yellow-400 rounded-full mr-2" />
            Mock price data
          </div>
        </div>
        <div className="text-xs text-gray-500 mt-2">
          Price data sources: CoinPaprika, CryptoCompare, CoinGecko (fallback to mock data if APIs unavailable)
        </div>
      </div>
    </section>
  );
};