import { forwardRef, useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'

export interface SelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  value?: string | number
  onChange?: (value: string) => void
  children: React.ReactNode
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, value, onChange, children, ...props }, ref) => {
    const innerRef = useRef<HTMLSelectElement>(null)
    const resolvedRef = (ref as any) || innerRef

    useEffect(() => {
      if (resolvedRef.current?.hasAttribute('autofocus')) {
        resolvedRef.current?.focus()
      }
    }, [resolvedRef])

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      onChange?.(e.target.value)
    }

    return (
      <select
        ref={resolvedRef}
        value={value}
        onChange={handleChange}
        className={cn(
          'w-full border-stone-600 rounded-md',
          'focus:border-indigo-200 focus:ring focus:ring-indigo-200 focus:ring-opacity-50',
          'outline-none transition-colors ease-in-out duration-200',
          className
        )}
        {...props}
      >
        {children}
      </select>
    )
  }
)

Select.displayName = 'Select'

export { Select }
