import { useCallback, useState } from 'react'
import { Post, CreatePostRequest, UpdatePostRequest } from '@/types/schema'
import { useToast } from '@/components/ui/use-toast'
import { ScheduleConfig } from '@/types/schedule'

interface Post {
  id: string
  title: string
  content: string
  media?: File[]
  schedule?: ScheduleConfig
}

interface UsePostsOptions {
  onError?: (error: Error) => void
}

export function usePosts(options: UsePostsOptions = {}) {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const checkScheduleConflict = useCallback((schedule: ScheduleConfig, postId?: string) => {
    const conflictWindow = 15 * 60 * 1000 // 15 minutes in milliseconds
    const { calculateNextScheduledDate } = useSchedule()

    // Get next 10 occurrences of the new schedule
    let currentDate = new Date()
    const newScheduleDates: Date[] = []
    for (let i = 0; i < 10; i++) {
      const nextDate = calculateNextScheduledDate(schedule, currentDate)
      if (!nextDate) break
      newScheduleDates.push(nextDate)
      currentDate = new Date(nextDate.getTime() + 60000) // Add 1 minute
    }

    // Check each post for conflicts
    for (const post of posts) {
      // Skip the current post being edited
      if (postId && post.id === postId) continue
      if (!post.schedule) continue

      // Get next 10 occurrences of existing post schedule
      currentDate = new Date()
      for (let i = 0; i < 10; i++) {
        const existingDate = calculateNextScheduledDate(post.schedule, currentDate)
        if (!existingDate) break

        // Check for conflicts with new schedule dates
        for (const newDate of newScheduleDates) {
          const timeDiff = Math.abs(newDate.getTime() - existingDate.getTime())
          if (timeDiff < conflictWindow) {
            return {
              hasConflict: true,
              conflictingPost: post,
              conflictTime: newDate
            }
          }
        }

        currentDate = new Date(existingDate.getTime() + 60000)
      }
    }

    return { hasConflict: false }
  }, [posts])

  const fetchPosts = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/posts')
      const data = await response.json()
      if (data.success) {
        setPosts(data.data)
      } else {
        throw new Error(data.error)
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to fetch posts',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }, [toast])

  const createPost = useCallback(async (postData: CreatePostRequest) => {
    try {
      setLoading(true)

      if (postData.schedule) {
        const { hasConflict, conflictingPost, conflictTime } = checkScheduleConflict(postData.schedule)
        if (hasConflict) {
          throw new Error(`Schedule conflict with post "${conflictingPost?.title}" at ${conflictTime?.toLocaleString()}`)
        }
      }

      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(postData)
      })

      if (!response.ok) {
        throw new Error('Failed to create post')
      }

      const newPost = await response.json()
      setPosts(prev => [...prev, newPost])
      return newPost
    } catch (error) {
      options.onError?.(error as Error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create post',
        variant: 'destructive'
      })
      throw error
    } finally {
      setLoading(false)
    }
  }, [checkScheduleConflict, options.onError, toast])

  const updatePost = useCallback(async (postId: string, postData: UpdatePostRequest) => {
    try {
      setLoading(true)

      if (postData.schedule) {
        const { hasConflict, conflictingPost, conflictTime } = checkScheduleConflict(postData.schedule, postId)
        if (hasConflict) {
          throw new Error(`Schedule conflict with post "${conflictingPost?.title}" at ${conflictTime?.toLocaleString()}`)
        }
      }

      const response = await fetch(`/api/posts?id=${postId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(postData)
      })

      if (!response.ok) {
        throw new Error('Failed to update post')
      }

      const updatedPost = await response.json()
      setPosts(prev => prev.map(post => post.id === postId ? updatedPost : post))
      return updatedPost
    } catch (error) {
      options.onError?.(error as Error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update post',
        variant: 'destructive'
      })
      throw error
    } finally {
      setLoading(false)
    }
  }, [checkScheduleConflict, options.onError, toast])

  const deletePost = useCallback(async (postId: string) => {
    try {
      setLoading(true)
      const response = await fetch(`/api/posts?id=${postId}`, {
        method: 'DELETE'
      })
      const data = await response.json()
      if (data.success) {
        setPosts(prev => prev.filter(post => post.id !== postId))
        return true
      } else {
        throw new Error(data.error)
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to delete post',
        variant: 'destructive'
      })
      return false
    } finally {
      setLoading(false)
    }
  }, [toast])

  return {
    posts,
    loading,
    fetchPosts,
    createPost,
    updatePost,
    deletePost,
    checkScheduleConflict
  }
}
