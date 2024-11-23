import * as React from "react"
import { X } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
} from "./modal"
import { Button } from "../button"

interface DialogModalProps {
  show?: boolean
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl" | "6xl" | "7xl"
  closeable?: boolean
  scrollableBody?: boolean
  onClose?: () => void
  children?: React.ReactNode
  title?: React.ReactNode
  footer?: React.ReactNode
}

export function DialogModal({
  show = false,
  maxWidth = "2xl",
  closeable = true,
  scrollableBody = false,
  onClose,
  children,
  title,
  footer,
}: DialogModalProps) {
  return (
    <Dialog open={show} onOpenChange={(open) => !open && onClose?.()}>
      <DialogContent
        maxWidth={maxWidth}
        closeable={closeable}
        onClose={onClose}
        className={scrollableBody ? "overflow-hidden" : ""}
      >
        <div className="w-full h-full min-h-full max-h-max relative overflow-x-hidden overflow-y-auto">
          <div className="flex flex-col h-full w-full">
            {title && (
              <DialogHeader className="flex justify-between px-6 py-4 text-lg">
                {title}
                {closeable && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={onClose}
                    className="absolute right-4 top-4"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </DialogHeader>
            )}

            <div
              className={cn(
                "p-6 h-full overflow-x-hidden overflow-y-auto",
                title && "pt-0"
              )}
            >
              {children}
            </div>

            {footer && (
              <div className="px-6 py-4 bg-gray-50 text-right">
                {footer}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
