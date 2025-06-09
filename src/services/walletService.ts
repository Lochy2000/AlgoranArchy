// Wallet service with proper SDK integration and error handling
interface WalletAccount {
  address: string;
  name?: string;
}

interface WalletConnectResult {
  accounts: WalletAccount[];
  selectedAccount: string;
}

export class WalletService {
  private static peraWallet: any = null;
  private static myAlgoConnect: any = null;
  private static isInitialized = false;

  static async initializeWallets() {
    if (this.isInitialized) return;
    
    try {
      console.log('🔗 Initializing wallet services...');
      
      // Try to import Pera Wallet
      try {
        // Check if running in browser environment
        if (typeof window !== 'undefined') {
          const { PeraWalletConnect } = await import('@perawallet/connect');
          this.peraWallet = new PeraWalletConnect({
            bridge: import.meta.env.VITE_PERA_WALLET_BRIDGE_URL
          });
          console.log('✅ Pera Wallet SDK loaded');
        }
      } catch (error) {
        console.warn('⚠️ Pera Wallet SDK not available:', error.message);
      }
      
      // Try to import MyAlgo Connect
      try {
        if (typeof window !== 'undefined') {
          const MyAlgoConnect = (await import('@randlabs/myalgo-connect')).default;
          this.myAlgoConnect = new MyAlgoConnect();
          console.log('✅ MyAlgo Connect SDK loaded');
        }
      } catch (error) {
        console.warn('⚠️ MyAlgo Connect SDK not available:', error.message);
      }
      
      this.isInitialized = true;
      console.log('✅ Wallet services initialized');
    } catch (error) {
      console.error('❌ Failed to initialize wallet services:', error);
    }
  }

  static async connectPeraWallet(): Promise<WalletConnectResult> {
    try {
      if (!this.peraWallet) {
        throw new Error('Pera Wallet SDK not available. Please install @perawallet/connect');
      }
      
      console.log('🔗 Connecting to Pera Wallet...');
      const accounts = await this.peraWallet.connect();
      
      return { 
        accounts: accounts.map((addr: string) => ({ address: addr })), 
        selectedAccount: accounts[0] 
      };
    } catch (error) {
      console.error('❌ Pera Wallet connection failed:', error);
      throw new Error(`Failed to connect Pera Wallet: ${error.message}`);
    }
  }

  static async connectMyAlgoWallet(): Promise<WalletConnectResult> {
    try {
      if (!this.myAlgoConnect) {
        throw new Error('MyAlgo Connect SDK not available. Please install @randlabs/myalgo-connect');
      }
      
      console.log('🔗 Connecting to MyAlgo Wallet...');
      const accounts = await this.myAlgoConnect.connect();
      
      return { 
        accounts, 
        selectedAccount: accounts[0].address 
      };
    } catch (error) {
      console.error('❌ MyAlgo Wallet connection failed:', error);
      
      // Handle specific MyAlgo errors
      if (error.message.includes('WINDOW_NOT_LOADED')) {
        throw new Error('MyAlgo Connect popup was blocked or failed to load. Please allow popups and try again.');
      } else if (error.message.includes('User rejected')) {
        throw new Error('Connection was cancelled by user.');
      } else {
        throw new Error(`Failed to connect MyAlgo Wallet: ${error.message}`);
      }
    }
  }

  static async disconnectWallet() {
    try {
      if (this.peraWallet) {
        await this.peraWallet.disconnect();
      }
      console.log('🔌 Wallet disconnected');
    } catch (error) {
      console.error('❌ Error disconnecting wallet:', error);
    }
  }

  static async signTransaction(txn: any, walletType: 'pera' | 'myalgo') {
    try {
      if (walletType === 'pera' && this.peraWallet) {
        return await this.peraWallet.signTransaction([txn]);
      } else if (walletType === 'myalgo' && this.myAlgoConnect) {
        return await this.myAlgoConnect.signTransaction(txn);
      }
      
      throw new Error(`${walletType} wallet not initialized or transaction signing not implemented`);
    } catch (error) {
      console.error('❌ Transaction signing failed:', error);
      throw error;
    }
  }

  static isWalletAvailable(walletType: 'pera' | 'myalgo'): boolean {
    if (walletType === 'pera') return !!this.peraWallet;
    if (walletType === 'myalgo') return !!this.myAlgoConnect;
    return false;
  }

  static getWalletStatus() {
    return {
      pera: {
        available: !!this.peraWallet,
        error: !this.peraWallet ? 'SDK not installed' : null
      },
      myalgo: {
        available: !!this.myAlgoConnect,
        error: !this.myAlgoConnect ? 'SDK not installed' : null
      }
    };
  }
}