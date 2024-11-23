import * as React from "react"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { MediaUpload } from "./media-upload"
import { MediaGallery } from "./media-gallery"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu"
import { Filter, SlidersHorizontal } from "lucide-react"

interface MediaPickerProps {
  onSelect?: (items: MediaItem[]) => void
  onUpload?: (files: File[]) => Promise<void>
  multiple?: boolean
  maxFiles?: number
  className?: string
}

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
  tags?: string[]
  createdAt: Date
}

interface MediaFilters {
  type?: string[]
  tags?: string[]
  dateRange?: {
    from?: Date
    to?: Date
  }
}

export function MediaPicker({
  onSelect,
  onUpload,
  multiple = false,
  maxFiles = 10,
  className,
}: MediaPickerProps) {
  const [activeTab, setActiveTab] = React.useState("uploads")
  const [searchQuery, setSearchQuery] = React.useState("")
  const [filters, setFilters] = React.useState<MediaFilters>({})
  const [selectedItems, setSelectedItems] = React.useState<MediaItem[]>([])
  const [loading, setLoading] = React.useState(false)

  // Mock data - replace with actual API calls
  const items: MediaItem[] = [
    {
      id: "1",
      url: "https://picsum.photos/400",
      type: "image",
      name: "Sample Image 1",
      size: 1024 * 1024,
      dimensions: { width: 400, height: 400 },
      tags: ["marketing", "social"],
      createdAt: new Date(),
    },
    // Add more items...
  ]

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    // Implement search logic
  }

  const handleFilterChange = (newFilters: Partial<MediaFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }))
    // Implement filter logic
  }

  const handleSelect = (item: MediaItem) => {
    if (!multiple) {
      setSelectedItems([item])
      onSelect?.([item])
      return
    }

    const isSelected = selectedItems.some((i) => i.id === item.id)
    let newSelection: MediaItem[]

    if (isSelected) {
      newSelection = selectedItems.filter((i) => i.id !== item.id)
    } else if (selectedItems.length < maxFiles) {
      newSelection = [...selectedItems, item]
    } else {
      return // Max files reached
    }

    setSelectedItems(newSelection)
    onSelect?.(newSelection)
  }

  const handleUpload = async (files: File[]) => {
    try {
      setLoading(true)
      await onUpload?.(files)
      // Refresh media list after upload
    } catch (error) {
      console.error("Upload failed:", error)
    } finally {
      setLoading(false)
    }
  }

  const filteredItems = React.useMemo(() => {
    return items.filter((item) => {
      // Implement filtering logic based on searchQuery and filters
      return true
    })
  }, [items, searchQuery, filters])

  return (
    <div className={cn("space-y-4", className)}>
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="uploads">Uploads</TabsTrigger>
            <TabsTrigger value="stock">Stock Photos</TabsTrigger>
            <TabsTrigger value="gifs">GIFs</TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-2">
            <Input
              placeholder="Search media..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-64"
            />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <SlidersHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Filter by Type</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuCheckboxItem
                  checked={filters.type?.includes("image")}
                  onCheckedChange={(checked) =>
                    handleFilterChange({
                      type: checked
                        ? [...(filters.type || []), "image"]
                        : filters.type?.filter((t) => t !== "image"),
                    })
                  }
                >
                  Images
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={filters.type?.includes("video")}
                  onCheckedChange={(checked) =>
                    handleFilterChange({
                      type: checked
                        ? [...(filters.type || []), "video"]
                        : filters.type?.filter((t) => t !== "video"),
                    })
                  }
                >
                  Videos
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={filters.type?.includes("gif")}
                  onCheckedChange={(checked) =>
                    handleFilterChange({
                      type: checked
                        ? [...(filters.type || []), "gif"]
                        : filters.type?.filter((t) => t !== "gif"),
                    })
                  }
                >
                  GIFs
                </DropdownMenuCheckboxItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <TabsContent value="uploads" className="mt-4">
          <div className="space-y-4">
            <MediaUpload onUpload={handleUpload} maxFiles={maxFiles} />
            <MediaGallery
              items={filteredItems}
              onSelect={handleSelect}
              selectable
              loading={loading}
              maxHeight={500}
            />
          </div>
        </TabsContent>

        <TabsContent value="stock" className="mt-4">
          <MediaGallery
            items={filteredItems.filter((item) => item.type === "image")}
            onSelect={handleSelect}
            selectable
            loading={loading}
            maxHeight={500}
          />
        </TabsContent>

        <TabsContent value="gifs" className="mt-4">
          <MediaGallery
            items={filteredItems.filter((item) => item.type === "gif")}
            onSelect={handleSelect}
            selectable
            loading={loading}
            maxHeight={500}
          />
        </TabsContent>
      </Tabs>

      {selectedItems.length > 0 && (
        <div className="flex items-center justify-between p-4 border-t">
          <div className="text-sm text-muted-foreground">
            {selectedItems.length} item{selectedItems.length !== 1 && "s"} selected
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setSelectedItems([])
                onSelect?.([])
              }}
            >
              Clear Selection
            </Button>
            <Button onClick={() => onSelect?.(selectedItems)}>
              Add to Post
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
