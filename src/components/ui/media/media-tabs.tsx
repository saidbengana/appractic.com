import * as React from "react"
import { cn } from "@/lib/utils"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MediaFile } from "./media-file"
import { MediaGifs } from "./media-gifs"
import { MediaStock } from "./media-stock"
import { MediaEmoji } from "./media-emoji"
import { UploadMedia } from "./upload-media"
import { Image, FileImage, Smile, Upload } from "lucide-react"

interface MediaTabsProps {
  className?: string
  defaultTab?: string
  onGifSearch?: (query: string) => Promise<any[]>
  onStockSearch?: (query: string) => Promise<any[]>
  emojiCategories?: any[]
  onEmojiSelect?: (emoji: any) => void
  onUpload?: (files: File[]) => Promise<void>
  onMediaSelect?: (media: any) => void
  selectedMedia?: any[]
  maxSelection?: number
}

export function MediaTabs({
  className,
  defaultTab = "upload",
  onGifSearch,
  onStockSearch,
  emojiCategories = [],
  onEmojiSelect,
  onUpload,
  onMediaSelect,
  selectedMedia = [],
  maxSelection = Infinity,
}: MediaTabsProps) {
  const [selected, setSelected] = React.useState<any[]>(selectedMedia)

  React.useEffect(() => {
    setSelected(selectedMedia)
  }, [selectedMedia])

  const handleSelect = (media: any) => {
    const newSelected = selected.includes(media)
      ? selected.filter((m) => m !== media)
      : selected.length < maxSelection
      ? [...selected, media]
      : selected

    setSelected(newSelected)
    onMediaSelect?.(newSelected)
  }

  const isSelected = (media: any) => selected.includes(media)

  return (
    <Tabs
      defaultValue={defaultTab}
      className={cn("w-full", className)}
    >
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="upload" className="gap-2">
          <Upload className="h-4 w-4" />
          Upload
        </TabsTrigger>
        <TabsTrigger value="gifs" className="gap-2">
          <FileImage className="h-4 w-4" />
          GIFs
        </TabsTrigger>
        <TabsTrigger value="stock" className="gap-2">
          <Image className="h-4 w-4" />
          Stock
        </TabsTrigger>
        <TabsTrigger value="emoji" className="gap-2">
          <Smile className="h-4 w-4" />
          Emoji
        </TabsTrigger>
      </TabsList>

      <div className="mt-4">
        <TabsContent value="upload">
          <UploadMedia
            onUpload={onUpload}
            selected={selected}
            toggleSelect={handleSelect}
            isSelected={isSelected}
            maxSelection={maxSelection}
          />
        </TabsContent>

        <TabsContent value="gifs">
          <MediaGifs
            onSearch={onGifSearch}
            selected={selected}
            toggleSelect={handleSelect}
            isSelected={isSelected}
            maxSelection={maxSelection}
          />
        </TabsContent>

        <TabsContent value="stock">
          <MediaStock
            onSearch={onStockSearch}
            selected={selected}
            toggleSelect={handleSelect}
            isSelected={isSelected}
            maxSelection={maxSelection}
          />
        </TabsContent>

        <TabsContent value="emoji">
          <MediaEmoji
            categories={emojiCategories}
            onSelect={onEmojiSelect}
          />
        </TabsContent>
      </div>
    </Tabs>
  )
}
