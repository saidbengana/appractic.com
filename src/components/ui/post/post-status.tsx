import { useMemo } from "react"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

type PostStatusValue = "DRAFT" | "PUBLISHED" | "PUBLISHING" | "SCHEDULED" | "FAILED"

interface PostStatusProps {
  value: PostStatusValue
  showName?: boolean
  className?: string
}

const STATUS_CLASSNAMES: Record<PostStatusValue, string> = {
  DRAFT: "bg-gray-500",
  PUBLISHED: "bg-lime-500",
  PUBLISHING: "bg-violet-500",
  SCHEDULED: "bg-cyan-500",
  FAILED: "bg-red-500",
}

const STATUS_NAMES: Record<PostStatusValue, string> = {
  DRAFT: "Draft",
  PUBLISHED: "Published",
  PUBLISHING: "Publishing",
  SCHEDULED: "Scheduled",
  FAILED: "Failed",
}

export function PostStatus({
  value,
  showName = true,
  className,
}: PostStatusProps) {
  const statusClassName = useMemo(() => STATUS_CLASSNAMES[value], [value])
  const statusName = useMemo(() => STATUS_NAMES[value], [value])

  const statusIndicator = (
    <div className={cn("w-4 h-4 rounded-full", statusClassName)} />
  )

  return (
    <div className={cn("flex items-center", className)}>
      {showName ? (
        <>
          {statusIndicator}
          <div className="ml-2">{statusName}</div>
        </>
      ) : (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              {statusIndicator}
            </TooltipTrigger>
            <TooltipContent>
              <p>{statusName}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  )
}
