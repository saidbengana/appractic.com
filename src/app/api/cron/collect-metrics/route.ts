import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { TwitterProvider } from '@/lib/providers/twitter-provider';
import { FacebookProvider } from '@/lib/providers/facebook-provider';
import { InstagramProvider } from '@/lib/providers/instagram-provider';
import { LinkedInProvider } from '@/lib/providers/linkedin-provider';

const prisma = new PrismaClient();

// Verify the request is from Vercel Cron
const validateCronRequest = (req: Request) => {
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    throw new Error('Unauthorized');
  }
};

export async function GET(req: Request) {
  try {
    // Validate the request
    validateCronRequest(req);

    // Get all active accounts
    const accounts = await prisma.account.findMany({
      where: {
        active: true,
      },
    });

    const now = new Date();
    const startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000); // 24 hours ago

    // Collect metrics for each account
    for (const account of accounts) {
      let provider;
      
      // Initialize the appropriate provider based on account type
      switch (account.provider) {
        case 'twitter':
          provider = new TwitterProvider({
            clientId: process.env.TWITTER_CLIENT_ID!,
            clientSecret: process.env.TWITTER_CLIENT_SECRET!,
            redirectUri: process.env.TWITTER_REDIRECT_URI!,
          });
          break;
        case 'facebook':
          provider = new FacebookProvider({
            clientId: process.env.FACEBOOK_CLIENT_ID!,
            clientSecret: process.env.FACEBOOK_CLIENT_SECRET!,
            redirectUri: process.env.FACEBOOK_REDIRECT_URI!,
          });
          break;
        case 'instagram':
          provider = new InstagramProvider({
            clientId: process.env.INSTAGRAM_CLIENT_ID!,
            clientSecret: process.env.INSTAGRAM_CLIENT_SECRET!,
            redirectUri: process.env.INSTAGRAM_REDIRECT_URI!,
          });
          break;
        case 'linkedin':
          provider = new LinkedInProvider({
            clientId: process.env.LINKEDIN_CLIENT_ID!,
            clientSecret: process.env.LINKEDIN_CLIENT_SECRET!,
            redirectUri: process.env.LINKEDIN_REDIRECT_URI!,
          });
          break;
        default:
          continue;
      }

      try {
        // Collect metrics
        const metrics = await provider.getMetrics(account.accessToken, startDate, now);
        
        // Store metrics in database
        await prisma.metric.create({
          data: {
            accountId: account.id,
            timestamp: now,
            impressions: metrics.impressions,
            engagement: metrics.engagement,
            clicks: metrics.clicks,
            likes: metrics.likes,
            comments: metrics.comments,
            shares: metrics.shares,
          },
        });

        // Collect audience data
        const audience = await provider.getAudience(account.accessToken);
        
        // Store audience data
        await prisma.audience.create({
          data: {
            accountId: account.id,
            timestamp: now,
            followers: audience.followers,
          },
        });
      } catch (error) {
        console.error(`Error collecting metrics for account ${account.id}:`, error);
        // Continue with other accounts even if one fails
        continue;
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in metrics collection cron:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
