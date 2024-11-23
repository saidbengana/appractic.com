import * as React from "react"
import { useState } from "react"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { Search } from "lucide-react"
import { useDebounce } from "@/hooks/use-debounce"
import { ScrollArea } from "@/components/ui/scroll-area"

interface EmojiCategory {
  name: string
  emojis: Emoji[]
}

interface Emoji {
  id: string
  native: string
  unified: string
  shortName: string
}

interface MediaEmojiProps {
  categories: EmojiCategory[]
  onSelect?: (emoji: Emoji) => void
  className?: string
}

export function MediaEmoji({
  categories,
  onSelect,
  className,
}: MediaEmojiProps) {
  const [query, setQuery] = useState("")
  const debouncedQuery = useDebounce(query, 300)

  const filteredCategories = React.useMemo(() => {
    if (!debouncedQuery) return categories

    return categories.map(category => ({
      ...category,
      emojis: category.emojis.filter(emoji =>
        emoji.shortName.toLowerCase().includes(debouncedQuery.toLowerCase())
      ),
    })).filter(category => category.emojis.length > 0)
  }, [categories, debouncedQuery])

  return (
    <div className={cn("space-y-4", className)}>
      <div className="relative">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search emojis..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-8"
        />
      </div>

      <ScrollArea className="h-[400px] pr-4">
        <div className="space-y-6">
          {filteredCategories.map((category) => (
            <div key={category.name}>
              <h3 className="mb-2 text-sm font-medium text-foreground">
                {category.name}
              </h3>
              <div className="grid grid-cols-8 gap-2">
                {category.emojis.map((emoji) => (
                  <button
                    key={emoji.id}
                    onClick={() => onSelect?.(emoji)}
                    className={cn(
                      "flex h-8 w-8 items-center justify-center rounded-md text-lg",
                      "hover:bg-accent hover:text-accent-foreground",
                      "focus-visible:outline-none focus-visible:ring-1",
                      "focus-visible:ring-ring"
                    )}
                    title={emoji.shortName}
                  >
                    {emoji.native}
                  </button>
                ))}
              </div>
            </div>
          ))}

          {filteredCategories.length === 0 && (
            <div className="flex justify-center py-8 text-muted-foreground">
              No emojis found
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  )
}
