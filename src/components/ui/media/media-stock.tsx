import * as React from "react"
import { useCallback, useState } from "react"
import { Input } from "@/components/ui/input"
import { MediaSelectable } from "./media-selectable"
import { cn } from "@/lib/utils"
import { Loader2, Search } from "lucide-react"
import { useDebounce } from "@/hooks/use-debounce"
import Masonry from "react-masonry-css"

interface StockImage {
  id: string
  title: string
  url: string
  preview: string
  author: string
  source: string
}

interface MediaStockProps {
  maxSelection?: number
  selected?: StockImage[]
  toggleSelect?: (image: StockImage) => void
  isSelected?: (image: StockImage) => boolean
  onSearch?: (query: string) => Promise<StockImage[]>
  className?: string
}

export function MediaStock({
  maxSelection = Infinity,
  selected = [],
  toggleSelect,
  isSelected,
  onSearch,
  className,
}: MediaStockProps) {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<StockImage[]>([])
  const [loading, setLoading] = useState(false)
  const debouncedQuery = useDebounce(query, 500)

  const searchStockImages = useCallback(async (searchQuery: string) => {
    if (!onSearch) return
    setLoading(true)
    try {
      const searchResults = await onSearch(searchQuery)
      setResults(searchResults)
    } catch (error) {
      console.error("Error searching stock images:", error)
      setResults([])
    } finally {
      setLoading(false)
    }
  }, [onSearch])

  React.useEffect(() => {
    if (debouncedQuery) {
      searchStockImages(debouncedQuery)
    } else {
      setResults([])
    }
  }, [debouncedQuery, searchStockImages])

  const handleSelect = (image: StockImage) => {
    if (!toggleSelect) return
    if (selected.length >= maxSelection && !isSelected?.(image)) return
    toggleSelect(image)
  }

  return (
    <div className={cn("space-y-4", className)}>
      <div className="relative">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search stock images..."
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
          {results.map((image) => (
            <div key={image.id} className="mb-4">
              <MediaSelectable
                src={image.preview}
                alt={image.title}
                selected={isSelected?.(image)}
                onClick={() => handleSelect(image)}
                className="cursor-pointer"
              />
              <div className="mt-1 text-xs text-muted-foreground">
                by {image.author} on {image.source}
              </div>
            </div>
          ))}
        </Masonry>
      )}

      {!loading && query && results.length === 0 && (
        <div className="flex justify-center py-8 text-muted-foreground">
          No stock images found
        </div>
      )}

      {!loading && !query && (
        <div className="flex justify-center py-8 text-muted-foreground">
          Search for stock images
        </div>
      )}
    </div>
  )
}
