// src/components/LogoutButton.tsx (or similar)
'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation'; // Use next/navigation in App Router
import Link from 'next/link';
import { Button } from "@codegouvfr/react-dsfr/Button";

export default function LogoutButton() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const handleLogout = async () => {
    if (status !== 'authenticated' || !session) {
      // Not logged in, maybe just redirect to home or do nothing
      router.push('/');
      return;
    }

    const garEndSessionEndpoint = process.env.NEXT_PUBLIC_GAR_END_SESSION_ENDPOINT;
    const postLogoutRedirectUri = `${process.env.NEXT_PUBLIC_WEBAPP_URL}`; 

    if (session.provider === 'gar' && garEndSessionEndpoint && session.idToken) {
      try {
        // Construct the GAR logout URL
        const url = new URL(garEndSessionEndpoint);
        url.searchParams.set('id_token_hint', session.idToken as string);
        url.searchParams.set('post_logout_redirect_uri', postLogoutRedirectUri);
        // Add any other parameters GAR might require

        // 1. Sign out locally without redirecting
        await signOut({ redirect: false });

        // 2. Redirect to GAR's end session endpoint
        // Use window.location.href for full page redirect outside Next.js router
        window.location.href = url.toString();

      } catch (error) {
        console.error("GAR logout failed:", error);
        // Fallback: Just sign out locally if redirect construction fails
        await signOut({ callbackUrl: '/' }); // Redirect home after local logout
      }
    } else {
      // Handle logout for other providers (e.g., credentials) or if GAR info is missing
      // Standard local logout, redirecting to homepage after
      await signOut({ callbackUrl: '/' });
    }
  };

  if (status === 'loading') {
    return <Button disabled>...</Button>;
  }

  if (status === 'authenticated') {
    return <Button onClick={handleLogout}>Se déconnecter</Button>;
  }

  // Optional: Render nothing or a sign-in button if unauthenticated
  return null;
}