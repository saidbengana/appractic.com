import { forwardRef } from 'react'
import { cn } from '@/lib/utils'

export interface RadioProps extends React.InputHTMLAttributes<HTMLInputElement> {
  checked?: string | number
  value?: string | number
  onChange?: (value: string | number) => void
}

const Radio = forwardRef<HTMLInputElement, RadioProps>(
  ({ className, checked, value, onChange, ...props }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange?.(e.target.value)
    }

    return (
      <input
        type="radio"
        ref={ref}
        checked={checked === value}
        value={value}
        onChange={handleChange}
        className={cn(
          'rounded-full w-5 h-5 border-gray-200 text-indigo-600 shadow-sm',
          'focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50',
          'disabled:border-gray-100 disabled:cursor-not-allowed',
          className
        )}
        {...props}
      />
    )
  }
)

Radio.displayName = 'Radio'

export { Radio }
