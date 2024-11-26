import { useQuery } from "@tanstack/react-query"
import { useAuthContext } from "@/providers/auth-provider"

interface User {
  id: string
  clerk_id: string
  email: string
  name: string
  created_at: string
  updated_at: string
}

async function getUser(): Promise<User> {
  const res = await fetch("/api/me")
  if (!res.ok) {
    throw new Error("Failed to fetch user")
  }
  return res.json()
}

export function useUser() {
  const { isSignedIn } = useAuthContext()

  return useQuery({
    queryKey: ["user"],
    queryFn: getUser,
    enabled: isSignedIn,
  })
}
