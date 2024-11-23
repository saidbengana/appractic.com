import * as React from "react"
import { cn } from "@/lib/utils"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { format } from "date-fns"
import {
  MoreHorizontal,
  Calendar,
  Clock,
  ArrowUp,
  ArrowDown,
  Edit,
  Trash,
  Pause,
  Play,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface QueuedPost {
  id: string
  content: string
  media?: Array<{
    url: string
    type: "image" | "video"
  }>
  scheduledAt: Date
  paused?: boolean
  order: number
}

interface PostQueueProps {
  posts: QueuedPost[]
  loading?: boolean
  onEdit?: (post: QueuedPost) => void
  onDelete?: (post: QueuedPost) => void
  onMoveUp?: (post: QueuedPost) => void
  onMoveDown?: (post: QueuedPost) => void
  onTogglePause?: (post: QueuedPost) => void
  className?: string
}

export function PostQueue({
  posts,
  loading = false,
  onEdit,
  onDelete,
  onMoveUp,
  onMoveDown,
  onTogglePause,
  className,
}: PostQueueProps) {
  const sortedPosts = React.useMemo(() => {
    return [...posts].sort((a, b) => a.order - b.order)
  }, [posts])

  if (loading) {
    return (
      <div className={cn("space-y-4", className)}>
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-4 w-[200px]" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-16 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className={cn("space-y-4", className)}>
      {sortedPosts.map((post, index) => (
        <Card
          key={post.id}
          className={cn(post.paused && "opacity-60")}
        >
          <CardHeader className="flex flex-row items-start justify-between space-y-0">
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <Badge variant="outline">#{post.order}</Badge>
                <CardTitle className="line-clamp-1">{post.content}</CardTitle>
              </div>
              <CardDescription className="flex items-center space-x-2">
                <Calendar className="h-4 w-4" />
                <span>
                  {format(post.scheduledAt, "MMM d, yyyy")}
                </span>
                <Clock className="h-4 w-4 ml-2" />
                <span>
                  {format(post.scheduledAt, "h:mm a")}
                </span>
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onTogglePause?.(post)}
                className="text-muted-foreground hover:text-foreground"
              >
                {post.paused ? (
                  <Play className="h-4 w-4" />
                ) : (
                  <Pause className="h-4 w-4" />
                )}
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={() => onMoveUp?.(post)}
                    disabled={index === 0}
                    className="cursor-pointer"
                  >
                    <ArrowUp className="mr-2 h-4 w-4" />
                    Move Up
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => onMoveDown?.(post)}
                    disabled={index === posts.length - 1}
                    className="cursor-pointer"
                  >
                    <ArrowDown className="mr-2 h-4 w-4" />
                    Move Down
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => onEdit?.(post)}
                    className="cursor-pointer"
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => onDelete?.(post)}
                    className="cursor-pointer text-red-500 focus:text-red-500"
                  >
                    <Trash className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardHeader>
          {post.media && post.media.length > 0 && (
            <CardContent>
              <div className="grid grid-cols-4 gap-2">
                {post.media.map((item, index) => (
                  <div
                    key={index}
                    className="aspect-square rounded-md bg-muted"
                    style={{
                      backgroundImage: `url(${item.url})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                    }}
                  />
                ))}
              </div>
            </CardContent>
          )}
        </Card>
      ))}
    </div>
  )
}
