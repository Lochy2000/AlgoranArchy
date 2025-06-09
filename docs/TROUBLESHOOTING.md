# Troubleshooting Guide

Common issues and solutions for ALGORANARCHY.

## 🔧 Setup Issues

### Environment Variables Not Loading

**Problem**: API calls failing with "token missing" errors

**Solutions**:
1. Ensure `.env` file is in the root directory (same level as `package.json`)
2. Restart your development server after adding environment variables
3. Check variable names are exactly: `VITE_ALGO_API_TOKEN`, `VITE_COINGECKO_API_KEY`
4. Verify no extra spaces or quotes around values

```bash
# ✅ Correct
VITE_ALGO_API_TOKEN=your_token_here

# ❌ Incorrect
VITE_ALGO_API_TOKEN = "your_token_here"
```

### Wallet Connection Failures

**Problem**: "SDK not installed" or wallet connection errors

**Solutions**:
1. Install wallet SDKs:
   ```bash
   npm install @perawallet/connect @randlabs/myalgo-connect
   ```
2. Clear browser cache and cookies
3. Disable browser extensions that might interfere
4. Try in incognito/private browsing mode
5. Check browser console for specific error messages

### API Connectivity Issues

**Problem**: "Network Error" or "CORS" issues

**Solutions**:
1. Check your internet connection
2. Verify API keys are valid and active
3. Check API provider status pages:
   - [Nodely Status](https://status.nodely.io)
   - [CoinGecko Status](https://status.coingecko.com)
4. Try using debug mode to see detailed error messages
5. Check if you've exceeded API rate limits

## 🐛 Runtime Errors

### "Module not found" Errors

**Problem**: Import errors or missing dependencies

**Solutions**:
1. Clear node_modules and reinstall:
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```
2. Check if all dependencies are listed in `package.json`
3. Verify Node.js version (requires 18+)
4. Try clearing npm cache: `npm cache clean --force`

### Build Failures

**Problem**: `npm run build` fails

**Solutions**:
1. Check TypeScript errors: `npm run lint`
2. Verify all environment variables are set
3. Check for unused imports or variables
4. Ensure all files are properly saved
5. Try building with verbose output: `npm run build -- --verbose`

### Performance Issues

**Problem**: Slow loading or high memory usage

**Solutions**:
1. Check browser developer tools for performance bottlenecks
2. Disable debug mode in production: `VITE_DEBUG_MODE=false`
3. Reduce API call frequency
4. Clear browser cache and storage
5. Check for memory leaks in React components

## 🌐 API Issues

### Rate Limiting

**Problem**: "Too Many Requests" errors

**Solutions**:
1. Implement request caching
2. Reduce refresh intervals
3. Upgrade to paid API tiers
4. Use mock data for development
5. Implement exponential backoff for retries

### Invalid API Responses

**Problem**: Unexpected data format or null responses

**Solutions**:
1. Check API documentation for changes
2. Verify API endpoints are correct
3. Use debug panel to inspect raw responses
4. Implement proper error handling and fallbacks
5. Check if API is in maintenance mode

## 🔐 Security Issues

### CORS Errors

**Problem**: "Access-Control-Allow-Origin" errors

**Solutions**:
1. Use server-side proxy for sensitive API calls
2. Check if API supports CORS for your domain
3. Use environment variables for API keys
4. Consider using serverless functions for API calls

### API Key Exposure

**Problem**: API keys visible in browser

**Solutions**:
1. Use `VITE_` prefix for public environment variables only
2. Implement server-side API proxy for sensitive keys
3. Use different keys for development and production
4. Regularly rotate API keys

## 📱 Mobile Issues

### Touch/Scroll Problems

**Problem**: Poor mobile experience

**Solutions**:
1. Test on actual devices, not just browser dev tools
2. Check viewport meta tag is present
3. Verify touch targets are large enough (44px minimum)
4. Test with different screen sizes and orientations

### Performance on Mobile

**Problem**: Slow loading on mobile devices

**Solutions**:
1. Optimize images and assets
2. Reduce JavaScript bundle size
3. Implement lazy loading for components
4. Use service workers for caching
5. Test on slower network connections

## 🚀 Deployment Issues

### Build Deployment Failures

**Problem**: Deployment fails or site doesn't work after deployment

**Solutions**:
1. Test build locally: `npm run build && npm run preview`
2. Check environment variables are set in deployment platform
3. Verify build output directory is correct (`dist`)
4. Check for hardcoded localhost URLs
5. Ensure all assets are properly referenced

### Environment Variable Issues in Production

**Problem**: Environment variables not working in production

**Solutions**:
1. Set variables in your deployment platform (Vercel, Netlify, etc.)
2. Use production API keys, not development ones
3. Set `VITE_DEBUG_MODE=false` for production
4. Check variable names match exactly
5. Redeploy after changing environment variables

## 🔍 Debugging Tips

### Enable Debug Mode

Add to your `.env` file:
```env
VITE_DEBUG_MODE=true
```

This enables:
- Detailed console logging
- API request/response inspection
- Debug panel in bottom-right corner
- Mock data indicators

### Browser Developer Tools

1. **Console Tab**: Check for JavaScript errors
2. **Network Tab**: Monitor API requests and responses
3. **Application Tab**: Check localStorage and sessionStorage
4. **Performance Tab**: Identify performance bottlenecks

### Debug Panel Features

The debug panel (when enabled) provides:
- API connectivity testing
- Environment variable checking
- Real-time log monitoring
- Error tracking

## 📞 Getting Help

If you're still experiencing issues:

1. **Check existing issues**: [GitHub Issues](https://github.com/yourusername/algoranarchy/issues)
2. **Search discussions**: [GitHub Discussions](https://github.com/yourusername/algoranarchy/discussions)
3. **Create new issue**: Include:
   - Error messages (full stack trace)
   - Browser and OS information
   - Steps to reproduce
   - Screenshots if applicable
   - Environment variables (without sensitive values)

### Issue Template

```markdown
**Describe the bug**
A clear description of what the bug is.

**To Reproduce**
Steps to reproduce the behavior:
1. Go to '...'
2. Click on '....'
3. See error

**Expected behavior**
What you expected to happen.

**Screenshots**
If applicable, add screenshots.

**Environment:**
- OS: [e.g. macOS, Windows, Linux]
- Browser: [e.g. Chrome, Firefox, Safari]
- Node.js version: [e.g. 18.17.0]
- npm version: [e.g. 9.6.7]

**Additional context**
Any other context about the problem.
```

## 🛠️ Common Solutions Summary

| Problem | Quick Fix |
|---------|-----------|
| Environment variables not loading | Restart dev server, check `.env` location |
| Wallet connection fails | Install SDKs, clear browser cache |
| API errors | Check keys, verify network, enable debug mode |
| Build failures | Clear node_modules, check TypeScript errors |
| CORS issues | Use server proxy, check API CORS settings |
| Mobile issues | Test on real devices, optimize performance |
| Deployment fails | Check environment variables, test build locally |

---

Still need help? Don't hesitate to [open an issue](https://github.com/yourusername/algoranarchy/issues) or reach out to the community!