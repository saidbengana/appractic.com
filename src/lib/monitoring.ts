import { createLogger } from './logger';

const logger = createLogger({ component: 'Monitoring' });

interface MetricData {
  name: string;
  value: number;
  tags?: Record<string, string>;
  timestamp?: number;
}

class Monitoring {
  private metrics: Map<string, MetricData[]>;
  private retentionPeriod: number; // in milliseconds

  constructor(retentionPeriodHours = 24) {
    this.metrics = new Map();
    this.retentionPeriod = retentionPeriodHours * 60 * 60 * 1000;
    this.startCleanupInterval();
  }

  private startCleanupInterval() {
    // Clean up old metrics every hour
    setInterval(() => {
      this.cleanupOldMetrics();
    }, 60 * 60 * 1000);
  }

  private cleanupOldMetrics() {
    const now = Date.now();
    for (const [key, metrics] of this.metrics.entries()) {
      const filteredMetrics = metrics.filter(
        (metric) => now - (metric.timestamp || 0) < this.retentionPeriod
      );
      this.metrics.set(key, filteredMetrics);
    }
  }

  recordMetric(data: Omit<MetricData, 'timestamp'>) {
    const metric: MetricData = {
      ...data,
      timestamp: Date.now(),
    };

    const metrics = this.metrics.get(data.name) || [];
    metrics.push(metric);
    this.metrics.set(data.name, metrics);

    logger.debug('Recorded metric', { metric });
  }

  getMetrics(name: string, timeRangeHours = 24): MetricData[] {
    const metrics = this.metrics.get(name) || [];
    const timeRangeMs = timeRangeHours * 60 * 60 * 1000;
    const now = Date.now();

    return metrics.filter((metric) => now - (metric.timestamp || 0) < timeRangeMs);
  }

  calculateStats(name: string, timeRangeHours = 24) {
    const metrics = this.getMetrics(name, timeRangeHours);
    if (metrics.length === 0) {
      return null;
    }

    const values = metrics.map((m) => m.value);
    const sum = values.reduce((a, b) => a + b, 0);
    const avg = sum / values.length;
    const sorted = [...values].sort((a, b) => a - b);
    const p95 = sorted[Math.floor(sorted.length * 0.95)];
    const p99 = sorted[Math.floor(sorted.length * 0.99)];

    return {
      count: values.length,
      min: Math.min(...values),
      max: Math.max(...values),
      avg,
      p95,
      p99,
    };
  }
}

export const monitoring = new Monitoring();

export function withPerformanceMonitoring(name: string) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const start = performance.now();
      try {
        const result = await originalMethod.apply(this, args);
        const duration = performance.now() - start;
        monitoring.recordMetric({
          name,
          value: duration,
          tags: {
            method: propertyKey,
            success: 'true',
          },
        });
        return result;
      } catch (error) {
        const duration = performance.now() - start;
        monitoring.recordMetric({
          name,
          value: duration,
          tags: {
            method: propertyKey,
            success: 'false',
            error: error instanceof Error ? error.message : 'Unknown error',
          },
        });
        throw error;
      }
    };

    return descriptor;
  };
}
