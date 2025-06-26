interface PriceData {
  symbol: string;
  price: number;
  change24h: number;
  volume24h: number;
  marketCap?: number;
}

interface CoinGeckoResponse {
  [key: string]: {
    usd: number;
    usd_24h_change: number;
    usd_24h_vol: number;
    usd_market_cap: number;
  };
}

interface CoinPaprikaResponse {
  quotes: {
    USD: {
      price: number;
      percent_change_24h: number;
      volume_24h: number;
      market_cap: number;
    };
  };
}

interface MoralisResponse {
  usdPrice: number;
  usdPriceFormatted: string;
  '24hrPercentChange': string;
  exchangeName: string;
  exchangeAddress: string;
}

export class PriceService {
  private static readonly MORALIS_API_KEY = import.meta.env.VITE_MORALIS_API_KEY || '';
  private static readonly MORALIS_API_URL = import.meta.env.VITE_MORALIS_API_URL || 'https://deep-index.moralis.io/api/v2.2';
  private static readonly COINGECKO_BASE_URL = import.meta.env.VITE_COINGECKO_API_URL || 'https://api.coingecko.com/api/v3';
  private static readonly COINPAPRIKA_BASE_URL = import.meta.env.VITE_COINPAPRIKA_API_URL || 'https://api.coinpaprika.com/v1';
  private static readonly CRYPTOCOMPARE_BASE_URL = import.meta.env.VITE_CRYPTOCOMPARE_API_URL || 'https://min-api.cryptocompare.com/data';
  
  // Algorand asset ID to CoinGecko ID mapping
  private static readonly ASSET_MAPPING = {
    '31566704': 'usd-coin', // USDC
    '312769': 'tether', // USDT
    '386192725': 'ethereum', // goETH (using ETH price)
    '386195940': 'bitcoin', // goBTC (using BTC price)
    '0': 'algorand' // ALGO
  };

