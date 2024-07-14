import { useSession, signIn, signOut } from "next-auth/react"
import React from "react"

export default function AuthButton() {
  const { data: session } = useSession()

  if (session?.user) {
    return (
      <div>
        Signed in as {session.user.email} <br />
        <button onClick={() => signOut()}>Sign out</button>
      </div>
    )
  }
  return (
    <div>
      Not signed in <br />
      <button onClick={() => signIn()}>Sign in</button>
    </div>
  )
}