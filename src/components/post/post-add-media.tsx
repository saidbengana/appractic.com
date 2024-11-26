'use client'

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
import { MediaType, PostMedia } from '@/types/schema'

interface PostAddMediaProps {
  media: PostMedia[]
  onChange: (newMedia: PostMedia[]) => void
  disabled?: boolean
  className?: string
}

export function PostAddMedia({
  media,
  onChange,
  disabled = false,
  className,
}: PostAddMediaProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const [url, setUrl] = React.useState("")
  const [type, setType] = React.useState<MediaType>("IMAGE")
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const handleSubmit = React.useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    if (!url) return

    setLoading(true)
    setError(null)

    try {
      const mediaItem: PostMedia = {
        id: crypto.randomUUID(),
        postId: '', // This will be set when the post is created
        url,
        type,
        // You might want to fetch these values
        thumbnail: type === "VIDEO" ? undefined : url,
        aspectRatio: undefined,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      onChange([...media, mediaItem])
      setIsOpen(false)
      setUrl("")
      setType("IMAGE")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add media")
    } finally {
      setLoading(false)
    }
  }, [url, type, media, onChange])

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn(
            "flex items-center gap-2",
            disabled && "opacity-50 cursor-not-allowed",
            className
          )}
          disabled={disabled}
        >
          <Upload className="h-4 w-4" />
          Add Media
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Media</DialogTitle>
          <DialogDescription>
            Add an image or video to your post by providing a URL.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="type">Media Type</Label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant={type === "IMAGE" ? "default" : "outline"}
                size="sm"
                onClick={() => setType("IMAGE")}
                className="flex items-center gap-2"
              >
                <Image className="h-4 w-4" />
                Image
              </Button>
              <Button
                type="button"
                variant={type === "VIDEO" ? "default" : "outline"}
                size="sm"
                onClick={() => setType("VIDEO")}
                className="flex items-center gap-2"
              >
                <Video className="h-4 w-4" />
                Video
              </Button>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="url">URL</Label>
            <Input
              id="url"
              placeholder={`Enter ${type === "IMAGE" ? 'image' : 'video'} URL`}
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
          </div>
          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!url || loading}
            >
              {loading ? "Adding..." : "Add Media"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
