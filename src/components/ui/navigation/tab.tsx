import * as React from "react"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"
import { Badge } from "@/components/ui/badge"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { X } from "lucide-react"

export interface TabProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Whether the tab is active */
  active?: boolean
  /** The content of the tab */
  children: React.ReactNode
  /** Optional icon */
  icon?: React.ReactNode
  /** Optional badge content */
  badge?: string | number
  /** Optional badge variant */
  badgeVariant?: "default" | "secondary" | "destructive" | "outline"
  /** Optional tooltip content */
  tooltip?: string
  /** Whether the tab is disabled */
  disabled?: boolean
  /** Whether the tab is loading */
  loading?: boolean
  /** Whether the tab can be closed */
  closeable?: boolean
  /** Callback when the tab is closed */
  onClose?: (e: React.MouseEvent) => void
  /** The variant of the tab */
  variant?: "default" | "outline" | "pills" | "underline"
  /** The size of the tab */
  size?: "sm" | "default" | "lg"
  /** Additional class name */
  className?: string
}

export function Tab({
  active = false,
  children,
  icon,
  badge,
  badgeVariant = "secondary",
  tooltip,
  disabled = false,
  loading = false,
  closeable = false,
  onClose,
  variant = "underline",
  size = "default",
  className,
  ...props
}: TabProps) {
  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation()
    onClose?.(e)
  }

  const TabContent = (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      disabled={disabled || loading}
      className={cn(
        "relative flex items-center gap-2 transition-all",
        // Base styles
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        disabled && "cursor-not-allowed opacity-50",
        loading && "cursor-wait",
        // Size variations
        size === "sm" && "text-sm",
        size === "lg" && "text-lg",
        // Variant styles
        variant === "default" && [
          "rounded-md px-3 py-2",
          active
            ? "bg-primary text-primary-foreground shadow-sm"
            : "hover:bg-muted",
        ],
        variant === "outline" && [
          "rounded-md border px-3 py-2",
          active
            ? "border-primary bg-primary text-primary-foreground"
            : "hover:bg-muted",
        ],
        variant === "pills" && [
          "rounded-full px-4 py-2",
          active
            ? "bg-primary text-primary-foreground shadow-sm"
            : "hover:bg-muted",
        ],
        variant === "underline" && [
          "border-b-2 px-1 pb-2",
          active
            ? "border-primary text-primary"
            : "border-transparent hover:border-muted-foreground/30 hover:text-foreground/80",
        ],
        className
      )}
      {...props}
    >
      {/* Loading indicator */}
      {loading && (
        <motion.div
          className="absolute inset-0 flex items-center justify-center bg-background/80"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <svg
            className="h-4 w-4 animate-spin text-primary"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
        </motion.div>
      )}

      {/* Icon */}
      {icon && (
        <span className="inline-flex shrink-0">
          {icon}
        </span>
      )}

      {/* Label */}
      <span className="inline-flex items-center gap-2">
        {children}
        {badge && (
          <Badge variant={badgeVariant} className="h-5 px-1.5">
            {badge}
          </Badge>
        )}
      </span>

      {/* Close button */}
      {closeable && !disabled && !loading && (
        <button
          type="button"
          onClick={handleClose}
          className="ml-1 rounded-full p-0.5 hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          aria-label="Close tab"
        >
          <X className="h-3 w-3" />
        </button>
      )}

      {/* Active indicator animation */}
      {active && variant === "underline" && (
        <motion.div
          className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
          layoutId="activeTab"
          transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
        />
      )}
    </button>
  )

  if (tooltip) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            {TabContent}
          </TooltipTrigger>
          <TooltipContent>
            <p>{tooltip}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  return TabContent
}
