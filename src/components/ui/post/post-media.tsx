"use client";

import * as React from "react";
import { startsWith } from "lodash";
import { usePost } from "@/hooks/use-post";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { MediaFile } from "@/components/ui/media/media-file";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import { cn } from "@/lib/utils";

interface MediaItem {
  id: string;
  url: string;
  mime_type: string;
  thumbnail?: string;
  type?: "image" | "video" | "gif";
  width?: number;
  height?: number;
}

interface PostMediaProps {
  media: MediaItem[];
  onMediaChange?: (media: MediaItem[]) => void;
  className?: string;
  maxHeight?: number;
  imgHeight?: "sm" | "md" | "lg";
  imgWidthFull?: boolean;
  selectable?: boolean;
  onSelect?: (item: MediaItem) => void;
}

interface SortableItemProps {
  media: MediaItem;
  onOpen: (item: MediaItem) => void;
  imgHeight?: "sm" | "md" | "lg";
  imgWidthFull?: boolean;
  selectable?: boolean;
  onSelect?: (item: MediaItem) => void;
}

function SortableItem({
  media,
  onOpen,
  imgHeight = "sm",
  imgWidthFull = false,
  selectable = false,
  onSelect,
}: SortableItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: media.id,
  });

  const style = {
    transform: transform
      ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
      : undefined,
    transition,
  };

  const handleClick = (e: React.MouseEvent) => {
    if (selectable && onSelect) {
      e.stopPropagation();
      onSelect(media);
    } else {
      onOpen(media);
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      role="button"
      className={cn("cursor-pointer", {
        "hover:opacity-80 transition-opacity": selectable,
      })}
      onClick={handleClick}
    >
      <MediaFile
        media={media}
        imgHeight={imgHeight}
        imgWidthFull={imgWidthFull}
      />
    </div>
  );
}

export function PostMedia({
  media,
  onMediaChange,
  className,
  maxHeight,
  imgHeight = "sm",
  imgWidthFull = false,
  selectable = false,
  onSelect,
}: PostMediaProps) {
  const { editAllowed } = usePost();
  const [items, setItems] = React.useState<MediaItem[]>(media);
  const [showView, setShowView] = React.useState(false);
  const [openedItem, setOpenedItem] = React.useState<MediaItem | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  React.useEffect(() => {
    setItems(media);
  }, [media]);

  const isVideo = (mime_type: string) => {
    return startsWith(mime_type, "video");
  };

  const isGif = (mime_type: string) => {
    return mime_type === "image/gif";
  };

  const open = (item: MediaItem) => {
    setOpenedItem(item);
    setShowView(true);
  };

  const close = () => {
    setShowView(false);
    setOpenedItem(null);
  };

  const remove = (id: string) => {
    const newItems = items.filter((item) => item.id !== id);
    setItems(newItems);
    onMediaChange?.(newItems);
    close();
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = items.findIndex((item) => item.id === active.id);
      const newIndex = items.findIndex((item) => item.id === over?.id);

      const newItems = arrayMove(items, oldIndex, newIndex);
      setItems(newItems);
      onMediaChange?.(newItems);
    }
  };

  return (
    <>
      <div
        className={cn("mt-8", className)}
        style={maxHeight ? { maxHeight, overflow: "auto" } : undefined}
      >
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={items.map((item) => item.id)}
            strategy={rectSortingStrategy}
            disabled={!editAllowed || selectable}
          >
            <div className="flex flex-wrap gap-2">
              {items.map((item) => (
                <SortableItem
                  key={item.id}
                  media={item}
                  onOpen={open}
                  imgHeight={imgHeight}
                  imgWidthFull={imgWidthFull}
                  selectable={selectable}
                  onSelect={onSelect}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </div>

      <Dialog open={showView} onOpenChange={setShowView}>
        <DialogContent className="sm:max-w-[900px]">
          <DialogHeader>
            <DialogTitle>View Media</DialogTitle>
          </DialogHeader>
          <div className="flex justify-center items-center max-h-[600px] overflow-auto">
            {openedItem && (
              <>
                {isVideo(openedItem.mime_type) ? (
                  <video
                    className="w-auto max-h-[600px]"
                    controls
                    playsInline
                    preload="metadata"
                  >
                    <source src={openedItem.url} type={openedItem.mime_type} />
                    Your browser does not support the video tag.
                  </video>
                ) : (
                  <img
                    src={openedItem.url}
                    alt="Media content"
                    className={cn("max-w-full", {
                      "max-h-[600px] w-auto": !imgWidthFull,
                    })}
                    loading="lazy"
                  />
                )}
              </>
            )}
          </div>
          <DialogFooter>
            <Button variant="secondary" onClick={close} className="mr-2">
              Close
            </Button>
            {editAllowed && openedItem && (
              <Button
                variant="destructive"
                onClick={() => remove(openedItem.id)}
              >
                Remove
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
