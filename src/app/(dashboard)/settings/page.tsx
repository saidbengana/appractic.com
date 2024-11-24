'use client'

import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel } from '@/components/ui/form'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { useToast } from '@/components/ui/use-toast'
import { useSettingsStore } from '@/store/use-settings-store'

const formSchema = z.object({
  timezone: z.string(),
  timeFormat: z.enum(['12', '24']),
  weekStartsOn: z.enum(['0', '1']),
  theme: z.enum(['light', 'dark', 'system']),
  notifications: z.boolean(),
  autoSave: z.boolean(),
  mediaQuality: z.enum(['original', 'high', 'medium', 'low']),
})

type SettingsFormValues = z.infer<typeof formSchema>

// This would come from your backend
const timezoneList = {
  'America': {
    'America/New_York': 'Eastern Time',
    'America/Chicago': 'Central Time',
    'America/Denver': 'Mountain Time',
    'America/Los_Angeles': 'Pacific Time',
  },
  'Europe': {
    'Europe/London': 'London',
    'Europe/Paris': 'Paris',
    'Europe/Berlin': 'Berlin',
  },
  'Asia': {
    'Asia/Tokyo': 'Tokyo',
    'Asia/Singapore': 'Singapore',
    'Asia/Dubai': 'Dubai',
  },
}

export default function SettingsPage() {
  const { toast } = useToast()
  const { settings, updateSettings } = useSettingsStore()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      timezone: settings.timezone || 'America/New_York',
      timeFormat: settings.timeFormat || '12',
      weekStartsOn: settings.weekStartsOn || '0',
      theme: settings.theme || 'system',
      notifications: settings.notifications ?? true,
      autoSave: settings.autoSave ?? true,
      mediaQuality: settings.mediaQuality || 'high',
    },
  })

  async function onSubmit(data: SettingsFormValues) {
    setIsSubmitting(true)
    try {
      await updateSettings(data)
      toast({
        title: 'Settings updated',
        description: 'Your settings have been saved successfully.',
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update settings. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground">
          Manage your application preferences and configuration.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Time Settings</CardTitle>
              <CardDescription>
                Configure how dates and times are displayed in the application.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="timezone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Timezone</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select timezone" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(timezoneList).map(([region, zones]) => (
                          <SelectGroup key={region}>
                            <SelectLabel>{region}</SelectLabel>
                            {Object.entries(zones).map(([code, name]) => (
                              <SelectItem key={code} value={code}>
                                {name}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="timeFormat"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Time Format</FormLabel>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex space-x-4"
                    >
                      <FormItem className="flex items-center space-x-2">
                        <FormControl>
                          <RadioGroupItem value="12" />
                        </FormControl>
                        <FormLabel className="font-normal">
                          12 hour
                        </FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-2">
                        <FormControl>
                          <RadioGroupItem value="24" />
                        </FormControl>
                        <FormLabel className="font-normal">
                          24 hour
                        </FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="weekStartsOn"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Day of Week</FormLabel>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex space-x-4"
                    >
                      <FormItem className="flex items-center space-x-2">
                        <FormControl>
                          <RadioGroupItem value="0" />
                        </FormControl>
                        <FormLabel className="font-normal">
                          Sunday
                        </FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-2">
                        <FormControl>
                          <RadioGroupItem value="1" />
                        </FormControl>
                        <FormLabel className="font-normal">
                          Monday
                        </FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Appearance</CardTitle>
              <CardDescription>
                Customize how the application looks and feels.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="theme"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Theme</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select theme" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="light">Light</SelectItem>
                        <SelectItem value="dark">Dark</SelectItem>
                        <SelectItem value="system">System</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Media Settings</CardTitle>
              <CardDescription>
                Configure how media files are handled.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="mediaQuality"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Upload Quality</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select quality" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="original">Original</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="low">Low</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Higher quality means larger file sizes.
                    </FormDescription>
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Preferences</CardTitle>
              <CardDescription>
                Configure your application preferences.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="notifications"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between">
                    <div>
                      <FormLabel>Notifications</FormLabel>
                      <FormDescription>
                        Receive notifications about your posts and media.
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="autoSave"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between">
                    <div>
                      <FormLabel>Auto-save</FormLabel>
                      <FormDescription>
                        Automatically save drafts while editing.
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save settings'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
