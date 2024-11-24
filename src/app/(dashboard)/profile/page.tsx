'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Card } from '@/components/ui/card'
import { Form } from '@/components/ui/form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { useUser } from '@clerk/nextjs'

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
})

const passwordSchema = z.object({
  current_password: z.string().min(8, 'Password must be at least 8 characters'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  password_confirmation: z.string().min(8, 'Password must be at least 8 characters'),
}).refine((data) => data.password === data.password_confirmation, {
  message: "Passwords don't match",
  path: ["password_confirmation"],
})

type ProfileFormValues = z.infer<typeof profileSchema>
type PasswordFormValues = z.infer<typeof passwordSchema>

export default function ProfilePage() {
  const { user } = useUser()

  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.fullName || '',
      email: user?.primaryEmailAddress?.emailAddress || '',
    },
  })

  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      current_password: '',
      password: '',
      password_confirmation: '',
    },
  })

  const onProfileSubmit = async (data: ProfileFormValues) => {
    try {
      // Update profile using Clerk
      await user?.update({
        firstName: data.name.split(' ')[0],
        lastName: data.name.split(' ').slice(1).join(' '),
      })
      // Show success message
    } catch (error) {
      // Show error message
    }
  }

  const onPasswordSubmit = async (data: PasswordFormValues) => {
    try {
      // Update password using Clerk
      await user?.updatePassword({
        currentPassword: data.current_password,
        newPassword: data.password,
      })
      // Show success message
      passwordForm.reset()
    } catch (error) {
      // Show error message
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Profile Settings</h1>
        <p className="text-muted-foreground mt-2">
          Manage your account settings and change your password
        </p>
      </div>

      <Card className="p-6">
        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-medium">Profile Information</h2>
            <p className="text-sm text-muted-foreground">
              Update your account's profile information and email address.
            </p>
          </div>

          <Form {...profileForm}>
            <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4">
              <div>
                <Input
                  {...profileForm.register('name')}
                  placeholder="Name"
                />
                {profileForm.formState.errors.name && (
                  <Alert variant="destructive" className="mt-2">
                    <AlertDescription>
                      {profileForm.formState.errors.name.message}
                    </AlertDescription>
                  </Alert>
                )}
              </div>

              <div>
                <Input
                  {...profileForm.register('email')}
                  type="email"
                  placeholder="Email"
                />
                {profileForm.formState.errors.email && (
                  <Alert variant="destructive" className="mt-2">
                    <AlertDescription>
                      {profileForm.formState.errors.email.message}
                    </AlertDescription>
                  </Alert>
                )}
              </div>

              <Button type="submit">Save Changes</Button>
            </form>
          </Form>
        </div>

        <Separator className="my-8" />

        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-medium">Update Password</h2>
            <p className="text-sm text-muted-foreground">
              Ensure your account is using a long, random password to stay secure.
            </p>
          </div>

          <Form {...passwordForm}>
            <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
              <div>
                <Input
                  {...passwordForm.register('current_password')}
                  type="password"
                  placeholder="Current Password"
                />
                {passwordForm.formState.errors.current_password && (
                  <Alert variant="destructive" className="mt-2">
                    <AlertDescription>
                      {passwordForm.formState.errors.current_password.message}
                    </AlertDescription>
                  </Alert>
                )}
              </div>

              <div>
                <Input
                  {...passwordForm.register('password')}
                  type="password"
                  placeholder="New Password"
                />
                {passwordForm.formState.errors.password && (
                  <Alert variant="destructive" className="mt-2">
                    <AlertDescription>
                      {passwordForm.formState.errors.password.message}
                    </AlertDescription>
                  </Alert>
                )}
              </div>

              <div>
                <Input
                  {...passwordForm.register('password_confirmation')}
                  type="password"
                  placeholder="Confirm Password"
                />
                {passwordForm.formState.errors.password_confirmation && (
                  <Alert variant="destructive" className="mt-2">
                    <AlertDescription>
                      {passwordForm.formState.errors.password_confirmation.message}
                    </AlertDescription>
                  </Alert>
                )}
              </div>

              <Button type="submit">Update Password</Button>
            </form>
          </Form>
        </div>
      </Card>
    </div>
  )
}
