'use client'

import { useState } from 'react'
import { Post } from '@/types/schema'
import { PostForm } from '@/components/post/post-form'
import { PostList } from '@/components/post/post-list'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { SocialAccountList } from '@/components/social/social-account-list'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

export default function PostsPage() {
  const [selectedPost, setSelectedPost] = useState<Post | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Posts</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>Create Post</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Create New Post</DialogTitle>
              <DialogDescription>
                Create a new post to share across your social media accounts.
              </DialogDescription>
            </DialogHeader>
            <PostForm
              onSuccess={() => {
                setIsDialogOpen(false)
                setSelectedPost(null)
              }}
              initialData={selectedPost || undefined}
            />
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="posts" className="space-y-4">
        <TabsList>
          <TabsTrigger value="posts">Posts</TabsTrigger>
          <TabsTrigger value="accounts">Social Accounts</TabsTrigger>
        </TabsList>
        <TabsContent value="posts" className="space-y-4">
          <PostList
            onEdit={(post) => {
              setSelectedPost(post)
              setIsDialogOpen(true)
            }}
          />
        </TabsContent>
        <TabsContent value="accounts">
          <SocialAccountList />
        </TabsContent>
      </Tabs>
    </div>
  )
}
