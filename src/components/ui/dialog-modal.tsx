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
  /** The title of the modal */
  title?: string
  /** The description of the modal */
  description?: string
  /** The content of the modal */
  children?: React.ReactNode
  /** The maximum width of the modal */
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "full"
  /** Whether to show the close button */
  showCloseButton?: boolean
  /** Whether to close the modal when clicking outside */
  closeOnOutsideClick?: boolean
  /** Whether to close the modal when pressing escape */
  closeOnEscape?: boolean
  /** Whether to show a loading state */
  loading?: boolean
  /** Additional class names for the modal */
  className?: string
  /** Additional class names for the content */
  contentClassName?: string
  /** Whether to show a scroll area */
  scrollable?: boolean
  /** The maximum height of the scroll area */
  maxHeight?: string
  /** The position of the modal */
  position?: "center" | "top"
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
        <Dialog open={isOpen} onOpenChange={closeOnOutsideClick ? onClose : undefined}>
          <motion.div
            className="fixed inset-0 z-50 bg-black/80"
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          />
          <DialogContent
            className={cn(
              "fixed left-[50%] top-[50%] z-50 grid w-full translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 sm:rounded-lg",
              maxWidth === "sm" && "max-w-sm",
              maxWidth === "md" && "max-w-md",
              maxWidth === "lg" && "max-w-lg",
              maxWidth === "xl" && "max-w-xl",
              maxWidth === "2xl" && "max-w-2xl",
              maxWidth === "full" && "max-w-[95vw]",
              position === "top" && "top-6 translate-y-0",
              loading && "pointer-events-none opacity-50",
              className
            )}
            onEscapeKeyDown={(e) => {
              if (!closeOnEscape) {
                e.preventDefault()
              }
            }}
            onInteractOutside={(e) => {
              if (!closeOnOutsideClick) {
                e.preventDefault()
              }
            }}
            asChild
          >
            <motion.div
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <div className="relative">
                {showCloseButton && (
                  <DialogClose asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute right-2 top-2"
                      onClick={onClose}
                    >
                      <X className="h-4 w-4" />
                      <span className="sr-only">Close</span>
                    </Button>
                  </DialogClose>
                )}

                {(title || description) && (
                  <DialogHeader className="space-y-2">
                    {title && (
                      <DialogTitle className="text-lg font-semibold">
                        {title}
                      </DialogTitle>
                    )}
                    {description && (
                      <DialogDescription className="text-sm text-muted-foreground">
                        {description}
                      </DialogDescription>
                    )}
                  </DialogHeader>
                )}

                <Content
                  className={cn(
                    "mt-4",
                    scrollable && "max-h-[inherit] overflow-auto",
                    contentClassName
                  )}
                  style={scrollable ? { maxHeight } : undefined}
                >
                  {children}
                </Content>
              </div>
            </motion.div>
          </DialogContent>
        </Dialog>
      )}
    </AnimatePresence>
  )
}
