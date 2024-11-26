'use client'

import * as React from "react"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Copy, Trash2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

interface PostContent {
  text: string
  media: {
    id: string
    url: string
    type: 'image' | 'video'
    thumbnail?: string
  }[]
}

interface PostVersion {
  id: string
  accountId?: string
  content: PostContent
  createdAt?: string
  updatedAt?: string
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
  const { toast } = useToast()
  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {versions.map((version) => {
        const isActive = version.id === activeVersion
        
        return (
          <TooltipProvider key={version.id}>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="relative">
                  <Button
                    variant={isActive ? "default" : "outline"}
                    size="sm"
                    className={cn(
                      "relative pr-8",
                      disabled && "opacity-50 cursor-not-allowed"
                    )}
                    onClick={() => !disabled && onVersionSelect(version.id)}
                  >
                    {version.accountId ? (
                      <span>Custom Version</span>
                    ) : (
                      <span>Original Version</span>
                    )}
                    {version.content.media.length > 0 && (
                      <Badge
                        variant="neutral"
                        className="ml-2 h-4 rounded-sm px-1"
                      >
                        {version.content.media.length}
                        {version.content.media.length === 1 ? ' media' : ' media'}
                      </Badge>
                    )}
                  </Button>

                  <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center gap-0.5">
                    {onVersionCopy && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => {
                          navigator.clipboard.writeText(version.content.text)
                          toast({
                            title: "Copied",
                            description: "Content copied to clipboard",
                          })
                        }}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    )}
                    {onVersionDelete && version.accountId && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-destructive hover:text-destructive"
                        onClick={() => onVersionDelete?.(version.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p className="font-medium">
                  {version.accountId ? "Custom Version" : "Original Version"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {version.createdAt
                    ? `Created ${new Date(version.createdAt).toLocaleDateString()}`
                    : "No creation date"}
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )
      })}
    </div>
  )
}
