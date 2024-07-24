import React from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const queryClient = new QueryClient()

interface SearchQueryProviderProps {
    children: React.ReactNode
}

export const SearchQueryProvider: React.FC<SearchQueryProviderProps> = ({ children }) => {
    return (
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    )
}
