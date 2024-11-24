import { NextResponse } from 'next/server';
import { ZodError } from 'zod';

export class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code: string = 'INTERNAL_SERVER_ERROR'
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export function handleError(error: unknown) {
  console.error('Error:', error);

  // Handle known errors
  if (error instanceof AppError) {
    return NextResponse.json(
      {
        error: {
          message: error.message,
          code: error.code,
        },
      },
      { status: error.statusCode }
    );
  }

  // Handle Zod validation errors
  if (error instanceof ZodError) {
    return NextResponse.json(
      {
        error: {
          message: 'Validation error',
          code: 'VALIDATION_ERROR',
          details: error.errors,
        },
      },
      { status: 400 }
    );
  }

  // Handle Prisma errors
  if (error instanceof Error && error.name === 'PrismaClientKnownRequestError') {
    return NextResponse.json(
      {
        error: {
          message: 'Database error',
          code: 'DATABASE_ERROR',
        },
      },
      { status: 500 }
    );
  }

  // Handle unknown errors
  return NextResponse.json(
    {
      error: {
        message: 'Internal server error',
        code: 'INTERNAL_SERVER_ERROR',
      },
    },
    { status: 500 }
  );
}

// Error logging function
export async function logError(error: unknown, context: Record<string, any> = {}) {
  const errorLog = {
    timestamp: new Date().toISOString(),
    error: error instanceof Error ? {
      name: error.name,
      message: error.message,
      stack: error.stack,
    } : error,
    context,
  };

  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.error('Error Log:', errorLog);
    return;
  }

  // In production, you might want to send this to a logging service
  // Example with Vercel logging:
  console.error(JSON.stringify(errorLog));
  
  // You can also integrate with services like Sentry, LogRocket, or DataDog
  // if (process.env.SENTRY_DSN) {
  //   Sentry.captureException(error, { extra: context });
  // }
}
