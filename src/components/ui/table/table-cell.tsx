import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface TableCellProps {
  children: ReactNode
  component?: 'td' | 'th'
  scope?: string
  align?: 'left' | 'right'
  clickable?: boolean
  onClick?: () => void
  className?: string
}

const alignClasses = {
  left: 'text-left',
  right: 'text-right',
} as const

export function TableCell({
  children,
  component = 'td',
  scope,
  align = 'left',
  clickable = false,
  onClick,
  className,
}: TableCellProps) {
  const commonClasses = 'px-6 py-3'
  const props = {
    className: cn(commonClasses, alignClasses[align], className),
    onClick: clickable ? onClick : undefined,
    role: clickable ? 'button' : 'cell',
    scope,
  }

  if (component === 'th') {
    return (
      <th {...props} className={cn(props.className, 'font-medium')}>
        {children}
      </th>
    )
  }

  return <td {...props}>{children}</td>
}
