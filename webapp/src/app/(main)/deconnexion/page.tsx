"use client";

import { useEffect } from "react";
import { signOut } from "next-auth/react";

export default function SignOutPage() {
  useEffect(() => {
    // déconnecte l’utilisateur et redirige vers la home
    signOut({ callbackUrl: "/" });
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <p className="text-lg">Déconnexion en cours…</p>
    </div>
  );
}