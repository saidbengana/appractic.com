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
import { Checkbox } from "@/components/ui/checkbox"
import { format } from "date-fns"
import {
  MoreHorizontal,
  Calendar,
  Clock,
  Globe,
  Lock,
  Edit,
  Trash,
  Archive,
  Copy,
  Share2,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { PostFilters } from "./post-filters"

interface Post {
  id: string
  content: string
  media?: Array<{
    url: string
    type: "image" | "video"
  }>
  status: "draft" | "scheduled" | "published" | "failed"
  scheduledAt?: Date
  publishedAt?: Date
  isPrivate?: boolean
  platforms?: string[]
}

interface PostListProps {
  posts: Post[]
  loading?: boolean
  onEdit?: (post: Post) => void
  onDelete?: (post: Post) => void
  onBulkAction?: (action: string, posts: Post[]) => void
  onFilterChange?: (filters: PostFilters) => void
  className?: string
}

export function PostList({
  posts,
  loading = false,
  onEdit,
  onDelete,
  onBulkAction,
  onFilterChange,
  className,
}: PostListProps) {
  const [selectedPosts, setSelectedPosts] = React.useState<Set<string>>(new Set())
  const [selectAll, setSelectAll] = React.useState(false)

  const handleSelectAll = (checked: boolean) => {
    setSelectAll(checked)
    setSelectedPosts(checked ? new Set(posts.map(post => post.id)) : new Set())
  }

  const handleSelectPost = (postId: string, checked: boolean) => {
    const newSelected = new Set(selectedPosts)
    if (checked) {
      newSelected.add(postId)
    } else {
      newSelected.delete(postId)
    }
    setSelectedPosts(newSelected)
    setSelectAll(newSelected.size === posts.length)
  }

  const getStatusColor = (status: Post["status"]) => {
    switch (status) {
      case "draft":
        return "bg-muted text-muted-foreground"
      case "scheduled":
        return "bg-blue-500 text-white"
      case "published":
        return "bg-green-500 text-white"
      case "failed":
        return "bg-red-500 text-white"
      default:
        return ""
    }
  }

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

  const selectedPostsArray = posts.filter(post => selectedPosts.has(post.id))

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex flex-col space-y-4">
        {onFilterChange && (
          <PostFilters
            onFilterChange={onFilterChange}
            className="mb-4"
          />
        )}
        
        {/* Bulk Actions Bar */}
        <div className="flex items-center space-x-4">
          <Checkbox
            checked={selectAll}
            onCheckedChange={handleSelectAll}
            aria-label="Select all posts"
          />
          <span className="text-sm text-muted-foreground">
            {selectedPosts.size} selected
          </span>
          
          {selectedPosts.size > 0 && (
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onBulkAction?.("delete", selectedPostsArray)}
              >
                <Trash className="mr-2 h-4 w-4" />
                Delete
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onBulkAction?.("archive", selectedPostsArray)}
              >
                <Archive className="mr-2 h-4 w-4" />
                Archive
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onBulkAction?.("duplicate", selectedPostsArray)}
              >
                <Copy className="mr-2 h-4 w-4" />
                Duplicate
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onBulkAction?.("share", selectedPostsArray)}
              >
                <Share2 className="mr-2 h-4 w-4" />
                Share
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Posts List */}
      <div className="space-y-4">
        {posts.map((post) => (
          <Card key={post.id}>
            <CardHeader className="flex flex-row items-start justify-between space-y-0">
              <div className="flex items-start space-x-4">
                <Checkbox
                  checked={selectedPosts.has(post.id)}
                  onCheckedChange={(checked) => handleSelectPost(post.id, !!checked)}
                  aria-label={`Select post ${post.content}`}
                />
                <div className="space-y-1">
                  <CardTitle className="line-clamp-1">{post.content}</CardTitle>
                  <CardDescription className="flex items-center space-x-2">
                    {post.scheduledAt && (
                      <>
                        <Calendar className="h-4 w-4" />
                        <span>
                          {format(post.scheduledAt, "MMM d, yyyy")}
                        </span>
                        <Clock className="h-4 w-4 ml-2" />
                        <span>
                          {format(post.scheduledAt, "h:mm a")}
                        </span>
                      </>
                    )}
                    {post.isPrivate ? (
                      <Lock className="h-4 w-4 ml-2" />
                    ) : (
                      <Globe className="h-4 w-4 ml-2" />
                    )}
                  </CardDescription>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Badge className={getStatusColor(post.status)}>
                  {post.status.charAt(0).toUpperCase() + post.status.slice(1)}
                </Badge>
                {post.platforms?.map((platform) => (
                  <Badge key={platform} variant="outline">
                    {platform}
                  </Badge>
                ))}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => onEdit?.(post)}
                      className="cursor-pointer"
                    >
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => onBulkAction?.("duplicate", [post])}
                      className="cursor-pointer"
                    >
                      <Copy className="mr-2 h-4 w-4" />
                      Duplicate
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => onBulkAction?.("share", [post])}
                      className="cursor-pointer"
                    >
                      <Share2 className="mr-2 h-4 w-4" />
                      Share
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
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
    </div>
  )
}
