'use client'

import { useRouter } from 'next/navigation'
import PostForm from '@/components/post/PostForm'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'

export default function NewPostPage() {
  const router = useRouter()

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
          <h1 className="text-2xl font-bold">Create Post</h1>
          <p className="text-muted-foreground">
            Create a new post to share with your audience.
          </p>
        </div>
      </div>

      <PostForm
        onSubmit={() => router.push('/posts')}
      />
    </div>
  )
}
