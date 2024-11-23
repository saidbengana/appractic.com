import * as React from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Image, Video, Upload } from "lucide-react"

interface MediaItem {
  url: string
  type: "image" | "video"
  aspectRatio?: number
}

interface PostAddMediaProps {
  onMediaAdd: (media: MediaItem) => void
  disabled?: boolean
  className?: string
}

export function PostAddMedia({
  onMediaAdd,
  disabled = false,
  className,
}: PostAddMediaProps) {
  const [open, setOpen] = React.useState(false)
  const [url, setUrl] = React.useState("")
  const [type, setType] = React.useState<"image" | "video">("image")
  const [aspectRatio, setAspectRatio] = React.useState<number | undefined>(undefined)
  const [isLoading, setIsLoading] = React.useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!url || isLoading) return

    setIsLoading(true)
    try {
      // Load the media to get dimensions
      if (type === "image") {
        const img = new Image()
        img.src = url
        await new Promise((resolve, reject) => {
          img.onload = () => {
            setAspectRatio(img.width / img.height)
            resolve(null)
          }
          img.onerror = reject
        })
      } else if (type === "video") {
        const video = document.createElement("video")
        video.src = url
        await new Promise((resolve, reject) => {
          video.onloadedmetadata = () => {
            setAspectRatio(video.videoWidth / video.videoHeight)
            resolve(null)
          }
          video.onerror = reject
        })
      }

      onMediaAdd({
        url,
        type,
        aspectRatio,
      })

      setUrl("")
      setType("image")
      setAspectRatio(undefined)
      setOpen(false)
    } catch (error) {
      console.error("Error loading media:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn(
            "flex items-center space-x-2",
            disabled && "opacity-50 cursor-not-allowed",
            className
          )}
          disabled={disabled}
        >
          <Upload className="h-4 w-4" />
          <span>Add Media</span>
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Media</DialogTitle>
          <DialogDescription>
            Add an image or video to your post. Supported formats: JPG, PNG, GIF, MP4
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="mediaType">Media Type</Label>
            <div className="flex space-x-2">
              <Button
                type="button"
                variant={type === "image" ? "default" : "outline"}
                size="sm"
                onClick={() => setType("image")}
                className="flex items-center space-x-2"
              >
                <Image className="h-4 w-4" />
                <span>Image</span>
              </Button>
              <Button
                type="button"
                variant={type === "video" ? "default" : "outline"}
                size="sm"
                onClick={() => setType("video")}
                className="flex items-center space-x-2"
              >
                <Video className="h-4 w-4" />
                <span>Video</span>
              </Button>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="url">Media URL</Label>
            <Input
              id="url"
              placeholder={`Enter ${type} URL`}
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button
              type="submit"
              disabled={!url || isLoading}
              className={cn(isLoading && "opacity-50 cursor-wait")}
            >
              {isLoading ? "Adding..." : "Add Media"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
