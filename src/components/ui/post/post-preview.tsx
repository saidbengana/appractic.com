import * as React from "react"
import { cn } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { format } from "date-fns"
import { MediaFile } from "@/components/ui/media/media-file"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Button } from "@/components/ui/button"
import { Heart, MessageCircle, Repeat2, Share2 } from "lucide-react"

interface SocialProfile {
  id: string
  name: string
  username: string
  avatar?: string
}

interface EngagementMetrics {
  likes?: number
  comments?: number
  shares?: number
  retweets?: number
}

interface PostPreviewProps {
  content: string
  media?: Array<{
    url: string
    type: "image" | "video"
    aspectRatio?: number
    alt?: string
  }>
  profile: SocialProfile
  platform: "twitter" | "facebook" | "instagram" | "linkedin"
  className?: string
  scheduledFor?: Date
  metrics?: EngagementMetrics
  version?: string
}

export function PostPreview({
  content,
  media = [],
  profile,
  platform,
  className,
  scheduledFor,
  metrics,
  version,
}: PostPreviewProps) {
  const formatContent = (text: string) => {
    // Convert URLs to links
    const urlRegex = /(https?:\/\/[^\s]+)/g
    text = text.replace(urlRegex, '<a href="$1" target="_blank" rel="noopener noreferrer" class="text-blue-500 hover:underline">$1</a>')

    // Convert hashtags with platform-specific links
    const hashtagRegex = /#(\w+)/g
    text = text.replace(hashtagRegex, (match, tag) => {
      const url = getPlatformHashtagUrl(platform, tag)
      return `<a href="${url}" target="_blank" rel="noopener noreferrer" class="text-blue-500 hover:underline">#${tag}</a>`
    })

    // Convert mentions with platform-specific links
    const mentionRegex = /@(\w+)/g
    text = text.replace(mentionRegex, (match, username) => {
      const url = getPlatformMentionUrl(platform, username)
      return `<a href="${url}" target="_blank" rel="noopener noreferrer" class="text-blue-500 hover:underline">@${username}</a>`
    })

    return text
  }

  const getPlatformHashtagUrl = (platform: string, tag: string) => {
    switch (platform) {
      case "twitter":
        return `https://twitter.com/hashtag/${tag}`
      case "facebook":
        return `https://www.facebook.com/hashtag/${tag}`
      case "instagram":
        return `https://www.instagram.com/explore/tags/${tag}`
      case "linkedin":
        return `https://www.linkedin.com/feed/hashtag/${tag}`
      default:
        return "#"
    }
  }

  const getPlatformMentionUrl = (platform: string, username: string) => {
    switch (platform) {
      case "twitter":
        return `https://twitter.com/${username}`
      case "facebook":
        return `https://www.facebook.com/${username}`
      case "instagram":
        return `https://www.instagram.com/${username}`
      case "linkedin":
        return `https://www.linkedin.com/in/${username}`
      default:
        return "#"
    }
  }

  const getPlatformStyles = () => {
    switch (platform) {
      case "twitter":
        return "bg-[#15202b] text-white border-[#2f3336]"
      case "facebook":
        return "bg-white border-gray-200"
      case "instagram":
        return "bg-white border-gray-100"
      case "linkedin":
        return "bg-white border-[#e9e9e9]"
      default:
        return ""
    }
  }

  return (
    <Card className={cn("w-full overflow-hidden transition-shadow hover:shadow-md", getPlatformStyles(), className)}>
      <CardHeader className="space-y-0 pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Avatar>
              <AvatarImage src={profile.avatar} alt={profile.name} />
              <AvatarFallback>
                {profile.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="font-semibold">{profile.name}</div>
              <div className="text-sm text-muted-foreground">
                @{profile.username}
                {version && (
                  <Badge variant="outline" className="ml-2">
                    Version {version}
                  </Badge>
                )}
              </div>
            </div>
          </div>
          {scheduledFor && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge variant="secondary">
                    Scheduled for {format(scheduledFor, "MMM d, h:mm a")}
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>
                  This post is scheduled to be published at this time
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div
          className="whitespace-pre-wrap"
          dangerouslySetInnerHTML={{ __html: formatContent(content) }}
        />
        {media.length > 0 && (
          <div
            className={cn(
              "grid gap-2",
              media.length === 1 && "grid-cols-1",
              media.length === 2 && "grid-cols-2",
              media.length >= 3 && "grid-cols-2 grid-rows-2",
              media.length === 4 && "grid-cols-2"
            )}
          >
            {media.map((item, index) => (
              <div
                key={index}
                className={cn(
                  media.length === 3 && index === 0 && "col-span-2"
                )}
              >
                <MediaFile
                  src={item.url}
                  type={item.type}
                  aspectRatio={item.aspectRatio}
                  alt={item.alt || `Media ${index + 1}`}
                  className="rounded-md"
                />
              </div>
            ))}
          </div>
        )}
        <div className="pt-2 text-sm text-muted-foreground">
          {format(new Date(), "h:mm a · MMM d, yyyy")}
        </div>
      </CardContent>
      {metrics && (
        <CardFooter className="border-t">
          <div className="flex items-center justify-between w-full text-muted-foreground">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="sm" className="space-x-1">
                    <Heart className="w-4 h-4" />
                    <span>{metrics.likes || 0}</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Likes</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="sm" className="space-x-1">
                    <MessageCircle className="w-4 h-4" />
                    <span>{metrics.comments || 0}</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Comments</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            {platform === "twitter" ? (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="sm" className="space-x-1">
                      <Repeat2 className="w-4 h-4" />
                      <span>{metrics.retweets || 0}</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Retweets</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ) : (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="sm" className="space-x-1">
                      <Share2 className="w-4 h-4" />
                      <span>{metrics.shares || 0}</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Shares</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
        </CardFooter>
      )}
    </Card>
  )
}
