import axios from 'axios';
import { AlgorandAPIService } from './algorandService';

interface DexQuote {
  inputAsset: number;
  outputAsset: number;
  inputAmount: number;
  outputAmount: number;
  priceImpact: number;
  fee: number;
  route?: string[];
  dex: 'tinyman' | 'pact';
  slippage?: number;
}

interface DexPool {
  asset1Id: number;
  asset2Id: number;
  asset1Reserves: number;
  asset2Reserves: number;
  totalLiquidity: number;
  apy?: number;
  volume24h?: number;
  dex: 'tinyman' | 'pact';
}

interface SwapTransaction {
  txId: string;
  status: 'pending' | 'confirmed' | 'failed';
  inputAsset: number;
  outputAsset: number;
  inputAmount: number;
  outputAmount: number;
  timestamp: number;
}

export class EnhancedDexService {
  private static readonly TINYMAN_API_URL = import.meta.env.VITE_TINYMAN_API_URL || 'https://mainnet.analytics.tinyman.org';
  private static readonly PACT_API_URL = import.meta.env.VITE_PACT_API_URL || 'https://api.pact.fi';
  
  // Popular Algorand asset IDs
  private static readonly POPULAR_ASSETS = {
    0: { symbol: 'ALGO', name: 'Algorand', decimals: 6 },
    31566704: { symbol: 'USDC', name: 'USD Coin', decimals: 6 },
    312769: { symbol: 'USDT', name: 'Tether USD', decimals: 6 },
    386192725: { symbol: 'goETH', name: 'Goerli ETH', decimals: 8 },
    386195940: { symbol: 'goBTC', name: 'Goerli BTC', decimals: 8 },
    287867876: { symbol: 'OPUL', name: 'Opulous', decimals: 10 },
    226701642: { symbol: 'YLDY', name: 'Yieldly', decimals: 6 },
    137594422: { symbol: 'HEADLINE', name: 'Headline', decimals: 6 }
  };

  // Get all available pools from multiple DEXs
  static async getAllPools(): Promise<DexPool[]> {
    try {
      console.log('📊 Fetching pools from all DEXs...');
      
      const [tinymanPools, pactPools] = await Promise.allSettled([
        this.getTinymanPools(),
        this.getPactPools()
      ]);

      const allPools: DexPool[] = [];

      if (tinymanPools.status === 'fulfilled') {
        allPools.push(...tinymanPools.value);
      }

      if (pactPools.status === 'fulfilled') {
        allPools.push(...pactPools.value);
      }

      console.log(`✅ Found ${allPools.length} pools across all DEXs`);
      return allPools;
    } catch (error) {
      console.error('❌ Error fetching pools:', error);
      return this.getMockPools();
    }
  }

