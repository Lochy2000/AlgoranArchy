import { create } from 'zustand';
import type { AlgorandAccount, Block, NodeStatus, LedgerSupply, AssetInfo, Transaction } from '../types/algorand';
import { AlgorandService } from '../services/algorandService';
import { EnhancedDexService } from '../services/enhancedDexService';

interface EnhancedAlgorandState {
  // Node status
  nodeStatus: NodeStatus | null;
  ledgerSupply: LedgerSupply | null;
  networkStats: any | null;
  
  // Blocks and Transactions
  latestBlocks: Block[];
  currentBlock: Block | null;
  latestTransactions: Transaction[];
  
  // Account
  connectedAccount: AlgorandAccount | null;
  accountTransactions: Transaction[];
  
  // Assets and Trading
  topAssets: AssetInfo[];
  searchResults: AssetInfo[];
  dexPools: any[];
  
  // Loading states
  isLoadingStatus: boolean;
  isLoadingBlocks: boolean;
  isLoadingTransactions: boolean;
  isLoadingAccount: boolean;
  isLoadingAssets: boolean;
  isLoadingDex: boolean;
  
  // Error states
  error: string | null;
  
  // Actions
  fetchNodeStatus: () => Promise<void>;
  fetchLedgerSupply: () => Promise<void>;
  fetchNetworkStats: () => Promise<void>;
  fetchLatestBlocks: (count?: number) => Promise<void>;
  fetchBlock: (round: number) => Promise<void>;
  fetchLatestTransactions: (count?: number) => Promise<void>;
  fetchTransaction: (txId: string) => Promise<Transaction>;
  fetchAccount: (address: string) => Promise<AlgorandAccount>;
  fetchAccountTransactions: (address: string) => Promise<void>;
  fetchTopAssets: (limit?: number) => Promise<void>;
  searchAssets: (query: string) => Promise<void>;
  fetchDexPools: () => Promise<void>;
  clearError: () => void;
  setConnectedAccount: (account: AlgorandAccount | null) => void;
  
  // Real-time updates
  startRealTimeUpdates: () => void;
  stopRealTimeUpdates: () => void;
}

