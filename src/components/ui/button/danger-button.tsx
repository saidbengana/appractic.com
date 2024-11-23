import { ButtonHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'
import { CircleLoading } from '@/components/icons/circle-loading'

interface DangerButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  size?: 'sm' | 'md' | 'lg'
  isLoading?: boolean
}

const sizeClasses = {
  sm: 'px-2.5 py-1.5 text-xs',
  md: 'px-3 py-2 text-sm',
  lg: 'px-4 py-2 text-sm'
}

export const DangerButton = forwardRef<HTMLButtonElement, DangerButtonProps>(
  ({ className, children, size = 'lg', isLoading, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'relative inline-flex items-center justify-center rounded-md bg-red-500 font-medium text-white uppercase tracking-widest',
          'hover:bg-red-700 active:bg-red-700 focus:border-red-700 focus:shadow-outline-red',
          'disabled:bg-red-400 disabled:cursor-not-allowed',
          'transition ease-in-out duration-200',
          sizeClasses[size],
          className
        )}
        disabled={disabled || isLoading}
        {...props}
      >
        {children}
        {isLoading && (
          <span className="absolute inset-0 flex items-center justify-center bg-red-500 rounded-md">
            <CircleLoading className="h-5 w-5 animate-spin text-white" />
          </span>
        )}
      </button>
    )
  }
)
