import algosdk from 'algosdk';
import type { AlgorandAccount, Block, NodeStatus, LedgerSupply, AssetInfo, Transaction } from '../types/algorand';

const API_TOKEN = import.meta.env.VITE_ALGO_API_TOKEN || '';
const MAINNET_NODE = import.meta.env.VITE_ALGO_NODE_MAINNET || 'https://mainnet-api.4160.nodely.io';
const MAINNET_INDEXER = import.meta.env.VITE_ALGO_INDEXER_MAINNET || 'https://mainnet-idx.4160.nodely.io';
const DEBUG_MODE = import.meta.env.VITE_DEBUG_MODE === 'true';

// Enhanced Algorand service with proper API token injection and error handling
export class AlgorandAPIService {
  private static algodClient: algosdk.Algodv2;
  private static indexerClient: algosdk.Indexer;
  private static isInitialized = false;

  static initialize() {
    if (this.isInitialized) return;

    // Proper headers with API token injection
    const headers: Record<string, string> = {};
    if (API_TOKEN) {
      headers['X-Algo-API-Token'] = API_TOKEN;
    } else {
      console.warn('⚠️ VITE_ALGO_API_TOKEN is missing - API calls may fail with 403');
    }

    this.algodClient = new algosdk.Algodv2(headers, MAINNET_NODE, '');
    this.indexerClient = new algosdk.Indexer(headers, MAINNET_INDEXER, '');
    this.isInitialized = true;

    if (DEBUG_MODE) {
      console.log('🔗 Algorand API Service initialized');
      console.log('Node URL:', MAINNET_NODE);
      console.log('Indexer URL:', MAINNET_INDEXER);
      console.log('API Token:', API_TOKEN ? 'Present ✅' : 'Missing ❌');
    }
  }

  // Enhanced fetch with proper headers and error handling
  private static async makeAlgorandRequest(url: string, options: RequestInit = {}): Promise<any> {
    const headers: Record<string, string> = {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      ...options.headers as Record<string, string>
    };

    // Critical: Inject API token for Nodely endpoints
    if (API_TOKEN && (url.includes('nodely.io') || url.includes('algonode.io'))) {
      headers['X-Algo-API-Token'] = API_TOKEN;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
        mode: 'cors'
      });

