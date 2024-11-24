'use client'

import { useState, useCallback } from 'react'
import { usePostStore } from '@/store/use-posts-store'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import PostCharacterCount from './PostCharacterCount'
import PostMedia from './PostMedia'
import PostTags from './PostTags'
import AddMedia from '../media/AddMedia'
import { useToast } from '@/components/ui/use-toast'

interface PostFormProps {
  postId?: string
  onSubmit?: () => void
}

export default function PostForm({ postId, onSubmit }: PostFormProps) {
  const { toast } = useToast()
  const { createPost, updatePost, getPost } = usePostStore()
  const [content, setContent] = useState('')
  const [media, setMedia] = useState<any[]>([])
  const [tags, setTags] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Load existing post data if editing
  useState(() => {
    if (postId) {
      const post = getPost(postId)
      if (post) {
        setContent(post.content)
        setMedia(post.media || [])
        setTags(post.tags || [])
      }
    }
  }, [postId, getPost])

  const handleMediaSelect = useCallback((items: any[]) => {
    setMedia(prev => [...prev, ...items])
  }, [])

  const handleMediaRemove = useCallback((index: number) => {
    setMedia(prev => prev.filter((_, i) => i !== index))
  }, [])

  const handleSubmit = async () => {
    if (!content.trim() && media.length === 0) {
      toast({
        title: 'Error',
        description: 'Please add some content or media to your post',
        variant: 'destructive'
      })
      return
    }

    setIsSubmitting(true)

    try {
      const postData = {
        content,
        media,
        tags
      }

      if (postId) {
        await updatePost(postId, postData)
      } else {
        await createPost(postData)
      }

      toast({
        title: 'Success',
        description: postId ? 'Post updated successfully' : 'Post created successfully'
      })

      onSubmit?.()
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save post. Please try again.',
        variant: 'destructive'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
        <div className="p-4">
          <Textarea
            placeholder="What's on your mind?"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-[120px] resize-none"
          />

          <PostCharacterCount content={content} />
        </div>

        {media.length > 0 && (
          <div className="border-t p-4">
            <PostMedia items={media} onRemove={handleMediaRemove} />
          </div>
        )}

        <div className="border-t p-4">
          <PostTags value={tags} onChange={setTags} />
        </div>

        <div className="flex items-center justify-between border-t p-4">
          <div className="flex gap-2">
            <AddMedia onInsert={handleMediaSelect}>
              <Button variant="outline" size="sm">
                Add Media
              </Button>
            </AddMedia>
          </div>

          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Saving...' : (postId ? 'Update' : 'Post')}
          </Button>
        </div>
      </div>
    </div>
  )
}
