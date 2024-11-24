import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { createLogger } from '@/lib/logger';

const logger = createLogger({ component: 'HealthCheck' });

async function checkDatabase() {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id')
      .limit(1);
    
    if (error) throw error;
    return true;
  } catch (error) {
    logger.error('Database health check failed', error as Error);
    return false;
  }
}

export async function GET() {
  const startTime = Date.now();
  
  try {
    const dbHealth = await checkDatabase();

    const healthy = dbHealth;
    const duration = Date.now() - startTime;

    const status = {
      healthy,
      services: {
        database: dbHealth ? 'healthy' : 'unhealthy',
      },
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      version: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
      environment: process.env.NODE_ENV,
      duration: `${duration}ms`,
    };

    logger.info('Health check completed', status);

    const health = {
      status: dbHealth ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      services: {
        database: {
          status: dbHealth ? 'up' : 'down',
        }
      }
    };

    const httpStatus = dbHealth ? 200 : 503;

    return NextResponse.json(health, { status: httpStatus });
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
