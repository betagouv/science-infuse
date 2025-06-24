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
  sub?: string;
  id?: string;
  garpersonidentifiant?: string;
  id_id?: string;
  NOM?: string;
  PRE?: string;
  CIV?: string;
  UAI?: string;
  P_MEL?: string;
  typProfil?: string;
  IDO?: string;
  DIV?: string[];
  GRO?: string[];
  P_MAT?: string;
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
          firstName: user.firstName, // Ensure these match your Prisma User model
          lastName: user.lastName,
          roles: user.roles, // Assuming 'roles' is an array field in your model
          name: [user.firstName, user.lastName].filter(Boolean).join(" "), // Add name if not in model
          image: user.image, // Add image if you have it
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
        const garUserId = profile.sub;

        if (!garUserId) {
          console.error("[GAR-CREDENTIALS] GAR profile is missing 'sub' (unique ID).");
          return null;
        }
        
        console.log(`[GAR-CREDENTIALS] Authorizing GAR user: ${garUserId}`);

        // Step 1: Check if an account for this provider/providerAccountId already exists
        const existingAccount = await prisma.account.findUnique({
          where: {
            provider_providerAccountId: {
              provider: 'gar',
              providerAccountId: garUserId,
            }
          },
          include: { user: true }
        });

        if (existingAccount) {
          console.log("[GAR-CREDENTIALS] Found existing linked account. Logging in.");
          return existingAccount.user; // User is already linked, sign them in
        }

        // Step 2: If no account, check if a user with this email exists (to link accounts)
        // This is important for users who signed up with email/password first
        const userEmail = profile.P_MEL;
        if (userEmail) {
            const existingUserByEmail = await prisma.user.findUnique({
                where: { email: userEmail }
            });

            if (existingUserByEmail) {
                console.log(`[GAR-CREDENTIALS] Found existing user by email ${userEmail}. Linking GAR account.`);
                // Link the GAR account to the existing user record
                await prisma.account.create({
                    data: {
                        userId: existingUserByEmail.id,
                        type: 'oauth',
                        provider: 'gar',
                        providerAccountId: garUserId,
                    }
                });
                return existingUserByEmail;
            }
        }
        
        // Step 3: If no user found by any means, create a new user and account
        console.log("[GAR-CREDENTIALS] No existing user found. Creating new user and account.");
        
        const newUser = await prisma.user.create({
          data: {
            // Note: Your user model needs to handle the possibility of a null email
            // if GAR doesn't always provide it. Make the email field optional in schema.prisma.
            email: userEmail || null,
            firstName: profile.PRE || garUserId, 
            lastName: profile.NOM,
          }
        });
        
        // Link the new GAR account to the new user
        await prisma.account.create({
          data: {
            userId: newUser.id,
            type: 'oauth',
            provider: 'gar',
            providerAccountId: garUserId,
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
