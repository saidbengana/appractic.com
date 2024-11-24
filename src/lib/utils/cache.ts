import { Redis } from '@upstash/redis';

const redis = Redis.fromEnv();

interface CacheOptions {
  ttl?: number; // Time to live in seconds
  prefix?: string;
}

const DEFAULT_TTL = 3600; // 1 hour

export async function cacheGet<T>(key: string, options: CacheOptions = {}): Promise<T | null> {
  const prefixedKey = options.prefix ? `${options.prefix}:${key}` : key;
  const cached = await redis.get<T>(prefixedKey);
  return cached;
}

export async function cacheSet<T>(
  key: string,
  value: T,
  options: CacheOptions = {}
): Promise<void> {
  const prefixedKey = options.prefix ? `${options.prefix}:${key}` : key;
  const ttl = options.ttl || DEFAULT_TTL;
  
  await redis.set(prefixedKey, value, {
    ex: ttl,
  });
}

export async function cacheDelete(key: string, options: CacheOptions = {}): Promise<void> {
  const prefixedKey = options.prefix ? `${options.prefix}:${key}` : key;
  await redis.del(prefixedKey);
}

export async function cacheClear(prefix: string): Promise<void> {
  const keys = await redis.keys(`${prefix}:*`);
  if (keys.length > 0) {
    await redis.del(...keys);
  }
}

// Helper function to wrap API calls with caching
export async function withCache<T>(
  key: string,
  fetchFn: () => Promise<T>,
  options: CacheOptions = {}
): Promise<T> {
  // Try to get from cache first
  const cached = await cacheGet<T>(key, options);
  if (cached) {
    return cached;
  }

  // If not in cache, fetch and store
  const data = await fetchFn();
  await cacheSet(key, data, options);
  return data;
}

// Helper function for social media API responses
export function getSocialMediaCacheKey(
  provider: string,
  userId: string,
  action: string
): string {
  return `social:${provider}:${userId}:${action}`;
}
