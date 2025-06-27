import NextAuth from "next-auth";
import type { AdapterUser } from "@auth/core/adapters";
import type { JWT } from "next-auth/jwt";
import CredentialsProvider from "next-auth/providers/credentials";
import prisma from "@/lib/prisma";
import bcrypt from "bcrypt";
import { PrismaAdapter } from "@auth/prisma-adapter";
// import type { OAuthTokenEndpoint } from "@auth/core/providers/oauth";

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
        console.log("Attempting Credentials authorize for:", credentials?.email);
        if (
          !credentials ||
          typeof credentials.email !== "string" ||
          typeof credentials.password !== "string"
        ) {
          console.log("Credentials missing email or password");
          return null;
        }
        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });
        if (!user) {
          console.log("Credentials user not found:", credentials.email);
          return null;
        }
        if (!user.password) {
          console.log("Credentials user found but has no password set:", credentials.email);
          return null;
        }
        const isPasswordValid = await bcrypt.compare(
          String(credentials.password),
          String(user.password)
        );
        if (!isPasswordValid) {
          console.log("Credentials invalid password for:", credentials.email);
          return null;
        }

        console.log("Credentials authorization successful for:", credentials.email);
        // Return the necessary user object structure
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
      id: "gar-credentials", // A unique ID for this provider
      name: "GAR SSO",
      credentials: {
        userProfile: { type: "text" }, // We'll pass the JSON profile here
      },
      async authorize(credentials) {
        if (!credentials?.userProfile) {
          console.error("[GAR-CREDENTIALS] Missing userProfile.");
          return null;
        }

        const profile: GarUserInfo = JSON.parse(credentials.userProfile as string);
        console.log("[GAR-CREDENTIALS] Authorizing GAR user with profile:", profile);
        const garUserId = profile.IDO;
        const garSchoolId = profile.UAI;

        if (!garUserId) {
          console.error("[GAR-CREDENTIALS] GAR profile is missing 'IDO' (unique ID).");
          return null;
        }

        console.log(`[GAR-CREDENTIALS] Authorizing GAR user: ${garUserId}`);

        const existingUser = await prisma.user.findUnique({
          where: {
            id: garUserId,
            source: 'gar',
          },
        });


        if (existingUser) {
          console.log("[GAR-CREDENTIALS] Found existing linked account. Logging in.");
          return existingUser; // User is already linked, sign them in
        }

        console.log("[GAR-CREDENTIALS] No existing user found. Creating new user and account.");

        const newUser = await prisma.user.create({
          data: {
            id: garUserId,
            garSchoolId: garSchoolId,
            source: 'gar', // Indicate this user is from GAR
          }
        });

        return newUser;
      }
    }),
  ],

  // --- Session Strategy ---
  session: {
    strategy: "jwt", // Use JWT for session management, avoids database lookups on every request
  },

  // --- Custom Pages ---
  pages: {
    signIn: "/connexion", // Your custom sign-in page
    signOut: "/deconnexion",
    // error: '/auth/error', // Optional: Custom error page
    // verifyRequest: '/auth/verify-request', // Optional: For email provider
  },

  // --- Callbacks ---
  // Control what happens during JWT creation/update and session checks
  callbacks: {
    // Called when a JWT is created (on sign-in) or updated (on session access)
    async jwt({ token, account, user }) {
      console.log("JWT Callback triggered", { provider: account?.provider });

      const isInitialSignIn = !!(account && user);

      if (isInitialSignIn) {
        token.id = user.id; // Persist the user ID from provider profile or authorize
        token.provider = account.provider;
        if (account?.provider === "gar") {
          console.log("JWT Callback: Handling GAR initial sign-in");
          // Store OIDC tokens if needed (be mindful of size/security)
          token.accessToken = account.access_token;
          token.idToken = account.id_token;
          // Store relevant info from the GAR user object (mapped in profile callback)
          // Ensure these keys match what you return from the 'profile' callback & define in JWT declaration
          token.firstName = (user as any).firstName;
          token.lastName = (user as any).lastName;
          token.email = user.email; // Use email mapped in profile
          token.name = user.name;   // Use name mapped in profile
          token.uai = (user as any).uai;
          token.typProfil = (user as any).typProfil;
          // If roles were determined from GAR profile, add them here:
          // token.roles = mapGarRolesToAppRoles(profile.GAR_ROLES_CLAIM);
          console.log("JWT Callback: GAR token populated:", { id: token.id, name: token.name, uai: token.uai });


        } else if (account?.provider === "credentials") {
          console.log("JWT Callback: Handling Credentials initial sign-in");
          // Store info from Credentials user object (returned by authorize)
          // Ensure these keys match what authorize returns & define in JWT declaration
          token.firstName = (user as any).firstName;
          token.lastName = (user as any).lastName;
          token.email = user.email;
          token.roles = (user as any).roles; // Roles from your DB user model
          token.name = user.name;
          console.log("JWT Callback: Credentials token populated:", { id: token.id, name: token.name, roles: token.roles });
        }
      }
      // Subsequent requests: The token already exists, just return it.
      // Add refresh token rotation logic here if needed for OAuth providers.
      return token;
    },

    // Called when a session is checked (e.g., using useSession, getSession)
    async session({ session, token }: { session: any; token: JWT }) {
      console.log("Session Callback triggered");
      // Add common properties from token to session.user
      // Ensure the types match the declare module Session above
      session.user.id = token.id || "";
      session.user.name = token.name;
      session.user.email = token.email;

      session.provider = (token.provider || "") as string;
      // session.user.image = token.picture; // If image is included in token

      // Add provider-specific properties / custom claims from JWT
      if (token.accessToken) session.accessToken = token.accessToken as string;
      if (token.idToken) session.idToken = token.idToken as string;
      if (token.uai) session.user.uai = token.uai as string;
      if (token.typProfil) session.user.typProfil = token.typProfil as string;
      if (token.roles) session.user.roles = token.roles as string[];

      console.log("Session Callback: Returning session:", { userId: session.user.id, uai: session.user.uai, roles: session.user.roles });
      return session;
    },
  },

  // --- Optional: Debugging ---
  // Enable detailed logs in development environment
  debug: true//process.env.NODE_ENV === 'development',
});
