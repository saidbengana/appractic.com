import * as React from "react"
import { cn } from "@/lib/utils"
import { Progress } from "@/components/ui/progress"
import { motion, AnimatePresence } from "framer-motion"

interface PostCharacterCountProps {
  text: string
  maxLength: number
  warningThreshold?: number
  className?: string
}

export function PostCharacterCount({
  text,
  maxLength,
  warningThreshold = 0.8,
  className,
}: PostCharacterCountProps) {
  const characterCount = text.length
  const percentage = (characterCount / maxLength) * 100
  const isWarning = percentage >= warningThreshold * 100
  const isError = characterCount > maxLength

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between">
        <AnimatePresence mode="wait">
          <motion.div
            key={`${characterCount}-${maxLength}`}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className={cn(
              "text-sm",
              isError && "text-destructive",
              isWarning && !isError && "text-warning"
            )}
          >
            {characterCount} / {maxLength} characters
          </motion.div>
        </AnimatePresence>
        <AnimatePresence>
          {isError && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="text-sm text-destructive"
            >
              {characterCount - maxLength} characters over limit
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <Progress
        value={percentage}
        max={100}
        className={cn(
          "h-1.5",
          isError && "bg-destructive/20",
          isWarning && !isError && "bg-warning/20"
        )}
        indicatorClassName={cn(
          "transition-colors",
          isError && "bg-destructive",
          isWarning && !isError && "bg-warning"
        )}
      />
    </div>
  )
}
