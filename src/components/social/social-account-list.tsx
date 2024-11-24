'use client'

import { useEffect } from 'react'
import { useSocialAccounts } from '@/hooks/use-social-accounts'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

const PLATFORM_COLORS = {
  twitter: 'bg-blue-500',
  facebook: 'bg-blue-600',
  instagram: 'bg-pink-600',
  linkedin: 'bg-blue-700',
} as const

export function SocialAccountList() {
  const { accounts, isLoading, fetchAccounts, disconnectAccount } = useSocialAccounts()

  useEffect(() => {
    fetchAccounts()
  }, [fetchAccounts])

  if (isLoading && accounts.length === 0) {
    return (
      <div className="flex items-center justify-center h-[200px]">
        <div className="text-muted-foreground">Loading accounts...</div>
      </div>
    )
  }

  if (!isLoading && accounts.length === 0) {
    return (
      <div className="flex items-center justify-center h-[200px]">
        <div className="text-muted-foreground">No social accounts connected</div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {accounts.map((account) => (
        <Card key={account.id}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              <div className="flex items-center space-x-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={account.avatar || undefined} />
                  <AvatarFallback>
                    {account.platformUsername.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {account.platformUsername}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {account.platform}
                  </p>
                </div>
              </div>
            </CardTitle>
            <div className="flex items-center space-x-2">
              <Badge
                variant="secondary"
                className={
                  account.isConnected
                    ? 'bg-green-500'
                    : 'bg-gray-500'
                }
              >
                {account.isConnected ? 'Connected' : 'Disconnected'}
              </Badge>
              {account.isConnected && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="sm">
                      Disconnect
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>
                        Disconnect {account.platform} Account?
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        This will remove access to post to {account.platformUsername} on {account.platform}.
                        You can reconnect the account later.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => disconnectAccount(account.id)}
                      >
                        Disconnect
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-muted-foreground">
              Connected on {new Date(account.createdAt).toLocaleDateString()}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
