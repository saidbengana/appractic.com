import { forwardRef } from 'react'
import { cn } from '@/lib/utils'

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  value?: string
  onChange?: (value: string) => void
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, value, onChange, ...props }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      onChange?.(e.target.value)
    }

    return (
      <textarea
        ref={ref}
        value={value}
        onChange={handleChange}
        className={cn(
          'w-full rounded-md border-gray-300',
          'focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50',
          'disabled:bg-gray-50 disabled:text-gray-500',
          className
        )}
        {...props}
      />
    )
  }
)

Textarea.displayName = 'Textarea'

export { Textarea }
