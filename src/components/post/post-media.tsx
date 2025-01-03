'use client'

import * as React from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { MediaFile } from "@/components/ui/media/media-file"
import { Trash2 } from "lucide-react"
import {
  DragDropContext,
  Draggable,
  Droppable,
  DropResult,
} from "@hello-pangea/dnd"

interface PostMediaItem {
  id: string
  url: string
  type: "image" | "video"
  thumbnail?: string
  aspectRatio?: number
}

interface PostMediaProps {
  media: PostMediaItem[]
  onMediaRemove?: (index: number) => void
  onMediaReorder?: (startIndex: number, endIndex: number) => void
  disabled?: boolean
  className?: string
}

export function PostMedia({
  media,
  onMediaRemove,
  onMediaReorder,
  disabled = false,
  className,
}: PostMediaProps) {
  const handleDragEnd = React.useCallback(
    (result: DropResult) => {
      if (!result.destination || !onMediaReorder) return

      const sourceIndex = result.source.index
      const destinationIndex = result.destination.index

      if (sourceIndex === destinationIndex) return

      onMediaReorder(sourceIndex, destinationIndex)
    },
    [onMediaReorder]
  )

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <Droppable droppableId="media" direction="horizontal">
        {(provided) => (
          <div
            {...provided.droppableProps}
            ref={provided.innerRef}
            className={cn("flex flex-wrap gap-2", className)}
          >
            {media.map((item, index) => (
              <Draggable
                key={item.id}
                draggableId={item.id}
                index={index}
                isDragDisabled={disabled}
              >
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    className={cn(
                      "relative group",
                      snapshot.isDragging && "opacity-50"
                    )}
                  >
                    <MediaFile
                      media={{
                        is_video: item.type === "video",
                        thumb_url: item.thumbnail,
                        name: item.url.split("/").pop(),
                      }}
                    >
                      <div className="relative h-full w-full" />
                    </MediaFile>
                    {onMediaRemove && !disabled && (
                      <Button
                        variant="destructive"
                        size="icon"
                        className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100"
                        onClick={() => onMediaRemove(index)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  )
}
