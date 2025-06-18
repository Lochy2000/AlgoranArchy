export interface AlgorandAccount {
  address: string;
  amount: number;
  'amount-without-pending-rewards': number;
  'min-balance': number;
  'pending-rewards': number;
  'reward-base': number;
  'rewards-total': number;
  round: number;
  status: string;
  assets?: Asset[];
  'apps-local-state'?: any[];
  'apps-total-schema'?: any;
  'created-apps'?: any[];
  'created-assets'?: any[];
}

export interface Asset {
  'asset-id': number;
  amount: number;
  'is-frozen': boolean;
  'opt-in-round'?: number;
}

export interface AssetInfo {
  index: number;
  params: {
    creator: string;
    decimals: number;
    'default-frozen': boolean;
    name: string;
    'name-b64': string;
    total: number;
    'unit-name': string;
    'unit-name-b64': string;
    url?: string;
    'url-b64'?: string;
    'metadata-hash'?: string;
    manager?: string;
    reserve?: string;
    freeze?: string;
    clawback?: string;
  };
}

export interface Block {
  round: number;
  'genesis-hash': string;
  'genesis-id': string;
  'previous-block-hash': string;
  rewards: {
    'fee-sink': string;
    'rewards-calculation-round': number;
    'rewards-level': number;
    'rewards-pool': string;
    'rewards-rate': number;
    'rewards-residue': number;
  };
  seed: string;
  timestamp: number;
  transactions?: Transaction[];
  'transactions-root': string;
  'txn-counter': number;
}

export interface Transaction {
  id: string;
  'confirmed-round': number;
  'round-time': number;
  'intra-round-offset': number;
  fee: number;
  'first-valid': number;
  'last-valid': number;
  note?: string;
  sender: string;
  'tx-type': string;
  'genesis-hash': string;
  'genesis-id': string;
  group?: string;
  lease?: string;
  'payment-transaction'?: {
    amount: number;
    receiver: string;
    'close-amount'?: number;
    'close-remainder-to'?: string;
  };
  'asset-transfer-transaction'?: {
    amount: number;
    'asset-id': number;
    receiver: string;
    sender?: string;
    'close-amount'?: number;
    'close-to'?: string;
  };
}

export interface NodeStatus {
  'catchup-time': number;
  'last-round': number;
  'last-version': string;
  'next-version': string;
  'next-version-round': number;
  'next-version-supported': boolean;
  'stopped-at-unsupported-round': boolean;
  'time-since-last-round': number;
}

export interface LedgerSupply {
  current_round: number;
  online_money: number;
  total_money: number;
}