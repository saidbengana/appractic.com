import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface PanelProps {
  children: ReactNode
  title?: ReactNode
  description?: ReactNode
  withPadding?: boolean
  className?: string
}

export function Panel({
  children,
  title,
  description,
  withPadding = true,
  className,
}: PanelProps) {
  return (
    <div className={cn('bg-white border border-gray-100 rounded-lg', className)}>
      <div className={cn({ 'p-6': withPadding })}>
        {title && (
          <div className="text-lg font-semibold text-black">{title}</div>
        )}

        {description && (
          <div className="text-gray-500 mt-2">{description}</div>
        )}

        <div
          className={cn({
            'mt-6': Boolean(title) || Boolean(description),
          })}
        >
          {children}
        </div>
      </div>
    </div>
  )
}
