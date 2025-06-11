// Enhanced wallet service with better error handling and connection flow
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
  private static connectedWallet: 'pera' | 'myalgo' | 'demo' | null = null;

  static async initializeWallets() {
    if (this.isInitialized) return;
    
    try {
      console.log('🔗 Initializing wallet services...');
      
      // Try to import Pera Wallet
      try {
        if (typeof window !== 'undefined') {
          // Check if Pera Wallet is available
          const { PeraWalletConnect } = await import('@perawallet/connect');
          this.peraWallet = new PeraWalletConnect({
            bridge: import.meta.env.VITE_PERA_WALLET_BRIDGE_URL || 'https://bridge.walletconnect.org'
          });
          
          // Set up reconnection handler
          this.peraWallet.reconnectSession().then((accounts: string[]) => {
            if (accounts.length > 0) {
              console.log('🔄 Pera Wallet auto-reconnected:', accounts[0]);
              this.connectedWallet = 'pera';
            }
          }).catch((error: any) => {
            console.log('No existing Pera Wallet session');
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
      
      // Disconnect any existing session first
      await this.peraWallet.disconnect();
      
      // Connect to Pera Wallet
      const accounts = await this.peraWallet.connect();
      
      if (!accounts || accounts.length === 0) {
        throw new Error('No accounts returned from Pera Wallet');
      }
      
      this.connectedWallet = 'pera';
      console.log('✅ Pera Wallet connected successfully:', accounts[0]);
      
      return { 
        accounts: accounts.map((addr: string) => ({ address: addr })), 
        selectedAccount: accounts[0] 
      };
    } catch (error) {
      console.error('❌ Pera Wallet connection failed:', error);
      
      // Handle specific Pera Wallet errors
      if (error.message.includes('User rejected')) {
        throw new Error('Connection was cancelled by user.');
      } else if (error.message.includes('Modal closed')) {
        throw new Error('Pera Wallet modal was closed. Please try again.');
      } else {
        throw new Error(`Failed to connect Pera Wallet: ${error.message}`);
      }
    }
  }

  static async connectMyAlgoWallet(): Promise<WalletConnectResult> {
    try {
      if (!this.myAlgoConnect) {
        throw new Error('MyAlgo Connect SDK not available. Please install @randlabs/myalgo-connect');
      }
      
      console.log('🔗 Connecting to MyAlgo Wallet...');
      
      // Connect with specific settings
      const accounts = await this.myAlgoConnect.connect({
        shouldSelectOneAccount: false,
        openManager: true
      });
      
      if (!accounts || accounts.length === 0) {
        throw new Error('No accounts returned from MyAlgo Connect');
      }
      
      this.connectedWallet = 'myalgo';
      console.log('✅ MyAlgo Wallet connected successfully:', accounts[0].address);
      
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
      } else if (error.message.includes('No accounts')) {
        throw new Error('No accounts found in MyAlgo Wallet. Please create an account first.');
      } else {
        throw new Error(`Failed to connect MyAlgo Wallet: ${error.message}`);
      }
    }
  }

  static async disconnectWallet() {
    try {
      if (this.connectedWallet === 'pera' && this.peraWallet) {
        await this.peraWallet.disconnect();
      }
      
      this.connectedWallet = null;
      console.log('🔌 Wallet disconnected');
    } catch (error) {
      console.error('❌ Error disconnecting wallet:', error);
    }
  }

  static async signTransaction(txn: any, walletType: 'pera' | 'myalgo') {
    try {
      if (walletType === 'pera' && this.peraWallet) {
        const signedTxn = await this.peraWallet.signTransaction([txn]);
        return signedTxn[0];
      } else if (walletType === 'myalgo' && this.myAlgoConnect) {
        const signedTxn = await this.myAlgoConnect.signTransaction(txn);
        return signedTxn.blob;
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

  static getConnectedWallet(): 'pera' | 'myalgo' | 'demo' | null {
    return this.connectedWallet;
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

  // New method to check if wallet extension is installed
  static async checkWalletExtensions() {
    const status = {
      peraExtension: false,
      myalgoExtension: false
    };

    try {
      // Check for Pera Wallet extension
      if (typeof window !== 'undefined' && (window as any).algorand) {
        status.peraExtension = true;
      }
      
      // Check for MyAlgo extension (they don't have a browser extension, only web wallet)
      // MyAlgo works through their web interface
      status.myalgoExtension = true; // Always available as web wallet
      
    } catch (error) {
      console.warn('Error checking wallet extensions:', error);
    }

    return status;
  }
}