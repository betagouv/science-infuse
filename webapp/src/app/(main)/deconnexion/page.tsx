// src/components/LogoutButton.tsx (or similar)
'use client';
import LogoutButton from '@/components/LogoutButton';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';

export default function LoggedOutPage() {
  const { data: session, status } = useSession();
  const [isDisconnected, setIsDisconnected] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      setIsDisconnected(true);
    }
  }, [status]);

  return (
    <div className="min-h-96 flex flex-col items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-6">Déconnexion</h2>
        <div className="flex flex-col items-center gap-4">
          {status === 'authenticated' && <LogoutButton />}
          {isDisconnected && (
            <p className="mt-4">Vous avez été déconnecté avec succès.</p>
          )}
        </div>
      </div>
    </div>
  );
}