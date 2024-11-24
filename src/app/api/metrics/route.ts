import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs';
import { db } from '@/lib/db';
import { subDays, startOfDay, endOfDay } from 'date-fns';

export async function GET(request: Request) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const accountId = searchParams.get('accountId');
    const days = parseInt(searchParams.get('days') || '30');

    if (!accountId) {
      return NextResponse.json(
        { error: 'Account ID is required' },
        { status: 400 }
      );
    }

    const startDate = startOfDay(subDays(new Date(), days));
    const endDate = endOfDay(new Date());

    // Get metrics data
    const metrics = await db.metric.findMany({
      where: {
        accountId,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: {
        date: 'asc',
      },
    });

    // Get audience data
    const audience = await db.audience.findMany({
      where: {
        accountId,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: {
        date: 'asc',
      },
    });

    return NextResponse.json({
      metrics,
      audience,
    });
  } catch (error) {
    console.error('Error fetching metrics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch metrics' },
      { status: 500 }
    );
  }
}

// Update metrics (called by cron job)
export async function POST(request: Request) {
  try {
    const { authorization } = request.headers;
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret || authorization !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const accounts = await db.account.findMany({
      select: {
        id: true,
        provider: true,
        access_token: true,
      },
    });

    const date = new Date();
    const metrics = [];
    const audience = [];

    for (const account of accounts) {
      try {
        // Fetch metrics from social media providers
        // This will be implemented with provider-specific logic
        const providerMetrics = { likes: 0, shares: 0, comments: 0 };
        const providerAudience = { total: 0 };

        metrics.push(
          db.metric.create({
            data: {
              accountId: account.id,
              date,
              data: providerMetrics,
            },
          })
        );

        audience.push(
          db.audience.create({
            data: {
              accountId: account.id,
              date,
              total: providerAudience.total,
            },
          })
        );
      } catch (error) {
        console.error(`Error fetching metrics for account ${account.id}:`, error);
      }
    }

    await Promise.all([...metrics, ...audience]);

    return NextResponse.json({ message: 'Metrics updated successfully' });
  } catch (error) {
    console.error('Error updating metrics:', error);
    return NextResponse.json(
      { error: 'Failed to update metrics' },
      { status: 500 }
    );
  }
}
