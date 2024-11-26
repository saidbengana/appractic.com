import { useMemo } from 'react'
import { cn } from '@/lib/utils'
import { AlertTriangle, Video } from 'lucide-react'

interface MediaFileProps {
  media: {
    thumb_url: string
    is_video?: boolean
    error?: string
    name?: string
  }
  imgHeight?: 'full' | 'sm'
  imgWidthFull?: boolean
  children?: React.ReactNode
}

const heightClasses = {
  full: 'h-full',
  sm: 'h-20'
} as const

export function MediaFile({ 
  media, 
  imgHeight = 'full', 
  imgWidthFull = true,
  children 
}: MediaFileProps) {
  const imgHeightClass = heightClasses[imgHeight]

  return (
    <figure className="relative">
      {children}
      <div
        className={cn(
          'relative flex rounded',
          media.error && 'border border-red-500 p-5'
        )}
      >
        {media.is_video && (
          <span className="absolute top-0 right-0 mt-1 mr-1">
            <Video className="h-4 w-4 text-white" />
          </span>
        )}

        {media.error ? (
          <div className="text-center">
            <AlertTriangle className="mx-auto h-8 w-8 text-red-500" />
            <div className="mt-2">{media.name}</div>
            <div className="mt-2 text-red-500">
              {media.error || 'Error uploading media'}
            </div>
          </div>
        ) : (
          <img
            src={media.thumb_url}
            alt={media.name}
            className={cn(
              'rounded object-cover',
              imgHeightClass,
              imgWidthFull && 'w-full'
            )}
          />
        )}
      </div>
    </figure>
  )
}
