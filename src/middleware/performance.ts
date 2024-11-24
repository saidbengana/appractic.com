import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { recordAPILatency } from '@/lib/utils/redis-client';

export async function performanceMiddleware(
  request: NextRequest,
  next: () => Promise<NextResponse>
) {
  const startTime = performance.now();
  const requestId = crypto.randomUUID();
  
  // Add request ID to headers for tracing
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('X-Request-ID', requestId);

  try {
    // Wait for the response
    const response = await next();
    
    // Calculate latency
    const endTime = performance.now();
    const latencyMs = endTime - startTime;

    // Record metrics
    const endpoint = new URL(request.url).pathname;
    await recordAPILatency(endpoint, latencyMs, {
      requestId,
      method: request.method,
      statusCode: response.status,
    });

    // Add performance headers
    response.headers.set('Server-Timing', `total;dur=${latencyMs}`);
    response.headers.set('X-Response-Time', `${latencyMs}ms`);
    response.headers.set('X-Request-ID', requestId);

    return response;
  } catch (error) {
    // Record error metrics
    const endTime = performance.now();
    const latencyMs = endTime - startTime;
    
    const endpoint = new URL(request.url).pathname;
    await recordAPILatency(endpoint, latencyMs, {
      requestId,
      method: request.method,
      error: true,
      errorMessage: error instanceof Error ? error.message : 'Unknown error',
    });

    throw error;
  }
}
