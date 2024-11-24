'use client'

import { useState, useCallback } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { format } from 'date-fns'
import { CalendarIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { usePosts } from '@/hooks/use-posts'
import { PostMedia } from '@/types/schema'
import { PostAddMedia } from './post-add-media'
import { ScheduleForm } from './schedule-form'
import { ScheduleConfig } from '@/types/schedule'

const formSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  content: z.string().min(1, 'Content is required'),
  scheduledAt: z.date().optional(),
  schedule: z.any().optional(),
})

type FormData = z.infer<typeof formSchema>

interface PostFormProps {
  onSuccess?: () => void
  initialData?: {
    id?: string
    title?: string
    content?: string
    scheduledAt?: Date
    media?: PostMedia[]
    schedule?: ScheduleConfig
  }
}

export function PostForm({ onSuccess, initialData }: PostFormProps) {
  const { createPost, updatePost } = usePosts()
  const [media, setMedia] = useState<PostMedia[]>(initialData?.media || [])
  const [schedule, setSchedule] = useState<ScheduleConfig | undefined>(initialData?.schedule)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: initialData?.title || '',
      content: initialData?.content || '',
      scheduledAt: initialData?.scheduledAt,
      schedule: initialData?.schedule,
    },
  })

  const onSubmit = useCallback(async (data: FormData) => {
    try {
      setIsSubmitting(true)
      const postData = {
        ...data,
        media: media.map(m => ({
          url: m.url,
          type: m.type,
          thumbnail: m.thumbnail,
          aspectRatio: m.aspectRatio,
        })),
      }

      if (initialData?.id) {
        await updatePost(initialData.id, postData)
      } else {
        await createPost(postData)
      }

      form.reset()
      setMedia([])
      setSchedule(undefined)
      onSuccess?.()
    } finally {
      setIsSubmitting(false)
    }
  }, [createPost, updatePost, form, media, initialData?.id, onSuccess])

  const onMediaChange = useCallback((newMedia: PostMedia[]) => {
    setMedia(newMedia)
  }, [])

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="Enter post title" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Content</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="What's on your mind?"
                  className="min-h-[100px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="scheduledAt"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Schedule Post</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      className={cn(
                        'w-[240px] pl-3 text-left font-normal',
                        !field.value && 'text-muted-foreground'
                      )}
                    >
                      {field.value ? (
                        format(field.value, 'PPP')
                      ) : (
                        <span>Pick a date</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    disabled={(date) =>
                      date < new Date()
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormDescription>
                Leave empty to post immediately
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="schedule"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Schedule</FormLabel>
              <FormControl>
                <ScheduleForm
                  initialConfig={field.value}
                  onChange={field.onChange}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <PostAddMedia media={media} onChange={onMediaChange} />

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : initialData ? 'Update Post' : 'Create Post'}
        </Button>
      </form>
    </Form>
  )
}
