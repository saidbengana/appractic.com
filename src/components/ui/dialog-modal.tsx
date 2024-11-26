import * as React from "react"
import { cn } from "@/lib/utils"
import { X } from "lucide-react"
import { AnimatePresence, motion } from "framer-motion"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"

export interface DialogModalProps {
  /** Whether the modal is open */
  isOpen: boolean
  /** Callback when the modal is closed */
  onClose: () => void
  /** Title of the modal */
  title: string
  /** Description of the modal */
  description?: string
  /** Content of the modal */
  children?: React.ReactNode
  /** Maximum width of the modal */
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl" | "6xl" | "7xl"
  /** Whether to show the close button */
  showCloseButton?: boolean
  /** Whether to close the modal when clicking outside */
  closeOnOutsideClick?: boolean
  /** Whether to close the modal when pressing escape */
  closeOnEscape?: boolean
  /** Whether the modal is in a loading state */
  loading?: boolean
  /** Additional class name for the modal */
  className?: string
  /** Additional class name for the modal content */
  contentClassName?: string
  /** Whether the modal content is scrollable */
  scrollable?: boolean
  /** Maximum height of the modal */
  maxHeight?: string
  /** Position of the modal */
  position?: "center" | "top"
  /** Callback when the confirm button is clicked */
  onConfirm?: () => Promise<void>
}

export function DialogModal({
  isOpen,
  onClose,
  title,
  description,
  children,
  maxWidth = "2xl",
  showCloseButton = true,
  closeOnOutsideClick = true,
  closeOnEscape = true,
  loading = false,
  className,
  contentClassName,
  scrollable = false,
  maxHeight = "80vh",
  position = "center",
  onConfirm,
}: DialogModalProps) {
  // Handle escape key
  React.useEffect(() => {
    if (!closeOnEscape) return

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose()
      }
    }

    document.addEventListener("keydown", handleEscape)
    return () => document.removeEventListener("keydown", handleEscape)
  }, [closeOnEscape, isOpen, onClose])

  const modalVariants = {
    hidden: {
      opacity: 0,
      scale: 0.95,
      y: position === "top" ? -20 : 0,
    },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        type: "spring",
        duration: 0.3,
      },
    },
    exit: {
      opacity: 0,
      scale: 0.95,
      y: position === "top" ? -20 : 0,
      transition: {
        duration: 0.2,
      },
    },
  }

  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 },
  }

  const Content = scrollable ? ScrollArea : "div"

  return (
    <AnimatePresence>
      {isOpen && (
        <Dialog open={isOpen} onOpenChange={onClose}>
          <motion.div
            className="fixed inset-0 z-50 bg-black/80"
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          />
          <DialogContent
            className={cn(
              "gap-0 p-0 outline-none",
              maxWidth === "sm" && "sm:max-w-sm",
              maxWidth === "md" && "sm:max-w-md",
              maxWidth === "lg" && "sm:max-w-lg",
              maxWidth === "xl" && "sm:max-w-xl",
              maxWidth === "2xl" && "sm:max-w-2xl",
              maxWidth === "3xl" && "sm:max-w-3xl",
              maxWidth === "4xl" && "sm:max-w-4xl",
              maxWidth === "5xl" && "sm:max-w-5xl",
              maxWidth === "6xl" && "sm:max-w-6xl",
              maxWidth === "7xl" && "sm:max-w-7xl",
              position === "top" && "sm:mt-16",
              className
            )}
          >
            {showCloseButton && (
              <Button
                variant="ghost"
                className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
                onClick={onClose}
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Close</span>
              </Button>
            )}

            <div className={cn("p-6", contentClassName)}>
              <DialogHeader>
                <DialogTitle>{title}</DialogTitle>
                {description && <DialogDescription>{description}</DialogDescription>}
              </DialogHeader>

              {scrollable ? (
                <ScrollArea className="mt-2" style={{ maxHeight }}>
                  {children}
                </ScrollArea>
              ) : (
                <div className="mt-2">{children}</div>
              )}

              {onConfirm && (
                <div className="mt-4 flex justify-end space-x-2">
                  <Button variant="outline" onClick={onClose} disabled={loading}>
                    Cancel
                  </Button>
                  <Button onClick={onConfirm} disabled={loading}>
                    {loading ? "Loading..." : "Confirm"}
                  </Button>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </AnimatePresence>
  )
}
