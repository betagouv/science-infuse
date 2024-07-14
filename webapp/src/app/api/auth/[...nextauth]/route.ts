import NextAuth from "next-auth"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import { PrismaClient } from "@prisma/client"
import GoogleProvider from "next-auth/providers/google";

const prisma = new PrismaClient()

const handler = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
        clientId: process.env.GOOGLE_CLIENT_ID as string,
        clientSecret: process.env.GOOGLE_SECRET_ID as string,
    }),
    // Add other providers here
  ],
  callbacks: {
      async session({ session, user }) {
          // Fetch additional user data (e.g., cart items) using the Prisma client
          // Note: Adjust the query as needed based on your schema and desired data
          const userData = await prisma.user.findUnique({
              where: { id: user.id },
          });

          // Append the additional data to the session object
          // @ts-ignore
          session.user = userData;

          return session;
      },
  },

})

export { handler as GET, handler as POST }