'use client'
import { SessionProvider, useSession } from "next-auth/react"
import React, { useEffect, useRef } from "react"
import { useRouter, useSearchParams, usePathname } from "next/navigation"
import { SearchQueryProvider } from "./(main)/recherche/SearchQueryProvider"
import { SnackbarProvider } from "./SnackBarProvider"

// Component to handle GAR SLO detection
function GarSloHandler({ children }: { children: React.ReactNode }) {
  const { status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const wasAuthenticated = useRef(false);

  useEffect(() => {
    // Check if this is a GAR login callback and mark user as GAR user
    if (searchParams.get('gar_login') === '1') {
      localStorage.setItem('isGarUser', 'true');
      // Clean up the URL parameter
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.delete('gar_login');
      window.history.replaceState({}, '', newUrl.toString());
    }
  }, [searchParams]);

  useEffect(() => {
    // Track when user becomes authenticated
    if (status === 'authenticated') {
      wasAuthenticated.current = true;
    }
    
    // Detect when a GAR user's session becomes invalid (SLO)
    if (status === 'unauthenticated' && wasAuthenticated.current) {
      const isGarUser = localStorage.getItem('isGarUser') === 'true';
      
      if (isGarUser && pathname !== '/deconnexion') {
        // Clear the flag and redirect to deconnexion with GAR message
        localStorage.removeItem('isGarUser');
        router.push('/deconnexion?gar=1');
      }
    }
  }, [status, router, pathname]);

  return <>{children}</>;
}

export function Providers({ children }: { children: React.ReactNode }) {
  return <SessionProvider refetchOnWindowFocus={true}>
    <GarSloHandler>
      <SearchQueryProvider>
        <SnackbarProvider>
          {children}
        </SnackbarProvider>
      </SearchQueryProvider>
    </GarSloHandler>
  </SessionProvider>

}