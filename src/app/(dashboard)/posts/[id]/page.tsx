'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { usePostStore } from '@/store/use-posts-store'
import PostForm from '@/components/post/PostForm'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'

interface PostPageProps {
  params: {
    id: string
  }
}

export default function PostPage({ params }: PostPageProps) {
  const router = useRouter()
  const { getPost } = usePostStore()
  const post = getPost(params.id)

  useEffect(() => {
    if (!post) {
      router.push('/posts')
    }
  }, [post, router])

  if (!post) {
    return null
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Edit Post</h1>
          <p className="text-muted-foreground">
            Make changes to your post.
          </p>
        </div>
      </div>

      <PostForm
        postId={params.id}
        onSubmit={() => router.push('/posts')}
      />
    </div>
  )
}
