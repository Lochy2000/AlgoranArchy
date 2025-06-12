import React, { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown, AlertCircle, ExternalLink } from 'lucide-react';
import { useAlgorandStore } from '../store/algorandStore';
import { PriceService } from '../services/priceService';

export const TokensGrid: React.FC = () => {
  const { topAssets, isLoadingAssets, fetchTopAssets } = useAlgorandStore();
  const [priceData, setPriceData] = useState<any>(null);
  const [isLoadingPrices, setIsLoadingPrices] = useState(false);

  useEffect(() => {
    fetchTopAssets();
    fetchPriceData();
  }, [fetchTopAssets]);

  const fetchPriceData = async () => {
    setIsLoadingPrices(true);
    try {
      const marketData = await PriceService.getMarketData();
      setPriceData(marketData);
    } catch (error) {
      console.error('Failed to fetch price data:', error);
    } finally {
      setIsLoadingPrices(false);
    }
  };

  // Enhanced token data with real prices when available
  const getTokenData = () => {
    const baseTokens = [
      {
        symbol: 'USDC',
        name: 'USD Coin',
        assetId: 31566704,
        color: 'from-blue-500 to-blue-300',
        icon: '$'
      },
      {
        symbol: 'USDT',
        name: 'Tether USD',
        assetId: 312769,
        color: 'from-green-500 to-green-300',
        icon: '₮'
      },
      {
        symbol: 'goETH',
        name: 'Goerli ETH',
        assetId: 386192725,
        color: 'from-purple-500 to-purple-300',
        icon: 'Ξ'
      },
      {
        symbol: 'goBTC',
        name: 'Goerli BTC',
        assetId: 386195940,
        color: 'from-yellow-500 to-yellow-300',
        icon: '₿'
      },
    ];

    return baseTokens.map(token => {
      const realPrice = priceData?.tokens?.[token.assetId.toString()];
      
      if (realPrice) {
        return {
          ...token,
          price: `$${realPrice.price.toFixed(realPrice.price < 1 ? 4 : 2)}`,
          change: `${realPrice.change24h >= 0 ? '+' : ''}${realPrice.change24h.toFixed(2)}%`,
          volume: `${(realPrice.volume24h / 1000000).toFixed(1)}M`,
          trend: realPrice.change24h >= 0 ? 'up' : 'down',
          isReal: true
        };
      }

      // Fallback to mock data
      const mockData = {
        'USDC': { price: '$0.999', change: '+0.1%', volume: '12.4M', trend: 'up' },
        'USDT': { price: '$0.998', change: '-0.2%', volume: '8.7M', trend: 'down' },
        'goETH': { price: '$1,827', change: '+1.5%', volume: '5.2M', trend: 'up' },
        'goBTC': { price: '$30,458', change: '+2.3%', volume: '4.1M', trend: 'up' },
      };

      return {
        ...token,
        ...mockData[token.symbol as keyof typeof mockData],
        isReal: false
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

      {/* Real Algorand Assets Section */}
      {topAssets.length > 0 && (
        <div className="mt-8">
          <h3 className="text-xl font-bold text-cyan-400 mb-4">Real Algorand Assets</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {topAssets.slice(0, 6).map((asset, index) => (
              <div 
                key={asset.index || index}
                className="bg-gray-900 border border-gray-700 p-4 rounded-lg hover:border-cyan-400 transition-all cursor-pointer"
                onClick={(e) => handleTokenClick(e, asset.index)}
              >
                <div className="font-mono text-cyan-400">#{asset.index}</div>
                <div className="font-bold text-white">{asset.params.name || 'Unnamed Asset'}</div>
                <div className="text-sm text-gray-400">{asset.params['unit-name'] || 'N/A'}</div>
                <div className="text-xs text-gray-500 mt-2">
                  Total: {asset.params.total?.toLocaleString() || 'N/A'}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

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