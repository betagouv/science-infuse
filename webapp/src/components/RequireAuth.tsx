import { CircularProgress } from "@mui/material"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import React from "react"

export function requireAuth(Component: React.ComponentType<any>) {
  return function AuthenticatedComponent(props: any) {
    const { data: session, status } = useSession()
    const router = useRouter()

    if (status === "loading") {
      return <div className="w-full h-full flex items-center justify-center py-64">
        <CircularProgress />
      </div>
    }

    if (!session) {
      router.push("/api/auth/signin")
      return null
    }

    return <Component {...props} />
  }
}