import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

type MaxHeight = 'md' | 'lg' | 'xl'

const maxHeightClasses: Record<MaxHeight, string> = {
  md: 'max-h-64',
  lg: 'max-h-72',
  xl: 'max-h-96',
}

interface ScrollableContentProps {
  children: ReactNode
  maxHeight?: MaxHeight
  className?: string
}

export function ScrollableContent({
  children,
  maxHeight = 'xl',
  className,
}: ScrollableContentProps) {
  return (
    <div
      className={cn('overflow-y-auto', maxHeightClasses[maxHeight], className)}
    >
      {children}
    </div>
  )
}
