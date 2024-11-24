import { NextResponse } from 'next/server';
import { getAPILatencyStats } from '@/lib/utils/redis-client';
import { redis } from '@/lib/utils/redis-client';

export async function GET(request: Request) {
  try {
    // Get all API endpoint keys
    const keys = await redis.keys('metrics:api:latency:*');
    const endpoints = keys.map(key => key.replace('metrics:api:latency:', ''));

    // Get time window from query params or default to 1 hour
    const url = new URL(request.url);
    const timeWindow = parseInt(url.searchParams.get('timeWindow') || '3600000');

    // Get stats for each endpoint
    const stats = await Promise.all(
      endpoints.map(async endpoint => {
        const endpointStats = await getAPILatencyStats(endpoint, timeWindow);
        return {
          endpoint,
          stats: endpointStats,
        };
      })
    );

    // Filter out endpoints with no stats
    const activeEndpoints = stats.filter(stat => stat.stats !== null);

    // Calculate overall stats
    const allLatencies = activeEndpoints.flatMap(endpoint => 
      endpoint.stats ? [
        endpoint.stats.avg,
        endpoint.stats.p95,
        endpoint.stats.p99,
      ] : []
    );

    const overallStats = allLatencies.length ? {
      avgLatency: allLatencies.reduce((a, b) => a + b, 0) / allLatencies.length,
      totalRequests: activeEndpoints.reduce((sum, endpoint) => 
        sum + (endpoint.stats?.count || 0), 0
      ),
      endpointCount: activeEndpoints.length,
    } : null;

    return NextResponse.json({
      timeWindow,
      overall: overallStats,
      endpoints: activeEndpoints,
    });
  } catch (error) {
    console.error('Error fetching performance metrics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch performance metrics' },
      { status: 500 }
    );
  }
}
