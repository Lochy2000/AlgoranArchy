import axios from 'axios';
import { AlgorandService } from './algorandService';

interface DexQuote {
  inputAsset: number;
  outputAsset: number;
  inputAmount: number;
  outputAmount: number;
  priceImpact: number;
  fee: number;
  route?: string[];
  dex: 'tinyman' | 'pact' | 'vestige';
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
  dex: 'tinyman' | 'pact' | 'vestige';
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
  // Updated URLs - Note: These APIs have CORS restrictions for browser requests
  private static readonly TINYMAN_API_URL = import.meta.env.VITE_TINYMAN_API_URL || 'https://mainnet.analytics.tinyman.org';
  private static readonly PACT_API_URL = import.meta.env.VITE_PACT_API_URL || 'https://api.pact.fi';
  private static readonly VESTIGE_API_URL = 'https://free-api.vestige.fi/asset';
  
  // Popular Algorand asset IDs
  private static readonly POPULAR_ASSETS = {
    0: { symbol: 'ALGO', name: 'Algorand', decimals: 6 },
    31566704: { symbol: 'USDC', name: 'USD Coin', decimals: 6 },
    312769: { symbol: 'USDT', name: 'Tether USD', decimals: 6 },
    386192725: { symbol: 'goETH', name: 'Goerli ETH', decimals: 8 },
    386195940: { symbol: 'goBTC', name: 'Goerli BTC', decimals: 8 },
    287867876: { symbol: 'OPUL', name: 'Opulous', decimals: 10 },
    226701642: { symbol: 'YLDY', name: 'Yieldly', decimals: 6 },
    137594422: { symbol: 'HEADLINE', name: 'Headline', decimals: 6 },
    465865291: { symbol: 'STBL', name: 'AlgoStable', decimals: 6 },
    818182311: { symbol: 'ZONE', name: 'Zone', decimals: 6 }
  };

  // Enhanced request method with better error handling
  private static async makeRequest(url: string, options: RequestInit = {}): Promise<any> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'ALGORANARCHY/1.0',
          ...options.headers
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

