import NextAuth from "next-auth";
import type { AdapterUser } from "@auth/core/adapters";
import type { JWT } from "next-auth/jwt";
import CredentialsProvider from "next-auth/providers/credentials";
import prisma from "@/lib/prisma";
import bcrypt from "bcrypt";
import { PrismaAdapter } from "@auth/prisma-adapter";

// --- Environment Variable Checks (Optional but Recommended) ---
if (!process.env.GAR_CLIENT_ID) throw new Error("Missing GAR_CLIENT_ID");
if (!process.env.GAR_CLIENT_SECRET) throw new Error("Missing GAR_CLIENT_SECRET");
if (!process.env.GAR_ISSUER) throw new Error("Missing GAR_ISSUER");
if (!process.env.GAR_ID_RESSOURCE) throw new Error("Missing GAR_ID_RESSOURCE");

// --- Interfaces ---

interface GarUserInfo {
  id: string;
  sub: string;
  IDO: string;
  UAI: string;
  auth_time: number;
  client_id: string;
  // IMPORTANT : Vous devez ajouter le sessionIndex ici
  sessionIndex?: string;
}

export const { auth, handlers, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  trustHost: true,
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (
          !credentials ||
          typeof credentials.email !== "string" ||
          typeof credentials.password !== "string"
        ) {
          return null;
        }
        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });
        if (!user) {
          return null;
        }
        if (!user.password) {
          return null;
        }
        const isPasswordValid = await bcrypt.compare(
          String(credentials.password),
          String(user.password)
        );
        if (!isPasswordValid) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          roles: user.roles,
          name: [user.firstName, user.lastName].filter(Boolean).join(" "),
        };
      }
    }),
    CredentialsProvider({
      id: "gar-credentials",
      name: "GAR SSO",
      credentials: {
        userProfile: { type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.userProfile) {
          console.error("[GAR-CREDENTIALS] Missing userProfile.");
          return null;
        }

        const profile: GarUserInfo = JSON.parse(credentials.userProfile as string);
        const garUserId = profile.IDO;
        const garSchoolId = profile.UAI;
        // IMPORTANT: Récupérer le sessionIndex
        let sessionIndex = profile.sessionIndex;


        if (!garUserId) {
          console.error("[GAR-CREDENTIALS] GAR profile is missing 'IDO'.");
          return null;
        }
        if (!sessionIndex) {
            console.warn("[GAR-CREDENTIALS] GAR profile is missing 'sessionIndex'. This may affect Single Logout functionality.");
            // Generate a fallback sessionIndex if not provided
            sessionIndex = `${garUserId}_${Date.now()}`;
        }

        let user = await prisma.user.findUnique({
          where: {
            id: garUserId,
            source: 'gar',
          },
        });

        if (user) {
            // L'utilisateur existe, on retourne ses données avec le sessionIndex
            return { ...user, sessionIndex };
        }

        const newUser = await prisma.user.create({
          data: {
            id: garUserId,
            garSchoolId: garSchoolId,
            source: 'gar',
          }
        });

        // On retourne le nouvel utilisateur avec le sessionIndex
        return { ...newUser, sessionIndex };
      }
    }),
  ],

  session: {
    strategy: "jwt",
  },

  pages: {
    signIn: "/connexion",
    signOut: "/deconnexion",
  },

  callbacks: {
    async jwt({ token, account, user }) {
      // 1. VÉRIFIER SI LA SESSION A ÉTÉ RÉVOQUÉE
      if (token.provider === "gar-credentials" && token.sessionIndex) {
          const isRevoked = await prisma.revokedSamlSession.findUnique({
              where: { sessionIndex: token.sessionIndex as string },
          });
          if (isRevoked) {
              console.log(`[JWT Callback] Session révoquée détectée pour l'index ${token.sessionIndex}. Déconnexion.`);
              // Return null to invalidate the session
              return null;
          }
      }

      const isInitialSignIn = !!(account && user);

      if (isInitialSignIn) {
        token.id = user.id;
        token.provider = account.provider;

        if (account?.provider === "gar-credentials") {
          // 2. STOCKER LE SESSIONINDEX DANS LE JWT
          token.sessionIndex = (user as any).sessionIndex;
          token.uai = (user as any).garSchoolId;
          console.log(`[JWT Callback] GAR user authenticated with sessionIndex: ${token.sessionIndex}`);
        } else if (account?.provider === "credentials") {
          token.firstName = (user as any).firstName;
          token.lastName = (user as any).lastName;
          token.email = user.email;
          token.roles = (user as any).roles;
          token.name = user.name;
        }
      }
      return token;
    },

    async session({ session, token }: { session: any; token: JWT | null }) {
      // If token is null (revoked session), return null to invalidate the session
      if (!token || !token.id) {
          return null;
      }
      
      session.user.id = token.id || "";
      session.user.name = token.name;
      session.user.email = token.email;
      session.provider = (token.provider || "") as string;

      if (token.uai) session.user.uai = token.uai as string;
      if (token.typProfil) session.user.typProfil = token.typProfil as string;
      if (token.roles) session.user.roles = token.roles as string[];

      // IMPORTANT: ne pas exposer le sessionIndex au client
      return session;
    },
  },

  events: {
      signOut: async (event) => {
          // Handle both token and session events
          if ('token' in event && event.token) {
              const token = event.token;
              if (token.provider === "gar-credentials" && token.sessionIndex) {
                  console.log(`[SignOut Event] Cleaning up sessionIndex: ${token.sessionIndex}`);
                  // Optionnel mais propre : si l'utilisateur se déconnecte de notre app,
                  // on peut nettoyer notre table de révocation.
                  await prisma.revokedSamlSession.delete({
                      where: { sessionIndex: token.sessionIndex as string },
                  }).catch(() => {
                      // Ignorer l'erreur si l'entrée n'existe pas
                  });
              } else {
                  const provider = token.provider || 'unknown';
                  const hasSessionIndex = !!token.sessionIndex;
                  console.log(`[SignOut Event] No cleanup needed. Provider: ${provider}, has sessionIndex: ${hasSessionIndex}`);
              }
          }
      }
  },

  debug: true
});
