import { NextResponse } from 'next/server';
import * as Sentry from '@sentry/nextjs';

export async function GET() {
  try {
    throw new Error('Test Sentry Error Reporting');
  } catch (error) {
    // This error will be captured by Sentry
    Sentry.captureException(error);
    return NextResponse.json({ error: 'Test error sent to Sentry' }, { status: 500 });
  }
}
