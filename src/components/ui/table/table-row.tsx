import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface TableRowProps {
  children: ReactNode
  className?: string
}

export function TableRow({ children, className }: TableRowProps) {
  return (
    <tr className={cn('hover:bg-gray-50', className)}>
      {children}
    </tr>
  )
}
