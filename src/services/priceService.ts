interface PriceData {
  symbol: string;
  price: number;
  change24h: number;
  volume24h: number;
  marketCap?: number;
}

interface MoralisResponse {
  usdPrice: number;
  usdPriceFormatted: string;
  '24hrPercentChange': string;
  exchangeAddress?: string;
  exchangeName?: string;
}

interface CoinGeckoResponse {
  [key: string]: {
    usd: number;
    usd_24h_change: number;
    usd_24h_vol: number;
    usd_market_cap: number;
  };
}

export class PriceService {
  private static readonly MORALIS_API_URL = import.meta.env.VITE_MORALIS_API_URL || 'https://deep-index.moralis.io/api/v2.2';
  private static readonly MORALIS_API_KEY = import.meta.env.VITE_MORALIS_API_KEY;
  private static readonly COINGECKO_BASE_URL = import.meta.env.VITE_COINGECKO_API_URL || 'https://api.coingecko.com/api/v3';
  
  // Algorand asset ID to CoinGecko ID mapping (for fallback)
  private static readonly ASSET_MAPPING = {
    '31566704': 'usd-coin', // USDC
    '312769': 'tether', // USDT
    '386192725': 'ethereum', // goETH (using ETH price)
    '386195940': 'bitcoin', // goBTC (using BTC price)
    '0': 'algorand' // ALGO
  };

  private static async makeRequest(url: string, headers: Record<string, string> = {}, timeout: number = 5000): Promise<any> {
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
      console.warn(`Request failed for ${url}:`, error.message);
      throw error;
    }
  }

  static async getAlgorandPrice(): Promise<PriceData> {
    // Fallback data
    const fallbackData = {
      symbol: 'ALGO',
      price: 0.18,
      change24h: -1.3,
      volume24h: 42000000,
      marketCap: 1330000000
    };

    try {
      // First try: Moralis API (if available)
      if (this.MORALIS_API_KEY) {
        try {
          console.log('🔄 Trying Moralis API for ALGO price...');
          const data = await this.makeRequest(
            `${this.MORALIS_API_URL}/erc20/price?chain=algo&address=null`,
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
              volume24h: fallbackData.volume24h, // Moralis might not provide volume
              marketCap: fallbackData.marketCap
            };
          }
        } catch (moralisError) {
          console.warn('Moralis API failed, trying CoinGecko...', moralisError);
        }
      } else {
        console.warn('Moralis API key not available, trying CoinGecko...');
      }

      // Second try: CoinGecko API (fallback)
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
        console.warn('CoinGecko API also failed', coinGeckoError);
      }

      // If all APIs fail, return mock data with a warning
      console.warn('All price APIs failed, using fallback data');
      return fallbackData;

    } catch (error) {
      console.error('Error fetching Algorand price:', error);
      return fallbackData;
    }
  }

  static async getTokenPrices(assetIds: string[]): Promise<Record<string, PriceData>> {
    try {
      // For Moralis, we might need to handle each token separately
      // For now, fall back to CoinGecko for token prices
      
      // Map asset IDs to CoinGecko IDs
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
        this.getAlgorandPrice().catch(error => {
          console.warn('ALGO price fetch failed:', error);
          return {
            symbol: 'ALGO',
            price: 0.18,
            change24h: -1.3,
            volume24h: 42000000,
            marketCap: 1330000000
          };
        }),
        this.getTokenPrices(['31566704', '312769', '386192725', '386195940']).catch(error => {
          console.warn('Token prices fetch failed:', error);
          return {};
        })
      ]);
      
      console.log('✅ Market data fetched successfully');
      return {
        algo: algoPrice,
        tokens: tokenPrices
      };
    } catch (error) {
      console.error('Error fetching market data:', error);
      
      // Return fallback data
      return {
        algo: {
          symbol: 'ALGO',
          price: 0.18,
          change24h: -1.3,
          volume24h: 42000000,
          marketCap: 1330000000
        },
        tokens: {}
      };
    }
  }

  // Method to test API connectivity
  static async testConnectivity(): Promise<{ success: boolean; message: string }> {
    try {
      // Test Moralis API if available
      if (this.MORALIS_API_KEY) {
        try {
          await this.makeRequest(
            `${this.MORALIS_API_URL}/erc20/price?chain=algo&address=null`,
            { 'X-API-Key': this.MORALIS_API_KEY },
            3000
          );
          return { success: true, message: 'Moralis API is accessible' };
        } catch (moralisError) {
          console.warn('Moralis API test failed, trying CoinGecko...');
        }
      }
      
      // Test CoinGecko API
      await this.makeRequest(`${this.COINGECKO_BASE_URL}/ping`, {}, 3000);
      return { success: true, message: 'CoinGecko API is accessible' };
    } catch (error) {
      return { 
        success: false, 
        message: 'Both price APIs are inaccessible. Using mock data.' 
      };
    }
  }
}