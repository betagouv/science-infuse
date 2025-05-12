// src/app/api/auth/[...nextauth]/authOptions.ts

import { AuthOptions, User as NextAuthUser, Account } from "next-auth";
import { JWT } from "next-auth/jwt";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import CredentialsProvider from "next-auth/providers/credentials";
// No specific OIDC provider import is needed for generic configuration
import prisma from "@/lib/prisma";
import bcrypt from "bcrypt";

// --- Environment Variable Checks (Optional but Recommended) ---
// Simple checks to ensure required variables are set during startup
if (!process.env.GAR_CLIENT_ID) throw new Error("Missing GAR_CLIENT_ID");
if (!process.env.GAR_CLIENT_SECRET) throw new Error("Missing GAR_CLIENT_SECRET");
if (!process.env.GAR_ISSUER) throw new Error("Missing GAR_ISSUER");
if (!process.env.GAR_ID_RESSOURCE) throw new Error("Missing GAR_ID_RESSOURCE");


// --- Interfaces ---

// Define an interface for the expected GAR UserInfo response structure
// Adjust based on the actual claims GAR returns for your resource
interface GarUserInfo {
  sub?: string; // Standard OIDC subject identifier (check if GAR returns this)
  id?: string; // Custom GAR ID (check if returned and unique)
  garpersonidentifiant?: string; // Another potential unique ID from GAR docs
  id_id?: string; // Yet another potential ID from GAR docs
  NOM?: string;
  PRE?: string;
  CIV?: string;
  UAI?: string; // School Identifier
  P_MEL?: string; // Potential Email
  typProfil?: string; // User profile type (e.g., ELE, ENS)
  // Add other claims listed in GAR documentation (claims_supported) that you need
  // Example:
  // DIV?: string | string[]; // Could be single or multiple
  // PRO?: string;
  // E_MS1?: string[]; // etc.
}

export const authOptions: AuthOptions = {
  // Use Prisma adapter for database persistence (optional for OIDC, but you have it)
  adapter: PrismaAdapter(prisma),

  providers: [
    // --- Generic OIDC Provider Configuration for GAR ---
    {
      id: "gar", // Unique ID for this provider instance
      name: "GAR", // Display name on sign-in pages/buttons
      type: "oauth",
      // --- Core OIDC Credentials & Endpoint Discovery ---
      clientId: process.env.GAR_CLIENT_ID,
      clientSecret: process.env.GAR_CLIENT_SECRET,
      issuer: process.env.GAR_ISSUER, // Base URL for discovery (.well-known/openid-configuration)

      // --- Authorization Request Customization (GAR Specific) ---
      authorization: {
        params: {
          // Standard + GAR specific scopes
          scope: "openid profile email scope.gar",
          // Mandatory GAR parameter
          idRessource: process.env.GAR_ID_RESSOURCE,
          // Optional GAR parameters (if static or globally applicable)
          // Note: Injecting dynamic values based on user *before* redirect is complex
          // idEtab: process.env.GAR_UAI, 
          // profil: process.env.GAR_PROFILE, 
        },
      },

      // --- UserInfo Endpoint Request Override (GAR Specific) ---
      userinfo: {
        async request(context) {
          console.log("[GAR-AUTH] Starting UserInfo request");
          const { tokens, client } = context;
          const issuer = client.issuer;
          // Endpoint path based on GAR documentation
          const garUserInfoUrl = `${issuer}/oidcProfile`;

          if (!tokens.access_token) {
            console.log("[GAR-AUTH] Access token missing for UserInfo request");
            throw new Error("Missing access token for GAR UserInfo request");
          }
          if (!process.env.GAR_ID_RESSOURCE) {
            console.log("[GAR-AUTH] GAR_ID_RESSOURCE env variable missing");
            throw new Error("Missing GAR_ID_RESSOURCE env variable for UserInfo");
          }

          // Construct URL with GAR-specific query parameters
          const urlWithParams = new URL(garUserInfoUrl);
          urlWithParams.searchParams.set("idRessource", process.env.GAR_ID_RESSOURCE);
          urlWithParams.searchParams.set("access_mode", "web"); // For web resources

          console.log(`[GAR-AUTH] Fetching GAR UserInfo from: ${urlWithParams.toString()}`);

          try {
            console.log("[GAR-AUTH] Making UserInfo request");
            const response = await fetch(urlWithParams.toString(), {
              headers: {
                Authorization: `Bearer ${tokens.access_token}`,
                Accept: "application/json",
              },
              method: "GET",
            });

            const responseBody = await response.text(); // Get body for logging/errors
            console.log("[GAR-AUTH] UserInfo raw response:", responseBody);

            if (!response.ok) {
              console.error("[GAR-AUTH] UserInfo Request Failed:", response.status, responseBody);
              // Handle specific GAR errors based on Tableau 10
              if (response.status === 401) throw new Error(`GAR UserInfo Error 401: Unauthorized. ${responseBody}`);
              if (response.status === 403) throw new Error(`GAR UserInfo Error 403: Forbidden. ${responseBody}`);
              throw new Error(`GAR UserInfo request failed with status ${response.status}: ${responseBody}`);
            }

            const profileData: GarUserInfo = JSON.parse(responseBody); // Parse after checking ok status
            console.log("[GAR-AUTH] UserInfo Response Parsed:", profileData);
            return profileData;

          } catch (error) {
            console.error("[GAR-AUTH] Error fetching/parsing GAR UserInfo:", error);
            throw error; // Re-throw error to be handled by next-auth
          }
        },
      },

      // --- Profile Mapping (GAR Specific) ---
      // Maps the GAR UserInfo response to the NextAuth User object
      profile(profile: GarUserInfo, tokens) {
        console.log("[GAR-AUTH] Starting profile mapping with input:", profile);

        // *** CRITICAL: Select the correct unique & stable ID from GAR ***
        // Prioritize standard 'sub' if available, otherwise choose from GAR's custom IDs.
        const userId = profile.sub || profile.id || profile.garpersonidentifiant || profile.id_id;
        if (!userId) {
          console.error("[GAR-AUTH] FATAL: Could not determine a unique user ID from GAR profile:", profile);
          throw new Error("Unique user identifier missing from GAR profile.");
        }

        console.log("[GAR-AUTH] Selected user ID:", userId);

        const userProfile = {
          id: userId,
          // Construct name - adjust if PRE/NOM are not always present
          name: [profile.PRE, profile.NOM].filter(Boolean).join(" ") || userId, // Fallback to id
          // Use GAR's email claim if available, otherwise null
          email: profile.P_MEL || null,
          image: null, // GAR doesn't seem to provide profile picture URLs

          // --- Store additional GAR claims directly on the user object for JWT callback ---
          firstName: profile.PRE,
          lastName: profile.NOM,
          uai: profile.UAI,
          typProfil: profile.typProfil,
          // Add any other GAR claims you want to persist initially
        };
        console.log("[GAR-AUTH] Final mapped user profile:", userProfile);
        return userProfile;
      },

      // --- Security Checks ---
      checks: ['pkce', 'state'], // Enable PKCE (recommended, required by many OIDC providers) and state
    },
    // --- Your Existing Credentials Provider ---
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        console.log("Attempting Credentials authorize for:", credentials?.email);
        if (!credentials?.email || !credentials?.password) {
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
          return null; // Or handle account linking scenarios differently
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
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
    async jwt({ token, account, user, profile }) {
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
    async session({ session, token }) {
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
  debug: process.env.NODE_ENV === 'development',
};