export const useEnhancedAlgorandStore = create<EnhancedAlgorandState>((set, get) => {
  let updateInterval: NodeJS.Timeout | null = null;

  return {
    // Initial state
    nodeStatus: null,
    ledgerSupply: null,
    networkStats: null,
    latestBlocks: [],
    currentBlock: null,
    latestTransactions: [],
    connectedAccount: null,
    accountTransactions: [],
    topAssets: [],
    searchResults: [],
    dexPools: [],
    isLoadingStatus: false,
    isLoadingBlocks: false,
    isLoadingTransactions: false,
    isLoadingAccount: false,
    isLoadingAssets: false,
    isLoadingDex: false,
    error: null,

    // Actions
    fetchNodeStatus: async () => {
      set({ isLoadingStatus: true, error: null });
      try {
        const status = await AlgorandService.getNodeStatus();
        set({ nodeStatus: status, isLoadingStatus: false });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to fetch node status';
        console.error('Store: fetchNodeStatus error:', errorMessage);
        set({ error: errorMessage, isLoadingStatus: false });
      }
    },

    fetchLedgerSupply: async () => {
      try {
        const supply = await AlgorandService.getLedgerSupply();
        set({ ledgerSupply: supply });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to fetch ledger supply';
        console.error('Store: fetchLedgerSupply error:', errorMessage);
        set({ error: errorMessage });
      }
    },

    fetchNetworkStats: async () => {
      try {
        const stats = await AlgorandService.getNetworkStats();
        set({ networkStats: stats });
      } catch (error) {
        console.error('Store: fetchNetworkStats error:', error);
        set({ networkStats: null });
      }
    },

    fetchLatestBlocks: async (count = 10) => {
      set({ isLoadingBlocks: true, error: null });
      try {
        const blocks = await AlgorandService.getLatestBlocks(count);
        set({ latestBlocks: blocks, isLoadingBlocks: false });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to fetch latest blocks';
        console.error('Store: fetchLatestBlocks error:', errorMessage);
        set({ error: errorMessage, isLoadingBlocks: false });
      }
    },

    fetchBlock: async (round: number) => {
      set({ isLoadingBlocks: true, error: null });
      try {
        const block = await AlgorandService.getBlock(round);
        set({ currentBlock: block, isLoadingBlocks: false });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : `Failed to fetch block ${round}`;
        console.error('Store: fetchBlock error:', errorMessage);
        set({ error: errorMessage, isLoadingBlocks: false });
      }
    },

    fetchLatestTransactions: async (count = 20) => {
      set({ isLoadingTransactions: true, error: null });
      try {
        const transactions = await AlgorandService.getLatestTransactions(count);
        set({ latestTransactions: transactions, isLoadingTransactions: false });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to fetch latest transactions';
        console.error('Store: fetchLatestTransactions error:', errorMessage);
        set({ error: errorMessage, isLoadingTransactions: false });
      }
    },

    fetchTransaction: async (txId: string) => {
      try {
        const transaction = await AlgorandService.getTransaction(txId);
        return transaction;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to fetch transaction';
        console.error('Store: fetchTransaction error:', errorMessage);
        set({ error: errorMessage });
        throw error;
      }
    },

    fetchAccount: async (address: string) => {
      set({ isLoadingAccount: true, error: null });
      try {
        const account = await AlgorandService.getAccount(address);
        set({ connectedAccount: account, isLoadingAccount: false });
        return account;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to fetch account';
        console.error('Store: fetchAccount error:', errorMessage);
        set({ error: errorMessage, isLoadingAccount: false });
        throw error;
      }
    },

    fetchAccountTransactions: async (address: string) => {
      set({ isLoadingTransactions: true });
      try {
        const transactions = await AlgorandService.getAccountTransactions(address, 20);
        set({ accountTransactions: transactions, isLoadingTransactions: false });
      } catch (error) {
        console.error('Store: fetchAccountTransactions error:', error);
        set({ isLoadingTransactions: false });
      }
    },

    fetchTopAssets: async (limit = 20) => {
      set({ isLoadingAssets: true, error: null });
      try {
        const assets = await AlgorandService.getTopAssets(limit);
        set({ topAssets: assets, isLoadingAssets: false });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to fetch top assets';
        console.error('Store: fetchTopAssets error:', errorMessage);
        set({ error: errorMessage, isLoadingAssets: false });
      }
    },

    searchAssets: async (query: string) => {
      set({ isLoadingAssets: true });
      try {
        const results = await AlgorandService.searchAssets(query, 10);
        set({ searchResults: results, isLoadingAssets: false });
      } catch (error) {
        console.error('Store: searchAssets error:', error);
        set({ isLoadingAssets: false });
      }
    },

    fetchDexPools: async () => {
      set({ isLoadingDex: true });
      try {
        const pools = await EnhancedDexService.getAllPools();
        set({ dexPools: pools, isLoadingDex: false });
      } catch (error) {
        console.error('Store: fetchDexPools error:', error);
        set({ isLoadingDex: false });
      }
    },

    clearError: () => set({ error: null }),
    
    setConnectedAccount: (account: AlgorandAccount | null) => {
      set({ connectedAccount: account });
    },

    // Real-time updates
    startRealTimeUpdates: () => {
      const { fetchNodeStatus, fetchLatestBlocks, fetchLatestTransactions } = get();
      
      if (updateInterval) {
        clearInterval(updateInterval);
      }

      // Update every 30 seconds
      updateInterval = setInterval(async () => {
        try {
          await Promise.all([
            fetchNodeStatus(),
            fetchLatestBlocks(5),
            fetchLatestTransactions(10)
          ]);
        } catch (error) {
          console.warn('Real-time update failed:', error);
        }
      }, 30000);

      console.log('🔄 Real-time updates started');
    },

    stopRealTimeUpdates: () => {
      if (updateInterval) {
        clearInterval(updateInterval);
        updateInterval = null;
        console.log('⏹️ Real-time updates stopped');
      }
    }
  };
});