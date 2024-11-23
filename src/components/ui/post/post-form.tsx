import * as React from "react"
import { cn } from "@/lib/utils"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { MediaPicker } from "../media/media-picker"
import { PostScheduler } from "./post-scheduler"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { EmojiPicker } from "../emoji-picker"
import { Tag } from "../tag"
import { PaperAirplaneIcon, PhotoIcon } from "lucide-react"

interface PostVersion {
  id?: string
  content: string
  media: MediaItem[]
  account_id: string
}

interface MediaItem {
  id: string
  url: string
  type: "image" | "video" | "gif"
  thumbnail?: string
  name: string
  size?: number
}

interface Account {
  id: string
  name: string
  type: string
  avatar?: string
  textLimit?: number
  mediaLimit?: {
    photos: { max: number; hit: boolean }
    videos: { max: number; hit: boolean }
    gifs: { max: number; hit: boolean }
  }
}

interface PostFormProps {
  versions?: PostVersion[]
  accounts: Account[]
  tags?: Array<{ id: string; name: string; color?: string }>
  selectedTags?: string[]
  selectedAccounts?: string[]
  scheduledDate?: Date
  scheduledTime?: string
  timezone?: string
  timeFormat?: "12" | "24"
  onSubmit?: (data: PostFormData) => void
  onSchedule?: (date: Date) => void
  onSaveDraft?: () => void
  className?: string
}

interface PostFormData {
  versions: PostVersion[]
  accounts: string[]
  tags: string[]
  scheduledAt?: Date
}

