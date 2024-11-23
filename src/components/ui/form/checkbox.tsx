import { forwardRef } from 'react'
import { cn } from '@/lib/utils'

export interface CheckboxProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  checked?: boolean | string[]
  value?: string | number
  onChange?: (checked: boolean | string[]) => void
}

const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, checked, value, onChange, ...props }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (Array.isArray(checked)) {
        const newValue = e.target.checked
          ? [...checked, value]
          : checked.filter((v) => v !== value)
        onChange?.(newValue)
      } else {
        onChange?.(e.target.checked)
      }
    }

    return (
      <input
        type="checkbox"
        ref={ref}
        checked={Array.isArray(checked) ? checked.includes(value!) : checked}
        value={value}
        onChange={handleChange}
        className={cn(
          'rounded-md w-5 h-5 border-gray-200 text-indigo-600 shadow-sm cursor-pointer',
          'focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50',
          'disabled:border-gray-100 disabled:cursor-not-allowed',
          className
        )}
        {...props}
      />
    )
  }
)

Checkbox.displayName = 'Checkbox'

export { Checkbox }
