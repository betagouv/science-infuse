// src/components/LogoutButton.tsx (or similar)
'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from "@codegouvfr/react-dsfr/Button";

export default function LogoutButton() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const handleLogout = async () => {
    if (status !== 'authenticated' || !session) {
      router.push('/');
      return;
    }

    // Check if user is from GAR (multiple ways to detect)
    const isGarUser = 
      session.provider === 'gar-credentials' || 
      session.provider === 'gar' ||
      !!session.user?.uai; // UAI is only set for GAR users
    
    console.log('[LogoutButton] session.provider:', session.provider);
    console.log('[LogoutButton] session.user.uai:', session.user?.uai);
    console.log('[LogoutButton] isGarUser:', isGarUser);

    if (isGarUser) {
      // GAR user: sign out and show the GAR message
      await signOut({ callbackUrl: '/deconnexion?gar=1' });
    } else {
      // Normal user: sign out and go to homepage
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