'use client'
import { SessionProvider } from "next-auth/react"
import React from "react"
import { SearchQueryProvider } from "./search/SearchQueryProvider"
import { SnackbarProvider } from "./SnackBarProvider"

export function Providers({ children }: { children: React.ReactNode }) {
  return <SessionProvider>
    <SearchQueryProvider>
      <SnackbarProvider>
        {children}
      </SnackbarProvider>
    </SearchQueryProvider>
  </SessionProvider>

}