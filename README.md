# 🤘 ALGORANARCHY - Punk Rock Algorand Explorer

[![Deploy Status](https://img.shields.io/badge/deploy-ready-brightgreen)](https://famous-selkie-fc4c64.netlify.app/)
[![License](https://img.shields.io/badge/license-MIT-blue)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Algorand](https://img.shields.io/badge/Algorand-000000?logo=algorand&logoColor=white)](https://algorand.com/)

> **The most rebellious Algorand blockchain explorer on the web** 🚀

ALGORANARCHY breaks the mold of traditional blockchain explorers with a punk rock aesthetic and cutting-edge functionality. Explore real-time Algorand data, connect wallets, trade tokens, and monitor network health - all with an interface that rocks as hard as the technology behind it.

🌐 **Live Demo**: [https://famous-selkie-fc4c64.netlify.app/](https://famous-selkie-fc4c64.netlify.app/)

![ALGORANARCHY Screenshot](https://github.com/user-attachments/assets/61166ee3-0f91-4642-9202-6465bdc38ac2)

## ✨ Features

### 🔗 **Blockchain Explorer**
- **Real-time Data**: Live blocks, transactions, and network statistics
- **Block Details**: Deep dive into block information with AlgoExplorer integration
- **Network Health**: Monitor node distribution and consensus participation
- **Supply Metrics**: Track total and online stake in real-time

### 💰 **Wallet Integration**
- **Multi-Wallet Support**: Pera Wallet, MyAlgo Connect, and demo mode
- **Secure Connections**: Industry-standard wallet connection protocols
- **Account Overview**: View balances, assets, and transaction history
- **Transaction Signing**: Full support for transaction creation and signing

### 📈 **Trading & DeFi**
- **DEX Integration**: Direct links to Tinyman and Pact for token swaps
- **Real-time Prices**: Live price feeds from Moralis and CoinGecko APIs
- **Quote System**: Get accurate swap quotes before trading
- **Price Tracking**: Monitor token performance with 24h changes

### 🎨 **Punk Rock UI**
- **Glitch Effects**: Cyberpunk-inspired visual elements
- **Neon Colors**: Eye-catching cyan, pink, and purple color scheme
- **Responsive Design**: Perfect on desktop, tablet, and mobile
- **Dark Theme**: Easy on the eyes for long blockchain exploration sessions
- **Animated Globe**: Real-time 3D visualization of global node distribution

### 🛠️ **Developer Tools**
- **Debug Panel**: Real-time API monitoring and troubleshooting
- **TypeScript**: Full type safety and excellent developer experience
- **Modular Architecture**: Clean, maintainable code structure
- **Comprehensive Docs**: Detailed setup and deployment guides

## 🚀 Quick Start

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
   VITE_ALGO_API_TOKEN=your_algorand_api_token
   VITE_MORALIS_API_KEY=your_moralis_api_key
   VITE_COINGECKO_API_KEY=your_coingecko_api_key
   VITE_DEBUG_MODE=true
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:5173` and start exploring!

## 🔑 API Setup

### Required APIs

1. **Algorand API Token** (Required)
   - Get from [Nodely](https://nodely.io) or [AlgoNode](https://algonode.io)
   - Free tier available with generous limits
   - Used for blockchain data and transactions

2. **Moralis API Key** (Primary price data)
   - Get from [Moralis](https://moralis.io)
   - Used for real-time ALGO price data
   - Fallback to CoinGecko if not available

3. **CoinGecko API Key** (Backup price data)
   - Get from [CoinGecko API](https://www.coingecko.com/en/api)
   - Free tier: 500 calls/month
   - Used for token prices and market data

### Wallet SDKs (Optional)

For full wallet functionality:
```bash
npm install @perawallet/connect @randlabs/myalgo-connect
```

See our [API Setup Guide](docs/API_SETUP.md) for detailed instructions.

## 📱 What's Working

✅ **Real-time blockchain data** - Live blocks, transactions, network stats  
✅ **Working block explorer links** - Direct links to AlgoExplorer  
✅ **Functional trading** - Direct integration with Tinyman and Pact DEX  
✅ **Wallet connections** - Demo mode + SDK integration ready  
✅ **Price feeds** - Real-time token prices with Moralis/CoinGecko  
✅ **Animated globe** - 3D visualization of global node distribution  
✅ **Responsive UI** - Mobile-first punk rock design  
✅ **Debug tools** - Comprehensive development panel  
✅ **Error handling** - Graceful fallbacks and user feedback  

## 🛠️ Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS with custom punk rock theme
- **Blockchain**: Algorand SDK (algosdk)
- **State Management**: Zustand
- **Icons**: Lucide React
- **APIs**: Algorand Node, Moralis, CoinGecko, Tinyman, Pact
- **Deployment**: Netlify (live at [famous-selkie-fc4c64.netlify.app](https://famous-selkie-fc4c64.netlify.app/))

## 🌐 Deployment

The application is deployed on Netlify with the following environment variables configured:

```env
VITE_ALGO_API_TOKEN=your_algorand_api_token
VITE_MORALIS_API_KEY=your_moralis_api_key
VITE_COINGECKO_API_KEY=your_coingecko_api_key
VITE_DEBUG_MODE=false
VITE_ENVIRONMENT=production
```

For deployment instructions, see our [Deployment Guide](docs/DEPLOYMENT.md).

## 📖 Documentation

- [API Setup Guide](docs/API_SETUP.md) - Configure all necessary APIs
- [Deployment Guide](docs/DEPLOYMENT.md) - Deploy to various platforms
- [Contributing Guide](CONTRIBUTING.md) - How to contribute
- [Troubleshooting Guide](docs/TROUBLESHOOTING.md) - Common issues and solutions
- [Changelog](CHANGELOG.md) - Version history and updates

## 🎯 Roadmap

### Phase 1: Core Features ✅
- [x] Blockchain explorer with working links
- [x] Functional trading integration
- [x] Animated global node visualization
- [x] Responsive design
- [x] Real-time price data

### Phase 2: Advanced Features 🚧
- [ ] Portfolio tracking
- [ ] Price alerts and notifications
- [ ] Advanced charting
- [ ] NFT marketplace integration

### Phase 3: Community Features 🔮
- [ ] User accounts and profiles
- [ ] Social trading features
- [ ] Community governance
- [ ] Mobile app

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Quick Contribution Steps
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Algorand Foundation** - For building an amazing blockchain
- **Algorand Community** - For continuous support and feedback
- **Open Source Contributors** - For making this project possible

## 📞 Support

- 🐛 **Bug Reports**: [Open an issue](https://github.com/yourusername/algoranarchy/issues)
- 💡 **Feature Requests**: [Start a discussion](https://github.com/yourusername/algoranarchy/discussions)
- 📧 **Email**: lochlann_oht@hotmail.com
- 🌐 **Live Demo**: [https://famous-selkie-fc4c64.netlify.app/](https://famous-selkie-fc4c64.netlify.app/)

## ⭐ Show Your Support

If you like this project, please consider:
- ⭐ Starring the repository
- 🐦 Sharing on social media
- 🤝 Contributing to the codebase
- ☕ [Buying us a coffee](https://buymeacoffee.com/algoranarchy)

---

**Built with ❤️ and 🤘 by the ALGORANARCHY team**

*Rock the blockchain!* 🚀