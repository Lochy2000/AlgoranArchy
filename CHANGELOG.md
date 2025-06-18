# Changelog

All notable changes to ALGORANARCHY will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.0] - 2025-01-XX - Major Fixes & Enhancements

### 🔧 Critical Fixes
- **Fixed API Token Injection**: Properly inject X-Algo-API-Token headers for all Algorand API calls
- **Fixed Explorer Links**: Updated all explorer URLs to use working AlgoExplorer.dev instead of deprecated algoexplorer.io
- **Fixed Wallet Bridge URL**: Corrected Pera Wallet bridge URL to https://wallet-connect.perawallet.app
- **Fixed CORS Handling**: Proper error handling and fallbacks for DEX API CORS restrictions

### ✨ New Features
- **Enhanced Debug Panel**: Comprehensive API testing and environment variable validation
- **Error Banner System**: Informative error messages with actionable solutions
- **Multi-API Price Feeds**: Support for Moralis, CoinGecko, CoinPaprika with intelligent fallbacks
- **Enhanced DEX Integration**: Support for Tinyman, Pact, and Vestige with proper error handling
- **Real-time Connectivity Testing**: Test all APIs and show connection status

### 🎨 UI/UX Improvements
- **Better Error Feedback**: Clear, actionable error messages for users
- **Enhanced Debug Tools**: Visual status indicators for all services
- **Improved Loading States**: Better feedback during API calls
- **Responsive Error Banners**: Dismissible banners with help content

### 🛠️ Technical Improvements
- **Proper API Headers**: Consistent header injection across all services
- **Enhanced Error Handling**: Comprehensive try-catch blocks with fallbacks
- **Better Type Safety**: Improved TypeScript types and interfaces
- **Modular Service Architecture**: Clean separation of concerns

### 📚 Documentation
- **Updated README**: Comprehensive setup and troubleshooting guide
- **API Setup Guide**: Detailed instructions for all required APIs
- **Environment Variables**: Clear documentation of all configuration options
- **Troubleshooting Guide**: Common issues and solutions

### 🔒 Security
- **Secure API Key Handling**: Proper environment variable usage
- **CORS Security**: Appropriate handling of cross-origin restrictions
- **Wallet Security**: Secure wallet connection protocols

## [1.0.0] - 2024-12-XX - Initial Release

### Added
- Real-time blockchain data fetching from Algorand mainnet
- Wallet integration support for Pera Wallet and MyAlgo Connect
- Price data integration with CoinGecko API
- DEX integration with Tinyman and Pact
- Debug panel for development and troubleshooting
- Responsive punk rock UI design
- Token trading modal with quote system
- Real-time data hooks and auto-refresh
- Comprehensive error handling and fallbacks
- Block explorer integration with external links

### Changed
- Updated hero section to focus on application purpose
- Improved navigation with smooth scrolling
- Enhanced error messages and user feedback
- Optimized API calls with proper timeout handling

### Fixed
- Wallet connection error handling
- API connectivity issues with fallback data
- Mobile responsiveness across all components
- TypeScript type safety improvements

## [0.1.0] - 2024-01-XX - Initial Setup

### Added
- Initial project setup with Vite + React + TypeScript
- Basic Algorand SDK integration
- Punk rock themed UI components
- Mock data for development
- Basic wallet connection simulation

---

## Release Notes Template

### Version X.X.X - YYYY-MM-DD

**🚀 New Features**
- Feature description

**🐛 Bug Fixes**
- Bug fix description

**⚡ Improvements**
- Improvement description

**🔧 Technical Changes**
- Technical change description

**📚 Documentation**
- Documentation update description

---

## Migration Guide

### Upgrading to v2.0.0

1. **Update Environment Variables**
   ```bash
   # Add required API token
   VITE_ALGO_API_TOKEN=your_token_from_nodely_or_algonode
   
   # Update wallet bridge URL (if customized)
   VITE_PERA_WALLET_BRIDGE_URL=https://wallet-connect.perawallet.app
   
   # Optional: Add additional API keys for better functionality
   VITE_MORALIS_API_KEY=your_moralis_key
   VITE_COINGECKO_API_KEY=your_coingecko_key
   ```

2. **Restart Development Server**
   ```bash
   npm run dev
   ```

3. **Test API Connectivity**
   - Enable debug mode: `VITE_DEBUG_MODE=true`
   - Use the debug panel to test all APIs
   - Verify all environment variables are set correctly

4. **Update Deployment**
   - Ensure all environment variables are set in your deployment platform
   - Update any hardcoded URLs to use the new explorer links
   - Test wallet connections in production

### Breaking Changes

- **Explorer URLs**: All explorer links now use AlgoExplorer.dev instead of algoexplorer.io
- **API Headers**: Algorand API calls now require proper X-Algo-API-Token headers
- **Wallet Bridge**: Pera Wallet bridge URL has been updated

### Deprecated Features

- **Old Explorer Links**: algoexplorer.io links are deprecated and will not work
- **Unsafe URLs**: Microsoft SafeLink encoded URLs are no longer supported

---

## Known Issues

### v2.0.0
- DEX APIs (Tinyman, Pact) have CORS restrictions and will fall back to mock data in browser
- Some price APIs may be rate-limited on free tiers
- Wallet SDKs may need to be installed separately for full functionality

### Workarounds
- Use external DEX links for actual trading
- Consider upgrading to paid API tiers for production use
- Install wallet SDKs: `npm install @perawallet/connect @randlabs/myalgo-connect`

---

## Roadmap

### v2.1.0 (Planned)
- Backend proxy for DEX APIs to resolve CORS issues
- Enhanced portfolio tracking
- Price alerts and notifications

### v2.2.0 (Planned)
- Advanced charting and analytics
- NFT marketplace integration
- Mobile app development

### v3.0.0 (Future)
- User accounts and profiles
- Social trading features
- Community governance features

---

*For detailed technical information, see our [documentation](docs/) folder.*