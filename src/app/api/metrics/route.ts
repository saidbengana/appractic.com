import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabase } from '@/lib/db';
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

    // First verify the account belongs to the user
    const { data: account, error: accountError } = await supabase
      .from('accounts')
      .select('id')
      .eq('id', accountId)
      .eq('user_id', userId)
      .single();

    if (accountError || !account) {
      return NextResponse.json(
        { error: 'Account not found' },
        { status: 404 }
      );
    }

    const startDate = startOfDay(subDays(new Date(), days));
    const endDate = endOfDay(new Date());

    const { data: metrics, error: metricsError } = await supabase
      .from('account_metrics')
      .select('*')
      .eq('account_id', accountId)
      .gte('date', startDate.toISOString())
      .lte('date', endDate.toISOString())
      .order('date', { ascending: true });

    if (metricsError) {
      console.error('Error fetching metrics:', metricsError);
      return NextResponse.json(
        { error: 'Failed to fetch metrics' },
        { status: 500 }
      );
    }

    return NextResponse.json(metrics);
  } catch (error) {
    console.error('Error in GET /api/metrics:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

// Update metrics (called by cron job)
export async function POST(request: Request) {
  try {
    const authorization = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret || authorization !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { accountId, metrics } = await request.json();

    if (!accountId || !metrics) {
      return NextResponse.json(
        { error: 'Account ID and metrics are required' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('account_metrics')
      .insert({
        account_id: accountId,
        date: new Date().toISOString(),
        followers: metrics.followers,
        following: metrics.following,
        posts: metrics.posts,
        engagement_rate: metrics.engagementRate,
        reach: metrics.reach,
        impressions: metrics.impressions,
      });

    if (error) {
      console.error('Error updating metrics:', error);
      return NextResponse.json(
        { error: 'Failed to update metrics' },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: 'Metrics updated successfully' });
  } catch (error) {
    console.error('Error in POST /api/metrics:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
