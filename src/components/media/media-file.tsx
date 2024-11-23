import { useMemo } from 'react'
import { cn } from '@/lib/utils'
import { ExclamationCircleIcon } from '@/components/icons/exclamation-circle'
import { VideoSolidIcon } from '@/components/icons/video-solid'

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
            <VideoSolidIcon className="w-4 h-4 text-white" />
          </span>
        )}

        {media.error ? (
          <div className="text-center">
            <ExclamationCircleIcon className="w-8 h-8 mx-auto text-red-500" />
            <div className="mt-2">{media.name}</div>
            <div className="mt-2 text-red-500">
              {media.error || 'Error uploading media'}
            </div>
          </div>
        ) : (
          <img
            src={media.thumb_url}
            loading="lazy"
            alt="Media preview"
            className={cn(
              'rounded object-cover',
              imgHeightClass,
              imgWidthFull ? 'w-full' : ''
            )}
          />
        )}
      </div>
    </figure>
  )
}
