import * as React from "react"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Copy, Trash2 } from "lucide-react"

interface PostVersion {
  id: string
  content: {
    text: string
    media: Array<{
      url: string
      type: "image" | "video"
      aspectRatio?: number
    }>
  }
  account_id: string
  created_at: string
  is_active: boolean
}

interface PostVersionsTabProps {
  versions: PostVersion[]
  activeVersion: string | null
  onVersionSelect: (versionId: string) => void
  onVersionCopy?: (version: PostVersion) => void
  onVersionDelete?: (versionId: string) => void
  className?: string
  disabled?: boolean
}

export function PostVersionsTab({
  versions,
  activeVersion,
  onVersionSelect,
  onVersionCopy,
  onVersionDelete,
  className,
  disabled = false
}: PostVersionsTabProps) {
  const sortedVersions = React.useMemo(() => {
    return [...versions].sort((a, b) => {
      if (a.is_active && !b.is_active) return -1
      if (!a.is_active && b.is_active) return 1
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    })
  }, [versions])

  const handleVersionSelect = React.useCallback((versionId: string) => {
    if (disabled) return
    onVersionSelect(versionId)
  }, [disabled, onVersionSelect])

  const handleVersionCopy = React.useCallback((e: React.MouseEvent, version: PostVersion) => {
    e.stopPropagation()
    if (disabled || !onVersionCopy) return
    onVersionCopy(version)
  }, [disabled, onVersionCopy])

  const handleVersionDelete = React.useCallback((e: React.MouseEvent, versionId: string) => {
    e.stopPropagation()
    if (disabled || !onVersionDelete) return
    onVersionDelete(versionId)
  }, [disabled, onVersionDelete])

  return (
    <div
      className={cn(
        "flex flex-col space-y-2 p-4 bg-background rounded-lg border",
        className
      )}
    >
      <h3 className="text-sm font-medium">Post Versions</h3>
      <div className="flex flex-col space-y-2">
        {sortedVersions.map((version) => (
          <div
            key={version.id}
            onClick={() => handleVersionSelect(version.id)}
            className={cn(
              "flex items-center justify-between p-3 rounded-md border transition-colors",
              "hover:bg-muted/50 cursor-pointer",
              activeVersion === version.id && "bg-muted",
              disabled && "opacity-50 cursor-not-allowed"
            )}
          >
            <div className="flex items-center space-x-3">
              <div className="flex flex-col">
                <span className="text-sm font-medium">
                  Version {version.id.slice(0, 8)}
                </span>
                <span className="text-xs text-muted-foreground">
                  {new Date(version.created_at).toLocaleDateString()} at{" "}
                  {new Date(version.created_at).toLocaleTimeString()}
                </span>
              </div>
              {version.is_active && (
                <Badge variant="secondary" className="text-xs">
                  Active
                </Badge>
              )}
            </div>
            <div className="flex items-center space-x-2">
              {onVersionCopy && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={(e) => handleVersionCopy(e, version)}
                        disabled={disabled}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Copy version</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
              {onVersionDelete && !version.is_active && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={(e) => handleVersionDelete(e, version.id)}
                        disabled={disabled}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Delete version</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
