import * as React from "react"
import { cn } from "@/lib/utils"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { MediaTabs } from "@/components/ui/media/media-tabs"
import { SchedulePicker } from "@/components/ui/schedule/schedule-picker"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card"
import {
  Calendar,
  Image as ImageIcon,
  Send,
  Clock,
  X,
  Save,
  Smile,
  Hash,
  AtSign,
} from "lucide-react"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from "@/components/ui/sheet"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import data from '@emoji-mart/data'
import Picker from '@emoji-mart/react'
import { useToast } from "@/components/ui/use-toast"
import { useLocalStorage } from "@/hooks/use-local-storage"
import { useDebounce } from "@/hooks/use-debounce"
import { PostCharacterCount } from "./post-character-count"

interface Media {
  url: string
  title: string
  type: "image" | "video" | "gif"
  aspectRatio?: number
  alt?: string
}

interface Draft {
  id: string
  content: string
  media: Media[]
  scheduledAt?: Date
  lastModified: Date
}

interface PostComposerProps {
  onSubmit?: (data: {
    content: string
    media: Media[]
    scheduledAt?: Date
  }) => void
  className?: string
  loading?: boolean
  maxMedia?: number
  accounts?: { id: string; name: string }[]
  hashtags?: string[]
  initialContent?: string
  initialMedia?: Media[]
  initialSchedule?: Date
  draftId?: string
}

