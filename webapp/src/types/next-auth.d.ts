import { UserRoles } from "@prisma/client"
import NextAuth from "next-auth"

export interface ConnectedUser {
  id: string
  firstName?: string | null
  lastName?: string | null
  email: string,
  roles?: UserRoles[],
}

declare module "next-auth" {
  interface Session extends DefaultSession {
    accessToken?: string;
    idToken?: string;
    user: {
      id: string;
      firstName?: string | null;
      lastName?: string | null;
      roles?: UserRoles[];

      uai?: string | null; // GAR specific
      typProfil?: string | null; // GAR specific

    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    accessToken?: string;
    idToken?: string;
    id?: string;
    firstName?: string;
    lastName?: string;
    roles?: UserRoles[];
  }
}