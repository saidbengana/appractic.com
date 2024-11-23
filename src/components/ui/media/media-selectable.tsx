import * as React from "react"
import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

interface MediaSelectableProps {
  active?: boolean
  onClick?: () => void
  children?: React.ReactNode
}

export function MediaSelectable({
  active = false,
  onClick,
  children,
}: MediaSelectableProps) {
  return (
    <div
      onClick={onClick}
      className="w-full relative cursor-pointer box-border"
    >
      {children}
      <div
        className={cn(
          "absolute flex items-center justify-center top-0 right-0 mr-2 mt-2 w-7 h-7 rounded-full border border-white",
          active ? "bg-indigo-500" : "bg-black bg-opacity-20"
        )}
      >
        {active && <Check className="text-white h-4 w-4" />}
      </div>
    </div>
  )
}
