# 🤘 ALGORANARCHY - Enhanced Punk Rock Algorand Explorer

[![Deploy Status](https://img.shields.io/badge/deploy-ready-brightgreen)](https://famous-selkie-fc4c64.netlify.app/)
[![License](https://img.shields.io/badge/license-MIT-blue)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Algorand](https://img.shields.io/badge/Algorand-000000?logo=algorand&logoColor=white)](https://algorand.com/)
[![Netlify Status](https://api.netlify.com/api/v1/badges/87217fb3-fa94-48ad-98bb-dd35ee0c0249/deploy-status)](https://app.netlify.com/projects/roaring-phoenix-290d3c/deploys)

> **The most rebellious Algorand blockchain explorer on the web** 🚀

ALGORANARCHY breaks the mold of traditional blockchain explorers with a punk rock aesthetic and cutting-edge functionality. Explore real-time Algorand data, connect wallets, trade tokens, and monitor network health - all with an interface that rocks as hard as the technology behind it.

🌐 **Live Demo**: [https://famous-selkie-fc4c64.netlify.app/](https://famous-selkie-fc4c64.netlify.app/)

![ALGORANARCHY Screenshot](https://github.com/user-attachments/assets/61166ee3-0f91-4642-9202-6465bdc38ac2)

## Features

### **Enhanced Blockchain Explorer**
- **Real-time Data**: Live blocks, transactions, and network statistics with proper API token injection
- **Fixed Explorer Links**: Working links to AlgoExplorer.dev for detailed block/transaction views
- **Network Health**: Monitor node distribution and consensus participation
- **Supply Metrics**: Track total and online stake in real-time
- **Error Handling**: Comprehensive fallback systems and user feedback

### **Improved Wallet Integration**
- **Multi-Wallet Support**: Pera Wallet, MyAlgo Connect, and demo mode
- **Fixed Bridge URLs**: Correct Pera Wallet bridge configuration
- **Secure Connections**: Industry-standard wallet connection protocols
- **Account Overview**: View balances, assets, and transaction history
- **Transaction Signing**: Full support for transaction creation and signing

### **Enhanced Trading & DeFi**
- **Multi-DEX Integration**: Support for Tinyman, Pact, and Vestige
- **Real-time Prices**: Live price feeds from Moralis, CoinGecko, and CoinPaprika APIs
- **Quote System**: Get accurate swap quotes with fallback mechanisms
- **Price Tracking**: Monitor token performance with 24h changes
- **CORS Handling**: Proper error handling for DEX API restrictions

### **Punk Rock UI with Better UX**
- **Glitch Effects**: Cyberpunk-inspired visual elements
- **Neon Colors**: Eye-catching cyan, pink, and purple color scheme
- **Responsive Design**: Perfect on desktop, tablet, and mobile
- **Dark Theme**: Easy on the eyes for long blockchain exploration sessions
- **Error Banners**: Informative error messages with actionable solutions
- **Animated Globe**: Real-time 3D visualization of global node distribution

### **Enhanced Developer Tools**
- **Comprehensive Debug Panel**: Real-time API monitoring and troubleshooting
- **Environment Validation**: Check all required environment variables
- **API Connectivity Tests**: Test Algorand, Price, and DEX APIs
- **TypeScript**: Full type safety and excellent developer experience
- **Modular Architecture**: Clean, maintainable code structure
- **Detailed Documentation**: Complete setup and deployment guides

## Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/algoranarchy.git
   cd algoranarchy
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` with your API keys:
   ```env
   # CRITICAL: Get this from Nodely.io or AlgoNode.io
   VITE_ALGO_API_TOKEN=your_algorand_api_token
   
   # Optional but recommended for better price data
   VITE_MORALIS_API_KEY=your_moralis_api_key
   VITE_COINGECKO_API_KEY=your_coingecko_api_key
   
   # Fixed wallet URLs (already correct in .env.example)
   VITE_PERA_WALLET_BRIDGE_URL=https://wallet-connect.perawallet.app
   VITE_MYALGO_CONNECT_URL=https://wallet.myalgo.com
   
   # Development settings
   VITE_DEBUG_MODE=true
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:5173` and start exploring!

## API Setup

### Required APIs

1. **Algorand API Token** (CRITICAL - Required)
   - Get from [Nodely](https://nodely.io) or [AlgoNode](https://algonode.io)
   - Free tier available with generous limits
   - Used for blockchain data and transactions
   - **Without this, most features won't work!**

2. **Moralis API Key** (Recommended)
   - Get from [Moralis](https://moralis.io)
   - Used for enhanced price data
   - Fallback to other APIs if not available

3. **CoinGecko API Key** (Optional)
   - Get from [CoinGecko API](https://www.coingecko.com/en/api)
   - Free tier: 500 calls/month
   - Used for token prices and market data

### Wallet SDKs (Optional)

For full wallet functionality:
```bash
npm install @perawallet/connect @randlabs/myalgo-connect
```

See our [API Setup Guide](docs/API_SETUP.md) for detailed instructions.

## What's Fixed & Working

✅ **Fixed API Token Injection** - Proper X-Algo-API-Token headers for Nodely endpoints  
✅ **Fixed Explorer Links** - Working links to AlgoExplorer.dev  
✅ **Fixed Wallet Bridge URLs** - Correct Pera Wallet bridge configuration  
✅ **Enhanced Error Handling** - Informative error banners with solutions  
✅ **CORS Handling** - Proper fallbacks for DEX API restrictions  
✅ **Real-time blockchain data** - Live blocks, transactions, network stats  
✅ **Multi-API price feeds** - Moralis, CoinGecko, CoinPaprika with fallbacks  
✅ **Comprehensive debug tools** - Test all APIs and environment variables  
✅ **Responsive UI** - Mobile-first punk rock design  
✅ **Enhanced trading** - Multi-DEX support with proper error handling  

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS with custom punk rock theme
- **Blockchain**: Algorand SDK (algosdk) with proper API token injection
- **State Management**: Zustand
- **Icons**: Lucide React
- **APIs**: Algorand Node, Moralis, CoinGecko, CoinPaprika, Tinyman, Pact
- **Deployment**: Netlify (live at [famous-selkie-fc4c64.netlify.app](https://famous-selkie-fc4c64.netlify.app/))

## Deployment

The application is deployed on Netlify with the following environment variables configured:

```env
VITE_ALGO_API_TOKEN=your_algorand_api_token
VITE_MORALIS_API_KEY=your_moralis_api_key
VITE_COINGECKO_API_KEY=your_coingecko_api_key
VITE_PERA_WALLET_BRIDGE_URL=https://wallet-connect.perawallet.app
VITE_DEBUG_MODE=false
VITE_ENVIRONMENT=production
```

For deployment instructions, see our [Deployment Guide](docs/DEPLOYMENT.md).

### Backend API Proxy

ALGORANARCHY now includes a lightweight Express.js backend used to bypass CORS
restrictions for Tinyman, Pact and Vestige DEX APIs.

#### Running Locally

```bash
# Start the proxy server
cd server && npm install
npm start
```

The proxy listens on `http://localhost:3000` and exposes `/api/tinyman/*`,
`/api/pact/*` and `/api/vestige/*` routes.

Environment variables for Algorand API tokens should be defined without the
`VITE_` prefix, for example:

```env
ALGO_API_TOKEN=your_algorand_api_token
TINYMAN_API_TOKEN=optional_tinyman_token
PACT_API_TOKEN=optional_pact_token
VESTIGE_API_TOKEN=optional_vestige_token
```

#### Production Deployment

Deploy the `server/` folder to your preferred Node.js hosting platform
(Render, Vercel, etc.). Ensure the same environment variables are configured and
update your frontend to point to the deployed backend URL.

## Troubleshooting

### Common Issues

**403 Errors from Algorand APIs**
- Ensure `VITE_ALGO_API_TOKEN` is set in your `.env` file
- Get a token from [Nodely.io](https://nodely.io) or [AlgoNode.io](https://algonode.io)
- Restart your development server after adding the token

**CORS Errors from DEX APIs**
- This is expected - DEX APIs block browser requests for security
- The app falls back to mock data automatically
- External trading links work normally

**Wallet Connection Issues**
- Check that wallet SDKs are installed: `npm install @perawallet/connect @randlabs/myalgo-connect`
- Ensure `VITE_PERA_WALLET_BRIDGE_URL` is set to `https://wallet-connect.perawallet.app`
- Try the demo wallet option for testing

**Debug Panel**
- Enable with `VITE_DEBUG_MODE=true` in your `.env` file
- Use the debug panel (bottom right) to test all APIs
- Check environment variables and connectivity

## Documentation

- [API Setup Guide](docs/API_SETUP.md) - Configure all necessary APIs
- [Deployment Guide](docs/DEPLOYMENT.md) - Deploy to various platforms
- [Contributing Guide](CONTRIBUTING.md) - How to contribute
- [Troubleshooting Guide](docs/TROUBLESHOOTING.md) - Common issues and solutions
- [Changelog](CHANGELOG.md) - Version history and updates

## Roadmap

### Phase 1: Core Fixes 
- [x] Fix API token injection for Algorand endpoints
- [x] Fix explorer links to use AlgoExplorer.dev
- [x] Fix Pera Wallet bridge URL
- [x] Enhanced error handling and user feedback
- [x] CORS handling for DEX APIs

### Phase 2: Advanced Features 
- [ ] Backend proxy for DEX APIs
- [ ] Portfolio tracking
- [ ] Price alerts and notifications
- [ ] Advanced charting
- [ ] NFT marketplace integration

### Phase 3: Community Features 
- [ ] User accounts and profiles
- [ ] Social trading features
- [ ] Community governance
- [ ] Mobile app

## Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Quick Contribution Steps
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- **Algorand Foundation** - For building an amazing blockchain
- **Algorand Community** - For continuous support and feedback
- **Open Source Contributors** - For making this project possible

## Support

- **Bug Reports**: [Open an issue](https://github.com/yourusername/algoranarchy/issues)
- **Feature Requests**: [Start a discussion](https://github.com/yourusername/algoranarchy/discussions)
- **Email**: lochlann_oht@hotmail.com
- **Live Demo**: [https://famous-selkie-fc4c64.netlify.app/](https://famous-selkie-fc4c64.netlify.app/)

## Show Your Support

If you like this project, please consider:
- Starring the repository
- Sharing on social media
- Contributing to the codebase
- [Buying us a coffee]([https://buymeacoffee.com/algoranarchy](https://buymeacoffee.com/lohiggins0m))

---

**Built with and by the ALGORANARCHY team**

*Rock the blockchain!* 

## Recent Updates

### v2.0.0 - Major Fixes & Enhancements
- **Fixed API Token Injection**: Proper X-Algo-API-Token headers for all Algorand API calls
- **Fixed Explorer Links**: Updated to use working AlgoExplorer.dev URLs
- **Fixed Wallet Configuration**: Correct Pera Wallet bridge URL
- **Enhanced Error Handling**: Comprehensive error banners with actionable solutions
- **Improved Debug Tools**: Test all APIs and environment variables
- **CORS Handling**: Proper fallbacks for DEX API restrictions
- **Multi-API Price Feeds**: Moralis, CoinGecko, CoinPaprika with intelligent fallbacks
- **Better User Experience**: Clear feedback for all user actions
