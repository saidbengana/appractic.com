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
  const { searchGifs, isSearching, gifs } = useMediaStore()

  useEffect(() => {
    if (debouncedSearch) {
      searchGifs(debouncedSearch)
    }
  }, [debouncedSearch, searchGifs])

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
      <Input
        type="search"
        placeholder="Search GIFs..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {isSearching ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {gifs.map((gif) => {
            const isSelected = selected.some(item => item.id === gif.id)
            
            return (
              <div
                key={gif.id}
                className={`relative cursor-pointer overflow-hidden rounded-lg border-2 transition-colors ${
                  isSelected ? 'border-primary' : 'border-transparent hover:border-gray-200'
                }`}
                onClick={() => toggleSelect(gif)}
              >
                <img
                  src={gif.preview_url}
                  alt={gif.title}
                  className="aspect-video w-full object-cover"
                  loading="lazy"
                />
                {isSelected && (
                  <div className="absolute inset-0 flex items-center justify-center bg-primary/20">
                    <div className="rounded-full bg-primary p-1 text-white">
                      {selected.findIndex(item => item.id === gif.id) + 1}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {!isSearching && gifs.length === 0 && search && (
        <div className="flex h-64 items-center justify-center text-gray-500">
          No GIFs found
        </div>
      )}

      {!search && (
        <div className="flex h-64 items-center justify-center text-gray-500">
          Search for GIFs to display results
        </div>
      )}
    </div>
  )
}
