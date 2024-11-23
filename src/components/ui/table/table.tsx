import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface TableProps {
  children: ReactNode
  className?: string
}

export function Table({ children, className }: TableProps) {
  return (
    <div className="flex flex-col overflow-x-hidden overflow-y-hidden">
      <div className="-m-1.5 overflow-x-auto">
        <div className="p-1.5 min-w-full inline-block align-middle overflow-hidden">
          <table
            className={cn(
              'min-w-full divide-y divide-gray-200 border-collapse',
              className
            )}
          >
            {children}
          </table>
        </div>
      </div>
    </div>
  )
}

export function TableHead({ children, className }: TableProps) {
  return <thead className={className}>{children}</thead>
}

export function TableBody({ children, className }: TableProps) {
  return (
    <tbody className={cn('divide-y divide-gray-100', className)}>
      {children}
    </tbody>
  )
}
