import * as React from "react"
import { useCallback, useState } from "react"
import { Input } from "@/components/ui/input"
import { MediaSelectable } from "./media-selectable"
import { cn } from "@/lib/utils"
import { Loader2, Search } from "lucide-react"
import { useDebounce } from "@/hooks/use-debounce"
import Masonry from "react-masonry-css"

interface GifResult {
  id: string
  title: string
  url: string
  preview: string
}

interface MediaGifsProps {
  maxSelection?: number
  selected?: GifResult[]
  toggleSelect?: (gif: GifResult) => void
  isSelected?: (gif: GifResult) => boolean
  onSearch?: (query: string) => Promise<GifResult[]>
  className?: string
}

export function MediaGifs({
  maxSelection = Infinity,
  selected = [],
  toggleSelect,
  isSelected,
  onSearch,
  className,
}: MediaGifsProps) {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<GifResult[]>([])
  const [loading, setLoading] = useState(false)
  const debouncedQuery = useDebounce(query, 500)

  const searchGifs = useCallback(async (searchQuery: string) => {
    if (!onSearch) return
    setLoading(true)
    try {
      const searchResults = await onSearch(searchQuery)
      setResults(searchResults)
    } catch (error) {
      console.error("Error searching gifs:", error)
      setResults([])
    } finally {
      setLoading(false)
    }
  }, [onSearch])

  React.useEffect(() => {
    if (debouncedQuery) {
      searchGifs(debouncedQuery)
    } else {
      setResults([])
    }
  }, [debouncedQuery, searchGifs])

  const handleSelect = (gif: GifResult) => {
    if (!toggleSelect) return
    if (selected.length >= maxSelection && !isSelected?.(gif)) return
    toggleSelect(gif)
  }

  return (
    <div className={cn("space-y-4", className)}>
      <div className="relative">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search GIFs..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-8"
        />
      </div>

      {loading && (
        <div className="flex justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      )}

      {!loading && results.length > 0 && (
        <Masonry
          breakpointCols={{
            default: 3,
            1024: 2,
            640: 1,
          }}
          className="flex -ml-4 w-auto"
          columnClassName="pl-4 bg-clip-padding"
        >
          {results.map((gif) => (
            <div key={gif.id} className="mb-4">
              <MediaSelectable
                src={gif.preview}
                alt={gif.title}
                selected={isSelected?.(gif)}
                onClick={() => handleSelect(gif)}
                className="cursor-pointer"
              />
            </div>
          ))}
        </Masonry>
      )}

      {!loading && query && results.length === 0 && (
        <div className="flex justify-center py-8 text-muted-foreground">
          No GIFs found
        </div>
      )}

      {!loading && !query && (
        <div className="flex justify-center py-8 text-muted-foreground">
          Search for GIFs
        </div>
      )}
    </div>
  )
}
