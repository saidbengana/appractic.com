import { useMemo } from 'react'
import { usePostStore } from '@/store/use-post-store'

export type PostStatus = 'DRAFT' | 'SCHEDULED' | 'PUBLISHING' | 'PUBLISHED' | 'FAILED'

export interface PostLimits {
  text: {
    [accountId: string]: {
      hit: boolean
      limit: number
      current: number
    }
  }
  media: {
    [accountId: string]: {
      photos: { hit: boolean; limit: number; current: number }
      videos: { hit: boolean; limit: number; current: number }
      gifs: { hit: boolean; limit: number; current: number }
      mixing: { hit: boolean; limit: number; current: number }
    }
  }
}

export function usePost(postId?: string) {
  const { posts, currentPost, setCurrentPost, updatePost } = usePostStore()

  const post = useMemo(() => {
    if (postId) {
      return posts.find((p) => p.id === postId)
    }
    return currentPost
  }, [posts, postId, currentPost])

  const isInHistory = useMemo(() => {
    if (!post) return false
    return ['PUBLISHED', 'FAILED'].includes(post.status)
  }, [post])

  const isScheduleProcessing = useMemo(() => {
    if (!post) return false
    return post.status === 'PUBLISHING'
  }, [post])

  const editAllowed = useMemo(() => {
    return !(isInHistory || isScheduleProcessing)
  }, [isInHistory, isScheduleProcessing])

  const getAccountsHitTextLimit = (limits: PostLimits) => {
    return Object.entries(limits.text)
      .filter(([_, value]) => value.hit)
      .map(([accountId]) => accountId)
  }

  const getAccountsHitMediaLimit = (limits: PostLimits) => {
    return Object.entries(limits.media)
      .filter(([_, value]) => {
        return (
          value.photos.hit ||
          value.videos.hit ||
          value.gifs.hit ||
          value.mixing.hit
        )
      })
      .map(([accountId]) => accountId)
  }

  const checkTextLimit = (text: string, accountId: string, limit: number) => {
    return {
      hit: text.length > limit,
      limit,
      current: text.length,
    }
  }

  const checkMediaLimit = (
    photos: number,
    videos: number,
    gifs: number,
    accountLimits: {
      photos: number
      videos: number
      gifs: number
      mixing: number
    }
  ) => {
    return {
      photos: {
        hit: photos > accountLimits.photos,
        limit: accountLimits.photos,
        current: photos,
      },
      videos: {
        hit: videos > accountLimits.videos,
        limit: accountLimits.videos,
        current: videos,
      },
      gifs: {
        hit: gifs > accountLimits.gifs,
        limit: accountLimits.gifs,
        current: gifs,
      },
      mixing: {
        hit: photos + videos + gifs > accountLimits.mixing,
        limit: accountLimits.mixing,
        current: photos + videos + gifs,
      },
    }
  }

  const updatePostContent = async (content: string) => {
    if (!post) return

    try {
      const response = await fetch(\`/api/posts/\${post.id}\`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      })

      if (!response.ok) throw new Error('Failed to update post')

      const updatedPost = await response.json()
      updatePost(updatedPost)
    } catch (error) {
      console.error('Failed to update post:', error)
    }
  }

  const schedulePost = async (date: Date) => {
    if (!post) return

    try {
      const response = await fetch(\`/api/posts/\${post.id}/schedule\`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scheduled_at: date.toISOString() }),
      })

      if (!response.ok) throw new Error('Failed to schedule post')

      const updatedPost = await response.json()
      updatePost(updatedPost)
    } catch (error) {
      console.error('Failed to schedule post:', error)
    }
  }

  const publishPost = async () => {
    if (!post) return

    try {
      const response = await fetch(\`/api/posts/\${post.id}/publish\`, {
        method: 'POST',
      })

      if (!response.ok) throw new Error('Failed to publish post')

      const updatedPost = await response.json()
      updatePost(updatedPost)
    } catch (error) {
      console.error('Failed to publish post:', error)
    }
  }

  return {
    post,
    isInHistory,
    isScheduleProcessing,
    editAllowed,
    getAccountsHitTextLimit,
    getAccountsHitMediaLimit,
    checkTextLimit,
    checkMediaLimit,
    updatePostContent,
    schedulePost,
    publishPost,
  }
}
