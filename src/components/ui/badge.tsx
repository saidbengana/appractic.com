import { cn } from '@/lib/utils'
import { ReactNode } from 'react'

type BadgeVariant = 'neutral' | 'dark' | 'info' | 'success' | 'warning' | 'error'

interface BadgeProps {
  children: ReactNode
  variant?: BadgeVariant
  className?: string
}

const variantClasses: Record<BadgeVariant, string> = {
  neutral: 'bg-gray-100 text-gray-800',
  dark: 'bg-gray-800 text-gray-100',
  info: 'bg-cyan-100 text-cyan-800',
  success: 'bg-lime-100 text-lime-600',
  warning: 'bg-orange-100 text-orange-600',
  error: 'bg-red-100 text-red-600',
}

export function Badge({ children, variant = 'neutral', className }: BadgeProps) {
  return (
    <span
      className={cn(
        'px-2 inline-flex items-center rounded-md',
        variantClasses[variant],
        className
      )}
    >
      {children}
    </span>
  )
}
