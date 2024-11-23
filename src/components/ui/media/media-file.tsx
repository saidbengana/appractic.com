import * as React from "react"
import { cn } from "@/lib/utils"
import { Video, AlertCircle } from "lucide-react"

interface MediaFileProps {
  media: {
    is_video?: boolean
    thumb_url?: string
    name?: string
    error?: string
  }
  imgHeight?: "full" | "sm"
  imgWidthFull?: boolean
  children?: React.ReactNode
}

export function MediaFile({
  media,
  imgHeight = "full",
  imgWidthFull = true,
  children,
}: MediaFileProps) {
  const imgHeightClass = {
    full: "h-full",
    sm: "h-20",
  }[imgHeight]

  return (
    <figure className="relative">
      {children}
      <div
        className={cn("relative flex rounded", {
          "border border-red-500 p-5": "error" in media,
        })}
      >
        {media.is_video && (
          <span className="absolute top-0 right-0 mt-1 mr-1">
            <Video className="w-4 h-4 text-white" />
          </span>
        )}

        {"error" in media ? (
          <div className="text-center">
            <AlertCircle className="w-8 h-8 mx-auto text-red-500" />
            <div className="mt-2">{media.name}</div>
            <div className="mt-2 text-red-500">
              {media.error || "Error uploading media"}
            </div>
          </div>
        ) : (
          <img
            src={media.thumb_url}
            loading="lazy"
            alt="Image"
            className={cn(
              "rounded object-cover",
              imgHeightClass,
              imgWidthFull && "w-full"
            )}
          />
        )}
      </div>
    </figure>
  )
}
