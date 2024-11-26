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

interface ExternalMediaItem {
  id: string
  url: string
  downloadData?: Record<string, any>
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
  isDownloading: boolean
  error: string | null
  searchQuery: string
  // Actions
  setItems: (items: MediaItem[]) => void
  addItem: (item: MediaItem) => void
  removeItem: (id: string) => void
  setLoading: (loading: boolean) => void
  setDownloading: (downloading: boolean) => void
  setError: (error: string | null) => void
  setSearchQuery: (query: string) => void
  setSearchResults: (results: MediaItem[]) => void
  searchTenor: (query: string) => Promise<void>
  uploadMedia: (file: File) => Promise<void>
  downloadExternalMedia: (items: ExternalMediaItem[]) => Promise<MediaItem[]>
}

const TENOR_API_KEY = process.env.NEXT_PUBLIC_TENOR_API_KEY || 'YOUR_TENOR_API_KEY'
const TENOR_API_BASE = 'https://tenor.googleapis.com/v2'

export const useMediaStore = create<MediaState>()(
  devtools((set, get) => ({
    items: [],
    searchResults: [],
    isLoading: false,
    isDownloading: false,
    error: null,
    searchQuery: '',

    setItems: (items) => set({ items }),
    addItem: (item) => set((state) => ({ items: [...state.items, item] })),
    removeItem: (id) => set((state) => ({
      items: state.items.filter((item) => item.id !== id)
    })),
    setLoading: (loading) => set({ isLoading: loading }),
    setDownloading: (downloading) => set({ isDownloading: downloading }),
    setError: (error) => set({ error }),
    setSearchQuery: (query) => set({ searchQuery: query }),
    setSearchResults: (results) => set({ searchResults: results }),

    searchTenor: async (query: string) => {
      const state = get()
      if (!query.trim()) {
        state.setSearchResults([])
        return
      }

      state.setLoading(true)
      state.setError(null)

      try {
        const response = await fetch(
          `${TENOR_API_BASE}/search?q=${encodeURIComponent(
            query
          )}&key=${TENOR_API_KEY}&client_key=my_test_app&limit=20`
        )

        if (!response.ok) {
          throw new Error('Failed to fetch GIFs')
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
          metadata: {
            formats: result.media_formats
          }
        }))

        state.setSearchResults(results)
      } catch (error) {
        state.setError(error instanceof Error ? error.message : 'Failed to search GIFs')
      } finally {
        state.setLoading(false)
      }
    },

    uploadMedia: async (file: File) => {
      const state = get()
      state.setLoading(true)
      state.setError(null)

      try {
        // Here you would typically upload to your server or cloud storage
        // For now, we'll create a local URL
        const url = URL.createObjectURL(file)
        
        const newItem: MediaItem = {
          id: Math.random().toString(36).substring(7),
          type: file.type.startsWith('image/') ? 'image' : 'video',
          url,
          source: 'upload',
          createdAt: new Date(),
          metadata: {
            size: file.size,
            type: file.type
          }
        }

        state.addItem(newItem)
        return newItem
      } catch (error) {
        state.setError(error instanceof Error ? error.message : 'Failed to upload media')
        throw error
      } finally {
        state.setLoading(false)
      }
    },

    downloadExternalMedia: async (items: ExternalMediaItem[]) => {
      const state = get()
      state.setDownloading(true)
      state.setError(null)

      try {
        // Here you would typically download the external media to your server
        // For now, we'll just create MediaItems from the external items
        const downloadedItems: MediaItem[] = items.map(item => ({
          id: item.id,
          type: 'image', // You might want to determine this from the URL or metadata
          url: item.url,
          source: 'upload',
          createdAt: new Date(),
          metadata: item.downloadData
        }))

        // Add the downloaded items to the store
        downloadedItems.forEach(item => state.addItem(item))
        
        return downloadedItems
      } catch (error) {
        state.setError(error instanceof Error ? error.message : 'Failed to download media')
        throw error
      } finally {
        state.setDownloading(false)
      }
    }
  }))
)
