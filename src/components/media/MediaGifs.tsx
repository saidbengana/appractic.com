'use client'

import { useState, useEffect, useCallback } from 'react'
import { Input } from '@/components/ui/input'
import { useDebounce } from '@/hooks/use-debounce'
import { useMediaStore } from '@/store/use-media-store'
import { Loader2 } from 'lucide-react'

interface MediaGifsProps {
  maxSelection?: number
  onSelect: (items: any[]) => void
}

export default function MediaGifs({
  maxSelection = 1,
  onSelect
}: MediaGifsProps) {
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<any[]>([])
  const debouncedSearch = useDebounce(search, 500)
  const { searchTenor, isLoading, searchResults } = useMediaStore()

  useEffect(() => {
    if (debouncedSearch) {
      searchTenor(debouncedSearch)
    }
  }, [debouncedSearch, searchTenor])

  const toggleSelect = useCallback((gif: any) => {
    setSelected(prev => {
      const isSelected = prev.some(item => item.id === gif.id)
      
      if (isSelected) {
        const newSelected = prev.filter(item => item.id !== gif.id)
        onSelect(newSelected)
        return newSelected
      }

      if (prev.length >= maxSelection) {
        const newSelected = [...prev.slice(1), gif]
        onSelect(newSelected)
        return newSelected
      }

      const newSelected = [...prev, gif]
      onSelect(newSelected)
      return newSelected
    })
  }, [maxSelection, onSelect])

  return (
    <div className="space-y-4">
      <div className="sticky top-0 z-10 bg-background pb-4">
        <Input
          type="search"
          placeholder="Search GIFs..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {isLoading && (
        <div className="flex h-32 items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      )}

      {!isLoading && searchResults.length === 0 && debouncedSearch && (
        <div className="flex h-32 items-center justify-center text-sm text-muted-foreground">
          No GIFs found
        </div>
      )}

      {!isLoading && searchResults.length > 0 && (
        <div className="grid grid-cols-2 gap-4">
          {searchResults.map((gif) => {
            const isSelected = selected.some((item) => item.id === gif.id)

            return (
              <button
                key={gif.id}
                type="button"
                className={`relative overflow-hidden rounded-lg border ${
                  isSelected ? 'border-primary' : 'border-border'
                }`}
                onClick={() => toggleSelect(gif)}
              >
                <div className="relative aspect-video">
                  <img
                    src={gif.thumbnailUrl || gif.url}
                    alt={gif.title || 'GIF'}
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                </div>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