  static async getTinymanPools(): Promise<DexPool[]> {
    try {
      console.log('📊 Fetching Tinyman pools...');
      
      const response = await axios.get(`${this.TINYMAN_API_URL}/v1/pools`, {
        timeout: 10000,
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'ALGORANARCHY/1.0'
        }
      });
      
      if (response.data && Array.isArray(response.data)) {
        return response.data.map((pool: any) => ({
          asset1Id: pool.asset_1_id || 0,
          asset2Id: pool.asset_2_id || 0,
          asset1Reserves: pool.asset_1_reserves || 0,
          asset2Reserves: pool.asset_2_reserves || 0,
          totalLiquidity: pool.total_liquidity || 0,
          apy: pool.apy,
          volume24h: pool.volume_24h,
          dex: 'tinyman' as const
        }));
      }
      
      return [];
    } catch (error) {
      console.warn('Tinyman API not available:', error.message);
      return this.getMockTinymanPools();
    }
  }

  static async getPactPools(): Promise<DexPool[]> {
    try {
      console.log('📊 Fetching Pact pools...');
      
      const response = await axios.get(`${this.PACT_API_URL}/pools`, {
        timeout: 10000,
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'ALGORANARCHY/1.0'
        }
      });
      
      if (response.data && Array.isArray(response.data)) {
        return response.data.map((pool: any) => ({
          asset1Id: pool.primary_asset_id || 0,
          asset2Id: pool.secondary_asset_id || 0,
          asset1Reserves: pool.primary_asset_reserves || 0,
          asset2Reserves: pool.secondary_asset_reserves || 0,
          totalLiquidity: pool.total_liquidity || 0,
          apy: pool.apy,
          volume24h: pool.volume_24h,
          dex: 'pact' as const
        }));
      }
      
      return [];
    } catch (error) {
      console.warn('Pact API not available:', error.message);
      return this.getMockPactPools();
    }
  }

  // Get best quote across all DEXs
  static async getBestQuote(
    inputAssetId: number,
    outputAssetId: number,
    inputAmount: number
  ): Promise<DexQuote | null> {
    try {
      console.log(`💱 Getting best quote: ${inputAmount} of asset ${inputAssetId} -> asset ${outputAssetId}`);
      
      const [tinymanQuote, pactQuote] = await Promise.allSettled([
        this.getTinymanQuote(inputAssetId, outputAssetId, inputAmount),
        this.getPactQuote(inputAssetId, outputAssetId, inputAmount)
      ]);

      const quotes: DexQuote[] = [];

      if (tinymanQuote.status === 'fulfilled' && tinymanQuote.value) {
        quotes.push(tinymanQuote.value);
      }

      if (pactQuote.status === 'fulfilled' && pactQuote.value) {
        quotes.push(pactQuote.value);
      }

      if (quotes.length === 0) {
        console.warn('No quotes available from any DEX');
        return this.getMockQuote(inputAssetId, outputAssetId, inputAmount);
      }

      // Return the quote with the highest output amount
      const bestQuote = quotes.reduce((best, current) => 
        current.outputAmount > best.outputAmount ? current : best
      );

      console.log(`✅ Best quote from ${bestQuote.dex}:`, bestQuote);
      return bestQuote;
    } catch (error) {
      console.error('❌ Error getting best quote:', error);
      return this.getMockQuote(inputAssetId, outputAssetId, inputAmount);
    }
  }

  static async getTinymanQuote(
    inputAssetId: number,
    outputAssetId: number,
    inputAmount: number
  ): Promise<DexQuote | null> {
    try {
      const response = await axios.post(`${this.TINYMAN_API_URL}/v1/quote`, {
        input_asset_id: inputAssetId,
        output_asset_id: outputAssetId,
        input_amount: inputAmount,
        slippage: 0.5 // 0.5% slippage tolerance
      }, {
        timeout: 8000,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      
      if (response.data) {
        return {
          inputAsset: inputAssetId,
          outputAsset: outputAssetId,
          inputAmount,
          outputAmount: response.data.output_amount,
          priceImpact: response.data.price_impact,
          fee: response.data.fee,
          dex: 'tinyman',
          slippage: 0.5
        };
      }
      
      return null;
    } catch (error) {
      console.warn('Tinyman quote failed:', error.message);
      return null;
    }
  }

  static async getPactQuote(
    inputAssetId: number,
    outputAssetId: number,
    inputAmount: number
  ): Promise<DexQuote | null> {
    try {
      const response = await axios.get(`${this.PACT_API_URL}/quote`, {
        params: {
          primary_asset_id: inputAssetId,
          secondary_asset_id: outputAssetId,
          amount: inputAmount,
          swap_type: 'fixed_input'
        },
        timeout: 8000,
        headers: {
          'Accept': 'application/json'
        }
      });
      
      if (response.data) {
        return {
          inputAsset: inputAssetId,
          outputAsset: outputAssetId,
          inputAmount,
          outputAmount: response.data.output_amount,
          priceImpact: response.data.price_impact,
          fee: response.data.fee,
          dex: 'pact',
          slippage: 0.5
        };
      }
      
      return null;
    } catch (error) {
      console.warn('Pact quote failed:', error.message);
      return null;
    }
  }

  // Build swap transaction
  static async buildSwapTransaction(
    quote: DexQuote,
    walletAddress: string,
    slippage: number = 0.5
  ): Promise<any> {
    try {
      console.log('🔨 Building swap transaction...', quote);
      
      const params = await AlgorandAPIService.getTransactionParams();
      
      if (quote.dex === 'tinyman') {
        return this.buildTinymanSwap(quote, walletAddress, params, slippage);
      } else if (quote.dex === 'pact') {
        return this.buildPactSwap(quote, walletAddress, params, slippage);
      }
      
      throw new Error(`Unsupported DEX: ${quote.dex}`);
    } catch (error) {
      console.error('❌ Failed to build swap transaction:', error);
      throw error;
    }
  }

  private static async buildTinymanSwap(
    quote: DexQuote,
    walletAddress: string,
    params: any,
    slippage: number
  ): Promise<any> {
    // This would integrate with Tinyman SDK to build actual swap transactions
    // For now, we'll return a mock transaction structure
    console.log('Building Tinyman swap transaction...');
    
    throw new Error('Tinyman swap building not yet implemented. Use external Tinyman app.');
  }

  private static async buildPactSwap(
    quote: DexQuote,
    walletAddress: string,
    params: any,
    slippage: number
  ): Promise<any> {
    // This would integrate with Pact SDK to build actual swap transactions
    console.log('Building Pact swap transaction...');
    
    throw new Error('Pact swap building not yet implemented. Use external Pact app.');
  }

  // Get asset information
  static getAssetInfo(assetId: number) {
    return this.POPULAR_ASSETS[assetId] || {
      symbol: `ASA-${assetId}`,
      name: `Asset ${assetId}`,
      decimals: 6
    };
  }

  static getAllSupportedAssets() {
    return Object.entries(this.POPULAR_ASSETS).map(([id, info]) => ({
      id: Number(id),
      ...info
    }));
  }

  // DEX URLs for external trading
  static getTinymanUrl(inputAssetId: number, outputAssetId: number): string {
    return `https://app.tinyman.org/#/swap?asset_in=${inputAssetId}&asset_out=${outputAssetId}`;
  }

  static getPactUrl(inputAssetId: number, outputAssetId: number): string {
    return `https://app.pact.fi/add-liquidity/${inputAssetId}/${outputAssetId}`;
  }

  static getVestigeUrl(inputAssetId: number, outputAssetId: number): string {
    return `https://vestige.fi/asset/${inputAssetId}`;
  }

  // Pool analytics
  static async getPoolAnalytics(asset1Id: number, asset2Id: number): Promise<any> {
    try {
      const pools = await this.getAllPools();
      const relevantPools = pools.filter(pool => 
        (pool.asset1Id === asset1Id && pool.asset2Id === asset2Id) ||
        (pool.asset1Id === asset2Id && pool.asset2Id === asset1Id)
      );

      if (relevantPools.length === 0) {
        return null;
      }

      const totalLiquidity = relevantPools.reduce((sum, pool) => sum + pool.totalLiquidity, 0);
      const avgApy = relevantPools.reduce((sum, pool) => sum + (pool.apy || 0), 0) / relevantPools.length;
      const total24hVolume = relevantPools.reduce((sum, pool) => sum + (pool.volume24h || 0), 0);

      return {
        poolCount: relevantPools.length,
        totalLiquidity,
        averageApy: avgApy,
        volume24h: total24hVolume,
        pools: relevantPools
      };
    } catch (error) {
      console.error('Error getting pool analytics:', error);
      return null;
    }
  }

  // Mock data for fallback
  private static getMockPools(): DexPool[] {
    return [
      ...this.getMockTinymanPools(),
      ...this.getMockPactPools()
    ];
  }

  private static getMockTinymanPools(): DexPool[] {
    return [
      {
        asset1Id: 0,
        asset2Id: 31566704,
        asset1Reserves: 1000000000000,
        asset2Reserves: 180000000000,
        totalLiquidity: 424264068712,
        apy: 12.5,
        volume24h: 2500000000000,
        dex: 'tinyman'
      },
      {
        asset1Id: 0,
        asset2Id: 312769,
        asset1Reserves: 500000000000,
        asset2Reserves: 90000000000,
        totalLiquidity: 212132034356,
        apy: 8.3,
        volume24h: 1200000000000,
        dex: 'tinyman'
      }
    ];
  }

  private static getMockPactPools(): DexPool[] {
    return [
      {
        asset1Id: 0,
        asset2Id: 31566704,
        asset1Reserves: 800000000000,
        asset2Reserves: 144000000000,
        totalLiquidity: 339411254970,
        apy: 10.2,
        volume24h: 1800000000000,
        dex: 'pact'
      }
    ];
  }

  private static getMockQuote(
    inputAssetId: number,
    outputAssetId: number,
    inputAmount: number
  ): DexQuote {
    // Simple mock calculation
    const mockRate = inputAssetId === 0 ? 0.18 : 5.5; // ALGO to USDC rate or reverse
    const outputAmount = Math.floor(inputAmount * mockRate * 0.997); // 0.3% fee
    
    return {
      inputAsset: inputAssetId,
      outputAsset: outputAssetId,
      inputAmount,
      outputAmount,
      priceImpact: (inputAmount / 1000000000) * 100, // Mock price impact
      fee: inputAmount * 0.003,
      dex: 'tinyman',
      slippage: 0.5
    };
  }

  // API connectivity test
  static async testConnectivity(): Promise<{ success: boolean; message: string; details?: any }> {
    try {
      const [tinymanTest, pactTest] = await Promise.allSettled([
        axios.get(`${this.TINYMAN_API_URL}/health`, { timeout: 5000 }),
        axios.get(`${this.PACT_API_URL}/health`, { timeout: 5000 })
      ]);

      const results = {
        tinyman: tinymanTest.status === 'fulfilled',
        pact: pactTest.status === 'fulfilled'
      };

      if (results.tinyman || results.pact) {
        return {
          success: true,
          message: 'DEX APIs are accessible',
          details: results
        };
      } else {
        return {
          success: false,
          message: 'No DEX APIs are accessible',
          details: results
        };
      }
    } catch (error) {
      return {
        success: false,
        message: `DEX connectivity test failed: ${error.message}`
      };
    }
  }
}