import * as React from "react"
import { AlertTriangle } from "lucide-react"
import { cn } from "@/lib/utils"
import { DialogModal } from "./dialog-modal"
import { Button } from "../button"

interface ConfirmationModalProps {
  show?: boolean
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl"
  closeable?: boolean
  variant?: "warning" | "danger"
  onClose?: () => void
  onConfirm?: () => void
  title?: React.ReactNode
  children?: React.ReactNode
}

export function ConfirmationModal({
  show = false,
  maxWidth = "md",
  closeable = true,
  variant = "warning",
  onClose,
  onConfirm,
  title,
  children,
}: ConfirmationModalProps) {
  const variantStyles = {
    warning: {
      bg: "bg-orange-100",
      icon: "text-orange-600",
      button: "bg-orange-600 hover:bg-orange-500",
    },
    danger: {
      bg: "bg-red-100",
      icon: "text-red-600",
      button: "bg-red-600 hover:bg-red-500",
    },
  }[variant]

  return (
    <DialogModal
      show={show}
      maxWidth={maxWidth}
      closeable={closeable}
      onClose={onClose}
      title={
        <div className="flex items-center">
          <div className={cn("p-2 rounded-full mr-3", variantStyles.bg)}>
            <AlertTriangle className={cn("h-6 w-6", variantStyles.icon)} />
          </div>
          {title}
        </div>
      }
      footer={
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            className={variantStyles.button}
            onClick={() => {
              onConfirm?.()
              onClose?.()
            }}
          >
            Confirm
          </Button>
        </div>
      }
    >
      {children}
    </DialogModal>
  )
}
