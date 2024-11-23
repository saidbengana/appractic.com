import { useState, useMemo, useCallback, useEffect } from "react"
import { difference, first, random } from "lodash"
import { useRouter } from "next/navigation"
import { usePost } from "@/hooks/use-post"
import { decomposeString } from "@/lib/utils"
import { COLOR_PALLET_LIST } from "@/lib/constants"
import { Tag } from "@/components/ui/tag"
import { TagIcon, X as XIcon } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { api } from "@/lib/api"

interface TagItem {
  id: string
  name: string
  hex_color: string
}

interface PostTagsProps {
  items: TagItem[]
  onUpdate: (items: TagItem[]) => void
  className?: string
  maxTags?: number
}

export function PostTags({ 
  items, 
  onUpdate,
  className,
  maxTags = Infinity 
}: PostTagsProps) {
  const router = useRouter()
  const { toast } = useToast()
  const { editAllowed } = usePost()
  const [showManager, setShowManager] = useState(false)
  const [searchText, setSearchText] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [tags, setTags] = useState<TagItem[]>([])
  const [isFetching, setIsFetching] = useState(false)

  // Fetch tags when dialog opens
  useEffect(() => {
    if (showManager) {
      fetchTags()
    }
  }, [showManager])

  const fetchTags = async () => {
    try {
      setIsFetching(true)
      const response = await api.get("/tags")
      setTags(response.data)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch tags",
        variant: "destructive",
      })
    } finally {
      setIsFetching(false)
    }
  }

  const availableTags = useMemo(() => {
    return tags.filter((tag) => {
      const search = decomposeString(tag.name)
        .toLowerCase()
        .includes(searchText.toLowerCase())

      return !items.some((item) => item.id === tag.id) && search
    })
  }, [tags, items, searchText])

  const canAddMoreTags = items.length < maxTags

  const openManager = () => {
    if (!canAddMoreTags) {
      toast({
        title: "Maximum tags reached",
        description: `You can only add up to ${maxTags} tags`,
        variant: "destructive",
      })
      return
    }
    setShowManager(true)
  }

  const closeManager = () => {
    setShowManager(false)
    setSearchText("")
  }

  const select = useCallback(
    (tag: TagItem, event: React.MouseEvent | null = null) => {
      if (!canAddMoreTags) {
        toast({
          title: "Maximum tags reached",
          description: `You can only add up to ${maxTags} tags`,
          variant: "destructive",
        })
        return
      }

      if (!event || (event && !event.target.closest(".tag-actions"))) {
        onUpdate([...items, tag])
        if (items.length + 1 === maxTags) {
          closeManager()
        }
      }
    },
    [items, onUpdate, canAddMoreTags, maxTags]
  )

  const remove = useCallback(
    (tag: TagItem) => {
      onUpdate(items.filter((item) => item.id !== tag.id))
    },
    [items, onUpdate]
  )

  const store = async () => {
    if (isLoading || !searchText || !canAddMoreTags) {
      return
    }

    // Avoid duplicate tags with the same name
    const existingTag = availableTags.find(
      tag => decomposeString(tag.name) === decomposeString(searchText)
    )
    
    if (existingTag) {
      setSearchText("")
      select(existingTag)
      return
    }

    const pickRandomColor = () => {
      const colorList = COLOR_PALLET_LIST()
      const nonUsedColors = difference(
        colorList,
        tags.map((tag) => tag.hex_color)
      )

      if (!nonUsedColors.length) {
        return colorList[random(0, colorList.length - 1)]
      }

      return nonUsedColors[random(0, nonUsedColors.length - 1)]
    }

    try {
      setIsLoading(true)
      const response = await api.post("/tags", {
        name: searchText,
        hex_color: pickRandomColor(),
      })

      const newTag = response.data
      setSearchText("")
      select(newTag)
      setTags(prev => [...prev, newTag])
      toast({
        title: "Success",
        description: "Tag created successfully",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to create tag",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault()
      store()
    } else if (e.key === "Escape") {
      closeManager()
    }
  }

  return (
    <div className={className}>
      <div className="flex items-center">
        <div className="hidden lg:flex items-center space-x-2 mr-2">
          {items.map((item) => (
            <Tag
              key={item.id}
              item={item}
              removable={editAllowed}
              onRemove={() => remove(item)}
              aria-label={`Remove ${item.name} tag`}
            />
          ))}
        </div>

        {editAllowed && (
          <Button
            variant="secondary"
            size="sm"
            onClick={openManager}
            disabled={!canAddMoreTags}
            title={!canAddMoreTags ? `Maximum ${maxTags} tags allowed` : "Manage labels"}
          >
            <TagIcon className="lg:mr-2 h-4 w-4" />
            <span className="hidden lg:block">
              Labels {items.length > 0 && `(${items.length}${maxTags < Infinity ? `/${maxTags}` : ""})`}
            </span>
          </Button>
        )}
      </div>

      <Dialog open={showManager} onOpenChange={setShowManager}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Labels</DialogTitle>
            {maxTags < Infinity && (
              <DialogDescription>
                You can add up to {maxTags} tags ({items.length} used)
              </DialogDescription>
            )}
          </DialogHeader>

          <div className="relative">
            {(isLoading || isFetching) && (
              <div className="absolute inset-0 bg-white/50 flex items-center justify-center z-50">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            )}

            <div className="flex flex-wrap items-center gap-2">
              {items.map((item) => (
                <Tag
                  key={item.id}
                  item={item}
                  onRemove={() => remove(item)}
                  aria-label={`Remove ${item.name} tag`}
                />
              ))}
            </div>

            <div className="mt-2">
              <Input
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                onKeyDown={handleKeyDown}
                type="text"
                autoFocus
                placeholder="Search or Create New"
                className="w-full"
                aria-label="Search or create new tag"
                disabled={isLoading || !canAddMoreTags}
              />
            </div>

            {availableTags.length > 0 && (
              <div className="mt-2 border border-gray-300 rounded-md" role="listbox">
                {availableTags.map((item) => (
                  <div
                    key={item.id}
                    onClick={(e) => select(item, e)}
                    onKeyDown={(e) => e.key === "Enter" && select(item, null)}
                    tabIndex={0}
                    role="option"
                    aria-selected={items.some(i => i.id === item.id)}
                    className="flex items-center justify-between p-2 rounded-t-md last:rounded-t-none last:rounded-b-md border-b last:border-none hover:bg-gray-100 transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                  >
                    <Tag item={item} removable={false} />
                  </div>
                ))}
              </div>
            )}

            {searchText && (
              <div className="mt-4 text-stone-800 italic" role="status">
                Press Enter to create a new label
              </div>
            )}

            {isFetching && availableTags.length === 0 && (
              <div className="mt-4 text-center text-stone-800" role="status">
                Loading tags...
              </div>
            )}

            {!isFetching && !isLoading && searchText && availableTags.length === 0 && (
              <div className="mt-4 text-center text-stone-800" role="status">
                No matching tags found. Press Enter to create a new one.
              </div>
            )}
          </div>

          <DialogFooter className="sm:justify-between">
            <div className="text-sm text-muted-foreground">
              {maxTags < Infinity && (
                <span>{maxTags - items.length} tags remaining</span>
              )}
            </div>
            <Button variant="secondary" onClick={closeManager}>
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
