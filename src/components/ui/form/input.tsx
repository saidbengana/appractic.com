import { forwardRef, InputHTMLAttributes, useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: boolean
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, ...props }, ref) => {
    const inputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
      if (inputRef.current?.hasAttribute('autofocus')) {
        inputRef.current.focus()
      }
    }, [])

    return (
      <input
        ref={ref || inputRef}
        className={cn(
          'w-full rounded-md focus:border-indigo-200 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 outline-none',
          'transition-colors ease-in-out duration-200',
          error ? 'border-red-600' : 'border-stone-600',
          className
        )}
        {...props}
      />
    )
  }
)
