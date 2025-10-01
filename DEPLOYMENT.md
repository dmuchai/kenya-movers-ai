# Deployment Guide for MoveEasy Moving Planner

## 🚀 Production Deployment Checklist

### Pre-Deployment Steps

1. **Environment Variables**
   ```bash
   # Copy and fill environment variables
   cp .env.example .env.local
   ```
   
   Required variables:
   - `VITE_SUPABASE_URL` - Your Supabase project URL
   - `VITE_SUPABASE_ANON_KEY` - Your Supabase anon key
   - `VITE_GOOGLE_MAPS_API_KEY` - Google Maps API key
   - `VITE_GA_TRACKING_ID` (optional) - Google Analytics tracking ID

2. **Supabase Setup**
   ```bash
   # Install Supabase CLI
   npm install -g supabase
   
   # Link to your project
   supabase link --project-ref your-project-ref
   
   # Push database migrations
   supabase db push
   
   # Set edge function secrets
   supabase secrets set OPENAI_API_KEY=your_openai_api_key
   supabase secrets set GOOGLE_MAPS_API_KEY=your_google_maps_api_key
   
   # Deploy edge functions
   supabase functions deploy
   ```

3. **Security Check**
   ```bash
   # Fix security vulnerabilities
   npm audit fix
   
   # Check for environment leaks
   grep -r "eyJ" src/ || echo "No hardcoded keys found"
   ```

4. **Build & Test**
   ```bash
   # Install dependencies
   npm install
   
   # Type check
   npm run type-check
   
   # Lint check
   npm run lint
   
   # Build for production
   npm run build
   
   # Preview production build
   npm run preview
   ```

### Deployment Options

#### Option 1: Vercel (Recommended)
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod

# Set environment variables in Vercel dashboard
# or via CLI:
vercel env add VITE_SUPABASE_URL
vercel env add VITE_SUPABASE_ANON_KEY
vercel env add VITE_GOOGLE_MAPS_API_KEY
```

#### Option 2: Netlify
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Build and deploy
npm run build
netlify deploy --prod --dir=dist

# Set environment variables in Netlify dashboard
```

#### Option 3: Docker Deployment
```bash
# Build Docker image
docker build -t kenya-movers-ai .

# Run container
docker run -p 80:80 \
  -e VITE_SUPABASE_URL=your_supabase_url \
  -e VITE_SUPABASE_ANON_KEY=your_supabase_key \
  -e VITE_GOOGLE_MAPS_API_KEY=your_maps_key \
  kenya-movers-ai
```

#### Option 4: Traditional Hosting
```bash
# Build the application
npm run build

# Upload dist/ folder to your web server
# Configure nginx/apache to serve index.html for all routes
```

### Post-Deployment

1. **DNS & SSL Setup**
   - Point your domain to the hosting provider
   - Ensure SSL certificate is configured
   - Update CORS settings in Supabase dashboard

2. **Monitoring Setup**
   - Configure error monitoring (Sentry, LogRocket)
   - Set up uptime monitoring
   - Configure analytics

3. **Performance Optimization**
   - Enable CDN for static assets
   - Configure caching headers
   - Monitor Core Web Vitals

4. **Security Headers**
   Ensure these headers are set:
   ```
   X-Frame-Options: SAMEORIGIN
   X-Content-Type-Options: nosniff
   X-XSS-Protection: 1; mode=block
   Referrer-Policy: strict-origin-when-cross-origin
   Content-Security-Policy: [configured in nginx.conf]
   ```

### Environment-Specific Configurations

#### Production
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_production_anon_key
VITE_GOOGLE_MAPS_API_KEY=your_production_maps_key
VITE_GA_TRACKING_ID=G-XXXXXXXXXX
VITE_APP_URL=https://kenyamovers.ai
VITE_APP_ENV=production
```

#### Staging
```env
VITE_SUPABASE_URL=https://your-staging-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_staging_anon_key
VITE_GOOGLE_MAPS_API_KEY=your_staging_maps_key
VITE_APP_URL=https://staging.kenyamovers.ai
VITE_APP_ENV=staging
```

### Troubleshooting

#### Common Issues

1. **White screen after deployment**
   - Check browser console for errors
   - Verify environment variables are set
   - Ensure Supabase URL and keys are correct

2. **API calls failing**
   - Check CORS configuration in Supabase
   - Verify edge functions are deployed
   - Check environment secrets

3. **Maps not loading**
   - Verify Google Maps API key
   - Check API restrictions and billing
   - Ensure required APIs are enabled

4. **Build failures**
   - Clear node_modules: `rm -rf node_modules && npm install`
   - Check TypeScript errors: `npm run type-check`
   - Verify all imports are correct

### Monitoring & Maintenance

1. **Regular Updates**
   ```bash
   # Update dependencies monthly
   npm update
   npm audit fix
   
   # Test after updates
   npm run build
   npm run preview
   ```

2. **Performance Monitoring**
   - Monitor Core Web Vitals
   - Track API response times
   - Monitor error rates

3. **Security Monitoring**
   - Regular security audits
   - Monitor for unauthorized access
   - Keep dependencies updated

### Scaling Considerations

- **Database**: Monitor Supabase usage and upgrade plan as needed
- **Storage**: Optimize images and implement CDN
- **API Limits**: Monitor Google Maps API usage
- **Edge Functions**: Monitor execution time and memory usage

For support, refer to:
- [Supabase Documentation](https://supabase.com/docs)
- [Vite Deployment Guide](https://vitejs.dev/guide/static-deploy.html)
- [Project GitHub Issues](https://github.com/dmuchai/kenya-movers-ai/issues)
