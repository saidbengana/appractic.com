import React from 'react';
import { cn } from '@/lib/utils';

interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg';
}

export function Spinner({ className, size = 'md', ...props }: SpinnerProps) {
  return (
    <div
      className={cn(
        'inline-block animate-spin rounded-full border-2 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]',
        {
          'h-4 w-4': size === 'sm',
          'h-8 w-8': size === 'md',
          'h-12 w-12': size === 'lg',
        },
        className
      )}
      role="status"
      {...props}
    >
      <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">
        Loading...
      </span>
    </div>
  );
}

interface LoadingOverlayProps extends React.HTMLAttributes<HTMLDivElement> {
  text?: string;
}

export function LoadingOverlay({
  className,
  text = 'Loading...',
  ...props
}: LoadingOverlayProps) {
  return (
    <div
      className={cn(
        'fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm',
        className
      )}
      {...props}
    >
      <div className="flex flex-col items-center space-y-4">
        <Spinner size="lg" />
        {text && (
          <p className="text-lg font-medium text-muted-foreground">{text}</p>
        )}
      </div>
    </div>
  );
}

interface LoadingButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  spinnerClassName?: string;
}

export function LoadingButton({
  children,
  loading = false,
  disabled,
  spinnerClassName,
  ...props
}: LoadingButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      className={cn(
        'inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50',
        props.className
      )}
      {...props}
    >
      {loading ? (
        <>
          <Spinner
            size="sm"
            className={cn('mr-2', spinnerClassName)}
          />
          {children}
        </>
      ) : (
        children
      )}
    </button>
  );
}
