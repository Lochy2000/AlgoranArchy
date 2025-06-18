# API Setup Guide

This guide will help you set up all the necessary API keys and services for ALGORANARCHY.

## Required APIs

### 1. Algorand Node API (Required)

ALGORANARCHY needs access to Algorand blockchain data. You have several options:

#### Option A: Nodely (Recommended)
1. Visit [Nodely.io](https://nodely.io)
2. Sign up for a free account
3. Navigate to your dashboard
4. Copy your API token
5. Add to `.env`: `VITE_ALGO_API_TOKEN=your_token_here`

#### Option B: AlgoNode
1. Visit [AlgoNode.io](https://algonode.io)
2. Sign up for an account
3. Get your API credentials
4. Add to `.env`: `VITE_ALGO_API_TOKEN=your_token_here`

#### Option C: Run Your Own Node
If you're running your own Algorand node:
```env
VITE_ALGO_NODE_MAINNET=http://your-node-ip:8080
VITE_ALGO_INDEXER_MAINNET=http://your-indexer-ip:8980
VITE_ALGO_API_TOKEN=your_custom_token
```

### 2. Moralis API (Primary Price Data - Recommended)

For real-time ALGO price data:

#### Moralis API Setup
1. Visit [Moralis.io](https://moralis.io)
2. Sign up for a free account
3. Navigate to your dashboard
4. Create a new project or use existing
5. Get your API key from the "Web3 APIs" section
6. Add to `.env`: `VITE_MORALIS_API_KEY=your_api_key_here`
7. Add to `.env`: `VITE_MORALIS_API_URL=https://deep-index.moralis.io/api/v2.2`

**Free Tier Benefits:**
- 40,000 requests/month
- Real-time price data
- Multiple blockchain support
- Reliable uptime

### 3. CoinGecko API (Backup Price Data - Optional)

For fallback price data when Moralis is unavailable:

#### CoinGecko API
1. Visit [CoinGecko API](https://www.coingecko.com/en/api)
2. Sign up for a free account (500 calls/month)
3. Or upgrade to Pro for higher limits
4. Get your API key
5. Add to `.env`: `VITE_COINGECKO_API_KEY=your_api_key_here`

**Free Tier Limits:**
- 500 calls/month
- Rate limit: 10-50 calls/minute

**Pro Tier Benefits:**
- 10,000+ calls/month
- Higher rate limits
- Priority support

### 4. DEX APIs (Optional)

For trading functionality:

#### Tinyman API
- Usually no API key required for basic queries
- Rate limits apply
- Add to `.env`: `VITE_TINYMAN_API_URL=https://mainnet.analytics.tinyman.org`

#### Pact API
- Check [Pact.fi](https://pact.fi) for API documentation
- Add to `.env`: `VITE_PACT_API_URL=https://api.pact.fi`

## Environment Configuration

Create your `.env` file:

```bash
cp .env.example .env
```

Then edit `.env` with your API keys:

```env
# Required
VITE_ALGO_API_TOKEN=your_algorand_api_token

# Primary price data (recommended)
VITE_MORALIS_API_KEY=your_moralis_api_key
VITE_MORALIS_API_URL=https://deep-index.moralis.io/api/v2.2

# Backup price data (optional)
VITE_COINGECKO_API_KEY=your_coingecko_api_key

# Development
VITE_DEBUG_MODE=true
```

## Testing Your Setup

1. Start the development server:
```bash
npm run dev
```

2. Open the debug panel (bottom right corner)
3. Click "Test API" to verify connectivity
4. Check the console for any error messages

## API Priority Order

The application uses APIs in this priority order:

1. **Moralis API** (Primary) - For ALGO price data
2. **CoinGecko API** (Backup) - For all token prices and fallback ALGO data
3. **Mock Data** (Fallback) - If all APIs fail

## Troubleshooting

### Common Issues

**"Moralis API Key Missing" Error**
- Ensure your `.env` file contains `VITE_MORALIS_API_KEY`
- Check that the variable name is exactly `VITE_MORALIS_API_KEY`
- Restart your development server after adding environment variables

**"Network Error" or "CORS" Issues**
- Moralis and CoinGecko APIs support CORS for browser requests
- Check if your API provider supports browser requests
- Verify your API key is valid and active

**Rate Limiting**
- Free tiers have limited API calls
- Implement caching to reduce API usage
- Consider upgrading to paid tiers for production use

### Debug Mode

Enable debug mode to see detailed API information:

```env
VITE_DEBUG_MODE=true
```

This will show:
- API request/response details
- Error messages and stack traces
- Environment variable status
- Mock data indicators

## Production Considerations

### Security
- Never commit API keys to version control
- Use environment variables in production
- Consider server-side API proxying for sensitive keys
- Implement rate limiting and caching

### Performance
- Cache API responses when possible
- Implement request deduplication
- Use WebSocket connections for real-time data
- Consider CDN for static assets

### Monitoring
- Set up API usage monitoring
- Implement error tracking (Sentry, etc.)
- Monitor rate limits and quotas
- Set up alerts for API failures

## Cost Optimization

### Free Tier Strategies
- Cache responses aggressively
- Batch API requests when possible
- Use mock data for development
- Implement smart refresh intervals

### Paid Tier Benefits
- Higher rate limits
- Better performance
- Priority support
- Advanced features

## Support

If you encounter issues:
1. Check the debug panel for error details
2. Review the console logs
3. Verify your API keys are correct
4. Check API provider status pages
5. Open an issue on GitHub with error details

---

Need help? Open an issue or check our [troubleshooting guide](./TROUBLESHOOTING.md).