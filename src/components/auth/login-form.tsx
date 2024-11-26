'use client'

import { useState } from "react"
import { useSignIn } from "@clerk/nextjs"
import { Button } from "@/components/ui/button"
import { Icons } from "@/components/icons"

export function LoginForm() {
  const [isLoading, setIsLoading] = useState(false)
  const { signIn, isLoaded } = useSignIn()

  const loginWithGithub = async () => {
    if (!isLoaded || !signIn) return
    setIsLoading(true)
    try {
      await signIn.authenticateWithRedirect({
        strategy: "oauth_github",
        redirectUrl: "/dashboard",
        redirectUrlComplete: "/dashboard"
      })
    } catch (error) {
      setIsLoading(false)
      console.error("Error signing in:", error)
    }
  }

  return (
    <div className="grid gap-6">
      <Button
        variant="outline"
        type="button"
        disabled={isLoading}
        onClick={loginWithGithub}
      >
        {isLoading ? (
          <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Icons.github className="mr-2 h-4 w-4" />
        )}
        Continue with GitHub
      </Button>
    </div>
  )
}
