import * as React from "react"
import { cn } from "@/lib/utils"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { AspectRatio } from "@/components/ui/aspect-ratio"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Play, Image as ImageIcon, Film, X } from "lucide-react"

interface MediaItem {
  id: string
  url: string
  type: "image" | "video" | "gif"
  thumbnail?: string
  name: string
  size?: number
  dimensions?: {
    width: number
    height: number
  }
}

interface MediaGalleryProps {
  items: MediaItem[]
  onSelect?: (item: MediaItem) => void
  onRemove?: (item: MediaItem) => void
  selectable?: boolean
  removable?: boolean
  loading?: boolean
  maxHeight?: number
  className?: string
}

export function MediaGallery({
  items,
  onSelect,
  onRemove,
  selectable = false,
  removable = false,
  loading = false,
  maxHeight = 400,
  className,
}: MediaGalleryProps) {
  const [selectedItem, setSelectedItem] = React.useState<MediaItem | null>(null)

  const handleSelect = (item: MediaItem) => {
    setSelectedItem(item)
    onSelect?.(item)
  }

  const handleRemove = (e: React.MouseEvent, item: MediaItem) => {
    e.stopPropagation()
    onRemove?.(item)
  }

  const getFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const MediaIcon = ({ type }: { type: MediaItem["type"] }) => {
    switch (type) {
      case "video":
        return <Film className="h-5 w-5" />
      case "gif":
        return <Play className="h-5 w-5" />
      default:
        return <ImageIcon className="h-5 w-5" />
    }
  }

  if (loading) {
    return (
      <div className={cn("grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4", className)}>
        {[...Array(8)].map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="aspect-square rounded-lg" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        ))}
      </div>
    )
  }

  return (
    <ScrollArea className={cn("w-full", className)} style={{ maxHeight }}>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 p-1">
        {items.map((item) => (
          <div
            key={item.id}
            className={cn(
              "group relative rounded-lg overflow-hidden border bg-card",
              selectable && "cursor-pointer hover:border-primary"
            )}
            onClick={() => selectable && handleSelect(item)}
          >
            <AspectRatio ratio={1}>
              {item.type === "video" ? (
                <video
                  src={item.url}
                  className="object-cover w-full h-full"
                  poster={item.thumbnail}
                />
              ) : (
                <img
                  src={item.url}
                  alt={item.name}
                  className="object-cover w-full h-full"
                />
              )}
            </AspectRatio>

            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="absolute top-2 left-2">
                <Badge variant="secondary" className="flex items-center gap-1">
                  <MediaIcon type={item.type} />
                  {item.type.toUpperCase()}
                </Badge>
              </div>

              {removable && (
                <button
                  className="absolute top-2 right-2 p-1 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                  onClick={(e) => handleRemove(e, item)}
                >
                  <X className="h-4 w-4 text-white" />
                </button>
              )}

              <Dialog>
                <DialogTrigger asChild>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-white text-sm">Click to preview</div>
                  </div>
                </DialogTrigger>
                <DialogContent className="max-w-4xl">
                  <DialogHeader>
                    <DialogTitle>{item.name}</DialogTitle>
                    <DialogDescription>
                      {item.size && (
                        <span className="text-sm text-muted-foreground">
                          Size: {getFileSize(item.size)}
                        </span>
                      )}
                      {item.dimensions && (
                        <span className="text-sm text-muted-foreground ml-4">
                          Dimensions: {item.dimensions.width} x {item.dimensions.height}
                        </span>
                      )}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="mt-4">
                    {item.type === "video" ? (
                      <video
                        src={item.url}
                        controls
                        className="w-full rounded-lg"
                        poster={item.thumbnail}
                      />
                    ) : (
                      <img
                        src={item.url}
                        alt={item.name}
                        className="w-full rounded-lg"
                      />
                    )}
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  )
}
