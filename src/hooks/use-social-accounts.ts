import { useCallback, useState } from 'react'
import { SocialAccount, CreateSocialAccountRequest } from '@/types/schema'
import { useToast } from '@/components/ui/use-toast'

export function useSocialAccounts() {
  const [accounts, setAccounts] = useState<SocialAccount[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const fetchAccounts = useCallback(async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/social-accounts')
      const data = await response.json()
      if (data.success) {
        setAccounts(data.data)
      } else {
        throw new Error(data.error)
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to fetch social accounts',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }, [toast])

  const connectAccount = useCallback(async (accountData: CreateSocialAccountRequest) => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/social-accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(accountData)
      })
      const data = await response.json()
      if (data.success) {
        setAccounts(prev => [data.data, ...prev])
        toast({
          title: 'Success',
          description: 'Social account connected successfully'
        })
        return data.data
      } else {
        throw new Error(data.error)
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to connect account',
        variant: 'destructive'
      })
      return null
    } finally {
      setIsLoading(false)
    }
  }, [toast])

  const disconnectAccount = useCallback(async (accountId: string) => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/social-accounts?id=${accountId}`, {
        method: 'DELETE'
      })
      const data = await response.json()
      if (data.success) {
        setAccounts(prev => prev.map(account => 
          account.id === accountId ? { ...account, isConnected: false } : account
        ))
        toast({
          title: 'Success',
          description: 'Social account disconnected successfully'
        })
        return true
      } else {
        throw new Error(data.error)
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to disconnect account',
        variant: 'destructive'
      })
      return false
    } finally {
      setIsLoading(false)
    }
  }, [toast])

  return {
    accounts,
    isLoading,
    fetchAccounts,
    connectAccount,
    disconnectAccount
  }
}