      if (response.status === 403) {
        throw new Error('API authentication failed. Check your VITE_ALGO_API_TOKEN.');
      }

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      if (DEBUG_MODE) {
        console.error(`Request failed for ${url}:`, error);
      }
      throw error;
    }
  }

  // Node Status and Health
  static async getNodeStatus(): Promise<NodeStatus> {
    this.initialize();
    try {
      const status = await this.algodClient.status().do();
      return {
        'catchup-time': Number(status.catchupTime || 0),
        'last-round': Number(status.lastRound || 0),
        'last-version': status.lastVersion || '',
        'next-version': status.nextVersion || '',
        'next-version-round': Number(status.nextVersionRound || 0),
        'next-version-supported': status.nextVersionSupported || false,
        'stopped-at-unsupported-round': status.stoppedAtUnsupportedRound || false,
        'time-since-last-round': Number(status.timeSinceLastRound || 0)
      };
    } catch (error) {
      console.warn('Failed to fetch node status, using mock data:', error);
      return this.getMockNodeStatus();
    }
  }

  static async getLedgerSupply(): Promise<LedgerSupply> {
    this.initialize();
    try {
      const supply = await this.algodClient.supply().do();
      return {
        current_round: Number(supply.currentRound || 0),
        online_money: Number(supply.onlineMoney || 0),
        total_money: Number(supply.totalMoney || 0)
      };
    } catch (error) {
      console.warn('Failed to fetch ledger supply, using mock data:', error);
      return this.getMockLedgerSupply();
    }
  }

  // Block Operations
  static async getLatestBlocks(count: number = 10): Promise<Block[]> {
    this.initialize();
    try {
      const status = await this.getNodeStatus();
      const latestRound = status['last-round'];
      const blocks: Block[] = [];

      for (let i = 0; i < count; i++) {
        const round = latestRound - i;
        if (round > 0) {
          try {
            const block = await this.getBlock(round);
            blocks.push(block);
          } catch (blockError) {
            // If individual block fails, create mock block
            blocks.push(this.getMockBlock(round));
          }
        }
      }

      return blocks;
    } catch (error) {
      console.warn('Failed to fetch latest blocks, using mock data:', error);
      return this.getMockBlocks(count);
    }
  }

  static async getBlock(round: number): Promise<Block> {
    this.initialize();
    try {
      const blockResponse = await this.algodClient.block(round).do();
      const block = blockResponse.block;

      return {
        round: Number(block.rnd || round),
        'genesis-hash': block.gh || '',
        'genesis-id': block.gen || 'mainnet-v1.0',
        'previous-block-hash': block.prev || '',
        rewards: {
          'fee-sink': block.fees || '',
          'rewards-calculation-round': Number(block.rnd || round),
          'rewards-level': 0,
          'rewards-pool': block.rwd || '',
          'rewards-rate': 0,
          'rewards-residue': 0
        },
        seed: block.seed || '',
        timestamp: Number(block.ts || Math.floor(Date.now() / 1000)),
        'transactions-root': block.txn || '',
        'txn-counter': Number(block.tc || 0),
        transactions: block.txns || []
      };
    } catch (error) {
      console.warn(`Failed to fetch block ${round}, using mock data:`, error);
      return this.getMockBlock(round);
    }
  }

  // Account Operations
  static async getAccount(address: string): Promise<AlgorandAccount> {
    this.initialize();
    try {
      const accountInfo = await this.algodClient.accountInformation(address).do();
      return {
        address: accountInfo.address,
        amount: Number(accountInfo.amount || 0),
        'amount-without-pending-rewards': Number(accountInfo['amount-without-pending-rewards'] || 0),
        'min-balance': Number(accountInfo['min-balance'] || 100000),
        'pending-rewards': Number(accountInfo['pending-rewards'] || 0),
        'reward-base': Number(accountInfo['reward-base'] || 0),
        'rewards-total': Number(accountInfo['rewards-total'] || 0),
        round: Number(accountInfo.round || 0),
        status: accountInfo.status || 'Online',
        assets: accountInfo.assets || [],
        'apps-local-state': accountInfo['apps-local-state'] || [],
        'apps-total-schema': accountInfo['apps-total-schema'] || {},
        'created-apps': accountInfo['created-apps'] || [],
        'created-assets': accountInfo['created-assets'] || []
      };
    } catch (error) {
      console.error(`Failed to fetch account ${address}:`, error);
      throw new Error(`Account not found or API error: ${error.message}`);
    }
  }

  static async getAccountTransactions(address: string, limit: number = 10): Promise<Transaction[]> {
    this.initialize();
    try {
      const response = await this.indexerClient
        .searchForTransactions()
        .address(address)
        .limit(limit)
        .do();
      
      return response.transactions || [];
    } catch (error) {
      console.warn(`Failed to fetch transactions for ${address}:`, error);
      return [];
    }
  }

  // Asset Operations
  static async getAssetInfo(assetId: number): Promise<AssetInfo> {
    this.initialize();
    try {
      const assetInfo = await this.algodClient.getAssetByID(assetId).do();
      return assetInfo;
    } catch (error) {
      console.error(`Failed to fetch asset ${assetId}:`, error);
      throw new Error(`Asset not found: ${error.message}`);
    }
  }

  static async getTopAssets(limit: number = 20): Promise<AssetInfo[]> {
    this.initialize();
    try {
      const response = await this.indexerClient
        .searchForAssets()
        .limit(limit)
        .do();
      
      return response.assets || [];
    } catch (error) {
      console.warn('Failed to fetch top assets:', error);
      return [];
    }
  }

  static async searchAssets(query: string, limit: number = 10): Promise<AssetInfo[]> {
    this.initialize();
    try {
      const response = await this.indexerClient
        .searchForAssets()
        .name(query)
        .limit(limit)
        .do();
      
      return response.assets || [];
    } catch (error) {
      console.warn(`Failed to search assets for "${query}":`, error);
      return [];
    }
  }

  // Transaction Operations
  static async getTransaction(txId: string): Promise<Transaction> {
    this.initialize();
    try {
      const response = await this.indexerClient
        .lookupTransactionByID(txId)
        .do();
      
      return response.transaction;
    } catch (error) {
      console.error(`Failed to fetch transaction ${txId}:`, error);
      throw new Error(`Transaction not found: ${error.message}`);
    }
  }

  static async getLatestTransactions(limit: number = 20): Promise<Transaction[]> {
    this.initialize();
    try {
      const response = await this.indexerClient
        .searchForTransactions()
        .limit(limit)
        .do();
      
      return response.transactions || [];
    } catch (error) {
      console.warn('Failed to fetch latest transactions:', error);
      return [];
    }
  }

  static async getTransactionsByBlock(round: number): Promise<Transaction[]> {
    this.initialize();
    try {
      const response = await this.indexerClient
        .searchForTransactions()
        .round(round)
        .do();
      
      return response.transactions || [];
    } catch (error) {
      console.warn(`Failed to fetch transactions for block ${round}:`, error);
      return [];
    }
  }

  // Transaction Building and Signing
  static async getTransactionParams() {
    this.initialize();
    try {
      return await this.algodClient.getTransactionParams().do();
    } catch (error) {
      console.error('Failed to get transaction params:', error);
      throw error;
    }
  }

  static async submitTransaction(signedTxn: Uint8Array): Promise<string> {
    this.initialize();
    try {
      const response = await this.algodClient.sendRawTransaction(signedTxn).do();
      return response.txId;
    } catch (error) {
      console.error('Failed to submit transaction:', error);
      throw error;
    }
  }

  static async waitForConfirmation(txId: string, maxRounds: number = 10): Promise<any> {
    this.initialize();
    try {
      return await algosdk.waitForConfirmation(this.algodClient, txId, maxRounds);
    } catch (error) {
      console.error(`Failed to wait for confirmation of ${txId}:`, error);
      throw error;
    }
  }

  // Application (Smart Contract) Operations
  static async getApplication(appId: number): Promise<any> {
    this.initialize();
    try {
      return await this.algodClient.getApplicationByID(appId).do();
    } catch (error) {
      console.error(`Failed to fetch application ${appId}:`, error);
      throw error;
    }
  }

  static async searchApplications(limit: number = 10): Promise<any[]> {
    this.initialize();
    try {
      const response = await this.indexerClient
        .searchForApplications()
        .limit(limit)
        .do();
      
      return response.applications || [];
    } catch (error) {
      console.warn('Failed to search applications:', error);
      return [];
    }
  }

  // Network Statistics
  static async getNetworkStats(): Promise<any> {
    try {
      const [status, supply] = await Promise.all([
        this.getNodeStatus(),
        this.getLedgerSupply()
      ]);

      return {
        currentRound: status['last-round'],
        totalSupply: supply.total_money,
        onlineStake: supply.online_money,
        participationRate: (supply.online_money / supply.total_money) * 100,
        lastBlockTime: status['time-since-last-round'],
        version: status['last-version']
      };
    } catch (error) {
      console.warn('Failed to get network stats:', error);
      return this.getMockNetworkStats();
    }
  }

  // Utility Methods
  static formatAlgoAmount(microAlgos: number): string {
    if (!microAlgos || isNaN(microAlgos)) return '0.000000';
    return (microAlgos / 1000000).toFixed(6);
  }

  static formatAssetAmount(amount: number, decimals: number): string {
    if (!amount || isNaN(amount) || !decimals || isNaN(decimals)) return '0';
    return (amount / Math.pow(10, decimals)).toFixed(decimals);
  }

  static shortenAddress(address: string, chars: number = 6): string {
    if (!address || address === '') return 'N/A';
    if (address.length <= chars * 2) return address;
    return `${address.slice(0, chars)}...${address.slice(-chars)}`;
  }

  static formatTimestamp(timestamp: number): string {
    if (!timestamp || isNaN(timestamp)) return 'N/A';
    
    const date = new Date(timestamp * 1000);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    if (minutes > 0) return `${minutes} min${minutes > 1 ? 's' : ''} ago`;
    return `${seconds} sec${seconds > 1 ? 's' : ''} ago`;
  }

  // Fixed Explorer URLs - Using correct AlgoExplorer.dev
  static getBlockExplorerUrl(round: number): string {
    return `https://algoexplorer.dev/block/${round}`;
  }

  static getTransactionExplorerUrl(txId: string): string {
    return `https://algoexplorer.dev/tx/${txId}`;
  }

  static getAccountExplorerUrl(address: string): string {
    return `https://algoexplorer.dev/address/${address}`;
  }

  static getAssetExplorerUrl(assetId: number): string {
    return `https://algoexplorer.dev/asset/${assetId}`;
  }

  // Mock Data Methods (for fallback)
  private static getMockNodeStatus(): NodeStatus {
    return {
      'catchup-time': 0,
      'last-round': 50789234,
      'last-version': 'v3.25.0',
      'next-version': 'v3.25.0',
      'next-version-round': 50789234,
      'next-version-supported': true,
      'stopped-at-unsupported-round': false,
      'time-since-last-round': 3800
    };
  }

  private static getMockLedgerSupply(): LedgerSupply {
    return {
      current_round: 50789234,
      online_money: 6800000000000000,
      total_money: 10000000000000000
    };
  }

  private static getMockBlock(round: number): Block {
    return {
      round: round,
      'genesis-hash': 'wGHE2Pwdvd7S12BL5FaOP20EGYesN73ktiC1qzkkit8=',
      'genesis-id': 'mainnet-v1.0',
      'previous-block-hash': `${Math.random().toString(36).substring(2, 8)}...${Math.random().toString(36).substring(2, 8)}`,
      rewards: {
        'fee-sink': 'A7NMWS3NT3IUDMLVO26ULGXGIIOUQ3ND2TXSER6EBGRZNOBOUIQXHIBGDE',
        'rewards-calculation-round': round,
        'rewards-level': 0,
        'rewards-pool': 'A7NMWS3NT3IUDMLVO26ULGXGIIOUQ3ND2TXSER6EBGRZNOBOUIQXHIBGDE',
        'rewards-rate': 0,
        'rewards-residue': 0
      },
      seed: 'mock-seed',
      timestamp: Math.floor(Date.now() / 1000) - Math.floor(Math.random() * 300),
      'transactions-root': 'mock-tx-root',
      'txn-counter': Math.floor(Math.random() * 200) + 50
    };
  }

  private static getMockBlocks(count: number): Block[] {
    const blocks: Block[] = [];
    for (let i = 0; i < count; i++) {
      blocks.push(this.getMockBlock(50789234 - i));
    }
    return blocks;
  }

  private static getMockNetworkStats(): any {
    return {
      currentRound: 50789234,
      totalSupply: 10000000000000000,
      onlineStake: 6800000000000000,
      participationRate: 68,
      lastBlockTime: 3800,
      version: 'v3.25.0'
    };
  }

  // API Connectivity Test
  static async testConnectivity(): Promise<{ success: boolean; message: string; details?: any }> {
    try {
      this.initialize();
      
      // Test algod health with proper headers
      const healthUrl = `${MAINNET_NODE}/health`;
      const headers: Record<string, string> = {};
      if (API_TOKEN) {
        headers['X-Algo-API-Token'] = API_TOKEN;
      }

      const healthResponse = await fetch(healthUrl, {
        headers,
        mode: 'cors'
      });

      if (healthResponse.ok) {
        // Test actual API call
        const status = await this.algodClient.status().do();
        return {
          success: true,
          message: 'Algorand API is fully accessible',
          details: {
            nodeUrl: MAINNET_NODE,
            indexerUrl: MAINNET_INDEXER,
            lastRound: status.lastRound,
            version: status.lastVersion,
            tokenPresent: !!API_TOKEN
          }
        };
      } else {
        return {
          success: false,
          message: `API health check failed: ${healthResponse.status}`,
          details: { nodeUrl: MAINNET_NODE, tokenPresent: !!API_TOKEN }
        };
      }
    } catch (error) {
      return {
        success: false,
        message: `API connectivity failed: ${error.message}`,
        details: { error: error.message, tokenPresent: !!API_TOKEN }
      };
    }
  }
}