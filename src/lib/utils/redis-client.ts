import { Redis } from '@upstash/redis';

if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
  throw new Error('Redis credentials are not properly configured');
}

export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

// Validate Redis connection
export async function validateRedisConnection() {
  try {
    await redis.ping();
    console.log('✅ Redis connection successful');
    return true;
  } catch (error) {
    console.error('❌ Redis connection failed:', error);
    return false;
  }
}

// Performance monitoring helpers
export async function recordAPILatency(
  endpoint: string,
  latencyMs: number,
  metadata: Record<string, any> = {}
) {
  const key = `metrics:api:latency:${endpoint}`;
  const timestamp = Date.now();

  await redis.zadd(key, {
    score: timestamp,
    member: JSON.stringify({
      latencyMs,
      timestamp,
      ...metadata,
    }),
  });

  // Keep only last 1000 entries
  await redis.zremrangebyrank(key, 0, -1001);
}

export async function getAPILatencyStats(endpoint: string, timeWindowMs: number = 3600000) {
  const key = `metrics:api:latency:${endpoint}`;
  const minTimestamp = Date.now() - timeWindowMs;

  const entries = await redis.zrangebyscore(key, minTimestamp, '+inf');
  if (!entries.length) return null;

  const latencies = entries.map(entry => JSON.parse(entry).latencyMs);
  
  return {
    avg: latencies.reduce((a, b) => a + b, 0) / latencies.length,
    min: Math.min(...latencies),
    max: Math.max(...latencies),
    p95: percentile(latencies, 95),
    p99: percentile(latencies, 99),
    count: latencies.length,
  };
}

function percentile(arr: number[], p: number) {
  const sorted = [...arr].sort((a, b) => a - b);
  const pos = (sorted.length - 1) * p / 100;
  const base = Math.floor(pos);
  const rest = pos - base;
  
  if (sorted[base + 1] !== undefined) {
    return sorted[base] + rest * (sorted[base + 1] - sorted[base]);
  } else {
    return sorted[base];
  }
}
