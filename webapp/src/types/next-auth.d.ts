import NextAuth from "next-auth"

export interface ConnectedUser {
  id: string
  firstName?: string | null
  lastName?: string | null
  email: string,
}

declare module "next-auth" {
  interface User extends ConnectedUser { }

  interface Session {
    user: User & ConnectedUser
  }
}

declare module "next-auth/jwt" {
  interface JWT extends ConnectedUser { }
}