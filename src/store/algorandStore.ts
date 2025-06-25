import { create } from 'zustand';
import type { AlgorandAccount, Block, NodeStatus, LedgerSupply, AssetInfo } from '../types/algorand';
import { AlgorandService } from '../services/algorandService';

interface AlgorandState {
  // Node status
  nodeStatus: NodeStatus | null;
  ledgerSupply: LedgerSupply | null;
  
  // Blocks
  latestBlocks: Block[];
  currentBlock: Block | null;
  
  // Account
  connectedAccount: AlgorandAccount | null;
  
  // Assets
  topAssets: AssetInfo[];
  
  // Loading states
  isLoadingStatus: boolean;
  isLoadingBlocks: boolean;
  isLoadingAccount: boolean;
  isLoadingAssets: boolean;
  
  // Error states
  error: string | null;
  
  // Actions
  fetchNodeStatus: () => Promise<void>;
  fetchLedgerSupply: () => Promise<void>;
  fetchLatestBlocks: () => Promise<void>;
  fetchBlock: (round: number) => Promise<void>;
  fetchAccount: (address: string) => Promise<void>;
  fetchTopAssets: () => Promise<void>;
  clearError: () => void;
  setConnectedAccount: (account: AlgorandAccount | null) => void;
}

export const useAlgorandStore = create<AlgorandState>((set, get) => ({
  // Initial state
  nodeStatus: null,
  ledgerSupply: null,
  latestBlocks: [],
  currentBlock: null,
  connectedAccount: null,
  topAssets: [],
  isLoadingStatus: false,
  isLoadingBlocks: false,
  isLoadingAccount: false,
  isLoadingAssets: false,
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
      set({ 
        error: errorMessage,
        isLoadingStatus: false 
      });
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

  fetchLatestBlocks: async () => {
    set({ isLoadingBlocks: true, error: null });
    try {
      const blocks = await AlgorandService.getLatestBlocks(10);
      set({ latestBlocks: blocks, isLoadingBlocks: false });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch latest blocks';
      console.error('Store: fetchLatestBlocks error:', errorMessage);
      set({ 
        error: errorMessage,
        isLoadingBlocks: false 
      });
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
      set({ 
        error: errorMessage,
        isLoadingBlocks: false 
      });
    }
  },

  fetchAccount: async (address: string) => {
    set({ isLoadingAccount: true, error: null });
    try {
      const account = await AlgorandService.getAccount(address);
      set({ connectedAccount: account, isLoadingAccount: false });
      return account; // Return the account for use in wallet connection
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch account';
      console.error('Store: fetchAccount error:', errorMessage);
      set({ 
        error: errorMessage,
        isLoadingAccount: false 
      });
      throw error; // Re-throw for wallet connection error handling
    }
  },

  fetchTopAssets: async () => {
    set({ isLoadingAssets: true, error: null });
    try {
      const assets = await AlgorandService.getTopAssets(6);
      set({ topAssets: assets, isLoadingAssets: false });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch top assets';
      console.error('Store: fetchTopAssets error:', errorMessage);
      set({ 
        error: errorMessage,
        isLoadingAssets: false 
      });
    }
  },

  clearError: () => set({ error: null }),
  
  setConnectedAccount: (account: AlgorandAccount | null) => {
    set({ connectedAccount: account });
  },
}));