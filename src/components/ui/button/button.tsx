import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { Loader2 } from "lucide-react"

const buttonVariants = cva(
  "relative inline-flex items-center justify-center rounded-md font-medium text-xs uppercase tracking-widest transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-400 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-indigo-500 text-white hover:bg-indigo-700 active:bg-indigo-700 focus:border-indigo-700 focus:shadow-outline-indigo disabled:bg-indigo-400",
        secondary:
          "bg-white text-black border border-indigo-800 hover:text-indigo-500 hover:border-indigo-500 active:text-indigo-500 active:border-indigo-700 focus:border-indigo-700 focus:shadow-outline-indigo disabled:text-gray-500",
        danger:
          "bg-red-500 text-white hover:bg-red-700 active:bg-red-700 focus:border-red-700 focus:shadow-outline-red disabled:bg-red-400",
        ghost: "hover:bg-gray-100 hover:text-gray-900",
        link: "text-indigo-500 underline-offset-4 hover:underline",
        outline:
          "border border-gray-200 bg-white hover:bg-gray-100 hover:text-gray-900",
      },
      size: {
        xs: "py-1 px-2",
        sm: "px-3 py-2",
        md: "px-4 py-2",
        lg: "px-4 py-3",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "lg",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  isLoading?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, isLoading = false, children, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"

    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      >
        {children}
        {isLoading && (
          <span className={cn(
            "absolute left-0 top-0 flex justify-center items-center w-full h-full rounded-md",
            {
              "bg-indigo-500": variant === "default",
              "bg-white": variant === "secondary",
              "bg-red-500": variant === "danger",
            }
          )}>
            <Loader2 className={cn(
              "h-4 w-4 animate-spin",
              {
                "text-white": variant === "default" || variant === "danger",
                "text-indigo-500": variant === "secondary",
              }
            )} />
          </span>
        )}
      </Comp>
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
