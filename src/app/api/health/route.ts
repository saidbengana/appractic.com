import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { Redis } from '@upstash/redis';
import { createLogger } from '@/lib/logger';

const logger = createLogger({ component: 'HealthCheck' });
const prisma = new PrismaClient();
const redis = Redis.fromEnv();

async function checkDatabase() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch (error) {
    logger.error('Database health check failed', error as Error);
    return false;
  }
}

async function checkRedis() {
  try {
    await redis.ping();
    return true;
  } catch (error) {
    logger.error('Redis health check failed', error as Error);
    return false;
  }
}

export async function GET() {
  const startTime = Date.now();
  
  try {
    const [dbHealth, redisHealth] = await Promise.all([
      checkDatabase(),
      checkRedis(),
    ]);

    const healthy = dbHealth && redisHealth;
    const duration = Date.now() - startTime;

    const status = {
      healthy,
      services: {
        database: dbHealth ? 'healthy' : 'unhealthy',
        redis: redisHealth ? 'healthy' : 'unhealthy',
      },
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      version: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
      environment: process.env.NODE_ENV,
      duration: `${duration}ms`,
    };

    logger.info('Health check completed', status);

    return NextResponse.json(status, {
      status: healthy ? 200 : 503,
      headers: {
        'Cache-Control': 'no-store, max-age=0',
      },
    });
  } catch (error) {
    logger.error('Health check failed', error as Error);
    return NextResponse.json(
      {
        healthy: false,
        error: 'Health check failed',
      },
      { status: 503 }
    );
  }
}