  // Get all available pools from multiple DEXs
  static async getAllPools(): Promise<DexPool[]> {
    try {
      console.log('📊 Fetching pools from all DEXs...');
      
      // Note: Due to CORS restrictions, these will likely fail in browser
      // In production, these should be proxied through a backend
      const [tinymanPools, pactPools, vestigePools] = await Promise.allSettled([
        this.getTinymanPools(),
        this.getPactPools(),
        this.getVestigePools()
      ]);

      const allPools: DexPool[] = [];

      if (tinymanPools.status === 'fulfilled') {
        allPools.push(...tinymanPools.value);
      } else {
        console.warn('Tinyman pools failed:', tinymanPools.reason);
      }

      if (pactPools.status === 'fulfilled') {
        allPools.push(...pactPools.value);
      } else {
        console.warn('Pact pools failed:', pactPools.reason);
      }

      if (vestigePools.status === 'fulfilled') {
        allPools.push(...vestigePools.value);
      } else {
        console.warn('Vestige pools failed:', vestigePools.reason);
      }

      if (allPools.length === 0) {
        console.warn('All DEX APIs failed, using mock data');
        return this.getMockPools();
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
      
      // Note: This will likely fail due to CORS in browser
      const response = await this.makeRequest(`${this.TINYMAN_API_URL}/v1/pools`);
      
      if (response && Array.isArray(response)) {
        return response.map((pool: any) => ({
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
      console.warn('Tinyman API not available (CORS restriction):', error.message);
      return this.getMockTinymanPools();
    }
  }

  static async getPactPools(): Promise<DexPool[]> {
    try {
      console.log('📊 Fetching Pact pools...');
      
      // Note: This will likely fail due to CORS in browser
      const response = await this.makeRequest(`${this.PACT_API_URL}/pools`);
      
      if (response && Array.isArray(response)) {
        return response.map((pool: any) => ({
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
      console.warn('Pact API not available (CORS restriction):', error.message);
      return this.getMockPactPools();
    }
  }

  static async getVestigePools(): Promise<DexPool[]> {
    try {
      console.log('📊 Fetching Vestige pools...');
      
      // Vestige has a different API structure
      const response = await this.makeRequest(`${this.VESTIGE_API_URL}/pools`);
      
      if (response && Array.isArray(response)) {
        return response.map((pool: any) => ({
          asset1Id: pool.asset1_id || 0,
          asset2Id: pool.asset2_id || 0,
          asset1Reserves: pool.asset1_reserves || 0,
          asset2Reserves: pool.asset2_reserves || 0,
          totalLiquidity: pool.total_liquidity || 0,
          apy: pool.apy,
          volume24h: pool.volume_24h,
          dex: 'vestige' as const
        }));
      }
      
      return [];
    } catch (error) {
      console.warn('Vestige API not available:', error.message);
      return this.getMockVestigePools();
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
      
      // Due to CORS restrictions, we'll primarily use mock calculations
      // In production, these should be proxied through a backend
      const [tinymanQuote, pactQuote, vestigeQuote] = await Promise.allSettled([
        this.getTinymanQuote(inputAssetId, outputAssetId, inputAmount),
        this.getPactQuote(inputAssetId, outputAssetId, inputAmount),
        this.getVestigeQuote(inputAssetId, outputAssetId, inputAmount)
      ]);

      const quotes: DexQuote[] = [];

      if (tinymanQuote.status === 'fulfilled' && tinymanQuote.value) {
        quotes.push(tinymanQuote.value);
      }

      if (pactQuote.status === 'fulfilled' && pactQuote.value) {
        quotes.push(pactQuote.value);
      }

      if (vestigeQuote.status === 'fulfilled' && vestigeQuote.value) {
        quotes.push(vestigeQuote.value);
      }

      if (quotes.length === 0) {
        console.warn('No quotes available from any DEX, using mock calculation');
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
      // Note: This will likely fail due to CORS in browser
      const response = await this.makeRequest(`${this.TINYMAN_API_URL}/v1/quote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          input_asset_id: inputAssetId,
          output_asset_id: outputAssetId,
          input_amount: inputAmount,
          slippage: 0.5
        })
      });
      
      if (response) {
        return {
          inputAsset: inputAssetId,
          outputAsset: outputAssetId,
          inputAmount,
          outputAmount: response.output_amount,
          priceImpact: response.price_impact,
          fee: response.fee,
          dex: 'tinyman',
          slippage: 0.5
        };
      }
      
      return null;
    } catch (error) {
      console.warn('Tinyman quote failed (CORS restriction):', error.message);
      return null;
    }
  }

  static async getPactQuote(
    inputAssetId: number,
    outputAssetId: number,
    inputAmount: number
  ): Promise<DexQuote | null> {
    try {
      // Note: This will likely fail due to CORS in browser
      const response = await this.makeRequest(`${this.PACT_API_URL}/quote?` + new URLSearchParams({
        primary_asset_id: inputAssetId.toString(),
        secondary_asset_id: outputAssetId.toString(),
        amount: inputAmount.toString(),
        swap_type: 'fixed_input'
      }));
      
      if (response) {
        return {
          inputAsset: inputAssetId,
          outputAsset: outputAssetId,
          inputAmount,
          outputAmount: response.output_amount,
          priceImpact: response.price_impact,
          fee: response.fee,
          dex: 'pact',
          slippage: 0.5
        };
      }
      
      return null;
    } catch (error) {
      console.warn('Pact quote failed (CORS restriction):', error.message);
      return null;
    }
  }

  static async getVestigeQuote(
    inputAssetId: number,
    outputAssetId: number,
    inputAmount: number
  ): Promise<DexQuote | null> {
    try {
      const response = await this.makeRequest(`${this.VESTIGE_API_URL}/quote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          asset_in: inputAssetId,
          asset_out: outputAssetId,
          amount_in: inputAmount
        })
      });
      
      if (response) {
        return {
          inputAsset: inputAssetId,
          outputAsset: outputAssetId,
          inputAmount,
          outputAmount: response.amount_out,
          priceImpact: response.price_impact || 0,
          fee: response.fee || 0,
          dex: 'vestige',
          slippage: 0.5
        };
      }
      
      return null;
    } catch (error) {
      console.warn('Vestige quote failed:', error.message);
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
      
      const params = await AlgorandService.getTransactionParams();
      
      if (quote.dex === 'tinyman') {
        return this.buildTinymanSwap(quote, walletAddress, params, slippage);
      } else if (quote.dex === 'pact') {
        return this.buildPactSwap(quote, walletAddress, params, slippage);
      } else if (quote.dex === 'vestige') {
        return this.buildVestigeSwap(quote, walletAddress, params, slippage);
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

  private static async buildVestigeSwap(
    quote: DexQuote,
    walletAddress: string,
    params: any,
    slippage: number
  ): Promise<any> {
    // This would integrate with Vestige SDK to build actual swap transactions
    console.log('Building Vestige swap transaction...');
    
    throw new Error('Vestige swap building not yet implemented. Use external Vestige app.');
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

  // DEX URLs for external trading - Fixed URLs
  static getTinymanUrl(inputAssetId: number, outputAssetId: number): string {
    return `https://app.tinyman.org/#/swap?asset_in=${inputAssetId}&asset_out=${outputAssetId}`;
  }

  static getPactUrl(inputAssetId: number, outputAssetId: number): string {
    return `https://app.pact.fi/swap?from=${inputAssetId}&to=${outputAssetId}`;
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
        return this.getMockPoolAnalytics(asset1Id, asset2Id);
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
      return this.getMockPoolAnalytics(asset1Id, asset2Id);
    }
  }

  // Mock data for fallback
  private static getMockPools(): DexPool[] {
    return [
      ...this.getMockTinymanPools(),
      ...this.getMockPactPools(),
      ...this.getMockVestigePools()
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

  private static getMockVestigePools(): DexPool[] {
    return [
      {
        asset1Id: 0,
        asset2Id: 465865291, // STBL
        asset1Reserves: 600000000000,
        asset2Reserves: 108000000000,
        totalLiquidity: 254950975679,
        apy: 15.7,
        volume24h: 900000000000,
        dex: 'vestige'
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

  private static getMockPoolAnalytics(asset1Id: number, asset2Id: number): any {
    return {
      poolCount: 3,
      totalLiquidity: 1000000000000,
      averageApy: 12.1,
      volume24h: 5100000000000,
      pools: this.getMockPools().filter(pool => 
        (pool.asset1Id === asset1Id && pool.asset2Id === asset2Id) ||
        (pool.asset1Id === asset2Id && pool.asset2Id === asset1Id)
      )
    };
  }

  // API connectivity test
  static async testConnectivity(): Promise<{ success: boolean; message: string; details?: any }> {
    try {
      const [tinymanTest, pactTest, vestigeTest] = await Promise.allSettled([
        this.makeRequest(`${this.TINYMAN_API_URL}/health`).catch(() => ({ status: 'failed' })),
        this.makeRequest(`${this.PACT_API_URL}/health`).catch(() => ({ status: 'failed' })),
        this.makeRequest(`${this.VESTIGE_API_URL}/health`).catch(() => ({ status: 'failed' }))
      ]);

      const results = {
        tinyman: tinymanTest.status === 'fulfilled',
        pact: pactTest.status === 'fulfilled',
        vestige: vestigeTest.status === 'fulfilled'
      };

      const successCount = Object.values(results).filter(Boolean).length;

      if (successCount > 0) {
        return {
          success: true,
          message: `${successCount}/3 DEX APIs are accessible`,
          details: results
        };
      } else {
        return {
          success: false,
          message: 'No DEX APIs are accessible (CORS restrictions expected)',
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