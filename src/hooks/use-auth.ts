import { useSession } from 'next-auth/react'

export interface User {
  id: string
  name: string
  email: string
  image?: string
}

export function useAuth() {
  const { data: session, status } = useSession()

  return {
    user: session?.user as User | undefined,
    isLoading: status === 'loading',
    isAuthenticated: status === 'authenticated'
  }
}
