import { NextResponse } from 'next/server';
import { monitoring } from '@/lib/monitoring';
import { createLogger } from '@/lib/logger';

const logger = createLogger({ component: 'MonitoringAPI' });

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const metricName = url.searchParams.get('metric');
    const timeRange = parseInt(url.searchParams.get('timeRange') || '24', 10);

    if (!metricName) {
      return NextResponse.json(
        { error: 'Metric name is required' },
        { status: 400 }
      );
    }

    const stats = monitoring.calculateStats(metricName, timeRange);
    const metrics = monitoring.getMetrics(metricName, timeRange);

    logger.info('Retrieved monitoring stats', { metricName, timeRange, stats });

    return NextResponse.json({
      stats,
      metrics,
    });
  } catch (error) {
    logger.error('Error retrieving monitoring stats', error as Error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