export function PostComposer({
  onSubmit,
  className,
  loading = false,
  maxMedia = 4,
  accounts = [],
  hashtags = [],
  initialContent = "",
  initialMedia = [],
  initialSchedule,
  draftId,
}: PostComposerProps) {
  const { toast } = useToast()
  const [content, setContent] = React.useState(initialContent)
  const [media, setMedia] = React.useState<Media[]>(initialMedia)
  const [scheduledAt, setScheduledAt] = React.useState<Date | undefined>(initialSchedule)
  const [showMediaSheet, setShowMediaSheet] = React.useState(false)
  const [showScheduleSheet, setShowScheduleSheet] = React.useState(false)
  const [showEmojiPicker, setShowEmojiPicker] = React.useState(false)
  const [showMentions, setShowMentions] = React.useState(false)
  const [showHashtags, setShowHashtags] = React.useState(false)
  const [drafts, setDrafts] = useLocalStorage<Draft[]>("post-drafts", [])
  const [cursorPosition, setCursorPosition] = React.useState(0)
  const textareaRef = React.useRef<HTMLTextAreaElement>(null)

  const debouncedContent = useDebounce(content, 1000)

  // Auto-save draft
  React.useEffect(() => {
    if (!draftId || !debouncedContent) return

    const draft: Draft = {
      id: draftId,
      content,
      media,
      scheduledAt,
      lastModified: new Date(),
    }

    setDrafts((prevDrafts) => {
      const index = prevDrafts.findIndex((d) => d.id === draftId)
      if (index === -1) {
        return [...prevDrafts, draft]
      }
      const newDrafts = [...prevDrafts]
      newDrafts[index] = draft
      return newDrafts
    })
  }, [debouncedContent, media, scheduledAt, draftId])

  const handleSubmit = () => {
    if (!onSubmit) return
    onSubmit({
      content,
      media,
      scheduledAt,
    })

    // Clear draft if exists
    if (draftId) {
      setDrafts((prevDrafts) => prevDrafts.filter((d) => d.id !== draftId))
    }
  }

  const insertAtCursor = (text: string) => {
    if (!textareaRef.current) return

    const start = textareaRef.current.selectionStart
    const end = textareaRef.current.selectionEnd
    const newContent = content.substring(0, start) + text + content.substring(end)
    setContent(newContent)
    setCursorPosition(start + text.length)

    // Focus and set cursor position after state update
    setTimeout(() => {
      if (!textareaRef.current) return
      textareaRef.current.focus()
      textareaRef.current.setSelectionRange(cursorPosition, cursorPosition)
    }, 0)
  }

  const handleEmojiSelect = (emoji: any) => {
    insertAtCursor(emoji.native)
    setShowEmojiPicker(false)
  }

  const handleMentionSelect = (account: { id: string; name: string }) => {
    insertAtCursor(`@${account.name} `)
    setShowMentions(false)
  }

  const handleHashtagSelect = (hashtag: string) => {
    insertAtCursor(`#${hashtag} `)
    setShowHashtags(false)
  }

  const saveDraft = () => {
    if (!content.trim() && media.length === 0) {
      toast({
        title: "Cannot save empty draft",
        description: "Please add some content or media before saving.",
        variant: "destructive",
      })
      return
    }

    const draft: Draft = {
      id: draftId || crypto.randomUUID(),
      content,
      media,
      scheduledAt,
      lastModified: new Date(),
    }

    setDrafts((prevDrafts) => [...prevDrafts, draft])
    toast({
      title: "Draft saved",
      description: "Your post has been saved as a draft.",
    })
  }

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader className="space-y-4">
        <Textarea
          ref={textareaRef}
          placeholder="What's on your mind?"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onSelect={(e) => {
            const target = e.target as HTMLTextAreaElement
            setCursorPosition(target.selectionStart)
          }}
          rows={3}
          className="resize-none"
        />
        <PostCharacterCount
          content={content}
          maxLength={280}
          className="text-sm text-muted-foreground"
        />
      </CardHeader>

      {media.length > 0 && (
        <CardContent>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
            {media.map((item, index) => (
              <div key={index} className="group relative">
                {item.type === "video" ? (
                  <video
                    src={item.url}
                    className="aspect-square rounded-md object-cover"
                    controls
                  />
                ) : (
                  <img
                    src={item.url}
                    alt={item.alt || item.title}
                    className={cn(
                      "rounded-md object-cover",
                      item.aspectRatio
                        ? `aspect-[${item.aspectRatio}]`
                        : "aspect-square"
                    )}
                  />
                )}
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                  <Button
                    size="icon"
                    variant="destructive"
                    onClick={() => setMedia(media.filter((_, i) => i !== index))}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      )}

      <CardFooter className="justify-between space-x-2">
        <div className="flex space-x-2">
          <Sheet open={showMediaSheet} onOpenChange={setShowMediaSheet}>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                disabled={media.length >= maxMedia}
                title={
                  media.length >= maxMedia
                    ? `Maximum ${maxMedia} media items allowed`
                    : "Add media"
                }
              >
                <ImageIcon className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-[600px]">
              <SheetHeader>
                <SheetTitle>Add Media</SheetTitle>
              </SheetHeader>
              <div className="mt-4">
                <MediaTabs
                  onMediaSelect={setMedia}
                  selectedMedia={media}
                  maxSelection={maxMedia}
                />
              </div>
            </SheetContent>
          </Sheet>

          <Sheet open={showScheduleSheet} onOpenChange={setShowScheduleSheet}>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                title={scheduledAt ? "Edit schedule" : "Schedule post"}
              >
                {scheduledAt ? (
                  <Clock className="h-4 w-4" />
                ) : (
                  <Calendar className="h-4 w-4" />
                )}
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom">
              <SheetHeader>
                <SheetTitle>Schedule Post</SheetTitle>
              </SheetHeader>
              <div className="mt-4">
                <SchedulePicker
                  date={scheduledAt}
                  onSelect={setScheduledAt}
                />
              </div>
              {scheduledAt && (
                <SheetFooter className="mt-4">
                  <Button
                    variant="outline"
                    onClick={() => setScheduledAt(undefined)}
                  >
                    Clear Schedule
                  </Button>
                </SheetFooter>
              )}
            </SheetContent>
          </Sheet>

          <Popover open={showEmojiPicker} onOpenChange={setShowEmojiPicker}>
            <PopoverTrigger asChild>
              <Button variant="outline" size="icon" title="Add emoji">
                <Smile className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Picker
                data={data}
                onEmojiSelect={handleEmojiSelect}
                theme="light"
                set="native"
              />
            </PopoverContent>
          </Popover>

          {accounts.length > 0 && (
            <Popover open={showMentions} onOpenChange={setShowMentions}>
              <PopoverTrigger asChild>
                <Button variant="outline" size="icon" title="Mention user">
                  <AtSign className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-64">
                <div className="space-y-2">
                  {accounts.map((account) => (
                    <Button
                      key={account.id}
                      variant="ghost"
                      className="w-full justify-start"
                      onClick={() => handleMentionSelect(account)}
                    >
                      @{account.name}
                    </Button>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
          )}

          {hashtags.length > 0 && (
            <Popover open={showHashtags} onOpenChange={setShowHashtags}>
              <PopoverTrigger asChild>
                <Button variant="outline" size="icon" title="Add hashtag">
                  <Hash className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-64">
                <div className="space-y-2">
                  {hashtags.map((hashtag) => (
                    <Button
                      key={hashtag}
                      variant="ghost"
                      className="w-full justify-start"
                      onClick={() => handleHashtagSelect(hashtag)}
                    >
                      #{hashtag}
                    </Button>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
          )}

          <Button
            variant="outline"
            size="icon"
            onClick={saveDraft}
            title="Save as draft"
          >
            <Save className="h-4 w-4" />
          </Button>
        </div>

        <Button
          onClick={handleSubmit}
          disabled={!content.trim() && media.length === 0}
          loading={loading}
        >
          <Send className="mr-2 h-4 w-4" />
          {scheduledAt ? "Schedule" : "Post"}
        </Button>
      </CardFooter>
    </Card>
  )
}
