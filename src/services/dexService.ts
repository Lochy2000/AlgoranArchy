import axios from 'axios';

interface DexQuote {
  inputAsset: number;
  outputAsset: number;
  inputAmount: number;
  outputAmount: number;
  priceImpact: number;
  fee: number;
  route?: string[];
}

interface DexPool {
  asset1Id: number;
  asset2Id: number;
  asset1Reserves: number;
  asset2Reserves: number;
  totalLiquidity: number;
  apy?: number;
}

export class DexService {
  private static readonly TINYMAN_API_URL = import.meta.env.VITE_TINYMAN_API_URL || 'https://mainnet.analytics.tinyman.org';
  private static readonly PACT_API_URL = import.meta.env.VITE_PACT_API_URL || 'https://api.pact.fi';

  static async getTinymanPools(): Promise<DexPool[]> {
    try {
      console.log('📊 Fetching Tinyman pools...');
      
      // Note: Tinyman analytics API may not be available or have CORS restrictions
      // We'll provide mock data for now
      console.warn('Tinyman API not available: Using mock pool data');
      return this.getMockTinymanPools();
      
    } catch (error) {
      console.error('❌ Error fetching Tinyman pools:', error);
      return this.getMockTinymanPools();
    }
  }

  static async getPactPools(): Promise<DexPool[]> {
    try {
      console.log('📊 Fetching Pact pools...');
      
      // Note: Pact API may have CORS restrictions
      // We'll provide mock data for now
      console.warn('Pact API not available: Using mock pool data');
      return this.getMockPactPools();
      
    } catch (error) {
      console.error('❌ Error fetching Pact pools:', error);
      return this.getMockPactPools();
    }
  }

  static async getQuote(
    inputAssetId: number,
    outputAssetId: number,
    inputAmount: number,
    dex: 'tinyman' | 'pact' = 'tinyman'
  ): Promise<DexQuote | null> {
    try {
      console.log(`💱 Getting ${dex} quote: ${inputAmount} of asset ${inputAssetId} -> asset ${outputAssetId}`);
      
      // Since DEX APIs have CORS restrictions, we'll use mock calculations
      console.warn(`${dex} quote API not available, using mock calculation`);
      
      // Fallback to mock calculation
      const pools = dex === 'tinyman' ? this.getMockTinymanPools() : this.getMockPactPools();
      const pool = pools.find(p => 
        (p.asset1Id === inputAssetId && p.asset2Id === outputAssetId) ||
        (p.asset1Id === outputAssetId && p.asset2Id === inputAssetId)
      );
      
      if (!pool) {
        throw new Error('No pool found for this pair');
      }
      
      // Simplified AMM calculation
      const isReverse = pool.asset1Id === outputAssetId;
      const inputReserves = isReverse ? pool.asset2Reserves : pool.asset1Reserves;
      const outputReserves = isReverse ? pool.asset1Reserves : pool.asset2Reserves;
      
      const fee = 0.003; // 0.3% fee
      const inputAmountAfterFee = inputAmount * (1 - fee);
      const outputAmount = (outputReserves * inputAmountAfterFee) / (inputReserves + inputAmountAfterFee);
      const priceImpact = (inputAmount / inputReserves) * 100;
      
      return {
        inputAsset: inputAssetId,
        outputAsset: outputAssetId,
        inputAmount,
        outputAmount: Math.floor(outputAmount),
        priceImpact,
        fee: inputAmount * fee
      };
      
    } catch (error) {
      console.error('❌ Error getting DEX quote:', error);
      return null;
    }
  }

  static async executeSwap(quote: DexQuote, walletAddress: string): Promise<string> {
    try {
      console.log('🔄 Executing swap...', quote);
      
      // In a real implementation, this would:
      // 1. Create the swap transaction using Tinyman SDK
      // 2. Sign it with the connected wallet
      // 3. Submit to the network
      // 4. Return the transaction ID
      
      throw new Error('Swap execution not yet implemented. This requires wallet integration and transaction building.');
    } catch (error) {
      console.error('❌ Swap execution failed:', error);
      throw error;
    }
  }

  static getDexUrl(inputAssetId: number, outputAssetId: number, dex: 'tinyman' | 'pact' = 'tinyman'): string {
    if (dex === 'tinyman') {
      return `https://app.tinyman.org/#/swap?asset_in=${inputAssetId}&asset_out=${outputAssetId}`;
    } else if (dex === 'pact') {
      return `https://app.pact.fi/add-liquidity/${inputAssetId}/${outputAssetId}`;
    }
    return '#';
  }

  // Mock data methods
  private static getMockTinymanPools(): DexPool[] {
    return [
      {
        asset1Id: 0, // ALGO
        asset2Id: 31566704, // USDC
        asset1Reserves: 1000000000000, // 1M ALGO
        asset2Reserves: 180000000000, // 180K USDC
        totalLiquidity: 424264068712, // sqrt(1M * 180K)
        apy: 12.5
      },
      {
        asset1Id: 0, // ALGO
        asset2Id: 312769, // USDT
        asset1Reserves: 500000000000, // 500K ALGO
        asset2Reserves: 90000000000, // 90K USDT
        totalLiquidity: 212132034356,
        apy: 8.3
      },
      {
        asset1Id: 31566704, // USDC
        asset2Id: 312769, // USDT
        asset1Reserves: 1000000000000, // 1M USDC
        asset2Reserves: 1000000000000, // 1M USDT
        totalLiquidity: 1000000000000,
        apy: 5.2
      }
    ];
  }

  private static getMockPactPools(): DexPool[] {
    return [
      {
        asset1Id: 0, // ALGO
        asset2Id: 31566704, // USDC
        asset1Reserves: 800000000000, // 800K ALGO
        asset2Reserves: 144000000000, // 144K USDC
        totalLiquidity: 339411254970,
        apy: 10.8
      },
      {
        asset1Id: 0, // ALGO
        asset2Id: 386192725, // goETH
        asset1Reserves: 2000000000000, // 2M ALGO
        asset2Reserves: 200000000000, // 200 goETH
        totalLiquidity: 632455532034,
        apy: 15.3
      }
    ];
  }
}