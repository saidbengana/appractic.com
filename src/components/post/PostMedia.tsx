'use client'

import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface PostMediaProps {
  items: any[]
  onRemove: (index: number) => void
}

export default function PostMedia({ items, onRemove }: PostMediaProps) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
      {items.map((item, index) => {
        const isImage = item.mime_type?.startsWith('image/') ?? 
          item.url.match(/\.(jpg|jpeg|png|gif|webp)$/i)

        return (
          <div
            key={item.id || index}
            className="group relative aspect-video overflow-hidden rounded-lg border bg-muted"
          >
            {isImage ? (
              <img
                src={item.url}
                alt={item.name || 'Media item'}
                className="h-full w-full object-cover"
              />
            ) : (
              <video
                src={item.url}
                className="h-full w-full object-cover"
                muted
                loop
                playsInline
              />
            )}

            <Button
              variant="destructive"
              size="icon"
              className="absolute right-2 top-2 h-6 w-6 opacity-0 transition-opacity group-hover:opacity-100"
              onClick={() => onRemove(index)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )
      })}
    </div>
  )
}
