import { useState, useCallback, useEffect } from 'react'
import { useToast } from '@/components/ui/use-toast'

export type MediaItem = {
  id: string
  url: string
  type: string
  name: string
  size: number
  created_at: string
  error?: string
}

export type MediaTab = 'uploads' | 'stock' | 'gifs'

interface UseMediaOptions {
  initialTab?: MediaTab
  endpoint?: string
}

export function useMedia({ initialTab = 'uploads', endpoint = '/api/media' }: UseMediaOptions = {}) {
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState<MediaTab>(initialTab)
  const [isLoading, setIsLoading] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [page, setPage] = useState(1)
  const [items, setItems] = useState<MediaItem[]>([])
  const [hasMore, setHasMore] = useState(true)
  const [keyword, setKeyword] = useState('')
  const [selected, setSelected] = useState<MediaItem[]>([])

  const tabs = {
    uploads: 'Upload',
    stock: 'Stock Photos',
    gifs: 'GIFs',
  }

  const toggleSelect = useCallback((media: MediaItem) => {
    setSelected((prev) => {
      const index = prev.findIndex((item) => item.id === media.id)
      if (index < 0 && !media.error) {
        return [...prev, media]
      }
      if (index >= 0) {
        return prev.filter((_, i) => i !== index)
      }
      return prev
    })
  }, [])

  const deselectAll = useCallback(() => {
    setSelected([])
  }, [])

  const isSelected = useCallback((media: MediaItem) => {
    return selected.some((item) => item.id === media.id)
  }, [selected])

  const fetchItems = useCallback(async (appendResult = true) => {
    if (!hasMore && appendResult) return

    setIsLoading(true)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        keyword,
        type: activeTab,
      })

      const response = await fetch(\`\${endpoint}?\${params}\`)
      if (!response.ok) throw new Error('Failed to fetch media')

      const data = await response.json()
      const nextPage = data.next_page

      setHasMore(!!nextPage)
      setPage(nextPage || page)
      setItems((prev) => (appendResult ? [...prev, ...data.items] : data.items))
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to fetch media. Please try again.',
      })
    } finally {
      setIsLoading(false)
    }
  }, [endpoint, page, keyword, activeTab, hasMore, toast])

  const downloadExternal = useCallback(async (itemsToDownload: MediaItem[]) => {
    setIsDownloading(true)
    try {
      const response = await fetch(\`\${endpoint}/download\`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: itemsToDownload,
          from: activeTab,
        }),
      })

      if (!response.ok) throw new Error('Failed to download media')

      const data = await response.json()
      return data
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to download media. Please try again.',
      })
      return null
    } finally {
      setIsDownloading(false)
    }
  }, [endpoint, activeTab, toast])

  const deleteItems = useCallback(async (itemsToDelete: MediaItem[]) => {
    setIsDeleting(true)
    try {
      const response = await fetch(\`\${endpoint}\`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: itemsToDelete.map((item) => item.id),
        }),
      })

      if (!response.ok) throw new Error('Failed to delete media')

      setItems((prev) =>
        prev.filter((item) => !itemsToDelete.some((del) => del.id === item.id))
      )
      setSelected((prev) =>
        prev.filter((item) => !itemsToDelete.some((del) => del.id === item.id))
      )

      toast({
        title: 'Success',
        description: 'Media deleted successfully.',
      })
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to delete media. Please try again.',
      })
    } finally {
      setIsDeleting(false)
    }
  }, [endpoint, toast])

  const uploadFiles = useCallback(async (files: File[]) => {
    const formData = new FormData()
    files.forEach((file) => formData.append('files[]', file))

    try {
      const response = await fetch(\`\${endpoint}/upload\`, {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) throw new Error('Failed to upload files')

      const data = await response.json()
      setItems((prev) => [...data.items, ...prev])

      toast({
        title: 'Success',
        description: 'Files uploaded successfully.',
      })
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to upload files. Please try again.',
      })
    }
  }, [endpoint, toast])

  // Fetch initial items
  useEffect(() => {
    fetchItems(false)
  }, [activeTab, keyword])

  return {
    activeTab,
    setActiveTab,
    isLoading,
    isDownloading,
    isDeleting,
    items,
    hasMore,
    keyword,
    setKeyword,
    selected,
    tabs,
    toggleSelect,
    deselectAll,
    isSelected,
    fetchItems,
    downloadExternal,
    deleteItems,
    uploadFiles,
  }
}