export function PostForm({
  versions = [],
  accounts = [],
  tags = [],
  selectedTags = [],
  selectedAccounts = [],
  scheduledDate,
  scheduledTime,
  timezone = "UTC",
  timeFormat = "24",
  onSubmit,
  onSchedule,
  onSaveDraft,
  className,
}: PostFormProps) {
  const [activeVersions, setActiveVersions] = React.useState<PostVersion[]>(
    versions.length > 0
      ? versions
      : selectedAccounts.map((accountId) => ({
          content: "",
          media: [],
          account_id: accountId,
        }))
  )
  const [selectedAccountIds, setSelectedAccountIds] = React.useState<string[]>(selectedAccounts)
  const [selectedTagIds, setSelectedTagIds] = React.useState<string[]>(selectedTags)

  // Update versions when accounts change
  React.useEffect(() => {
    const newVersions = selectedAccountIds.map((accountId) => {
      const existingVersion = activeVersions.find((v) => v.account_id === accountId)
      return existingVersion || {
        content: "",
        media: [],
        account_id: accountId,
      }
    })
    setActiveVersions(newVersions)
  }, [selectedAccountIds])

  const handleContentChange = (accountId: string, content: string) => {
    setActiveVersions((prev) =>
      prev.map((version) =>
        version.account_id === accountId
          ? { ...version, content }
          : version
      )
    )
  }

  const handleMediaAdd = (accountId: string, media: MediaItem[]) => {
    setActiveVersions((prev) =>
      prev.map((version) =>
        version.account_id === accountId
          ? { ...version, media: [...version.media, ...media] }
          : version
      )
    )
  }

  const handleMediaRemove = (accountId: string, mediaId: string) => {
    setActiveVersions((prev) =>
      prev.map((version) =>
        version.account_id === accountId
          ? {
              ...version,
              media: version.media.filter((m) => m.id !== mediaId),
            }
          : version
      )
    )
  }

  const handleEmojiSelect = (accountId: string, emoji: string) => {
    const version = activeVersions.find((v) => v.account_id === accountId)
    if (!version) return

    const textarea = document.querySelector(
      `textarea[data-account-id="${accountId}"]`
    ) as HTMLTextAreaElement

    if (textarea) {
      const start = textarea.selectionStart
      const end = textarea.selectionEnd
      const text = version.content
      const newContent = text.substring(0, start) + emoji + text.substring(end)
      handleContentChange(accountId, newContent)
      
      // Reset cursor position after emoji insertion
      setTimeout(() => {
        textarea.focus()
        textarea.setSelectionRange(start + emoji.length, start + emoji.length)
      }, 0)
    }
  }

  const handleSubmit = () => {
    onSubmit?.({
      versions: activeVersions,
      accounts: selectedAccountIds,
      tags: selectedTagIds,
      scheduledAt: scheduledDate,
    })
  }

  const isValid = React.useMemo(() => {
    return (
      selectedAccountIds.length > 0 &&
      activeVersions.some((v) => v.content.trim() || v.media.length > 0)
    )
  }, [selectedAccountIds, activeVersions])

  return (
    <div className={cn("space-y-4", className)}>
      <Card>
        <div className="p-4 space-y-4">
          {/* Account Selection */}
          <Select
            value={selectedAccountIds.join(",")}
            onValueChange={(value) => setSelectedAccountIds(value.split(","))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select accounts" />
            </SelectTrigger>
            <SelectContent>
              {accounts.map((account) => (
                <SelectItem key={account.id} value={account.id}>
                  <div className="flex items-center">
                    {account.avatar && (
                      <img
                        src={account.avatar}
                        alt={account.name}
                        className="w-6 h-6 rounded-full mr-2"
                      />
                    )}
                    <span>{account.name}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Post Versions */}
          <ScrollArea className="h-[400px] pr-4">
            {activeVersions.map((version, index) => {
              const account = accounts.find((a) => a.id === version.account_id)
              if (!account) return null

              return (
                <div key={version.account_id} className="mb-6 last:mb-0">
                  <div className="flex items-center mb-2">
                    {account.avatar && (
                      <img
                        src={account.avatar}
                        alt={account.name}
                        className="w-8 h-8 rounded-full mr-2"
                      />
                    )}
                    <span className="font-medium">{account.name}</span>
                  </div>

                  <div className="space-y-2">
                    <Textarea
                      data-account-id={version.account_id}
                      value={version.content}
                      onChange={(e) =>
                        handleContentChange(version.account_id, e.target.value)
                      }
                      placeholder={`Write your post for ${account.name}...`}
                      className="min-h-[100px]"
                    />

                    <div className="flex items-center space-x-2">
                      <EmojiPicker
                        onEmojiSelect={(emoji) =>
                          handleEmojiSelect(version.account_id, emoji)
                        }
                      >
                        <Button variant="ghost" size="sm">
                          😊
                        </Button>
                      </EmojiPicker>

                      <MediaPicker
                        onSelect={(media) => handleMediaAdd(version.account_id, media)}
                        multiple
                        maxFiles={
                          account.mediaLimit?.photos.max ||
                          account.mediaLimit?.videos.max ||
                          10
                        }
                      >
                        <Button variant="ghost" size="sm">
                          <PhotoIcon className="w-4 h-4" />
                        </Button>
                      </MediaPicker>
                    </div>

                    {version.media.length > 0 && (
                      <div className="grid grid-cols-4 gap-2">
                        {version.media.map((media) => (
                          <div
                            key={media.id}
                            className="relative group aspect-square"
                          >
                            <img
                              src={media.thumbnail || media.url}
                              alt={media.name}
                              className="w-full h-full object-cover rounded-md"
                            />
                            <Button
                              variant="destructive"
                              size="sm"
                              className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() =>
                                handleMediaRemove(version.account_id, media.id)
                              }
                            >
                              ×
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </ScrollArea>

          {/* Tags */}
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <Tag
                key={tag.id}
                name={tag.name}
                color={tag.color}
                selected={selectedTagIds.includes(tag.id)}
                onClick={() =>
                  setSelectedTagIds((prev) =>
                    prev.includes(tag.id)
                      ? prev.filter((id) => id !== tag.id)
                      : [...prev, tag.id]
                  )
                }
              />
            ))}
          </div>
        </div>
      </Card>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={onSaveDraft}>
            Save as Draft
          </Button>
          <PostScheduler
            onSchedule={onSchedule}
            onCancel={() => {}}
            defaultDate={scheduledDate}
            defaultTime={scheduledTime}
            timezone={timezone}
            timeFormat={timeFormat}
          />
        </div>

        <Button
          onClick={handleSubmit}
          disabled={!isValid}
          className="min-w-[120px]"
        >
          <PaperAirplaneIcon className="w-4 h-4 mr-2" />
          {scheduledDate ? "Schedule" : "Post Now"}
        </Button>
      </div>
    </div>
  )
}
