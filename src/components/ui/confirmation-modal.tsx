import * as React from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { AlertTriangle, AlertCircle, Info } from "lucide-react"

interface ConfirmationModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message?: string
  confirmText?: string
  cancelText?: string
  isDanger?: boolean
  isWarning?: boolean
  isLoading?: boolean
  className?: string
}

export function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  isDanger = false,
  isWarning = false,
  isLoading = false,
  className,
}: ConfirmationModalProps) {
  // Handle keyboard events
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return

      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault()
        onConfirm()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isOpen, onConfirm])

  const Icon = isDanger ? AlertCircle : isWarning ? AlertTriangle : Info
  const iconColor = isDanger ? "text-destructive" : isWarning ? "text-warning" : "text-primary"
  const iconBg = isDanger ? "bg-destructive/10" : isWarning ? "bg-warning/10" : "bg-primary/10"

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className={cn(
          "sm:max-w-[425px]",
          className
        )}
      >
        <DialogHeader className="sm:flex sm:items-start">
          <div
            className={cn(
              "mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full",
              "sm:mx-0 sm:h-10 sm:w-10",
              iconBg
            )}
          >
            <Icon className={cn("h-6 w-6", iconColor)} />
          </div>
          <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
            <DialogTitle>{title}</DialogTitle>
            {message && (
              <DialogDescription className="mt-2">
                {message}
              </DialogDescription>
            )}
          </div>
        </DialogHeader>
        <DialogFooter className="sm:flex sm:flex-row-reverse sm:space-x-2 sm:space-x-reverse">
          <Button
            variant={isDanger ? "destructive" : "default"}
            onClick={onConfirm}
            disabled={isLoading}
            className={cn(isLoading && "cursor-wait")}
          >
            {isLoading ? "Loading..." : confirmText}
          </Button>
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
            className={cn(isLoading && "cursor-wait")}
          >
            {cancelText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
