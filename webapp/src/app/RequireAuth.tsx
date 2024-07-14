import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import React from "react"

export function requireAuth(Component) {
  return function AuthenticatedComponent(props) {
    const { data: session, status } = useSession()
    const router = useRouter()

    if (status === "loading") {
      return <div>Loading...</div>
    }

    if (!session) {
      router.push("/api/auth/signin")
      return null
    }

    return <Component {...props} />
  }
}