import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Button } from '@/components/ui/button'
import { useMediaStore } from '@/store/use-media-store'
import { AlertCircle, Loader2, Upload } from 'lucide-react'
import type { MediaItem } from '@/store/use-media-store'

interface MediaUploadsProps {
  maxSelection?: number
  mimeTypes?: string
  maxSize?: number // in bytes
  onSelect: (items: MediaItem[]) => void
}

export default function MediaUploads({
  maxSelection = 1,
  mimeTypes = '',
  maxSize = 5 * 1024 * 1024, // 5MB default
  onSelect
}: MediaUploadsProps) {
  const [selected, setSelected] = useState<MediaItem[]>([])
  const [uploadError, setUploadError] = useState<string | null>(null)
  const { uploadMedia, isLoading, items, error } = useMediaStore()

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    setUploadError(null)
    try {
      const file = acceptedFiles[0] // Upload one file at a time for now
      
      // Validate file size
      if (file.size > maxSize) {
        throw new Error(`File size must be less than ${Math.round(maxSize / (1024 * 1024))}MB`)
      }

      // Validate file type if mimeTypes is specified
      if (mimeTypes && !mimeTypes.split(',').some(type => file.type.match(new RegExp(type.trim().replace('*', '.*'))))) {
        throw new Error(`File type must be ${mimeTypes.split(',').join(' or ')}`)
      }

      await uploadMedia(file)
      
      // Auto-select the most recently uploaded item if we're under maxSelection
      const remainingSlots = maxSelection - selected.length
      if (remainingSlots > 0 && items.length > 0) {
        const latestItem = items[items.length - 1]
        const newSelected = [...selected, latestItem]
        setSelected(newSelected)
        onSelect(newSelected)
      }
    } catch (error) {
      console.error('Failed to upload media:', error)
      setUploadError(error instanceof Error ? error.message : 'Failed to upload media')
    }
  }, [uploadMedia, maxSelection, selected, onSelect, items, maxSize, mimeTypes])

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: mimeTypes ? { [mimeTypes]: [] } : undefined,
    maxFiles: 1, // Only allow one file at a time for now
    multiple: false,
    maxSize
  })

  const toggleSelect = useCallback((item: MediaItem) => {
    setSelected(prev => {
      const isSelected = prev.some(sel => sel.id === item.id)
      
      if (isSelected) {
        const newSelected = prev.filter(sel => sel.id !== item.id)
        onSelect(newSelected)
        return newSelected
      }

      if (prev.length >= maxSelection) {
        const newSelected = [...prev.slice(1), item]
        onSelect(newSelected)
        return newSelected
      }

      const newSelected = [...prev, item]
      onSelect(newSelected)
      return newSelected
    })
  }, [maxSelection, onSelect])

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`
          relative flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 transition-colors
          ${isDragActive && !isDragReject ? 'border-primary bg-primary/5' : ''}
          ${isDragReject ? 'border-destructive bg-destructive/5' : ''}
          ${!isDragActive && !isDragReject ? 'border-muted-foreground/25 hover:bg-muted/50' : ''}
        `}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center gap-2">
          <Upload className={`h-8 w-8 ${isDragReject ? 'text-destructive' : 'text-muted-foreground'}`} />
          <div className="text-center">
            <p className="text-sm font-medium">
              {isDragActive && !isDragReject ? 'Drop files here' : isDragReject ? 'File not allowed' : 'Drag & drop files here'}
            </p>
            <p className="text-xs text-muted-foreground">
              {`or click to select files (max ${Math.round(maxSize / (1024 * 1024))}MB)`}
            </p>
            {mimeTypes && (
              <p className="mt-1 text-xs text-muted-foreground">
                Allowed types: {mimeTypes.split(',').join(', ')}
              </p>
            )}
          </div>
        </div>
      </div>

      {(error || uploadError) && (
        <div className="flex items-center gap-2 rounded-md bg-destructive/10 p-2 text-sm text-destructive">
          <AlertCircle className="h-4 w-4" />
          <span>{error || uploadError}</span>
        </div>
      )}

      {isLoading && (
        <div className="flex h-32 items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      )}

      {!isLoading && items.length === 0 && (
        <div className="flex h-32 items-center justify-center text-sm text-muted-foreground">
          No media uploaded yet
        </div>
      )}

      {!isLoading && items.length > 0 && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {items.map((item) => {
            const isSelected = selected.some((sel) => sel.id === item.id)

            return (
              <button
                key={item.id}
                type="button"
                className={`group relative overflow-hidden rounded-lg border transition-all hover:border-primary/50 ${
                  isSelected ? 'border-primary ring-1 ring-primary' : 'border-border'
                }`}
                onClick={() => toggleSelect(item)}
              >
                <div className="relative aspect-square">
                  <img
                    src={item.thumbnailUrl || item.url}
                    alt={item.title || 'Uploaded media'}
                    className={`absolute inset-0 h-full w-full object-cover transition-opacity ${
                      isSelected ? 'opacity-100' : 'group-hover:opacity-90'
                    }`}
                  />
                  {isSelected && (
                    <div className="absolute inset-0 bg-primary/10" />
                  )}
                </div>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
