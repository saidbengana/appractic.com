'use client'

import { useState } from 'react'
import { usePostStore } from '@/store/use-posts-store'
import PostForm from '@/components/post/PostForm'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { format } from 'date-fns'

export default function PostsPage() {
  const { posts } = usePostStore()
  const [activeTab, setActiveTab] = useState('all')

  const filteredPosts = posts.filter(post => {
    switch (activeTab) {
      case 'published':
        return post.status === 'published'
      case 'scheduled':
        return post.status === 'scheduled'
      case 'draft':
        return post.status === 'draft'
      default:
        return true
    }
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Posts</h1>
        <Button>New Post</Button>
      </div>

      <PostForm />

      <Card>
        <CardHeader>
          <CardTitle>All Posts</CardTitle>
          <CardDescription>Manage your posts across all platforms.</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs
            defaultValue="all"
            value={activeTab}
            onValueChange={setActiveTab}
            className="space-y-4"
          >
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="published">Published</TabsTrigger>
              <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
              <TabsTrigger value="draft">Drafts</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab}>
              <div className="space-y-4">
                {filteredPosts.map(post => (
                  <Card key={post.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-base">
                            {post.content.slice(0, 100)}
                            {post.content.length > 100 ? '...' : ''}
                          </CardTitle>
                          <CardDescription>
                            {format(new Date(post.created_at), 'PPP')}
                          </CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm">
                            Edit
                          </Button>
                          <Button variant="destructive" size="sm">
                            Delete
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    {post.media && post.media.length > 0 && (
                      <CardContent>
                        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                          {post.media.map((item, index) => (
                            <div
                              key={index}
                              className="aspect-video overflow-hidden rounded-lg bg-muted"
                            >
                              {item.mime_type?.startsWith('image/') ? (
                                <img
                                  src={item.url}
                                  alt=""
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <video
                                  src={item.url}
                                  className="h-full w-full object-cover"
                                  muted
                                  loop
                                  playsInline
                                />
                              )}
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    )}
                  </Card>
                ))}

                {filteredPosts.length === 0 && (
                  <div className="flex h-32 items-center justify-center rounded-lg border border-dashed">
                    <p className="text-sm text-muted-foreground">
                      No posts found
                    </p>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
