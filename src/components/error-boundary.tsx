import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { captureException } from '@/lib/sentry';
import { createLogger } from '@/lib/logger';

const logger = createLogger({ component: 'ErrorBoundary' });

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log to Sentry
    captureException(error, { errorInfo });
    
    // Log locally
    logger.error('Error caught by boundary:', error, {
      componentStack: errorInfo.componentStack,
    });
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex min-h-[400px] w-full flex-col items-center justify-center rounded-lg border border-red-200 bg-red-50 p-8">
          <AlertTriangle className="h-12 w-12 text-red-500" />
          <h2 className="mt-4 text-lg font-semibold text-red-700">
            Something went wrong
          </h2>
          {this.state.error && process.env.NODE_ENV === 'development' && (
            <p className="mt-2 text-sm text-red-600">
              {this.state.error.message}
            </p>
          )}
          <button
            onClick={() => window.location.reload()}
            className="mt-4 rounded-md bg-red-100 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-200"
          >
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: React.ReactNode
) {
  return function WithErrorBoundary(props: P) {
    return (
      <ErrorBoundary fallback={fallback}>
        <Component {...props} />
      </ErrorBoundary>
    );
  };
}
