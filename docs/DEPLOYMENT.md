# Deployment Guide

This guide covers deploying ALGORANARCHY to various platforms.

## Pre-deployment Checklist

- [ ] All API keys configured
- [ ] Environment variables set
- [ ] Build process tested locally
- [ ] Error handling implemented
- [ ] Performance optimized
- [ ] Security review completed

## Build Process

```bash
# Install dependencies
npm install

# Build for production
npm run build

# Preview build locally
npm run preview
```

## Deployment Platforms

### Vercel (Recommended)

1. **Connect Repository**
   ```bash
   # Install Vercel CLI
   npm i -g vercel
   
   # Deploy
   vercel
   ```

2. **Environment Variables**
   - Go to Vercel dashboard
   - Navigate to your project settings
   - Add environment variables:
     - `VITE_ALGO_API_TOKEN`
     - `VITE_COINGECKO_API_KEY`
     - `VITE_DEBUG_MODE=false`

3. **Custom Domain** (Optional)
   - Add your domain in Vercel dashboard
   - Update DNS records as instructed

### Netlify

1. **Deploy via Git**
   - Connect your GitHub repository
   - Set build command: `npm run build`
   - Set publish directory: `dist`

2. **Environment Variables**
   - Go to Site settings > Environment variables
   - Add your API keys

3. **Build Settings**
   ```toml
   # netlify.toml
   [build]
     command = "npm run build"
     publish = "dist"
   
   [[redirects]]
     from = "/*"
     to = "/index.html"
     status = 200
   ```

### GitHub Pages

1. **Setup GitHub Actions**
   ```yaml
   # .github/workflows/deploy.yml
   name: Deploy to GitHub Pages
   
   on:
     push:
       branches: [ main ]
   
   jobs:
     deploy:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v3
         - uses: actions/setup-node@v3
           with:
             node-version: '18'
         - run: npm install
         - run: npm run build
           env:
             VITE_ALGO_API_TOKEN: ${{ secrets.VITE_ALGO_API_TOKEN }}
             VITE_COINGECKO_API_KEY: ${{ secrets.VITE_COINGECKO_API_KEY }}
         - uses: peaceiris/actions-gh-pages@v3
           with:
             github_token: ${{ secrets.GITHUB_TOKEN }}
             publish_dir: ./dist
   ```

2. **Repository Secrets**
   - Go to Settings > Secrets and variables > Actions
   - Add your API keys as secrets

### Docker Deployment

1. **Dockerfile**
   ```dockerfile
   FROM node:18-alpine AS builder
   WORKDIR /app
   COPY package*.json ./
   RUN npm install
   COPY . .
   RUN npm run build
   
   FROM nginx:alpine
   COPY --from=builder /app/dist /usr/share/nginx/html
   COPY nginx.conf /etc/nginx/nginx.conf
   EXPOSE 80
   CMD ["nginx", "-g", "daemon off;"]
   ```

2. **nginx.conf**
   ```nginx
   events {
     worker_connections 1024;
   }
   
   http {
     include /etc/nginx/mime.types;
     default_type application/octet-stream;
     
     server {
       listen 80;
       server_name localhost;
       root /usr/share/nginx/html;
       index index.html;
       
       location / {
         try_files $uri $uri/ /index.html;
       }
     }
   }
   ```

3. **Build and Run**
   ```bash
   # Build image
   docker build -t algoranarchy .
   
   # Run container
   docker run -p 80:80 algoranarchy
   ```

## Environment Variables

### Production Environment
```env
# Required
VITE_ALGO_API_TOKEN=your_production_token
VITE_ALGO_NODE_MAINNET=https://mainnet-api.4160.nodely.io
VITE_ALGO_INDEXER_MAINNET=https://mainnet-idx.4160.nodely.io

# Optional
VITE_COINGECKO_API_KEY=your_production_key

# Production settings
VITE_DEBUG_MODE=false
VITE_ENVIRONMENT=production # set to 'testnet' for Algorand testnet
```

### Security Considerations

1. **API Keys**
   - Use production API keys
   - Rotate keys regularly
   - Monitor usage and set alerts

2. **CORS Configuration**
   - Configure proper CORS headers
   - Whitelist your domain
   - Avoid wildcard origins in production

3. **Content Security Policy**
   ```html
   <meta http-equiv="Content-Security-Policy" 
         content="default-src 'self'; 
                  script-src 'self' 'unsafe-inline'; 
                  style-src 'self' 'unsafe-inline' fonts.googleapis.com;
                  font-src 'self' fonts.gstatic.com;
                  connect-src 'self' *.nodely.io *.coingecko.com;">
   ```

## Performance Optimization

### Build Optimization
```typescript
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          algorand: ['algosdk'],
          ui: ['lucide-react']
        }
      }
    },
    chunkSizeWarningLimit: 1000
  }
});
```

### Caching Strategy
- Set appropriate cache headers
- Use CDN for static assets
- Implement service worker for offline support

## Monitoring and Analytics

### Error Tracking
```typescript
// Add to main.tsx
import * as Sentry from '@sentry/react';

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.VITE_ENVIRONMENT
});
```

### Analytics
```typescript
// Add Google Analytics
import { gtag } from 'ga-gtag';

gtag('config', import.meta.env.VITE_GOOGLE_ANALYTICS_ID);
```

## Post-Deployment

### Health Checks
1. Verify all pages load correctly
2. Test wallet connections
3. Check API connectivity
4. Validate real-time data updates
5. Test on different devices/browsers

### Performance Testing
- Run Lighthouse audits
- Test loading times
- Monitor Core Web Vitals
- Check mobile performance

### SEO Optimization
- Add meta tags
- Generate sitemap
- Implement structured data
- Optimize images

## Troubleshooting

### Common Issues

**Build Failures**
- Check Node.js version compatibility
- Verify all dependencies are installed
- Review environment variables

**Runtime Errors**
- Check browser console for errors
- Verify API endpoints are accessible
- Test with debug mode enabled

**Performance Issues**
- Analyze bundle size
- Check for memory leaks
- Optimize API calls

### Rollback Strategy
1. Keep previous deployment available
2. Use feature flags for new features
3. Monitor error rates after deployment
4. Have automated rollback triggers

---

Need help with deployment? Check our [troubleshooting guide](./TROUBLESHOOTING.md) or open an issue.