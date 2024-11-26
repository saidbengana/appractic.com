'use client'

import { useAuth } from "@clerk/nextjs"
import { createContext, useContext, useEffect } from "react"
import { usePostsStore } from "@/store/use-posts-store"
import { useSettingsStore } from "@/store/use-settings-store"
import { useUIStore } from "@/store/use-ui-store"
import { Loader2 } from "lucide-react"

const AuthContext = createContext<{
  isLoaded: boolean
  userId: string | null
  isSignedIn: boolean
}>({
  isLoaded: false,
  userId: null,
  isSignedIn: false,
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { isLoaded, userId, isSignedIn } = useAuth()
  const resetPosts = usePostsStore((state) => state.reset)
  const resetSettings = useSettingsStore((state) => state.reset)
  const resetUI = useUIStore((state) => state.reset)

  // Reset stores when user signs out
  useEffect(() => {
    if (!isSignedIn) {
      resetPosts()
      resetSettings()
      resetUI()
    }
  }, [isSignedIn, resetPosts, resetSettings, resetUI])

  if (!isLoaded) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <AuthContext.Provider value={{ isLoaded, userId, isSignedIn }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuthContext = () => useContext(AuthContext)
