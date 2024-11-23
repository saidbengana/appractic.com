import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface SelectableBarProps {
  count: number
  onClose: () => void
  children?: React.ReactNode
  className?: string
  position?: "top" | "bottom"
}

export function SelectableBar({
  count,
  onClose,
  children,
  className,
  position = "bottom",
}: SelectableBarProps) {
  const [isVisible, setIsVisible] = React.useState(false)

  React.useEffect(() => {
    if (count > 0) {
      setIsVisible(true)
    }
  }, [count])

  const handleClose = () => {
    setIsVisible(false)
    setTimeout(onClose, 200) // Wait for animation to complete
  }

  if (!count) return null

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: position === "bottom" ? 20 : -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: position === "bottom" ? 20 : -20 }}
          transition={{ duration: 0.2 }}
          className={cn(
            "fixed left-0 right-0 mx-auto w-full max-w-2xl px-4 z-50",
            position === "bottom" ? "bottom-4" : "top-4",
            className
          )}
        >
          <div
            role="alert"
            aria-live="polite"
            className={cn(
              "flex items-center justify-between",
              "bg-primary text-primary-foreground",
              "px-4 py-3 rounded-lg shadow-lg",
              "border border-primary/20"
            )}
          >
            <div className="flex items-center space-x-4">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleClose}
                      className="h-8 w-8 hover:bg-primary-foreground/10"
                    >
                      <X className="h-4 w-4" />
                      <span className="sr-only">Dismiss selection</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Dismiss selection</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <div className="flex items-center space-x-2">
                <span
                  className={cn(
                    "inline-flex items-center justify-center",
                    "h-6 min-w-[24px] px-1.5 rounded-md",
                    "bg-primary-foreground/20 text-sm font-medium"
                  )}
                >
                  {count}
                </span>
                <span className="text-sm font-medium">
                  <span className="hidden sm:inline">items selected</span>
                  <span className="inline sm:hidden">selected</span>
                </span>
              </div>
            </div>
            {children && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
                className="flex items-center space-x-2"
              >
                {children}
              </motion.div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
