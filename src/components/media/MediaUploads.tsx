'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Button } from '@/components/ui/button'
import { useMediaStore } from '@/store/use-media-store'
import { Loader2, Upload } from 'lucide-react'

interface MediaUploadsProps {
  maxSelection?: number
  mimeTypes?: string
  onSelect: (items: any[]) => void
}

export default function MediaUploads({
  maxSelection = 1,
  mimeTypes = '',
  onSelect
}: MediaUploadsProps) {
  const [selected, setSelected] = useState<any[]>([])
  const { uploadMedia, isUploading, uploads } = useMediaStore()

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const uploaded = await uploadMedia(acceptedFiles)
    if (uploaded) {
      // Auto-select newly uploaded items if we're under maxSelection
      const remainingSlots = maxSelection - selected.length
      if (remainingSlots > 0) {
        const newSelected = [
          ...selected,
          ...uploaded.slice(0, remainingSlots)
        ]
        setSelected(newSelected)
        onSelect(newSelected)
      }
    }
  }, [uploadMedia, maxSelection, selected, onSelect])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: mimeTypes ? { [mimeTypes]: [] } : undefined,
    maxFiles: maxSelection
  })

  const toggleSelect = useCallback((item: any) => {
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
        className={`flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 transition-colors ${
          isDragActive ? 'border-primary bg-primary/5' : 'border-gray-300 hover:border-primary/50'
        }`}
      >
        <input {...getInputProps()} />
        <Upload className={`mb-2 h-8 w-8 ${isDragActive ? 'text-primary' : 'text-gray-400'}`} />
        <p className="text-sm text-gray-600">
          {isDragActive ? (
            'Drop the files here...'
          ) : (
            <>
              Drag & drop files here, or <Button variant="link" className="h-auto p-0">browse</Button>
            </>
          )}
        </p>
      </div>

      {isUploading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {uploads.map((item) => {
            const isSelected = selected.some(sel => sel.id === item.id)
            const isImage = item.mime_type.startsWith('image/')
            
            return (
              <div
                key={item.id}
                className={`relative cursor-pointer overflow-hidden rounded-lg border-2 transition-colors ${
                  isSelected ? 'border-primary' : 'border-transparent hover:border-gray-200'
                }`}
                onClick={() => toggleSelect(item)}
              >
                {isImage ? (
                  <img
                    src={item.url}
                    alt={item.name}
                    className="aspect-video w-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <video
                    src={item.url}
                    className="aspect-video w-full object-cover"
                    muted
                    loop
                    playsInline
                  />
                )}
                {isSelected && (
                  <div className="absolute inset-0 flex items-center justify-center bg-primary/20">
                    <div className="rounded-full bg-primary p-1 text-white">
                      {selected.findIndex(sel => sel.id === item.id) + 1}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {!isUploading && uploads.length === 0 && (
        <div className="flex h-64 items-center justify-center text-gray-500">
          No media files uploaded yet
        </div>
      )}
    </div>
  )
}
