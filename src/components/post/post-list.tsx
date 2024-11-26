'use client'

import { useEffect } from 'react'
import { format } from 'date-fns'
import { MoreHorizontal, Calendar, Trash2 } from 'lucide-react'
import { usePosts } from '@/hooks/use-posts'
import { Post, PostStatus } from '@/types/schema'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { LoadingOverlay } from '@/components/ui/loading'

const STATUS_COLORS: Record<PostStatus, string> = {
  DRAFT: 'bg-gray-500',
  SCHEDULED: 'bg-blue-500',
  PUBLISHED: 'bg-green-500',
  FAILED: 'bg-red-500',
}

interface PostListProps {
  onEdit?: (post: Post) => void
}

export function PostList({ onEdit }: PostListProps) {
  const { posts, loading, fetchPosts, deletePost } = usePosts()

  useEffect(() => {
    fetchPosts()
  }, [fetchPosts])

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <LoadingOverlay />
      </div>
    )
  }

  if (!loading && posts.length === 0) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <div className="text-muted-foreground">No posts found</div>
      </div>
    )
  }

  return (
    <ScrollArea className="h-[600px]">
      <div className="space-y-4 p-4">
        {posts.map((post) => (
          <Card key={post.id}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {post.title || 'Untitled Post'}
              </CardTitle>
              <div className="flex items-center space-x-2">
                <Badge
                  variant="neutral"
                  className={STATUS_COLORS[post.status as PostStatus]}
                >
                  {post.status.toLowerCase()}
                </Badge>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <span className="sr-only">Open menu</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onEdit?.(post)}>
                      Edit post
                    </DropdownMenuItem>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <DropdownMenuItem
                          className="text-red-600"
                          onSelect={(e) => e.preventDefault()}
                        >
                          Delete post
                        </DropdownMenuItem>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            Are you sure you want to delete this post?
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            className="bg-red-600"
                            onClick={() => deletePost(post.id)}
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground line-clamp-2">
                {post.content}
              </div>
              <div className="mt-4 flex items-center text-xs text-muted-foreground">
                <Calendar className="mr-1 h-3 w-3" />
                {post.scheduledAt ? (
                  <>Scheduled for {format(new Date(post.scheduledAt), 'PPP')}</>
                ) : (
                  <>Created on {format(new Date(post.createdAt), 'PPP')}</>
                )}
                {post.versions && (
                  <Badge variant="neutral" className="ml-2">
                    {post.versions.length} version{post.versions.length === 1 ? '' : 's'}
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </ScrollArea>
  )
}
