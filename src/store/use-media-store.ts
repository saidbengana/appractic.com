import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

export interface MediaItem {
  id: string
  type: 'image' | 'gif' | 'video'
  url: string
  thumbnailUrl?: string
  title?: string
  source: 'upload' | 'tenor' | 'unsplash'
  createdAt: Date
  metadata?: Record<string, any>
}

interface TenorSearchResult {
  id: string
  title: string
  media_formats: {
    gif: { url: string }
    tinygif: { url: string }
  }
}

interface MediaState {
  items: MediaItem[]
  searchResults: MediaItem[]
  isLoading: boolean
  error: string | null
  searchQuery: string
  // Actions
  setItems: (items: MediaItem[]) => void
  addItem: (item: MediaItem) => void
  removeItem: (id: string) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  setSearchQuery: (query: string) => void
  setSearchResults: (results: MediaItem[]) => void
  searchTenor: (query: string) => Promise<void>
  uploadMedia: (file: File) => Promise<void>
}

const TENOR_API_KEY = process.env.NEXT_PUBLIC_TENOR_API_KEY || 'YOUR_TENOR_API_KEY'
const TENOR_API_BASE = 'https://tenor.googleapis.com/v2'

export const useMediaStore = create<MediaState>()(
  devtools((set, get) => ({
    items: [],
    searchResults: [],
    isLoading: false,
    error: null,
    searchQuery: '',

    setItems: (items) => set({ items }),
    addItem: (item) => set((state) => ({ items: [...state.items, item] })),
    removeItem: (id) =>
      set((state) => ({
        items: state.items.filter((item) => item.id !== id),
      })),
    setLoading: (loading) => set({ isLoading: loading }),
    setError: (error) => set({ error }),
    setSearchQuery: (query) => set({ searchQuery: query }),
    setSearchResults: (results) => set({ searchResults: results }),

    searchTenor: async (query: string) => {
      const state = get()
      if (!query.trim()) {
        set({ searchResults: [] })
        return
      }

      set({ isLoading: true, error: null })
      try {
        const response = await fetch(
          `${TENOR_API_BASE}/search?q=${encodeURIComponent(
            query
          )}&key=${TENOR_API_KEY}&client_key=appractic&limit=20`
        )
        
        if (!response.ok) {
          throw new Error('Failed to fetch from Tenor')
        }

        const data = await response.json()
        const results: MediaItem[] = data.results.map((result: TenorSearchResult) => ({
          id: result.id,
          type: 'gif',
          url: result.media_formats.gif.url,
          thumbnailUrl: result.media_formats.tinygif.url,
          title: result.title,
          source: 'tenor',
          createdAt: new Date(),
        }))

        set({ searchResults: results, isLoading: false })
      } catch (error) {
        set({
          error: (error as Error).message,
          isLoading: false,
        })
      }
    },

    uploadMedia: async (file: File) => {
      set({ isLoading: true, error: null })
      try {
        // TODO: Implement actual file upload logic
        const formData = new FormData()
        formData.append('file', file)

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        })

        if (!response.ok) {
          throw new Error('Failed to upload file')
        }

        const data = await response.json()
        const newItem: MediaItem = {
          id: data.id,
          type: file.type.startsWith('image/') ? 'image' : 'video',
          url: data.url,
          source: 'upload',
          createdAt: new Date(),
        }

        set((state) => ({
          items: [...state.items, newItem],
          isLoading: false,
        }))
      } catch (error) {
        set({
          error: (error as Error).message,
          isLoading: false,
        })
      }
    },
  }))
)