  private static async makeRequest(url: string, headers: Record<string, string> = {}, timeout: number = 8000): Promise<any> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);
      
      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          ...headers
        },
        mode: 'cors'
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      if (error.name === 'AbortError') {
        throw new Error('Request timeout');
      }
      console.warn(`Request failed for ${url}:`, error.message);
      throw error;
    }
  }

  static async getAlgorandPrice(): Promise<PriceData | null> {

    try {
      // Try Moralis API first (if API key is available)
      if (this.MORALIS_API_KEY) {
        try {
          console.log('🔄 Trying Moralis API for ALGO price...');
          const data = await this.makeRequest(
            `${this.MORALIS_API_URL}/erc20/0x27702a26126e0B3702af63Ee09aC4d1A084EF628/price`,
            {
              'X-API-Key': this.MORALIS_API_KEY
            }
          );
          
          if (data && data.usdPrice) {
            console.log('✅ Moralis API success:', data);
            return {
              symbol: 'ALGO',
              price: parseFloat(data.usdPrice),
              change24h: parseFloat(data['24hrPercentChange'] || '0'),
              volume24h: 0,
              marketCap: 0
            };
          }
        } catch (moralisError) {
          console.warn('Moralis API failed, trying CoinPaprika...', moralisError.message);
        }
      }

      // Try CoinPaprika (most CORS-friendly)
      try {
        console.log('🔄 Trying CoinPaprika API for ALGO price...');
        const data = await this.makeRequest(
          `${this.COINPAPRIKA_BASE_URL}/tickers/algo-algorand`
        );
        
        if (data && data.quotes && data.quotes.USD) {
          const usdData = data.quotes.USD;
          console.log('✅ CoinPaprika API success:', usdData);
          return {
            symbol: 'ALGO',
            price: usdData.price,
            change24h: usdData.percent_change_24h,
            volume24h: usdData.volume_24h,
            marketCap: usdData.market_cap
          };
        }
      } catch (coinPaprikaError) {
        console.warn('CoinPaprika API failed, trying CryptoCompare...', coinPaprikaError.message);
      }

      // Try CryptoCompare as backup
      try {
        console.log('🔄 Trying CryptoCompare API for ALGO price...');
        const [priceData, histoData] = await Promise.all([
          this.makeRequest(`${this.CRYPTOCOMPARE_BASE_URL}/price?fsym=ALGO&tsyms=USD`),
          this.makeRequest(`${this.CRYPTOCOMPARE_BASE_URL}/histoday?fsym=ALGO&tsym=USD&limit=1`)
        ]);
        
        if (priceData && priceData.USD && histoData && histoData.Data) {
          const currentPrice = priceData.USD;
          const yesterdayPrice = histoData.Data[0]?.close || currentPrice;
          const change24h = ((currentPrice - yesterdayPrice) / yesterdayPrice) * 100;
          
          console.log('✅ CryptoCompare API success:', { currentPrice, change24h });
            return {
            symbol: 'ALGO',
            price: currentPrice,
            change24h: change24h,
            volume24h: 0,
            marketCap: 0
          };
        }
      } catch (cryptoCompareError) {
        console.warn('CryptoCompare API failed, trying CoinGecko...', cryptoCompareError.message);
      }

      // Try CoinGecko as last resort (has CORS issues but might work)
      try {
        console.log('🔄 Trying CoinGecko API for ALGO price...');
        const data = await this.makeRequest(
          `${this.COINGECKO_BASE_URL}/simple/price?ids=algorand&vs_currencies=usd&include_24hr_change=true&include_24hr_vol=true&include_market_cap=true`
        );
        
        if (data.algorand) {
          const algoData = data.algorand;
          console.log('✅ CoinGecko API success:', algoData);
          return {
            symbol: 'ALGO',
            price: algoData.usd,
            change24h: algoData.usd_24h_change,
            volume24h: algoData.usd_24h_vol,
            marketCap: algoData.usd_market_cap
          };
        }
      } catch (coinGeckoError) {
        console.warn('CoinGecko API also failed', coinGeckoError.message);
      }

      // If all APIs fail, return null
      console.warn('All price APIs failed');
      return null;

    } catch (error) {
      console.error('Error fetching Algorand price:', error);
      return null;
    }
  }

  static async getTokenPrices(assetIds: string[]): Promise<Record<string, PriceData>> {
    try {
      // Try Moralis API first for token prices (if API key is available)
      if (this.MORALIS_API_KEY) {
        try {
          console.log('🔄 Trying Moralis API for token prices...');
          const result: Record<string, PriceData> = {};
          
          // Moralis requires individual calls for each token
          for (const assetId of assetIds) {
            const coinGeckoId = this.ASSET_MAPPING[assetId];
            if (coinGeckoId && coinGeckoId !== 'algorand') {
              try {
                // Note: This is a simplified approach - in reality you'd need contract addresses
                // For now, we'll fall back to other APIs
                continue;
              } catch (tokenError) {
                console.warn(`Moralis failed for asset ${assetId}:`, tokenError.message);
              }
            }
          }
          
          if (Object.keys(result).length > 0) {
            return result;
          }
        } catch (moralisError) {
          console.warn('Moralis token prices failed:', moralisError.message);
        }
      }

      // For token prices, try CoinGecko since it has the best coverage
      const coinGeckoIds = assetIds
        .map(id => this.ASSET_MAPPING[id])
        .filter(Boolean)
        .join(',');
      
      if (!coinGeckoIds) {
        return {};
      }
      
      try {
        const data = await this.makeRequest(
          `${this.COINGECKO_BASE_URL}/simple/price?ids=${coinGeckoIds}&vs_currencies=usd&include_24hr_change=true&include_24hr_vol=true`
        );
        
        const result: Record<string, PriceData> = {};
        
        // Map back to asset IDs
        Object.entries(this.ASSET_MAPPING).forEach(([assetId, coinGeckoId]) => {
          if (data[coinGeckoId] && assetIds.includes(assetId)) {
            const tokenData = data[coinGeckoId];
            result[assetId] = {
              symbol: this.getSymbolFromAssetId(assetId),
              price: tokenData.usd,
              change24h: tokenData.usd_24h_change,
              volume24h: tokenData.usd_24h_vol
            };
          }
        });
        
        return result;
      } catch (apiError) {
        console.warn('Token price API failed, returning empty data');
        return {};
      }
      
    } catch (error) {
      console.error('Error fetching token prices:', error);
      return {};
    }
  }

  private static getSymbolFromAssetId(assetId: string): string {
    const symbolMap: Record<string, string> = {
      '31566704': 'USDC',
      '312769': 'USDT',
      '386192725': 'goETH',
      '386195940': 'goBTC',
      '0': 'ALGO'
    };
    return symbolMap[assetId] || 'UNKNOWN';
  }

  static async getMarketData() {
    try {
      console.log('📊 Fetching market data...');
      
      const [algoPrice, tokenPrices] = await Promise.all([
        this.getAlgorandPrice(),
        this.getTokenPrices(['31566704', '312769', '386192725', '386195940'])
      ]);
      
      console.log('✅ Market data fetched successfully');
      return {
        algo: algoPrice,
        tokens: tokenPrices
      };
    } catch (error) {
      console.error('Error fetching market data:', error);
      
      return {
        algo: null,
        tokens: {}
      };
    }
  }

  // Method to test API connectivity
  static async testConnectivity(): Promise<{ success: boolean; message: string }> {
    try {
      // Test Moralis API first if key is available
      if (this.MORALIS_API_KEY) {
        try {
          await this.makeRequest(`${this.MORALIS_API_URL}/info/endpointWeights`, {
            'X-API-Key': this.MORALIS_API_KEY
          }, 3000);
          return { success: true, message: 'Moralis API is accessible' };
        } catch (moralisError) {
          console.warn('Moralis test failed, trying other APIs...');
        }
      }

      // Test CoinPaprika API (most reliable)
      try {
        await this.makeRequest(`${this.COINPAPRIKA_BASE_URL}/global`, {}, 3000);
        return { success: true, message: 'CoinPaprika API is accessible' };
      } catch (coinPaprikaError) {
        console.warn('CoinPaprika test failed, trying CryptoCompare...');
      }

      // Test CryptoCompare API
      try {
        await this.makeRequest(`${this.CRYPTOCOMPARE_BASE_URL}/price?fsym=BTC&tsyms=USD`, {}, 3000);
        return { success: true, message: 'CryptoCompare API is accessible' };
      } catch (cryptoCompareError) {
        console.warn('CryptoCompare test failed, trying CoinGecko...');
      }

      // Test CoinGecko API
      try {
        await this.makeRequest(`${this.COINGECKO_BASE_URL}/ping`, {}, 3000);
        return { success: true, message: 'CoinGecko API is accessible' };
      } catch (coinGeckoError) {
        return { 
          success: false, 
          message: 'All price APIs are inaccessible. Using mock data.' 
        };
      }
    } catch (error) {
      return { 
        success: false, 
        message: 'Price API connectivity test failed. Using mock data.' 
      };
    }
  }
}