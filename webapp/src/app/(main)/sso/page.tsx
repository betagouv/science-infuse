// app/components/GarSignInButton.tsx
"use client";

import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

function GarSignInButton() {
  const { data: session } = useSession();
  const router = useRouter();

  // Si déjà connecté via GAR, on peut rediriger
  if (session?.accessToken) {
    router.push("/"); // ou la page de ton choix
    return null;
  }

  const handleSignIn = () => {
    signIn("gar", { callbackUrl: "/" });
  };

  return (
    <button
      onClick={handleSignIn}
      className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
    >
      Se connecter avec le GAR
    </button>
  );
}


export default function SSO() {
    return (
      <main className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-3xl mb-6">Bienvenue sur mon appli</h1>
        <GarSignInButton />
      </main>
    );
  }
  