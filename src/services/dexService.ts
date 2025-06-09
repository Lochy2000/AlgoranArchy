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
      
      // Try to fetch real Tinyman data
      try {
        const response = await axios.get(`${this.TINYMAN_API_URL}/v1/pools`, {
          timeout: 5000
        });
        
        if (response.data && Array.isArray(response.data)) {
          return response.data.map((pool: any) => ({
            asset1Id: pool.asset_1_id || 0,
            asset2Id: pool.asset_2_id || 0,
            asset1Reserves: pool.asset_1_reserves || 0,
            asset2Reserves: pool.asset_2_reserves || 0,
            totalLiquidity: pool.total_liquidity || 0,
            apy: pool.apy
          }));
        }
      } catch (apiError) {
        console.warn('Tinyman API not available, using mock data');
      }
      
      // Fallback to mock data
      return [
        {
          asset1Id: 0, // ALGO
          asset2Id: 31566704, // USDC
          asset1Reserves: 1000000000000, // 1M ALGO
          asset2Reserves: 180000000000, // 180K USDC
          totalLiquidity: 424264068712 // sqrt(1M * 180K)
        },
        {
          asset1Id: 0, // ALGO
          asset2Id: 312769, // USDT
          asset1Reserves: 500000000000, // 500K ALGO
          asset2Reserves: 90000000000, // 90K USDT
          totalLiquidity: 212132034356
        }
      ];
    } catch (error) {
      console.error('❌ Error fetching Tinyman pools:', error);
      return [];
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
      
      if (dex === 'tinyman') {
        // Try to get real quote from Tinyman API
        try {
          const response = await axios.post(`${this.TINYMAN_API_URL}/v1/quote`, {
            input_asset_id: inputAssetId,
            output_asset_id: outputAssetId,
            input_amount: inputAmount
          }, { timeout: 5000 });
          
          if (response.data) {
            return {
              inputAsset: inputAssetId,
              outputAsset: outputAssetId,
              inputAmount,
              outputAmount: response.data.output_amount,
              priceImpact: response.data.price_impact,
              fee: response.data.fee
            };
          }
        } catch (apiError) {
          console.warn('Tinyman quote API not available, using mock calculation');
        }
        
        // Fallback to mock calculation
        const pools = await this.getTinymanPools();
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
      }
      
      return null;
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
}