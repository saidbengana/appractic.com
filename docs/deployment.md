# Deployment Guide

## Prerequisites

- Node.js 18 or later
- PostgreSQL database (we use Supabase)
- Redis instance (we use Upstash)
- Clerk account for authentication
- Social media API credentials
  - Twitter Developer Account
  - Facebook Developer Account
  - Instagram Business Account
  - LinkedIn Developer Account

## Environment Variables

Create a `.env` file with the following variables:

```env
# Database
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."

# Auth
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_..."
CLERK_SECRET_KEY="sk_..."

# Redis
UPSTASH_REDIS_REST_URL="https://..."
UPSTASH_REDIS_REST_TOKEN="..."

# Social Media APIs
TWITTER_CLIENT_ID="..."
TWITTER_CLIENT_SECRET="..."
TWITTER_REDIRECT_URI="..."

FACEBOOK_CLIENT_ID="..."
FACEBOOK_CLIENT_SECRET="..."
FACEBOOK_REDIRECT_URI="..."

INSTAGRAM_CLIENT_ID="..."
INSTAGRAM_CLIENT_SECRET="..."
INSTAGRAM_REDIRECT_URI="..."

LINKEDIN_CLIENT_ID="..."
LINKEDIN_CLIENT_SECRET="..."
LINKEDIN_REDIRECT_URI="..."

# App
NEXT_PUBLIC_APP_URL="https://..."
CRON_SECRET="..."
```

## Database Setup

1. Create a new PostgreSQL database in Supabase
2. Update the `DATABASE_URL` and `DIRECT_URL` environment variables
3. Run database migrations:
   ```bash
   npx prisma migrate deploy
   ```

## Local Development

1. Install dependencies:
   ```bash
   npm install
   ```

2. Run database migrations:
   ```bash
   npx prisma migrate dev
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

## Production Deployment (Vercel)

1. Create a new project in Vercel
2. Connect your GitHub repository
3. Configure environment variables in Vercel dashboard
4. Deploy:
   ```bash
   vercel --prod
   ```

### Vercel Configuration

1. Framework Preset: Next.js
2. Build Command: `npm run build`
3. Install Command: `npm install`
4. Output Directory: `.next`

### Cron Jobs

The application uses Vercel Cron Jobs for scheduled tasks:

1. Metrics Collection: Runs hourly
   ```
   0 * * * *  /api/cron/collect-metrics
   ```

2. Scheduled Posts: Runs every 5 minutes
   ```
   */5 * * * *  /api/worker
   ```

## Monitoring

1. Set up monitoring in Vercel dashboard
2. Configure alerts for:
   - Error rates
   - API latency
   - Database performance
   - Cron job failures

## Security Checklist

1. Enable CORS with proper origins
2. Set up rate limiting
3. Configure security headers
4. Enable database SSL
5. Rotate API keys regularly
6. Monitor auth logs

## Performance Optimization

1. Enable caching:
   - Redis for API responses
   - Vercel Edge Cache for static assets

2. Database optimization:
   - Create necessary indexes
   - Set up connection pooling

3. Media optimization:
   - Configure image optimization
   - Set up video transcoding

## Troubleshooting

Common issues and solutions:

1. Database connection errors:
   - Check connection strings
   - Verify IP allowlist
   - Check SSL settings

2. API rate limits:
   - Monitor usage in provider dashboards
   - Implement backoff strategies

3. Cron job failures:
   - Check logs in Vercel dashboard
   - Verify environment variables
   - Check API credentials

## Backup and Recovery

1. Database backups:
   - Automated daily backups in Supabase
   - Manual backup before major changes

2. Media backups:
   - Regular backups of uploaded media
   - Verify backup integrity

## Scaling

1. Database scaling:
   - Monitor connection limits
   - Set up read replicas if needed

2. Redis scaling:
   - Monitor memory usage
   - Configure eviction policies

3. API scaling:
   - Implement request queuing
   - Add rate limit buffer
