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

interface MediaItem {
  url: string
  type: "image" | "video"
  aspectRatio?: number
}

interface PostMediaProps {
  media: MediaItem[]
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
  const handleDragEnd = (result: DropResult) => {
    if (!result.destination || disabled || !onMediaReorder) return

    const sourceIndex = result.source.index
    const destinationIndex = result.destination.index

    if (sourceIndex === destinationIndex) return

    onMediaReorder(sourceIndex, destinationIndex)
  }

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <Droppable droppableId="media-list" direction="horizontal">
        {(provided) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={cn(
              "grid gap-4",
              media.length === 1 && "grid-cols-1",
              media.length === 2 && "grid-cols-2",
              media.length >= 3 && "grid-cols-2 grid-rows-2",
              media.length === 4 && "grid-cols-2",
              className
            )}
          >
            {media.map((item, index) => (
              <Draggable
                key={item.url}
                draggableId={item.url}
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
                      media.length === 3 && index === 0 && "col-span-2",
                      snapshot.isDragging && "z-50"
                    )}
                  >
                    <MediaFile
                      src={item.url}
                      type={item.type}
                      aspectRatio={item.aspectRatio}
                      className={cn(
                        "rounded-lg border",
                        snapshot.isDragging && "ring-2 ring-primary"
                      )}
                    />
                    {onMediaRemove && !disabled && (
                      <Button
                        variant="destructive"
                        size="icon"
                        className={cn(
                          "absolute top-2 right-2 h-8 w-8",
                          "opacity-0 group-hover:opacity-100 transition-opacity"
                        )}
                        onClick={() => onMediaRemove(index)}
                      >
                        <Trash2 className="h-4 w-4" />
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
