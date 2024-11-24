import * as Sentry from '@sentry/nextjs';

const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN;

export function initSentry() {
  if (SENTRY_DSN) {
    Sentry.init({
      dsn: SENTRY_DSN,
      environment: process.env.NODE_ENV,
      tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
      beforeSend(event) {
        // Don't send events in development
        if (process.env.NODE_ENV === 'development') {
          return null;
        }
        return event;
      },
    });
  }
}

export function captureException(error: Error, context?: Record<string, any>) {
  if (SENTRY_DSN) {
    Sentry.captureException(error, {
      extra: context,
    });
  }
}

export function setUser(id: string, email?: string) {
  if (SENTRY_DSN) {
    Sentry.setUser({
      id,
      email,
    });
  }
}
