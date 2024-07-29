'use client'
import { SessionProvider } from "next-auth/react"
import React from "react"
import { SearchQueryProvider } from "./search/SearchQueryProvider"

export function Providers({ children }: { children: React.ReactNode }) {
  return <SessionProvider>
    <SearchQueryProvider>
      {children}
    </SearchQueryProvider>
  </SessionProvider>

}