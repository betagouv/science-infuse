import NextAuth, { AuthOptions } from "next-auth"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import { PrismaClient } from "@prisma/client"
import GoogleProvider from "next-auth/providers/google";

const prisma = new PrismaClient()

export const authOptions: AuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_SECRET_ID as string,
    }),
  ],
  callbacks: {
    async session({ session, user }) {
      const userData = await prisma.user.findUnique({
        where: { id: user.id },
      });

      // @ts-ignore
      session.user = userData;

      return session;
    },
  },
};

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }