'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Card } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Form } from '@/components/ui/form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Icons } from '@/components/icons'

const serviceSchema = z.object({
  facebook: z.object({
    app_id: z.string().min(1, 'App ID is required'),
    app_secret: z.string().min(1, 'App Secret is required'),
    client_token: z.string().min(1, 'Client Token is required'),
  }),
  twitter: z.object({
    api_key: z.string().min(1, 'API Key is required'),
    api_key_secret: z.string().min(1, 'API Key Secret is required'),
    client_id: z.string().min(1, 'Client ID is required'),
    client_secret: z.string().min(1, 'Client Secret is required'),
  }),
  unsplash: z.object({
    access_key: z.string().min(1, 'Access Key is required'),
    secret_key: z.string().min(1, 'Secret Key is required'),
  }),
  tenor: z.object({
    api_key: z.string().min(1, 'API Key is required'),
  }),
})

type ServiceFormValues = z.infer<typeof serviceSchema>

export default function ServicesPage() {
  const [activeTab, setActiveTab] = useState('facebook')

  const form = useForm<ServiceFormValues>({
    resolver: zodResolver(serviceSchema),
    defaultValues: {
      facebook: {
        app_id: '',
        app_secret: '',
        client_token: '',
      },
      twitter: {
        api_key: '',
        api_key_secret: '',
        client_id: '',
        client_secret: '',
      },
      unsplash: {
        access_key: '',
        secret_key: '',
      },
      tenor: {
        api_key: '',
      },
    },
  })

  const onSubmit = async (data: ServiceFormValues) => {
    try {
      const response = await fetch('/api/services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!response.ok) throw new Error('Failed to save services')
      // Show success message
    } catch (error) {
      // Show error message
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Third Party Services</h1>
        <p className="text-muted-foreground mt-2">
          Configure your third-party service credentials for social media integration.
        </p>
      </div>

      <Card>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full justify-start border-b p-0">
            <TabsTrigger value="facebook" className="flex items-center gap-2">
              <Icons.facebook className="h-4 w-4" />
              Facebook
            </TabsTrigger>
            <TabsTrigger value="twitter" className="flex items-center gap-2">
              <Icons.twitter className="h-4 w-4" />
              Twitter
            </TabsTrigger>
            <TabsTrigger value="unsplash" className="flex items-center gap-2">
              <Icons.unsplash className="h-4 w-4" />
              Unsplash
            </TabsTrigger>
            <TabsTrigger value="tenor" className="flex items-center gap-2">
              <Icons.gif className="h-4 w-4" />
              Tenor
            </TabsTrigger>
          </TabsList>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 p-6">
              <TabsContent value="facebook">
                <div className="space-y-4">
                  <div>
                    <Input
                      {...form.register('facebook.app_id')}
                      placeholder="App ID"
                    />
                    {form.formState.errors.facebook?.app_id && (
                      <Alert variant="destructive" className="mt-2">
                        <AlertDescription>
                          {form.formState.errors.facebook.app_id.message}
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                  <div>
                    <Input
                      {...form.register('facebook.app_secret')}
                      type="password"
                      placeholder="App Secret"
                    />
                    {form.formState.errors.facebook?.app_secret && (
                      <Alert variant="destructive" className="mt-2">
                        <AlertDescription>
                          {form.formState.errors.facebook.app_secret.message}
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                  <div>
                    <Input
                      {...form.register('facebook.client_token')}
                      placeholder="Client Token"
                    />
                    {form.formState.errors.facebook?.client_token && (
                      <Alert variant="destructive" className="mt-2">
                        <AlertDescription>
                          {form.formState.errors.facebook.client_token.message}
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="twitter">
                <div className="space-y-4">
                  <div>
                    <Input
                      {...form.register('twitter.api_key')}
                      placeholder="API Key"
                    />
                    {form.formState.errors.twitter?.api_key && (
                      <Alert variant="destructive" className="mt-2">
                        <AlertDescription>
                          {form.formState.errors.twitter.api_key.message}
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                  <div>
                    <Input
                      {...form.register('twitter.api_key_secret')}
                      type="password"
                      placeholder="API Key Secret"
                    />
                    {form.formState.errors.twitter?.api_key_secret && (
                      <Alert variant="destructive" className="mt-2">
                        <AlertDescription>
                          {form.formState.errors.twitter.api_key_secret.message}
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                  <div>
                    <Input
                      {...form.register('twitter.client_id')}
                      placeholder="Client ID"
                    />
                    {form.formState.errors.twitter?.client_id && (
                      <Alert variant="destructive" className="mt-2">
                        <AlertDescription>
                          {form.formState.errors.twitter.client_id.message}
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                  <div>
                    <Input
                      {...form.register('twitter.client_secret')}
                      type="password"
                      placeholder="Client Secret"
                    />
                    {form.formState.errors.twitter?.client_secret && (
                      <Alert variant="destructive" className="mt-2">
                        <AlertDescription>
                          {form.formState.errors.twitter.client_secret.message}
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="unsplash">
                <div className="space-y-4">
                  <div>
                    <Input
                      {...form.register('unsplash.access_key')}
                      placeholder="Access Key"
                    />
                    {form.formState.errors.unsplash?.access_key && (
                      <Alert variant="destructive" className="mt-2">
                        <AlertDescription>
                          {form.formState.errors.unsplash.access_key.message}
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                  <div>
                    <Input
                      {...form.register('unsplash.secret_key')}
                      type="password"
                      placeholder="Secret Key"
                    />
                    {form.formState.errors.unsplash?.secret_key && (
                      <Alert variant="destructive" className="mt-2">
                        <AlertDescription>
                          {form.formState.errors.unsplash.secret_key.message}
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="tenor">
                <div className="space-y-4">
                  <div>
                    <Input
                      {...form.register('tenor.api_key')}
                      placeholder="API Key"
                    />
                    {form.formState.errors.tenor?.api_key && (
                      <Alert variant="destructive" className="mt-2">
                        <AlertDescription>
                          {form.formState.errors.tenor.api_key.message}
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                </div>
              </TabsContent>

              <Button type="submit" className="ml-auto">
                Save Changes
              </Button>
            </form>
          </Form>
        </Tabs>
      </Card>
    </div>
  )
}
